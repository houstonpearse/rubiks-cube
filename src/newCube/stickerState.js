// @ts-check
/** @typedef {{ up: import('../core').Face[][], down: import('../core').Face[][], front: import('../core').Face[][], back: import('../core').Face[][], left: import('../core').Face[][], right: import('../core').Face[][] }} StickerState*/

import { CubeTypes, Faces } from '../core';

/**
 *
 * @param {import('../core').CubeType} cubeType
 * @return {StickerState}
 */
export const defaultStickerState = (cubeType) => {
    const length = 0;
    switch (cubeType) {
        case CubeTypes.Two:
            return initialStickerState(2);
        case CubeTypes.Three:
            return initialStickerState(3);
        case CubeTypes.Four:
            return initialStickerState(4);
        case CubeTypes.Five:
            return initialStickerState(5);
        case CubeTypes.Six:
            return initialStickerState(6);
        case CubeTypes.Seven:
            return initialStickerState(7);
        default:
            throw new Error(`Unsupported cube type: ${cubeType}`);
    }
};

/**
 *
 * @param {number} layerCount
 * @returns {StickerState}
 */
const initialStickerState = (layerCount) => {
    const state = {
        right: Array.from({ length: layerCount }, () => Array.from({ length: layerCount }, () => Faces.R)),
        up: Array.from({ length: layerCount }, () => Array.from({ length: layerCount }, () => Faces.U)),
        front: Array.from({ length: layerCount }, () => Array.from({ length: layerCount }, () => Faces.F)),
        back: Array.from({ length: layerCount }, () => Array.from({ length: layerCount }, () => Faces.B)),
        down: Array.from({ length: layerCount }, () => Array.from({ length: layerCount }, () => Faces.D)),
        left: Array.from({ length: layerCount }, () => Array.from({ length: layerCount }, () => Faces.L)),
    };
    return state;
};

/**
 *
 * @param {import('../core').CubeType} cubeType
 * @return {StickerState}
 */
export const getEmptyStickerState = (cubeType) => {
    const length = 0;
    switch (cubeType) {
        case CubeTypes.Two:
            return emptyStickerState(2);
        case CubeTypes.Three:
            return emptyStickerState(3);
        case CubeTypes.Four:
            return emptyStickerState(4);
        case CubeTypes.Five:
            return emptyStickerState(5);
        case CubeTypes.Six:
            return emptyStickerState(6);
        case CubeTypes.Seven:
            return emptyStickerState(7);
        default:
            throw new Error(`Unsupported cube type: ${cubeType}`);
    }
};
/**
 *
 * @param {number} layerCount
 * @returns {StickerState}
 */
const emptyStickerState = (layerCount) => {
    const state = {
        right: Array.from({ length: layerCount }, () => []),
        up: Array.from({ length: layerCount }, () => []),
        front: Array.from({ length: layerCount }, () => []),
        back: Array.from({ length: layerCount }, () => []),
        down: Array.from({ length: layerCount }, () => []),
        left: Array.from({ length: layerCount }, () => []),
    };
    return state;
};

/**
 * @param {StickerState} stickerState
 * @returns {string}
 */
export function toKociemba(stickerState) {
    return `${stickerState.up.flat().join('')}${stickerState.right.flat().join('')}${stickerState.front.flat().join('')}${stickerState.down.flat().join('')}${stickerState.left.flat().join('')}${stickerState.back.flat().join('')}`;
}

/**
 * @param {string} kociembaString
 * @returns {StickerState} stickerState
 */
export function fromKociemba(kociembaString) {
    const length = kociembaString.length;
    switch (length) {
        case 6 * 2 ** 2:
            return fromKociembaWithLayerCount(kociembaString, 2);
        case 6 * 3 ** 2:
            return fromKociembaWithLayerCount(kociembaString, 3);
        case 6 * 4 ** 2:
            return fromKociembaWithLayerCount(kociembaString, 4);
        case 6 * 5 ** 2:
            return fromKociembaWithLayerCount(kociembaString, 5);
        case 6 * 6 ** 2:
            return fromKociembaWithLayerCount(kociembaString, 6);
        case 6 * 7 ** 2:
            return fromKociembaWithLayerCount(kociembaString, 7);
        default:
            throw new Error(`Invalid kociemba string length: ${length}`);
    }
}

/**
 * @param {string} kociembaString
 * @param {number} layerCount
 * @returns {StickerState} stickerState
 */
function fromKociembaWithLayerCount(kociembaString, layerCount) {
    let stickerState = emptyStickerState(layerCount);
    for (let i = 0; i < 6; i++) {
        const faceString = kociembaString.slice(i * layerCount ** 2, (i + 1) * layerCount ** 2);
        for (let j = 0; j < layerCount; j++) {
            const rowString = faceString.slice(j * layerCount, (j + 1) * layerCount);
            for (let k = 0; k < layerCount; k++) {
                const face = Object.values(Faces).find((face) => rowString[k] === face);
                if (!face) {
                    throw new Error(`Invalid face character: ${rowString[k]}`);
                }
                switch (i) {
                    case 0:
                        stickerState.up[j][k] = face;
                        break;
                    case 1:
                        stickerState.right[j][k] = face;
                        break;
                    case 2:
                        stickerState.front[j][k] = face;
                        break;
                    case 3:
                        stickerState.down[j][k] = face;
                        break;
                    case 4:
                        stickerState.left[j][k] = face;
                        break;
                    case 5:
                        stickerState.back[j][k] = face;
                        break;
                    default:
                        throw new Error(`Invalid value for i - [${i}]. i should be between [0,5] inclusive.`);
                }
            }
        }
    }
    return stickerState;
}
