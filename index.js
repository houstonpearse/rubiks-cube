import { Scene, WebGLRenderer, PerspectiveCamera, AmbientLight, DirectionalLight, Spherical } from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import Cube from './src/cube/cube';
import getRotationDetailsFromNotation from './src/utils/rotation';
import { debounce } from './src/utils/debouncer';
import gsap from 'gsap';

/** @typedef {{ animationStyle: "exponential" | "next" | "fixed" | "match", animationSpeedMs: number, pieceGap: number, cameraSpeedMs: number, cameraRadius: number, cameraPeekAngleHorizontal: number, cameraPeekAngleVertical: number, cameraFieldOfView: number }} Settings */
/** @type {Settings} */
const defaultSettings = {
    animationSpeedMs: 100,
    animationStyle: 'fixed',
    pieceGap: 1.04,
    cameraSpeedMs: 100,
    cameraRadius: 5,
    cameraPeekAngleHorizontal: 0.6,
    cameraPeekAngleVertical: 0.6,
    cameraFieldOfView: 75,
};
const minGap = 1;
const minRadius = 4;
const minFieldOfView = 30;
const maxFieldOfView = 100;
const maxAzimuthAngle = (5 * Math.PI) / 16;
const polarAngleOffset = Math.PI / 2;
const maxPolarAngle = (5 * Math.PI) / 16;

