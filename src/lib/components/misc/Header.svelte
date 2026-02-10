<script lang='ts'>
    import ThemeToggle from "./ThemeToggle.svelte";
    import WindowButtons from "./WindowButtons.svelte";
    
</script>

<div class="flex h-12 justify-between items-center border-b" data-tauri-drag-region>
    <div class="ml-2">
        Orbital Visualizer
    </div>
    <aside class="flex items-center">
        <div>
            <ThemeToggle />
        </div>
        <div class="ml-2">
            <WindowButtons />
        </div>
    </aside>
</div>