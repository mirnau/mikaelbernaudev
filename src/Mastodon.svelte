<script>
   import { onMount } from "svelte";

   let posts = [];
   let loading = true;
   let error = null;

   async function fetchFeed() {
      try {
         const instance = "mastodon.social";
         const username = "otterbeast";

         const lookupRes = await fetch(
            `https://${instance}/api/v1/accounts/lookup?acct=${username}`
         );
         if (!lookupRes.ok) throw new Error(`HTTP error! status: ${lookupRes.status}`);
         const account = await lookupRes.json();

         const statusRes = await fetch(
            `https://${instance}/api/v1/accounts/${account.id}/statuses?limit=10&exclude_replies=true`
         );
         if (!statusRes.ok) throw new Error(`HTTP error! status: ${statusRes.status}`);

         const statuses = await statusRes.json();
         posts = statuses.map((s) => ({ ...s, account }));
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
   <h2>Mastodon Feed</h2>
   {#if loading}<p>Loading…</p>{/if}
   {#if error}<p class="err">Error: {error}</p>{/if}
   {#each posts as p}
      <article class="post">
         <header class="hdr">
            <img class="avatar" src={p.account.avatar} alt="" />
            <a class="author" href={p.account.url} target="_blank" rel="noopener">
               {p.account.display_name || p.account.username}
            </a>
            <a class="permalink" href={p.url} target="_blank" rel="noopener">Open</a>
         </header>

         <div class="text">{@html p.content}</div>

         {#if p.media_attachments?.length}
            <div class="imgs">
               {#each p.media_attachments.filter((m) => m.type === "image") as img}
                  <img src={img.preview_url || img.url} alt={img.description || ""} loading="lazy" />
               {/each}
            </div>
         {/if}

         <footer class="meta" aria-label="Post metrics">
            <span class="metric" title="Replies">
               <i class="fa-regular fa-comment"></i>{p.replies_count || 0}
            </span>
            <span class="metric" title="Boosts">
               <i class="fa-solid fa-retweet"></i>{p.reblogs_count || 0}
            </span>
            <span class="metric" title="Favourites">
               <i class="fa-regular fa-heart"></i>{p.favourites_count || 0}
            </span>
            <a
               class="metric"
               href={p.url}
               target="_blank"
               rel="noopener"
               title="Open on Mastodon"
               aria-label="Open on Mastodon"
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
   .text :global(p) {
      margin: 0;
   }
   .text :global(a) {
      color: inherit;
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
   .err {
      color: #f88;
   }
</style>
