// @ts-check
/** @import {CubeType} from '../core' */

export default class RubiksCube3DSettings {
    /**
     * @param {CubeType} cubeType
     * @param {number} pieceGap
     * @param {number} animationSpeed
     * @param {gsap.EaseString | gsap.EaseFunction | undefined} animationStyle
     * @param {string?} logo
     */
    constructor(pieceGap, animationSpeed, cubeType, animationStyle, logo) {
        /** @type {number} pieceGap */
        this.pieceGap = pieceGap;
        /** @type {CubeType} */
        this.cubeType = cubeType;
        /** @type {number} pieceGap */
        this.animationSpeedMs = animationSpeed;
        /** @type {gsap.EaseString | gsap.EaseFunction | undefined} pieceGap */
        this.animationStyle = animationStyle;
        /** @type {string?} */
        this.logo = logo;
    }
}
