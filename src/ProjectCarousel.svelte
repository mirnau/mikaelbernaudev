<script lang="ts">
   import type { Project, ProjectDetailLoader } from "./types";

   let {
      items = [] as Project[],
      startIndex = 0,
      autoplayMs = 0,
      loop = true,
      onOpen = null as ((p: Project) => void) | null,
   } = $props();

   let i = $state(Math.min(Math.max(0, startIndex), Math.max(0, items.length - 1)));
   let track: HTMLDivElement;
   let frame: HTMLDivElement;

   let w = $state(0);
   let autoplayId = $state(0);
   let dragging = $state(false);
   let sx = $state(0);
   let dx = $state(0);
   let pressed = $state(false);

   const DRAG_THRESHOLD = 6;

   function go(n: number) {
      if (!items.length) return;
      i = loop ? (n + items.length) % items.length : Math.min(items.length - 1, Math.max(0, n));
      dx = 0;
      console.log("[Carousel] go -> index:", i);
   }

   const next = () => go(i + 1);
   const prev = () => go(i - 1);

   function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
   }

   function startAuto() {
      stopAuto();
      if (autoplayMs > 0) {
         autoplayId = window.setInterval(next, autoplayMs);
         console.log("[Carousel] autoplay start", autoplayMs, "ms");
      }
   }
   function stopAuto() {
      if (autoplayId) {
         clearInterval(autoplayId);
         autoplayId = 0;
         console.log("[Carousel] autoplay stop");
      }
   }

   const size = () => {
      w = frame?.clientWidth ?? 0;
      console.log("[Carousel] size -> w:", w);
   };

   const stopAnd = (e: Event, fn: () => void) => {
      e.stopPropagation();
      fn();
   };

   function onDown(e: PointerEvent) {
      pressed = true;
      dragging = false;
      sx = e.clientX;
      dx = 0;
      stopAuto();
   }

   function onMove(e: PointerEvent) {
      if (!pressed) return;
      const delta = e.clientX - sx;
      if (!dragging && Math.abs(delta) > DRAG_THRESHOLD) {
         dragging = true;
         track.setPointerCapture(e.pointerId);
      }
      if (dragging) dx = delta;
   }

   function onUp(e: PointerEvent) {
      if (!pressed) return;
      pressed = false;

      if (dragging) {
         dragging = false;
         try {
            track.releasePointerCapture(e.pointerId);
         } catch {}
         if (Math.abs(dx) > Math.min(80, w * 0.2)) {
            dx < 0 ? next() : prev();
         }
         dx = 0;
      }
      startAuto();
   }

   import { onMount, onDestroy } from "svelte";
   let ro: ResizeObserver;

   onMount(() => {
      ro = new ResizeObserver(size);
      ro.observe(frame);
      requestAnimationFrame(size);
      startAuto();
      window.addEventListener("keydown", onKey);
   });
   onDestroy(() => {
      ro?.disconnect();
      stopAuto();
      window.removeEventListener("keydown", onKey);
   });

   const translateX = $derived(-(i * w) + dx);
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="carousel" onmouseenter={stopAuto} onmouseleave={startAuto}>
   <div class="viewport" bind:this={frame}>
      <div
         class="track"
         bind:this={track}
         onpointerdown={onDown}
         onpointermove={onMove}
         onpointerup={onUp}
         onpointercancel={onUp}
         onpointerleave={onUp}
         style:transform={`translate3d(${translateX}px,0,0)`}
         aria-live="polite"
         role="region"
         aria-roledescription="carousel"
      >
         {#each items as p, idx}
            <article class="slide" aria-hidden={i !== idx} role="group" aria-label={`${idx + 1} / ${items.length}`}>
               <a
                  class="card"
                  href={p.href || "#"}
                  target={p.href ? "_blank" : undefined}
                  rel={p.href ? "noopener noreferrer" : undefined}
                  onpointerdown={(e) => e.stopPropagation()}
                  onclick={(e) => {
                     if (onOpen) {
                        e.preventDefault();
                        console.log("[Carousel] card click -> open", p.title);
                        onOpen(p);
                     }
                  }}
               >
                  <div class="media">
                     <img loading="lazy" alt={p.title} src={p.image} />
                  </div>
                  <div class="meta">
                     <h3>{p.title}</h3>
                     {#if p.description}<p class="desc">{p.description}</p>{/if}
                     {#if p.tags?.length}
                        <ul class="tags">
                           {#each p.tags as t}<li>{t}</li>{/each}
                        </ul>
                     {/if}
                  </div>
               </a>
            </article>
         {/each}
      </div>
   </div>

   <div class="controls">
      <button
         class="arrow"
         aria-label="Previous"
         onpointerdown={(e) => e.stopPropagation()}
         onclick={(e) => {
            console.log("[Carousel] Prev arrow clicked");
            stopAnd(e, prev);
         }}
      >
         <i class="fa-regular fa-square-caret-left"></i>
      </button>

      <div class="dots">
         {#each items as _, idx}
            <button
               class="dot"
               aria-label={`Go to slide ${idx + 1}`}
               aria-current={i === idx ? "true" : "false"}
               data-active={i === idx}
               onpointerdown={(e) => e.stopPropagation()}
               onclick={(e) => {
                  console.log("[Carousel] Dot clicked ->", idx);
                  e.stopPropagation();
                  go(idx);
               }}
            ></button>
         {/each}
      </div>

      <button
         class="arrow"
         aria-label="Next"
         onpointerdown={(e) => e.stopPropagation()}
         onclick={(e) => {
            console.log("[Carousel] Next arrow clicked");
            stopAnd(e, next);
         }}
      >
         <i class="fa-regular fa-square-caret-right"></i>
      </button>
   </div>
</div>

<style>
   /* make the whole card look like regular text */
   a.card,
   a.card:link,
   a.card:visited,
   a.card:hover,
   a.card:focus {
      color: inherit;
      text-decoration: none;
      cursor: pointer;
   }

   /* keep a clear keyboard focus without underlines */
   a.card:focus-visible {
      outline: 3px solid #d4f2ff;
      outline-offset: 4px;
   }

   /* belt-and-suspenders: ensure nothing inside gets underlined */
   .card .meta :where(h3, p, li) {
      text-decoration: none;
   }

   .carousel {
      min-height: 50vh;
      display: grid;
      gap: 0.75rem;
      padding: 0.5rem;
   }

   @media (max-width: 640px) {
      .carousel {
         min-height: auto;
         padding: 0.25rem;
      }
   }

   .viewport {
      overflow: hidden;
      position: relative;
      width: 100%;
      max-width: 100%;
   }

   .track {
      display: flex;
      transition: transform 0.865s cubic-bezier(0.2, 0.7, 0.2, 1);
      touch-action: pan-y;
      will-change: transform;
   }

   .slide {
      flex: 0 0 100%;
      min-width: 0;
      max-width: 100%;
      width: 100%;
      position: relative;
      overflow: clip;
      contain: layout paint;
      clip-path: inset(0);
   }

   .card {
      display: block;
      width: 100%;
      min-width: 0;
      max-width: 100%;
      overflow: hidden;
   }

   .media {
      min-width: 0;
      max-width: 100%;
   }

   .media {
      width: 100%;
      height: clamp(180px, 45vw, 520px);
      overflow: clip;
      position: relative;
   }

   .media {
      --vig-inner: 60%;
      --vig-outer: 95%;
   }

   .media img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;

      /* transparent vignette */
      -webkit-mask-image: radial-gradient(ellipse at 50% 50%, #000 var(--vig-inner), transparent var(--vig-outer));
      mask-image: radial-gradient(ellipse at 50% 50%, #000 var(--vig-inner), transparent var(--vig-outer));
      -webkit-mask-repeat: no-repeat;
      mask-repeat: no-repeat;
      -webkit-mask-size: 100% 100%;
      mask-size: 100% 100%;
   }

   .media img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
   }

   .meta {
      padding: 0.75rem 1rem;
      display: grid;
      gap: 0.35rem;
      background: linear-gradient(
         90deg,
         transparent 0%,
         rgba(45, 0, 128, 0.8) 25%,
         rgba(255, 248, 184, 0.4) 60%,
         transparent 100%
      );
      backdrop-filter: blur(3px);
      width: 100%;
      max-width: 100%;
      box-sizing: border-box;
      overflow: hidden;
   }
   h3 {
      margin: 0;
      font-size: clamp(1.1rem, 1.4vw + 0.7rem, 1.8rem);
      line-height: 1.15;
   }
   .desc {
      margin: 0;
      opacity: 0.9;
   }
   .tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
      list-style: none;
      padding: 0;
      margin: 0.25rem 0 0;
   }
   .tags li {
      font-size: 1.2rem;
      padding: 0.2rem 0.5rem;
      border: 1px solid rgba(255, 255, 255, 0.25);
      border-radius: 5px;
      opacity: 0.9;
   }
   .controls {
      display: grid;
      grid-template-columns: auto 1fr auto;
      align-items: center;
      gap: 0.5rem;
      position: relative;
      z-index: 3;
      padding: 0.5rem;
      min-height: 3rem;
   }
   .arrow {
      background: none;
      border: none;
      padding: 0.25rem;
      cursor: pointer;
      color: #fff;
      font-size: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.15s ease;
      flex-shrink: 0;
      min-width: 2.5rem;
   }
   .arrow:hover {
      transform: scale(1.15);
   }
   .arrow:active {
      transform: scale(0.95);
   }
   .dots {
      display: flex;
      justify-content: center;
      gap: 0.4rem;
   }
   .dot {
      width: 0.7rem;
      height: 0.7rem;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.3);
      border: 0;
      cursor: pointer;
   }
   .dot[data-active="true"] {
      background: #fff;
   }
   @media (max-width: 640px) {
      .arrow {
         font-size: 1.5rem;
         min-width: 2rem;
      }
      .meta {
         padding: 0.5rem 0.75rem;
      }
      h3 {
         font-size: clamp(1rem, 3vw, 1.4rem);
      }
      .tags li {
         font-size: 0.9rem;
         padding: 0.15rem 0.4rem;
      }
   }

   @media (pointer: coarse) {
      .track {
         transition-duration: 0.2s;
      }
   }
</style>
