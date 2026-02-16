use crate::components::frame_store::{FrameStore, create_eci, create_ecef, create_sez, frame_to_root_cmd, get_frame, list_frames, get_frame_range};

pub mod components;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(FrameStore::new())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler( tauri::generate_handler![
            create_eci,
            create_ecef,
            create_sez,
            get_frame,
            list_frames,
            frame_to_root_cmd,
            get_frame_range,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}