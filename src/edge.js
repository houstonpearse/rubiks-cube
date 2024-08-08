import * as THREE from "three";
/**
 * @param {THREE.Geometry} sticker
 * @param {THREE.Material} frontMaterial
 * @param {THREE.Material} topMaterial
 * @param {THREE.Material} coreMaterial
 * @returns {{group: THREE.Group, frontSticker: THREE.Mesh, topSticker:THREE.Mesh}}
 */
export default function newEdge(
  sticker,
  frontMaterial,
  topMaterial,
  coreMaterial
) {
  const group = new THREE.Group();
  const boxGeom = new THREE.BoxGeometry(1, 1, 1);
  const boxMesh = new THREE.Mesh(boxGeom, coreMaterial);
  group.add(boxMesh);

  // front
  const frontSticker = new THREE.Mesh(sticker, frontMaterial);
  frontSticker.position.set(0, 0, 0.5);
  frontSticker.rotation.set(0, 0, 0);
  group.add(frontSticker);

  // top
  const topSticker = new THREE.Mesh(sticker, topMaterial);
  topSticker.position.set(0, 0.5, 0);
  topSticker.rotation.set(-Math.PI / 2, 0, Math.PI);
  group.add(topSticker);

  return { group, frontSticker, topSticker };
}
