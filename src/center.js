import * as THREE from "three";
/**
 * @param {THREE.Geometry} sticker
 * @param {THREE.Material} frontMaterial
 * @param {THREE.Material} topMaterial
 * @param {THREE.Material} coreMaterial
 * @returns {{group: THREE.Group, frontSticker: THREE.Mesh, topSticker:THREE.Mesh}}
 */
export default function newCenter(sticker, frontMaterial, coreMaterial) {
  const group = new THREE.Group();
  const boxGeom = new THREE.BoxGeometry(1, 1, 1);
  const boxMesh = new THREE.Mesh(boxGeom, coreMaterial);
  group.add(boxMesh);

  const frontSticker = new THREE.Mesh(sticker, frontMaterial);
  frontSticker.position.set(0, 0, 0.5);
  frontSticker.rotation.set(0, 0, 0);
  group.add(frontSticker);

  return { group, frontSticker };
}
