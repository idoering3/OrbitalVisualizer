import type { Body } from "./threejs/body";
import type { ThreeScene } from "./threejs/threeScene";

export let threeScene = $state({
    threeScene: null as null | ThreeScene,
});

export let bodies = $state({
    bodies: [] as Body[],
});

export let simTime = $state({
    t: 0
});