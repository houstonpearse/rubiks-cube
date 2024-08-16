import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/Addons.js";
const loader = new SVGLoader();
import cornerSVGUrl from "../assets/cornerSticker.svg";
import edgeSVGUrl from "../assets/edgeSticker.svg";
import centerSVGUrl from "../assets/centerSticker.svg";
export const cornerSVG = await loader.loadAsync(cornerSVGUrl);
export const edgeSVG = await loader.loadAsync(edgeSVGUrl);
export const centerSVG = await loader.loadAsync(centerSVGUrl);

/**
 *
 * @param {"corner" | "edge" | "center"} type
 */
export function getStickerGeometry(type) {
  let svg;
  if (type === "corner") {
    svg = cornerSVG;
  } else if (type === "edge") {
    svg = edgeSVG;
  } else if (type === "center") {
    svg = centerSVG;
  } else {
    throw new Error("Invalid type");
  }
  const shape = SVGLoader.createShapes(svg.paths[0])[0];
  return new THREE.ExtrudeGeometry(shape, {
    depth: 15,
  })
    .scale(0.002, 0.002, 0.002)
    .translate(-0.5, -0.5, 0);
}
