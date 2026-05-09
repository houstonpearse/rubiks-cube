// @ts-check
/// <reference path="./globals.ts" preserve="true" />
import { AmbientLight, DirectionalLight, PerspectiveCamera, Scene, Spherical, WebGLRenderer } from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { debounce } from './debouncer';
import { gsap } from 'gsap';
import Settings from './settings';
import { CameraState } from './cameraState';
import { RubiksCube } from '../rubiksCube';
import RubiksCube3D from '../rubiksCube3D/rubiksCube3D';
import { AttributeNames, PeekTypes } from './constants';

/** @import {Rotation, Movement, CubeType} from '../core' */
/** @import {PeekType, PeekState, CameraOptions} from './constants' */
/** @import {AnimationOptions} from '../rubiksCube' */

const maxAzimuthAngle = (5 * Math.PI) / 16;
const polarAngleOffset = Math.PI / 2;
const maxPolarAngle = (5 * Math.PI) / 16;
const InternalEvents = Object.freeze({
    cameraRadiusChanged: 'cameraRadiusChanged',
    cameraSettingsChanged: 'cameraSettingsChanged',
    cameraFieldOfViewChanged: 'cameraFieldOfViewChanged',
    cameraPeek: 'cameraPeek',
    cameraPeekComplete: 'cameraPeekComplete',
});

