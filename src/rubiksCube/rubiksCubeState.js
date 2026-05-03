// @ts-check
import { CubeState } from '../state/state';
import { fromKociemba, toKociemba } from '../state/stickerState';
/**  @import { CubeType, Movement, Rotation } from '../core' */
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
        this.kociemba = toKociemba(this.state.getState());

        if (kociembaState != null) {
            const stickerState = fromKociemba(kociembaState);
            if (stickerState != null) {
                this.state.setState(stickerState);
                this.kociemba = kociembaState;
            }
        }
    }

    /**
     * @param {(import('../core').Rotation | import('../core').Movement)[]} actions
     * @returns {string}
     */
    do(actions) {
        this.state.do(actions);
        return toKociemba(this.state.getState());
    }

    /**
     * @param {Movement} movement
     * @returns {string} state
     */
    move(movement) {
        this.state.move(movement);
        return toKociemba(this.state.getState());
    }

    /**
     * @param {Rotation} rotation
     * @returns {string} state
     */
    rotate(rotation) {
        this.state.rotate(rotation);
        return toKociemba(this.state.getState());
    }
}
