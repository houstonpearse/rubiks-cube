import { SVGLoader } from "three/examples/jsm/Addons.js";
import { ExtrudeGeometry } from "three";

const loader = new SVGLoader();
const cornerSVG = loader.parse(`
<svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" xmlns:bx="https://boxy-svg.com">
  <path  d="M 25 0 H 500 V 500 H 0 V 25 A 25 25 0 0 1 25 0 Z" bx:shape="rect 0 0 500 500 25 0 0 0 1@a864c1ee"/>
</svg>
`);
const edgeSVG = loader.parse(`
<svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
  <path d="M 150 0 L 350 0 C 450 0 500 50 500 120 L 500 500 L 0 500 L 0 120 C 0 50 50 0 150 0 Z"></path>
</svg>
`);
const centerSVG = loader.parse(`
<svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
  <path  d="M 120 0 L 380 0 C 450 0 500 50 500 120 L 500 380 C 500 450 450 500 380 500 L 120 500 C 50 500 0 450 0 380 L 0 120 C 0 50 50 0 120 0 Z"></path>
</svg>
`);

export default class Stickers {
  static center = new ExtrudeGeometry(
    SVGLoader.createShapes(centerSVG.paths[0])[0],
    {
      depth: 15,
    }
  )
    .scale(0.002, 0.002, 0.002)
    .translate(-0.5, -0.5, 0);

  static edge = new ExtrudeGeometry(
    SVGLoader.createShapes(edgeSVG.paths[0])[0],
    {
      depth: 15,
    }
  )
    .scale(0.002, 0.002, 0.002)
    .translate(-0.5, -0.5, 0);

  static corner = new ExtrudeGeometry(
    SVGLoader.createShapes(cornerSVG.paths[0])[0],
    {
      depth: 15,
    }
  )
    .scale(0.002, 0.002, 0.002)
    .translate(-0.5, -0.5, 0);
}
