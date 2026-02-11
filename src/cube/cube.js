// @ts-check
import { Group, Material, Mesh, Object3D, Vector3 } from 'three';
import { createCoreMesh } from '../threejs/pieces';
import { createCubeState } from './cubeState';
import { CubeRotation } from './cubeRotation';
import CubeSettings from './cubeSettings';
import GetMovementSlice, { GetRotationSlice } from './slice';
import { Axi } from '../core';

/** @typedef {{ up: import('../core').Face[][], down: import('../core').Face[][], front: import('../core').Face[][], back: import('../core').Face[][], left: import('../core').Face[][], right: import('../core').Face[][] }} StickerState*/
export default class Cube {
    /**
     *   @param {CubeSettings} cubeSettings
     */
    constructor(cubeSettings) {
        /** @type {CubeSettings} */
        this.cubeSettings = cubeSettings;
        /** @type {Group} */
        this.group = new Group();
        /** @type {Group} */
        this.rotationGroup = new Group();
        /** @type {CubeRotation[]} */
        this.rotationQueue = [];
        /** @type {CubeRotation | undefined} */
        this.currentRotation = undefined;

        /** @type {number | undefined} */
        this._matchSpeed = undefined;
        /** @type {number} */
        this._lastGap = cubeSettings.pieceGap;

        // initialise threejs Objects
        this.init();

        /** @type {StickerState} */
        this.currentState = this.getStickerState();
    }

    /**
     * adds threejs objects to group
     */
    init() {
        const core = createCoreMesh();
        core.userData = {
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            initialPosition: { x: 0, y: 0, z: 0 },
            initialRotation: { x: 0, y: 0, z: 0 },
            type: 'core',
        };
        this.group.add(core);

        for (const piece of createCubeState()) {
            var pieceGroup = piece.group;
            pieceGroup.position.set(
                piece.position.x * this.cubeSettings.pieceGap,
                piece.position.y * this.cubeSettings.pieceGap,
                piece.position.z * this.cubeSettings.pieceGap,
            );
            pieceGroup.rotation.set(piece.rotation.x, piece.rotation.y, piece.rotation.z);
            pieceGroup.userData = {
                position: Object.assign({}, piece.position),
                rotation: Object.assign({}, piece.rotation),
                initialPosition: Object.assign({}, piece.position),
                initialRotation: Object.assign({}, piece.rotation),
                type: piece.type,
            };
            this.group.add(pieceGroup);
        }
        return this.group;
    }

    /**
     * update the cube and continue any rotations
     */
    update() {
        if (this.currentRotation === undefined) {
            if (this._lastGap !== this.cubeSettings.pieceGap) {
                this.updateGap();
            }
            this.currentRotation = this.rotationQueue.shift();
            if (this.currentRotation === undefined) {
                this._matchSpeed = undefined; // reset speed for the match animation options
                return;
            }
        }
        if (this.currentRotation.status === 'pending') {
            this.rotationGroup.add(...this.getRotationLayer(this.currentRotation.slice));
            this.currentRotation.initialise();
        }
        if (this.currentRotation.status === 'initialised' || this.currentRotation.status === 'inProgress') {
            var speed = this.getRotationSpeed();
            this.currentRotation.update(this.rotationGroup, speed);
        }
        if (this.currentRotation.status === 'complete') {
            this.clearRotationGroup();
            this.currentState = this.getStickerState();
            this.currentRotation.completedCallback(this.kociembaState);
            this.currentRotation = undefined;
        }
        return;
    }

    /**
     * Updates the gap of the pieces. To be used when the cube is not rotating
     * @returns {void}
     */
    updateGap() {
        if (this.currentRotation === undefined) {
            this.group.children.forEach((piece) => {
                var { x, y, z } = piece.userData.position;
                piece.position.set(x * this.cubeSettings.pieceGap, y * this.cubeSettings.pieceGap, z * this.cubeSettings.pieceGap);
            });
            this._lastGap = this.cubeSettings.pieceGap;
        }
    }

