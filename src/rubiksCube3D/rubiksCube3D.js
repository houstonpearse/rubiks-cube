// @ts-check
import { Group, Mesh, MeshBasicMaterial, Object3D, Vector3 } from 'three';
import { CornerPiece } from './cornerPiece';
import RubiksCube3DSettings from './cubeSettings';
import { ColorToFace, FaceColors, getCubeConfig } from './cubeConfig';
import { EdgePiece } from './edgePiece';
import { CenterPiece } from './centerPiece';
import { defaultStickerState, fromKociemba, getEmptyStickerState, getStickerFaceIndex, toKociemba } from '../state/stickerState';
import { CubeTypes, Movements } from '../core';
import { Axi } from '../state/slice';
import { RoundedBoxGeometry } from 'three/examples/jsm/Addons.js';
import { centers, corners, edges } from '../state/state';
import { gsap } from 'gsap';

const ERROR_MARGIN = 0.0001;

/**
 * 1. Alias the external interface to a local name
 * @typedef {import('../rubiksCube/rubiksCube').RubiksCubeViewInterface} RubiksCubeViewInterface
 */

/**
 * 2. Use the local alias in the implements tag
 * @implements {RubiksCubeViewInterface}
 */
export default class RubiksCube3D extends Object3D {
    /**
     * @public
     * @param {RubiksCube3DSettings} cubeSettings
     */
    constructor(cubeSettings) {
        super();
        /** @type {RubiksCube3DSettings} */
        this._cubeSettings = cubeSettings ?? new RubiksCube3DSettings(1.04, 150, CubeTypes.Three, 'sine');
        /** @type {number} */
        this._pieceGap = this._cubeSettings.pieceGap;
        /** @type {import('../core').CubeType} */
        this._cubeType = this._cubeSettings.cubeType;
        /** @type {import('./cubeConfig').CubeConfig} */
        this._cubeConfig = getCubeConfig(this._cubeType);
        /** @type {Group} */
        this._mainGroup = this.createCubeGroup();
        /** @type {Group} */
        this._animationGroup = new Group();
        /** @type {GSAPAnimation | undefined} */
        this._currentAnimation = undefined;

        this.add(this._mainGroup, this._animationGroup);
        this.setStickerState(defaultStickerState(this._cubeType));
    }

