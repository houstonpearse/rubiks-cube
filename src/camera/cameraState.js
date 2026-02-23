// @ts-check
import { PeekStates, PeekTypes } from '../core';

export class CameraState {
    /**
     * @param {boolean} up
     * @param {boolean} right
     */
    constructor(up = true, right = true) {
        /** @type {boolean} */
        this.Up = up;
        /** @type {boolean} */
        this.Right = right;
    }

    /**
     * @param {import("../core").PeekType} peekType
     */
    peekCamera(peekType) {
        switch (peekType) {
            case PeekTypes.Horizontal:
                this.Right = !this.Right;
                break;
            case PeekTypes.Vertical:
                this.Up = !this.Up;
                break;
            case PeekTypes.Right:
                this.Right = true;
                break;
            case PeekTypes.Left:
                this.Right = false;
                break;
            case PeekTypes.Up:
                this.Up = true;
                break;
            case PeekTypes.Down:
                this.Up = false;
                break;
            case PeekTypes.RightUp:
                this.Right = true;
                this.Up = true;
                break;
            case PeekTypes.RightDown:
                this.Right = true;
                this.Up = false;
                break;
            case PeekTypes.LeftUp:
                this.Right = false;
                this.Up = true;
                break;
            case PeekTypes.LeftDown:
                this.Right = false;
                this.Up = false;
                break;
            default:
                console.error(`Invalid peekType:[${peekType}]. valid values are [${Object.values(PeekTypes)}] `);
                break;
        }
    }
    /**
     * @returns {import("../core").PeekState}
     */
    toPeekState() {
        if (this.Right && this.Up) {
            return PeekStates.RightUp;
        }
        if (!this.Right && this.Up) {
            return PeekStates.LeftUp;
        }
        if (this.Right && !this.Up) {
            return PeekStates.RightDown;
        }
        if (!this.Right && !this.Up) {
            return PeekStates.LeftDown;
        }
        console.error(
            `Invalid CameraState right and up values must be true or false. Actual values: right[${this.Right}] up[${this.Up}]. Default RightUp returned`,
        );
        return PeekStates.RightUp;
    }
}
