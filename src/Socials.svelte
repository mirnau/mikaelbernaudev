<!-- SocialBar.svelte -->
<script lang="ts">
   let { size = "2rem" } = $props();
</script>

<nav class="social-bar" style={`--icon-size: ${size}`}>
   <a href="https://youtube.com/@devdrawdiy" target="_blank" aria-label="YouTube">
      <i class="fa-brands fa-youtube"></i>
   </a>
   <a href="https://bsky.app/profile/otterbeast.bsky.social" target="_blank" aria-label="Bluesky">
      <i class="fa-brands fa-bluesky"></i>
   </a>
   <a href="https://instagram.com/dev.draw.diy" target="_blank" aria-label="Instagram">
      <i class="fa-brands fa-instagram"></i>
   </a>
   <a href="https://mikaelbernau.itch.io" target="_blank" aria-label="Itch.io">
      <i class="fa-brands fa-itch-io"></i>
   </a>
   <a href="https://github.com/mirnau" target="_blank" aria-label="GitHub">
      <i class="fa-brands fa-github"></i>
   </a>
   <a href="https://behance.net/mikaelbernau" target="_blank" aria-label="Behance">
      <i class="fa-brands fa-behance"></i>
   </a>
</nav>

<style>
   .social-bar {
      display: flex;
      gap: 1rem;
      position: absolute;
      bottom: 0.5rem;
      right: 0.5rem;
   }

   .social-bar a {
      font-size: var(--icon-size);
      color: #cfd3ff;
      transition:
         transform 0.2s,
         color 0.2s;
   }

   .social-bar a:hover {
      color: #fff;
      transform: translateY(-2px) scale(1.1);
   }
</style>
