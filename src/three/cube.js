// @ts-check
import { Group, Mesh, MeshBasicMaterial, Object3D, Vector3 } from 'three';
import { CornerPiece } from './cornerPiece';
import CubeSettings from '../cube/cubeSettings';
import { ColorToFace, FaceColors, getCubeConfig } from '../cube/cubeConfig';
import { EdgePiece } from './edgePiece';
import { CenterPiece } from './centerPiece';
import { defaultStickerState, fromKociemba, getEmptyStickerState, toKociemba } from '../state/stickerState';
import { AnimationStyles, CubeTypes, Movements } from '../core';
import { AnimationState, AnimationStatus } from '../cube/animationState';
import { Axi, GetMovementSlice, GetRotationSlice } from '../state/slice';
import { RoundedBoxGeometry } from 'three/examples/jsm/Addons.js';
import { CubeState } from '../state/state';

const ERROR_MARGIN = 0.0001;

export default class RubiksCube3D extends Object3D {
    /**
     * @public
     * @param {CubeSettings} cubeSettings
     */
    constructor(cubeSettings) {
        super();
        /** @type {CubeSettings} */
        this._cubeSettings = cubeSettings ?? new CubeSettings(1.04, 150, 'fixed', CubeTypes.Three);
        /** @type {number} */
        this._pieceGap = cubeSettings.pieceGap;
        /** @type {import('../core').CubeType} */
        this._cubeType = cubeSettings.cubeType;
        /** @type {import('../cube/cubeConfig').CubeConfig} */
        this._cubeConfig = getCubeConfig(cubeSettings.cubeType);
        /** @type {import('../state/stickerState').StickerState} */
        this._initialStickerState = defaultStickerState(this._cubeType);
        /** @type {import('../state/state').CubeState} */
        this._cubeState = new CubeState(this._cubeType, this._cubeConfig.layers);
        /** @type {Group} */
        this._mainGroup = this.createCubeGroup();
        /** @type {Group} */
        this._animationGroup = new Group();
        /** @type {AnimationState[]} */
        this._animationQueue = [];
        /** @type {AnimationState | undefined} */
        this._currentAnimation = undefined;
        /** @type {number | undefined} */
        this._matchSpeed = undefined;

        this.add(this._mainGroup, this._animationGroup);
        this.setStickerState(this._initialStickerState);
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
        for (const piece of this._cubeState.corners) {
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
        for (const piece of this._cubeState.edges) {
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
        for (const piece of this._cubeState.centers) {
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
     * Returns the sticker state of the cube. Can only be called when an Animation is not in progress as not all pieces would be in the main group.
     * @private
     * @returns {import('../state/stickerState').StickerState}
     */
    getStickerState() {
        let state = getEmptyStickerState(this._cubeType);
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
                    const i = Math.round((1 - piecepos.y) / this._cubeConfig.pieceSize);
                    const j = Math.round((1 - piecepos.z) / this._cubeConfig.pieceSize);
                    state.right[i][j] = face;
                } else if (stickerpos.x === -1) {
                    const i = Math.round((1 - piecepos.y) / this._cubeConfig.pieceSize);
                    const j = Math.round((1 + piecepos.z) / this._cubeConfig.pieceSize);
                    state.left[i][j] = face;
                } else if (stickerpos.y === 1) {
                    const i = Math.round((1 + piecepos.z) / this._cubeConfig.pieceSize);
                    const j = Math.round((1 + piecepos.x) / this._cubeConfig.pieceSize);
                    state.up[i][j] = face;
                } else if (stickerpos.y === -1) {
                    const i = Math.round((1 - piecepos.z) / this._cubeConfig.pieceSize);
                    const j = Math.round((1 + piecepos.x) / this._cubeConfig.pieceSize);
                    state.down[i][j] = face;
                } else if (stickerpos.z === 1) {
                    const i = Math.round((1 - piecepos.y) / this._cubeConfig.pieceSize);
                    const j = Math.round((1 + piecepos.x) / this._cubeConfig.pieceSize);
                    state.front[i][j] = face;
                } else if (stickerpos.z === -1) {
                    const i = Math.round((1 - piecepos.y) / this._cubeConfig.pieceSize);
                    const j = Math.round((1 - piecepos.x) / this._cubeConfig.pieceSize);
                    state.back[i][j] = face;
                }
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
        this._cubeState.setState(stickerState);
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
                    const i = Math.round((1 - piecepos.y) / this._cubeConfig.pieceSize);
                    const j = Math.round((1 - piecepos.z) / this._cubeConfig.pieceSize);
                    const face = stickerState.right[i][j];
                    sticker.color = FaceColors[face];
                } else if (stickerpos.x === -1) {
                    const i = Math.round((1 - piecepos.y) / this._cubeConfig.pieceSize);
                    const j = Math.round((1 + piecepos.z) / this._cubeConfig.pieceSize);
                    const face = stickerState.left[i][j];
                    sticker.color = FaceColors[face];
                } else if (stickerpos.y === 1) {
                    const i = Math.round((1 + piecepos.z) / this._cubeConfig.pieceSize);
                    const j = Math.round((1 + piecepos.x) / this._cubeConfig.pieceSize);
                    const face = stickerState.up[i][j];
                    sticker.color = FaceColors[face];
                } else if (stickerpos.y === -1) {
                    const i = Math.round((1 - piecepos.z) / this._cubeConfig.pieceSize);
                    const j = Math.round((1 + piecepos.x) / this._cubeConfig.pieceSize);
                    const face = stickerState.down[i][j];
                    sticker.color = FaceColors[face];
                } else if (stickerpos.z === 1) {
                    const i = Math.round((1 - piecepos.y) / this._cubeConfig.pieceSize);
                    const j = Math.round((1 + piecepos.x) / this._cubeConfig.pieceSize);
                    const face = stickerState.front[i][j];
                    sticker.color = FaceColors[face];
                } else if (stickerpos.z === -1) {
                    const i = Math.round((1 - piecepos.y) / this._cubeConfig.pieceSize);
                    const j = Math.round((1 - piecepos.x) / this._cubeConfig.pieceSize);
                    const face = stickerState.back[i][j];
                    sticker.color = FaceColors[face];
                }
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
     * Updates the gap of the pieces. To be used when the cube is not rotating
     * @private
     * @param {number} pieceGap
     * @returns {void}
     */
    updateGap(pieceGap) {
        this._pieceGap = pieceGap;
        const outerLayerMultiplier = this._cubeConfig.outerLayerMultiplier;
        const outerLayerOffset = (this._cubeConfig.pieceSize * (outerLayerMultiplier - 1)) / 2;
        const corners = this._mainGroup.children.filter((x) => x instanceof CornerPiece);
        const edges = this._mainGroup.children.filter((x) => x instanceof EdgePiece);
        const centers = this._mainGroup.children.filter((x) => x instanceof CenterPiece);
        [...corners, ...edges, ...centers].forEach((piece) => {
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
     * @private
     * @param {import('../core').CubeType} cubeType
     */
    updateCubeType(cubeType) {
        this._cubeType = cubeType;
        this._cubeConfig = getCubeConfig(cubeType);
        this.remove(this._mainGroup);
        this._mainGroup = this.createCubeGroup();
        this.add(this._mainGroup);
        this.setStickerState(this._initialStickerState);
    }

    /**
     * finish current rotation and clear rotation queue
     * @private
     */
    stop() {
        this._animationQueue.forEach((cubeRotation) => cubeRotation.failedCallback('Movement Interrupted.'));
        this._animationQueue = [];
        if (this._currentAnimation) {
            const percentage = this._currentAnimation.update(0);
            this.rotateGroupByPercent(this._currentAnimation, percentage);
            if (this._currentAnimation.status !== AnimationStatus.Complete) {
                throw new Error('Failed to complete current rotation during stop');
            }
            this.clearRotationGroup();
            const state = toKociemba(this.getStickerState());
            this._currentAnimation.complete(state);
            this._currentAnimation = undefined;
        }
    }

    /**
     * Adds pieces in the rotationGroup back into the main group.
     * Updates the position and rotation of the pieces according to their world position and rotation, then resets the rotation of the rotation group.
     * Should only be called when a rotation is in progress.
     * @private
     * @returns {void}
     */
    clearRotationGroup() {
        const cubeInfo = this._cubeConfig;
        const pieceGap = this._pieceGap;
        const outerLayerMultiplier = cubeInfo.outerLayerMultiplier;
        const outerLayerOffset = (cubeInfo.pieceSize * (outerLayerMultiplier - 1)) / 2;
        const middleLayers = cubeInfo.layers.slice(1, -1);
        const corners = this._animationGroup.children.filter((x) => x instanceof CornerPiece);
        const edges = this._animationGroup.children.filter((x) => x instanceof EdgePiece);
        const centers = this._animationGroup.children.filter((x) => x instanceof CenterPiece);
        [...centers, ...corners, ...edges].forEach((piece) => {
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
     * Rotates the pieces in the rotation group according to the percentage of completion of the current animation. Should only be called when a rotation is in progress.
     * @private
     * @param {number} percentage
     * @param {AnimationState} animationState
     */
    rotateGroupByPercent(animationState, percentage) {
        const radians = (Math.abs(animationState.slice.direction) * ((percentage / 100) * Math.PI)) / 2;
        this._animationGroup.rotateOnWorldAxis(
            new Vector3(
                animationState.slice.axis === Axi.x ? animationState.slice.direction : 0,
                animationState.slice.axis === Axi.y ? animationState.slice.direction : 0,
                animationState.slice.axis === Axi.z ? animationState.slice.direction : 0,
            ).normalize(),
            radians,
        );
    }

    /**
     *
     * calculates the current speed of the current rotation in ms.
     * calculation is dependent on animation style and animation speed settings
     * - exponential: speeds up rotations depending on the queue length
     * - next: an animation speed of 0 when there is another animation in the queue
     * - match: will match the speed of rotations to the frequency of key presses.
     * - fixed: will return a constant value
     * @private
     * @returns {number}
     */
    getRotationSpeed() {
        if (this._currentAnimation?.overwriteAnimationSpeedMs != null) {
            return this._currentAnimation?.overwriteAnimationSpeedMs;
        }
        if (this._cubeSettings.animationStyle === AnimationStyles.Exponential) {
            return this._cubeSettings.animationSpeedMs / 1.5 ** this._animationQueue.length;
        }
        if (this._cubeSettings.animationStyle === AnimationStyles.Linear) {
            return this._cubeSettings.animationSpeedMs / (1 + this._animationQueue.length);
        }
        if (this._cubeSettings.animationStyle === AnimationStyles.Next) {
            return this._animationQueue.length > 0 ? 0 : this._cubeSettings.animationSpeedMs;
        }
        if (this._cubeSettings.animationStyle === AnimationStyles.Match) {
            if (this._animationQueue.length > 0) {
                const gaps = this._animationQueue.map((state, index) => {
                    if (index === 0 && this._currentAnimation != null) {
                        return state.timestampMs - this._currentAnimation.timestampMs;
                    }
                    if (index === 0) {
                        return this._matchSpeed ?? this._cubeSettings.animationSpeedMs;
                    }
                    return state.timestampMs - this._animationQueue[index - 1].timestampMs;
                });
                const minimumSpeed = this._cubeSettings.animationSpeedMs / 5;
                this._matchSpeed = Math.max(Math.min(...gaps), minimumSpeed);
            }
            if (this._matchSpeed !== undefined) {
                return this._matchSpeed;
            }
            return this._cubeSettings.animationSpeedMs;
        }
        if (this._cubeSettings.animationStyle === AnimationStyles.Fixed) {
            return this._cubeSettings.animationSpeedMs;
        }
        return this._cubeSettings.animationSpeedMs;
    }

    completeAnimationQueue() {
        while (true) {
            if (this._currentAnimation === undefined) {
                this._currentAnimation = this._animationQueue.shift();
                if (this._currentAnimation === undefined) {
                    break;
                }
            }
            if (this._currentAnimation) {
                const percentage = this._currentAnimation.update(0);
                this.rotateGroupByPercent(this._currentAnimation, percentage);
                if (this._currentAnimation.status !== AnimationStatus.Complete) {
                    throw new Error('Failed to complete current rotation during completeAnimationQueue');
                }
                this.clearRotationGroup();
                const state = toKociemba(this.getStickerState());
                this._currentAnimation.complete(state);
            }
            this._currentAnimation = this._animationQueue.shift();
        }
    }

    /**
     * Update the cube and continue any rotations. If a rotation is in progress, it will be updated. If no rotation is in progress, the next rotation in the queue will be started.
     * @public
     */
    update() {
        if (this._currentAnimation === undefined) {
            if (this._pieceGap !== this._cubeSettings.pieceGap) {
                this.updateGap(this._cubeSettings.pieceGap);
            }
            if (this._cubeType !== this._cubeSettings.cubeType) {
                this.updateCubeType(this._cubeSettings.cubeType);
            }
            this._currentAnimation = this._animationQueue.shift();
            if (this._currentAnimation === undefined) {
                this._matchSpeed = undefined; // reset speed for the match animation options
                return;
            }
            if (this._currentAnimation.slice.layers.length === 0) {
                console.error('current rotation has no layers. ');
                this._currentAnimation.complete(toKociemba(this.getStickerState()));
                this._currentAnimation = undefined;
                return;
            }
            this._cubeState.slice(this._currentAnimation.slice);
        }
        if (this._currentAnimation.status === AnimationStatus.Pending) {
            this._animationGroup.add(...this.getRotationLayer(this._currentAnimation.slice));
            this._currentAnimation.initialise();
        }
        if (this._currentAnimation.status === AnimationStatus.Initialised || this._currentAnimation.status === AnimationStatus.InProgress) {
            let speed = this.getRotationSpeed();
            const percentage = this._currentAnimation.update(speed);
            this.rotateGroupByPercent(this._currentAnimation, percentage);
        }
        if (this._currentAnimation.status === AnimationStatus.Complete) {
            this.clearRotationGroup();
            this._currentAnimation.complete(toKociemba(this.getStickerState()));
            this._currentAnimation = undefined;
        }
    }

    /**
     * resets the cube to the default state and clears any queued rotations. If a rotation is in progress, it will be completed instantly before the reset.
     * @public
     * @param {(state: string) => void } completedCallback
     */
    reset(completedCallback) {
        this.stop();
        this.setStickerState(this._initialStickerState);
        completedCallback(toKociemba(this.getStickerState()));
    }

    /**
     * sets the state of the cube clears any pending animations
     * @public
     * @param {string} state
     * @param {(state: string) => void } completedCallback
     * @param {(reason: string) => void } failedCallback
     */
    setState(state, completedCallback, failedCallback) {
        const stickerState = fromKociemba(state, this._cubeType);
        if (stickerState == null) {
            failedCallback('Invalid Kociemba State');
            return;
        }
        this.stop();
        this.setStickerState(stickerState);
        completedCallback(toKociemba(this.getStickerState()));
    }

    /**
     * sets the state of the cube
     * @public
     * @param {import('../core').CubeType} cubeType
     * @param {(state: string) => void } completedCallback
     * @param {(reason: string) => void} failedCallback
     */
    setType(cubeType, completedCallback, failedCallback) {
        if (!Object.values(CubeTypes).includes(cubeType)) {
            failedCallback('Failed to set CubeType. Invalid CubeType.');
        }
        this.stop();
        this._cubeType = cubeType;
        this._cubeConfig = getCubeConfig(cubeType);
        this._initialStickerState = defaultStickerState(cubeType);
        this._cubeState = new CubeState(this._cubeType, this._cubeConfig.layers);
        this.remove(this._mainGroup);
        this._mainGroup = this.createCubeGroup();
        this.add(this._mainGroup);
        this.setStickerState(this._initialStickerState);
        completedCallback(toKociemba(this.getStickerState()));
    }

    /**
     *  @public
     *  @param {import('../core').Rotation} rotation
     *  @param {((state: string) => void )} completedCallback
     *  @param {((reason: string) => void )} failedCallback
     *  @param {import('../core').AnimationOptions} [options]
     */
    rotate(rotation, completedCallback, failedCallback, options) {
        if (options?.reverse) {
            if (rotation.charAt(-1) === "'") {
                rotation = /** @type {import('../core').Rotation} */ (rotation.slice(0, -1));
            } else {
                rotation = rotation + "'";
            }
        }
        const slice = GetRotationSlice(rotation, this._cubeConfig.layers);
        if (slice == null) {
            failedCallback('Invalid Rotation');
            return;
        }
        this._animationQueue.push(new AnimationState(slice, completedCallback, failedCallback, options?.animationSpeedMs));
    }

    /**
     *  @public
     *  @param {import('../core').Movement} movement
     *  @param {((state: string) => void )} completedCallback
     *  @param {((reason: string) => void )} failedCallback
     *  @param {import('../core').AnimationOptions} [options]
     */
    movement(movement, completedCallback, failedCallback, options) {
        if (options?.reverse) {
            if (movement.at(-1) === "'") {
                movement = /** @type {import('../core').Movement} */ (movement.slice(0, -1));
            } else {
                movement = movement + "'";
            }
        }
        if (options?.translate) {
            if (Object.values(Movements.Wide).includes(/** @type {import('../core').WideMove} **/ (movement))) {
                movement = this._cubeConfig.layers.length - 1 + movement;
            }
        }
        const slice = GetMovementSlice(movement, this._cubeConfig.layers);
        if (slice == null) {
            failedCallback('Invalid Movement');
            return;
        }
        this._animationQueue.push(new AnimationState(slice, completedCallback, failedCallback, options?.animationSpeedMs));
    }
}
