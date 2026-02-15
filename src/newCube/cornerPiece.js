/// @ts-check
import { BoxGeometry, ExtrudeGeometry, Material, Mesh, MeshBasicMaterial, Object3D } from 'three';
import { Sticker } from './sticker';
import { SVGLoader } from 'three/examples/jsm/Addons.js';

/** @typedef {{ positon: vector, rotation: vector }} CornerPieceUserData */
/**
 * @param {Material} frontMaterial
 * @param {Material} rightMaterial
 * @param {Material} topMaterial
 * @param {Material} coreMaterial
 * @returns {Group}
 */
export class CornerPiece extends Object3D {
    constructor() {
        super();
        const boxGeom = new BoxGeometry(1, 1, 1);
        const boxMesh = new Mesh(boxGeom, new MeshBasicMaterial({ color: 'black' }));
        this.add(boxMesh);
        /** @type {CornerPieceUserData} */
        this.userData = { position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 } };

        this.frontSticker = new CornerSticker();
        this.frontSticker.position.set(0, 0, 0.5);
        this.frontSticker.rotation.set(0, 0, 0);
        this.add(this.frontSticker);

        this.rightSticker = new CornerSticker();
        this.rightSticker.position.set(0.5, 0, 0);
        this.rightSticker.rotation.set(Math.PI / 2, Math.PI / 2, 0);
        this.add(this.rightSticker);

        this.topSticker = new CornerSticker();
        this.topSticker.position.set(0, 0.5, 0);
        this.topSticker.rotation.set(-Math.PI / 2, 0, -Math.PI / 2);
        this.add(this.topSticker);
    }

    get stickers() {
        return [this.frontSticker, this.rightSticker, this.topSticker];
    }
}

const loader = new SVGLoader();
const cornerSVG = loader.parse(`
<svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" xmlns:bx="https://boxy-svg.com">
  <path  d="M 25 0 H 500 V 500 H 0 V 25 A 25 25 0 0 1 25 0 Z" bx:shape="rect 0 0 500 500 25 0 0 0 1@a864c1ee"/>
</svg>
`);
const cornerGeometry = new ExtrudeGeometry(SVGLoader.createShapes(cornerSVG.paths[0])[0], {
    depth: 15,
})
    .scale(0.002, 0.002, 0.002)
    .translate(-0.5, -0.5, 0);

export class CornerSticker extends Sticker {
    constructor() {
        super(cornerGeometry);
    }
}
