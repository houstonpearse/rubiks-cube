// @ts-check
/// <reference path="./globals.ts" preserve="true" />
import { Scene, PerspectiveCamera, AmbientLight, DirectionalLight, Spherical, WebGLRenderer } from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import RubiksCube3D from './cube/cube';
import { debounce } from './debouncer';
import { gsap } from 'gsap';
import Settings from './settings';
import CubeSettings from './cube/cubeSettings';
import { CameraState } from './camera/cameraState';
import { AttributeNames } from './schema';
import { Movements, PeekTypes, Rotations } from './core';
import RubiksCube3D from './three/cube';

const maxAzimuthAngle = (5 * Math.PI) / 16;
const polarAngleOffset = Math.PI / 2;
const maxPolarAngle = (5 * Math.PI) / 16;

const InternalEvents = Object.freeze({
    rotation: 'rotation',
    rotationComplete: 'rotationComplete',
    rotationFailed: 'rotationFailed',
    movement: 'movement',
    movementComplete: 'movementComplete',
    movementFailed: 'movementFailed',
    reset: 'reset',
    resetComplete: 'resetComplete',
    cameraRadiusChanged: 'cameraRadiusChanged',
    cameraSettingsChanged: 'cameraSettingsChanged',
    cameraFieldOfViewChanged: 'cameraFieldOfViewChanged',
    cameraPeek: 'cameraPeek',
    cameraPeekComplete: 'cameraPeekComplete',
    setState: 'setState',
    setStateComplete: 'setStateComplete',
    setStateFailed: 'setStateFailed',
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
        /** @private @type {CubeSettings} */
        this.cubeSettings = new CubeSettings(this.settings.pieceGap, this.settings.animationSpeedMs, this.settings.animationStyle, this.settings.cubeType);
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
        ];
    }

    /**
     * @param {string} name
     * @param {string} oldVal
     * @param {string} newVal
     *  */
    attributeChangedCallback(name, oldVal, newVal) {
        switch (name) {
            case AttributeNames.cubeType:
                this.settings.setCubeType(newVal);
                this.cubeSettings.cubeType = this.settings.cubeType;
                break;
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
        }
    }

    connectedCallback() {
        if (this.hasAttribute(AttributeNames.cubeType)) {
            this.settings.setCubeType(this.getAttribute(AttributeNames.cubeType));
            this.cubeSettings.cubeType = this.settings.cubeType;
        }
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

    /** @import {Movement} from './core' */
    /** @internal @typedef {{eventId: string, move: Movement}} MovementEvent */
    /** @internal @typedef {{eventId: string, move: Movement, state: string}} MovementCompleteEventData */
    /** @internal @typedef {{eventId: string, move: Movement, reason: string}} MovementFailedEventData */
    /**
     * @param {Movement} move
     * @returns {Promise<string>}
     */
    move(move) {
        if (!Object.values(Movements).includes(move)) {
            return Promise.reject(`Invalid move - [${move}]. Valid moves are ${Object.values(Movements).join(', ')}`);
        }
        /** @type {MovementEvent} */
        const data = { eventId: crypto.randomUUID(), move };
        return new Promise((resolve, reject) => {
            /** @param {CustomEvent<MovementCompleteEventData> | Event} event */
            const completedHandler = (event) => {
                const customEvent = /** @type {CustomEvent<MovementCompleteEventData>} */ (event);
                if (customEvent.detail.eventId === data.eventId) {
                    cleanup();
                    resolve(customEvent.detail.state);
                }
            };

            /** @param {CustomEvent<MovementFailedEventData> | Event} event */
            const failedHandler = (event) => {
                const customEvent = /** @type {CustomEvent<MovementFailedEventData>} */ (event);
                if (customEvent.detail.eventId === data.eventId) {
                    cleanup();
                    reject(customEvent.detail.reason);
                }
            };

            const timeoutId = setTimeout(
                () => {
                    cleanup();
                    reject('movement timed out');
                },
                Math.max(this.settings.animationSpeedMs * 100, 100),
            );

            const cleanup = () => {
                this.removeEventListener(InternalEvents.movementComplete, completedHandler);
                this.removeEventListener(InternalEvents.movementFailed, failedHandler);
                clearTimeout(timeoutId);
            };

            this.addEventListener(InternalEvents.movementComplete, completedHandler);
            this.addEventListener(InternalEvents.movementFailed, failedHandler);
            this.dispatchEvent(new CustomEvent(InternalEvents.movement, { detail: data }));
        });
    }

    /** @import {Rotation} from './core' */
    /** @internal @typedef {{eventId: string, rotation: Rotation}} RotationEventData */
    /** @internal @typedef {{eventId: string, rotation: Rotation, state: string, }} RotationCompleteEventData*/
    /** @internal @typedef {{eventId: string, rotation: Rotation, reason: string, }} RotationFailedEventData*/
    /**
     * @param {Rotation} rotation
     * @returns {Promise<string>}
     */
    rotate(rotation) {
        if (!Object.values(Rotations).includes(rotation)) {
            return Promise.reject(`Invalid move - [${rotation}]. Valid moves are ${Object.values(Rotations).join(', ')}`);
        }
        /** @type {RotationEventData} */
        const data = { eventId: crypto.randomUUID(), rotation };
        return new Promise((resolve, reject) => {
            /** @param {CustomEvent<RotationCompleteEventData> | Event} event */
            const completeHanlder = (event) => {
                const customEvent = /** @type {CustomEvent<RotationCompleteEventData>} */ (event);
                if (customEvent.detail.eventId === data.eventId) {
                    cleanup();
                    resolve(customEvent.detail.state);
                }
            };

            /** @param {CustomEvent<RotationFailedEventData> | Event} event */
            const failedHandler = (event) => {
                const customEvent = /** @type {CustomEvent<RotationFailedEventData>} */ (event);
                if (customEvent.detail.eventId === data.eventId) {
                    cleanup();
                    reject(customEvent.detail.reason);
                }
            };

            const timeoutId = setTimeout(
                () => {
                    cleanup();
                    reject('rotation timed out');
                },
                Math.max(this.settings.animationSpeedMs * 100, 100),
            );

            const cleanup = () => {
                this.removeEventListener(InternalEvents.rotationComplete, completeHanlder);
                this.removeEventListener(InternalEvents.rotationFailed, failedHandler);
                clearTimeout(timeoutId);
            };

            this.addEventListener(InternalEvents.rotationComplete, completeHanlder);
            this.addEventListener(InternalEvents.rotationFailed, failedHandler);
            this.dispatchEvent(new CustomEvent(InternalEvents.rotation, { detail: data }));
        });
    }

    /** @internal @typedef {{state: string }} ResetCompleteEventData */
    /**
     * @returns {Promise<string>}
     */
    reset() {
        return new Promise((resolve, reject) => {
            /** @param {CustomEvent<ResetCompleteEventData> | Event} event */
            const handler = (event) => {
                const customEvent = /** @type {CustomEvent<ResetCompleteEventData>} */ (event);
                cleanup();
                resolve(customEvent.detail.state);
            };

            const timeoutId = setTimeout(() => {
                cleanup();
                reject('reset timed out');
            }, 1000);

            const cleanup = () => {
                this.removeEventListener(InternalEvents.resetComplete, handler);
                clearTimeout(timeoutId);
            };

            this.addEventListener(InternalEvents.resetComplete, handler);
            this.dispatchEvent(new CustomEvent(InternalEvents.reset));
        });
    }

    /** @import {PeekType} from './core' */
    /** @internal @typedef {{eventId: string, peekType: PeekType}} CameraPeekEventData */
    /** @import {PeekState} from './core' */
    /** @internal @typedef {{eventId: string, peekState: PeekState }} CameraPeekCompleteEventData */
    /**
     * This function changes the camera position to one of four states depending on the arguments passed.
     *
     * @param {PeekType} peekType
     * @returns {Promise<PeekState>}
     */
    peek(peekType) {
        if (!Object.values(PeekTypes).includes(peekType)) {
            return Promise.reject(`Invalid move - [${peekType}]. Valid moves are ${Object.values(PeekTypes).join(', ')}`);
        }
        /** @type {CameraPeekEventData} */
        const data = { eventId: crypto.randomUUID(), peekType };
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

    /** @internal @typedef {{state: string }} SetStateEventData */
    /** @internal @typedef {{state: string }} SetStateCompleteEventData */
    /** @internal @typedef {{reason: string }} SetStateFailedEventData */
    /**
     * @param {string} kociembaState
     * @returns {Promise<string>}
     */
    setState(kociembaState) {
        const data = /** @type {SetStateEventData} */ ({ state: kociembaState });
        return new Promise((resolve, reject) => {
            /** @param {CustomEvent<SetStateCompleteEventData> | Event} event */
            const handler = (event) => {
                const customEvent = /** @type {CustomEvent<SetStateCompleteEventData>} */ (event);
                cleanup();
                resolve(customEvent.detail.state);
            };
            /** @param {CustomEvent<SetStateFailedEventData> | Event} event */
            const failedHandler = (event) => {
                const customEvent = /** @type {CustomEvent<SetStateFailedEventData>} */ (event);
                cleanup();
                reject(customEvent.detail.reason);
            };

            const timeoutId = setTimeout(() => {
                cleanup();
                reject('SetState timed out');
            }, 1000);

            const cleanup = () => {
                this.removeEventListener(InternalEvents.setStateComplete, handler);
                this.removeEventListener(InternalEvents.setStateFailed, failedHandler);
                clearTimeout(timeoutId);
            };

            this.addEventListener(InternalEvents.setStateComplete, handler);
            this.addEventListener(InternalEvents.setStateFailed, failedHandler);
            this.dispatchEvent(new CustomEvent(InternalEvents.setState, { detail: data }));
        });
    }

    /** @private */
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
        //const cube = new RubiksCube3D(this.cubeSettings);
        const cube = new RubiksCube3D(this.cubeSettings);
        scene.add(cube);

        // animation loop
        function animate() {
            controls.update();
            cube.update();
            renderer.render(scene, camera);
        }
        renderer.setAnimationLoop(animate);

        // Cube Events
        this.addEventListener(InternalEvents.rotation, (event) => {
            const customEvent = /** @type {CustomEvent<RotationEventData>} */ (event);
            const completedCallback = (/** @type {string} */ state) =>
                this.dispatchEvent(
                    new CustomEvent(InternalEvents.rotationComplete, {
                        detail: /** @type {RotationCompleteEventData} */ ({
                            eventId: customEvent.detail.eventId,
                            state: state,
                            rotation: customEvent.detail.rotation,
                        }),
                    }),
                );
            const failedCallback = (/** @type {string} */ reason) =>
                this.dispatchEvent(
                    new CustomEvent(InternalEvents.rotationFailed, {
                        detail: /** @type {RotationFailedEventData} */ ({
                            eventId: customEvent.detail.eventId,
                            reason: reason,
                            rotation: customEvent.detail.rotation,
                        }),
                    }),
                );
            cube.rotate(customEvent.detail.rotation, completedCallback, failedCallback);
        });

        this.addEventListener(InternalEvents.movement, (event) => {
            const customEvent = /** @type {CustomEvent<MovementEvent>} */ (event);
            const completedCallback = (/** @type {string} */ state) =>
                this.dispatchEvent(
                    new CustomEvent(InternalEvents.movementComplete, {
                        detail: /** @type {MovementCompleteEventData} */ ({
                            eventId: customEvent.detail.eventId,
                            state: state,
                            move: customEvent.detail.move,
                        }),
                    }),
                );
            const failedCallback = (/** @type {string} */ reason) =>
                this.dispatchEvent(
                    new CustomEvent(InternalEvents.movementFailed, {
                        detail: /** @type {MovementFailedEventData} */ ({
                            eventId: customEvent.detail.eventId,
                            reason: reason,
                            move: customEvent.detail.move,
                        }),
                    }),
                );
            cube.movement(customEvent.detail.move, completedCallback, failedCallback);
        });

        this.addEventListener(InternalEvents.reset, () => {
            const completedCallback = (/** @type {string} */ state) =>
                this.dispatchEvent(
                    new CustomEvent(InternalEvents.resetComplete, {
                        detail: /** @type {ResetCompleteEventData} */ ({
                            state: state,
                        }),
                    }),
                );
            cube.reset(completedCallback);
        });

        this.addEventListener(InternalEvents.setState, (event) => {
            const customEvent = /** @type {CustomEvent<SetStateEventData>} */ (event);
            const completedCallback = (/** @type {string} */ state) =>
                this.dispatchEvent(
                    new CustomEvent(InternalEvents.setStateComplete, {
                        detail: /** @type {SetStateCompleteEventData} */ ({
                            state: state,
                        }),
                    }),
                );
            const failedCallback = (/** @type {string} */ reason) =>
                this.dispatchEvent(
                    new CustomEvent(InternalEvents.setStateFailed, {
                        detail: /** @type {SetStateFailedEventData} */ ({
                            reason: reason,
                        }),
                    }),
                );
            cube.setState(customEvent.detail.state, completedCallback, failedCallback);
        });

        // Camera Events
        /**
         * @returns {Spherical}
         */
        const getTargetCameraSpherical = () => {
            const phi = polarAngleOffset + (cameraState.Up ? -this.settings.cameraPeekAngleVertical : this.settings.cameraPeekAngleVertical) * maxPolarAngle;
            const theta = (cameraState.Right ? this.settings.cameraPeekAngleHorizontal : -this.settings.cameraPeekAngleHorizontal) * maxAzimuthAngle;
            return new Spherical(this.settings.cameraRadius, phi, theta);
        };
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
            updateCameraPosition(targetSpherical, this.settings.cameraSpeedMs, 'none', completedCallback);
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

        updateCameraPosition(getTargetCameraSpherical(), 1000, 'power4.inOut'); // initial animation
    }
}
