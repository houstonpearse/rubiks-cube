// @ts-check
import { Group, Mesh, MeshBasicMaterial, Object3D, SphereGeometry, Vector3 } from 'three';
import { CornerPiece } from './cornerPiece';
import CubeSettings from '../cube/cubeSettings';
import { ColorToFace, FaceColors, getCubeInfo } from '../cube/cubeState';
import { EdgePiece } from './edgePiece';
import { CenterPiece } from './centerPiece';
import { fromKociemba, getEmptyStickerState, toKociemba } from '../cube/stickerState';
import { AnimationStyles, CubeTypes } from '../core';
import { AnimationState, AnimationStatus } from '../cube/animationState';
import { Axi, GetLayerSlice, GetRotationSlice } from '../cube/animationSlice';

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
        /** @type {import('../cube/cubeState').CubeInfo} */
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
        this.add(this._mainGroup, this._rotationGroup);
        this.setStickerState(this._cubeInfo.initialStickerState);
    }

    /**
     * Creates the main group containing all the pieces of the cube in their default position and rotation. Should only be called once during initialization.
     * @private
     **/
    createCubeGroup() {
        const cubeInfo = this._cubeInfo;
        const pieceGap = this._pieceGap;
        const outerLayerMultiplier = cubeInfo.outerLayerMultiplier;
        const outerLayerOffset = (cubeInfo.pieceSize * (outerLayerMultiplier - 1)) / 2;
        const group = new Group();
        const core = new Mesh(new SphereGeometry(cubeInfo.coreSize), new MeshBasicMaterial({ color: 'black' }));
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
     * Returns the sticker state of the cube. Can only be called when an Animation is not in progress as not all pieces would be in the main group.
     * @private
     * @returns {import('../cube/stickerState').StickerState}
     */
    getStickerState() {
        let state = getEmptyStickerState(this._cubeInfo.cubeType);
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
     * Sets the sticker state of the cube. Can only be called when an Animation is not in progress as not all pieces would be in the main group.
     * @private
     * @param {import('../cube/stickerState').StickerState} stickerState
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
                    const i = Math.round((1 - piecepos.y) / this._cubeInfo.pieceSize);
                    const j = Math.round((1 - piecepos.z) / this._cubeInfo.pieceSize);
                    const face = stickerState.right[i][j];
                    sticker.color = FaceColors[face];
                } else if (stickerpos.x === -1) {
                    const i = Math.round((1 - piecepos.y) / this._cubeInfo.pieceSize);
                    const j = Math.round((1 + piecepos.z) / this._cubeInfo.pieceSize);
                    const face = stickerState.left[i][j];
                    sticker.color = FaceColors[face];
                } else if (stickerpos.y === 1) {
                    const i = Math.round((1 + piecepos.z) / this._cubeInfo.pieceSize);
                    const j = Math.round((1 + piecepos.x) / this._cubeInfo.pieceSize);
                    const face = stickerState.up[i][j];
                    sticker.color = FaceColors[face];
                } else if (stickerpos.y === -1) {
                    const i = Math.round((1 - piecepos.z) / this._cubeInfo.pieceSize);
                    const j = Math.round((1 + piecepos.x) / this._cubeInfo.pieceSize);
                    const face = stickerState.down[i][j];
                    sticker.color = FaceColors[face];
                } else if (stickerpos.z === 1) {
                    const i = Math.round((1 - piecepos.y) / this._cubeInfo.pieceSize);
                    const j = Math.round((1 + piecepos.x) / this._cubeInfo.pieceSize);
                    const face = stickerState.front[i][j];
                    sticker.color = FaceColors[face];
                } else if (stickerpos.z === -1) {
                    const i = Math.round((1 - piecepos.y) / this._cubeInfo.pieceSize);
                    const j = Math.round((1 - piecepos.x) / this._cubeInfo.pieceSize);
                    const face = stickerState.back[i][j];
                    sticker.color = FaceColors[face];
                }
            });
        });
    }

    /**
     * Returns the pieces that should be rotated for a given slice. If the slice has no layers, all pieces will be returned. Should only be called before an Animation is started.
     * @private
     * @param {import('../cube/animationSlice').Slice} slice
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
     * Updates the gap of the pieces. To be used when the cube is not rotating
     * @private
     * @param {number} pieceGap
     * @returns {void}
     */
    updateGap(pieceGap) {
        this._pieceGap = pieceGap;
        const outerLayerMultiplier = this._cubeInfo.outerLayerMultiplier;
        const outerLayerOffset = (this._cubeInfo.pieceSize * (outerLayerMultiplier - 1)) / 2;
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
        this._cubeInfo = getCubeInfo(cubeType);
        this.remove(this._mainGroup);
        this._mainGroup = this.createCubeGroup();
        this.add(this._mainGroup);
    }

    /**
     * finish current rotation and clear rotation queue
     * @private
     */
    stop() {
        this._rotationQueue.forEach((cubeRotation) => cubeRotation.failedCallback('Movement Interrupted.'));
        this._rotationQueue = [];
        if (this._currentRotation) {
            const percentage = this._currentRotation.update(0);
            this.rotateGroupByPercent(this._currentRotation, percentage);
            if (this._currentRotation.status !== AnimationStatus.Complete) {
                throw new Error('Failed to complete current rotation during stop');
            }
            this.clearRotationGroup();
            const state = toKociemba(this.getStickerState());
            this._currentRotation.complete(state);
            this._currentRotation = undefined;
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
        const cubeInfo = this._cubeInfo;
        const pieceGap = this._pieceGap;
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
     * Rotates the pieces in the rotation group according to the percentage of completion of the current animation. Should only be called when a rotation is in progress.
     * @private
     * @param {number} percentage
     * @param {AnimationState} animationState
     */
    rotateGroupByPercent(animationState, percentage) {
        const radians = (Math.abs(animationState.slice.direction) * ((percentage / 100) * Math.PI)) / 2;
        this._rotationGroup.rotateOnWorldAxis(
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
        if (this._cubeSettings.animationStyle === AnimationStyles.Exponential) {
            return this._cubeSettings.animationSpeedMs / 2 ** this._rotationQueue.length;
        }
        if (this._cubeSettings.animationStyle === AnimationStyles.Next) {
            return this._rotationQueue.length > 0 ? 0 : this._cubeSettings.animationSpeedMs;
        }
        if (this._cubeSettings.animationStyle === AnimationStyles.Match) {
            if (this._rotationQueue.length > 0) {
                const gaps = this._rotationQueue.map((state, index) => {
                    if (index == 0 && this._currentRotation != null) {
                        return state.timestampMs - this._currentRotation.timestampMs;
                    }
                    if (index == 0) {
                        return this._matchSpeed ?? this._cubeSettings.animationSpeedMs;
                    }
                    return state.timestampMs - this._rotationQueue[index - 1].timestampMs;
                });
                this._matchSpeed = Math.min(...gaps);
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

    /**
     * Update the cube and continue any rotations. If a rotation is in progress, it will be updated. If no rotation is in progress, the next rotation in the queue will be started.
     * @public
     */
    update() {
        if (this._currentRotation === undefined) {
            if (this._pieceGap !== this._cubeSettings.pieceGap) {
                this.updateGap(this._cubeSettings.pieceGap);
            }
            if (this._cubeType !== this._cubeSettings.cubeType) {
                this.updateCubeType(this._cubeSettings.cubeType);
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
            var speed = this.getRotationSpeed();
            const percentage = this._currentRotation.update(speed);
            this.rotateGroupByPercent(this._currentRotation, percentage);
        }
        if (this._currentRotation.status === AnimationStatus.Complete) {
            this.clearRotationGroup();
            this._currentRotation.complete(toKociemba(this.getStickerState()));
            this._currentRotation = undefined;
        }
        return;
    }

    /**
     * resets the cube to the default state and clears any queued rotations. If a rotation is in progress, it will be completed instantly before the reset.
     * @public
     * @param {(state: string) => boolean} completedCallback
     */
    reset(completedCallback) {
        this.stop();
        this.setStickerState(this._cubeInfo.initialStickerState);
        if (!completedCallback(toKociemba(this.getStickerState()))) {
            console.error('Failed to invoke reset completedCallback');
        }
    }

    /**
     * sets the state of the cube
     * @public
     * @param {string} state
     * @param {(state: string) => boolean} completedCallback
     * @param {(reason: string) => boolean} failedCallback
     */
    setState(state, completedCallback, failedCallback) {
        const stickerState = fromKociemba(state, this._cubeType);
        if (stickerState == null) {
            if (!failedCallback('Invalid Kociemba State')) {
                console.error('Failed to invoke setState failedCallback');
            }
            return;
        }
        this.stop();
        this.setStickerState(stickerState);
        if (!completedCallback(toKociemba(this.getStickerState()))) {
            console.error('Failed to invoke setState completedCallback');
        }
    }

    /**
     *  @public
     *  @param {import('../core').Rotation} rotation
     *  @param {((state: string) => void )} completedCallback
     *  @param {((reason: string) => void )} failedCallback
     */
    rotate(rotation, completedCallback, failedCallback) {
        const slice = GetRotationSlice(rotation);
        this._rotationQueue.push(new AnimationState(slice, completedCallback, failedCallback));
    }

    /**
     *  @public
     *  @param {import('../core').Movement} movement
     *  @param {((state: string) => void )} completedCallback
     *  @param {((reason: string) => void )} failedCallback
     */
    movement(movement, completedCallback, failedCallback) {
        const slice = GetLayerSlice(movement, this._cubeInfo.cubeType);
        this._rotationQueue.push(new AnimationState(slice, completedCallback, failedCallback));
    }
}
