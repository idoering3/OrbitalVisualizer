import * as THREE from 'three';
import { cssColor } from './threeScene';

// Source - https://stackoverflow.com/a/75657438
// Posted by Andrej, modified by community. See post 'Timeline' for change history
// Retrieved 2026-02-10, License - CC BY-SA 4.0
// Heavily modified to use CSS variable for color and to be used in Body class instead of directly in ThreeScene

export function createCircle(radius: number, center: THREE.Vector3 = new THREE.Vector3(0, 0, 0), rotation = new THREE.Euler(0, 0, 0), color: THREE.Color = cssColor('--foreground')): THREE.LineLoop {
    const circleGeometry = new THREE.CircleGeometry(radius, 128);

    // Remove center vertex
    const itemSize = 3;
    circleGeometry.setAttribute( 'position',
        new THREE.BufferAttribute(
                circleGeometry.attributes.position.array.slice( itemSize,
                    circleGeometry.attributes.position.array.length - itemSize
                ), itemSize
            )
    );
    circleGeometry.index = null;

    // Apply it to a material
    const material = new THREE.LineBasicMaterial({ color: color });


    const circle = new THREE.LineLoop(circleGeometry, material);
    circle.position.copy(center);
    circle.rotation.copy(rotation);
    return circle;
}

export function createSphere(radius: number, center: THREE.Vector3, color: THREE.Color = cssColor('--foreground')): THREE.Mesh {
    const material = new THREE.MeshBasicMaterial({ color: color });
    const sphereGeometry = new THREE.SphereGeometry(radius, 64, 64);
    const sphere = new THREE.Mesh(sphereGeometry, material);
    sphere.position.copy(center);

    return sphere;
}

export function createAxes(scale: number, center = new THREE.Vector3(0, 0, 0)): THREE.Object3D {
    const axes = new THREE.Object3D();

    const xAxis = new THREE.ArrowHelper(
        new THREE.Vector3(1, 0, 0),
        center,
        scale,
        0xff0000 // red
    );
    axes.add(xAxis);

    const yAxis = new THREE.ArrowHelper(
        new THREE.Vector3(0, 1, 0),
        center,
        scale,
        0x00ff00 // green
    );
    axes.add(yAxis);

    const zAxis = new THREE.ArrowHelper(
        new THREE.Vector3(0, 0, 1),
        center,
        scale,
        0x0000ff // blue
    );
    axes.add(zAxis);

    return axes;
}