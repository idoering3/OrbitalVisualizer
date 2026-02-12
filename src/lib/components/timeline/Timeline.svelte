<script lang='ts'>
    import * as ButtonGroup from "$lib/components/ui/button-group/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import { Slider } from "$lib/components/ui/slider/index.js";
    import { Pause, Play, StepBack, StepForward } from "@lucide/svelte";
    import { latex } from "../misc/katexAction";
    import { simTime, threeScene } from "../stores.svelte";
    import { degToRad } from "three/src/math/MathUtils.js";
    import { onMount } from "svelte";

    let playing = $state(false);
    let maxTime = $state(24);
    let speed = $state(1);
    let dt = $state(1/60);

    let rafId: number | null = null;
    let lastTime = 0;

    function tick(dt: number) {
        if (simTime.t + dt > maxTime)
            playing = false;
        if (playing)
            simTime.t += dt * speed;
    }
    
    function animate(now: number) {
        if (!playing) return;

        const dtSeconds = (now - lastTime) / 100;
        lastTime = now;

        tick(dtSeconds);

        rafId = requestAnimationFrame(animate);
    }

    function togglePlay() { playing = !playing; }
    function stepForward() { simTime.t += 1; } 
    function stepBack() { simTime.t -= 1; }

    $effect(() => {
    if (playing) {
        lastTime = performance.now();
        rafId = requestAnimationFrame(animate);
    }



    return () => {
        if (rafId !== null) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
    };
});

</script>

<div>
    <ButtonGroup.Root>
        <Button variant="outline" size="icon" onclick={stepBack}>
            <StepBack />
        </Button>
        <Button variant="outline" size="icon" onclick={togglePlay}>
            {#if playing}
                <Pause />
            {:else}
                <Play />
            {/if}
        </Button>
        <Button variant="outline" size="icon" onclick={stepForward}>
            <StepForward />
        </Button>
    </ButtonGroup.Root>
    </div>
    <div class="w-full flex items-center justify-center">
    <Slider type="single" min={-maxTime} max={maxTime} step={0.1} bind:value={simTime.t} class="max-w-[90%]" />
    </div>
    <div>
    <span use:latex={{ data: "t_0" }}></span>
</div>
