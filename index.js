import { Scene, WebGLRenderer, PerspectiveCamera, AmbientLight, DirectionalLight } from 'three';
import { Tween, Group, Easing } from '@tweenjs/tween.js';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import Cube from './src/cube/cube';
import getRotationDetailsFromNotation from './src/utils/rotation';
import { AnimationQueue, Animation } from './src/animation';
import { debounce } from './src/utils/debouncer';

class RubiksCube extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `<canvas id="cube-canvas" style="display:block;"></canvas>`;
        this.canvas = this.shadowRoot.getElementById('cube-canvas');
    }

    connectedCallback() {
        this.init();
    }

    init() {
        // defined core threejs objects
        const canvas = this.canvas;
        const scene = new Scene();
        const renderer = new WebGLRenderer({
            alpha: true,
            canvas,
            antialias: true,
        });
        renderer.setSize(this.clientWidth, this.clientHeight);
        renderer.setAnimationLoop(animate);
        renderer.setPixelRatio(2);

        //update renderer and camera when container resizes. debouncing events to reduce frequency
        new ResizeObserver(
            debounce((entries) => {
                const { width, height } = entries[0].contentRect;
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
                renderer.setSize(width, height);
            }, 30),
        ).observe(this);

        // add camera
        const camera = new PerspectiveCamera(75, this.clientWidth / this.clientHeight, 0.1, 1000);
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
        const ambientLight = new AmbientLight('white', 0.5);
        const spotLight1 = new DirectionalLight('white', 2);
        const spotLight2 = new DirectionalLight('white', 2);
        const spotLight3 = new DirectionalLight('white', 2);
        const spotLight4 = new DirectionalLight('white', 2);
        spotLight1.position.set(5, 5, 5);
        spotLight2.position.set(-5, 5, 5);
        spotLight3.position.set(5, -5, 0);
        spotLight4.position.set(-10, -5, -5);
        scene.add(ambientLight, spotLight1, spotLight2, spotLight3, spotLight4);

        // create cube and add to scene
        const cube = new Cube({ gap: 1.04 });
        scene.add(cube.group);

        // animation queue
        const animationQueue = new AnimationQueue();

        // initial camera animation
        const cameraAnimationGroup = new Group();
        cameraAnimationGroup.add(new Tween(camera.position).to({ x: 2.5, y: 2.5, z: 4 }, 1000).easing(Easing.Cubic.InOut).start());

        const sendState = () => {
            const state = cube.getStickerState();
            const event = new CustomEvent('state', { detail: { state } });
            this.dispatchEvent(event);
        };

        // animation loop
        function animate() {
            cameraAnimationGroup.update();
            controls.update();
            animationQueue.update();
            if (animationQueue.currentAnimation) {
                scene.add(animationQueue.getAnimationGroup());
            }
            if (animationQueue.finished()) {
                sendState();
                scene.remove(animationQueue.getAnimationGroup());
            }
            renderer.render(scene, camera);
        }

        this.addEventListener('reset', () => {
            animationQueue.clear();
            cube.reset();
            sendState();
        });

        // add event listeners for rotation and camera controls
        this.addEventListener('rotate', (e) => {
            const action = getRotationDetailsFromNotation(e.detail.action);
            if (action !== undefined) {
                const animation = new Animation(cube, action.axis, action.layers, action.direction, 200);
                animationQueue.add(animation);
            }
        });
        this.addEventListener('camera', (e) => {
            if (e.detail.action === 'peek-toggle-horizontal') {
                cameraAnimationGroup.add(
                    new Tween(camera.position)
                        .to(
                            {
                                x: camera.position.x > 0 ? -2.5 : 2.5,
                                y: camera.position.y > 0 ? 2.5 : -2.5,
                                z: 4,
                            },
                            200,
                        )
                        .start(),
                );
            } else if (e.detail.action === 'peek-toggle-vertical') {
                cameraAnimationGroup.add(
                    new Tween(camera.position)
                        .to(
                            {
                                x: camera.position.x > 0 ? 2.5 : -2.5,
                                y: camera.position.y > 0 ? -2.5 : 2.5,
                                z: 4,
                            },
                            200,
                        )
                        .start(),
                );
            } else if (e.detail.action === 'peek-right') {
                cameraAnimationGroup.add(
                    new Tween(camera.position)
                        .to(
                            {
                                x: 2.5,
                                y: camera.position.y > 0 ? 2.5 : -2.5,
                                z: 4,
                            },
                            200,
                        )
                        .start(),
                );
            } else if (e.detail.action === 'peek-left') {
                cameraAnimationGroup.add(
                    new Tween(camera.position)
                        .to(
                            {
                                x: -2.5,
                                y: camera.position.y > 0 ? 2.5 : -2.5,
                                z: 4,
                            },
                            200,
                        )
                        .start(),
                );
            } else if (e.detail.action === 'peek-up') {
                cameraAnimationGroup.add(
                    new Tween(camera.position)
                        .to(
                            {
                                x: camera.position.x > 0 ? 2.5 : -2.5,
                                y: 2.5,
                                z: 4,
                            },
                            200,
                        )
                        .start(),
                );
            } else if (e.detail.action === 'peek-down') {
                cameraAnimationGroup.add(
                    new Tween(camera.position)
                        .to(
                            {
                                x: camera.position.x > 0 ? 2.5 : -2.5,
                                y: -2.5,
                                z: 4,
                            },
                            200,
                        )
                        .start(),
                );
            }
        });
    }
}
customElements.define('rubiks-cube', RubiksCube);
