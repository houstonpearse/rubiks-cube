// @ts-check
import { AnimationStyles, CubeTypes } from './core';
const defaultSettings = {
    cubeType: CubeTypes.Seven,
    animationSpeedMs: 100,
    /** @type {import('./core').AnimationStyle} */
    animationStyle: 'fixed',
    pieceGap: 1.04,
    cameraSpeedMs: 100,
    cameraRadius: 5,
    cameraPeekAngleHorizontal: 0.6,
    cameraPeekAngleVertical: 0.6,
    cameraFieldOfView: 75,
};
const minGap = 1;
const maxGap = 1.1;
const minRadius = 4;
const minFieldOfView = 30;
const maxFieldOfView = 100;

export default class Settings {
    constructor() {
        /** @type {import("./core").CubeType} */
        this.cubeType = defaultSettings.cubeType;
        /** @type {number} */
        this.pieceGap = defaultSettings.pieceGap;
        /** @type {number} */
        this.animationSpeedMs = defaultSettings.animationSpeedMs;
        /** @type {import("./core").AnimationStyle} */
        this.animationStyle = defaultSettings.animationStyle;
        /** @type {number} */
        this.cameraSpeedMs = defaultSettings.cameraSpeedMs;
        /** @type {number} */
        this.cameraRadius = defaultSettings.cameraRadius;
        /** @type {number} */
        this.cameraFieldOfView = defaultSettings.cameraFieldOfView;
        /** @type {number} */
        this.cameraPeekAngleHorizontal = defaultSettings.cameraPeekAngleHorizontal;
        /** @type {number} */
        this.cameraPeekAngleVertical = defaultSettings.cameraPeekAngleVertical;
    }

    /** @param {any} value */
    setCubeType(value) {
        if (value && Object.values(CubeTypes).includes(value)) {
            const cubeType = /** @type {import('./core').CubeType} */ (value);
            this.cubeType = cubeType;
            return;
        }
        console.warn(`Invalid cube type value. Accepted Values are [${Object.values(CubeTypes).join(', ')}] Value is ${value}`);
    }

    /** @param {string | null} value*/
    setPieceGap(value) {
        const gap = Number(value);
        if (gap >= minGap && gap <= maxGap && value != null) {
            this.pieceGap = gap;
            return;
        }
        console.warn(`Invalid pieceGap value. Min is ${minGap}. Max is ${maxGap}. Value is ${value}`);
    }

    /** @param {string | null} value in ms */
    setAnimationSpeed(value) {
        var speed = Number(value);
        if (speed >= 0 && value != null) {
            this.animationSpeedMs = speed;
            return;
        }
        console.warn(`Invalid animation speed value. Min is 0. Value is ${value}`);
    }

    /** @param {any} value */
    setAnimationStyle(value) {
        if (value && Object.values(AnimationStyles).includes(value)) {
            const validStyle = /** @type {import("./core").AnimationStyle} */ (value);
            this.animationStyle = validStyle;
            return;
        }
        console.warn(`Invalid animation style value. Accepted Values are [${Object.values(AnimationStyles).join(', ')}] Value is ${value}`);
    }

    /** @param {string | null} value in ms */
    setCameraSpeed(value) {
        var speed = Number(value);
        if (speed >= 0 && value != null) {
            this.cameraSpeedMs = speed;
            return;
        }
        console.warn(`Invalid camera speed value. Min is 0. Value is ${value}`);
    }

    /** @param {string | null} value */
    setCameraRadius(value) {
        var radius = Number(value);
        if (radius >= minRadius && value != null) {
            this.cameraRadius = radius;
            return;
        }
        console.warn(`Invalid camera radius value. Min is ${minRadius}. Value is ${value}`);
    }

    /** @param {string | null} value in ms */
    setCameraPeekAngleHorizontal(value) {
        var angle = Number(value);
        if (angle >= 0 && angle <= 1 && value != null) {
            this.cameraPeekAngleHorizontal = angle;
            return;
        }
        console.warn(`Invalid camera peek angle horizontal value. Min is 0, Max is 1. Value is ${value}`);
    }

    /** @param {string | null} value in ms */
    setCameraPeekAngleVertical(value) {
        var angle = Number(value);
        if (angle >= 0 && angle <= 1 && value != null) {
            this.cameraPeekAngleVertical = angle;
            return;
        }
        console.warn(`Invalid camera peek angle vertical value. Min is 0, Max is 1. Value is ${value}`);
    }

    /** @param {string | null} value in ms */
    setCameraFieldOfView(value) {
        var fov = Number(value);
        if (fov < minFieldOfView && value != null) {
            console.warn(`Invalid camera FOV value. Min is ${minFieldOfView} Max is ${maxFieldOfView}. Value is ${value} which is below the minimum.`);
            return;
        }
        if (fov > maxFieldOfView && value != null) {
            console.warn(`Invalid camera FOV value. Min is ${minFieldOfView} Max is ${maxFieldOfView}. Value is ${value} which is aboe the maximum.`);
            return;
        }
        if (value == null) {
            console.warn(`Invalid camera FOV value. Min is ${minFieldOfView} Max is ${maxFieldOfView}. Value is ${value}.`);
        }
        this.cameraFieldOfView = fov;
    }
}
