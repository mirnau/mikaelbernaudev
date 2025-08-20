<script>
   import Grid from "../../Grid.svelte";
   import Gist from "../../Gist.svelte";
</script>

<Grid columns="1fr 1fr 1fr" masonry="true">
   <div style="width:100%; aspect-ratio:16/9;">
      <iframe
         src="https://www.youtube-nocookie.com/embed/4ox7ReZ7IUU"
         title="YouTube video"
         style="width:100%; height:100%; border:0; display:block;"
         loading="lazy"
         allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
         referrerpolicy="strict-origin-when-cross-origin"
         allowfullscreen
      ></iframe>
   </div>

   <div>
      <h1>Boids (Personal Project)</h1>
      <h2>Compute Shader</h2>
      <p>
         In this iteration of my boid project I moved the calculations to the GPU to increase the amount of boids the
         simulation can handle. Boid calculations are quite cumbersome for the computer, if not special techniques are
         used, like spacial partitioning. Since I have not yet implemented spacial partitioning, the system at present
         can handle 500-1000 units, 500 as in the video is handles the boid on an average of one millisecond, while 1000
         units require around three. As I deepen my knowledge of compute shaders and how to use them appropriately in a
         project I think there is plenty of room for optimization with a cube grid and a spacial partition system as a
         first step. Another interesting experiment is to build a system for Unity Entity Component System and see how
         the system behaves in a data oriented environment.
      </p>
   </div>
</Grid>
<Gist id="061b23ff67e664f4e74a15be5f8b787a" />
<div class="footer"></div>

<style>
   .footer {
      min-height: 100px;
   }
</style>
