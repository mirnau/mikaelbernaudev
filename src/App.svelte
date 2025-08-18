<script>
   import { onMount } from "svelte";
   import * as THREE from "three";
   import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
   import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

   let canvas;

   onMount(() => {
      const scene = new THREE.Scene();

      const tl = new THREE.TextureLoader();
      const face = (p) => {
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

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.setSize(innerWidth, innerHeight);
      renderer.outputColorSpace = THREE.SRGBColorSpace;

      const hemi = new THREE.HemisphereLight(0xffffff, 0x222233, 0.7);
      const dir = new THREE.DirectionalLight(0xffffff, 0.7);
      dir.position.set(10, 15, 20);
      scene.add(hemi, dir);

      const controls = new OrbitControls(camera, renderer.domElement);
      const tilt = THREE.MathUtils.degToRad(15);
      const dist = camera.position.distanceTo(controls.target);
      controls.target.set(0, Math.tan(tilt) * dist, 0);
      camera.lookAt(controls.target);
      controls.update();

      const raycaster = new THREE.Raycaster();
      const mouseNDC = new THREE.Vector2();
      const mouseWorld = new THREE.Vector3(0, 0, 0);
      const attractSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 22);

      addEventListener("mousemove", (e) => {
         mouseNDC.x = (e.clientX / innerWidth) * 2 - 1;
         mouseNDC.y = -(e.clientY / innerHeight) * 2 + 1;
         raycaster.setFromCamera(mouseNDC, camera);
         const hit = raycaster.ray.intersectSphere(attractSphere, mouseWorld);
         if (!hit) raycaster.ray.at(22, mouseWorld);
      });

      const params = {
         count: 30,
         maxSpeed: 6.2,
         maxForce: 0.18,
         neighborDist: 14,
         desiredSeparation: 3.0,
         alignWeight: 0.1,
         cohWeight: 0.2,
         sepWeight: 2.5,
         seekWeight: 2.2,
      };

      const boids = [];

      function limit(v, max) {
         const l2 = v.lengthSq();
         if (l2 > max * max) v.setLength(max);
         return v;
      }

      function steerTowards(boid, target, weight = 1) {
         const desired = new THREE.Vector3().subVectors(target, boid.position);
         if (desired.lengthSq() === 0) return new THREE.Vector3();
         desired.setLength(params.maxSpeed);
         const steer = desired.sub(boid.userData.vel);
         limit(steer, params.maxForce);
         return steer.multiplyScalar(weight);
      }

      function flock() {
         for (const b of boids) {
            const sep = new THREE.Vector3();
            const ali = new THREE.Vector3();
            const coh = new THREE.Vector3();
            let nA = 0,
               nC = 0,
               nS = 0;

            for (const o of boids) {
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
               ali.divideScalar(nA).setLength(params.maxSpeed).sub(b.userData.vel);
               limit(ali, params.maxForce);
            }
            if (nC) {
               coh.divideScalar(nC).sub(b.position).setLength(params.maxSpeed).sub(b.userData.vel);
               limit(coh, params.maxForce);
            }
            if (nS) {
               sep.setLength(params.maxSpeed).sub(b.userData.vel);
               limit(sep, params.maxForce);
            }

            const seek = steerTowards(b, mouseWorld, params.seekWeight);

            b.userData.acc
               .set(0, 0, 0)
               .add(sep.multiplyScalar(params.sepWeight))
               .add(ali.multiplyScalar(params.alignWeight))
               .add(coh.multiplyScalar(params.cohWeight))
               .add(seek);

            const r = attractSphere.radius + 3;
            const dist = b.position.length();
            if (dist > r) {
               const back = b.position.clone().multiplyScalar(-1).setLength(params.maxSpeed).sub(b.userData.vel);
               limit(back, params.maxForce * 1.2);
               b.userData.acc.add(back);
            }
         }
      }

      function updateBoids(dt) {
         for (const b of boids) {
            b.userData.vel.add(b.userData.acc.multiplyScalar(dt));
            limit(b.userData.vel, params.maxSpeed);
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
               m.position.set((Math.random() - 0.5) * 30, (Math.random() - 0.5) * 18, (Math.random() - 0.5) * 30);
               m.userData.vel = new THREE.Vector3(
                  Math.random() - 0.5,
                  Math.random() - 0.5,
                  Math.random() - 0.5
               ).setLength(params.maxSpeed * 0.5);
               m.userData.acc = new THREE.Vector3();
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
      function animate() {
         requestAnimationFrame(animate);
         const now = performance.now();
         const dt = Math.min(0.033, (now - last) / 1000);
         last = now;
         skyMesh.rotation.y += THREE.MathUtils.degToRad(0.5) * dt;
         flock();
         updateBoids(dt);
         controls.update();
         renderer.render(scene, camera);
      }
      animate();

      addEventListener("resize", () => {
         camera.aspect = innerWidth / innerHeight;
         camera.updateProjectionMatrix();
         renderer.setSize(innerWidth, innerHeight);
      });
   });
</script>

<main>
   <canvas bind:this={canvas} id="bg"></canvas>
</main>
