<script lang="ts">
  import * as THREE from 'three';
  import { onMount } from 'svelte';
  import { ThreeScene } from '$lib/components/threejs/threeScene';
  import { Body } from '$lib/components/threejs/body';
  import * as ButtonGroup from "$lib/components/ui/button-group/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { threeScene } from '$lib/components/stores.svelte';
    import { Earth, Orbit } from '@lucide/svelte';

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

<!-- The three canvas -->
<canvas id="scene" class="h-[calc(100%-3rem)] w-full absolute"></canvas>
<!-- The other menu -->
<div class="z-10 absolute right-0">
  <div class="m-10">
    <ButtonGroup.Root>
      <Button size="icon" variant="secondary">
        <Earth />
      </Button>
      <Button size="icon" variant="secondary">
        <Orbit />
      </Button>
    </ButtonGroup.Root>
  </div>
</div>