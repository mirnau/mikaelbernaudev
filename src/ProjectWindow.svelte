<script lang="ts">
   import { onMount, onDestroy, createEventDispatcher } from "svelte";
   import { fade } from "svelte/transition"; // ← add this
   import type { Project } from "./types";

   let { open = false, project = null as Project | null } = $props();

   const dispatch = createEventDispatcher<{ close: void }>();
   function doClose() {
      dispatch("close");
   }

   let LoadedComponent: any = null;
   let loading = $state(false);
   let errorMsg = $state<string | null>(null);

   async function loadDetail() {
      LoadedComponent = null;
      errorMsg = null;
      if (!project?.detail) return;
      loading = true;
      try {
         const mod = await project.detail();
         LoadedComponent = mod.default;
      } catch (err) {
         console.error("[ProjectWindow] detail load failed", err);
         errorMsg = "Failed to load project details.";
      } finally {
         loading = false;
      }
   }

   $effect(() => {
      if (open && project) loadDetail();
   });

   const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") doClose();
   };
   onMount(() => window.addEventListener("keydown", onKey));
   onDestroy(() => window.removeEventListener("keydown", onKey));
</script>

{#if open && project}
   <div class="backdrop" onclick={doClose} in:fade={{ duration: 200 }} out:fade={{ duration: 200 }}></div>

   <section
      class="window"
      role="dialog"
      aria-modal="true"
      aria-label={project.title}
      in:fade={{ duration: 400 }}
      out:fade={{ duration: 300 }}
   >
      <header class="bar">
         <h2>{project.title}</h2>
         <button class="close" type="button" aria-label="Close" onclick={doClose}>×</button>
      </header>

      <div class="grid">
         <div class="col">
            {#if project.image}<img class="hero" alt={project.title} src={project.image} />{/if}
            {#if project.tags?.length}<ul class="tags">
                  {#each project.tags as t}<li>{t}</li>{/each}
               </ul>{/if}
            {#if project.href}<a class="link" href={project.href} target="_blank" rel="noopener noreferrer"
                  >Open project</a
               >{/if}
         </div>

         <div class="col span-3 content">
            {#if loading}
               <div class="loading">Loading…</div>
            {:else if errorMsg}
               <p class="error">{errorMsg}</p>
            {:else if LoadedComponent}
               <svelte:component this={LoadedComponent} {project} {...project.detailProps ?? {}} />
            {:else if project.html}
               <div class="rich">
                  {@html project.html}
               </div>
            {:else if project.description}
               <article><p>{project.description}</p></article>
            {:else}
               <p>No additional details.</p>
            {/if}
         </div>
      </div>
   </section>
{/if}

<style>
   .backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.55);
      z-index: 100;
   }
   .window {
      position: fixed;
      top: 50px;
      right: 50px;
      bottom: 50px;
      left: 50px;
      background: #fff;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      border-radius: 12px; /* round all corners */
      overflow: hidden; /* clip children to rounded edges */
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.35);
   }

   .bar {
      flex: 0 0 auto;
      display: grid;
      grid-template-columns: 1fr auto;
      align-items: center;
      gap: 1rem;
      padding: 12px 16px;
      border-bottom: 1px solid rgba(24, 0, 111, 0.1);
      background: #fff;
      position: sticky;
      top: 0;
      z-index: 1;
   }

   .grid {
      flex: 1 1 auto;
      overflow: auto;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      padding: 16px;

      /* give scrollbar breathing room so it’s not flush with the curve */
      scrollbar-gutter: stable both-edges;
   }

   h2 {
      margin: 0;
      font-size: 1.25rem;
   }
   .close {
      background: none;
      border: none;
      font-size: 2rem;
      line-height: 1;
      cursor: pointer;
   }
   .col {
      min-width: 0;
   }
   .span-3 {
      grid-column: span 3;
   }
   .hero {
      width: 100%;
      height: auto;
      display: block;
      border-radius: 6px;
   }
   .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      list-style: none;
      margin: 10px 0 0;
      padding: 0;
   }
   .tags li {
      padding: 4px 8px;
      border-radius: 4px;
      background: #f1f1f4;
      font-size: 0.85rem;
   }
   .link {
      display: inline-block;
      margin-top: 10px;
   }
   .content {
      min-height: 200px;
   }
   .rich :where(img, video, iframe) {
      max-width: 100%;
      height: auto;
   }
   .loading {
      opacity: 0.7;
   }
   .error {
      color: #b00020;
   }
   @media (max-width: 900px) {
      .grid {
         grid-template-columns: 1fr 1fr;
      }
      .span-3 {
         grid-column: span 1;
      }
   }
   @media (max-width: 560px) {
      .grid {
         grid-template-columns: 1fr;
      }
      .span-3 {
         grid-column: span 1;
      }
   }
</style>
