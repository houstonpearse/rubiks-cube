import { Vector3, Group } from 'three';
import Cube from './cube/cube';

export class AnimationQueue {
    constructor(type = 'exponential', factor = 1.3) {
        /** @type {Animation[]} */
        this.queue = [];
        /** @type {Animation | undefined} */
        this.currentAnimation = undefined;
        /** @type {{type: "fast-forward" | "exponential", factor: number}} */
        this.type = type;
        this.factor = factor;
    }

    clear() {
        this.queue = [];
        if (this.currentAnimation) {
            this.currentAnimation.fastforward = true;
            this.currentAnimation.update();
            this.currentAnimation = undefined;
        }
    }

    /**
     * @param {Animation} animation
     */
    add(animation) {
        if (this.type === 'fast-forward') {
            this.fastForward();
        } else if (this.type === 'exponential') {
            this.exponential();
        }
        this.queue.push(animation);
    }

    /* exponentially increases the animation speed with the depth of the queue */
    exponential() {
        let animations = [];
        if (this.currentAnimation) animations.push(this.currentAnimation);
        animations = animations.concat(this.queue);
        for (let i = 0; i < animations.length; i++) {
            animations[i].setSpeed(this.factor ** (animations.length - i - 1));
        }
    }

    /* instantly completes any queued animations */
    fastForward() {
        if (this.currentAnimation) {
            this.currentAnimation.setFastForward();
        }
        if (this.queue.length) {
            for (const a of this.queue) {
                a.setFastForward();
            }
        }
    }

    update() {
        if (this.currentAnimation === undefined || this.currentAnimation.getFinished()) {
            this.currentAnimation = this.queue.shift();
        }
        if (this.currentAnimation === undefined) return;
        this.currentAnimation.update();
    }

    finished() {
        return this.currentAnimation?.getFinished();
    }

    /**
     *
     * @returns {Group | undefined}
     */
    getAnimationGroup() {
        return this.currentAnimation?.getLayerGroup();
    }
}

export class Animation {
    /**
     *
     * @param {Cube} cube
     * @param {"x"|"y"|"z"} axis
     * @param {(-1|0|1)[]} layers
     * @param {1|-1|2|-2} direction
     * @param {number} duration milliseconds
     */
    constructor(cube, axis, layers, direction, duration) {
        this._cube = cube;
        this._axis = axis;
        this._layers = layers;
        this._direction = direction;
        this._duration = duration;
        this._layerGroup = new Group();
        this._finished = false;
        this._lastUpdate = undefined;
        this._totalRotation = 0;
        this.fastforward = false;
        this.speed = 1;
    }

    setFastForward(value = true) {
        this.fastforward = value;
    }

    setSpeed(value = 1) {
        this.speed = value;
    }

    getLayerGroup() {
        return this._layerGroup;
    }

    getFinished() {
        return this._finished;
    }

    init() {
        this._lastUpdate = Date.now();
        const layerObjects = this.getRotationLayer(this._axis, this._layers);
        this._layerGroup.add(...layerObjects);
    }

    /**
     * @param {"x"|"y"|"z"} axis
     * @param {{-1|0|1}[]} layers
     * @returns {Object3D[]}
     */
    getRotationLayer(axis, layers) {
        if (layers.length === 0) {
            return [...this._cube.group.children];
        }
        return this._cube.group.children.filter((piece) => {
            if (axis === 'x') {
                return layers.includes(Math.round(piece.userData.position.x));
            } else if (axis === 'y') {
                return layers.includes(Math.round(piece.userData.position.y));
            } else if (axis === 'z') {
                return layers.includes(Math.round(piece.userData.position.z));
            }
            return false;
        });
    }

    dispose() {
        this._finished = true;
        this._layerGroup.children.forEach((piece) => {
            piece.getWorldPosition(piece.position);
            piece.getWorldQuaternion(piece.quaternion);
            var x = Math.round(piece.position.x);
            var y = Math.round(piece.position.y);
            var z = Math.round(piece.position.z);
            piece.userData.position.x = Math.abs(x) > 1 ? Math.sign(x) : x;
            piece.userData.position.y = Math.abs(y) > 1 ? Math.sign(y) : y;
            piece.userData.position.z = Math.abs(z) > 1 ? Math.sign(z) : z;
            piece.userData.rotation.x = piece.rotation.x;
            piece.userData.rotation.y = piece.rotation.y;
            piece.userData.rotation.z = piece.rotation.z;
        });
        this._cube.group.add(...this._layerGroup.children);
    }

    update() {
        if (this._lastUpdate === undefined) {
            this.init();
        }

        var interval = (Date.now() - this._lastUpdate) * this.speed;
        this._lastUpdate = Date.now();
        if (this.fastforward || interval + this._totalRotation > this._duration) {
            interval = this._duration - this._totalRotation;
        }
        const rotationIncrement = (Math.abs(this._direction) * ((interval / this._duration) * Math.PI)) / 2;
        this._totalRotation += interval;
        this._layerGroup.rotateOnWorldAxis(
            new Vector3(
                this._axis === 'x' ? this._direction : 0,
                this._axis === 'y' ? this._direction : 0,
                this._axis === 'z' ? this._direction : 0,
            ).normalize(),
            rotationIncrement,
        );

        if (this._totalRotation >= this._duration) {
            this.dispose();
        }
    }
}
