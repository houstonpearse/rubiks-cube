// @ts-check
import { Scene, WebGLRenderer, PerspectiveCamera, AmbientLight, DirectionalLight, Spherical } from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import Cube from './cube/cube';
import getRotationDetailsFromNotation from './cube/rotation';
import { debounce } from './debouncer';
import gsap from 'gsap';
import Settings from './settings';
import CubeSettings from './cube/cubeSettings';
import { CameraState } from './cameraState';
import { AttributeNames } from './schema';

const maxAzimuthAngle = (5 * Math.PI) / 16;
const polarAngleOffset = Math.PI / 2;
const maxPolarAngle = (5 * Math.PI) / 16;

class RubiksCube extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        const root = /** @type {ShadowRoot} */ (this.shadowRoot);
        root.innerHTML = `<canvas id="cube-canvas" style="display:block;"></canvas>`;
        /** @type {HTMLCanvasElement} */
        this.canvas = /** @type {HTMLCanvasElement} */ (root.getElementById('cube-canvas'));
        /** @type {Settings} */
        this.settings = new Settings();
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
        if (this.hasAttribute(AttributeNames.pieceGap)) {
            this.settings.setPieceGap(this.getAttribute(AttributeNames.pieceGap));
            this.cubeSettings.pieceGap = this.settings.pieceGap;
        }
        if (this.hasAttribute(AttributeNames.animationSpeed)) {
            this.settings.setAnimationSpeed(this.getAttribute(AttributeNames.animationSpeed));
            this.cubeSettings.animationSpeedMs = this.settings.animationSpeedMs;
        }
        if (this.hasAttribute(AttributeNames.animationStyle)) {
            this.settings.setAnimationStyle(this.getAttribute(AttributeNames.animationStyle));
            this.cubeSettings.animationStyle = this.settings.animationStyle;
        }
        if (this.hasAttribute(AttributeNames.cameraSpeed)) {
            this.settings.setCameraSpeed(this.getAttribute(AttributeNames.cameraSpeed));
        }
        if (this.hasAttribute(AttributeNames.cameraRadius)) {
            this.settings.setCameraRadius(this.getAttribute(AttributeNames.cameraRadius));
        }
        if (this.hasAttribute(AttributeNames.cameraFieldOfView)) {
            this.settings.setCameraFieldOfView(this.getAttribute(AttributeNames.cameraFieldOfView));
        }
        if (this.hasAttribute(AttributeNames.cameraPeekAngleHorizontal)) {
            this.settings.setCameraPeekAngleHorizontal(this.getAttribute(AttributeNames.cameraPeekAngleHorizontal));
        }
        if (this.hasAttribute(AttributeNames.cameraPeekAngleVertical)) {
            this.settings.setCameraPeekAngleVertical(this.getAttribute(AttributeNames.cameraPeekAngleVertical));
        }
        this.init();
    }

    animateCameraSetting() {
        this.dispatchEvent(new CustomEvent('cameraSettingsChanged'));
    }

    updateCameraFOV() {
        this.dispatchEvent(new CustomEvent('cameraFieldOfViewChanged'));
    }

    /** @import {Movement} from './core' */
    /** @typedef {{eventId: string, move: Movement}} MovementEvent */
    /** @typedef {{eventId: string, move: Movement, state: string}} MovementCompleteEventData */
    /**
     * @param {Movement} move
     * @returns {Promise<string>}
     */
    move(move) {
        /** @type {MovementEvent} */
        const data = { eventId: crypto.randomUUID(), move };
        this.dispatchEvent(new CustomEvent('movement', { detail: data }));
        return new Promise((resolve, reject) => {
            this.addEventListener('movementComplete', (event) => {
                const customEvent = /** @type {CustomEvent<MovementCompleteEventData>} */ (event);
                if (customEvent.detail.eventId === data.eventId) {
                    resolve(customEvent.detail.state);
                }
            });
            setTimeout(() => {
                reject('move timed out');
            }, 1000);
        });
    }

    /** @import {Rotation} from './core' */
    /** @typedef {{eventId: string, rotation: Rotation}} RotationEventData */
    /** @typedef {{eventId: string, rotation: Rotation, state: string}} RotationCompleteEventData*/
    /**
     * @param {Rotation} rotation
     * @returns {Promise<string>}
     */
    rotate(rotation) {
        /** @type {RotationEventData} */
        const data = { eventId: crypto.randomUUID(), rotation };
        this.dispatchEvent(new CustomEvent('rotation', { detail: data }));
        return new Promise((resolve, reject) => {
            this.addEventListener('rotationComplete', (event) => {
                const customEvent = /** @type {CustomEvent<RotationCompleteEventData>} */ (event);
                if (customEvent.detail.eventId === data.eventId) {
                    resolve(customEvent.detail.state);
                }
            });
            setTimeout(() => {
                reject('rotate timed out');
            }, 1000);
        });
    }

    /** @import {PeekType} from './core' */
    /** @typedef {{eventId: string, peekType: PeekType}} CameraPeekEventData */
    /** @import {PeekState} from './core' */
    /** @typedef {{eventId: string, peekState: PeekState }} CameraPeekCompleteEventData */
    /**
     * @param {PeekType} peekType
     * @returns {Promise<PeekState>}
     */
    peek(peekType) {
        /** @type {CameraPeekEventData} */
        const data = { eventId: crypto.randomUUID(), peekType };
        this.dispatchEvent(new CustomEvent('cameraPeek', { detail: data }));
        return new Promise((resolve, reject) => {
            /** @param {CustomEvent<CameraPeekCompleteEventData> | Event} event */ const handler = (event) => {
                const customEvent = /** @type {CustomEvent<CameraPeekCompleteEventData>} */ (event);
                if (customEvent.detail.eventId === data.eventId) {
                    cleanup();
                    resolve(customEvent.detail.peekState);
                }
            };

            const timeoutId = setTimeout(() => {
                cleanup();
                reject('peek timed out');
            }, 1000);

            const cleanup = () => {
                this.removeEventListener('cameraPeekComplete', handler);
                clearTimeout(timeoutId);
            };

            this.addEventListener('cameraPeekComplete', handler);
        });
    }

    /** @typedef {{state: string, peekState: PeekState}} ResetCompleteEventData */
    /**
     * @returns {Promise<string>}
     */
    reset() {
        this.dispatchEvent(new CustomEvent('reset'));
        return new Promise((resolve, reject) => {
            this.addEventListener('resetComplete', (event) => {
                const customEvent = /** @type {CustomEvent<ResetCompleteEventData>} */ (event);
                resolve(customEvent.detail.peekState);
            });
            setTimeout(() => {
                reject('reset timed out');
            }, 1000);
        });
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
            debounce((/** @type {{ contentRect: { width: number; height: number; }; }[]} */ entries) => {
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
        const cameraState = new CameraState();

        // add orbit controls for camera
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableZoom = false;
        controls.enablePan = false;
        controls.enableDamping = true;
        // controls.maxAzimuthAngle = maxAzimuthAngle;
        // controls.minAzimuthAngle = -maxAzimuthAngle;
        // controls.maxPolarAngle = polarAngleOffset + maxPolarAngle;
        // controls.minPolarAngle = polarAngleOffset - maxPolarAngle;

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
         * @param {number} cameraSpeedMs
         * @param {gsap.EaseString | gsap.EaseFunction | undefined} ease
         * @param { undefined | (() => void) } completedCallback
         */
        const updateCameraPosition = (cameraSpeedMs, ease, completedCallback = undefined) => {
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
                overwrite: false,
                onUpdate: () => {
                    camera.position.setFromSpherical(startSpherical);
                    camera.lookAt(cube.group.position);
                    controls.update();
                },
                onComplete: completedCallback,
            });
        };

        // add event listeners for rotation and camera controls
        this.addEventListener('cameraPeek', (event) => {
            const customEvent = /** @type {CustomEvent<CameraPeekEventData>} */ (event);
            cameraState.peekCamera(customEvent.detail.peekType);
            /** @type {CameraPeekCompleteEventData} */
            const data = { eventId: customEvent.detail.eventId, peekState: cameraState.toPeekState() };
            const completedCallback = () => this.dispatchEvent(new CustomEvent('cameraPeekComplete', { detail: data }));
            updateCameraPosition(this.settings.cameraSpeedMs, 'none', completedCallback);
        });

        this.addEventListener('rotation', (event) => {
            const customEvent = /** @type {CustomEvent<RotationEventData>} */ (event);
            handleRotationAction(customEvent.detail.eventId, customEvent.detail.rotation);
        });

        this.addEventListener('movement', (event) => {
            const customEvent = /** @type {CustomEvent<MovementEvent>} */ (event);
            handleRotationAction(customEvent.detail.eventId, customEvent.detail.move);
        });

        this.addEventListener('reset', () => {
            cube.reset();
            sendState('reset');
        });

        this.addEventListener('cameraSettingsChanged', () => {
            updateCameraPosition(this.settings.cameraSpeedMs, 'none');
        });

        this.addEventListener('cameraFieldOfViewChanged', () => {
            camera.fov = this.settings.cameraFieldOfView;
            camera.updateProjectionMatrix();
        });

        updateCameraPosition(1000, 'power4.inOut'); // initial animation
    }
}
customElements.define('rubiks-cube', RubiksCube);

export { RubiksCube };
