// @ts-check
/** @typedef {{axis: import('../core').Axis, layers: number[], direction: number}} Slice */

import { Axi, Movements, OuterBlockMovements, Rotations } from '../core';
import { getMiddleLayers } from './cubeState';

/**
 * @param {import("../core").Movement} movement
 * @param {import('../core').CubeType} cubeType
 * @returns {Slice}
 */
export function GetMovementSlice(movement, cubeType) {
    const middleLayers = getMiddleLayers(cubeType);
    switch (movement) {
        // Up
        case Movements.U:
            return { axis: Axi.y, layers: [1], direction: -1 };
        case Movements.U2:
            return { axis: Axi.y, layers: [1], direction: -2 };
        case Movements.UP:
            return { axis: Axi.y, layers: [1], direction: 1 };
        case Movements.u:
            return { axis: Axi.y, layers: [1, ...middleLayers], direction: -1 };
        case Movements.u2:
            return { axis: Axi.y, layers: [1, ...middleLayers], direction: -2 };
        case Movements.uP:
            return { axis: Axi.y, layers: [1, ...middleLayers], direction: 1 };
        // Down
        case Movements.D:
            return { axis: Axi.y, layers: [-1], direction: -1 };
        case Movements.D2:
            return { axis: Axi.y, layers: [-1], direction: -2 };
        case Movements.DP:
            return { axis: Axi.y, layers: [-1], direction: 1 };
        case Movements.d:
            return { axis: Axi.y, layers: [-1, ...middleLayers], direction: -1 };
        case Movements.d2:
            return { axis: Axi.y, layers: [-1, ...middleLayers], direction: -2 };
        case Movements.dP:
            return { axis: Axi.y, layers: [-1, ...middleLayers], direction: 1 };
        // Right
        case Movements.R:
            return { axis: Axi.x, layers: [1], direction: -1 };
        case Movements.R2:
            return { axis: Axi.x, layers: [1], direction: -2 };
        case Movements.RP:
            return { axis: Axi.x, layers: [1], direction: 1 };
        case Movements.r:
            return { axis: Axi.x, layers: [1, ...middleLayers], direction: -1 };
        case Movements.r2:
            return { axis: Axi.x, layers: [1, ...middleLayers], direction: -2 };
        case Movements.rP:
            return { axis: Axi.x, layers: [1, ...middleLayers], direction: 1 };
        // Left
        case Movements.L:
            return { axis: Axi.x, layers: [-1], direction: -1 };
        case Movements.L2:
            return { axis: Axi.x, layers: [-1], direction: -2 };
        case Movements.LP:
            return { axis: Axi.x, layers: [-1], direction: 1 };
        case Movements.l:
            return { axis: Axi.x, layers: [-1, ...middleLayers], direction: -1 };
        case Movements.l2:
            return { axis: Axi.x, layers: [-1, ...middleLayers], direction: -2 };
        case Movements.lP:
            return { axis: Axi.x, layers: [-1, ...middleLayers], direction: 1 };
        // Front
        case Movements.F:
            return { axis: Axi.z, layers: [1], direction: -1 };
        case Movements.F2:
            return { axis: Axi.z, layers: [1], direction: -2 };
        case Movements.FP:
            return { axis: Axi.z, layers: [1], direction: 1 };
        case Movements.f:
            return { axis: Axi.z, layers: [1, ...middleLayers], direction: -1 };
        case Movements.f2:
            return { axis: Axi.z, layers: [1, ...middleLayers], direction: -2 };
        case Movements.fP:
            return { axis: Axi.z, layers: [1, ...middleLayers], direction: 1 };
        // Back
        case Movements.B:
            return { axis: Axi.z, layers: [-1], direction: -1 };
        case Movements.B2:
            return { axis: Axi.z, layers: [-1], direction: -2 };
        case Movements.BP:
            return { axis: Axi.z, layers: [-1], direction: 1 };
        case Movements.b:
            return { axis: Axi.z, layers: [-1, ...middleLayers], direction: -1 };
        case Movements.b2:
            return { axis: Axi.z, layers: [-1, ...middleLayers], direction: -2 };
        case Movements.bP:
            return { axis: Axi.z, layers: [-1, ...middleLayers], direction: 1 };
        //Middle
        case Movements.M:
            return { axis: Axi.x, layers: [...middleLayers], direction: -1 };
        case Movements.M2:
            return { axis: Axi.x, layers: [...middleLayers], direction: -2 };
        case Movements.MP:
            return { axis: Axi.x, layers: [...middleLayers], direction: 1 };
        //Equator
        case Movements.E:
            return { axis: Axi.y, layers: [...middleLayers], direction: -1 };
        case Movements.E2:
            return { axis: Axi.y, layers: [...middleLayers], direction: -2 };
        case Movements.EP:
            return { axis: Axi.y, layers: [...middleLayers], direction: 1 };
        //Slice
        case Movements.S:
            return { axis: Axi.z, layers: [...middleLayers], direction: -1 };
        case Movements.S2:
            return { axis: Axi.z, layers: [...middleLayers], direction: -2 };
        case Movements.SP:
            return { axis: Axi.z, layers: [...middleLayers], direction: 1 };
        default:
            throw Error(`Failed to get movement slice. invalid movement: ${movement}`);
    }
}

