
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use nalgebra::Vector3;
use tauri::State;

use crate::components::frame::{FixedFrame, Frame, RotatingFrame, frame_to_root};

// A state store that lives for the lifetime of the app
pub struct FrameStore {
    frames: Mutex<HashMap<String, Arc<dyn Frame + Send + Sync>>>,
    parents: Mutex<HashMap<String, Option<String>>>,
}

impl FrameStore {
    pub fn new() -> Self {
        Self { 
            frames: Mutex::new(HashMap::new()),
            parents: Mutex::new(HashMap::new())
        }
    }

    pub fn get_parent_id(&self, id: &str) -> Option<String> {
        self.parents.lock().unwrap().get(id).and_then(|p| p.clone())
    }

    pub fn all_ids(&self) -> Vec<String> {
        self.frames.lock().unwrap().keys().cloned().collect()
    }

    pub fn get(&self, id: &str) -> Option<Arc<dyn Frame + Send + Sync>> {
        self.frames.lock().unwrap().get(id).cloned()
    }

    pub fn insert(&self, id: String, parent_id: Option<String>, frame: Arc<dyn Frame + Send + Sync>) {
        self.frames.lock().unwrap().insert(id.clone(), frame);
        self.parents.lock().unwrap().insert(id, parent_id);
    }
}

// frameinfo and posesnapshot are used to serialize frame information to send to the frontend
#[derive(serde::Serialize)]
pub struct FrameInfo {
    id: String,
    name: String,
    parent_id: Option<String>,
    pose: PoseSnapshot,
}

#[derive(serde::Serialize)]
pub struct PoseSnapshot {
    position: [f64; 3],
    rotation: [f64; 4], // quaternion as [x, y, z, w]
}

fn build_frame_info(store: &FrameStore, id: String, t: f64) -> Result<FrameInfo, String> {
    let frame = store.get(&id)
        .ok_or_else(|| format!("Frame '{}' not found", id))?;
    let parent_id = store.get_parent_id(&id);

    let (position, rotation) = frame_to_root(frame.as_ref(), Vector3::zeros(), t);

    Ok(FrameInfo {
        id: id.clone(),
        name: frame.name().to_string(),
        parent_id,
        pose: PoseSnapshot {
            position: position.into(),
            rotation: { let q = rotation; [q.i, q.j, q.k, q.w] },
        },
    })
}

#[tauri::command]
pub fn get_frame(store: State<FrameStore>, id: String, t: f64) -> Result<FrameInfo, String> {
    build_frame_info(&store, id, t)
}

#[tauri::command]
pub fn get_frame_range(
    store: State<'_, FrameStore>, 
    id: String, 
    t_start: f64, 
    t_end: f64, 
    steps: usize
) -> Result<Vec<FrameInfo>, String> {
    if steps == 0 {
        return Ok(Vec::new());
    }

    // Pre-allocate the vector to avoid reallocation overhead during the loop
    let mut results = Vec::with_capacity(steps);
    
    // Calculate the time step (dt)
    let dt = if steps > 1 {
        (t_end - t_start) / (steps as f64 - 1.0)
    } else {
        0.0
    };

    for i in 0..steps {
        let t = t_start + dt * (i as f64);
        
        // Use your existing helper to build the info for this specific time
        match build_frame_info(&store, id.clone(), t) {
            Ok(info) => results.push(info),
            Err(e) => return Err(e),
        }
    }

    Ok(results)
}

#[tauri::command]
pub fn list_frames(store: State<FrameStore>, t: f64) -> Vec<FrameInfo> {
    store.all_ids()
        .into_iter()
        .filter_map(|id| build_frame_info(&store, id, t).ok())
        .collect()
}

#[tauri::command]
pub fn create_eci(store: State<FrameStore>, id: String) {
    store.insert(id, None, Arc::new(FixedFrame::eci()));
}

#[tauri::command]
pub fn create_ecef(store: State<FrameStore>, id: String, parent_id: String, t0: f64) -> Result<(), String> {
    let parent = store.get(&parent_id)
        .ok_or_else(|| format!("Frame '{}' not found", parent_id))?;
    store.insert(id, Some(parent_id), Arc::new(RotatingFrame::ecef(parent, t0)));
    Ok(())
}

#[tauri::command]
pub fn create_sez(store: State<FrameStore>, id: String, parent_id: String,
                  lat: f64, lon: f64, alt: f64) -> Result<(), String> {
    // we need to convert our altitude from Mm to km
    let alt = alt / 1000.0;
    let parent = store.get(&parent_id)
        .ok_or_else(|| format!("Frame '{}' not found", parent_id))?;
    store.insert(id.clone(), Some(parent_id), Arc::new(FixedFrame::sez(&id, parent, lat, lon, alt)));
    Ok(())
}

#[tauri::command]
pub fn frame_to_root_cmd(store: State<FrameStore>, frame_id: String, 
                     v: [f64; 3], t: f64) -> Result<([f64; 3], [f64; 4]), String> {
    let frame = store.get(&frame_id)
        .ok_or_else(|| format!("Frame '{}' not found", frame_id))?;
    let (position, rotation) = frame_to_root(frame.as_ref(), Vector3::from(v), t);
    Ok((position.into(), [rotation.i, rotation.j, rotation.k, rotation.w]))
}