    /**
     * Creates the main group containing all the pieces of the cube in their default position and rotation. Should only be called once during initialization.
     * @private
     **/
    createCubeGroup() {
        const cubeInfo = this._cubeConfig;
        const pieceGap = this._pieceGap;
        const outerLayerMultiplier = cubeInfo.outerLayerMultiplier;
        const outerLayerOffset = (cubeInfo.pieceSize * (outerLayerMultiplier - 1)) / 2;
        const group = new Group();
        const core = new Mesh(
            new RoundedBoxGeometry(2 * cubeInfo.coreSize, 2 * cubeInfo.coreSize, 2 * cubeInfo.coreSize, 3, 0.75),
            new MeshBasicMaterial({ color: 'black' }),
        );
        group.add(core);
        for (const piece of corners(this._cubeConfig.layers)) {
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
        for (const piece of edges(this._cubeConfig.layers)) {
            const edge = new EdgePiece();
            edge.scale.set(cubeInfo.pieceSize, cubeInfo.pieceSize * outerLayerMultiplier, cubeInfo.pieceSize * outerLayerMultiplier);
            edge.position.set(
                piece.position.x * (pieceGap + (Math.abs(piece.position.x) === 1 ? outerLayerOffset : 0)),
                piece.position.y * (pieceGap + (Math.abs(piece.position.y) === 1 ? outerLayerOffset : 0)),
                piece.position.z * (pieceGap + (Math.abs(piece.position.z) === 1 ? outerLayerOffset : 0)),
            );
            edge.rotation.set(piece.rotation.x, piece.rotation.y, piece.rotation.z);
            edge.userData = {
                position: Object.assign({}, piece.position),
                rotation: Object.assign({}, piece.rotation),
            };
            group.add(edge);
        }
        for (const piece of centers(this._cubeConfig.layers)) {
            const center = new CenterPiece();
            center.scale.set(cubeInfo.pieceSize, cubeInfo.pieceSize, cubeInfo.pieceSize * outerLayerMultiplier);
            center.position.set(
                piece.position.x * (pieceGap + (Math.abs(piece.position.x) === 1 ? outerLayerOffset : 0)),
                piece.position.y * (pieceGap + (Math.abs(piece.position.y) === 1 ? outerLayerOffset : 0)),
                piece.position.z * (pieceGap + (Math.abs(piece.position.z) === 1 ? outerLayerOffset : 0)),
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
     * @param {Group} group
     * @returns {(CornerPiece | EdgePiece | CenterPiece)[]}
     */
    _getPieces(group = this._mainGroup) {
        return group.children.filter((x) => x instanceof CornerPiece || x instanceof EdgePiece || x instanceof CenterPiece);
    }

    /**
     * Returns the sticker state of the cube. Can only be called when an Animation is not in progress as not all pieces would be in the main group.
     * @returns {import('../state/stickerState').StickerState}
     */
    getStickerState() {
        let state = getEmptyStickerState(this._cubeType);
        this._getPieces().forEach((piece) => {
            piece.stickers.forEach((sticker) => {
                const color = ColorToFace(sticker.color);
                const piecepos = new Vector3();
                piecepos.copy(piece.userData.position);
                const stickerpos = new Vector3();
                sticker.getWorldPosition(stickerpos);
                stickerpos.sub(piecepos);
                stickerpos.normalize();
                stickerpos.round();
                const { face, i, j } = getStickerFaceIndex(stickerpos, piece.userData.position, this._cubeConfig.layers);
                state[face][i][j] = color;
            });
        });
        return state;
    }

    /**
     * Sets the sticker state of the cube. Can only be called when an Animation is not in progress as not all pieces would be in the main group.
     * @private
     * @param {import('../state/stickerState').StickerState} stickerState
     */
    setStickerState(stickerState) {
        this._getPieces().forEach((piece) => {
            piece.stickers.forEach((sticker) => {
                const piecepos = new Vector3();
                piecepos.copy(piece.userData.position);
                const stickerpos = new Vector3();
                sticker.getWorldPosition(stickerpos);
                stickerpos.sub(piecepos);
                stickerpos.normalize();
                stickerpos.round();
                const { face, i, j } = getStickerFaceIndex(stickerpos, piece.userData.position, this._cubeConfig.layers);
                const stickerFaceValue = stickerState[face][i][j];
                sticker.color = FaceColors[stickerFaceValue];
            });
        });
    }

    /**
     * Returns the pieces that should be rotated for a given slice. If the slice has no layers, all pieces will be returned. Should only be called before an Animation is started.
     * @private
     * @param {import('../state/slice').Slice} slice
     * @returns {Object3D[]}
     */
    getRotationLayer(slice) {
        return this._getPieces().filter((piece) => {
            switch (slice.axis) {
                case Axi.x:
                    return slice.layerIds.map((id) => this._cubeConfig.layers[id]).some((layer) => Math.abs(layer - piece.userData.position.x) < ERROR_MARGIN);
                case Axi.y:
                    return slice.layerIds.map((id) => this._cubeConfig.layers[id]).some((layer) => Math.abs(layer - piece.userData.position.y) < ERROR_MARGIN);
                case Axi.z:
                    return slice.layerIds.map((id) => this._cubeConfig.layers[id]).some((layer) => Math.abs(layer - piece.userData.position.z) < ERROR_MARGIN);
            }
        });
    }

    /**
     * Updates the gap of the pieces. To be used when the cube is not rotating
     * @private
     * @param {number} pieceGap
     * @returns {void}
     */
    updateGap(pieceGap) {
        this._currentAnimation?.progress(1);
        this._pieceGap = pieceGap;
        const outerLayerMultiplier = this._cubeConfig.outerLayerMultiplier;
        const outerLayerOffset = (this._cubeConfig.pieceSize * (outerLayerMultiplier - 1)) / 2;
        this._getPieces().forEach((piece) => {
            let xOuterLayer = Math.abs(Math.abs(piece.userData.position.x) - 1) < ERROR_MARGIN;
            let yOuterLayer = Math.abs(Math.abs(piece.userData.position.y) - 1) < ERROR_MARGIN;
            let zOuterLayer = Math.abs(Math.abs(piece.userData.position.z) - 1) < ERROR_MARGIN;
            piece.position.set(
                piece.userData.position.x * (pieceGap + (xOuterLayer ? outerLayerOffset : 0)),
                piece.userData.position.y * (pieceGap + (yOuterLayer ? outerLayerOffset : 0)),
                piece.userData.position.z * (pieceGap + (zOuterLayer ? outerLayerOffset : 0)),
            );
        });
    }

    /**
     * Adds pieces in the rotationGroup back into the main group.
     * Updates the position and rotation of the pieces according to their world position and rotation, then resets the rotation of the rotation group.
     * Should only be called when a rotation is in progress.
     * @private
     * @returns {void}
     */
    clearAnimationGroup() {
        const cubeInfo = this._cubeConfig;
        const pieceGap = this._pieceGap;
        const outerLayerMultiplier = cubeInfo.outerLayerMultiplier;
        const outerLayerOffset = (cubeInfo.pieceSize * (outerLayerMultiplier - 1)) / 2;
        const middleLayers = cubeInfo.layers.slice(1, -1);
        this._getPieces(this._animationGroup).forEach((piece) => {
            piece.getWorldPosition(piece.position);
            piece.getWorldQuaternion(piece.quaternion);
            if (middleLayers.some((layer) => Math.abs(layer - piece.position.x / pieceGap) < ERROR_MARGIN)) {
                piece.userData.position.x = piece.position.x / pieceGap;
            } else {
                piece.userData.position.x = piece.position.x / (pieceGap + outerLayerOffset);
            }
            if (middleLayers.some((layer) => Math.abs(layer - piece.position.y / pieceGap) < ERROR_MARGIN)) {
                piece.userData.position.y = piece.position.y / pieceGap;
            } else {
                piece.userData.position.y = piece.position.y / (pieceGap + outerLayerOffset);
            }
            if (middleLayers.some((layer) => Math.abs(layer - piece.position.z / pieceGap) < ERROR_MARGIN)) {
                piece.userData.position.z = piece.position.z / pieceGap;
            } else {
                piece.userData.position.z = piece.position.z / (pieceGap + outerLayerOffset);
            }
            piece.userData.rotation.x = piece.rotation.x;
            piece.userData.rotation.y = piece.rotation.y;
            piece.userData.rotation.z = piece.rotation.z;
        });
        this._mainGroup.add(...this._animationGroup.children);
        this._animationGroup.rotation.set(0, 0, 0);
    }

    /**
     * @private
     * @param {import('../state/slice').Slice} slice
     */
    fillAnimationGroup(slice) {
        const pieces = this.getRotationLayer(slice);
        this._animationGroup.add(...pieces);
    }

    /**
     * @public
     * @param {number} animationSpeedMs
     */
    setCurrentAnimationSpeed(animationSpeedMs) {
        this._currentAnimation?.duration(animationSpeedMs / 1000);
    }

    /**
     * @public
     */
    reset() {
        this._currentAnimation?.progress(1);
        this.setStickerState(defaultStickerState(this._cubeType));
    }

    /**
     * @public
     * @param {import('../state/stickerState').StickerState} stickerState
     */
    setState(stickerState) {
        this._currentAnimation?.progress(1);
        this.setStickerState(stickerState);
    }

    /**
     * sets the state of the cube
     * @public
     * @param {import('../core').CubeType} cubeType
     * @returns {boolean}
     */
    setType(cubeType) {
        if (!Object.values(CubeTypes).includes(cubeType)) {
            console.error('Failed to set CubeType. Invalid CubeType.');
            return false;
        }
        this._currentAnimation?.progress(1);
        this._cubeType = cubeType;
        this._cubeConfig = getCubeConfig(cubeType);
        this.remove(this._mainGroup);
        this._mainGroup = this.createCubeGroup();
        this.add(this._mainGroup);
        this.setStickerState(defaultStickerState(cubeType));
        return true;
    }

    /**
     * @public
     * @param {import('../state/slice').Slice} slice
     * @param {{animationSpeedMs: number?, ease: gsap.EaseString | gsap.EaseFunction | undefined}} [options]
     * @returns {Promise<void>}
     */
    slice(slice, options) {
        return new Promise((resolve, reject) => {
            this._currentAnimation?.progress(1);
            this.fillAnimationGroup(slice);
            const target = { rotation: 0 };
            const animationGroup = this._animationGroup;
            let previousRotation = 0;
            this._currentAnimation = gsap.to(target, {
                rotation: (Math.abs(slice.direction) * Math.PI) / 2,
                duration: (options?.animationSpeedMs ?? this._cubeSettings.animationSpeedMs) / 1000,
                ease: options?.ease ?? this._cubeSettings.animationStyle ?? 'sine.out',
                onComplete: () => {
                    this.clearAnimationGroup();
                    resolve();
                },
                onUpdate: () => {
                    const delta = target.rotation - (previousRotation || 0);
                    animationGroup.rotateOnWorldAxis(
                        new Vector3(
                            slice.axis === Axi.x ? slice.direction : 0,
                            slice.axis === Axi.y ? slice.direction : 0,
                            slice.axis === Axi.z ? slice.direction : 0,
                        ).normalize(),
                        delta,
                    );
                    previousRotation = target.rotation;
                },
            });
        });
    }
}
