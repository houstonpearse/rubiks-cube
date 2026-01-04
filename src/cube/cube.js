import { Group, Vector3 } from 'three';
import { createCoreMesh } from '../threejs/pieces';
import { createCubeState } from './cubeState';
import { CubeRotation } from './cubeRotation';

export default class Cube {
    /**
     *   @param {{style: "exponential" | "next" | "fixed", speed: number, gap: number}} settings
     */
    constructor(settings) {
        /** @type {{animationStyle: "match" | "exponential" | "next" | "fixed", animationSpeed: number, gap: number}} */
        this.settings = settings;
        /** @type {Group} */
        this.group = this.createCubeGroup();
        /** @type {Group} */
        this.rotationGroup = new Group();
        /** @type {CubeRotation[]} */
        this.rotationQueue = [];
        /** @type {CubeRotation | undefined} */
        this.currentRotation = undefined;
        /** @type {{ up: string[][], down: string[][], front: string[][], back: string[][], left: string[][], right: string[][] }} */
        this.currentState = this.getStickerState();
        /** @type {number | undefined} */
        this._matchSpeed = undefined;
        /** @type {number} */
        this._lastGap = settings.gap;
    }

    /**
     * creates a ThreeJS group with all the required pieces for a cube
     * @param {Group} group
     * @returns {Group}
     */
    createCubeGroup(group) {
        var group = new Group();
        const core = createCoreMesh();
        core.userData = {
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            initialPosition: { x: 0, y: 0, z: 0 },
            initialRotation: { x: 0, y: 0, z: 0 },
            type: 'core',
        };
        group.add(core);

        for (const piece of createCubeState()) {
            var pieceGroup = piece.group;
            pieceGroup.position.set(piece.position.x * this.settings.gap, piece.position.y * this.settings.gap, piece.position.z * this.settings.gap);
            pieceGroup.rotation.set(piece.rotation.x, piece.rotation.y, piece.rotation.z);
            pieceGroup.userData = {
                position: Object.assign({}, piece.position),
                rotation: Object.assign({}, piece.rotation),
                initialPosition: Object.assign({}, piece.position),
                initialRotation: Object.assign({}, piece.rotation),
                type: piece.type,
            };
            group.add(pieceGroup);
        }
        return group;
    }

    /**
     * update the cube and continue any rotations
     * @returns {{ up: string[][], down: string[][], front: string[][], back: string[][], left: string[][], right: string[][] } | undefined }
     */
    update() {
        if (this.currentRotation === undefined) {
            if (this._lastGap !== this.settings.gap) {
                this.updateGap();
            }
            this.currentRotation = this.rotationQueue.shift();
            if (this.currentRotation === undefined) {
                this._matchSpeed = undefined; // reset speed for the match animation options
                return undefined;
            }
        }
        if (this.currentRotation.status === 'pending') {
            this.rotationGroup.add(...this.getRotationLayer(this.currentRotation.rotation));
            this.currentRotation.initialise();
        }
        if (this.currentRotation.status === 'initialised') {
            var speed = this.getRotationSpeed();
            this.currentRotation.update(this.rotationGroup, speed);
        }
        if (this.currentRotation.status === 'complete') {
            this.clearRotationGroup();
            var eventId = this.currentRotation.eventId;
            this.currentRotation = undefined;
            this.currentState = this.getStickerState();
            return eventId;
        }
        return undefined;
    }

