<script>
   import Grid from "../../Grid.svelte";
   import Gist from "../../Gist.svelte";
</script>

<Grid columns="1fr 1fr 1fr" masonry="true">
   <div style="width:100%; aspect-ratio:16/9;">
      <iframe
         src="https://www.youtube-nocookie.com/embed/Z8rKl2mNWtI"
         title="YouTube video"
         style="width:100%; height:100%; border:0; display:block;"
         loading="lazy"
         allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
         referrerpolicy="strict-origin-when-cross-origin"
         allowfullscreen
      >
      </iframe>
   </div>
   <h1>The Aquanaut (Final Game Project at Uni)</h1>
   <h2>Course: Engine-Driven Product Design</h2>
   <div>
      <p>
         During the autumn semester of 2022, I and a team of six other students joined forces to create a game of our
         choosing. We were set on making an underwater game from the start and worked with top down and movement in 2D
         as a restraint. In our interpretation of the 2D constraint, we made a game without jumping mechanics where the
         character can only move in the x and z dimensions of Unity's 3D space. The work on this title was a demanding
         exercise, divided into preproduction, production, and QA periods, rounded off with a final presentation,
         delivered at Malmö's DevHub, a local game studio collective.
      </p>
   </div>

   <div>
      <h2>My Roles and Motivation</h2>
      <ul>
         <li>
            <b>Tool Coding</b> - I programmed the bulk of the QA tool in collaboration with my pair programmer Lovisa Johansson.
            I chose the UI builder toolkit, to which I programmed a sign up and welcome screen for our test build. I felt
            right at home in the UI builder toolkit because of my earlier explorations of the C-Sharp WPF and UWP environments.
            I also chose that framework because it is possible to develop both for the game product itself and for the Unity
            environment. In Unity, I built a simple visualizer for the data, that among other things showed where on the
            map players most often died. I assembled a simple shader for that purpose that drew positions as a heat map to
            a render texture. The tool shows player death, heals, paths, and enemy attacks in different layers. The data
            is collected during testing as a JSON-file and e-mailed with the player's consent to a Gmail address that collected
            our results. This approach was in line with our one-week time frame allotted to tool development. The tool was
            successfully deployed and we could collect data and identify weaknesses in our game. My motivation to work with
            code was of course that I wholeheartedly enjoy coding, I enjoy the challenge and the growth that provides and
            I take any opportunity to deepen my skills in the C family, be it scripting, object-oriented programming, or
            shaders. I also lent my support to the development of the main menu backend.
         </li>
         <li>
            <b>Artist</b> - In the beginning of our project we decided to not use asset packs, so we took it upon ourselves
            to create all assets during our limited ten week project. I have been drawing all my life and I have attended
            Konstskolan Munka's first year and Göteborgs Konstskola's Painting Program's second year as I explored the possibilities
            of becoming a full time artist. For the purpose of this project, it meant that I felt confident that I could
            deliver the graphics for the menus, the concept art and 2D textures within time and perform my other duties within
            the project. The art I have made was reduced in complexity to allow for efficient production. In terms of motivation
            I'm just as passionate about art as about coding! I especially enjoy to challenge myself and push my skills to
            their limits, be it in respect to time, style or expressiveness. Art for me was the bridge in to game development,
            as I have always been fascinated by visual world building and storytelling.
         </li>
         <li>
            <b>Project management</b> - I took on the responsibilities of team lead. I managed the meeting bookings and handled
            any conflicts that came up between team members, I structured the work in sprints, with ticket assignments for
            different tasks, and managed team-building activities like for example a weekend road trip to Sweden Game Conference
            in Skövde. I shared the responsibilities with the second most senior developer, who took care of external communication,
            while I handled internal matters. We shared the responsibilities so that we could free up time mutually to pursue
            game development tasks. My motivation to engage in project management was that I knew that my seniority and work
            experience and first degree in media production would grease the machinery of the group and create a solid foundation
            to work on. I also believe that I as a senior member of the team have a duty to step up and make things run smoothly.
         </li>
      </ul>
   </div>
</Grid>
<Gist id="4cab7d6302e1a9ce332fe697a6364022" />
<div class="footer"></div>

<style>
   .footer {
      min-height: 100px;
   }
</style>
