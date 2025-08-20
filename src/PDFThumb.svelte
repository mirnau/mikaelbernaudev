<script lang="ts">
   import { onMount } from "svelte";
   import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
   // @ts-ignore
   import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

   let { src, caption = "PDF" } = $props<{
      src: string;
      caption?: string;
   }>();

   let canvas: HTMLCanvasElement;

   onMount(async () => {
      GlobalWorkerOptions.workerSrc = pdfWorker;
      const pdf = await getDocument(src).promise;
      const page = await pdf.getPage(1);
      const vp1 = page.getViewport({ scale: 1 });
      const scale = 210 / 297; // A4 ratio scaled down
      const viewport = page.getViewport({ scale });

      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);

      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      await page.render({
         canvasContext: ctx,
         canvas,
         viewport,
         background: "#ffffff",
      }).promise;
   });

   function openPDF() {
      window.open(src, "_blank", "noopener,noreferrer");
   }
</script>

<div
   role="button"
   tabindex="0"
   onclick={openPDF}
   onkeydown={(e) => (e.key === "Enter" || e.key === " ") && openPDF()}
   aria-label="Open PDF"
   title="Open PDF"
   class="thumb"
>
   <canvas bind:this={canvas}></canvas>
   <h3>{caption}</h3>
</div>

<style>
   .thumb {
      display: flex;
      flex-direction: column;
      align-items: center; /* center horizontally */
      justify-content: center;
      cursor: pointer;
      user-select: none;
      width: 120px;
      gap: 0.5rem;
   }
   canvas {
      box-shadow: 0 0 30px purple;
      display: block;
      width: 100%;
      height: auto;
      image-rendering: -webkit-optimize-contrast;
   }
   h3 {
      margin: 0;
      text-align: center;
      font-size: 0.9rem;
   }
</style>
