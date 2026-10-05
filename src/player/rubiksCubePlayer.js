import { CubeTypes, FromString, IsMovement, reverse } from '../core';
import { RubiksCubeState } from '../state';
import { RubiksCubeElement } from '../webComponent/rubiksCubeElement';
import styles from './styles.js';

const sheet = new CSSStyleSheet();
sheet.replaceSync(styles);
/** @typedef {import('@houstonp/rubiks-cube/view')} */
/** @import {Movement, Rotation, CubeType} from '../core' */

export const RubiksCubePlayerAttributes = {
    CubeType: 'cube-type',
    Setup: 'setup',
    Alg: 'alg',
};

const PlayState = Object.freeze({
    Idle: 'idle',
    Forward: 'forward',
    Backward: 'backward',
});

export class RubiksCubePlayer extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        const root = /** @type {ShadowRoot} */ (this.shadowRoot);
        root.innerHTML = `
        <div class="player">
        <rubiks-cube camera-radius="10" camera-field-of-view="40"></rubiks-cube>
        <div class="playback-options">
                <button class="playback-icon" id="playback-start" aria-label="Jump to start">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 0 640 640">
                        <path
                            d="M556.2 541.6C544.2 546.6 530.5 543.8 521.3 534.7L352 365.3L352 512C352 524.9 344.2 536.6 332.2 541.6C320.2 546.6 306.5 543.8 297.3 534.7L128 365.3L128 512C128 529.7 113.7 544 96 544C78.3 544 64 529.7 64 512L64 128C64 110.3 78.3 96 96 96C113.7 96 128 110.3 128 128L128 274.7L297.4 105.4C306.6 96.2 320.3 93.5 332.3 98.5C344.3 103.5 352 115.1 352 128L352 274.7L521.4 105.3C530.6 96.1 544.3 93.4 556.3 98.4C568.3 103.4 576 115.1 576 128L576 512C576 524.9 568.2 536.6 556.2 541.6z"
                        />
                    </svg>
                </button>
                <button class="playback-icon" id="playback-backward" aria-label="rewind">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 0 640 640">
                        <path
                            d="M236.3 107.1C247.9 96 265 92.9 279.7 99.2C294.4 105.5 304 120 304 136L304 272.3L476.3 107.2C487.9 96 505 92.9 519.7 99.2C534.4 105.5 544 120 544 136L544 504C544 520 534.4 534.5 519.7 540.8C505 547.1 487.9 544 476.3 532.9L304 367.7L304 504C304 520 294.4 534.5 279.7 540.8C265 547.1 247.9 544 236.3 532.9L44.3 348.9C36.5 341.3 32 330.9 32 320C32 309.1 36.5 298.7 44.3 291.1L236.3 107.1z"
                        />
                    </svg>
                </button>
                <button class="playback-icon" id="playback-backward-step" aria-label="Previous step">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 0 640 640">
                        <path
                            d="M491 100.8C478.1 93.8 462.3 94.5 450 102.6L192 272.1L192 128C192 110.3 177.7 96 160 96C142.3 96 128 110.3 128 128L128 512C128 529.7 142.3 544 160 544C177.7 544 192 529.7 192 512L192 367.9L450 537.5C462.3 545.6 478 546.3 491 539.3C504 532.3 512 518.8 512 504.1L512 136.1C512 121.4 503.9 107.9 491 100.9z"
                        />
                    </svg>
                </button>
                <button class="playback-icon" id="playback-play" aria-label="Play playback">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 0 640 640">
                        <path 
                            d="M187.2 100.9C174.8 94.1 159.8 94.4 147.6 101.6C135.4 108.8 128 121.9 128 136L128 504C128 518.1 135.5 531.2 147.6 538.4C159.7 545.6 174.8 545.9 187.2 539.1L523.2 355.1C536 348.1 544 334.6 544 320C544 305.4 536 291.9 523.2 284.9L187.2 100.9z"
                        />
                    </svg>
                </button>
                <button class="playback-icon" id="playback-stop" aria-label="Stop playback" hidden>
                    <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 0 640 640">
                        <path
                            d="M160 96L480 96C515.3 96 544 124.7 544 160L544 480C544 515.3 515.3 544 480 544L160 544C124.7 544 96 515.3 96 480L96 160C96 124.7 124.7 96 160 96z"
                        />
                    </svg>
                </button>
                <button class="playback-icon" id="playback-forward-step" aria-label="Next step">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 0 640 640">
                        <path
                            d="M149 100.8C161.9 93.8 177.7 94.5 190 102.6L448 272.1L448 128C448 110.3 462.3 96 480 96C497.7 96 512 110.3 512 128L512 512C512 529.7 497.7 544 480 544C462.3 544 448 529.7 448 512L448 367.9L190 537.5C177.7 545.6 162 546.3 149 539.3C136 532.3 128 518.7 128 504L128 136C128 121.3 136.1 107.8 149 100.8z"
                        />
                    </svg>
                </button>
                <button class="playback-icon" id="playback-forward" aria-label="Play Forward">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 0 640 640">
                        <path
                            d="M403.7 107.1C392.1 96 375 92.9 360.3 99.2C345.6 105.5 336 120 336 136L336 272.3L163.7 107.2C152.1 96 135 92.9 120.3 99.2C105.6 105.5 96 120 96 136L96 504C96 520 105.6 534.5 120.3 540.8C135 547.1 152.1 544 163.7 532.9L336 367.7L336 504C336 520 345.6 534.5 360.3 540.8C375 547.1 392.1 544 403.7 532.9L595.7 348.9C603.6 341.4 608 330.9 608 320C608 309.1 603.5 298.7 595.7 291.1L403.7 107.1z"
                        />
                    </svg>
                </button>
                <button class="playback-icon" id="playback-end" aria-label="Jump to end">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 0 640 640">
                        <path
                            d="M83.8 541.6C95.8 546.6 109.5 543.8 118.7 534.7L288 365.3L288 512C288 524.9 295.8 536.6 307.8 541.6C319.8 546.6 333.5 543.8 342.7 534.7L512 365.3L512 512C512 529.7 526.3 544 544 544C561.7 544 576 529.7 576 512L576 128C576 110.3 561.7 96 544 96C526.3 96 512 110.3 512 128L512 274.7L342.6 105.3C333.4 96.1 319.7 93.4 307.7 98.4C295.7 103.4 288 115.1 288 128L288 274.7L118.6 105.4C109.4 96.2 95.7 93.5 83.7 98.5C71.7 103.5 64 115.1 64 128L64 512C64 524.9 71.8 536.6 83.8 541.6z"
                        />
                    </svg>
                </button>
        </div>
        </div>`;
        this.shadowRoot.adoptedStyleSheets = [sheet];
        this.rubiksCubeElement = /** @type {RubiksCubeElement} */ (this.shadowRoot.querySelector('rubiks-cube'));
        this.startButton = /** @type {HTMLButtonElement} */ (this.shadowRoot.querySelector('#playback-start'));
        this.backwardsStepButton = /** @type {HTMLButtonElement} */ (this.shadowRoot.querySelector('#playback-backward-step'));
        this.backwardsButton = /** @type {HTMLButtonElement} */ (this.shadowRoot.querySelector('#playback-backward'));
        this.playButton = /** @type {HTMLButtonElement} */ (this.shadowRoot.querySelector('#playback-play'));
        this.stopButton = /** @type {HTMLButtonElement} */ (this.shadowRoot.querySelector('#playback-stop'));
        this.forwardsStepbutton = /** @type {HTMLButtonElement} */ (this.shadowRoot.querySelector('#playback-forward-step'));
        this.forwardbutton = /** @type {HTMLButtonElement} */ (this.shadowRoot.querySelector('#playback-forward'));
        this.endButton = /** @type {HTMLButtonElement} */ (this.shadowRoot.querySelector('#playback-end'));
        /** @type {CubeType} */
        this.cubeType = CubeTypes.Three;
        this.setup = '';
        this.alg = '';
        /** @type {string?} */
        this.setupState = null;
        /** @type {(Movement | Rotation)[]} */
        this.algMoves = [];
        this.currentMoveIndex = 0;
        /** @type {typeof PlayState[keyof typeof PlayState]} */
        this.playState = PlayState.Idle;
        /** direction of the last step or play, used to pick which way play() goes
         * @type {typeof PlayState.Forward | typeof PlayState.Backward} */
        this.direction = PlayState.Forward;
        /** incremented whenever playback starts or stops, so a superseded play loop knows to exit */
        this._playRun = 0;
        this.ready = false;

        this.startButton.addEventListener('click', () => this.jumpToStart());
        this.backwardsButton.addEventListener('click', () => this.playBackward());
        this.backwardsStepButton.addEventListener('click', () => this.stepBackward());
        this.playButton.addEventListener('click', () => this.play());
        this.stopButton.addEventListener('click', () => this.stop());
        this.forwardsStepbutton.addEventListener('click', () => this.stepForward());
        this.forwardbutton.addEventListener('click', () => this.playForward());
        this.endButton.addEventListener('click', () => this.jumpToEnd());
    }

    /**
     * @param {string} tagName the name of the tag to register the web component under
     */
    static register(tagName = 'rubiks-cube-player') {
        if (!customElements.get(tagName)) {
            customElements.define(tagName, this);
        }
    }

    static get observedAttributes() {
        return [...new Set([...Object.values(RubiksCubePlayerAttributes), ...RubiksCubeElement.observedAttributes])];
    }

    connectedCallback() {
        RubiksCubeElement.register();
        // The inner <rubiks-cube> initialises in its own connectedCallback, which runs after this one when the player
        // is inserted into the page, so wait for it before setting the cube state.
        queueMicrotask(() => {
            this.ready = true;
            this.init();
        });
    }

    disconnectedCallback() {
        this.ready = false;
        this.stop();
    }

    /**
     * @param {string} name
     * @param {string?} oldVal
     * @param {string?} newVal
     *  */
    attributeChangedCallback(name, oldVal, newVal) {
        switch (name) {
            case RubiksCubePlayerAttributes.CubeType:
                this.cubeType = /** @type {CubeType} */ (newVal ?? CubeTypes.Three);
                break;
            case RubiksCubePlayerAttributes.Setup:
                this.setup = newVal ?? '';
                break;
            case RubiksCubePlayerAttributes.Alg:
                this.alg = newVal ?? '';
                break;
        }
        // forward <rubiks-cube> attributes (including cube-type) to the inner cube
        if (RubiksCubeElement.observedAttributes.includes(name)) {
            if (newVal === null) {
                this.rubiksCubeElement.removeAttribute(name);
            } else {
                this.rubiksCubeElement.setAttribute(name, newVal);
            }
        }
        if (this.ready) {
            this.init();
        }
    }

    init() {
        const setupState = new RubiksCubeState(this.cubeType);
        setupState.do(FromString(this.setup));
        this.setupState = setupState.getKociemba();
        this.algMoves = FromString(this.alg);
        this.currentMoveIndex = 0;
        this.direction = PlayState.Forward;
        this.stop();
        this.rubiksCubeElement.setState(this.setupState);
    }

    /**
     * @private
     * @param {Movement | Rotation} action
     * @param {boolean} reverseAction
     * @returns {Promise<string>}
     */
    _animate(action, reverseAction) {
        const directed = reverseAction ? reverse(action) : action;
        if (IsMovement(action)) {
            return this.rubiksCubeElement.move(/** @type {Movement} */ (directed));
        }
        return this.rubiksCubeElement.rotate(/** @type {Rotation} */ (directed));
    }

    /**
     * @private
     * @param {typeof PlayState[keyof typeof PlayState]} playState
     */
    _setPlayState(playState) {
        this.playState = playState;
        const playing = playState !== PlayState.Idle;
        this.playButton.hidden = playing;
        this.stopButton.hidden = !playing;
    }

    async stepForward() {
        this.stop();
        this.direction = PlayState.Forward;
        if (this.currentMoveIndex >= this.algMoves.length) {
            return;
        }
        const action = this.algMoves[this.currentMoveIndex];
        this.currentMoveIndex++;
        await this._animate(action, false);
    }

    async stepBackward() {
        this.stop();
        this.direction = PlayState.Backward;
        if (this.currentMoveIndex <= 0) {
            return;
        }
        this.currentMoveIndex--;
        const action = this.algMoves[this.currentMoveIndex];
        await this._animate(action, true);
    }

    /**
     * Plays in the direction of the last step or play. If that direction has already reached the end of the
     * algorithm (or the start, going backward), plays the opposite way instead.
     */
    async play() {
        const atEnd = this.direction === PlayState.Forward ? this.currentMoveIndex >= this.algMoves.length : this.currentMoveIndex <= 0;
        const forward = (this.direction === PlayState.Forward) !== atEnd;
        await (forward ? this.playForward() : this.playBackward());
    }

    async playForward() {
        await this._play(PlayState.Forward);
    }

    async playBackward() {
        await this._play(PlayState.Backward);
    }

    /**
     * @private
     * @param {typeof PlayState.Forward | typeof PlayState.Backward} direction
     */
    async _play(direction) {
        if (this.playState === direction) {
            return;
        }
        const run = ++this._playRun;
        this.direction = direction;
        this._setPlayState(direction);
        const forward = direction === PlayState.Forward;
        while (this._playRun === run && (forward ? this.currentMoveIndex < this.algMoves.length : this.currentMoveIndex > 0)) {
            if (!forward) {
                this.currentMoveIndex--;
            }
            const action = this.algMoves[this.currentMoveIndex];
            if (forward) {
                this.currentMoveIndex++;
            }
            await this._animate(action, !forward);
        }
        if (this._playRun === run) {
            this._setPlayState(PlayState.Idle);
        }
    }

    stop() {
        this._playRun++;
        this._setPlayState(PlayState.Idle);
    }

    jumpToStart() {
        this.stop();
        this.currentMoveIndex = 0;
        if (this.setupState) {
            this.rubiksCubeElement.setState(this.setupState);
        }
    }

    jumpToEnd() {
        this.stop();
        const finalState = new RubiksCubeState(this.cubeType);
        if (this.setupState) {
            finalState.setKociemba(this.setupState);
        }
        finalState.do(this.algMoves);
        this.rubiksCubeElement.setState(finalState.getKociemba());
        this.currentMoveIndex = this.algMoves.length;
    }
}
