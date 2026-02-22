// @ts-check
/** @typedef {AnimationStatus[keyof AnimationStatus]} AnimationStatusType */
export const AnimationStatus = Object.freeze({
    Pending: 'pending',
    Initialised: 'initialised',
    InProgress: 'inProgress',
    Complete: 'complete',
    Disposed: 'disposed',
});

export class AnimationState {
    /**
     * @param {import('./animationSlice').Slice} slice
     * @param {((state: string) => void )} completedCallback
     * @param {((reason: string) => void )} failedCallback
     */
    constructor(slice, completedCallback, failedCallback) {
        /** @type {((state: string) => void )} */
        this.completedCallback = completedCallback;
        /** @type {((reason: string) => void )} */
        this.failedCallback = failedCallback;
        /** @type {import('./animationSlice').Slice} */
        this.slice = slice;
        /** @type {AnimationStatusType} */
        this.status = AnimationStatus.Pending;
        /** @type {number} */
        this.timestampMs = performance.now();
        /** @type {number | undefined} */
        this._lastUpdatedTimeMs = undefined;
        /** @type {number} */
        this._rotationPercentage = 0;
    }

    initialise() {
        this._lastUpdatedTimeMs = performance.now();
        this.status = AnimationStatus.Initialised;
    }

    /** @param {string} state */
    complete(state) {
        this.status = AnimationStatus.Complete;
        this.completedCallback(state);
    }

    /** @param {string} reason */
    abort(reason) {
        this.status = AnimationStatus.Complete;
        this.failedCallback(reason);
    }

    /**
     * @param {number} speedMs
     * @returns {number} rotationIncrement
     */
    update(speedMs) {
        if (speedMs < 0) {
            throw new Error(`Speed is negative.`);
        }
        if (this.status === AnimationStatus.Initialised) {
            this.status = AnimationStatus.InProgress;
        }

        if (this.status !== AnimationStatus.InProgress) {
            throw new Error(`Cannot update AnimationState. Invalid Status - [${this.status}]`);
        }

        if (this._lastUpdatedTimeMs == null) {
            throw new Error(`Cannot update AnimationState. LastUpdated is not set. Value: "${this._lastUpdatedTimeMs}".`);
        }

        var intervalMs = performance.now() - this._lastUpdatedTimeMs;
        this._lastUpdatedTimeMs = performance.now();

        var increment = 100 - this._rotationPercentage;
        if (speedMs != 0) {
            var potentialIncrement = (intervalMs / speedMs) * 100;
            if (potentialIncrement + this._rotationPercentage < 100) {
                increment = potentialIncrement;
            }
        }

        if (this._rotationPercentage + increment > 100) {
            throw new Error(
                `Cannot update AnimationState. Next increment would cause over rotation. Increment: ${increment}%. Current rotation: ${this._rotationPercentage}%.`,
            );
        }

        this._rotationPercentage += increment;

        if (this._rotationPercentage === 100) {
            this.status = AnimationStatus.Complete;
        }

        return increment;
    }
}
