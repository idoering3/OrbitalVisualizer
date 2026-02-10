// backend physics-only
export class PhysicsBody {
    mass: number;
    position: [number, number, number];
    velocity: [number, number, number];
    radius?: number; // optional, only needed for visualization

    constructor(mass: number, pos: [number, number, number], vel: [number, number, number], radius?: number) {
        this.mass = mass;
        this.position = pos;
        this.velocity = vel;
        if (radius)
            this.radius = radius;
    }
}
