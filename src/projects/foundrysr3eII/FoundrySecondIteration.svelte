<script>
   import Grid from "../../Grid.svelte";
</script>

<Grid columns="1fr 1fr 1fr" masonry="true">
   <div>
      <div style="width:100%; aspect-ratio:16/9;">
         <iframe
            src="https://www.youtube-nocookie.com/embed/qKfM4xvRxYo"
            title="YouTube video"
            style="width:100%; height:100%; border:0; display:block;"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
         >
         </iframe>
      </div>

      <h1>Foundry VTT Shadowrun 3rd Edition Homebrew System - Iteration II</h1>
      <a href="https://github.com/devdrawdiy/sr3e">Github</a>
      <p>
         After the first iteration taught me where the ceiling of a purely front-end, JavaScript and Handlebars
         approach was, I rebuilt the system from the ground up. This second iteration is a full rewrite in Svelte 5
         and TypeScript, and it is the version I would actually hand to a group to run a real campaign on.
      </p>
   </div>

   <div>
      <h2>Why Rebuild</h2>
      <p>
         Working on the first iteration, I felt the project had started to sprawl, front-end and back-end concerns
         bled into each other, and the codebase grew idiosyncrasies as I worked around Handlebars' one-way binding.
         Rather than patch that structure, I took what I had learned and started over with a clear separation of
         concerns in mind from day one.
      </p>
   </div>

   <div>
      <h3>Working With TypeScript, Not Against It</h3>
      <p>
         The biggest shift was committing to TypeScript instead of treating it as an afterthought. JavaScript had
         felt "wishy-washy" to build a large system in. TypeScript's structure gave me the confidence to lean into a
         more functional, compositional design, and to fully move away from inheritance in favor of components. The
         goal was a codebase that is modular, navigable, and readable, where each piece has one clear job.
      </p>
   </div>

   <div>
      <h3>The Architecture</h3>
      <p>
         The overall shape of the system is similar to before: everything still flows through an <code
            >IStoreManager</code
         >. What changed is the discipline around it. The service layer took on a much bigger role, business logic
         lives in services rather than in the UI, and Svelte components talk to Foundry documents exclusively through
         the store manager rather than reaching in directly. Schemas are built on DataModels instead of legacy
         configuration files, which keeps validation and data shape in one place.
      </p>
   </div>

   <div>
      <h2>Going All In On Automation</h2>
      <p>
         For a project this size, I decided to automate as much of my workflow as I reasonably could. The build now
         runs on every save, so there is no manual step between changing code and seeing it in Foundry.
      </p>
   </div>

   <div>
      <h3>Auto-Generated Localization</h3>
      <p>
         Localization is generated automatically from a standard pattern in the TypeScript config, rather than being
         hand-maintained. Working on translation files organically tends to grow idiosyncrasies over time, keys drift,
         paths get done differently between files, and dead entries pile up. Auto-generating them keeps every key in
         sync, removes dead code, and makes the whole set easy to reason about. It also means adding a new language is
         mostly a matter of generating a second file, there is no intermediary step, everything needed is already
         there.
      </p>
   </div>

   <div>
      <h3>User-Facing Customization</h3>
      <p>
         I also exposed control over the experience to the people actually playing. The UI palette can be adjusted if
         a table isn't happy with the bright cyberpunk colors I favor, and a few parameters let players opt out of the
         more performance-hungry visual features if needed.
      </p>
   </div>

   <div>
      <h2>Where It Stands</h2>
      <p>
         I'm happy with how this iteration turned out. I think it communicates the cyberpunk feel of the setting
         well, and it's a genuine minimum viable product, feature complete for running games based on the core
         Shadowrun 3rd Edition rulebook rather than just a proof of concept. The goals I set at the start were that it
         should be intuitive, beautiful, reactive, and actually playable with real users, and I believe this iteration
         delivers on all four.
      </p>
   </div>
</Grid>
<div class="footer"></div>

<style>
   .footer {
      min-height: 100px;
   }
</style>
