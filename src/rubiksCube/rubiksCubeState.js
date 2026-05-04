// @ts-check
import { CubeState } from '../state/cubeState';
import { fromKociemba, toKociemba } from '../state/stickerState';
/**  @import { CubeType, Movement, Rotation } from '../core' */
export default class RubiksCubeState {
    /**
     *
     * @param {CubeType} cubeType
     */
    constructor(cubeType) {
        /** @type {CubeState} */
        this.state = new CubeState(cubeType);
    }

    /**
     * @returns {void}
     */
    reset() {
        this.state.reset();
    }

    /**
     * @param {string} kociembaState
     * @returns {boolean}
     */
    setState(kociembaState) {
        const stickerState = fromKociemba(kociembaState);
        if (stickerState != null) {
            this.state.setState(stickerState);
            this.kociemba = kociembaState;
            return true;
        }
        return false;
    }

    /**
     * @returns {string} kociembaState
     */
    getState() {
        return toKociemba(this.state.getState());
    }

    /**
     * @param {(Rotation | Movement)[]} actions
     */
    do(actions) {
        this.state.do(actions);
    }

    /**
     * @param {Movement} movement
     */
    move(movement) {
        this.state.move(movement);
    }

    /**
     * @param {Rotation} rotation
     */
    rotate(rotation) {
        this.state.rotate(rotation);
    }
}
