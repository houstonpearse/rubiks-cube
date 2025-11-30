import { Group, Vector3 } from 'three';
import { createCoreMesh } from '../threejs/pieces';
import { createCubeState } from './cubeState';
export default class Cube {
    constructor(gap) {
        this.gap = gap;
        this.group = new Group();
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
            var group = piece.group;
            group.position.set(piece.position.x * gap, piece.position.y * gap, piece.position.z * gap);
            group.rotation.set(piece.rotation.x, piece.rotation.y, piece.rotation.z);
            group.userData = {
                position: Object.assign({}, piece.position),
                rotation: Object.assign({}, piece.rotation),
                initialPosition: Object.assign({}, piece.position),
                initialRotation: Object.assign({}, piece.rotation),
                type: piece.type,
            };
            this.group.add(group);
        }
    }

    reset() {
        this.group.children.forEach((piece) => {
            const { x, y, z } = piece.userData.initialPosition;
            const { x: u, y: v, z: w } = piece.userData.initialRotation;
            piece.position.set(x * gap, y * gap, z * gap);
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
     * @param {"x"|"y"|"z"} axis
     * @param {{-1|0|1}[]} layers
     * @returns {Object3D[]}
     */
    getRotationLayer(axis, layers) {
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
