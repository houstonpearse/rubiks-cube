import { Scene, WebGLRenderer, PerspectiveCamera, AmbientLight, DirectionalLight } from 'three';
import { Tween, Group, Easing } from '@tweenjs/tween.js';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import Cube from './src/cube/cube';
import getRotationDetailsFromNotation from './src/utils/rotation';
import { debounce } from './src/utils/debouncer';

const defaultAnimationSpeed = 100;
const defaultCameraSpeed = 100;
const defaultAnimationStyle = 'fixed';
const defaultGap = 1.04;
const minimumGap = 1;

class RubiksCube extends HTMLElement {
    constructor() {
        super();
        /** @type {number} */
        this.animationSpeed = defaultAnimationSpeed;
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `<canvas id="cube-canvas" style="display:block;"></canvas>`;
        this.canvas = this.shadowRoot.getElementById('cube-canvas');
        /** @type {{animationStyle: "exponential" | "next" | "fixed" | "match", animationSpeed: number, gap: number, cameraSpeed: number}} */
        this.settings = {
            animationSpeed: this.getAttribute('animation-speed') || defaultAnimationSpeed,
            animationStyle: this.getAttribute('animation-style') || defaultAnimationStyle,
            gap: this.getAttribute('piece-gap') || defaultGap,
            cameraSpeed: this.getAttribute('camera-speed') || defaultCameraSpeed,
        };
    }

    static get observedAttributes() {
        return ['animation-style', 'animation-speed', 'piece-gap', 'camera-speed'];
    }

    attributeChangedCallback(name, oldVal, newVal) {
        if (name === 'animation-style') {
            this.settings.animationStyle = newVal;
        }
        if (name === 'animation-speed') {
            var speed = Number(newVal);
            this.settings.animationSpeed = speed > 0 ? speed : 0;
        }
        if (name === 'piece-gap') {
            var gap = Number(newVal);
            this.settings.gap = gap < minimumGap ? minimumGap : gap;
        }
        if (name === 'camera-speed') {
            var speed = Number(newVal);
            this.settings.cameraSpeed = speed > 0 ? speed : 0;
        }
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
        /** @type {{Up: boolean, Right: boolean, UpDistance: number, RightDistance: number}} */
        const cameraState = { Up: true, Right: true, UpDistance: 2.5, RightDistance: 2.5 };
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
        const cube = new Cube(this.settings);
        scene.add(cube.group, cube.rotationGroup);

        // initial camera animation
        const cameraAnimationGroup = new Group();
        cameraAnimationGroup.add(new Tween(camera.position).to({ x: 2.5, y: 2.5, z: 4 }, 1000).easing(Easing.Cubic.InOut).start());

        const sendState = (eventId) => {
            const event = new CustomEvent('state', { detail: { eventId, state: cube.currentState } });
            this.dispatchEvent(event);
        };

        // animation loop
        function animate() {
            cameraAnimationGroup.update();
            controls.update();

            var eventId = cube.update();
            if (eventId) {
                sendState(eventId);
            }
            renderer.render(scene, camera);
        }

        // add event listeners for rotation and camera controls
        this.addEventListener('reset', () => {
            cube.reset();
            sendState('reset');
        });

        this.addEventListener('action', (e) => {
            /**  @type {{eventId: string, action: {type: "movement" | "camera" | "rotation", actionId: string }}} move */
            var move = e.detail.move;
            if (move.action.type === 'camera') {
                handleCameraAction(move.action.actionId);
                return;
            }
            if (move.action.type === 'movement' || move.action.type === 'rotation') {
                handleRotationAction(move.eventId, move.action.actionId);
                return;
            }
        });

        /**
         * @param {string} eventId
         * @param {string} actionId
         */
        const handleRotationAction = (eventId, actionId) => {
            const rotationDetails = getRotationDetailsFromNotation(actionId);
            if (rotationDetails !== undefined) {
                cube.rotate(eventId, rotationDetails);
            }
        };

        /**
         * @param {'peek-toggle-horizontal' | 'peek-toggle-vertical' | 'peek-right' | 'peek-left' | 'peek-up' | 'peek-down'} actionId
         */
        const handleCameraAction = (actionId) => {
            if (actionId === 'peek-toggle-horizontal') {
                cameraState.Right = !cameraState.Right;
            } else if (actionId === 'peek-toggle-vertical') {
                cameraState.Up = !cameraState.Up;
            } else if (actionId === 'peek-right') {
                cameraState.Right = true;
            } else if (actionId === 'peek-left') {
                cameraState.Right = false;
            } else if (actionId === 'peek-up') {
                cameraState.Up = true;
            } else if (actionId === 'peek-down') {
                cameraState.Up = false;
            }
            cameraAnimationGroup.add(
                new Tween(camera.position)
                    .to(
                        {
                            x: cameraState.Right ? cameraState.RightDistance : -cameraState.RightDistance,
                            y: cameraState.Up ? cameraState.UpDistance : -cameraState.UpDistance,
                            z: 4,
                        },
                        this.settings.cameraSpeed,
                    )
                    .start(),
            );
        };
    }
}
customElements.define('rubiks-cube', RubiksCube);
