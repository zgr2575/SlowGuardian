<script>
  import { Search } from "@lucide/svelte";

  let {
    placeholder = "Search or enter a website",
    variant = "glass",
    autofocus = false,
    onsubmit,
  } = $props();

  let value = $state("");
  let input;

  function submit(event) {
    event.preventDefault();
    const v = value.trim();
    if (!v) return;
    onsubmit?.(v);
    value = "";
    input?.blur();
  }

  $effect(() => {
    const focus = () => input?.focus();
    window.addEventListener("sg:focus-search", focus);
    if (autofocus && !matchMedia("(pointer: coarse)").matches) focus();
    return () => window.removeEventListener("sg:focus-search", focus);
  });
</script>

<form class="search {variant}" role="search" onsubmit={submit}>
  <Search size={22} strokeWidth={1.75} />
  <input
    bind:this={input}
    bind:value
    type="search"
    {placeholder}
    aria-label={placeholder}
    autocomplete="off"
    autocapitalize="off"
    spellcheck="false"
    enterkeyhint="go"
  />
</form>

<style>
  .search {
    width: 100%;
    height: 60px;
    border-radius: var(--r-lg);
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 0 20px;
    color: rgba(245, 245, 247, 0.6);
    transition:
      transform var(--dur) var(--ease),
      box-shadow var(--dur) var(--ease),
      background var(--dur) var(--ease);
  }

  .glass {
    background: rgba(22, 22, 24, 0.62);
    backdrop-filter: blur(22px) saturate(1.4);
    -webkit-backdrop-filter: blur(22px) saturate(1.4);
    box-shadow:
      inset 0 0 0 1px rgba(255, 255, 255, 0.12),
      0 20px 60px rgba(0, 0, 0, 0.35);
  }

  .solid {
    background: var(--s2);
    box-shadow: inset 0 0 0 1px var(--line);
  }

  .search:focus-within {
    transform: translateY(-1px);
    color: var(--t1);
    box-shadow:
      inset 0 0 0 1px rgba(255, 255, 255, 0.12),
      0 0 0 2px var(--accent),
      0 24px 64px rgba(0, 0, 0, 0.4);
  }

  input {
    flex: 1;
    min-width: 0;
    height: 100%;
    border: 0;
    outline: 0;
    background: transparent;
    font-size: 18px;
    color: var(--t1);
  }

  input::placeholder {
    color: rgba(245, 245, 247, 0.6);
  }

  input::-webkit-search-cancel-button {
    display: none;
  }
</style>
