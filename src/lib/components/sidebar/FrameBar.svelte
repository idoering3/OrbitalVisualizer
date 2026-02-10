<script lang='ts'>
    import * as Card from "$lib/components/ui/card/index.js";
    import * as THREE from 'three';
    import { Button } from "../ui/button/index.js";
    import { Earth, Plus } from "@lucide/svelte";
    import * as Empty from "$lib/components/ui/empty/index.js";
    import { bodies } from "../stores.svelte.js";
    import * as Table from "$lib/components/ui/table/index.js";
    import { latex } from "../misc/katexAction.js";

    let distanceFormula = "\\mathbf{r}_0";
    let velocityFormula = "\\mathbf{v}_0";
</script>

<Card.Root>
    <Card.Header>
        <Card.Title>Frames</Card.Title>
        <Card.Description>
            View and manage reference frames.
        </Card.Description>
    </Card.Header>
    <Card.Content class="flex flex-col gap-4">
        Testing
    </Card.Content>

</Card.Root>