import { Group, BoxGeometry, Mesh, SphereGeometry, Material } from 'three';
import Stickers from './stickers';
import Materials from './materials';

/**
 * @param {Geometry} sticker
 * @param {Material} frontMaterial
 * @param {Material} rightMaterial
 * @param {Material} topMaterial
 * @param {Material} coreMaterial
 * @returns {Group}
 */
export function createCornerGroup(frontMaterial, rightMaterial, topMaterial, coreMaterial) {
    const group = new Group();
    const boxGeom = new BoxGeometry(1, 1, 1);
    const boxMesh = new Mesh(boxGeom, coreMaterial);
    boxMesh.userData = { type: 'piece' };
    group.add(boxMesh);

    // front
    const frontSticker = new Mesh(Stickers.corner, frontMaterial);
    frontSticker.userData = { type: 'sticker' };
    frontSticker.position.set(0, 0, 0.5);
    frontSticker.rotation.set(0, 0, 0);
    group.add(frontSticker);

    //right
    const rightSticker = new Mesh(Stickers.corner, rightMaterial);
    rightSticker.userData = { type: 'sticker' };
    rightSticker.position.set(0.5, 0, 0);
    rightSticker.rotation.set(Math.PI / 2, Math.PI / 2, 0);
    group.add(rightSticker);

    //white/yellow
    const topSticker = new Mesh(Stickers.corner, topMaterial);
    topSticker.userData = { type: 'sticker' };
    topSticker.position.set(0, 0.5, 0);
    topSticker.rotation.set(-Math.PI / 2, 0, -Math.PI / 2);
    group.add(topSticker);

    return group;
}

/**
 * @param {Geometry} sticker
 * @param {Material} frontMaterial
 * @param {Material} topMaterial
 * @param {Material} coreMaterial
 * @returns {Group}
 */
export function createEdgeGroup(frontMaterial, topMaterial, coreMaterial) {
    const group = new Group();
    const boxGeom = new BoxGeometry(1, 1, 1);
    const boxMesh = new Mesh(boxGeom, coreMaterial);
    boxMesh.userData = { type: 'piece' };
    group.add(boxMesh);

    // front
    const frontSticker = new Mesh(Stickers.edge, frontMaterial);
    frontSticker.userData = { type: 'sticker' };
    frontSticker.position.set(0, 0, 0.5);
    frontSticker.rotation.set(0, 0, 0);
    group.add(frontSticker);

    // top
    const topSticker = new Mesh(Stickers.edge, topMaterial);
    topSticker.userData = { type: 'sticker' };
    topSticker.position.set(0, 0.5, 0);
    topSticker.rotation.set(-Math.PI / 2, 0, Math.PI);
    group.add(topSticker);

    return group;
}

/**
 * @param {Geometry} sticker
 * @param {Material} frontMaterial
 * @param {Material} topMaterial
 * @param {Material} coreMaterial
 * @returns {Group}
 */
export function createCenterGroup(frontMaterial, coreMaterial) {
    const group = new Group();
    const boxGeom = new BoxGeometry(1, 1, 1);
    const boxMesh = new Mesh(boxGeom, coreMaterial);
    boxMesh.userData = { type: 'piece' };
    group.add(boxMesh);

    const frontSticker = new Mesh(Stickers.center, frontMaterial);
    frontSticker.userData = { type: 'sticker' };
    frontSticker.position.set(0, 0, 0.5);
    frontSticker.rotation.set(0, 0, 0);
    group.add(frontSticker);

    return group;
}

/**
 * @returns {Mesh}
 */
export function createCoreMesh() {
    return new Mesh(new SphereGeometry(1.53), Materials.core);
}
