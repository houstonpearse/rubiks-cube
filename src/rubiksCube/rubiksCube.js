// @ts-check
/** @import {Slice} from '../state/slice' */
/** @import {StickerState} from '../state/stickerState' */
/** @import {CubeType, Movement, Rotation} from '../core' */
/**
 * @typedef AnimationOptions
 * @property {boolean} [translate]
 * @property {number} [animationSpeedMs]
 * @property {boolean} [reverse]
 */
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
     * @param {CubeType} cubeType
     * @param {RubiksCubeViewInterface} view
     * */
    constructor(cubeType, view) {
        this.state = new CubeState(cubeType);
        this.view = view;
    }
    /**
     * @param {Movement} movement
     * @param {AnimationOptions} [options]
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
     * @param {Rotation} rotation
     * @param {AnimationOptions} [options]
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
     * @param {(Rotation | Movement)[]} actions
     * @param {AnimationOptions} [options]
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
            this.view.setState(state);
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
