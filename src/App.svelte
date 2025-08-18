<script>
   import { onMount } from "svelte";
   import * as THREE from "three";
   import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

   let canvas;
   let torusMesh;

   onMount(() => {
      const scene = new THREE.Scene();

      const loader = new THREE.CubeTextureLoader();
      loader.setPath("/skybox/"); // public/skybox/

      const texture = loader.load([
         "px.jpg", // right
         "nx.jpg", // left
         "py.jpg", // top
         "ny.jpg", // bottom
         "pz.jpg", // front
         "nz.jpg", // back
      ]);

      scene.background = texture;

      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ canvas });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.position.z = 30;

      // light that follows the mouse
      const light = new THREE.DirectionalLight(0xffffff, 1);
      light.position.set(0, 0, 20); // z fixed
      scene.add(light);

      const geometry = new THREE.TorusGeometry(10, 3, 16, 100);
      const material = new THREE.MeshStandardMaterial({ color: 0xffffff, wireframe: true });
      torusMesh = new THREE.Mesh(geometry, material);

      const controls = new OrbitControls(camera, renderer.domElement);

      scene.add(light, torusMesh);

      function animate() {
         requestAnimationFrame(animate);
         torusMesh.rotation.x += 0.01;
         torusMesh.rotation.y += 0.005;
         torusMesh.rotation.z += 0.01;

         controls.update();
         renderer.render(scene, camera);
      }
      animate();

      // map mouse coords [-1,1] range to scene space
      function onMouseMove(e) {
         const x = (e.clientX / window.innerWidth) * 2 - 1;
         const y = -(e.clientY / window.innerHeight) * 2 + 1;
         light.position.x = x * 30; // scale to taste
         light.position.y = y * 30;
         // z stays fixed
      }
      window.addEventListener("mousemove", onMouseMove);

      function onWindowResize() {
         camera.aspect = window.innerWidth / window.innerHeight;
         camera.updateProjectionMatrix();
         renderer.setSize(window.innerWidth, window.innerHeight);
      }
      window.addEventListener("resize", onWindowResize);

      return () => {
         window.removeEventListener("resize", onWindowResize);
         window.removeEventListener("mousemove", onMouseMove);
      };
   });
</script>

<main>
   <canvas bind:this={canvas} id="bg"></canvas>
</main>
