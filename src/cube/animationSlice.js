// @ts-check
import { Rotations } from '../core';
import { getAllLayers } from './cubeState';

/** @typedef {typeof Axi[keyof typeof Axi]} Axis */
export const Axi = Object.freeze({
    x: 'x',
    y: 'y',
    z: 'z',
});

/** @typedef {{axis: Axis, layers: number[], direction: number}} Slice */

/**
 * @param {import('../core').Movement } outerBlockMovement
 * @param {import('../core').CubeType} cubeType
 * @param {boolean} prioritiseStandardMovement
 * @returns {Slice | undefined}
 */
export function GetLayerSlice(outerBlockMovement, cubeType, prioritiseStandardMovement = false) {
    const layers = getAllLayers(cubeType);
    const result = RegExp(`^([1234567]|[123456]-[1234567])?([RLUDFB]w|[RLUDFBMES]|[rludfbmes])([123])?(\')?$`).exec(outerBlockMovement);
    if (result == null) {
        console.error(`Failed to parse outerBlockMovement. invalid movement: ${outerBlockMovement}`);
        return undefined;
    }
    let layerRangeLower = undefined;
    let layerRangeUpper = undefined;
    let layerNumber = undefined;
    if (result[1]?.includes('-')) {
        layerRangeLower = parseInt(result[1][0]);
        layerRangeUpper = parseInt(result[1][2]);
    } else {
        layerNumber = result[1] ? parseInt(result[1]) : undefined;
    } // some input validation

    if (layerRangeLower != null && layerRangeUpper != null) {
        if (layerRangeLower >= layerRangeUpper || layerRangeUpper > layers.length || layerRangeLower > layers.length - 1) {
            console.error(
                `${outerBlockMovement} is not valid for the current cubeType: ${cubeType}. For range inputs like x-yr it should follow that 1 <= x < y <= ${layers.length}.`,
            );
            return undefined;
        }
    }
    if (layerNumber != null && layerNumber > layers.length) {
        console.error(
            `${outerBlockMovement} is not valid for the current cubeType: ${cubeType}. For inputs like xR it should follow that x <= ${layers.length}.`,
        );
        return undefined;
    }

    const movementType = result[2];
    const rotationNumber = result[3] ? parseInt(result[3]) % 4 : 1;
    const isPrime = result[4] === "'";
    const direction = (isPrime ? -1 : 1) * rotationNumber;

    let axis = undefined;
    switch (movementType) {
        case 'R':
        case 'Rw':
        case 'r':
        case 'L':
        case 'Lw':
        case 'l':
        case 'M':
        case 'm':
            axis = Axi.x;
            break;
        case 'U':
        case 'Uw':
        case 'u':
        case 'D':
        case 'Dw':
        case 'd':
        case 'E':
        case 'e':
            axis = Axi.y;
            break;
        case 'F':
        case 'Fw':
        case 'f':
        case 'B':
        case 'Bw':
        case 'b':
        case 'S':
        case 's':
            axis = Axi.z;
            break;
        default:
            console.error(`${outerBlockMovement} is invalid. Invalid movementType ${movementType}.`);
    }
    if (axis == null) {
        return undefined;
    }

    switch (movementType) {
        case 'R':
        case 'U':
        case 'F':
            layerNumber = layerNumber ? layerNumber : 1;
            var layer = layers[layers.length - layerNumber];
            return { axis, layers: [layer], direction: -direction };
        case 'L':
        case 'D':
        case 'B':
            layerNumber = layerNumber ? layerNumber : 1;
            var layer = layers[layerNumber - 1];
            return { axis, layers: [layer], direction };
        case 'Rw':
        case 'Uw':
        case 'Fw':
            layerNumber = layerNumber ? layerNumber : 2;
            var sliceLayers = layers.slice(layers.length - layerNumber);
            if (layerRangeLower != null && layerRangeUpper != null) {
                var sliceLayers = layers.slice(layers.length - layerRangeUpper, layers.length - (layerRangeLower - 1));
            }
            return { axis, layers: sliceLayers, direction: -direction };
        case 'r':
        case 'u':
        case 'f':
            var defaultLayerNumber = prioritiseStandardMovement ? layers.length - 1 : 2;
            layerNumber = layerNumber ? layerNumber : defaultLayerNumber;
            var sliceLayers = layers.slice(layers.length - layerNumber);
            if (layerRangeLower != null && layerRangeUpper != null) {
                var sliceLayers = layers.slice(layers.length - layerRangeUpper, layers.length - (layerRangeLower - 1));
            }
            return { axis, layers: sliceLayers, direction: -direction };
        case 'Lw':
        case 'Dw':
        case 'Bw':
            layerNumber = layerNumber ? layerNumber : 2;
            var sliceLayers = layers.slice(0, layerNumber);
            if (layerRangeLower != null && layerRangeUpper != null) {
                var sliceLayers = layers.slice(layerRangeLower - 1, layerRangeUpper);
            }
            return { axis, layers: sliceLayers, direction };
        case 'l':
        case 'd':
        case 'b':
            var defaultLayerNumber = prioritiseStandardMovement ? layers.length - 1 : 2;
            layerNumber = layerNumber ? layerNumber : defaultLayerNumber;
            var sliceLayers = layers.slice(0, layerNumber);
            if (layerRangeLower != null && layerRangeUpper != null) {
                var sliceLayers = layers.slice(layerRangeLower - 1, layerRangeUpper);
            }
            return { axis, layers: sliceLayers, direction };
        case 'M':
        case 'E':
            var defaultLayerNumber = prioritiseStandardMovement ? Math.floor(layers.length / 2) : 1;
            layerNumber = layerNumber ? layerNumber : defaultLayerNumber;
            var lower = Math.max(Math.floor(layers.length / 2) - (layerNumber - 1), 1);
            var upper = Math.min(Math.ceil(layers.length / 2) + (layerNumber - 1), layers.length - 1);
            var sliceLayers = layers.slice(lower, upper);
            return { axis, layers: sliceLayers, direction };
        case 'm':
        case 'e':
            layerNumber = layerNumber ? layerNumber : 1;
            var sliceLayers = layers.slice(layerNumber, layers.length - layerNumber);
            return { axis, layers: sliceLayers, direction };
        case 'S':
            var defaultLayerNumber = prioritiseStandardMovement ? Math.floor(layers.length / 2) : 1;
            layerNumber = layerNumber ? layerNumber : defaultLayerNumber;
            var lower = Math.max(Math.floor(layers.length / 2) - (layerNumber - 1), 1);
            var upper = Math.min(Math.ceil(layers.length / 2) + (layerNumber - 1), layers.length - 1);
            var sliceLayers = layers.slice(lower, upper);
            return { axis, layers: sliceLayers, direction: -direction };
        case 's':
            layerNumber = layerNumber ? layerNumber : 1;
            var sliceLayers = layers.slice(layerNumber, layers.length - layerNumber);
            return { axis, layers: sliceLayers, direction: -direction };

        default:
            console.error(`${outerBlockMovement} is invalid. Invalid movementType ${movementType}.`);
            return undefined;
    }
}

/**
 * @param {import("../core").Rotation} rotation
 * @param {import('../core').CubeType} cubeType
 * @returns {Slice | undefined}
 */
export function GetRotationSlice(rotation, cubeType) {
    const result = RegExp(`^([xyz])(\\d)?(\')?$`).exec(rotation);
    if (result == null) {
        console.error(`Failed to parse rotation. invalid rotation: [${rotation}]`);
        return undefined;
    }
    const rotationType = result[1];
    const rotationNumber = result[2] ? parseInt(result[2]) : 1;

    const isPrime = result[3] === "'";
    const direction = (isPrime ? 1 : -1) * (rotationNumber % 4);
    switch (rotationType) {
        case Rotations.x:
            return { axis: Axi.x, layers: getAllLayers(cubeType), direction };
        case Rotations.y:
            return { axis: Axi.y, layers: getAllLayers(cubeType), direction };
        case Rotations.z:
            return { axis: Axi.z, layers: getAllLayers(cubeType), direction };
        default:
            console.error(`Failed to get rotation slice. invalid rotationType: ${rotationType}`);
            return undefined;
    }
}
