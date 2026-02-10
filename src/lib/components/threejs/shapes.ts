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