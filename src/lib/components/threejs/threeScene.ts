import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { Body } from './body';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';

export class ThreeScene {
    scene: THREE.Scene;
    canvas: HTMLCanvasElement;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    controls: OrbitControls;
    composer: EffectComposer;
    outlinePass: OutlinePass;

    updatables: { update: (camera: THREE.Camera) => void }[] = [];


    constructor(canvas: HTMLCanvasElement) {
        THREE.Object3D.DEFAULT_UP = new THREE.Vector3(0,0,1);

        this.canvas = canvas;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
        this.camera.position.set(0, 5, 0);
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true, antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true; // for smoother experience
        this.controls.dampingFactor = 0.04;

        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(new RenderPass(this.scene, this.camera));
        this.composer.setPixelRatio(window.devicePixelRatio);
        this.composer.setSize(canvas.clientWidth, canvas.clientHeight);


        this.outlinePass = new OutlinePass(new THREE.Vector2(canvas.clientWidth, canvas.clientHeight), this.scene, this.camera);
        this.outlinePass.edgeStrength = 1.2;
        this.outlinePass.edgeGlow = 0.0;
        this.outlinePass.edgeThickness = 0.1;
        this.outlinePass.visibleEdgeColor.set(cssColor('--foreground'));

        this.composer.addPass(this.outlinePass);

        this.renderer.setAnimationLoop(() => this.animate());
    }

    fitCameraToBounds() {
        const bounds = new THREE.Box3().setFromObject(this.scene);
        const center = bounds.getCenter(new THREE.Vector3());
        const size = bounds.getSize(new THREE.Vector3());
        const radius = size.length() * 0.5;

        const fov = this.camera.fov * (Math.PI / 180);
        const distance = radius / Math.sin(fov / 2);
        const padding = 1.2; // add some padding to ensure the whole scene fits comfortably
        
        this.camera.position.copy(center);
        this.camera.position.y += distance * padding;

        this.camera.near = 0.1;
        this.camera.far  = distance * 100;
        this.camera.updateProjectionMatrix();

        this.camera.lookAt(center);

    }

    animate() {
        this.controls.update();
        this.updatables.forEach(obj => obj.update(this.camera));
        
        this.composer.render();       

        if (this.resizeRendererToDisplaySize()) {
            const canvas = this.renderer.domElement;
            this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
            this.camera.updateProjectionMatrix();
        }
    }

    registerBody(body: Body) {
        if (body.body) {
            this.outlinePass.selectedObjects.push(body.body);
        }
    }

    // inside ThreeScene class
    resizeRendererToDisplaySize() {
        const canvas = this.renderer.domElement;
        const pixelRatio = window.devicePixelRatio;
        const width  = Math.floor(canvas.clientWidth * pixelRatio);
        const height = Math.floor(canvas.clientHeight * pixelRatio);
        
        const needResize = canvas.width !== width || canvas.height !== height;
        
        if (needResize) {
            // 1. Resize the renderer (keep third param 'false' so CSS handles display size)
            this.renderer.setSize(width, height, false);
            
            // 2. Resize the composer and its passes
            this.composer.setSize(width, height);
            
            // 3. Specifically update the resolution of the OutlinePass
            this.outlinePass.resolution.set(width, height);
        }
        return needResize;
    }

    refreshColors() {

        // Outline color
        this.outlinePass.visibleEdgeColor.copy(
            cssColor('--foreground')
        );

        for (const obj of this.scene.children) {
            if (obj instanceof THREE.Line) {
                (obj.material as THREE.LineBasicMaterial).color.copy(
                    cssColor('--foreground')
                );
            } else if (obj instanceof THREE.LineLoop) {
                (obj.material as THREE.LineBasicMaterial).color.copy(
                    cssColor('--foreground')
                );
            } else if (obj instanceof THREE.Mesh) {
                const mat = obj.material as THREE.MeshBasicMaterial;
                mat.color.copy(
                    cssColor('--foreground')
                );
            }
        }
    }

    centerCameraOnBody(body: Body) {
        if (!body.body) return;
        const bounds = new THREE.Box3().setFromObject(body.body);
        const center = bounds.getCenter(new THREE.Vector3());
        this.camera.lookAt(center);

        // todo: lerp to the new position instead of snapping
        this.controls.target.copy(center);
        this.controls.cursor = center;
    }
}


// helper function
export function cssColor(varName: string): THREE.Color {
    // 1. Get the raw value (e.g., "oklch(0.6 0.1 200)")
    const style = getComputedStyle(document.documentElement);
    const value = style.getPropertyValue(varName).trim();

    if (!value) {
        throw new Error(`CSS variable ${varName} is not defined`);
    }

    // 2. Use a canvas to force the browser to convert it to RGBA
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    if (!ctx) {
         // Fallback for extremely rare headless environments
        console.warn('Could not get 2d context, falling back to basic parsing');
        const c = new THREE.Color();
        c.setStyle(value);
        return c;
    }

    ctx.fillStyle = value;
    ctx.fillRect(0, 0, 1, 1);
    
    // 3. Read the pixel data (Uint8ClampedArray: [r, g, b, a])
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;

    // 4. Create the Three.js color
    // We divide by 255 because Three.js uses 0.0 - 1.0 floats
    const color = new THREE.Color(r / 255, g / 255, b / 255);

    // 5. Handle Color Space Management
    // The canvas context is usually sRGB (legacy).
    // If you are using a standard Three.js workflow with color management enabled:
    color.convertSRGBToLinear();

    return color;
}