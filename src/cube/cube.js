import { Group, Vector3 } from 'three';
import { createCoreMesh } from '../threejs/pieces';
import { createCubeState } from './cubeState';
import { CubeRotation } from './cubeRotation';

const minimumGap = 1;

export default class Cube {
    /**
     *   @param {{style: "exponential" | "next" | "fixed", speed: number, gap: number}} params
     */
    constructor({ gap, speed, style }) {
        /** @type {number} */
        this.gap = gap < minimumGap ? minimumGap : gap;
        /** @type {Group} */
        this.group = new Group();
        /** @type {Group} */
        this.rotationGroup = new Group();
        /** @type {CubeRotation[]} */
        this.rotationQueue = [];
        /** @type {CubeRotation | undefined} */
        this.currentRotation = undefined;
        /** @type {number} */
        this.animationSpeed = speed;
        /** @type {"exponential" | "next" | "fixed"} */
        this.animationStyle = style;

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
            pieceGroup.position.set(piece.position.x * this.gap, piece.position.y * this.gap, piece.position.z * this.gap);
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
    }

    update() {
        if (this.currentRotation === undefined) {
            this.currentRotation = this.rotationQueue.shift();
            if (this.currentRotation === undefined) return;
            this.rotationGroup.add(...this.getRotationLayer(this.currentRotation.rotation));
            this.currentRotation.initialise();
        }

        if (this.currentRotation.status === 'complete') {
            this.clearRotationGroup();
            this.currentRotation.dispose();
            this.currentRotation = this.rotationQueue.shift();
            if (this.currentRotation === undefined) return;
            this.rotationGroup.add(...this.getRotationLayer(this.currentRotation.rotation));
            this.currentRotation.initialise();
        }

        this.currentRotation.update(this.rotationGroup, this.getRotationSpeed());
    }

    getRotationSpeed() {
        if (this.animationStyle == 'exponential') {
            return this.animationSpeed / 2 ** this.rotationQueue.length;
        }
        if (this.animationStyle == 'next') {
            return this.rotationQueue.length > 0 ? 0 : this.animationSpeed;
        }
        return this.animationSpeed;
    }

    reset() {
        this.rotationQueue = [];
        if (this.currentRotation) {
            this.currentRotation.update(this.rotationGroup, 0);
            this.clearRotationGroup();
            this.currentRotation.dispose();
            this.currentRotation = undefined;
        }
        this.group.children.forEach((piece) => {
            const { x, y, z } = piece.userData.initialPosition;
            const { x: u, y: v, z: w } = piece.userData.initialRotation;
            piece.position.set(x * this.gap, y * this.gap, z * this.gap);
            piece.rotation.set(u, v, w);
            piece.userData.position.x = x;
            piece.userData.position.y = y;
            piece.userData.position.z = z;
            piece.userData.rotation.x = u;
            piece.userData.rotation.y = v;
            piece.userData.rotation.z = w;
        });
    }

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
    }

    /**
     * @param {{axis: "x"|"y"|"z", layers: (-1|0|1)[], direction: 1|-1|2|-2}} input
     */
    rotate(input) {
        this.rotationQueue.push(new CubeRotation(input));
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
