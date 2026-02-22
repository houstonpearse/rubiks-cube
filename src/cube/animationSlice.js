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
 * @returns {Slice}
 */
export function GetLayerSlice(outerBlockMovement, cubeType, prioritiseStandardMovement = false) {
    const layers = getAllLayers(cubeType);
    const result = RegExp(`^([23456])?([RLUDFB]w|[RLUDFBMES]|[rludfb])([123])?(\')?$`).exec(outerBlockMovement);
    if (result == null) {
        throw new Error(`Failed to parse outerBlockMovement. invalid movement: ${outerBlockMovement}`);
    }
    let layerNumber = result[1] ? parseInt(result[1]) : undefined;
    if (layerNumber != null && layerNumber > layers.length - 1) {
        throw new Error(`Failed to parse outerBlockMovement. layer number ${layerNumber} is too large for cube type ${cubeType}`);
    }
    const movementType = result[2];
    const rotationNumber = result[3] ? parseInt(result[3]) : 1;
    const isPrime = result[4] === "'";
    const direction = (isPrime ? -1 : 1) * rotationNumber;

    const axis = (() => {
        switch (movementType) {
            case 'R':
            case 'Rw':
            case 'r':
            case 'L':
            case 'Lw':
            case 'l':
            case 'M':
                return Axi.x;
            case 'U':
            case 'Uw':
            case 'u':
            case 'D':
            case 'Dw':
            case 'd':
            case 'E':
                return Axi.y;
            case 'F':
            case 'Fw':
            case 'f':
            case 'B':
            case 'Bw':
            case 'b':
            case 'S':
                return Axi.z;
            default:
                throw new Error(`Failed to parse outerBlockMovement. invalid movement: ${outerBlockMovement}`);
        }
    })();

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
            return { axis, layers: sliceLayers, direction: -direction };
        case 'r':
        case 'u':
        case 'f':
            var defaultLayerNumber = prioritiseStandardMovement ? layers.length - 1 : 2;
            layerNumber = layerNumber ? layerNumber : defaultLayerNumber;
            var sliceLayers = layers.slice(layers.length - layerNumber);
            return { axis, layers: sliceLayers, direction: -direction };
        case 'Lw':
        case 'Dw':
        case 'Bw':
            layerNumber = layerNumber ? layerNumber : 2;
            var sliceLayers = layers.slice(0, layerNumber);
            return { axis, layers: sliceLayers, direction };
        case 'l':
        case 'd':
        case 'b':
            var defaultLayerNumber = prioritiseStandardMovement ? layers.length - 1 : 2;
            layerNumber = layerNumber ? layerNumber : defaultLayerNumber;
            var sliceLayers = layers.slice(0, layerNumber);
            return { axis, layers: sliceLayers, direction };
        case 'M':
        case 'E':
        case 'S':
            var sliceLayers = layers.slice(1, layers.length - 1);
            return { axis, layers: sliceLayers, direction: -direction };
        default:
            throw new Error(`Failed to parse outerBlockMovement. invalid movement: ${outerBlockMovement}`);
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