    /**
     *
     * calculates the current speed of the current rotation in ms.
     * calculation is dependent on animation style and animation speed settings
     * - exponential: speeds up rotations depending on the queue length
     * - next: an animation speed of 0 when there is another animation in the queue
     * - match: will match the speed of rotations to the frequency of key presses.
     * - fixed: will return a constant value
     * @returns {number}
     */
    getRotationSpeed() {
        if (this.cubeSettings.animationStyle === 'exponential') {
            return this.cubeSettings.animationSpeedMs / 2 ** this.rotationQueue.length;
        }
        if (this.cubeSettings.animationStyle === 'next') {
            return this.rotationQueue.length > 0 ? 0 : this.cubeSettings.animationSpeedMs;
        }
        if (this.cubeSettings.animationStyle === 'match') {
            if (this.rotationQueue.length > 0) {
                const rotation = /** @type {CubeRotation} */ (this.currentRotation);
                const lastTimeStamp = rotation.timestampMs;
                let minGap = this._matchSpeed ?? this.cubeSettings.animationSpeedMs;
                for (var i = 0; i < this.rotationQueue.length; i++) {
                    var gap = this.rotationQueue[i].timestampMs - lastTimeStamp;
                    if (gap < minGap) {
                        minGap = gap;
                    }
                }
                this._matchSpeed = minGap;
            }
            if (this._matchSpeed !== undefined) {
                return this._matchSpeed;
            }
            return this.cubeSettings.animationSpeedMs;
        }
        if (this.cubeSettings.animationStyle === 'fixed') {
            return this.cubeSettings.animationSpeedMs;
        }
        return this.cubeSettings.animationSpeedMs;
    }

    /**
     * Complete the current rotation and reset the cube
     * @param {(state:string) => boolean} completedCallback
     * @returns {void}
     */
    reset(completedCallback) {
        this.rotationQueue.forEach((cubeRotation) => cubeRotation.failedCallback('State reset during action'));
        this.rotationQueue = [];
        if (this.currentRotation) {
            this.currentRotation.update(this.rotationGroup, 0);
            this.clearRotationGroup();
            this.currentRotation.failedCallback('State reset during action');
            this.currentRotation = undefined;
        }
        this.group.children.forEach((piece) => {
            const { x, y, z } = piece.userData.initialPosition;
            const { x: u, y: v, z: w } = piece.userData.initialRotation;
            piece.position.set(x * this.cubeSettings.pieceGap, y * this.cubeSettings.pieceGap, z * this.cubeSettings.pieceGap);
            piece.rotation.set(u, v, w);
            piece.userData.position.x = x;
            piece.userData.position.y = y;
            piece.userData.position.z = z;
            piece.userData.rotation.x = u;
            piece.userData.rotation.y = v;
            piece.userData.rotation.z = w;
        });

        this.currentState = this.getStickerState();
        if (!completedCallback(this.kociembaState)) {
            console.error('Failed to invoke reset completedCallback');
        }
    }

    /**
     * Adds pieces in the rotationGroup back into the main group.
     * @returns {void}
     */
    clearRotationGroup() {
        if (this.currentRotation == null) {
            console.error('cannot clear rotation when rotation is null');
            return;
        }
        if (this.currentRotation.status != 'complete') {
            console.error('cannot clear rotation group while rotating');
            return;
        }
        this.rotationGroup.children.forEach((piece) => {
            piece.getWorldPosition(piece.position);
            piece.getWorldQuaternion(piece.quaternion);
            var x = Math.round(piece.position.x);
            var y = Math.round(piece.position.y);
            var z = Math.round(piece.position.z);
            piece.userData.position.x = Math.abs(x) > 1 ? Math.sign(x) : x;
            piece.userData.position.y = Math.abs(y) > 1 ? Math.sign(y) : y;
            piece.userData.position.z = Math.abs(z) > 1 ? Math.sign(z) : z;
            piece.userData.rotation.x = piece.rotation.x;
            piece.userData.rotation.y = piece.rotation.y;
            piece.userData.rotation.z = piece.rotation.z;
        });
        this.group.add(...this.rotationGroup.children);
        this.rotationGroup.rotation.set(0, 0, 0);
        this.currentRotation.status = 'disposed';
    }

