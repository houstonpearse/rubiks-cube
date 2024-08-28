import * as THREE from "three";
import * as TWEEN from "@tweenjs/tween.js";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import Cube from "./src/cube";
import getRotationDetails from "./src/rotation";
import { AnimationQueue, Animation } from "./src/animation";

class RubiksCube extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `<canvas id="cube-canvas" style="display:block;"></canvas>`;
    this.canvas = this.shadowRoot.getElementById("cube-canvas");
  }

  connectedCallback() {
    this.init();
  }

  init() {
    // defined core threejs objects
    const canvas = this.canvas;
    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      canvas,
      antialias: true,
    });
    renderer.setSize(this.clientWidth, this.clientHeight);
    renderer.setAnimationLoop(animate);
    renderer.setPixelRatio(2);

    //update renderer and camera when container resizes. debouncing events to reduce frequency
    function debounce(f, delay) {
      let timer = 0;
      return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => f.apply(this, args), delay);
      };
    }
    const resizeObserver = new ResizeObserver(
      debounce((entries) => {
        const { width, height } = entries[0].contentRect;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      }, 30)
    );
    resizeObserver.observe(this);

    // add camera
    const camera = new THREE.PerspectiveCamera(
      75,
      this.clientWidth / this.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 4;
    camera.position.y = 3;
    camera.position.x = 0;

    // add orbit controls for camera
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.maxAzimuthAngle = Math.PI / 4;
    controls.minAzimuthAngle = -Math.PI / 4;
    controls.maxPolarAngle = (3 * Math.PI) / 4;
    controls.minPolarAngle = Math.PI / 4;

    // add lighting to scene
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

    // create cube and add to scene
    const cube = new Cube();
    scene.add(cube.group);

    // animation queue
    const animationQueue = new AnimationQueue();

    // initial camera animation
    const cameraAnimationGroup = new TWEEN.Group();
    cameraAnimationGroup.add(
      new TWEEN.Tween(camera.position)
        .to({ x: 3, y: 3, z: 4 }, 1000)
        .easing(TWEEN.Easing.Cubic.InOut)
        .start()
    );

    // animation loop
    function animate() {
      cameraAnimationGroup.update();
      controls.update();
      animationQueue.update();
      const animationGroup = animationQueue.getAnimationGroup();
      if (animationGroup !== undefined) scene.add(animationGroup);
      renderer.render(scene, camera);
    }

    // add event listeners for rotation and camera controls
    this.addEventListener("rotate", (e) => {
      const action = getRotationDetails(e.detail.action);
      if (action !== undefined) {
        const animation = new Animation(
          cube,
          action.axis,
          action.layers,
          action.direction,
          200
        );
        animationQueue.add(animation);
      }
    });
    this.addEventListener("camera", (e) => {
      console.log(cube.getStickerState());

      if (e.detail.action === "peek-toggle-horizontal") {
        cameraAnimationGroup.add(
          new TWEEN.Tween(camera.position)
            .to(
              {
                x: camera.position.x > 0 ? -2.5 : 2.5,
                y: camera.position.y > 0 ? 2.5 : -2.5,
                z: 4,
              },
              200
            )
            .start()
        );
      } else if (e.detail.action === "peek-toggle-vertical") {
        cameraAnimationGroup.add(
          new TWEEN.Tween(camera.position)
            .to(
              {
                x: camera.position.x > 0 ? 2.5 : -2.5,
                y: camera.position.y > 0 ? -2.5 : 2.5,
                z: 4,
              },
              200
            )
            .start()
        );
      } else if (e.etail.action === "peek-right") {
        cameraAnimationGroup.add(
          new TWEEN.Tween(camera.position)
            .to(
              {
                x: 2.5,
                y: camera.position.y > 0 ? 2.5 : -2.5,
                z: 4,
              },
              200
            )
            .start()
        );
      } else if (e.detail.action === "peek-left") {
        cameraAnimationGroup.add(
          new TWEEN.Tween(camera.position)
            .to(
              {
                x: -2.5,
                y: camera.position.y > 0 ? 2.5 : -2.5,
                z: 4,
              },
              200
            )
            .start()
        );
      } else if (e.detail.action === "peek-up") {
        cameraAnimationGroup.add(
          new TWEEN.Tween(camera.position)
            .to(
              {
                x: camera.position.x > 0 ? 2.5 : -2.5,
                y: 2.5,
                z: 4,
              },
              200
            )
            .start()
        );
      } else if (e.detail.action === "peek-down") {
        cameraAnimationGroup.add(
          new TWEEN.Tween(camera.position)
            .to(
              {
                x: camera.position.x > 0 ? 2.5 : -2.5,
                y: -2.5,
                z: 4,
              },
              200
            )
            .start()
        );
      }
    });
  }
}
customElements.define("rubiks-cube", RubiksCube);
