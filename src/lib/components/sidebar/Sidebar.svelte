<script lang="ts">
    import * as Tabs from "$lib/components/ui/tabs/index.js";
    import { Earth, Move3d, Orbit } from "@lucide/svelte";
    import PlanetBar from "./PlanetBar.svelte";
    import FrameBar from "./FrameBar.svelte";
</script>

<Tabs.Root value="bodies">
    <Tabs.List>
        <Tabs.Trigger value="bodies">
            <Earth />
        </Tabs.Trigger>
        <Tabs.Trigger value="frames">
            <Move3d />
        </Tabs.Trigger>
        <Tabs.Trigger value="orbits">
            <Orbit />
        </Tabs.Trigger>
    </Tabs.List>
    <Tabs.Content value="bodies">
        <PlanetBar />
    </Tabs.Content>
    <Tabs.Content value="frames">
        <FrameBar />
    </Tabs.Content>
</Tabs.Root>