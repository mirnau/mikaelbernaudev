<script lang="ts">
   import { onMount } from "svelte";

   let {
      src = "/rss/wix.json",
      limit = 5,
      showImages = true,
      showVideos = true,
   } = $props<{
      src?: string; // /rss/*.json (built) or a full RSS URL
      limit?: number;
      showImages?: boolean;
      showVideos?: boolean;
   }>();

   type Video = { provider: "youtube"; id: string; embed: string; thumbnail: string };
   type Item = {
      title: string;
      link: string;
      description: string;
      date: string;
      guid: string;
      image?: string | null;
      video?: Video | null;
   };

   let items = $state<Item[]>([]);
   let loading = $state(true);
   let error = $state("");
   let playing = $state<Record<string, boolean>>({});

   function parseDate(s: string): string {
      const d = new Date(s);
      return isNaN(d.getTime()) ? "" : d.toLocaleDateString();
   }

   function findYouTubeId(txt: string): string | null {
      return (
         txt?.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{6,})/)?.[1] ??
         txt?.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/)?.[1] ??
         txt?.match(/[?&]v=([a-zA-Z0-9_-]{6,})/)?.[1] ??
         null
      );
   }

   async function loadFromJson(path: string) {
      const res = await fetch(path, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      // Accept your prebuilt shape; keep fields you already use.
      return Array.isArray(data?.items)
         ? ((data.items as any[]).map((it) => ({
              title: it.title ?? "",
              link: it.link ?? "",
              description: it.descriptionHtml ?? it.description ?? "",
              date: it.date ?? it.pubDate ?? "",
              guid: it.guid ?? it.link ?? crypto.randomUUID(),
              image: it.image ?? null,
              video: it.video ?? null,
           })) as Item[])
         : [];
   }

   async function loadFromRss(url: string) {
      const proxy = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`;
      const res = await fetch(proxy);
      const data = await res.json();
      if (data.status !== "ok") throw new Error(data.message ?? "Failed to load RSS");

      return (data.items ?? []).map((it: any): Item => {
         const html = it.description ?? "";
         // Keep your working image mapping exactly:
         const img = it.enclosure?.link ?? it.thumbnail ?? null;

         // Detect YouTube best-effort from html or enclosure.link/type
         const enclLink: string | undefined = it.enclosure?.link;
         const yt =
            findYouTubeId(html) ||
            findYouTubeId(enclLink ?? "") ||
            (it.enclosure?.type?.startsWith?.("video/") ? findYouTubeId(enclLink ?? "") : null);

         return {
            title: it.title ?? "",
            link: it.link ?? "",
            description: html,
            date: it.pubDate ?? "",
            guid: it.guid ?? it.link ?? crypto.randomUUID(),
            image: img,
            video: yt
               ? {
                    provider: "youtube",
                    id: yt,
                    embed: `https://www.youtube-nocookie.com/embed/${yt}`,
                    thumbnail: `https://img.youtube.com/vi/${yt}/hqdefault.jpg`,
                 }
               : null,
         };
      });
   }

   async function load() {
      loading = true;
      error = "";
      items = [];
      playing = {};
      try {
         const isRemote = /^https?:\/\//i.test(src);
         items = isRemote ? await loadFromRss(src) : await loadFromJson(src);
      } catch (e: any) {
         error = e?.message ?? "Load failed";
      } finally {
         loading = false;
      }
   }

   function play(guid: string) {
      playing = { ...playing, [guid]: true };
   }

   onMount(load);
   $effect(() => {
      const _ = src;
      load();
   });
</script>

<div class="blogfeed">
   {#if loading}
      <div class="status">Loading…</div>
   {:else if error}
      <div class="status error">{error}</div>
   {:else if items.length}
      <ul class="items">
         {#each items.slice(0, limit) as it}
            <li class="item">
               {#if (showVideos && it.video) || (showImages && it.image)}
                  <div class="thumb">
                     {#if showVideos && it.video}
                        {#if playing[it.guid]}
                           <iframe
                              src={`${it.video.embed}?autoplay=1`}
                              title={it.title}
                              loading="lazy"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              allowfullscreen
                           />
                        {:else}
                           <button class="yt" type="button" aria-label="Play video" on:click={() => play(it.guid)}>
                              <img src={it.video.thumbnail} alt={it.title} loading="lazy" />
                              <span class="play">▶</span>
                           </button>
                        {/if}
                     {:else if showImages && it.image}
                        <a href={it.link} target="_blank" rel="noopener noreferrer">
                           <img src={it.image} alt={it.title} loading="lazy" />
                        </a>
                     {/if}
                  </div>
               {/if}

               <div class="body">
                  <a class="title" href={it.link} target="_blank" rel="noopener noreferrer">{it.title}</a>
                  {#if parseDate(it.date)}<div class="meta">{parseDate(it.date)}</div>{/if}
                  {#if it.description}<p class="desc">{@html it.description}</p>{/if}
               </div>
            </li>
         {/each}
      </ul>
   {:else}
      <div class="status">No posts yet.</div>
   {/if}
</div>

<style>
   .blogfeed {
      padding: 0.5rem;
      a {
         color: white;
         font-size: 1.2;
         text-decoration-line: underline;
      }
   }

   .items {
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      gap: 1rem;
   }
   .item {
      display: grid;
      grid-template-columns: 120px 1fr;
      gap: 1rem;
      align-items: start;
      border-bottom: 1px solid rgba(255, 255, 255, 0.12);
      padding-bottom: 1rem;
   }
   .item:last-child {
      border-bottom: 0;
   }

   .thumb {
      display: block;
      overflow: hidden;
      border-radius: 0.5rem;
      background: rgba(255, 255, 255, 0.06);
   }
   .thumb img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
      aspect-ratio: 1/1;
   }

   /* video placeholder + iframe fit the same box */
   .yt {
      display: block;
      position: relative;
      border: 0;
      padding: 0;
      background: none;
      cursor: pointer;
      width: 100%;
   }
   .yt img {
      display: block;
      width: 100%;
      height: auto;
      aspect-ratio: 1/1;
      object-fit: cover;
   }
   .yt .play {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      font-size: 2rem;
      line-height: 1;
      background: rgba(0, 0, 0, 0.45);
      color: #fff;
      border-radius: 999px;
      padding: 0.2rem 0.5rem;
   }

   iframe {
      width: 100%;
      height: auto;
      aspect-ratio: 1/1;
      border: 0;
      border-radius: 0.5rem;
   }

   .body {
      min-width: 0;
   }
   .title {
      font-weight: 600;
      text-decoration: none;
   }
   .title:hover {
      text-decoration: underline;
   }
   .meta {
      color: #aaa;
      font-size: 0.9rem;
      margin: 0.25rem 0;
   }
   .desc {
      margin: 0.5rem 0 0;
   }
   .status {
      color: #aaa;
   }
   .status.error {
      color: #f88;
   }

   @media (max-width: 720px) {
      .item {
         grid-template-columns: 1fr;
      }
      .thumb {
         max-height: 220px;
      }
   }
</style>
