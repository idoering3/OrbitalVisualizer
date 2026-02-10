<script lang="ts">
    import Header from "$lib/components/misc/Header.svelte";
    import "./app.css";
    import { ModeWatcher } from "mode-watcher";
    let { children } = $props();
</script>


<Header />
<ModeWatcher />
{@render children?.()}