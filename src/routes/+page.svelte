<script lang="ts">
  import * as THREE from 'three';
  import { onMount } from 'svelte';
  import { ThreeScene } from '$lib/components/threejs/threeScene';
  import { Body } from '$lib/components/threejs/body';
  import * as ButtonGroup from "$lib/components/ui/button-group/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { bodies, threeScene } from '$lib/components/stores.svelte';
    import { Earth, Orbit } from '@lucide/svelte';
    import PlanetBar from '$lib/components/sidebar/PlanetBar.svelte';
    import { PhysicsBody } from '$lib/components/physics/physicsBody';
    import Sidebar from '$lib/components/sidebar/Sidebar.svelte';

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



    const earth = new Body(new PhysicsBody(5.972e24, [0, 0, 0], [0, 0, 0], 6.371), "Earth");
    earth.getBodyObjects().forEach(obj => scene.add(obj));
    threeScene.threeScene.registerBody(earth);
    
    const moon = new Body(new PhysicsBody(7.342e22, [384.4, 0, 0], [0, 1.022, 0], 1.737), "Moon");
    moon.getBodyObjects().forEach(obj => scene.add(obj));
    threeScene.threeScene.registerBody(moon);

    bodies.bodies = [earth, moon];
    
    threeScene.threeScene.fitCameraToBounds();
  });


</script>

<!-- The three canvas -->
<canvas id="scene" class="h-[calc(100%-3rem)] w-full absolute"></canvas>
<!-- The other menu -->
<div class="z-10 absolute right-0 m-10 w-140">
    <Sidebar />
</div>