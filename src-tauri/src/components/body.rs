use serde::{Serialize, Deserialize};
use nalgebra::Vector3;
use crate::components::frame_store::FrameStore;
use crate::components::frame::{frame_to_root};

// Struct to send data to the Frontend
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct BodyInfo {
    pub id: String,
    pub name: String,
    pub frame_id: String,
    pub mass: f64,
    pub state: BodyState, // Global (ECI) state for rendering
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct BodyState {
    pub position: [f64; 3],
    pub velocity: [f64; 3],
}

// The internal Rust struct (No trait needed)
#[derive(Debug, Clone)]
pub struct Body {
    pub id: String,
    pub name: String,
    pub frame_id: String, // The frame this body is attached to
    pub mass: f64,
    
    // Position/Velocity relative to the frame_id
    // If frame_id is 'eci', this is inertial state.
    // If frame_id is 'ecef', this is fixed position on Earth.
    pub local_position: Vector3<f64>,
    pub local_velocity: Vector3<f64>,
}

impl Body {
    pub fn new(id: &str, name: &str, frame_id: &str, mass: f64, pos: Vector3<f64>, vel: Vector3<f64>) -> Self {
        Self {
            id: id.to_string(),
            name: name.to_string(),
            frame_id: frame_id.to_string(),
            mass,
            local_position: pos,
            local_velocity: vel,
        }
    }

    /// Calculates the Global (Root/ECI) state at time t for rendering.
    /// This resolves the body's local position through the entire frame hierarchy.
    pub fn get_global_state(&self, store: &FrameStore, t: f64) -> Result<BodyState, String> {
        let frame_arc = store.get(&self.frame_id)
            .ok_or_else(|| format!("Frame '{}' not found for body '{}'", self.frame_id, self.name))?;

        // 1. Calculate Global Position
        // We pass the body's local position into your existing recursive helper.
        // It treats this vector as "inside" the frame and transforms it all the way to root.
        let (global_pos, global_rot) = frame_to_root(frame_arc.as_ref(), self.local_position, t);
        let global_vel = global_rot.transform_vector(&self.local_velocity);

        Ok(BodyState {
            position: global_pos.into(),
            velocity: global_vel.into(),
        })
    }
}