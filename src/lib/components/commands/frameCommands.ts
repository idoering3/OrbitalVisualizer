import { invoke } from '@tauri-apps/api/core';
import type { FrameInfo } from '../physics/physicsFrame';

export async function createECI() {
    // Create the frame hierarchy
    await invoke('create_eci', { id: 'eci' });
}

export async function createECEF() {
    // REQUIRES ECI FRAME TO EXIST
    await invoke('create_ecef', { 
        id: 'ecef', 
        parentId: 'eci',
        t0: 0.0 
    });
}

export async function createSEZ() {
    // REQUIRES ECEF FRAME TO EXIST
    await invoke('create_sez', {
        id: 'ground_station',
        parentId: 'ecef',
        lat: 0.6981,   // radians
        lon: -1.2566,
        alt: 0.1       // km above surface
    });
}

export async function getFrame() {
    // Get a single frame's info at time t
    const frame = await invoke<FrameInfo>('get_frame', { id: 'ground_station', t: 1000.0 });
    console.log(frame.name, frame.pose.position);
}

export async function getAllFrames() {
    // Get all frames at once
    const allFrames = await invoke<FrameInfo[]>('list_frames', { t: 1000.0 });
}

// Transform a vector to root
const rootVec = await invoke<[number, number, number]>('frame_to_root_cmd', {
    frameId: 'ground_station',
    v: [1.0, 0.0, 0.0],
    t: 1000.0
});