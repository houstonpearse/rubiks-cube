import { Vector3, Group } from 'three';

export class CubeRotation {
    /**
     * @param {string} eventId
     * @param {import('./slice').Slice} slice
     * @param {((state: string) => void )} completedCallback
     * @param {((reason: string) => void )} failedCallback
     */
    constructor(eventId, slice, completedCallback, failedCallback) {
        /** @type {((state: string) => void )} */
        this.completedCallback = completedCallback;
        /** @type {((reason: string) => void )} */
        this.failedCallback = failedCallback;
        /** @type {string} */
        this.eventId = eventId;
        /** @type {import('./slice').Slice} */
        this.slice = slice;
        /** @type {"pending" | "initialised" | "inProgress" | "complete" | "disposed"} */
        this.status = 'pending';
        /** @type {number} */
        this.timestampMs = performance.now();
        /** @type {number | undefined} */
        this._lastUpdatedTimeMs = undefined;
        /** @type {number} */
        this._rotationPercentage = 0;
    }

    initialise() {
        this._lastUpdatedTimeMs = performance.now();
        this.status = 'initialised';
    }

    /**
     *
     * @param {Group} rotationGroup
     * @param {number} speedMs
     */
    update(rotationGroup, speedMs) {
        if (this.status === 'initialised') {
            this.status = 'inProgress';
        }

        if (this.status !== 'inProgress' || this._lastUpdatedTimeMs == null) {
            console.error(`Cannot update cubeRotation. Status - [${this.status}]. LastUpdated - [${this._lastUpdatedTimeMs}].`);
            return;
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
        const rotationIncrement = (Math.abs(this.slice.direction) * ((increment / 100) * Math.PI)) / 2;
        this._rotationPercentage += increment;
        rotationGroup.rotateOnWorldAxis(
            new Vector3(
                this.slice.axis === 'x' ? this.slice.direction : 0,
                this.slice.axis === 'y' ? this.slice.direction : 0,
                this.slice.axis === 'z' ? this.slice.direction : 0,
            ).normalize(),
            rotationIncrement,
        );

        if (this._rotationPercentage === 100) {
            this.status = 'complete';
        }

        if (this._rotationPercentage > 100) {
            throw new Error('rotation percentage > 100');
        }
    }
}
