import * as THREE from 'three';
import { createCircle } from './shapes';
import { cssColor } from './threeScene';

export class Body {
    position: THREE.Vector3;
    radius: number;
    color: THREE.Color;
    circleXY: THREE.LineLoop;
    circleXZ: THREE.LineLoop;
    circleYZ: THREE.LineLoop;
    threeObjects: THREE.Object3D[]; // to hold all the Three.js objects related to this body for easy access
    body: THREE.Mesh;

    constructor(position: THREE.Vector3, radius: number, colorVar = cssColor('--foreground')) {
        this.position = position;
        this.radius = radius;
        this.color = colorVar;

        // axis circles
        this.circleXY = createCircle(radius, this.position, new THREE.Euler(0, 0, 0), this.color);
        this.circleXZ = createCircle(radius, this.position, new THREE.Euler(Math.PI / 2, 0, 0), this.color);
        this.circleYZ = createCircle(radius, this.position, new THREE.Euler(0, Math.PI / 2, 0), this.color);

        // this is a 
        const sphereGeo = new THREE.SphereGeometry(radius, 128, 128);
        const sphereMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.0, depthWrite: false });
        this.body = new THREE.Mesh(sphereGeo, sphereMat);
        this.body.position.copy(this.position);

        this.threeObjects = [this.circleXY, this.circleXZ, this.circleYZ, this.body];
    }

    // update color dynamically if using shadcn modewatcher
    updateColor(colorVar: THREE.Color) {
        this.threeObjects.forEach(obj => {
            if (obj instanceof THREE.Line) {
                (obj.material as THREE.LineBasicMaterial).color.set(colorVar);
            } else if (obj instanceof THREE.Mesh) {
                const mat = obj.material as THREE.MeshBasicMaterial;
                mat.color.set(colorVar);
                // Ensure the sphere mesh remains fully transparent even if its color is changed
                mat.transparent = true;
                mat.opacity = 0.0;      
                mat.depthWrite = false;
            }
        });
    }

    getBodyObjects() {
        return this.threeObjects;
    }
}
