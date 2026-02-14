import { Color, Material, Mesh, MeshStandardMaterial, Object3D } from "three";
import StickerGeometries from "./stickers";
import { FaceColours, Faces } from "../core";

/**
 * @param {Material} frontMaterial
 * @param {Material} rightMaterial
 * @param {Material} topMaterial
 * @param {Material} coreMaterial
 * @returns {Group}
 */
export class CornerPiece extends Object3D {
    contructor(stickerMaterial, topMaterial, coreMaterial) {
        super();
        const boxGeom = new BoxGeometry(1, 1, 1);
        const boxMesh = new Mesh(boxGeom, coreMaterial);
        boxMesh.scale
        boxMesh.userData = { type: 'piece' };
        this.add(boxMesh);

        // front
        this.frontSticker = new CornerSticker();
        this.frontSticker.position.set(0, 0, 0.5);
        this.frontSticker.rotation.set(0, 0, 0);
        this.add(frontSticker);

        //right
        this.rightSticker = new CornerSticker();
        this.rightSticker.position.set(0.5, 0, 0);
        this.rightSticker.rotation.set(Math.PI / 2, Math.PI / 2, 0);
        this.add(rightSticker);

        //white/yellow
        this.topSticker = new CornerSticker();
        this.topSticker.position.set(0, 0.5, 0);
        this.topSticker.rotation.set(-Math.PI / 2, 0, -Math.PI / 2);
        this.add(topSticker);
    };

    get stickers() {
        return [this.frontSticker, this.rightSticker, this.topSticker];
    }
}

/** @typedef {} StickerUserData */
export class Sticker extends Mesh {
    /**
     * @param {import("three").BufferGeometry} geometry 
     */
    constructor(geometry) {
        super(geometry, new MeshStandardMaterial({
            color: 'grey',
            metalness: 0,
            roughness: 0.4,
        }));
        /** @type {StickerUserData}  */
        this.userData = { color: FaceColours[Faces.U] };
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

export class CornerSticker extends Sticker {
    constructor() {
        super(StickerGeometries.corner);
    }
}
export class EdgeSticker extends Sticker {
    constructor() {
        super(StickerGeometries.edge);
    }
}
export class CenterSticker extends Sticker {
    constructor() {
        super(StickerGeometries.center);
    }
}