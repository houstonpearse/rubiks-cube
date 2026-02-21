// @ts-check
import { Group, Mesh, Object3D, SphereGeometry, Vector3 } from 'three';
import { CornerPiece } from './cornerPiece';
import CubeSettings from '../cube/cubeSettings';
import { ColorToFace, FaceColors, getCubeInfo } from './cubeState';
import { EdgePiece } from './edgePiece';
import { CenterPiece } from './centerPiece';
import Materials from '../threejs/materials';
import { getEmptyStickerState, toKociemba } from './stickerState';
import { Axi } from '../core';
import { AnimationState, AnimationStatus } from './animationState';
import { GetMovementSlice, GetOuterBlockMovementSlice } from './animationSlice';

const ERROR_MARGIN = 0.0001;

export default class NewRubiksCube3D extends Object3D {
    /**
     *   @param {CubeSettings} cubeSettings
     */
    constructor(cubeSettings) {
        super();
        /** @type {CubeSettings} */
        this._cubeSettings = cubeSettings;
        /** @type {import('./cubeState').CubeInfo} */
        this._cubeInfo = getCubeInfo(cubeSettings.cubeType);
        /** @type {Group} */
        this._mainGroup = this.createCubeGroup();
        /** @type {Group} */
        this._rotationGroup = new Group();
        /** @type {AnimationState[]} */
        this._rotationQueue = [];
        /** @type {AnimationState | undefined} */
        this._currentRotation = undefined;
        /** @type {number | undefined} */
        this._matchSpeed = undefined;
        /** @type {number} */
        this._lastGap = cubeSettings.pieceGap;
        this.add(this._mainGroup, this._rotationGroup);
        this.setStickerState(this._cubeInfo.initialStickerState);
        this._rotationQueue.push(
            new AnimationState(
                GetOuterBlockMovementSlice('2R', this._cubeSettings.cubeType),
                () => {},
                () => {},
            ),
            new AnimationState(
                GetMovementSlice('r', this._cubeSettings.cubeType),
                () => {},
                () => {},
            ),
            new AnimationState(
                GetOuterBlockMovementSlice('3U', this._cubeSettings.cubeType),
                () => {},
                () => {},
            ),
        );
    }

    createCubeGroup() {
        const cubeInfo = this._cubeInfo;
        const pieceGap = this._cubeSettings.pieceGap;
        const outerLayerMultiplier = cubeInfo.outerLayerMultiplier;
        const outerLayerOffset = (cubeInfo.pieceSize * (outerLayerMultiplier - 1)) / 2;
        const group = new Group();
        const core = new Mesh(new SphereGeometry(cubeInfo.coreSize), Materials.core);
        group.add(core);
        for (const piece of cubeInfo.corners) {
            const corner = new CornerPiece();
            corner.scale.set(cubeInfo.pieceSize * outerLayerMultiplier, cubeInfo.pieceSize * outerLayerMultiplier, cubeInfo.pieceSize * outerLayerMultiplier);
            corner.position.set(
                piece.position.x * (pieceGap + outerLayerOffset),
                piece.position.y * (pieceGap + outerLayerOffset),
                piece.position.z * (pieceGap + outerLayerOffset),
            );
            corner.rotation.set(piece.rotation.x, piece.rotation.y, piece.rotation.z);
            corner.userData = {
                position: Object.assign({}, piece.position),
                rotation: Object.assign({}, piece.rotation),
            };
            group.add(corner);
        }
        for (const piece of cubeInfo.edges) {
            const edge = new EdgePiece();
            edge.scale.set(cubeInfo.pieceSize, cubeInfo.pieceSize * outerLayerMultiplier, cubeInfo.pieceSize * outerLayerMultiplier);
            edge.position.set(
                piece.position.x * (pieceGap + (Math.abs(piece.position.x) == 1 ? outerLayerOffset : 0)),
                piece.position.y * (pieceGap + (Math.abs(piece.position.y) == 1 ? outerLayerOffset : 0)),
                piece.position.z * (pieceGap + (Math.abs(piece.position.z) == 1 ? outerLayerOffset : 0)),
            );
            edge.rotation.set(piece.rotation.x, piece.rotation.y, piece.rotation.z);
            edge.userData = {
                position: Object.assign({}, piece.position),
                rotation: Object.assign({}, piece.rotation),
            };
            group.add(edge);
        }
        for (const piece of cubeInfo.centers) {
            const center = new CenterPiece();
            center.scale.set(cubeInfo.pieceSize, cubeInfo.pieceSize, cubeInfo.pieceSize * outerLayerMultiplier);
            center.position.set(
                piece.position.x * (pieceGap + (Math.abs(piece.position.x) == 1 ? outerLayerOffset : 0)),
                piece.position.y * (pieceGap + (Math.abs(piece.position.y) == 1 ? outerLayerOffset : 0)),
                piece.position.z * (pieceGap + (Math.abs(piece.position.z) == 1 ? outerLayerOffset : 0)),
            );
            center.rotation.set(piece.rotation.x, piece.rotation.y, piece.rotation.z);
            center.userData = {
                position: Object.assign({}, piece.position),
                rotation: Object.assign({}, piece.rotation),
            };
            group.add(center);
        }
        return group;
    }

