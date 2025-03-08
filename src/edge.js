import { BoxGeometry, Group, Mesh, } from "three";
/**
 * @param {Geometry} sticker
 * @param {Material} frontMaterial
 * @param {Material} topMaterial
 * @param {Material} coreMaterial
 * @returns {{group: Group, frontSticker: Mesh, topSticker: Mesh}}
 */
export default function newEdge(
  sticker,
  frontMaterial,
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

  // top
  const topSticker = new Mesh(sticker, topMaterial);
  topSticker.userData = { type: "sticker" };
  topSticker.position.set(0, 0.5, 0);
  topSticker.rotation.set(-Math.PI / 2, 0, Math.PI);
  group.add(topSticker);

  return { group, frontSticker, topSticker };
}
