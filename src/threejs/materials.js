import { MeshStandardMaterial, MeshBasicMaterial } from 'three';
import { FaceColours, Faces } from '../core';
/** @typedef {{type: "sticker", face: import('../core').Face , color: import('../core').FaceColour}} StickerUserData */
/** @typedef {{type: "core" }} CoreUserData */
export default class Materials {
    static front = new MeshStandardMaterial({
        color: '#2cbf13',
        metalness: 0,
        roughness: 0.4,
        /** @type {StickerUserData} */
        userData: { type: 'sticker', face: Faces.front, color: FaceColours.front },
    });
    static back = new MeshStandardMaterial({
        color: 'blue',
        metalness: 0,
        roughness: 0.4,
        /** @type {StickerUserData} */
        userData: { type: 'sticker', face: Faces.back, color: FaceColours.back },
    });
    static up = new MeshStandardMaterial({
        color: 'white',
        metalness: 0,
        roughness: 0.4,
        /** @type {StickerUserData} */
        userData: { type: 'sticker', face: Faces.up, color: FaceColours.up },
    });
    static down = new MeshStandardMaterial({
        color: 'yellow',
        metalness: 0,
        roughness: 0.4,
        /** @type {StickerUserData} */
        userData: { type: 'sticker', face: Faces.down, color: FaceColours.down },
    });
    static left = new MeshStandardMaterial({
        color: '#fc9a05',
        metalness: 0,
        roughness: 0.4,
        /** @type {StickerUserData} */
        userData: { type: 'sticker', face: Faces.left, color: FaceColours.left },
    });
    static right = new MeshStandardMaterial({
        color: 'red',
        metalness: 0,
        roughness: 0.4,
        /** @type {StickerUserData} */
        userData: { type: 'sticker', face: Faces.right, color: FaceColours.right },
    });
    static core = new MeshBasicMaterial({
        color: 'black',
        /** @type {CoreUserData} */
        userData: { type: 'core' },
    });
}
