<script>
   import { onMount } from "svelte";

   let posts = [];
   let loading = true;
   let error = null;

   async function fetchFeed() {
      try {
         const handle = "otterbeast.bsky.social"; // Replace with your Bluesky handle
         const response = await fetch(
            `https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed?actor=${encodeURIComponent(handle)}&limit=10&filter=posts_no_replies`
         );

         if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
         }

         const data = await response.json();
         posts = data.feed;
      } catch (e) {
         error = e.message;
      } finally {
         loading = false;
      }
   }

   onMount(() => {
      fetchFeed();
   });
</script>

<div>
   <h2>Bluesky Feed</h2>
   {#each posts as p}
      <article class="post">
         <header class="hdr">
            <img class="avatar" src={p.post.author.avatar} alt="" />
            <a class="author" href={`https://bsky.app/profile/${p.post.author.handle}`} target="_blank" rel="noopener">
               {p.post.author.displayName || p.post.author.handle}
            </a>
            <a
               class="permalink"
               href={`https://bsky.app/profile/${p.post.author.handle}/post/${p.post.uri.split("/").pop()}`}
               target="_blank"
               rel="noopener">Open</a
            >
         </header>

         {#if p.post.record?.text}<p class="text">{p.post.record.text}</p>{/if}

         {#if p.post.embed?.$type === "app.bsky.embed.images#view"}
            <div class="imgs">
               {#each p.post.embed.images as img}
                  <img src={img.thumb || img.fullsize} alt={img.alt || ""} loading="lazy" />
               {/each}
            </div>
         {/if}

         <footer class="meta" aria-label="Post metrics">
            <span class="metric" title="Replies">
               <i class="fa-regular fa-comment"></i>{p.post.replyCount || 0}
            </span>
            <span class="metric" title="Reposts">
               <i class="fa-solid fa-retweet"></i>{p.post.repostCount || 0}
            </span>
            <span class="metric" title="Likes">
               <i class="fa-regular fa-heart"></i>{p.post.likeCount || 0}
            </span>
            <a
               class="metric"
               href={`https://bsky.app/profile/${p.post.author.handle}/post/${p.post.uri.split("/").pop()}`}
               target="_blank"
               rel="noopener"
               title="Open on Bluesky"
               aria-label="Open on Bluesky"
            >
               <i class="fa-solid fa-arrow-up-right-from-square"></i>
            </a>
         </footer>
      </article>
   {/each}
</div>

<style>
   .post {
      color: white;
      margin: 0.5rem;
      background: #060bac1a;
      border: 1px solid #d9d9d9;
      border-radius: 12px;
      padding: 0.75rem;
      display: grid;
      gap: 0.5rem;
   }
   .hdr {
      display: grid;
      grid-template-columns: auto 1fr auto;
      gap: 0.5rem;
      align-items: center;
   }
   .avatar {
      width: 32px;
      height: 32px;
      border-radius: 999px;
      object-fit: cover;
   }
   .author,
   .permalink {
      text-decoration: none;
   }
   .text {
      margin: 0;
   }
   .imgs {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 6px;
   }
   .imgs img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 8px;
      aspect-ratio: 1/1;
   }
   .meta {
      display: flex;
      gap: 0.85rem;
      align-items: center;
      opacity: 0.85;
   }
   .metric {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      color: inherit;
      text-decoration: none;
   }
   .metric i {
      font-size: 0.95rem;
      line-height: 1;
   }
   .metric:hover {
      opacity: 1;
   }
</style>
