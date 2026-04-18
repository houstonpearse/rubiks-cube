// @ts-check
import { CubeState } from './state/state';
import { fromKociemba, toKociemba } from './state/stickerState';
/**  @import { CubeType, Movement, Rotation } from './core' */
export default class RubiksCubeState {
    /**
     *
     * @param {CubeType} cubeType
     * @param {string} [kociembaState]
     */
    constructor(cubeType, kociembaState) {
        /** @type {CubeState} */
        this.state = new CubeState(cubeType);
        /** @type {string} */
        this.kociemba = toKociemba(this.state.stickerState);

        if (kociembaState != null) {
            const stickerState = fromKociemba(kociembaState, cubeType);
            if (stickerState != null) {
                this.state.setState(stickerState);
                this.kociemba = kociembaState;
            }
        }
    }

    /**
     * @param {string} algorithm
     * @returns {string} state
     */
    do(algorithm) {
        this.state.do(algorithm);
        return toKociemba(this.state.stickerState);
    }

    /**
     * @param {Movement} movement
     * @returns {string} state
     */
    move(movement) {
        this.state.move(movement);
        return toKociemba(this.state.stickerState);
    }

    /**
     * @param {Rotation} rotation
     * @returns {string} state
     */
    rotate(rotation) {
        this.state.rotate(rotation);
        return toKociemba(this.state.stickerState);
    }
}
