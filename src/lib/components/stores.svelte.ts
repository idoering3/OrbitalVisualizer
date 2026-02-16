import type { Body } from "./threejs/body";
import type { Frame } from "./threejs/frame";
import type { ThreeScene } from "./threejs/threeScene";

export let threeScene = $state({
    threeScene: null as null | ThreeScene,
});

export let bodies = $state({
    bodies: [] as Body[],
});

export let frames = $state({
    frames: [] as Frame[],
});

export let simTime = $state({
    t: 0
});