    /**
     *  @param {string} eventId
     *  @param {import('../core').Rotation} rotation
     * @param {((state: string) => void )} completedCallback
     * @param {((reason: string) => void )} failedCallback
     */
    rotation(eventId, rotation, completedCallback, failedCallback) {
        const slice = GetRotationSlice(rotation);
        this.rotationQueue.push(new CubeRotation(eventId, slice, completedCallback, failedCallback));
    }

    /**
     *  @param {string} eventId
     *  @param {import('../core').Movement} movement
     * @param {((state: string) => void )} completedCallback
     * @param {((reason: string) => void )} failedCallback
     */
    movement(eventId, movement, completedCallback, failedCallback) {
        const slice = GetMovementSlice(movement);
        this.rotationQueue.push(new CubeRotation(eventId, slice, completedCallback, failedCallback));
    }

    /**
     * @param {import('./slice').Slice} slice
     * @returns {Object3D[]}
     */
    getRotationLayer(slice) {
        if (slice.layers.length === 0) {
            return [...this.group.children];
        }
        return this.group.children.filter((piece) => {
            if (slice.axis === Axi.x) {
                const roundedPos = /** @type {(-1|0|1)} */ (Math.round(piece.userData.position.x));
                return slice.layers.includes(roundedPos);
            } else if (slice.axis === Axi.y) {
                const roundedPos = /** @type {(-1|0|1)} */ (Math.round(piece.userData.position.y));
                return slice.layers.includes(roundedPos);
            } else if (slice.axis === Axi.z) {
                const roundedPos = /** @type {(-1|0|1)} */ (Math.round(piece.userData.position.z));
                return slice.layers.includes(roundedPos);
            }
            return false;
        });
    }

    /**
     * @returns {string}
     */
    get kociembaState() {
        return this.toKociemba(this.currentState);
    }

    /**
     * @param {StickerState} stickerState
     * @returns {string}
     */
    toKociemba(stickerState) {
        return `${stickerState.up.flat().join('')}${stickerState.right.flat().join('')}${stickerState.front.flat().join('')}${stickerState.down.flat().join('')}${stickerState.left.flat().join('')}${stickerState.back.flat().join('')}`;
    }

    /**
     * @returns {StickerState}
     */
    getStickerState() {
        /** @type {StickerState} */
        let state = { up: [[], [], []], down: [[], [], []], front: [[], [], []], back: [[], [], []], left: [[], [], []], right: [[], [], []] };
        this.group.children.forEach((piece) => {
            if (piece.userData.type === 'core') {
                return;
            }
            piece.children.forEach((object3D) => {
                if (object3D.userData.type === 'sticker') {
                    const mesh = /** @type {Mesh} */ (object3D);
                    const piecepos = new Vector3();
                    piecepos.copy(piece.userData.position);
                    piecepos.round();
                    const stickerpos = new Vector3();
                    mesh.getWorldPosition(stickerpos);
                    stickerpos.sub(piecepos);
                    stickerpos.multiplyScalar(2);
                    stickerpos.round();
                    const material = /** @type {Material} */ (mesh.material);
                    const materialUserData = /** @type {import('../threejs/materials').StickerUserData} */ (material.userData);
                    if (stickerpos.x === 1) {
                        state.right[1 - Math.round(piecepos.y)][1 - Math.round(piecepos.z)] = materialUserData.face;
                    } else if (stickerpos.x === -1) {
                        state.left[1 - Math.round(piecepos.y)][1 + Math.round(piecepos.z)] = materialUserData.face;
                    } else if (stickerpos.y === 1) {
                        state.up[1 + Math.round(piecepos.z)][1 + Math.round(piecepos.x)] = materialUserData.face;
                    } else if (stickerpos.y === -1) {
                        state.down[1 - Math.round(piecepos.z)][1 + Math.round(piecepos.x)] = materialUserData.face;
                    } else if (stickerpos.z === 1) {
                        state.front[1 - Math.round(piecepos.y)][1 + Math.round(piecepos.x)] = materialUserData.face;
                    } else if (stickerpos.z === -1) {
                        state.back[1 - Math.round(piecepos.y)][1 - Math.round(piecepos.x)] = materialUserData.face;
                    }
                }
            });
        });
        return state;
    }
}
