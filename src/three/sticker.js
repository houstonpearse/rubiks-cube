// @ts-check
import { Mesh, MeshStandardMaterial } from 'three';

export class Sticker extends Mesh {
    /**
     * @param {import("three").BufferGeometry} geometry
     */
    constructor(geometry) {
        super(
            geometry,
            new MeshStandardMaterial({
                color: 'white',
                metalness: 0,
                roughness: 0.4,
            }),
        );
        /** @type {{ color: import('three').ColorRepresentation }} */
        this.userData = { color: 'white' };
    }

    /**
     * @param {import('three').ColorRepresentation} color
     */
    set color(color) {
        const material = /** @type {MeshStandardMaterial} */ (this.material);
        material.color.set(color);
        this.userData.color = color;
    }

    /**
     * @returns {import('three').ColorRepresentation} color
     */
    get color() {
        const material = /** @type {MeshStandardMaterial} */ (this.material);
        return this.userData.color;
    }
}
