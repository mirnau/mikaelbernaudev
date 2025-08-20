<script>
   import Grid from "../../Grid.svelte";
   import Gist from "../../Gist.svelte";
</script>

<Grid columns="1fr 1fr 1fr" masonry="true">
   <div style="width:100%; aspect-ratio:16/9;">
      <iframe
         src="https://www.youtube-nocookie.com/embed/t1OLId_HlIc"
         title="YouTube video"
         style="width:100%; height:100%; border:0; display:block;"
         loading="lazy"
         allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
         referrerpolicy="strict-origin-when-cross-origin"
         allowfullscreen
      ></iframe>
   </div>

   <h1>Haunted House (Game Project at Uni)</h1>
   <h2>Course: Software Architecture</h2>
   <p>
      In the spring of 2022 we had the opportunity to make a game during the course of our software architecture course.
      I worked together with a small team of four other students. We decided to make a horror puzzle game. Due to the
      short production time of about five weeks, we used premade assets to fast set up an environment to write some cool
      scripts for.
   </p>
   <h2>My Roles and Motivations</h2>
   <ul>
      <li>
         Tool Coding - This was my first real challenge in UI Builder. I made a visual tree graph for a decision tree. I
         employed this AI-behaviour to search for the while walking about between random way-points on a navmesh. I got
         do discover that I am interested in working on extending the capabilities of game engines. My motivation was
         that I wanted to explore the workings of decision trees and implement it on an enemy character.
      </li>
      <li>
         Project management - I took responsibility for time tracking, sprint set up, daily stand ups, weekly meetings
         and design documents for this game. My motivation was to keep things running smoothly, and as the most senior
         student in the group, with the most work life experience, I had the tools to make it work.
      </li>
   </ul>
</Grid>
<Gist id="40261691df6e17a76de5e25c1afa2d61" />
<div class="footer"></div>

<style>
   .footer {
      min-height: 100px;
   }
</style>
