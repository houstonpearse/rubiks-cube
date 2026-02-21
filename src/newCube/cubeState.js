// @ts-check
/**
 * @typedef {{x: number,y: number,z: number}} vector
 */

import { CubeTypes, Faces } from '../core';
import { defaultStickerState } from './stickerState';

/** @typedef {{cubeType: import('../core').CubeType, layers: number[], pieceSize: number, coreSize: number,initialStickerState: import('./stickerState').StickerState, outerLayerMultiplier: number, corners: state[], edges: state[], centers: state[]}} CubeInfo */
/**
 * @param {import("../core").CubeType} cubeType
 * @return {CubeInfo}
 */
export function getCubeInfo(cubeType) {
    return {
        cubeType: cubeType,
        layers: getMiddleLayers(cubeType),
        pieceSize: pieceSize(cubeType),
        coreSize: coreSize(cubeType),
        initialStickerState: defaultStickerState(cubeType),
        outerLayerMultiplier: outlerLayerMultiplier(cubeType),
        corners: corners,
        edges: edges(getMiddleLayers(cubeType)),
        centers: centers(getMiddleLayers(cubeType)),
    };
}

export const FaceColors = {
    [Faces.B]: 'blue',
    [Faces.D]: 'yellow',
    [Faces.F]: '#2cbf13',
    [Faces.L]: '#fc9a05',
    [Faces.R]: 'red',
    [Faces.U]: 'white',
};

/**
 * @param {import('three').ColorRepresentation} color
 * @return {import('../core').Face}
 * */
export const ColorToFace = (color) => {
    const face = Object.values(Faces).find((face) => FaceColors[face] === color);
    if (!face) {
        throw new Error(`Invalid color: ${color}`);
    }
    return face;
};

/**
 * @param {import("../core").CubeType} cubeType
 * @return {number} core size
 */
export const outlerLayerMultiplier = (cubeType) => {
    switch (cubeType) {
        case CubeTypes.Two:
            return 1;
        case CubeTypes.Three:
            return 1;
        case CubeTypes.Four:
            return 1.1;
        case CubeTypes.Five:
            return 1.2;
        case CubeTypes.Six:
            return 1.3;
        case CubeTypes.Seven:
            return 1.35;
        default:
            throw new Error(`Unsupported cube type: ${cubeType}`);
    }
};

/**
 * @param {import("../core").CubeType} cubeType
 * @return {number} core size
 */
export const coreSize = (cubeType) => {
    switch (cubeType) {
        case CubeTypes.Two:
            return 2;
        case CubeTypes.Three:
            return 1.53;
        case CubeTypes.Four:
            return 1.36;
        case CubeTypes.Five:
            return 1.3;
        case CubeTypes.Six:
            return 1.22;
        case CubeTypes.Seven:
            return 1.21;
        default:
            throw new Error(`Unsupported cube type: ${cubeType}`);
    }
};

/**
 * @param {import("../core").CubeType} cubeType
 */
export const getMiddleLayers = (cubeType) => {
    switch (cubeType) {
        case CubeTypes.Two:
            return [];
        case CubeTypes.Three:
            return [0];
        case CubeTypes.Four:
            return [-1 / 3, 1 / 3];
        case CubeTypes.Five:
            return [-1 / 2, 0, 1 / 2];
        case CubeTypes.Six:
            return [-3 / 5, -1 / 5, 1 / 5, 3 / 5];
        case CubeTypes.Seven:
            return [-2 / 3, -1 / 3, 0, 1 / 3, 2 / 3];
        default:
            throw new Error(`Unsupported cube type: ${cubeType}`);
    }
};

/**
 * @param {import("../core").CubeType} cubeType
 */
export const getAllLayers = (cubeType) => {
    return [-1, ...getMiddleLayers(cubeType), 1];
};

/**
 * @param {import("../core").CubeType} cubeType
 * @return {number} piece size
 */
export const pieceSize = (cubeType) => {
    switch (cubeType) {
        case CubeTypes.Two:
            return 2;
        case CubeTypes.Three:
            return 1;
        case CubeTypes.Four:
            return 2 / 3;
        case CubeTypes.Five:
            return 1 / 2;
        case CubeTypes.Six:
            return 2 / 5;
        case CubeTypes.Seven:
            return 1 / 3;
        default:
            throw new Error(`Unsupported cube type: ${cubeType}`);
    }
};

/**
 * @typedef {{position: vector, rotation: vector}} state
 */