    /**
     * @returns {import('./stickerState').StickerState}
     */
    getStickerState() {
        let state = getEmptyStickerState(this._cubeSettings.cubeType);
        const corners = this._mainGroup.children.filter((x) => x instanceof CornerPiece);
        const edges = this._mainGroup.children.filter((x) => x instanceof EdgePiece);
        const centers = this._mainGroup.children.filter((x) => x instanceof CenterPiece);
        [...corners, ...edges, ...centers].forEach((piece) => {
            piece.stickers.forEach((sticker) => {
                const face = ColorToFace(sticker.color);
                const piecepos = new Vector3();
                piecepos.copy(piece.userData.position);
                const stickerpos = new Vector3();
                sticker.getWorldPosition(stickerpos);
                stickerpos.sub(piecepos);
                stickerpos.normalize();
                stickerpos.round();
                if (stickerpos.x === 1) {
                    const i = Math.round((1 - piecepos.y) / this._cubeInfo.pieceSize);
                    const j = Math.round((1 - piecepos.z) / this._cubeInfo.pieceSize);
                    state.right[i][j] = face;
                } else if (stickerpos.x === -1) {
                    const i = Math.round((1 - piecepos.y) / this._cubeInfo.pieceSize);
                    const j = Math.round((1 + piecepos.z) / this._cubeInfo.pieceSize);
                    state.left[i][j] = face;
                } else if (stickerpos.y === 1) {
                    const i = Math.round((1 + piecepos.z) / this._cubeInfo.pieceSize);
                    const j = Math.round((1 + piecepos.x) / this._cubeInfo.pieceSize);
                    state.up[i][j] = face;
                } else if (stickerpos.y === -1) {
                    const i = Math.round((1 - piecepos.z) / this._cubeInfo.pieceSize);
                    const j = Math.round((1 + piecepos.x) / this._cubeInfo.pieceSize);
                    state.down[i][j] = face;
                } else if (stickerpos.z === 1) {
                    const i = Math.round((1 - piecepos.y) / this._cubeInfo.pieceSize);
                    const j = Math.round((1 + piecepos.x) / this._cubeInfo.pieceSize);
                    state.front[i][j] = face;
                } else if (stickerpos.z === -1) {
                    const i = Math.round((1 - piecepos.y) / this._cubeInfo.pieceSize);
                    const j = Math.round((1 - piecepos.x) / this._cubeInfo.pieceSize);
                    state.back[i][j] = face;
                }
            });
        });
        return state;
    }

    /**
     * @param {import('./stickerState').StickerState} stickerState
     */
    setStickerState(stickerState) {
        const corners = this._mainGroup.children.filter((x) => x instanceof CornerPiece);
        const edges = this._mainGroup.children.filter((x) => x instanceof EdgePiece);
        const centers = this._mainGroup.children.filter((x) => x instanceof CenterPiece);
        [...corners, ...edges, ...centers].forEach((piece) => {
            piece.stickers.forEach((sticker) => {
                const piecepos = new Vector3();
                piecepos.copy(piece.userData.position);
                const stickerpos = new Vector3();
                sticker.getWorldPosition(stickerpos);
                stickerpos.sub(piecepos);
                stickerpos.normalize();
                stickerpos.round();
                if (stickerpos.x === 1) {
                    const face =
                        stickerState.right[Math.round((1 - piecepos.y) / this._cubeInfo.pieceSize)][Math.round((1 - piecepos.z) / this._cubeInfo.pieceSize)];
                    sticker.color = FaceColors[face];
                } else if (stickerpos.x === -1) {
                    const face =
                        stickerState.left[Math.round((1 - piecepos.y) / this._cubeInfo.pieceSize)][Math.round((1 + piecepos.z) / this._cubeInfo.pieceSize)];
                    sticker.color = FaceColors[face];
                } else if (stickerpos.y === 1) {
                    const face =
                        stickerState.up[Math.round((1 + piecepos.z) / this._cubeInfo.pieceSize)][Math.round((1 + piecepos.x) / this._cubeInfo.pieceSize)];
                    sticker.color = FaceColors[face];
                } else if (stickerpos.y === -1) {
                    const face =
                        stickerState.down[Math.round((1 - piecepos.z) / this._cubeInfo.pieceSize)][Math.round((1 + piecepos.x) / this._cubeInfo.pieceSize)];
                    sticker.color = FaceColors[face];
                } else if (stickerpos.z === 1) {
                    const face =
                        stickerState.front[Math.round((1 - piecepos.y) / this._cubeInfo.pieceSize)][Math.round((1 + piecepos.x) / this._cubeInfo.pieceSize)];
                    sticker.color = FaceColors[face];
                } else if (stickerpos.z === -1) {
                    const face =
                        stickerState.back[Math.round((1 - piecepos.y) / this._cubeInfo.pieceSize)][Math.round((1 - piecepos.x) / this._cubeInfo.pieceSize)];
                    sticker.color = FaceColors[face];
                }
            });
        });
    }

