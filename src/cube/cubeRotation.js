import { Vector3, Group } from 'three';

export class CubeRotation {
    /**
     * @param {{axis: "x"|"y"|"z", layers: (-1|0|1)[], direction: 1|-1|2|-2}} input
     */
    constructor(rotation) {
        /** @type {{axis: "x"|"y"|"z", layers: (-1|0|1)[], direction: 1|-1|2|-2}} */
        this.rotation = rotation;
        /** @type {"pending" | "initialised" | "complete" | "disposed"} */
        this.status = 'pending';
        /** @type {number} */
        this.timestampMs = performance.now();
        /** @type {number} */
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
        var intervalMs = performance.now() - this._lastUpdatedTimeMs;
        this._lastUpdatedTimeMs = performance.now();

        var increment = 100 - this._rotationPercentage;
        if (speedMs != 0) {
            var potentialIncrement = (intervalMs / speedMs) * 100;
            if (potentialIncrement + this._rotationPercentage < 100) {
                increment = potentialIncrement;
            }
        }
        const rotationIncrement = (Math.abs(this.rotation.direction) * ((increment / 100) * Math.PI)) / 2;
        this._rotationPercentage += increment;
        rotationGroup.rotateOnWorldAxis(
            new Vector3(
                this.rotation.axis === 'x' ? this.rotation.direction : 0,
                this.rotation.axis === 'y' ? this.rotation.direction : 0,
                this.rotation.axis === 'z' ? this.rotation.direction : 0,
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
