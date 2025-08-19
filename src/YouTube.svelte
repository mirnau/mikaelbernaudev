<!-- YouTubePlaylist.svelte -->
<script lang="ts">
   let {
      playlistId,
      index = 0,
      autoplay = 0,
      controls = 1,
   } = $props<{ playlistId: string; index?: number; autoplay?: 0 | 1; controls?: 0 | 1 }>();
   const src = $derived(
      `https://www.youtube-nocookie.com/embed/videoseries?list=${encodeURIComponent(playlistId)}&index=${index}&autoplay=${autoplay}&controls=${controls}&modestbranding=1&rel=0`
   );
</script>

<div class="yt">
   <iframe
      {src}
      title="YouTube playlist"
      loading="lazy"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerpolicy="strict-origin-when-cross-origin"
      allowfullscreen
   ></iframe>
</div>

<style>
   .yt {
      width: 100%;
      aspect-ratio: 16/9;
   }
   .yt iframe {
      width: 100%;
      height: 100%;
      border: 0;
      display: block;
   }
</style>
