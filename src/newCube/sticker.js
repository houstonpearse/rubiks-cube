// @ts-check
import { Color, Mesh, MeshStandardMaterial } from 'three';

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
    }

    /**
     * @param {Color} color
     */
    set color(color) {
        const material = /** @type {MeshStandardMaterial} */ (this.material);
        material.color.set(color);
    }

    /**
     * @returns {Color} color
     */
    get color() {
        const material = /** @type {MeshStandardMaterial} */ (this.material);
        return material.color;
    }
}
