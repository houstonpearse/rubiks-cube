/** @typedef {{axis: import('../core').Axis, layers: (-1|0|1)[], direction: 1|-1|2|-2}} Slice */

import { Axi, Movements, Rotations } from '../core';

/**
 * @param {import("../core").Movement} movement
 * @returns {Slice}
 */
export default function GetMovementSlice(movement) {
    switch (movement) {
        // Up
        case Movements.U:
            return { axis: Axi.y, layers: [1], direction: -1 };
        case Movements.U2:
            return { axis: Axi.y, layers: [1], direction: -2 };
        case Movements.UP:
            return { axis: Axi.y, layers: [1], direction: 1 };
        case Movements.u:
            return { axis: Axi.y, layers: [1, 0], direction: -1 };
        case Movements.u2:
            return { axis: Axi.y, layers: [1, 0], direction: -2 };
        case Movements.uP:
            return { axis: Axi.y, layers: [1, 0], direction: 1 };
        // Down
        case Movements.D:
            return { axis: Axi.y, layers: [-1], direction: -1 };
        case Movements.D2:
            return { axis: Axi.y, layers: [-1], direction: -2 };
        case Movements.DP:
            return { axis: Axi.y, layers: [-1], direction: 1 };
        case Movements.d:
            return { axis: Axi.y, layers: [-1, 0], direction: -1 };
        case Movements.d2:
            return { axis: Axi.y, layers: [-1, 0], direction: -2 };
        case Movements.dP:
            return { axis: Axi.y, layers: [-1, 0], direction: 1 };
        // Right
        case Movements.R:
            return { axis: Axi.x, layers: [1], direction: -1 };
        case Movements.R2:
            return { axis: Axi.x, layers: [1], direction: -2 };
        case Movements.RP:
            return { axis: Axi.x, layers: [1], direction: 1 };
        case Movements.r:
            return { axis: Axi.x, layers: [1, 0], direction: -1 };
        case Movements.r2:
            return { axis: Axi.x, layers: [1, 0], direction: -2 };
        case Movements.rP:
            return { axis: Axi.x, layers: [1, 0], direction: 1 };
        // Left
        case Movements.L:
            return { axis: Axi.x, layers: [-1], direction: -1 };
        case Movements.L2:
            return { axis: Axi.x, layers: [-1], direction: -2 };
        case Movements.LP:
            return { axis: Axi.x, layers: [-1], direction: 1 };
        case Movements.l:
            return { axis: Axi.x, layers: [-1, 0], direction: -1 };
        case Movements.l2:
            return { axis: Axi.x, layers: [-1, 0], direction: -2 };
        case Movements.lP:
            return { axis: Axi.x, layers: [-1, 0], direction: 1 };
        // Front
        case Movements.F:
            return { axis: Axi.z, layers: [1], direction: -1 };
        case Movements.F2:
            return { axis: Axi.z, layers: [1], direction: -2 };
        case Movements.FP:
            return { axis: Axi.z, layers: [1], direction: 1 };
        case Movements.f:
            return { axis: Axi.z, layers: [1, 0], direction: -1 };
        case Movements.f2:
            return { axis: Axi.z, layers: [1, 0], direction: -2 };
        case Movements.fP:
            return { axis: Axi.z, layers: [1, 0], direction: 1 };
        // Back
        case Movements.B:
            return { axis: Axi.z, layers: [-1], direction: -1 };
        case Movements.B2:
            return { axis: Axi.z, layers: [-1], direction: -2 };
        case Movements.BP:
            return { axis: Axi.z, layers: [-1], direction: 1 };
        case Movements.b:
            return { axis: Axi.z, layers: [-1, 0], direction: -1 };
        case Movements.b2:
            return { axis: Axi.z, layers: [-1, 0], direction: -2 };
        case Movements.bP:
            return { axis: Axi.z, layers: [-1, 0], direction: 1 };
        //Middle
        case Movements.M:
            return { axis: Axi.x, layers: [0], direction: -1 };
        case Movements.M2:
            return { axis: Axi.x, layers: [0], direction: -2 };
        case Movements.MP:
            return { axis: Axi.x, layers: [0], direction: 1 };
        //Equator
        case Movements.E:
            return { axis: Axi.y, layers: [0], direction: -1 };
        case Movements.E2:
            return { axis: Axi.y, layers: [0], direction: -2 };
        case Movements.EP:
            return { axis: Axi.y, layers: [0], direction: 1 };
        //Slice
        case Movements.S:
            return { axis: Axi.z, layers: [0], direction: -1 };
        case Movements.S2:
            return { axis: Axi.z, layers: [0], direction: -2 };
        case Movements.SP:
            return { axis: Axi.z, layers: [0], direction: 1 };
        default:
            throw Error(`Failed to get movement slice. invalid movement: ${movement}`);
    }
}

/**
 * @param {import("../core").Rotation} rotation
 * @returns {Slice}
 */
export function GetRotationSlice(rotation) {
    switch (rotation) {
        case Rotations.x:
            return { axis: Axi.x, layers: [], direction: -1 };
        case Rotations.x2:
            return { axis: Axi.x, layers: [], direction: -2 };
        case Rotations.xP:
            return { axis: Axi.x, layers: [], direction: 1 };
        case Rotations.y:
            return { axis: Axi.y, layers: [], direction: -1 };
        case Rotations.y2:
            return { axis: Axi.y, layers: [], direction: -2 };
        case Rotations.yP:
            return { axis: Axi.y, layers: [], direction: 1 };
        case Rotations.z:
            return { axis: Axi.z, layers: [], direction: -1 };
        case Rotations.z2:
            return { axis: Axi.z, layers: [], direction: -2 };
        case Rotations.zP:
            return { axis: Axi.z, layers: [], direction: 1 };
        default:
            throw Error(`Failed to get rotation slice. invalid rotation: ${rotation}`);
    }
}
