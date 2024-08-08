import * as THREE from "three";
/**
 * @param {THREE.Geometry} sticker
 * @param {THREE.Material} frontMaterial
 * @param {THREE.Material} rightMaterial
 * @param {THREE.Material} topMaterial
 * @param {THREE.Material} coreMaterial
 * @returns {{group: THREE.Group, frontSticker: THREE.Mesh, rightSticker:THREE.Mesh, topSticker:THREE.Mesh}}
 */
export default function newCorner(
  sticker,
  frontMaterial,
  rightMaterial,
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

  //right
  const rightSticker = new THREE.Mesh(sticker, rightMaterial);
  rightSticker.position.set(0.5, 0, 0);
  rightSticker.rotation.set(Math.PI / 2, Math.PI / 2, 0);
  group.add(rightSticker);

  //white/yellow
  const topSticker = new THREE.Mesh(sticker, topMaterial);
  topSticker.position.set(0, 0.5, 0);
  topSticker.rotation.set(-Math.PI / 2, 0, -Math.PI / 2);
  group.add(topSticker);

  return { group, frontSticker, rightSticker, topSticker };
}
