import { Group } from 'three';
import { createCoreMesh } from './pieces';
import { createCubeState } from '../cube/cubeState';

/**
 *
 * @param {number} pieceGap
 * @returns {Group}
 */
export function createCubeGroup(pieceGap) {
    const group = new Group();
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
        pieceGroup.position.set(piece.position.x * pieceGap, piece.position.y * pieceGap, piece.position.z * pieceGap);
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