export class RubiksCubeElement extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        const root = /** @type {ShadowRoot} */ (this.shadowRoot);
        root.innerHTML = `<canvas id="cube-canvas" style="display:block;"></canvas>`;
        /** @private @type {HTMLCanvasElement} */
        this.canvas = /** @type {HTMLCanvasElement} */ (root.getElementById('cube-canvas'));
        /** @private @type {Settings} */
        this.settings = new Settings();
        /** @private @type {RubiksCube3D?} */
        this._rubiksCube3D = null;
        /** @private @type {RubiksCube?} */
        this._rubiksCube = null;
    }

    /**
     * @param {string} tagName the name of the tag to register the web component under
     */
    static register(tagName = 'rubiks-cube') {
        customElements.define(tagName, this);
    }

    static get observedAttributes() {
        return [
            AttributeNames.cubeType,
            AttributeNames.pieceGap,
            AttributeNames.animationSpeed,
            AttributeNames.animationStyle,
            AttributeNames.cameraSpeed,
            AttributeNames.cameraRadius,
            AttributeNames.cameraFieldOfView,
            AttributeNames.cameraPeekAngleHorizontal,
            AttributeNames.cameraPeekAngleVertical,
            AttributeNames.logo,
        ];
    }

    connectedCallback() {
        for (const attr of RubiksCubeElement.observedAttributes) {
            if (this.hasAttribute(attr)) {
                this.attributeChangedCallback(attr, null, this.getAttribute(attr));
            }
        }
        this.init();
    }

    /**
     * @param {string} name
     * @param {string?} oldVal
     * @param {string?} newVal
     *  */
    attributeChangedCallback(name, oldVal, newVal) {
        switch (name) {
            case AttributeNames.cubeType:
                this.settings.setCubeType(newVal);
                break;
            case AttributeNames.pieceGap:
                this.settings.setPieceGap(newVal);
                break;
            case AttributeNames.animationSpeed:
                this.settings.setAnimationSpeed(newVal);
                break;
            case AttributeNames.animationStyle:
                this.settings.setAnimationStyle(newVal);
                break;
            case AttributeNames.cameraSpeed:
                this.settings.setCameraSpeed(newVal);
                break;
            case AttributeNames.cameraRadius:
                this.settings.setCameraRadius(newVal);
                if (oldVal !== newVal && oldVal !== null) {
                    this.animateCameraRadius();
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
            case AttributeNames.logo:
                this.settings.setLogo(newVal);
        }
    }

    /** @private */
    animateCameraSetting() {
        this.dispatchEvent(new CustomEvent(InternalEvents.cameraSettingsChanged));
    }

    /** @private */
    animateCameraRadius() {
        this.dispatchEvent(new CustomEvent(InternalEvents.cameraRadiusChanged));
    }

    /** @private */
    updateCameraFOV() {
        this.dispatchEvent(new CustomEvent(InternalEvents.cameraFieldOfViewChanged));
    }

    /** @internal @typedef {{eventId: string, move: Movement, reason: string}} MovementFailedEventData */
    /**
     * @param {Movement} move
     * @param {AnimationOptions} [options]
     * @returns {Promise<string>}
     */
    move(move, options) {
        if (this._rubiksCube == null) {
            return Promise.reject('WebComponent is not initiialised. Please call the .register() method before sending events.');
        }
        return this._rubiksCube.movement(move, options);
    }

    /**
     * @param {Rotation} rotation
     * @param {AnimationOptions} [options]
     * @returns {Promise<string>}
     */
    rotate(rotation, options) {
        if (this._rubiksCube == null) {
            return Promise.reject('WebComponent is not initiialised. Please call the .register() method before sending events.');
        }
        return this._rubiksCube.rotation(rotation, options);
    }

    /**
     * @returns {string}
     */
    reset() {
        if (this._rubiksCube == null) {
            console.error('WebComponent is not initiialised. Please call the .register() method before sending events.');
            return '';
        }
        return this._rubiksCube?.reset();
    }

    /**
     * @param {string} kociembaState
     * @returns {boolean}
     */
    setState(kociembaState) {
        if (this._rubiksCube == null) {
            console.error('WebComponent is not initiialised. Please call the .register() method before sending events.');
            return false;
        }
        return this._rubiksCube?.setState(kociembaState);
    }

    /**
     * @returns {string}
     */
    getState() {
        if (this._rubiksCube == null) {
            console.error('WebComponent is not initiialised. Please call the .register() method before sending events.');
            return '';
        }
        return this._rubiksCube?.getState();
    }

    /**
     * @param {CubeType} cubeType
     * @returns {string}
     */
    setType(cubeType) {
        if (this._rubiksCube == null || this._rubiksCube3D == null) {
            console.error('WebComponent is not initiialised. Please call the .register() method before sending events.');
            return '';
        }
        const success = this._rubiksCube3D.setType(cubeType);
        if (!success) {
            console.error('WebComponent is not initiialised. Please call the .register() method before sending events.');
            return '';
        }
        this.setAttribute(AttributeNames.cubeType, cubeType);
        this._rubiksCube = new RubiksCube(cubeType, this._rubiksCube3D);
        return this._rubiksCube.getState();
    }

    /** @internal @typedef {{eventId: string, peekType: PeekType, options: CameraOptions?}} CameraPeekEventData */
    /** @internal @typedef {{eventId: string, peekState: PeekState }} CameraPeekCompleteEventData */
    /**
     * This function changes the camera position to one of four states depending on the arguments passed.
     *
     * @param {PeekType} peekType
     * @param {CameraOptions?} options
     * @returns {Promise<PeekState>}
     */
    peek(peekType, options = null) {
        if (!Object.values(PeekTypes).includes(peekType)) {
            return Promise.reject(`Invalid move - [${peekType}]. Valid moves are ${Object.values(PeekTypes).join(', ')}`);
        }
        /** @type {CameraPeekEventData} */
        const data = { eventId: crypto.randomUUID(), peekType, options };
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
                this.removeEventListener(InternalEvents.cameraPeekComplete, handler);
                clearTimeout(timeoutId);
            };

            this.addEventListener(InternalEvents.cameraPeekComplete, handler);
            this.dispatchEvent(new CustomEvent(InternalEvents.cameraPeek, { detail: data }));
        });
    }

    /** @private */
    init() {
        this._rubiksCube3D = new RubiksCube3D(this.settings.rubiksCube3DSettings);
        this._rubiksCube = new RubiksCube(this.settings.rubiksCube3DSettings.cubeType, this._rubiksCube3D);

        // defined core threejs objects
        const canvas = this.canvas;
        const scene = new Scene();
        const renderer = new WebGLRenderer({
            alpha: true,
            canvas,
            antialias: true,
        });
        renderer.setSize(this.clientWidth, this.clientHeight);
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
        /**
         * @returns {Spherical}
         */
        const cameraState = new CameraState();
        const getTargetCameraSpherical = () => {
            const phi = polarAngleOffset + (cameraState.Up ? -this.settings.cameraPeekAngleVertical : this.settings.cameraPeekAngleVertical) * maxPolarAngle;
            const theta = (cameraState.Right ? this.settings.cameraPeekAngleHorizontal : -this.settings.cameraPeekAngleHorizontal) * maxAzimuthAngle;
            return new Spherical(this.settings.cameraRadius, phi, theta);
        };
        const camera = new PerspectiveCamera(this.settings.cameraFieldOfView, this.clientWidth / this.clientHeight, 1, 2000);
        const cameraSpherical = getTargetCameraSpherical();
        camera.position.setFromSpherical(cameraSpherical);

        // add orbit controls for camera
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableZoom = false;
        controls.enablePan = false;
        controls.enableDamping = true;

        // add lighting to scene
        const ambientLight = new AmbientLight('white', 0.4);
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
        const cube = this._rubiksCube3D;
        scene.add(cube);

        // animation loop
        function animate() {
            controls.update();
            renderer.render(scene, camera);
        }

        renderer.setAnimationLoop(animate);

        // Camera Events

        /**
         * @param {Spherical} targetSpherical
         * @param {number} cameraSpeedMs
         * @param {gsap.EaseString | gsap.EaseFunction | undefined} ease
         * @param { undefined | (() => void) } completedCallback
         */
        const updateCameraPosition = (targetSpherical, cameraSpeedMs, ease, completedCallback = undefined) => {
            const startSpherical = new Spherical().setFromVector3(camera.position);
            gsap.to(startSpherical, {
                radius: targetSpherical.radius,
                theta: targetSpherical.theta,
                phi: targetSpherical.phi,
                duration: (cameraSpeedMs ? cameraSpeedMs : this.settings.cameraSpeedMs) / 1000,
                ease: ease,
                overwrite: false,
                onUpdate: () => {
                    camera.position.setFromSpherical(startSpherical);
                    camera.lookAt(cube.position);
                    controls.update();
                },
                onComplete: completedCallback,
            });
        };

        this.addEventListener(InternalEvents.cameraPeek, (event) => {
            const customEvent = /** @type {CustomEvent<CameraPeekEventData>} */ (event);
            cameraState.peekCamera(customEvent.detail.peekType);
            /** @type {CameraPeekCompleteEventData} */
            const data = { eventId: customEvent.detail.eventId, peekState: cameraState.toPeekState() };
            const completedCallback = () => this.dispatchEvent(new CustomEvent(InternalEvents.cameraPeekComplete, { detail: data }));
            const targetSpherical = getTargetCameraSpherical();
            updateCameraPosition(targetSpherical, customEvent.detail.options?.cameraSpeedMs ?? this.settings.cameraSpeedMs, 'none', completedCallback);
        });

        this.addEventListener(InternalEvents.cameraSettingsChanged, () => {
            const targetSpherical = getTargetCameraSpherical();
            updateCameraPosition(targetSpherical, this.settings.cameraSpeedMs, 'none');
        });

        this.addEventListener(InternalEvents.cameraRadiusChanged, () => {
            const targetSpherical = new Spherical().setFromVector3(camera.position);
            targetSpherical.radius = this.settings.cameraRadius;
            updateCameraPosition(targetSpherical, this.settings.cameraSpeedMs, 'none');
        });

        this.addEventListener(InternalEvents.cameraFieldOfViewChanged, () => {
            camera.fov = this.settings.cameraFieldOfView;
            camera.updateProjectionMatrix();
        });
    }
}
