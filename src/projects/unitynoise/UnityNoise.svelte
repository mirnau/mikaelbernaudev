<script>
   import Grid from "../../Grid.svelte";
   import Gist from "../../Gist.svelte";
</script>

<Grid columns="1fr 1fr 1fr" masonry="true">
   <h1>Procedural 1D Noise (Personal Project)</h1>
   <p>
      This project is an exploration of 1D noise. It is a second iteration of a noise generator that I used for
      simulation of pressure and temperature in a weather simulation. The concept was that pressure and temperature can
      be used in a fuzzy state machine to influence weather state. The system in question did not need to compute the
      temperature over an area, so that is why I chose to work with 1D noise.
   </p>

   <ul>
      <li>Improvments in this a better visual presentation.</li>

      <li>Vector graphics to display the curve instead of an auto generated 2D Texture.</li>
      <li>Better class structure, with more specialized classes.</li>
   </ul>

   <p>
      My goals were to make it easily visually manageable, and to create a reusable tool. I am satisfied with the visual
      presentation, and the tool is fairly easy to package and reuse if needed. There is still room for improvement in a
      next iteration, like for example implementing a visual indication that makes it easy to determine the scale of the
      time direction (x-axis).
   </p>
   <p>
      In a future revision I would like to find an architecture that makes it possible to remove the message broker. The
      reason for this is that the use of the message broker conflicts with my design goals in Unity. I want to work with
      Unity, and not against Unity in my architecture, and the message broker violates this principle. In my experience,
      working against Unity’s architecture has a tendency to introduce bugs in the system and limit the modularity,
      reusability and maintainability of the current project. That said, there will sure be exceptions, where it is
      necessary to do so, as no game engine is a one size fits all solution.
   </p>
</Grid>
<Gist id="0f259112405d9331d82df08ba855af9b" />
<div class="footer"></div>

<style>
   .footer {
      min-height: 100px;
   }
</style>
