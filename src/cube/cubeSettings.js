// @ts-check
export default class CubeSettings {
    /**
     * @param {import('../core').CubeType} cubeType
     * @param {number} pieceGap
     * @param {number} animationSpeed
     * @param {import('../core').AnimationStyle} animationStyle
     */
    constructor(pieceGap, animationSpeed, animationStyle, cubeType) {
        /** @type {number} pieceGap */
        this.pieceGap = pieceGap;
        /** @type {import("../core").CubeType} */
        this.cubeType = cubeType;
        /** @type {number} pieceGap */
        this.animationSpeedMs = animationSpeed;
        /** @type {import('../core').AnimationStyle} pieceGap */
        this.animationStyle = animationStyle;
    }
}
