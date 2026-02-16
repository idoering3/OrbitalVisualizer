<script lang="ts">
  import * as THREE from 'three';
  import { onMount } from 'svelte';
  import { ThreeScene } from '$lib/components/threejs/threeScene';
  import { Body } from '$lib/components/threejs/body';
  import { bodies, frames, simTime, threeScene } from '$lib/components/stores.svelte';
  import { PhysicsBody } from '$lib/components/physics/physicsBody';
  import Sidebar from '$lib/components/sidebar/Sidebar.svelte';
  import * as ButtonGroup from "$lib/components/ui/button-group/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import Timeline from '$lib/components/timeline/Timeline.svelte';
  import { invoke } from '@tauri-apps/api/core';
  import { Frame } from '$lib/components/threejs/frame.svelte';
  import TimelineSettings from '$lib/components/timeline/TimelineSettings.svelte';

  let ecef: Frame | undefined = $state();
  let baseStation: Frame | undefined = $state();
  let baseStation1: Frame | undefined = $state();

  onMount(() => { // Removed 'async' here
    const canvas = document.getElementById("scene") as HTMLCanvasElement;
    
    threeScene.threeScene = new ThreeScene(canvas);
    let scene = threeScene.threeScene.scene;

    function handleResize() {
        if (threeScene.threeScene) {  
          threeScene.threeScene.resizeRendererToDisplaySize();
          const canvas = threeScene.threeScene.renderer.domElement;
          threeScene.threeScene.camera.aspect = canvas.clientWidth / canvas.clientHeight;
          threeScene.threeScene.camera.updateProjectionMatrix();
          console.log(canvas.clientWidth, canvas.clientHeight);
        }
    }

    window.addEventListener('resize', handleResize);

    // Create an internal async block for your Frame logic
    const setupFrames = async () => {
      if (threeScene.threeScene) {
        const earth = new Body(new PhysicsBody(5.972e24, [0, 0, 0], [0, 0, 0], 6.371), "Earth");
        earth.getBodyObjects().forEach(obj => scene.add(obj));
        threeScene.threeScene.registerBody(earth);
        
        const satellite = new Body(new PhysicsBody(7.342e22, [5.369, 2.33214, 0.656480], [0, 1.022, 0], 0.5), "Satellite");
        satellite.getBodyObjects().forEach(obj => scene.add(obj));
        threeScene.threeScene.registerBody(satellite);

        bodies.bodies = [earth, satellite];

        const eci = await Frame.createECI('eci', threeScene.threeScene);
        eci.toggleAxes();  
        ecef = await Frame.createECEF('ecef', eci.id, 0, threeScene.threeScene);
        // ecef.toggleAxes();
        baseStation = await Frame.createSEZ('basestation', ecef.id, 0.873, 0.0, 0.0008, threeScene.threeScene);
        // baseStation.toggleAxes();
        frames.frames.push(eci, ecef, baseStation, baseStation1);

        threeScene.threeScene.fitCameraToBounds();
      }
    };

    setupFrames(); // Execute the async logic

    // Now this return is valid and synchronous
    return () => {
        window.removeEventListener('resize', handleResize);
    };
  });

  $effect(() => {
    if (ecef && baseStation&& simTime.t) {
      ecef.update(simTime.t);
      baseStation.update(simTime.t);
    }
  });

</script>

<!-- The three canvas -->
<canvas id="scene" class="h-[calc(100%-3rem)] w-full absolute block"></canvas>
<!-- The other menu -->
<div class="z-10 absolute right-0 m-10 w-1xl">
    <Sidebar />
</div>
<div class="z-10 absolute bottom-0 mb-10 w-full flex items-center justify-center flex-col gap-4">
  <Timeline />
  <TimelineSettings />
</div>