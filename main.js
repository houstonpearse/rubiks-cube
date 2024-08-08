import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { createCore, newCube } from "./src/cube";

const scene = new THREE.Scene();
scene.background = new THREE.Color("grey");
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;
camera.position.y = 3;
camera.position.x = 2;

const canvas = document.getElementById("rubiks-cube");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
renderer.setPixelRatio(2);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = true;
controls.enablePan = false;
controls.enableDamping = true;

const ambientLight = new THREE.AmbientLight("white", 0.5);
const spotLight1 = new THREE.DirectionalLight("white", 2);
const spotLight2 = new THREE.DirectionalLight("white", 2);
const spotLight3 = new THREE.DirectionalLight("white", 2);
const spotLight4 = new THREE.DirectionalLight("white", 2);

spotLight1.position.set(5, 5, 5);
spotLight2.position.set(-5, 5, 5);
spotLight3.position.set(5, -5, 0);
spotLight3.position.set(-2, -5, -5);

scene.add(ambientLight, spotLight1, spotLight2, spotLight3);

const pieces = newCube();
const cubeGroup = new THREE.Group();
const core = createCore();
cubeGroup.add(core);
pieces.forEach((piece) => {
  cubeGroup.add(piece.group);
});
scene.add(cubeGroup);

function animate() {
  controls.update();
  renderer.render(scene, camera);
}

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
