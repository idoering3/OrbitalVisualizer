<script>
    import { latex } from "../misc/katexAction";
    import { simTime } from "../stores.svelte";

</script>

<div class="absolute mr-10 right-0 bottom-0 flex">
    <span use:latex={{ data: `t-t_0 = ${simTime.t.toFixed(2)} h` }}></span>
</div>