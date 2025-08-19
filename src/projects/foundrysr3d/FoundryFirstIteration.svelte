<script>
   import Grid from "../../Grid.svelte";
</script>

<Grid columns="1fr 1fr 1fr" masonry="true">
   <div>
      <div style="width:100%; aspect-ratio:16/9;">
         <iframe
            src="https://www.youtube-nocookie.com/embed/YPmnX_Gp1uk"
            title="YouTube video"
            style="width:100%; height:100%; border:0; display:block;"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
         >
         </iframe>
      </div>

      <h1>Foundry VTT Shadowrun 3d. Edition Homebrew System</h1>
      <a href="https://github.com/mirnau/sr3d">Github</a>
      <p>
         For this project I have taken a small detour from conventional engine-driven game development. Table-top role
         playing games are a beloved hobby and social activity the world over, where people tell a story together.
         Virtual table tops faced an upswing during the pandemic, and platforms like Roll20 and FoundryVTT became widely
         popular. For this project I chose to work with FoundryVTT, because of their buy to own model.
      </p>
   </div>

   <div>
      <h2>The System</h2>
      <p>
         On the FoundryVTT platform users are free to use published systems, or create their own. I always liked
         Shadowrun Third Edition, and saw clear benefits of digitalizing this system, as it is very dice crunchy and
         rule heavy. Virtual table top applications open up for a smoother experience here. The system is purely a hobby
         project, and I have no affiliation with FoundryVTT.
      </p>
   </div>

   <div>
      <h3>The Technology Stack</h3>
      Foundry is written for simplicity, the core technology is browser based and the stack looks like this:

      <ul>
         <li>HTML - for page structure</li>

         <li>CSS - for implementation of user interface design and simple animations -</li>

         <li>JavaScript - for system development, custom data-binding and communication with the data storage</li>

         <li>Handlebars - a simple oneway data-binding framework</li>

         <li>LESS (optional) - a CSS-precompiler to ease the work with complex css -styling</li>

         <li>Masonry (optional)- a JavaScript library used for responsive layouts</li>
      </ul>
   </div>

   <div>
      <h2>Challenges</h2>
      <p>
         For me this has been the first project where I have gone in depth in a front-end project. Experience from C#
         and C++ languages have been invaluable assets for me, reading and writing JavaScript. The data-binding also
         felt intuitive thanks to prior knowledge of the related markup language XAML that I have familiarized myself
         with in dotnet environments.
      </p>
   </div>
   <div>
      <h3>Learning a Complex API</h3>
      <p>
         To work with this complex API I have used a range of different sources. Firstly there is a great community
         wiki, and a comprehensive (but dense) documentation that has been a great help. YouTube-tutorials has also shed
         light on the structure. I have also used AI-tools, mostly Chat GPT, Claude AI and NotebookLM. These greatly
         speed up the process of understanding the environment, writing code and and give answers to questions on the
         architecture of FoundryVTT. LLMs have some caveats though, as they mix informations from different versions of
         the API, and introduce technical debt faster by - for example -solving similar problems in different ways in
         different files, (like html structure and data-binding). This is a major hurdle for maintainability and human
         readability in projects, especially more involved ones. It is also at times, frankly, neither well informed or
         cooperative as it has no concept of overarching strategies. I feel I have a definite advantage, having learned
         to code before the time of LLMs, in judging the quality and usability of what these tools produce.
      </p>
   </div>
   <div>
      <h3>Responsive Layout with Masonry</h3>
      <p>
         One of my goals, was to expand the concept of what a character sheet can be. One way of doing this is to add a
         dynamic layout. This proved to need expansion of the masonry library. By default masonry reads the width of the
         client, but that is not a good approach when working with apps (like character sheets) in FoundryVTT. To solve
         this problem I introduced a state-machine that reads the size of t he application and calculate column and item
         widths on app resize.
      </p>
   </div>
   <div>
      <h3>Expanding the Design with Injections</h3>
      <p>
         To set the mood of the game, I wanted to firmly establish a cyber-punk aesthetic. Important to this goal was to
         inject the flickering neon sign name animation on the top of the sheet. Every time the sheet is opened,
         different letters are chosen at random. I also made the news feed, inspired by Sim-City's scrolling news feed.
         It displays on top of all character sheet, but there is also an actor class, that the Game Master (GM) can use
         to customize the news, with fake commercials, stupid headlines, and news regarding what happens in the world
         the characters inhabit. It also makes it possible for the characters to sometimes see the effect of their
         actions in the news headlines.
      </p>
   </div>
   <div>
      <h3>Randomizing Characters With A Custom Generator</h3>
      <p>
         The character creation point sidebar is also an injection, and it uses the result of the initial form that the
         player is promoted with at the start of character creation. It is based on the options table in the core rule
         book, and dynamically displays all meta human races (trolls, elves and what ever the GM may allow and create
         for their players) and types of magicians, which makes it a powerful character creation tool, that automates an
         otherwise involved and slow process. The player can choose to build their character from scratch, modify a
         randomized character or outright randomize the whole character's basic set up with one click.
      </p>
   </div>
   <div>
      <h2>Larger Scope Than Anticipated</h2>
      <p>
         Working out the system in FoundryVTT is a massive undertaking, because of the complexity of this edition of
         Shadowrun. But to handle this I have set up a few guidelines for myself:
      </p>

      <p>Prioritizing designs on the character sheet, as that is where player's will spend most of their time</p>

      <p>
         Automating only a minimal set of constraints. Constraints can for example be the maximum value of an attribute
         or skill. Real life table top role playing games build on trust between GM and their players, and by honoring
         this accord, constraints should only be implemented, when they support the cast of the game.
      </p>
   </div>
   <div>
      <h2>Next Steps</h2>
      <p>
         This first version, could be considered a draft. With a deeper knowledge of the API beforehand, a new iteration
         would be cleaner and more cohesive. It would be a great opportunity to plan the architecture more in depth in
         advance and reduce the amount of technical debt introduced by the AI-tools.
      </p>

      <p>
         The handlebars data-binding is a problem in the current implementation, the downside of it's ease of use is
         that it is a one way binding, which complicates more advanced solutions. FoundryVTT's vanilla implementation
         requires a re-render to show updates and thus always triggers a re-layout, which is undesirable with a dynamic
         layout. To handle this, another data-binding framework has to be introduced into the environment.
      </p>

      <p>
         I am convinced that I can achieve two way data-bindings that displays and stores the current state, without
         having to trigger unnecessary reloads of the entire DOM-structure. This is a venue that I will explore. This
         might lead to changes in the over all architecture that are sufficiently impactful to argue for a starting with
         a clean slate in a second iteration.
      </p>
   </div>
   <div>
      <h2>In Hindsight</h2>
      <p>
         I am very happy with the outcome of the overall design of the project, and I look forward to keep improving on
         the existing design, and start implementing more of the complex aspects of the back-end, like rules for combat.
         I hope to be able to clean up the existing code, and gain new ground with a small but more versatile
         data-binding system. As far I can judge, Svelte seems to be a good contender for this purpose.
      </p>
   </div>
</Grid>
<div class="footer"></div>

<style>
   .footer {
      min-height: 100px;
   }
</style>
