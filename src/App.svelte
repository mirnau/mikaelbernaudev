<script lang="ts">
   import { onMount, onDestroy } from "svelte";
   import * as THREE from "three";
   import { Mesh, Material, MeshStandardMaterial } from "three";
   import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
   import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
   import { DirectionalLightHelper } from "three";
   import Presentation from "./Presentation.svelte";
   import BlockFrame from "./BlockFrame.svelte";
   import Portrait from "./Portrait.svelte";
   import Grid from "./Grid.svelte";
   import Socials from "./Socials.svelte";
   import ProjectCarousel from "./ProjectCarousel.svelte";
   import ProjectWindow from "./ProjectWindow.svelte";
   import BlueSky from "./BlueSky.svelte";
   import YouTube from "./YouTube.svelte";
   import type { Project, ProjectDetailLoader } from "./types";

   let canvas: HTMLCanvasElement;
   let renderer: THREE.WebGLRenderer | null;
   let controls: OrbitControls | null;
   let animationId: number;
   let scene: THREE.Scene;

   onMount(() => {
      scene = new THREE.Scene();

      const tl = new THREE.TextureLoader();
      const face = (p: string) => {
         const t = tl.load(p);
         t.colorSpace = THREE.SRGBColorSpace;
         return new THREE.MeshBasicMaterial({ map: t, side: THREE.BackSide });
      };
      const skyMat = [
         face("/skybox/px.png"),
         face("/skybox/nx.png"),
         face("/skybox/py.png"),
         face("/skybox/ny.png"),
         face("/skybox/pz.png"),
         face("/skybox/nz.png"),
      ];
      const skyGeo = new THREE.BoxGeometry(1000, 1000, 1000);
      const skyMesh = new THREE.Mesh(skyGeo, skyMat);
      scene.add(skyMesh);

      const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
      camera.position.set(0, 0, 45);

      renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.setSize(innerWidth, innerHeight);
      renderer.outputColorSpace = THREE.SRGBColorSpace;

      // --- Three-point lighting setup ---
      const keyLight = new THREE.DirectionalLight(0xfff2db, 1.0);
      keyLight.position.set(0, 20, 10);

      const fillLight = new THREE.DirectionalLight(0xff91c8, 0.6);
      fillLight.position.set(0, -10, 0);

      const rimLight = new THREE.DirectionalLight(0xaeebe6, 0.8);
      rimLight.position.set(0, 0, 100);

      scene.add(keyLight, fillLight, rimLight);

      // --- Visualization helpers ---
    
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableZoom = false;

      const baseDist = camera.position.distanceTo(controls.target);
      const setTiltDeg = (deg: number) => {
         const tilt = THREE.MathUtils.degToRad(deg);
         controls!.target.set(0, Math.tan(tilt) * baseDist, 0);
         camera.lookAt(controls!.target);
         controls!.update();
      };
      setTiltDeg(15);

      const raycaster = new THREE.Raycaster();
      const mouseNDC = new THREE.Vector2();
      const mouseWorld = new THREE.Vector3(0, 0, 0);
      const attractSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 22);

      const mouseHandler = (e: MouseEvent) => {
         mouseNDC.x = (e.clientX / innerWidth) * 2 - 1;
         mouseNDC.y = -(e.clientY / innerHeight) * 2 + 1;
         raycaster.setFromCamera(mouseNDC, camera);
         const hit = raycaster.ray.intersectSphere(attractSphere, mouseWorld);
         if (!hit) raycaster.ray.at(22, mouseWorld);
      };
      addEventListener("mousemove", mouseHandler);

      const scrollToTilt = () => {
         const doc = document.documentElement;
         const max = Math.max(1, doc.scrollHeight - doc.clientHeight);
         const ratio = THREE.MathUtils.clamp(doc.scrollTop / max, 0, 1);
         const deg = THREE.MathUtils.lerp(15, 80, ratio);
         setTiltDeg(deg);
      };
      const scrollHandler = () => scrollToTilt();
      addEventListener("scroll", scrollHandler, { passive: true });
      scrollToTilt();

      const params = {
         count: 10,
         maxSpeed: 3.2,
         maxForce: 0.18,
         neighborDist: 14,
         desiredSeparation: 5.0,
         alignWeight: 1.1,
         cohWeight: 0.2,
         sepWeight: 2.5,
         seekWeight: 2.2,
      };

      const osc = (min: number, max: number, period: number, phase = 0) => {
         const mid = (min + max) / 2;
         const amp = (max - min) / 2;
         const w = (Math.PI * 2) / period;
         return (t: number) => mid + amp * Math.sin(w * t + phase);
      };

      const seekWave = osc(1.5, 5.0, 40, 0);
      const speedWave = osc(2.6, 8.8, 60, Math.PI / 3);
      const forceWave = osc(0.2, 0.24, 50, Math.PI / 5);
      const sepWave = osc(2.0, 3.0, 55, Math.PI / 2);
      const alignWave = osc(0.8, 1.4, 70, Math.PI / 7);
      const cohWave = osc(0.1, 0.3, 90, Math.PI / 9);

      const boids: THREE.Object3D[] = [];

      function limit(v: THREE.Vector3, max: number) {
         const l2 = v.lengthSq();
         if (l2 > max * max) v.setLength(max);
         return v;
      }

      function steerTowards(boid: any, target: THREE.Vector3, weight = 1) {
         const desired = new THREE.Vector3().subVectors(target, boid.position);
         if (desired.lengthSq() === 0) return new THREE.Vector3();
         desired.setLength(params.maxSpeed * (boid.userData?.speedFactor ?? 1));
         const steer = desired.sub(boid.userData.vel);
         limit(steer, params.maxForce);
         return steer.multiplyScalar(weight);
      }

      function flock() {
         for (const b of boids as any[]) {
            const sep = new THREE.Vector3();
            const ali = new THREE.Vector3();
            const coh = new THREE.Vector3();
            let nA = 0,
               nC = 0,
               nS = 0;

            for (const o of boids as any[]) {
               if (o === b) continue;
               const d = b.position.distanceTo(o.position);
               if (d < params.neighborDist) {
                  ali.add(o.userData.vel);
                  coh.add(o.position);
                  nA++;
                  nC++;
               }
               if (d > 0 && d < params.desiredSeparation) {
                  const diff = new THREE.Vector3().subVectors(b.position, o.position).normalize().divideScalar(d);
                  sep.add(diff);
                  nS++;
               }
            }

            if (nA) {
               ali.divideScalar(nA)
                  .setLength(params.maxSpeed * (b.userData.speedFactor ?? 1))
                  .sub(b.userData.vel);
               limit(ali, params.maxForce);
            }
            if (nC) {
               coh.divideScalar(nC)
                  .sub(b.position)
                  .setLength(params.maxSpeed * (b.userData.speedFactor ?? 1))
                  .sub(b.userData.vel);
               limit(coh, params.maxForce);
            }
            if (nS) {
               sep.setLength(params.maxSpeed * (b.userData.speedFactor ?? 1)).sub(b.userData.vel);
               limit(sep, params.maxForce);
            }

            const seek = steerTowards(b, mouseWorld, params.seekWeight);

            b.userData.acc
               .set(0, 0, 0)
               .add(sep.multiplyScalar(params.sepWeight))
               .add(ali.multiplyScalar(params.alignWeight * (b.userData.alignFactor ?? 1)))
               .add(coh.multiplyScalar(params.cohWeight))
               .add(seek);

            const r = attractSphere.radius + 3;
            const dist2 = b.position.length();
            if (dist2 > r) {
               const back = b.position.clone().multiplyScalar(-1).setLength(params.maxSpeed).sub(b.userData.vel);
               limit(back, params.maxForce * 1.2);
               b.userData.acc.add(back);
            }
         }
      }

      function updateBoids(dt: number) {
         for (const b of boids as any[]) {
            b.userData.vel.add(b.userData.acc.multiplyScalar(dt));
            limit(b.userData.vel, params.maxSpeed * (b.userData.speedFactor ?? 1));
            b.position.addScaledVector(b.userData.vel, dt);
            if (b.userData.vel.lengthSq() > 1e-4) {
               const dir = b.userData.vel.clone().normalize();
               const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
               b.quaternion.slerp(quat, 0.6);
            }
         }
      }

      const gltfLoader = new GLTFLoader();
      gltfLoader.load(
         "/plane.glb",
         (gltf) => {
            const object = gltf.scene;
            const box = new THREE.Box3().setFromObject(object);
            const size = new THREE.Vector3();
            box.getSize(size);
            const targetLen = 1.6;
            const scale = size.z > 0 ? targetLen / size.z : 1;
            object.scale.setScalar(scale);
            const center = new THREE.Vector3();
            box.getCenter(center);
            object.position.sub(center);

            for (let i = 0; i < params.count; i++) {
               const m = object.clone(true);

               m.traverse((o) => {
                  if (!(o instanceof Mesh)) return;
                  const mats = Array.isArray(o.material) ? o.material : [o.material];
                  const newMats: Material[] = mats.map((mat) => {
                     const std = mat as MeshStandardMaterial;
                     if (!("color" in std) || !std.color) return mat;
                     const clone = std.clone();
                     const hsl = { h: 0, s: 0, l: 0 };
                     clone.color.getHSL(hsl);
                     hsl.s = THREE.MathUtils.clamp(hsl.s * (0.9 + Math.random() * 0.2), 0, 1);
                     clone.color.setHSL(hsl.h, hsl.s, hsl.l);
                     return clone;
                  });
                  o.material = newMats.length === 1 ? newMats[0] : newMats;
               });

               (m as any).position.set(
                  (Math.random() - 0.5) * 30,
                  (Math.random() - 0.5) * 18,
                  (Math.random() - 0.5) * 30
               );
               (m as any).userData.vel = new THREE.Vector3(
                  Math.random() - 0.5,
                  Math.random() - 0.5,
                  Math.random() - 0.5
               ).setLength(params.maxSpeed * 0.5);
               (m as any).userData.acc = new THREE.Vector3();
               (m as any).userData.speedFactor = 0.9 + Math.random() * 0.2;
               (m as any).userData.alignFactor = 0.8 + Math.random() * 0.4;

               scene.add(m);
               boids.push(m);
            }
         },
         undefined,
         (err) => {
            throw err;
         }
      );

      let last = performance.now();
      let t = 0;
      function animate() {
         animationId = requestAnimationFrame(animate);
         const now = performance.now();
         const dt = Math.min(0.033, (now - last) / 1000);
         last = now;
         t += dt;

         params.seekWeight = seekWave(t);
         params.maxSpeed = speedWave(t);
         params.maxForce = forceWave(t);
         params.sepWeight = sepWave(t);
         params.alignWeight = alignWave(t);
         params.cohWeight = cohWave(t);

         skyMesh.rotation.y += THREE.MathUtils.degToRad(0.5) * dt;
         flock();
         updateBoids(dt);
         controls!.update();
         renderer!.render(scene, camera);
      }
      animate();

      const resizeHandler = () => {
         camera.aspect = innerWidth / innerHeight;
         camera.updateProjectionMatrix();
         renderer!.setSize(innerWidth, innerHeight);
      };
      addEventListener("resize", resizeHandler);

      onDestroy(() => {
         removeEventListener("mousemove", mouseHandler);
         removeEventListener("scroll", scrollHandler);
         removeEventListener("resize", resizeHandler);
         cancelAnimationFrame(animationId);
         controls?.dispose();
         renderer?.dispose();
         renderer?.forceContextLoss?.();
         if (renderer) renderer.domElement = null as any;
         renderer = null;
         controls = null;
      });
   });

   const links = [
      { kind: "github", href: "https://github.com/yourname", label: "GitHub" },
      { kind: "bluesky", href: "https://bsky.app/profile/yourname", label: "BlueSky" },
      { kind: "youtube", href: "https://youtube.com/@yourname", label: "YouTube" },
      { kind: "linkedin", href: "https://www.linkedin.com/in/yourname", label: "LinkedIn" },
      { kind: "website", href: "https://yourdomain.tld", label: "Website" },
   ];

   const items: Project[] = [
      {
         slug: "aquanaut",
         title: "The Aquanaut - Final Game Production at Uni",
         image: "/projects/theaquanaut/path-recording.png",
         href: "https://youtu.be/Z8rKl2mNWtI",
         description: "A rouge-lite underwater game. The image is from the game play path-recorder tool I wrote!",
         tags: ["C#", "Unity", "Blender", "Adobe Creative Suite", "Teambuilding"],
         detail: () => import("./projects/theaquanaut/TheAquanaut.svelte"),
         detailProps: { year: 2023 },
      },
      {
         slug: "sr3d",
         title: "TTRPG Extention for Virtual Table Top Gaming - Iteration I",
         image: "/projects/foundrysr3d/homebrew.png",
         href: "https://youtu.be/YPmnX_Gp1uk",
         description: "A Homebrew System for Shadowrun 3d Edition in Foundry VTT - First Iteration",
         tags: ["JavaScript", "Handlebars", "LESS", "CSS", "Masonry"],
         detail: () => import("./projects/foundrysr3d/FoundryFirstIteration.svelte"),
         detailProps: { year: 2024 },
      },
   ];

   let show = $state(false);
   let selected = $state<Project | null>(null);

   function openProject(p: Project) {
      selected = p;
      show = true;
   }
   function closeProject() {
      show = false;
   }
