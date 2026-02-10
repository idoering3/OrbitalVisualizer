
export class PhysicsFrame {
    xVector: number;
    yVector: number;
    zVector: number;
    children?: PhysicsFrame[] = [];

    constructor(xVector: number, yVector: number, zVector: number) {
        this.xVector = xVector;
        this.yVector = yVector;
        this.zVector = zVector;
    }
}