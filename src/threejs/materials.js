// @ts-check
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
        userData: { type: 'sticker', face: Faces.F, color: FaceColours.F },
    });
    static back = new MeshStandardMaterial({
        color: 'blue',
        metalness: 0,
        roughness: 0.4,
        /** @type {StickerUserData} */
        userData: { type: 'sticker', face: Faces.B, color: FaceColours.B },
    });
    static up = new MeshStandardMaterial({
        color: 'white',
        metalness: 0,
        roughness: 0.4,
        /** @type {StickerUserData} */
        userData: { type: 'sticker', face: Faces.U, color: FaceColours.U },
    });
    static down = new MeshStandardMaterial({
        color: 'yellow',
        metalness: 0,
        roughness: 0.4,
        /** @type {StickerUserData} */
        userData: { type: 'sticker', face: Faces.D, color: FaceColours.D },
    });
    static left = new MeshStandardMaterial({
        color: '#fc9a05',
        metalness: 0,
        roughness: 0.4,
        /** @type {StickerUserData} */
        userData: { type: 'sticker', face: Faces.L, color: FaceColours.L },
    });
    static right = new MeshStandardMaterial({
        color: 'red',
        metalness: 0,
        roughness: 0.4,
        /** @type {StickerUserData} */
        userData: { type: 'sticker', face: Faces.R, color: FaceColours.R },
    });
    static core = new MeshBasicMaterial({
        color: 'black',
        /** @type {CoreUserData} */
        userData: { type: 'core' },
    });
}
