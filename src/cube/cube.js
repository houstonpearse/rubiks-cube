// @ts-check
import { Group, Material, Mesh, Object3D, Vector3 } from 'three';
import { createCoreMesh } from '../threejs/pieces';
import { createCubeState } from './cubeState';
import { CubeRotation } from './cubeRotation';
import CubeSettings from './cubeSettings';
import GetMovementSlice, { GetRotationSlice } from './slice';
import { Axi } from '../core';
import { createCubeGroup } from '../threejs/cubeGroup';

/** @typedef {{ up: import('../core').Face[][], down: import('../core').Face[][], front: import('../core').Face[][], back: import('../core').Face[][], left: import('../core').Face[][], right: import('../core').Face[][] }} StickerState*/
export default class RubiksCube3D extends Object3D {
    /**
     *   @param {CubeSettings} cubeSettings
     */
    constructor(cubeSettings) {
        super();
        /** @type {CubeSettings} */
        this._cubeSettings = cubeSettings;
        /** @type {Group} */
        this._mainGroup = createCubeGroup(cubeSettings.pieceGap);
        /** @type {Group} */
        this._rotationGroup = new Group();
        /** @type {CubeRotation[]} */
        this._rotationQueue = [];
        /** @type {CubeRotation | undefined} */
        this._currentRotation = undefined;
        /** @type {number | undefined} */
        this._matchSpeed = undefined;
        /** @type {number} */
        this._lastGap = cubeSettings.pieceGap;

        this.add(this._mainGroup, this._rotationGroup);

        /** @type {StickerState} */
        this.currentState = this.getStickerState();
    }

    /**
     *  @param {string} eventId
     *  @param {import('../core').Rotation} rotation
     *  @param {((state: string) => void )} completedCallback
     *  @param {((reason: string) => void )} failedCallback
     */
    rotate(eventId, rotation, completedCallback, failedCallback) {
        const slice = GetRotationSlice(rotation);
        this._rotationQueue.push(new CubeRotation(eventId, slice, completedCallback, failedCallback));
    }

    /**
     *  @param {string} eventId
     *  @param {import('../core').Movement} movement
     *  @param {((state: string) => void )} completedCallback
     *  @param {((reason: string) => void )} failedCallback
     */
    movement(eventId, movement, completedCallback, failedCallback) {
        const slice = GetMovementSlice(movement);
        this._rotationQueue.push(new CubeRotation(eventId, slice, completedCallback, failedCallback));
    }

    /**
     * update the cube and continue any rotations
     */
    update() {
        if (this._currentRotation === undefined) {
            if (this._lastGap !== this._cubeSettings.pieceGap) {
                this.updateGap();
            }
            this._currentRotation = this._rotationQueue.shift();
            if (this._currentRotation === undefined) {
                this._matchSpeed = undefined; // reset speed for the match animation options
                return;
            }
        }
        if (this._currentRotation.status === 'pending') {
            this._rotationGroup.add(...this.getRotationLayer(this._currentRotation.slice));
            this._currentRotation.initialise();
        }
        if (this._currentRotation.status === 'initialised' || this._currentRotation.status === 'inProgress') {
            var speed = this.getRotationSpeed();
            this._currentRotation.update(this._rotationGroup, speed);
        }
        if (this._currentRotation.status === 'complete') {
            this.clearRotationGroup();
            this.currentState = this.getStickerState();
            this._currentRotation.completedCallback(this.kociembaState);
            this._currentRotation = undefined;
        }
        return;
    }

    /**
     * Updates the gap of the pieces. To be used when the cube is not rotating
     * @returns {void}
     */
    updateGap() {
        if (this._currentRotation === undefined) {
            this._mainGroup.children.forEach((piece) => {
                var { x, y, z } = piece.userData.position;
                piece.position.set(x * this._cubeSettings.pieceGap, y * this._cubeSettings.pieceGap, z * this._cubeSettings.pieceGap);
            });
            this._lastGap = this._cubeSettings.pieceGap;
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
        if (this._cubeSettings.animationStyle === 'exponential') {
            return this._cubeSettings.animationSpeedMs / 2 ** this._rotationQueue.length;
        }
        if (this._cubeSettings.animationStyle === 'next') {
            return this._rotationQueue.length > 0 ? 0 : this._cubeSettings.animationSpeedMs;
        }
        if (this._cubeSettings.animationStyle === 'match') {
            if (this._rotationQueue.length > 0) {
                const rotation = /** @type {CubeRotation} */ (this._currentRotation);
                const lastTimeStamp = rotation.timestampMs;
                let minGap = this._matchSpeed ?? this._cubeSettings.animationSpeedMs;
                for (var i = 0; i < this._rotationQueue.length; i++) {
                    var gap = this._rotationQueue[i].timestampMs - lastTimeStamp;
                    if (gap < minGap) {
                        minGap = gap;
                    }
                }
                this._matchSpeed = minGap;
            }
            if (this._matchSpeed !== undefined) {
                return this._matchSpeed;
            }
            return this._cubeSettings.animationSpeedMs;
        }
        if (this._cubeSettings.animationStyle === 'fixed') {
            return this._cubeSettings.animationSpeedMs;
        }
        return this._cubeSettings.animationSpeedMs;
    }

    /**
     *
     * @param {string} kociembaState
     * @param {((state: string) => boolean)} completedCallback
     */
    setState(kociembaState, completedCallback) {
        completedCallback(this.kociembaState);
    }

    /**
     * Complete the current rotation and reset the cube
     * @param {(state:string) => boolean} completedCallback
     * @returns {void}
     */
    reset(completedCallback) {
        this._rotationQueue.forEach((cubeRotation) => cubeRotation.failedCallback('State reset during action'));
        this._rotationQueue = [];
        if (this._currentRotation) {
            this._currentRotation.update(this._rotationGroup, 0);
            this.clearRotationGroup();
            this._currentRotation.failedCallback('State reset during action');
            this._currentRotation = undefined;
        }
        this._mainGroup.children.forEach((piece) => {
            const { x, y, z } = piece.userData.initialPosition;
            const { x: u, y: v, z: w } = piece.userData.initialRotation;
            piece.position.set(x * this._cubeSettings.pieceGap, y * this._cubeSettings.pieceGap, z * this._cubeSettings.pieceGap);
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
        if (this._currentRotation == null) {
            console.error('cannot clear rotation when rotation is null');
            return;
        }
        if (this._currentRotation.status != 'complete') {
            console.error('cannot clear rotation group while rotating');
            return;
        }
        this._rotationGroup.children.forEach((piece) => {
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
        this._mainGroup.add(...this._rotationGroup.children);
        this._rotationGroup.rotation.set(0, 0, 0);
        this._currentRotation.status = 'disposed';
    }

    /**
     * @param {import('./slice').Slice} slice
     * @returns {Object3D[]}
     */
    getRotationLayer(slice) {
        if (slice.layers.length === 0) {
            return [...this._mainGroup.children];
        }
        return this._mainGroup.children.filter((piece) => {
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
        this._mainGroup.children.forEach((piece) => {
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
