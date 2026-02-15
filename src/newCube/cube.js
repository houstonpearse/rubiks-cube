// @ts-check
import { Group, Mesh, Object3D, SphereGeometry } from 'three';
import { CornerPiece } from './cornerPiece';
import CubeSettings from '../cube/cubeSettings';
import { getCubeInfo } from './cubeState';
import { EdgePiece } from './edgePiece';
import { CenterPiece } from './centerPiece';
import Materials from '../threejs/materials';

export default class NewRubiksCube3D extends Object3D {
    /**
     *   @param {CubeSettings} cubeSettings
     */
    constructor(cubeSettings) {
        super();
        /** @type {CubeSettings} */
        this._cubeSettings = cubeSettings;
        /** @type {Group} */
        this._mainGroup = this.createCubeGroup();
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
    }

    createCubeGroup() {
        const cubeInfo = getCubeInfo(this._cubeSettings.cubeType);
        const pieceGap = this._cubeSettings.pieceGap;
        const outerLayerMultiplier = cubeInfo.outlerLayerMultiplier;
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
}
