import * as THREE from 'three';
import { invoke } from '@tauri-apps/api/core';
import type { ThreeScene } from './threeScene';
import { scaleFrameInfo, type FrameInfo, type PoseSnapshot } from '../physics/physicsFrame.svelte';
import { createAxes } from './shapes';
import { simTime } from '../stores.svelte';
import type { Option } from '../misc/uiOption';

export class Frame {
    private frameInfo: FrameInfo = $state() as FrameInfo;
    private scene: ThreeScene;
    private axes: THREE.Object3D;
    private frameType: FrameType;

    private lastUiUpdate: number = 0;

    constructor(frameInfo: FrameInfo, scene: ThreeScene, frameType: FrameType) {
        this.frameInfo = frameInfo;
        this.scene = scene;
        this.frameType = frameType;

        // build the marker
        this.axes = createAxes(5.0);

        this.applyPose(frameInfo.pose);
        this.scene.scene.add(this.axes);
    }

    // Static factory — creates the frame on the Rust side then constructs the object
    static async createECI(id: string, scene: ThreeScene): Promise<Frame> {
        await invoke('create_eci', { id });
        const info = await invoke<FrameInfo>('get_frame', { id, t: 0.0 });
        return new Frame(info, scene, FrameType.ECI);
    }

    static async createECEF(id: string, parentId: string, t0: number, scene: ThreeScene): Promise<Frame> {
        await invoke('create_ecef', { id, parentId, t0 });
        const info = scaleFrameInfo(await invoke<FrameInfo>('get_frame', { id, t: t0 + simTime.t * 60 * 60 }));
        return new Frame(info, scene, FrameType.ECEF);
    }

    static async createSEZ(id: string, parentId: string, lat: number, lon: number, alt: number, scene: ThreeScene): Promise<Frame> {
        await invoke('create_sez', { id, parentId, lat, lon, alt });
        const info = scaleFrameInfo(await invoke<FrameInfo>('get_frame', { id, t: 0.0 }));
        return new Frame(info, scene, FrameType.SEZ);
    }

    async update(t: number) {
        // Convert t (assuming hours based on your previous code) to seconds
        const tSeconds = t * 60 * 60; 
        const steps = 100; // How smooth you want the line. 100 is a good start.

        // Tauri automatically converts JS camelCase (tStart) to Rust snake_case (t_start)
        const rangeInfos = await invoke<FrameInfo[]>('get_frame_range', { 
            id: this.frameInfo.id, 
            tStart: -tSeconds, 
            tEnd: tSeconds, 
            steps: steps 
        });

        if (rangeInfos.length === 0) return;

        // 5. The last element in the range is the current time (tEnd)
        const currentInfo = scaleFrameInfo(rangeInfos[rangeInfos.length - 1]);
        
        // Update local state and Three.js marker
        this.applyPose(currentInfo.pose);
        const now = performance.now();
        if (now - this.lastUiUpdate > 100) {
            // This is the line that triggers the HTML Table re-render!
            this.frameInfo = currentInfo; 
            this.lastUiUpdate = now;
        }
    }

    private applyPose(pose: PoseSnapshot) {
        const [x, y, z] = pose.position;
        this.axes.position.set(x, y, z);

        const [qx, qy, qz, qw] = pose.rotation;
        this.axes.quaternion.set(qx, qy, qz, qw);
    }

    public toggleAxes() { this.axes.visible = !this.axes.visible; }

    get id() { return this.frameInfo.id; }
    get name() { return this.frameInfo.name; }
    get parentId() { return this.frameInfo.parent_id; }
    get position(): [number, number, number] { return this.frameInfo.pose.position; } 
    get rotation(): [number, number, number, number] { return this.frameInfo.pose.rotation; }
    get frameCType() { return this.frameType; }
    

    dispose() {
        if (this.axes instanceof THREE.Mesh) {
            this.scene.scene.remove(this.axes);
            if (this.axes.geometry) {
                this.axes.geometry.dispose();
            }
        }
    }

    toOption () { return { label: this.name, value: this.id }; }
}

// this enum is used to determine what to show for input fields for frames....
export enum FrameType {
    ECI = 'ECI',
    ECEF = 'ECEF',
    SEZ = 'SEZ',
}

// Converts an enum to an array of options for use in a combobox, for instance
export function enumToOptions<T extends Record<string, string>>(e: T): Option[] {
    return Object.values(e).map(v => ({
        value: v,
        label: v,
    }));
}
