export interface PoseSnapshot {
    position: [number, number, number];
    rotation: [number, number, number, number]; // [x, y, z, w]
}

export interface FrameInfo {
    id: string;
    name: string;
    parent_id: string | null;
    pose: PoseSnapshot;
}

export function scaleFrameInfo(info: FrameInfo): FrameInfo {
    const [x, y, z] = info.pose.position;
    return {
        ...info,
        pose: {
            ...info.pose,
            position: [x / 1000, y / 1000, z / 1000],
        }
    };
}