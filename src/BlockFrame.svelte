<script lang="ts">
   import { onMount, onDestroy } from "svelte";

   let { children } = $props();

   let frame: HTMLDivElement;
   let starsCanvas: HTMLCanvasElement;
   let ctx: CanvasRenderingContext2D | null = null;

   let raf = 0;
   let tx = 0,
      ty = 0;
   let fx = 0,
      fy = 0;

   const baseRadius = 1000;
   const ease = 0.12;
   const trailLen = 5;

   const trail: { x: number; y: number }[] = [];

   type Star = { x: number; y: number; r: number; a: number; phase: number; speed: number };
   let stars: Star[] = [];
   let dpr = Math.min(window.devicePixelRatio || 1, 2);
   let t0 = 0;

   function onMove(e: MouseEvent) {
      const r = frame.getBoundingClientRect();
      tx = e.clientX - r.left;
      ty = e.clientY - r.top;
   }

   function resizeStars() {
      const r = frame.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      starsCanvas.width = Math.max(1, Math.floor(r.width * dpr));
      starsCanvas.height = Math.max(1, Math.floor(r.height * dpr));
      starsCanvas.style.width = r.width + "px";
      starsCanvas.style.height = r.height + "px";
      ctx = starsCanvas.getContext("2d");

      const area = r.width * r.height;
      const density = 0.00018;
      const count = Math.min(600, Math.max(60, Math.round(area * density)));

      stars = Array.from({ length: count }, () => ({
         x: Math.random() * starsCanvas.width,
         y: Math.random() * starsCanvas.height,
         r: (Math.random() * 1.2 + 0.6) * dpr,
         a: 0.35 + Math.random() * 0.35,
         phase: Math.random() * Math.PI * 2,
         speed: 0.6 + Math.random() * 1.2,
      }));
   }

   function drawStars(time: number) {
      if (!ctx) return;
      ctx.clearRect(0, 0, starsCanvas.width, starsCanvas.height);
      for (const s of stars) {
         const tw = 0.5 + 0.5 * Math.sin(s.phase + time * 0.001 * s.speed);
         const alpha = s.a * tw;
         ctx.globalAlpha = alpha;
         ctx.beginPath();
         ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
         ctx.fillStyle = "#ffffff";
         ctx.fill();
      }
      ctx.globalAlpha = 1;
   }

   function tick(now?: number) {
      raf = requestAnimationFrame(tick);
      if (!t0) t0 = now || performance.now();
      const time = (now || performance.now()) - t0;

      fx += (tx - fx) * ease;
      fy += (ty - fy) * ease;

      trail.unshift({ x: fx, y: fy });
      if (trail.length > trailLen) trail.pop();

      const layers = trail
         .map((p, i) => {
            const k = 1 - i / trail.length;
            const o = k * k;
            const rScale = 0.25 + 0.45 * Math.pow(k, 1.4);
            const r = baseRadius * rScale;

            const a0 = 0.68 * o;
            const a1 = 0.52 * o;
            const a2 = 0.36 * o;

            return `radial-gradient(circle ${r}px at ${p.x}px ${p.y}px,
          rgba(0, 0, 80, ${a0}) 0%,
          rgba(128, 0, 128, ${a1}) 38%,
          rgba(0, 128, 128, ${a2}) 68%,
          rgba(0, 0, 0, 0) 100%)`;
         })
         .join(",");

      frame.style.background = layers || "transparent";
      drawStars(time);
   }

   function onResize() {
      resizeStars();
   }

   onMount(() => {
      const r = frame.getBoundingClientRect();
      tx = fx = r.width / 2;
      ty = fy = r.height / 2;

      resizeStars();

      frame.addEventListener("mousemove", onMove);
      window.addEventListener("resize", onResize);

      raf = requestAnimationFrame(tick);
   });

   onDestroy(() => {
      frame.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
      if (raf) cancelAnimationFrame(raf);
   });
</script>

<div bind:this={frame} class="block-frame">
   <canvas bind:this={starsCanvas} class="stars"></canvas>
   {@render children?.()}
</div>

<style>
   .block-frame {
      position: relative;
      width: 100%;
      height: auto;
      z-index: 50;
      border: 5px solid white;
      border-radius: 10px;
      color: #fff;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
      background: transparent;
      overflow: hidden;
   }

   .stars {
      position: absolute;
      inset: 0;
      z-index: 0;
      pointer-events: none;
   }

   .block-frame > *:not(.stars) {
      position: relative;
      z-index: 1;
   }
</style>
