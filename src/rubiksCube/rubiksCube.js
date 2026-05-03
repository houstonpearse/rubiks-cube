// @ts-check
/** @import {Slice} from '../state/slice' */
/** @import {StickerState} from '../state/stickerState' */
/**
 * @typedef {Object} RubiksCubeViewInterface
 * @property {function(Slice, any=): Promise<void>} slice
 * @property {function(StickerState): void} setState
 * @property {function(): void} reset
 **/

import { CubeState } from '../state';
import { fromKociemba, toKociemba } from '../state/stickerState';

export default class RubiksCube {
    /**
     * @param {CubeState} state
     * @param {RubiksCubeViewInterface} view
     * */
    constructor(state, view) {
        this.state = state;
        this.view = view;
    }
    /**
     * @param {import('../core').Movement} movement
     * @param {import('../core').AnimationOptions} [options]
     * @returns {Promise<string>}
     */
    movement(movement, options) {
        const slice = this.state.move(movement, { reverse: options?.reverse, translate: options?.translate });
        if (slice == null) {
            return Promise.reject('Invalid Movement');
        }
        return new Promise(async (resolve, reject) => {
            await this.view.slice(slice, { animationSpeedMs: options?.animationSpeedMs });
            resolve(toKociemba(this.state.getState()));
        });
    }

    /**
     * @param {import('../core').Rotation} rotation
     * @param {import('../core').AnimationOptions} [options]
     * @returns {Promise<string>}
     */
    rotation(rotation, options) {
        const slice = this.state.rotate(rotation, { reverse: options?.reverse });
        if (slice == null) {
            return Promise.reject('Invalid Movement');
        }
        return new Promise(async (resolve, reject) => {
            await this.view.slice(slice, { animationSpeedMs: options?.animationSpeedMs });
            resolve(toKociemba(this.state.getState()));
        });
    }
    /**
     * @param {(import('../core').Rotation | import('../core').Movement)[]} actions
     * @param {import('../core').AnimationOptions} [options]
     * @returns {string}
     */
    do(actions, options) {
        this.state.do(actions, { translate: options?.translate, reverse: options?.reverse });
        this.view.setState(this.state.getState());
        return toKociemba(this.state.getState());
    }

    /**
     * @returns {string}
     */
    reset() {
        this.state.reset();
        this.view.reset();
        return toKociemba(this.state.getState());
    }

    /**
     * @param {string} kociembaState
     * @returns {boolean}
     */
    setState(kociembaState) {
        const state = fromKociemba(kociembaState);
        if (state) {
            this.state.setState(state);
            return true;
        }
        return false;
    }

    /**
     * @returns {string}
     */
    getState() {
        return toKociemba(this.state.getState());
    }
}
