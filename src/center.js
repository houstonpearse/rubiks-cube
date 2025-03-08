import { Group, BoxGeometry, Mesh } from "three";
/**
 * @param {Geometry} sticker
 * @param {Material} frontMaterial
 * @param {Material} topMaterial
 * @param {Material} coreMaterial
 * @returns {{group: Group, frontSticker: Mesh, topSticker: Mesh}}
 */
export default function newCenter(sticker, frontMaterial, coreMaterial) {
  const group = new Group();
  const boxGeom = new BoxGeometry(1, 1, 1);
  const boxMesh = new Mesh(boxGeom, coreMaterial);
  boxMesh.userData = { type: "piece" };
  group.add(boxMesh);

  const frontSticker = new Mesh(sticker, frontMaterial);
  frontSticker.userData = { type: "sticker" };
  frontSticker.position.set(0, 0, 0.5);
  frontSticker.rotation.set(0, 0, 0);
  group.add(frontSticker);

  return { group, frontSticker };
}
