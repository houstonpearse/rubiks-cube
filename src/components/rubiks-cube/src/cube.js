import * as THREE from "three";
import Materials from "./materials";
import Stickers from "./stickers";
import newCorner from "./corner";
import newEdge from "./edge";
import newCenter from "./center";
import { newCubeState } from "./cubeState";

export default class Cube {
  constructor() {
    this.group = new THREE.Group();
    const core = this.createCore();
    core.userData = {
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      initialPosition: { x: 0, y: 0, z: 0 },
      initialRotation: { x: 0, y: 0, z: 0 },
      type: "core",
    };
    this.group.add(core);

    for (const state of newCubeState()) {
      const piece = this.createPiece(state.position, state.type);
      piece.position.set(
        state.position.x * 1.04,
        state.position.y * 1.04,
        state.position.z * 1.04
      );
      piece.rotation.set(state.rotation.x, state.rotation.y, state.rotation.z);
      piece.userData = {
        position: state.position,
        rotation: state.rotation,
        initialPosition: state.position,
        initialRotation: state.rotation,
        type: state.type,
      };
      this.group.add(piece);
    }
  }
  /**
   * @param {"x"|"y"|"z"} axis
   * @param {{-1|0|1}[]} layers
   * @returns {THREE.Object3D[]}
   */
  getRotationLayer(axis, layers) {
    if (layers.length === 0) {
      return [...this.group.children];
    }
    return this.group.children.filter((piece) => {
      if (axis === "x") {
        return layers.includes(Math.round(piece.userData.position.x));
      } else if (axis === "y") {
        return layers.includes(Math.round(piece.userData.position.y));
      } else if (axis === "z") {
        return layers.includes(Math.round(piece.userData.position.z));
      }
      return false;
    });
  }

  /**
   * @param {{x:number,y:number,z:number}} position
   * @param {"corner | edge | center"} type
   * @returns {THREE.Group}
   */
  createPiece(position, type) {
    if (type === "corner") {
      return this.createCorner(position).group;
    } else if (type === "edge") {
      return this.createEdge(position).group;
    } else if (type === "center") {
      return this.createCenter(position).group;
    } else {
      throw new Error("Invalid type: " + type);
    }
  }
  /**
   * @param {{x:number,y:number,z:number}} position
   * @returns {THREE.Group}
   */
  createCorner(position) {
    if (position.x == 1 && position.y == 1 && position.z == 1) {
      return newCorner(
        Stickers.corner,
        Materials.front,
        Materials.right,
        Materials.top,
        Materials.core
      );
    } else if (position.x == 1 && position.y == 1 && position.z == -1) {
      return newCorner(
        Stickers.corner,
        Materials.right,
        Materials.back,
        Materials.top,
        Materials.core
      );
    } else if (position.x == 1 && position.y == -1 && position.z == 1) {
      return newCorner(
        Stickers.corner,
        Materials.right,
        Materials.front,
        Materials.bottom,
        Materials.core
      );
    } else if (position.x == 1 && position.y == -1 && position.z == -1) {
      return newCorner(
        Stickers.corner,
        Materials.back,
        Materials.right,
        Materials.bottom,
        Materials.core
      );
    } else if (position.x == -1 && position.y == 1 && position.z == 1) {
      return newCorner(
        Stickers.corner,
        Materials.left,
        Materials.front,
        Materials.top,
        Materials.core
      );
    } else if (position.x == -1 && position.y == 1 && position.z == -1) {
      return newCorner(
        Stickers.corner,
        Materials.back,
        Materials.left,
        Materials.top,
        Materials.core
      );
    } else if (position.x == -1 && position.y == -1 && position.z == 1) {
      return newCorner(
        Stickers.corner,
        Materials.front,
        Materials.left,
        Materials.bottom,
        Materials.core
      );
    } else if (position.x == -1 && position.y == -1 && position.z == -1) {
      return newCorner(
        Stickers.corner,
        Materials.left,
        Materials.back,
        Materials.bottom,
        Materials.core
      );
    } else {
      throw new Error("Invalid corner position: " + position);
    }
  }
  /**
   * @param {{x:number,y:number,z:number}} position
   * @returns {THREE.Group}
   */
  createEdge(position) {
    if (position.x == 1 && position.y == 1 && position.z == 0) {
      return newEdge(
        Stickers.edge,
        Materials.right,
        Materials.top,
        Materials.core
      );
    } else if (position.x == 1 && position.y == -1 && position.z == 0) {
      return newEdge(
        Stickers.edge,
        Materials.right,
        Materials.bottom,
        Materials.core
      );
    } else if (position.x == 1 && position.y == 0 && position.z == 1) {
      return newEdge(
        Stickers.edge,
        Materials.front,
        Materials.right,
        Materials.core
      );
    } else if (position.x == 1 && position.y == 0 && position.z == -1) {
      return newEdge(
        Stickers.edge,
        Materials.right,
        Materials.back,
        Materials.core
      );
    } else if (position.x == -1 && position.y == 1 && position.z == 0) {
      return newEdge(
        Stickers.edge,
        Materials.left,
        Materials.top,
        Materials.core
      );
    } else if (position.x == -1 && position.y == -1 && position.z == 0) {
      return newEdge(
        Stickers.edge,
        Materials.left,
        Materials.bottom,
        Materials.core
      );
    } else if (position.x == -1 && position.y == 0 && position.z == 1) {
      return newEdge(
        Stickers.edge,
        Materials.front,
        Materials.left,
        Materials.core
      );
    } else if (position.x == -1 && position.y == 0 && position.z == -1) {
      return newEdge(
        Stickers.edge,
        Materials.left,
        Materials.back,
        Materials.core
      );
    } else if (position.x == 0 && position.y == 1 && position.z == 1) {
      return newEdge(
        Stickers.edge,
        Materials.front,
        Materials.top,
        Materials.core
      );
    } else if (position.x == 0 && position.y == 1 && position.z == -1) {
      return newEdge(
        Stickers.edge,
        Materials.top,
        Materials.back,
        Materials.core
      );
    } else if (position.x == 0 && position.y == -1 && position.z == 1) {
      return newEdge(
        Stickers.edge,
        Materials.bottom,
        Materials.front,
        Materials.core
      );
    } else if (position.x == 0 && position.y == -1 && position.z == -1) {
      return newEdge(
        Stickers.edge,
        Materials.back,
        Materials.bottom,
        Materials.core
      );
    } else {
      throw new Error("Invalid edge position: " + position);
    }
  }
  /**
   * @param {{x:number,y:number,z:number}} position
   * @returns {THREE.Group}
   */
  createCenter(position) {
    var centerColor = Materials.top;
    if (position.x !== 0) {
      centerColor = position.x > 0 ? Materials.right : Materials.left;
    } else if (position.y !== 0) {
      centerColor = position.y > 0 ? Materials.top : Materials.bottom;
    } else if (position.z !== 0) {
      centerColor = position.z > 0 ? Materials.front : Materials.back;
    }
    return newCenter(Stickers.center, centerColor, Materials.core);
  }
  /**
   * @returns {THREE.Group}
   */
  createCore() {
    return new THREE.Mesh(new THREE.SphereGeometry(1.55), Materials.core);
  }
}