    /**
     * @param {import('./animationSlice').Slice} slice
     * @returns {Object3D[]}
     */
    getRotationLayer(slice) {
        if (slice.layers.length === 0) {
            return [...this._mainGroup.children];
        }
        const corners = this._mainGroup.children.filter((x) => x instanceof CornerPiece);
        const edges = this._mainGroup.children.filter((x) => x instanceof EdgePiece);
        const centers = this._mainGroup.children.filter((x) => x instanceof CenterPiece);
        return [...corners, ...edges, ...centers].filter((piece) => {
            switch (slice.axis) {
                case Axi.x:
                    return slice.layers.some((layer) => Math.abs(layer - piece.userData.position.x) < ERROR_MARGIN);
                case Axi.y:
                    return slice.layers.some((layer) => Math.abs(layer - piece.userData.position.y) < ERROR_MARGIN);
                case Axi.z:
                    return slice.layers.some((layer) => Math.abs(layer - piece.userData.position.z) < ERROR_MARGIN);
            }
        });
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
        const cubeInfo = this._cubeInfo;
        const pieceGap = this._cubeSettings.pieceGap;
        const outerLayerMultiplier = cubeInfo.outerLayerMultiplier;
        const outerLayerOffset = (cubeInfo.pieceSize * (outerLayerMultiplier - 1)) / 2;
        const corners = this._rotationGroup.children.filter((x) => x instanceof CornerPiece);
        const edges = this._rotationGroup.children.filter((x) => x instanceof EdgePiece);
        const centers = this._rotationGroup.children.filter((x) => x instanceof CenterPiece);
        [...centers, ...corners, ...edges].forEach((piece) => {
            piece.getWorldPosition(piece.position);
            piece.getWorldQuaternion(piece.quaternion);
            if (cubeInfo.layers.some((layer) => Math.abs(layer - piece.position.x / pieceGap) < ERROR_MARGIN)) {
                piece.userData.position.x = piece.position.x / pieceGap;
            } else {
                piece.userData.position.x = piece.position.x / (pieceGap + outerLayerOffset);
            }
            if (cubeInfo.layers.some((layer) => Math.abs(layer - piece.position.y / pieceGap) < ERROR_MARGIN)) {
                piece.userData.position.y = piece.position.y / pieceGap;
            } else {
                piece.userData.position.y = piece.position.y / (pieceGap + outerLayerOffset);
            }
            if (cubeInfo.layers.some((layer) => Math.abs(layer - piece.position.z / pieceGap) < ERROR_MARGIN)) {
                piece.userData.position.z = piece.position.z / pieceGap;
            } else {
                piece.userData.position.z = piece.position.z / (pieceGap + outerLayerOffset);
            }
            piece.userData.rotation.x = piece.rotation.x;
            piece.userData.rotation.y = piece.rotation.y;
            piece.userData.rotation.z = piece.rotation.z;
        });
        this._mainGroup.add(...this._rotationGroup.children);
        this._rotationGroup.rotation.set(0, 0, 0);
    }

    /**
     * update the cube and continue any rotations
     */
    update() {
        if (this._currentRotation === undefined) {
            if (this._lastGap !== this._cubeSettings.pieceGap) {
                //this.updateGap();
            }
            this._currentRotation = this._rotationQueue.shift();
            if (this._currentRotation === undefined) {
                this._matchSpeed = undefined; // reset speed for the match animation options
                return;
            }
        }
        if (this._currentRotation.status === AnimationStatus.Pending) {
            this._rotationGroup.add(...this.getRotationLayer(this._currentRotation.slice));
            this._currentRotation.initialise();
        }
        if (this._currentRotation.status === AnimationStatus.Initialised || this._currentRotation.status === AnimationStatus.InProgress) {
            //var speed = this.getRotationSpeed();
            const increment = this._currentRotation.update(1000);
            const radians = (Math.abs(this._currentRotation.slice.direction) * ((increment / 100) * Math.PI)) / 2;
            this._rotationGroup.rotateOnWorldAxis(
                new Vector3(
                    this._currentRotation.slice.axis === Axi.x ? this._currentRotation.slice.direction : 0,
                    this._currentRotation.slice.axis === Axi.y ? this._currentRotation.slice.direction : 0,
                    this._currentRotation.slice.axis === Axi.z ? this._currentRotation.slice.direction : 0,
                ).normalize(),
                radians,
            );
        }
        if (this._currentRotation.status === AnimationStatus.Complete) {
            this.clearRotationGroup();
            this._currentRotation.complete(toKociemba(this.getStickerState()));
            this._currentRotation = undefined;
        }
        return;
    }
}
