<script>
   let { columns = "1fr 1fr", children, masonry = false } = $props();
   const colCount = columns.trim().split(/\s+/).length;
</script>

<div
   class={`grid ${masonry ? "masonry" : "gridmode"}`}
   style={`--cols:${colCount};${masonry ? "" : `grid-template-columns:${columns}`}`}
>
   {@render children?.()}
</div>

<style>
   .grid {
      width: 100%;
      margin: 0 0 1.5rem;
      padding: 0;
   }

   .grid.gridmode {
      display: grid;
      gap: 1.5rem;
      align-items: start; /* stop items from stretching to row height */
      grid-auto-rows: auto; /* ensure rows size to content */
   }

   /* safety: prevent children from forcing equal heights */
   .grid.gridmode > * {
      height: auto;
      min-height: 0;
   }

   .grid.masonry {
      column-gap: 1.5rem;
      columns: var(--cols);
   }

   @media (max-width: 720px) {
      .grid.masonry {
         columns: 1;
      }
   }
</style>
