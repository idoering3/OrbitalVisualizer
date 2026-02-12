import * as THREE from 'three';
import { invoke } from '@tauri-apps/api/core';
import type { ThreeScene } from './threeScene';
import { scaleFrameInfo, type FrameInfo, type PoseSnapshot } from '../physics/physicsFrame';
import { createAxes } from './shapes';
import { simTime } from '../stores.svelte';

export class Frame {
    private frameInfo: FrameInfo;
    private scene: ThreeScene;
    private axes: THREE.Object3D;

    constructor(frameInfo: FrameInfo, scene: ThreeScene) {
        this.frameInfo = frameInfo;
        this.scene = scene;

        // build the marker
        this.axes = createAxes(5.0);

        this.applyPose(frameInfo.pose);
        this.scene.scene.add(this.axes);
    }

    // Static factory — creates the frame on the Rust side then constructs the object
    static async createECI(id: string, scene: ThreeScene): Promise<Frame> {
        await invoke('create_eci', { id });
        const info = await invoke<FrameInfo>('get_frame', { id, t: 0.0 });
        return new Frame(info, scene);
    }

    static async createECEF(id: string, parentId: string, t0: number, scene: ThreeScene): Promise<Frame> {
        await invoke('create_ecef', { id, parentId, t0 });
        const info = scaleFrameInfo(await invoke<FrameInfo>('get_frame', { id, t: t0 + simTime.t * 60 * 60 }));
        return new Frame(info, scene);
    }

    static async createSEZ(id: string, parentId: string, lat: number, lon: number, alt: number, scene: ThreeScene): Promise<Frame> {
        await invoke('create_sez', { id, parentId, lat, lon, alt });
        const info = scaleFrameInfo(await invoke<FrameInfo>('get_frame', { id, t: 0.0 }));
        return new Frame(info, scene);
    }

    async update(t: number) {
        const info = scaleFrameInfo(await invoke<FrameInfo>('get_frame', { id: this.frameInfo.id, t: t * 60 * 60 }));
        this.frameInfo = info;
        this.applyPose(info.pose);
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

    dispose() {
        if (this.axes instanceof THREE.Mesh) {
            this.scene.scene.remove(this.axes);
            if (this.axes.geometry) {
                this.axes.geometry.dispose();
            }
        }
    }
}