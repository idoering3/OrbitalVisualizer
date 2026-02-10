<script lang="ts">
  import * as THREE from 'three';
  import { onMount } from 'svelte';
  import { ThreeScene } from '$lib/components/threejs/threeScene';
  import { Body } from '$lib/components/threejs/body';
    import { threeScene } from '$lib/components/stores.svelte';

  onMount(() => {
    
    
    const canvas = document.getElementById("scene") as HTMLCanvasElement;
    
    threeScene.threeScene = new ThreeScene(canvas);
    let scene = threeScene.threeScene.scene;
    
    window.addEventListener('resize', () => {
      // Update camera aspect
      threeScene.threeScene!.camera.aspect = window.innerWidth / window.innerHeight;
      threeScene.threeScene!.camera.updateProjectionMatrix(); // important!

      // Update renderer size
      threeScene.threeScene!.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    const earth = new Body(new THREE.Vector3(0, 0, 0), 6.371);
    earth.getBodyObjects().forEach(obj => scene.add(obj));
    threeScene.threeScene.registerBody(earth);
    
    const moon = new Body(new THREE.Vector3(38.44, 0, 0), 1.737);
    moon.getBodyObjects().forEach(obj => scene.add(obj));
    threeScene.threeScene.registerBody(moon);
    
    threeScene.threeScene.fitCameraToBounds();
  });


</script>

<canvas id="scene" class="h-[calc(100%-3rem)] w-full"></canvas>
