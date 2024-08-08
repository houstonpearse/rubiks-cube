import * as THREE from "three";
import { CubeMaterials } from "./materials";
import { getStickerGeometry } from "./stickers";
import newCorner from "./corner";
import newEdge from "./edge";
import newCenter from "./center";
import { newCubeState } from "./cubeState";

export function newCube() {
  return newCubeState().map((state) => {
    const group = createPiece(state.position, state.type);
    //rotate the piece
    group.position.set(
      state.position.x * 1.04,
      state.position.y * 1.04,
      state.position.z * 1.04
    );
    group.rotation.set(state.rotation.x, state.rotation.y, state.rotation.z);
    return {
      state,
      group,
    };
  });
}
/**
 * @param {import("./src/cubeState").vector} position
 * @param {"corner | edge | center"} type
 * @returns {THREE.Group}
 */
function createPiece(position, type) {
  if (type === "corner") {
    return createCorner(position).group;
  } else if (type === "edge") {
    return createEdge(position).group;
  } else if (type === "center") {
    return createCenter(position).group;
  } else {
    throw new Error("Invalid type: " + type);
  }
}
/**
 * @param {import("./src/cubeState").vector} position
 * @returns {THREE.Group}
 */
function createCorner(position) {
  if (position.x == 1 && position.y == 1 && position.z == 1) {
    return newCorner(
      getStickerGeometry("corner"),
      CubeMaterials.green,
      CubeMaterials.red,
      CubeMaterials.white,
      CubeMaterials.core
    );
  } else if (position.x == 1 && position.y == 1 && position.z == -1) {
    return newCorner(
      getStickerGeometry("corner"),
      CubeMaterials.red,
      CubeMaterials.blue,
      CubeMaterials.white,
      CubeMaterials.core
    );
  } else if (position.x == 1 && position.y == -1 && position.z == 1) {
    return newCorner(
      getStickerGeometry("corner"),
      CubeMaterials.red,
      CubeMaterials.green,
      CubeMaterials.yellow,
      CubeMaterials.core
    );
  } else if (position.x == 1 && position.y == -1 && position.z == -1) {
    return newCorner(
      getStickerGeometry("corner"),
      CubeMaterials.blue,
      CubeMaterials.red,
      CubeMaterials.yellow,
      CubeMaterials.core
    );
  } else if (position.x == -1 && position.y == 1 && position.z == 1) {
    return newCorner(
      getStickerGeometry("corner"),
      CubeMaterials.orange,
      CubeMaterials.green,
      CubeMaterials.white,
      CubeMaterials.core
    );
  } else if (position.x == -1 && position.y == 1 && position.z == -1) {
    return newCorner(
      getStickerGeometry("corner"),
      CubeMaterials.blue,
      CubeMaterials.orange,
      CubeMaterials.white,
      CubeMaterials.core
    );
  } else if (position.x == -1 && position.y == -1 && position.z == 1) {
    return newCorner(
      getStickerGeometry("corner"),
      CubeMaterials.green,
      CubeMaterials.orange,
      CubeMaterials.yellow,
      CubeMaterials.core
    );
  } else if (position.x == -1 && position.y == -1 && position.z == -1) {
    return newCorner(
      getStickerGeometry("corner"),
      CubeMaterials.orange,
      CubeMaterials.blue,
      CubeMaterials.yellow,
      CubeMaterials.core
    );
  } else {
    throw new Error("Invalid corner position: " + position);
  }
}

function createEdge(position) {
  if (position.x == 1 && position.y == 1 && position.z == 0) {
    return newEdge(
      getStickerGeometry("edge"),
      CubeMaterials.red,
      CubeMaterials.white,
      CubeMaterials.core
    );
  } else if (position.x == 1 && position.y == -1 && position.z == 0) {
    return newEdge(
      getStickerGeometry("edge"),
      CubeMaterials.red,
      CubeMaterials.yellow,
      CubeMaterials.core
    );
  } else if (position.x == 1 && position.y == 0 && position.z == 1) {
    return newEdge(
      getStickerGeometry("edge"),
      CubeMaterials.green,
      CubeMaterials.red,
      CubeMaterials.core
    );
  } else if (position.x == 1 && position.y == 0 && position.z == -1) {
    return newEdge(
      getStickerGeometry("edge"),
      CubeMaterials.red,
      CubeMaterials.blue,
      CubeMaterials.core
    );
  } else if (position.x == -1 && position.y == 1 && position.z == 0) {
    return newEdge(
      getStickerGeometry("edge"),
      CubeMaterials.orange,
      CubeMaterials.white,
      CubeMaterials.core
    );
  } else if (position.x == -1 && position.y == -1 && position.z == 0) {
    return newEdge(
      getStickerGeometry("edge"),
      CubeMaterials.orange,
      CubeMaterials.yellow,
      CubeMaterials.core
    );
  } else if (position.x == -1 && position.y == 0 && position.z == 1) {
    return newEdge(
      getStickerGeometry("edge"),
      CubeMaterials.green,
      CubeMaterials.orange,
      CubeMaterials.core
    );
  } else if (position.x == -1 && position.y == 0 && position.z == -1) {
    return newEdge(
      getStickerGeometry("edge"),
      CubeMaterials.orange,
      CubeMaterials.blue,
      CubeMaterials.core
    );
  } else if (position.x == 0 && position.y == 1 && position.z == 1) {
    return newEdge(
      getStickerGeometry("edge"),
      CubeMaterials.green,
      CubeMaterials.white,
      CubeMaterials.core
    );
  } else if (position.x == 0 && position.y == 1 && position.z == -1) {
    return newEdge(
      getStickerGeometry("edge"),
      CubeMaterials.white,
      CubeMaterials.blue,
      CubeMaterials.core
    );
  } else if (position.x == 0 && position.y == -1 && position.z == 1) {
    return newEdge(
      getStickerGeometry("edge"),
      CubeMaterials.yellow,
      CubeMaterials.green,
      CubeMaterials.core
    );
  } else if (position.x == 0 && position.y == -1 && position.z == -1) {
    return newEdge(
      getStickerGeometry("edge"),
      CubeMaterials.blue,
      CubeMaterials.yellow,
      CubeMaterials.core
    );
  } else {
    throw new Error("Invalid edge position: " + position);
  }
}

function createCenter(position) {
  var centerColor = CubeMaterials.white;
  if (position.x !== 0) {
    centerColor = position.x > 0 ? CubeMaterials.red : CubeMaterials.orange;
  } else if (position.y !== 0) {
    centerColor = position.y > 0 ? CubeMaterials.white : CubeMaterials.yellow;
  } else if (position.z !== 0) {
    centerColor = position.z > 0 ? CubeMaterials.green : CubeMaterials.blue;
  }
  return newCenter(
    getStickerGeometry("center"),
    centerColor,
    CubeMaterials.core
  );
}

export function createCore() {
  return new THREE.Mesh(new THREE.SphereGeometry(1.5), CubeMaterials.core);
}
