// @ts-check
export default class RubiksCube3DSettings {
    /**
     * @param {import('../core').CubeType} cubeType
     * @param {number} pieceGap
     * @param {number} animationSpeed
     * @param {gsap.EaseString | gsap.EaseFunction | undefined} animationStyle
     */
    constructor(pieceGap, animationSpeed, cubeType, animationStyle) {
        /** @type {number} pieceGap */
        this.pieceGap = pieceGap;
        /** @type {import("../core").CubeType} */
        this.cubeType = cubeType;
        /** @type {number} pieceGap */
        this.animationSpeedMs = animationSpeed;
        /** @type {gsap.EaseString | gsap.EaseFunction | undefined} pieceGap */
        this.animationStyle = animationStyle;
    }
}
