// @ts-check

import { CubeTypes } from '../core';

export default class CubeSettings {
    /**
     *
     * @param {number} pieceGap
     * @param {number} animationSpeed
     * @param {import('../core').AnimationStyle} animationStyle
     */
    constructor(pieceGap, animationSpeed, animationStyle) {
        /** @type {number} pieceGap */
        this.pieceGap = pieceGap;
        /** @type {import("../core").CubeType} */
        this.cubeType = CubeTypes.Seven;
        /** @type {number} pieceGap */
        this.animationSpeedMs = animationSpeed;
        /** @type {import('../core').AnimationStyle} pieceGap */
        this.animationStyle = animationStyle;
    }
}