</script>

<main class="app">
   <canvas bind:this={canvas} id="bg"></canvas>
   <ProjectWindow
      open={show}
      project={selected}
      on:close={() => {
         show = false;
      }}
   />

   <section class="content">
      <div>
         <h1>Mikael Bernau</h1>
         <h2>Game Developer - Unity Developer - Software Developer</h2>
      </div>

      <Grid columns="1fr">
         <BlockFrame>
            <h3>Game programmer and development passionate about software and games!</h3>
            <h2>Socials --></h2>
            <Socials size="1rem" />
         </BlockFrame>
         <BlockFrame>
            <ProjectCarousel {items} onOpen={openProject} />
         </BlockFrame>
      </Grid>
      <Grid columns="1fr 1fr">
         <BlockFrame>
            <h2>Next Up</h2>
            <p>
               <b
                  >Finding my tribe at a passionate and creative company who are as obsessed by games and a good story
                  as I am!
               </b> New in games but not new in the game, I look forward to make a difference, as a skilled code monkey and
               a game creative. I look forward to contributing to some amazing work!
            </p>
            <h2>Looking for Work</h2>
            <h5>2023-</h5>
            <p>
               Landing a game or software devjob is hard and it has been gnawrly for sometime. I am proud to do my best
               to find new opportunities. I do my outmost to keep up with the competition. I dedicate a lot of time to
               work on portfolio, learning French and working out while I keep calm and carry on. I keept the flame
               alive.
            </p>
            <hr />
            <h2>Work Experience</h2>
            <h4>Not gonna write it again, 'cause you wont read this anyway</h4>
            <p>
               All information on my 10+ year work experience from my previous field, culture- and communication, are
               listed in detail on my LinkedIn.
            </p>
            <center>
               <a
                  href="https://www.linkedin.com/in/mikaelbernau/"
                  class="icon-btn"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  style="font-size:3rem"
               >
                  <i class="fa-brands fa-linkedin" aria-hidden="true"></i>
               </a>
            </center>
         </BlockFrame>
         <BlockFrame>
            <h2>Education</h2>
            <h3>B.A. Game Development</h3>
            <h4>Malmö University</h4>
            <h5>2020-2023</h5>
            <hr />
            <h3>M.A. Media Production</h3>
            <h4>Linköping University</h4>
            <h5>2006-2006</h5>
            <hr />
            <h3>Fine Art</h3>
            <h4>Göteborgs Konstskola</h4>
            <h5>2010-2011</h5>
            <hr />
            <h3>Fine Art</h3>
            <h4>Konstskolan Munka</h4>
            <h5>2010-2011</h5>
            <hr />
            <h3>M.A. Media Production</h3>
            <h4>Linköping University</h4>
            <h5>2006-2006</h5>
         </BlockFrame>
         <BlockFrame>
            <BlueSky />
         </BlockFrame>
      </Grid>
      <Grid columns="1fr">
         <BlockFrame>
            <h2>Portfolio Playlist</h2>
            <YouTube playlistId="PLMLHGkm3KdCb1yaUYPQYeXP011pkAUXzD" />
         </BlockFrame>
         <BlockFrame>
            <h2>Work in Progress!</h2>
            <p>Please come back as I add more project during the comming weeks. I hope to see you here again!</p>
         </BlockFrame>
      </Grid>
      <div style="height: 200vh;"></div>
   </section>
</main>

<style>
   .app {
      width: 100%;
      position: relative;
   }

   #bg {
      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100vh;
      z-index: -1; /* push canvas behind content */
      display: block;
      pointer-events: none;
   }

   .content {
      position: relative;
      margin: 0 auto;
      padding: 0 auto;
      color: #fff; /* visible over skybox */
      background: transparent;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6); /* extra readability */
   }
</style>
