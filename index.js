import { Scene, WebGLRenderer, PerspectiveCamera, AmbientLight, DirectionalLight, Spherical } from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import Cube from './src/cube/cube';
import getRotationDetailsFromNotation from './src/cube/rotation';
import { debounce } from './src/debouncer';
import gsap from 'gsap';
import Settings from './src/settings';
import CubeSettings from './src/cube/cubeSettings';

const maxAzimuthAngle = (5 * Math.PI) / 16;
const polarAngleOffset = Math.PI / 2;
const maxPolarAngle = (5 * Math.PI) / 16;
const AttributeNames = {
    /** @type {"piece-gap"} */
    pieceGap: 'piece-gap',
    /** @type {"animation-speed-ms"} */
    animationSpeed: 'animation-speed-ms',
    /** @type {"animation-style"} */
    animationStyle: 'animation-style',
    /** @type {"camera-speed-ms"} */
    cameraSpeed: 'camera-speed-ms',
    /** @type {"camera-radius"} */
    cameraRadius: 'camera-radius',
    /** @type {"camera-field-of-view"} */
    cameraFieldOfView: 'camera-field-of-view',
    /** @type {"camera-peek-angle-horizontal"} */
    cameraPeekAngleHorizontal: 'camera-peek-angle-horizontal',
    /** @type {"camera-peek-angle-vertical"} */
    cameraPeekAngleVertical: 'camera-peek-angle-vertical',
};

class RubiksCube extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `<canvas id="cube-canvas" style="display:block;"></canvas>`;
        this.canvas = this.shadowRoot.getElementById('cube-canvas');
        /** @type {Settings} */
        this.settings = new Settings();
        this.settings.setPieceGap(this.getAttribute(AttributeNames.pieceGap));
        this.settings.setAnimationSpeed(this.getAttribute(AttributeNames.animationSpeed));
        this.settings.setAnimationStyle(this.getAttribute(AttributeNames.animationStyle));
        this.settings.setCameraSpeed(this.getAttribute(AttributeNames.cameraSpeed));
        this.settings.setCameraRadius(this.getAttribute(AttributeNames.cameraRadius));
        this.settings.setCameraFieldOfView(this.getAttribute(AttributeNames.cameraFieldOfView));
        this.settings.setCameraPeekAngleHorizontal(this.getAttribute(AttributeNames.cameraPeekAngleHorizontal));
        this.settings.setCameraPeekAngleVertical(this.getAttribute(AttributeNames.cameraPeekAngleVertical));
        this.cubeSettings = new CubeSettings(this.settings.pieceGap, this.settings.animationSpeedMs, this.settings.animationStyle);
    }

    static get observedAttributes() {
        return [
            AttributeNames.pieceGap,
            AttributeNames.animationSpeed,
            AttributeNames.animationStyle,
            AttributeNames.cameraSpeed,
            AttributeNames.cameraRadius,
            AttributeNames.cameraFieldOfView,
            AttributeNames.cameraPeekAngleHorizontal,
            AttributeNames.cameraPeekAngleVertical,
        ];
    }

    /**
     * @param {string} name
     * @param {string} oldVal
     * @param {string} newVal
     *  */
    attributeChangedCallback(name, oldVal, newVal) {
        switch (name) {
            case AttributeNames.pieceGap:
                this.settings.setPieceGap(newVal);
                this.cubeSettings.pieceGap = this.settings.pieceGap;
                break;
            case AttributeNames.animationSpeed:
                this.settings.setAnimationSpeed(newVal);
                this.cubeSettings.animationSpeedMs = this.settings.animationSpeedMs;
                break;
            case AttributeNames.animationStyle:
                this.settings.setAnimationStyle(newVal);
                this.cubeSettings.animationStyle = this.settings.animationStyle;
                break;
            case AttributeNames.cameraSpeed:
                this.settings.setCameraSpeed(newVal);
                break;
            case AttributeNames.cameraRadius:
                this.settings.setCameraRadius(newVal);
                if (oldVal !== newVal && oldVal !== null) {
                    this.animateCameraSetting();
                }
                break;
            case AttributeNames.cameraFieldOfView:
                this.settings.setCameraFieldOfView(newVal);
                if (oldVal !== newVal && oldVal !== null) {
                    this.updateCameraFOV();
                }
                break;
            case AttributeNames.cameraPeekAngleHorizontal:
                this.settings.setCameraPeekAngleHorizontal(newVal);
                if (oldVal !== newVal && oldVal !== null) {
                    this.animateCameraSetting();
                }
                break;
            case AttributeNames.cameraPeekAngleVertical:
                this.settings.setCameraPeekAngleVertical(newVal);
                if (oldVal !== newVal && oldVal !== null) {
                    this.animateCameraSetting();
                }
                break;
        }
    }

    connectedCallback() {
        this.init();
    }

    animateCameraSetting() {
        this.dispatchEvent(new CustomEvent('cameraSettingsChanged'));
    }

    updateCameraFOV() {
        this.dispatchEvent(new CustomEvent('cameraFieldOfViewChanged'));
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
        renderer.setPixelRatio(window.devicePixelRatio);

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
        const cube = new Cube(this.cubeSettings);
        scene.add(cube.group, cube.rotationGroup);

        /** @param {string} eventId  */
        const sendState = (eventId) => {
            const event = new CustomEvent('state', { detail: { eventId, state: cube.kociembaState } });
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
            /**  @type {CustomEvent<{ move: {eventId: string, action: {type: "movement" | "camera" | "rotation", actionId: string }}}>} event */
            const event = /** @type {any} */ (e);
            const actionEvent = event.detail.move;
            if (actionEvent.action.type === 'camera') {
                updateCameraState(actionEvent.action.actionId);
                updateCameraPosition();
                return;
            }
            if (actionEvent.action.type === 'movement' || actionEvent.action.type === 'rotation') {
                handleRotationAction(actionEvent.eventId, actionEvent.action.actionId);
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

        updateCameraPosition(1000, 'power4.inOut'); // initial animation
    }
}
customElements.define('rubiks-cube', RubiksCube);
