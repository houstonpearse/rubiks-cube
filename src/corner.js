import { Group, BoxGeometry, Mesh } from "three";
/**
 * @param {Geometry} sticker
 * @param {Material} frontMaterial
 * @param {Material} rightMaterial
 * @param {Material} topMaterial
 * @param {Material} coreMaterial
 * @returns {{group: Group, frontSticker: Mesh, rightSticker:Mesh, topSticker:Mesh}}
 */
export default function newCorner(
  sticker,
  frontMaterial,
  rightMaterial,
  topMaterial,
  coreMaterial
) {
  const group = new Group();
  const boxGeom = new BoxGeometry(1, 1, 1);
  const boxMesh = new Mesh(boxGeom, coreMaterial);
  boxMesh.userData = { type: "piece" };
  group.add(boxMesh);

  // front
  const frontSticker = new Mesh(sticker, frontMaterial);
  frontSticker.userData = { type: "sticker" };
  frontSticker.position.set(0, 0, 0.5);
  frontSticker.rotation.set(0, 0, 0);
  group.add(frontSticker);

  //right
  const rightSticker = new Mesh(sticker, rightMaterial);
  rightSticker.userData = { type: "sticker" };
  rightSticker.position.set(0.5, 0, 0);
  rightSticker.rotation.set(Math.PI / 2, Math.PI / 2, 0);
  group.add(rightSticker);

  //white/yellow
  const topSticker = new Mesh(sticker, topMaterial);
  topSticker.userData = { type: "sticker" };
  topSticker.position.set(0, 0.5, 0);
  topSticker.rotation.set(-Math.PI / 2, 0, -Math.PI / 2);
  group.add(topSticker);

  return { group, frontSticker, rightSticker, topSticker };
}
