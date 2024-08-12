import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import Cube from "./src/cube";
import { AnimationQueue, Animation } from "./src/animation";
import { Controls } from "./src/controls";

const scene = new THREE.Scene();
scene.background = new THREE.Color("white");
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;
camera.position.y = 3;
camera.position.x = 3;
camera.lookAt(0, 0, 0);

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
spotLight4.position.set(-10, -5, -5);
scene.add(ambientLight, spotLight1, spotLight2, spotLight3, spotLight4);

/* create cube and add to scene*/
const cube = new Cube();
scene.add(cube.group);

/* animation queue */
const animationQueue = new AnimationQueue();

function animate() {
  controls.update();
  animationQueue.update();
  const animationGroup = animationQueue.getAnimationGroup();
  if (animationGroup !== undefined) scene.add(animationGroup);
  renderer.render(scene, camera);
}

const keybinds = new Map([
  ["t", "x"],
  ["y", "x'"],
  ["g", "y"],
  ["h", "y'"],
  ["b", "z"],
  ["n", "z'"],
  ["f", "U'"],
  ["F", "u'"],
  ["j", "U"],
  ["J", "u"],
  ["d", "L"],
  ["s", "L'"],
  ["k", "R"],
  ["l", "R'"],
  ["a", "D"],
  [";", "D'"],
  ["r", "F'"],
  ["u", "F"],
  ["i", "M"],
  ["e", "M'"],
  ["o", "S"],
  ["w", "S'"],
  ["q", "B"],
  ["p", "B'"],
  ["v", "E"],
  ["m", "E'"],
]);
const keyControls = new Controls(keybinds);
window.addEventListener("keydown", (e) => {
  if (e.key === " ") {
    camera.position.x = camera.position.x > 0 ? -3 : 3;
    camera.position.y = 3;
    camera.position.z = 5;
    camera.lookAt(0, 0, 0);
  }

  const action = keyControls.getAction(e.key);
  if (action !== undefined) {
    const animation = new Animation(
      cube,
      action.axis,
      action.layers,
      action.direction,
      200
    );
    animationQueue.add(animation);
  } else {
    console.log("Invalid key: " + e.key);
  }
});

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
