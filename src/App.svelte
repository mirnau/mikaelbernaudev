<script>
  import { onMount } from 'svelte';
  import * as THREE from 'three';
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

  let canvas;
  let torusMesh;

  onMount(() => {

    // NOTE: Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    //NOTE: Camera & Renderer
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.position.z = 30;

    //NOTE: Light    
    const ambientLight = new THREE.DirectionalLight(0xffffff);
    ambientLight.position.set(20, 20, 20);

    // NOTE: 
    const geometry = new THREE.TorusGeometry(10, 3, 16, 100);
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff, wireframe: true });
    torusMesh = new THREE.Mesh(geometry, material);

    // NOTE: helpers
    //const lightHelper = new THREE.DirectionalLightHelper(ambientLight, 5);
    //const gridHelper = new THREE.GridHelper(200, 50);
    const controls = new OrbitControls(camera, renderer.domElement);
    
    scene.add(
      ambientLight,
      //gridHelper,
      //lightHelper,
      torusMesh
    );

    function animate() {
      requestAnimationFrame(animate);
      torusMesh.rotation.x += 0.01;
      torusMesh.rotation.y += 0.005;
      torusMesh.rotation.z += 0.01;

      controls.update();

      renderer.render(scene, camera);
    }
    animate();

    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', onWindowResize);
    return () => window.removeEventListener('resize', onWindowResize);
  });
</script>

<main>
  <canvas bind:this={canvas} id="bg"></canvas>
</main>
