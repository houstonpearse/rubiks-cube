// @ts-check
/** @typedef {"exponential" | "next" | "fixed" | "match"} AnimationStyle */
export default class CubeSettings {
    /**
     *
     * @param {number} pieceGap
     * @param {number} animationSpeed
     * @param {AnimationStyle} animationStyle
     */
    constructor(pieceGap, animationSpeed, animationStyle) {
        /** @type {number} pieceGap */
        this.pieceGap = pieceGap;
        /** @type {number} pieceGap */
        this.animationSpeedMs = animationSpeed;
        /** @type {AnimationStyle} pieceGap */
        this.animationStyle = animationStyle;
    }
}
