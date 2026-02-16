<script lang='ts'>
    import * as Card from "$lib/components/ui/card/index.js";
    import * as THREE from 'three';
    import { Button } from "../ui/button/index.js";
    import { Earth, Plus } from "@lucide/svelte";
    import * as Empty from "$lib/components/ui/empty/index.js";
    import { bodies, frames, simTime, threeScene } from "../stores.svelte.js";
    import * as Table from "$lib/components/ui/table/index.js";
    import { latex } from "../misc/katexAction.js";
    import * as InputGroup from "$lib/components/ui/input-group/index.js";
    import Combobox from "../ui/combobox/Combobox.svelte";
    import { Input } from "../ui/input/index.js";
    import { enumToOptions, Frame, FrameType } from "../threejs/frame.svelte.js";
    import * as Field from "$lib/components/ui/field/index.js";

    let distanceFormula = "\\mathbf{r}_0";
    let velocityFormula = "\\mathbf{v}_0";

    const frameTypeOptions = enumToOptions(FrameType);
    let selectedFrameType: FrameType = $state(FrameType.ECI);
    let frameName: string = $state("");
    let parentFrameId: string = $state("");
    let lat: number = $state(0.0);
    let lon: number = $state(0.0);
    let alt: number = $state(0.0);

    // frame submission function:

    async function addFrame() {
        if (!threeScene.threeScene) return;

        const scene = threeScene.threeScene;
        const id = frameName.trim();

        if (!id) return;

        let frame: Frame;

        switch (selectedFrameType) {
            case FrameType.ECI:
                frame = await Frame.createECI(id, scene);
                break;

            case FrameType.ECEF:
                if (!parentFrameId) return;
                frame = await Frame.createECEF(
                    id,
                    parentFrameId,
                    simTime.t,
                    scene
                );
                break;

            case FrameType.SEZ:
                if (!parentFrameId) return;
                frame = await Frame.createSEZ(
                    id,
                    parentFrameId,
                    lat,
                    lon,
                    0.0,
                    scene
                );
                break;
        }

        frames.frames.push(frame);
    }


</script>

<Card.Root>
    <Card.Header>
        <Card.Title>Frames</Card.Title>
        <Card.Description>
            View and manage reference frames.
        </Card.Description>
    </Card.Header>
    <Card.Content class="flex flex-col gap-4">
        <!-- List of bodies will go here -->
        {#if bodies.bodies.length > 0}
            <div class="rounded-md border">
                <Table.Root>
                    <Table.Header>
                        <Table.Row>
                            <Table.Head>Name</Table.Head>
                            <Table.Head>r</Table.Head>
                            <Table.Head>q</Table.Head>
                            <Table.Head>
                                Parent
                            </Table.Head>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {#each frames.frames as frame}
                            <Table.Row>
                                <Table.Cell>{frame.name || 'Unnamed Body'}</Table.Cell>
                                <Table.Cell>{`[${frame.position.map((x: number) => x.toFixed(2)).join(', ')}]`}</Table.Cell>
                                <Table.Cell>{`[${frame.rotation.map((x: number) => x.toFixed(2)).join(', ')}]`}</Table.Cell>
                                <Table.Cell> 
                                    {frame.parentId ? frame.parentId : "No Parent ID"}
                                </Table.Cell>
                                <!-- <Table.Cell>
                                    <Button variant="outline" size="icon" onclick={() => threeScene.threeScene?.centerCameraOnBody(body)}>
                                        <View />
                                    </Button>
                                </Table.Cell> -->
                            </Table.Row>
                        {/each}
                    </Table.Body>
                </Table.Root>
            </div>
            <div>
                <form onsubmit={addFrame}>
                    <Field.Group>
                        <Field.Set>
                            <Field.Legend>Add Frame</Field.Legend>
                            <Field.Field>
                                <Field.Label>Frame Type</Field.Label>
                                <Combobox required options={frameTypeOptions} prompt={"Frame Type"} bind:value={selectedFrameType} />
                            </Field.Field>
                            
                            <Field.Field>
                                <Field.Label>Frame Name</Field.Label>
                                <Input required type="frameid" placeholder="Frame Name" class="max-w-xs" bind:value={frameName} />
                            </Field.Field>
            
                            {#if selectedFrameType !== FrameType.ECI}
                                <Field.Field>
                                    <Field.Label>Parent Frame</Field.Label>
                                    <Combobox required options={frames.frames.map(frame => frame.toOption())} prompt={"Parent Frame"} bind:value={parentFrameId} />
                                </Field.Field>
                            {/if}
    
                            {#if selectedFrameType === FrameType.SEZ} 
                                <Field.Field orientation="horizontal">
                                    <Input required type="number" placeholder="Latitude" class="max-w-xs" bind:value={lat} />
                                    <Input required type="number" placeholder="Longitude" class="max-w-xs" bind:value={lon} />
                                    <Input required type="number" placeholder="Altitude" class="max-w-xs" bind:value={alt} />
                                </Field.Field>
                            {/if}
                            <Field.Set>
                                <Button type="submit">
                                    <Plus />
                                    Add
                                </Button>
                            </Field.Set>
                        </Field.Set>
                    </Field.Group>
                </form>
            </div>
        {:else}
            <Empty.Root>
                <Empty.Header>
                    <Empty.Media variant="icon">
                        <Earth />
                    </Empty.Media>
                    <Empty.Title>No bodies added yet.</Empty.Title>
                </Empty.Header>
                <Empty.Content>                
                    <Button variant="ghost" size="icon" class="w-full">
                        <Plus />
                    </Button>
                </Empty.Content>
            </Empty.Root>
        {/if}
    </Card.Content>
</Card.Root>