    /**
     * Updates the gap of the pieces. To be used when the cube is not rotating
     * @returns {void}
     */
    updateGap() {
        if (this.currentRotation === undefined) {
            this.group.children.forEach((piece) => {
                var { x, y, z } = piece.userData.position;
                piece.position.set(x * this.settings.gap, y * this.settings.gap, z * this.settings.gap);
            });
            this._lastGap = this.settings.gap;
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
        if (this.settings.animationStyle === 'exponential') {
            return this.settings.animationSpeed / 2 ** this.rotationQueue.length;
        }
        if (this.settings.animationStyle === 'next') {
            return this.rotationQueue.length > 0 ? 0 : this.settings.animationSpeed;
        }
        if (this.settings.animationStyle === 'match') {
            if (this.rotationQueue.length > 0) {
                var lastTimeStamp = this.currentRotation.timestampMs;
                var minGap = this._matchSpeed ?? this.settings.animationSpeed;
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
            return this.settings.animationSpeed;
        }
        if (this.settings.animationStyle === 'fixed') {
            return this.settings.animationSpeed;
        }
        return this.settings.animationSpeed;
    }

    /**
     * Complete the current rotation and reset the cube
     * @returns {void}
     */
    reset() {
        this.rotationQueue = [];
        if (this.currentRotation) {
            this.currentRotation.update(this.rotationGroup, 0);
            this.clearRotationGroup();
            this.currentRotation = undefined;
        }
        this.group.children.forEach((piece) => {
            const { x, y, z } = piece.userData.initialPosition;
            const { x: u, y: v, z: w } = piece.userData.initialRotation;
            piece.position.set(x * this.settings.gap, y * this.settings.gap, z * this.settings.gap);
            piece.rotation.set(u, v, w);
            piece.userData.position.x = x;
            piece.userData.position.y = y;
            piece.userData.position.z = z;
            piece.userData.rotation.x = u;
            piece.userData.rotation.y = v;
            piece.userData.rotation.z = w;
        });
    }

    /**
     * Adds pieces in the rotationGroup back into the main group.
     * @returns {void}
     */
    clearRotationGroup() {
        if (this.currentRotation.status != 'complete') {
            throw Error('cannot clear rotation group while rotating');
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
     * @param {string} eventId
     * @param {{axis: "x"|"y"|"z", layers: (-1|0|1)[], direction: 1|-1|2|-2}} input
     */
    rotate(eventId, input) {
        this.rotationQueue.push(new CubeRotation(eventId, input));
    }

    /**
     * @param {{axis: "x"|"y"|"z", layers: (-1|0|1)[], direction: 1|-1|2|-2}}
     * @returns {Object3D[]}
     */
    getRotationLayer({ axis, layers, direction }) {
        if (layers.length === 0) {
            return [...this.group.children];
        }
        return this.group.children.filter((piece) => {
            if (axis === 'x') {
                return layers.includes(Math.round(piece.userData.position.x));
            } else if (axis === 'y') {
                return layers.includes(Math.round(piece.userData.position.y));
            } else if (axis === 'z') {
                return layers.includes(Math.round(piece.userData.position.z));
            }
            return false;
        });
    }

    /**
     * @returns {{ up: string[][], down: string[][], front: string[][], back: string[][], left: string[][], right: string[][] }}
     */
    getStickerState() {
        const state = {
            up: [[], [], []],
            down: [[], [], []],
            front: [[], [], []],
            back: [[], [], []],
            left: [[], [], []],
            right: [[], [], []],
        };
        this.group.children.forEach((piece) => {
            if (piece.userData.type === 'core') {
                return;
            }
            piece.children.forEach((mesh) => {
                if (mesh.userData.type === 'sticker') {
                    const piecepos = new Vector3();
                    piecepos.copy(piece.userData.position);
                    piecepos.round();
                    const stickerpos = new Vector3();
                    mesh.getWorldPosition(stickerpos);
                    stickerpos.sub(piecepos);
                    stickerpos.multiplyScalar(2);
                    stickerpos.round();
                    if (stickerpos.x === 1) {
                        state.right[1 - Math.round(piecepos.y)][1 - Math.round(piecepos.z)] = mesh.material.userData.face;
                    } else if (stickerpos.x === -1) {
                        state.left[1 - Math.round(piecepos.y)][1 + Math.round(piecepos.z)] = mesh.material.userData.face;
                    } else if (stickerpos.y === 1) {
                        state.up[1 + Math.round(piecepos.z)][1 + Math.round(piecepos.x)] = mesh.material.userData.face;
                    } else if (stickerpos.y === -1) {
                        state.down[1 - Math.round(piecepos.z)][1 + Math.round(piecepos.x)] = mesh.material.userData.face;
                    } else if (stickerpos.z === 1) {
                        state.front[1 - Math.round(piecepos.y)][1 + Math.round(piecepos.x)] = mesh.material.userData.face;
                    } else if (stickerpos.z === -1) {
                        state.back[1 - Math.round(piecepos.y)][1 - Math.round(piecepos.x)] = mesh.material.userData.face;
                    }
                }
            });
        });
        return state;
    }
}
