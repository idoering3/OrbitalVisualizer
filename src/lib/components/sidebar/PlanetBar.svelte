<script lang='ts'>
    import * as Card from "$lib/components/ui/card/index.js";
    import * as THREE from 'three';
    import { Button } from "../ui/button/index.js";
    import { Earth, Plus, View } from "@lucide/svelte";
    import * as Empty from "$lib/components/ui/empty/index.js";
    import { bodies, threeScene } from "../stores.svelte.js";
    import * as Table from "$lib/components/ui/table/index.js";
    import { onMount } from "svelte";
    import { latex } from "../misc/katexAction.js";

    let distanceFormula = "\\mathbf{r}_0";
    let velocityFormula = "\\mathbf{v}_0";
</script>

<Card.Root>
    <Card.Header>
        <Card.Title>Bodies</Card.Title>
        <Card.Description>
            View and manage celestial bodies
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
                            <Table.Head>Mass (kg)</Table.Head>
                            <Table.Head>Radius (km)</Table.Head>
                            <Table.Head>
                                <span use:latex={{ data: distanceFormula }}></span>
                                (km)
                            </Table.Head>
                            <Table.Head>
                                <span use:latex={{ data: velocityFormula }}></span>
                                (km/s)
                            </Table.Head>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {#each bodies.bodies as body}
                            <Table.Row>
                                <Table.Cell>{body.name || 'Unnamed Body'}</Table.Cell>
                                <Table.Cell>{body.physicsBody.mass.toExponential(2)}</Table.Cell>
                                <Table.Cell>{body.physicsBody.radius}</Table.Cell>
                                <Table.Cell>
                                    [{body.physicsBody.position}]
                                </Table.Cell>
                                <Table.Cell>
                                    [{body.physicsBody.velocity}]
                                </Table.Cell>
                                <Table.Cell>
                                    <Button variant="outline" size="icon" onclick={() => threeScene.threeScene?.centerCameraOnBody(body)}>
                                        <View />
                                    </Button>
                                </Table.Cell>
                            </Table.Row>
                        {/each}
                        <Table.Row>
                            <Table.Cell colspan={6} onclick={() => console.log("Add body clicked")}>
                                <div class="flex items-center justify-center w-full h-full">
                                    <Plus />
                                </div>
                            </Table.Cell>
                        </Table.Row>
                    </Table.Body>
                </Table.Root>
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