<script>
  import { openInput } from "../lib/open.js";
  import SearchField from "../components/SearchField.svelte";
</script>

<div class="empty">
  <div class="inner">
    <h1 class="title">No tabs open</h1>
    <p class="sub">Search for a site or open something from Games and Apps.</p>
    <div class="field"><SearchField variant="solid" autofocus onsubmit={openInput} /></div>
  </div>
</div>

<style>
  .empty {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--nav-h) var(--gutter) 0;
  }

  .inner {
    width: min(620px, 100%);
    text-align: center;
  }

  .title {
    font-size: 34px;
    font-weight: 650;
    letter-spacing: -0.03em;
    margin: 0;
  }

  .sub {
    color: var(--t3);
    margin: 10px 0 0;
  }

  .field {
    margin-top: 26px;
    text-align: left;
  }
</style>
