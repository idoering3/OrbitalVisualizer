<script lang="ts">
    import CheckIcon from "@lucide/svelte/icons/check";
    import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";
    import { tick } from "svelte";
    import * as Command from "$lib/components/ui/command/index.js";
    import * as Popover from "$lib/components/ui/popover/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import { cn } from "$lib/utils.js";
    import type { Option } from "$lib/components/misc/uiOption";

    interface Props {
        options: Option[];
        prompt?: string;
        value?: string;
        required?: boolean;
    }

    let { options, prompt, value = $bindable(""), required}: Props = $props();

    let open = $state(false);
    let triggerRef = $state<HTMLButtonElement>(null!);

    const selectedValue = $derived(
        options.find((f) => f.value === value)?.label
    );

    // We want to refocus the trigger button when the user selects
    // an item from the list so users can continue navigating the
    // rest of the form with the keyboard.
    function closeAndFocusTrigger() {
        open = false;
        tick().then(() => {
            triggerRef.focus();
        });
    }
    </script>

    <Popover.Root bind:open>
    <Popover.Trigger bind:ref={triggerRef}>
    {#snippet child({ props })}
    <Button
    {...props}
    variant="outline"
    class="w-[200px] justify-between"
    role="combobox"
    aria-expanded={open}
    >
    {selectedValue || prompt}
    <ChevronsUpDownIcon class="opacity-50" />
    </Button>
    {/snippet}
    </Popover.Trigger>
    <Popover.Content class="w-[200px] p-0">
        <Command.Root>
            <Command.Input placeholder={prompt} required={required} />
                <Command.List>
                <Command.Empty>No value found.</Command.Empty>
                    <Command.Group value="frameworks">
                        {#each options as framework (framework.value)}
                        <Command.Item
                        value={framework.value}
                        onSelect={() => {
                        value = framework.value;
                        closeAndFocusTrigger();
                        }}
                        >
                        <CheckIcon
                        class={cn(value !== framework.value && "text-transparent")}
                        />
                        {framework.label}
                        </Command.Item>
                        {/each}
                    </Command.Group>
                </Command.List>
        </Command.Root>
    </Popover.Content>
</Popover.Root>