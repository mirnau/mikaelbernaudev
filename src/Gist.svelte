<!-- Gist.svelte -->
<script lang="ts">
   let { id, file = null } = $props<{ id: string; file?: string | null }>();

   let name = $state("");
   let lang = $state("");
   let code = $state("");

   async function load() {
      const r = await fetch(`https://api.github.com/gists/${id}`);
      const data = await r.json();
      const files = data.files as Record<string, any>;
      const pick = file && files[file] ? files[file] : files[Object.keys(files)[0]];

      name = pick.filename;
      lang = (pick.language || "").toLowerCase();
      code = await (await fetch(pick.raw_url)).text();
   }

   $effect(() => {
      load();
   });
</script>

<figure class="gist">
   <figcaption>{name}</figcaption>
   <pre><code class={`language-${lang}`}>{code}</code></pre>
</figure>

<style>
   .gist {
      --bg: hsl(0 0% 90%); /* light: 10% gray (90% lightness) */
      --bd: hsl(0 0% 80%);
      --fg: hsl(0, 0%, 0%);
      max-width: 100%;
      overflow: auto;
      margin: 0;
   }

   .gist figcaption {
      font:
         600 0.9rem/1.2 system-ui,
         sans-serif;
      opacity: 0.8;
      margin: 0 0 0.5rem;
      color: var(--fg);
   }

   pre {
      margin: 0;
      padding: 1rem;
      background: #e2f6fa; /* 10% gray */
      border: 1px solid #d9d9d9;
      border-radius: 15px;
   }

   .gist code {
      font:
         0.875rem/1.5 ui-monospace,
         SFMono-Regular,
         Menlo,
         Consolas,
         monospace;
      white-space: pre;
   }
</style>