/** @type {state[]} */
export const corners = [
    {
        position: { x: 1, y: 1, z: 1 },
        rotation: { x: 0, y: 0, z: 0 },
    },
    {
        position: { x: 1, y: 1, z: -1 },
        rotation: { x: 0, y: Math.PI / 2, z: 0 },
    },
    {
        position: { x: 1, y: -1, z: 1 },
        rotation: { x: 0, y: Math.PI / 2, z: Math.PI },
    },
    {
        position: { x: 1, y: -1, z: -1 },
        rotation: { x: 0, y: Math.PI, z: Math.PI },
    },
    {
        position: { x: -1, y: 1, z: 1 },
        rotation: { x: 0, y: -Math.PI / 2, z: 0 },
    },
    {
        position: { x: -1, y: 1, z: -1 },
        rotation: { x: 0, y: Math.PI, z: 0 },
    },
    {
        position: { x: -1, y: -1, z: 1 },
        rotation: { x: 0, y: 0, z: Math.PI },
    },
    {
        position: { x: -1, y: -1, z: -1 },
        rotation: { x: 0, y: -Math.PI / 2, z: Math.PI },
    },
];

/**
 * @param {number[]} layers
 * @return {state[]}
 */
export const centers = (layers) => [
    //right
    ...layers.flatMap((layer1) =>
        layers.map((layer2) => {
            return {
                position: { x: 1, y: layer1, z: layer2 },
                rotation: { x: 0, y: Math.PI / 2, z: 0 },
            };
        }),
    ),
    //up
    ...layers.flatMap((layer1) =>
        layers.map((layer2) => {
            return {
                position: { x: layer1, y: 1, z: layer2 },
                rotation: { x: -Math.PI / 2, y: 0, z: 0 },
            };
        }),
    ),
    //front
    ...layers.flatMap((layer1) =>
        layers.map((layer2) => {
            return {
                position: { x: layer1, y: layer2, z: 1 },
                rotation: { x: 0, y: 0, z: 0 },
            };
        }),
    ),
    //back
    ...layers.flatMap((layer1) =>
        layers.map((layer2) => {
            return {
                position: { x: layer1, y: layer2, z: -1 },
                rotation: { x: 0, y: Math.PI, z: 0 },
            };
        }),
    ),
    //down
    ...layers.flatMap((layer1) =>
        layers.map((layer2) => {
            return {
                position: { x: layer1, y: -1, z: layer2 },
                rotation: { x: Math.PI / 2, y: 0, z: 0 },
            };
        }),
    ),
    //left
    ...layers.flatMap((layer1) =>
        layers.map((layer2) => {
            return {
                position: { x: -1, y: layer1, z: layer2 },
                rotation: { x: 0, y: -Math.PI / 2, z: 0 },
            };
        }),
    ),
];

/**
 * @param {number[]} layers
 * @return {state[]}
 */
export const edges = (layers) => [
    // RU
    ...layers.map((layer) => {
        return {
            position: { x: 1, y: 1, z: layer },
            rotation: { x: 0, y: Math.PI / 2, z: 0 },
        };
    }),
    // RF
    ...layers.map((layer) => {
        return {
            position: { x: 1, y: layer, z: 1 },
            rotation: { x: 0, y: 0, z: -Math.PI / 2 },
        };
    }),
    // RB
    ...layers.map((layer) => {
        return {
            position: { x: 1, y: layer, z: -1 },
            rotation: { x: 0, y: Math.PI / 2, z: -Math.PI / 2 },
        };
    }),
    // RD
    ...layers.map((layer) => {
        return {
            position: { x: 1, y: -1, z: layer },
            rotation: { x: Math.PI, y: Math.PI / 2, z: 0 },
        };
    }),
    // UF
    ...layers.map((layer) => {
        return {
            position: { x: layer, y: 1, z: 1 },
            rotation: { x: 0, y: 0, z: 0 },
        };
    }),
    // UB
    ...layers.map((layer) => {
        return {
            position: { x: layer, y: 1, z: -1 },
            rotation: { x: -Math.PI / 2, y: 0, z: 0 },
        };
    }),
    // DF
    ...layers.map((layer) => {
        return {
            position: { x: layer, y: -1, z: 1 },
            rotation: { x: Math.PI / 2, y: 0, z: 0 },
        };
    }),
    // DB
    ...layers.map((layer) => {
        return {
            position: { x: layer, y: -1, z: -1 },
            rotation: { x: Math.PI, y: 0, z: 0 },
        };
    }),
    // LU
    ...layers.map((layer) => {
        return {
            position: { x: -1, y: 1, z: layer },
            rotation: { x: 0, y: -Math.PI / 2, z: 0 },
        };
    }),
    // LF
    ...layers.map((layer) => {
        return {
            position: { x: -1, y: layer, z: 1 },
            rotation: { x: 0, y: 0, z: Math.PI / 2 },
        };
    }),
    // LB
    ...layers.map((layer) => {
        return {
            position: { x: -1, y: layer, z: -1 },
            rotation: { x: 0, y: -Math.PI / 2, z: Math.PI / 2 },
        };
    }),
    // LD
    ...layers.map((layer) => {
        return {
            position: { x: -1, y: -1, z: layer },
            rotation: { x: 0, y: -Math.PI / 2, z: Math.PI },
        };
    }),
];