class RubiksCube extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `<canvas id="cube-canvas" style="display:block;"></canvas>`;
        this.canvas = this.shadowRoot.getElementById('cube-canvas');
        /** @type {Settings} */
        this.settings = {
            animationSpeedMs: this.getAttribute('animation-speed-ms') || defaultSettings.animationSpeedMs,
            animationStyle: this.getAttribute('animation-style') || defaultSettings.animationStyle,
            pieceGap: this.getAttribute('piece-gap') || defaultSettings.pieceGap,
            cameraSpeedMs: this.getAttribute('camera-speed-ms') || defaultSettings.cameraSpeedMs,
            cameraRadius: this.getAttribute('camera-radius') || defaultSettings.cameraRadius,
            cameraPeekAngleHorizontal: this.getAttribute('camera-peek-angle-horizontal') || defaultSettings.cameraPeekAngleHorizontal,
            cameraPeekAngleVertical: this.getAttribute('camera-peek-angle-vertical') || defaultSettings.cameraPeekAngleVertical,
            cameraFieldOfView: this.getAttribute('camera-field-of-view') || defaultSettings.cameraFieldOfView,
        };
    }

    static get observedAttributes() {
        return [
            'animation-style',
            'animation-speed-ms',
            'piece-gap',
            'camera-speed-ms',
            'camera-radius',
            'camera-peek-angle-horizontal',
            'camera-peek-angle-vertical',
            'camera-field-of-view',
        ];
    }

    attributeChangedCallback(name, oldVal, newVal) {
        if (name === 'animation-style') {
            this.settings.animationStyle = newVal;
        }
        if (name === 'animation-speed-ms') {
            var speed = Number(newVal);
            this.settings.animationSpeedMs = speed > 0 ? speed : 0;
        }
        if (name === 'piece-gap') {
            var gap = Number(newVal);
            this.settings.pieceGap = gap < minGap ? minGap : gap;
        }
        if (name === 'camera-speed-ms') {
            var speed = Number(newVal);
            this.settings.cameraSpeedMs = speed > 0 ? speed : 0;
        }
        if (name === 'camera-radius') {
            var radius = Number(newVal);
            this.settings.cameraRadius = radius < minRadius ? minRadius : radius;
            if (oldVal !== newVal && oldVal !== null) {
                this.dispatchEvent(new CustomEvent('cameraSettingsChanged'));
            }
        }
        if (name === 'camera-peek-angle-horizontal') {
            var angle = Number(newVal);
            angle = angle > 0 ? angle : 0;
            angle = angle < 1 ? angle : 1;
            this.settings.cameraPeekAngleHorizontal = angle > 0 ? angle : 0;
            if (oldVal !== newVal && oldVal !== null) {
                this.dispatchEvent(new CustomEvent('cameraSettingsChanged'));
            }
        }
        if (name === 'camera-peek-angle-vertical') {
            var angle = Number(newVal);
            angle = angle > 0 ? angle : 0;
            angle = angle < 1 ? angle : 1;
            this.settings.cameraPeekAngleVertical = angle;
            if (oldVal !== newVal && oldVal !== null) {
                this.dispatchEvent(new CustomEvent('cameraSettingsChanged'));
            }
        }
        if (name == 'camera-field-of-view') {
            var fov = Number(newVal);
            fov = fov > minFieldOfView ? fov : minFieldOfView;
            fov = fov < maxFieldOfView ? fov : maxFieldOfView;
            this.settings.cameraFieldOfView = fov;
            if (oldVal !== newVal && oldVal !== null) {
                this.dispatchEvent(new CustomEvent('cameraFieldOfViewChanged'));
            }
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
        const camera = new PerspectiveCamera(this.settings.cameraFieldOfView, this.clientWidth / this.clientHeight, 1, 2000);
        const cameraSpherical = new Spherical(50, (3 * Math.PI) / 8, -Math.PI / 4);
        camera.position.setFromSpherical(cameraSpherical);
        /** @type {{ Up: boolean, Right: boolean }} */
        const cameraState = { Up: true, Right: true };

        // add orbit controls for camera
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableZoom = false;
        controls.enablePan = false;
        controls.enableDamping = true;
        controls.maxAzimuthAngle = maxAzimuthAngle;
        controls.minAzimuthAngle = -maxAzimuthAngle;
        controls.maxPolarAngle = polarAngleOffset + maxPolarAngle;
        controls.minPolarAngle = polarAngleOffset - maxPolarAngle;

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

        const sendState = (eventId) => {
            const event = new CustomEvent('state', { detail: { eventId, state: cube.currentState } });
            this.dispatchEvent(event);
        };

        // animation loop
        function animate() {
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
                updateCameraState(move.action.actionId);
                updateCameraPosition();
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
         * @param {'peek-toggle-horizontal' | 'peek-toggle-vertical' | 'peek-right' | 'peek-left' | 'peek-up' | 'peek-down' } actionId
         */
        const updateCameraState = (actionId) => {
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
        };

        /**
         * @param {number | null} cameraSpeedMs
         * @param {gsap.EaseString | gsap.EaseFunction | undefined} ease
         */
        const updateCameraPosition = (cameraSpeedMs = this.settings.cameraSpeedMs, ease = 'none') => {
            cameraSpeedMs = cameraSpeedMs ? cameraSpeedMs : this.settings.cameraSpeedMs;
            var phi = polarAngleOffset + (cameraState.Up ? -this.settings.cameraPeekAngleVertical : this.settings.cameraPeekAngleVertical) * maxPolarAngle;
            var theta = (cameraState.Right ? this.settings.cameraPeekAngleHorizontal : -this.settings.cameraPeekAngleHorizontal) * maxAzimuthAngle;
            const startSpherical = new Spherical().setFromVector3(camera.position);
            const targetSpherical = new Spherical(this.settings.cameraRadius, phi, theta);
            gsap.to(startSpherical, {
                radius: targetSpherical.radius,
                theta: targetSpherical.theta,
                phi: targetSpherical.phi,
                duration: cameraSpeedMs / 1000,
                ease: ease,
                onUpdate: function () {
                    camera.position.setFromSpherical(startSpherical);
                    camera.lookAt(cube.group.position);
                    controls.update();
                },
            });
        };

        this.addEventListener('cameraSettingsChanged', () => {
            updateCameraPosition(); // animate settings changes
        });

        this.addEventListener('cameraFieldOfViewChanged', () => {
            camera.fov = this.settings.cameraFieldOfView;
            camera.updateProjectionMatrix();
        });

        updateCameraPosition(1000, 'none'); // initial animation
    }
}
customElements.define('rubiks-cube', RubiksCube);