/**
 * @param { import("../core").WideMove | import("../core").TwoMove | import("../core").ThreeMove | import("../core").FourMove | import("../core").FiveMove | import('../core').SixMove} outerBlockMovement
 * @param {import('../core').CubeType} cubeType
 * @returns {Slice}
 */
function GetLayerSlice(outerBlockMovement, cubeType) {
    const middleLayers = getMiddleLayers(cubeType);
    const result = RegExp(`^([23456])?([RLUDFB]w|[RLUDFB]|[rludfb])([123])?(\')?$`).exec(outerBlockMovement);
    if (result == null) {
        throw new Error(`Failed to parse outerBlockMovement. invalid movement: ${outerBlockMovement}`);
    }
    const layerNumber = result[1] ? parseInt(result[1]) : 2;
    if (layerNumber > middleLayers.length + 1) {
        throw new Error(`Failed to parse outerBlockMovement. layer number ${layerNumber} is too large for cube type ${cubeType}`);
    }
    const movementType = result[2];
    const rotationNumber = result[3] ? parseInt(result[3]) : 1;
    const isPrime = result[4] === '`';
    const direction = (isPrime ? -1 : 1) * rotationNumber;

    const axis = (() => {
        switch (movementType) {
            case 'R':
            case 'Rw':
            case 'r':
            case 'L':
            case 'Lw':
            case 'l':
                return Axi.x;
            case 'U':
            case 'Uw':
            case 'u':
            case 'D':
            case 'Dw':
            case 'd':
                return Axi.y;
            case 'F':
            case 'Fw':
            case 'f':
            case 'B':
            case 'Bw':
            case 'b':
                return Axi.z;
            default:
                throw new Error(`Failed to parse outerBlockMovement. invalid movement: ${outerBlockMovement}`);
        }
    })();

    switch (movementType) {
        case 'R':
        case 'U':
        case 'F':
            var layer = middleLayers[middleLayers.length - (layerNumber - 1)];
            return { axis, layers: [layer], direction };
        case 'L':
        case 'D':
        case 'B':
            var layer = middleLayers[layerNumber - 2];
            return { axis, layers: [layer], direction };
        case 'Rw':
        case 'r':
        case 'Uw':
        case 'u':
        case 'Fw':
        case 'f':
            var layers = middleLayers.slice(middleLayers.length - (layerNumber - 1));
            return { axis, layers: [1, ...layers], direction };
        case 'Lw':
        case 'l':
        case 'Dw':
        case 'd':
        case 'Bw':
        case 'b':
            var layers = middleLayers.slice(0, layerNumber - 2);
            return { axis, layers: [-1, ...layers], direction };
        default:
            throw new Error(`Failed to parse outerBlockMovement. invalid movement: ${outerBlockMovement}`);
    }
}

/**
 * @param {import("../core").OuterBlockMovement} outerBlockMovement
 * @param {import('../core').CubeType} cubeType
 * @returns {Slice}
 */
export function GetOuterBlockMovementSlice(outerBlockMovement, cubeType) {
    switch (outerBlockMovement) {
        case Object.values(OuterBlockMovements.Single).find((move) => move === outerBlockMovement):
            return GetMovementSlice(outerBlockMovement, cubeType);
        case Object.values(OuterBlockMovements.Wide).find((move) => move === outerBlockMovement):
        case Object.values(OuterBlockMovements.Two).find((move) => move === outerBlockMovement):
        case Object.values(OuterBlockMovements.Three).find((move) => move === outerBlockMovement):
        case Object.values(OuterBlockMovements.Four).find((move) => move === outerBlockMovement):
        case Object.values(OuterBlockMovements.Five).find((move) => move === outerBlockMovement):
        case Object.values(OuterBlockMovements.Six).find((move) => move === outerBlockMovement):
            return GetLayerSlice(outerBlockMovement, cubeType);
        default:
            throw Error(`Failed to get outer block movement slice. invalid movement: ${outerBlockMovement}`);
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
