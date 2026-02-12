<script>
    import { Minus, Square, X } from "@lucide/svelte";
    import { Button } from "$lib/components/ui/button/index.js";
    import { getCurrentWindow } from "@tauri-apps/api/window";

    let appWindow = getCurrentWindow();

    function closeApplication ()
    {
        appWindow.close();
    }
    function minimizeApplication ()
    {
        appWindow.minimize();
    }
    function toggleFullscreenApplication ()
    {
        appWindow.toggleMaximize();
    }
</script>

<header>
    <Button class="h-12 w-12 rounded-none m-0" variant="ghost" onclick={minimizeApplication}>
        <Minus />
    </Button>
    <Button class="h-12 w-12 rounded-none m-0" variant="ghost" onclick={toggleFullscreenApplication}>
        <Square size={12} />
    </Button>
    <Button class="h-12 w-12 rounded-none m-0 hover:bg-destructive hover:dark:bg-destructive" variant="ghost" onclick={closeApplication}>
        <X />
    </Button>
</header>