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
    this.stickerState = this.getStickerState();
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

  getStickerState() {
    const state = {
      up: [[], [], []],
      down: [[], [], []],
      front: [[], [], []],
      back: [[], [], []],
      left: [[], [], []],
      right: [[], [], []],
    };
    this.group.children.forEach((piece) => {
      if (piece.userData.type === "core") {
        return;
      }
      piece.children.forEach((mesh) => {
        if (mesh.userData.type === "sticker") {
          const piecepos = new THREE.Vector3();
          piecepos.copy(piece.position);
          piecepos.round();
          const stickerpos = new THREE.Vector3();
          mesh.getWorldPosition(stickerpos);
          stickerpos.sub(piecepos);
          stickerpos.multiplyScalar(2);
          stickerpos.round();
          if (stickerpos.x === 1) {
            state.right[1 - Math.round(piece.position.y)][
              1 - Math.round(piece.position.z)
            ] = mesh.material.userData.face;
          } else if (stickerpos.x === -1) {
            state.left[1 - Math.round(piece.position.y)][
              1 + Math.round(piece.position.z)
            ] = mesh.material.userData.face;
          } else if (stickerpos.y === 1) {
            state.up[1 + Math.round(piece.position.z)][
              1 + Math.round(piece.position.x)
            ] = mesh.material.userData.face;
          } else if (stickerpos.y === -1) {
            state.down[1 - Math.round(piece.position.z)][
              1 + Math.round(piece.position.x)
            ] = mesh.material.userData.face;
          } else if (stickerpos.z === 1) {
            state.front[1 - Math.round(piece.position.y)][
              1 + Math.round(piece.position.x)
            ] = mesh.material.userData.face;
          } else if (stickerpos.z === -1) {
            state.back[1 - Math.round(piece.position.y)][
              1 - Math.round(piece.position.x)
            ] = mesh.material.userData.face;
          }
        }
      });
    });
    return state;
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
        Materials.up,
        Materials.core
      );
    } else if (position.x == 1 && position.y == 1 && position.z == -1) {
      return newCorner(
        Stickers.corner,
        Materials.right,
        Materials.back,
        Materials.up,
        Materials.core
      );
    } else if (position.x == 1 && position.y == -1 && position.z == 1) {
      return newCorner(
        Stickers.corner,
        Materials.right,
        Materials.front,
        Materials.down,
        Materials.core
      );
    } else if (position.x == 1 && position.y == -1 && position.z == -1) {
      return newCorner(
        Stickers.corner,
        Materials.back,
        Materials.right,
        Materials.down,
        Materials.core
      );
    } else if (position.x == -1 && position.y == 1 && position.z == 1) {
      return newCorner(
        Stickers.corner,
        Materials.left,
        Materials.front,
        Materials.up,
        Materials.core
      );
    } else if (position.x == -1 && position.y == 1 && position.z == -1) {
      return newCorner(
        Stickers.corner,
        Materials.back,
        Materials.left,
        Materials.up,
        Materials.core
      );
    } else if (position.x == -1 && position.y == -1 && position.z == 1) {
      return newCorner(
        Stickers.corner,
        Materials.front,
        Materials.left,
        Materials.down,
        Materials.core
      );
    } else if (position.x == -1 && position.y == -1 && position.z == -1) {
      return newCorner(
        Stickers.corner,
        Materials.left,
        Materials.back,
        Materials.down,
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
        Materials.up,
        Materials.core
      );
    } else if (position.x == 1 && position.y == -1 && position.z == 0) {
      return newEdge(
        Stickers.edge,
        Materials.right,
        Materials.down,
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
        Materials.up,
        Materials.core
      );
    } else if (position.x == -1 && position.y == -1 && position.z == 0) {
      return newEdge(
        Stickers.edge,
        Materials.left,
        Materials.down,
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
        Materials.up,
        Materials.core
      );
    } else if (position.x == 0 && position.y == 1 && position.z == -1) {
      return newEdge(
        Stickers.edge,
        Materials.up,
        Materials.back,
        Materials.core
      );
    } else if (position.x == 0 && position.y == -1 && position.z == 1) {
      return newEdge(
        Stickers.edge,
        Materials.down,
        Materials.front,
        Materials.core
      );
    } else if (position.x == 0 && position.y == -1 && position.z == -1) {
      return newEdge(
        Stickers.edge,
        Materials.back,
        Materials.down,
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
    var centerColor = Materials.up;
    if (position.x !== 0) {
      centerColor = position.x > 0 ? Materials.right : Materials.left;
    } else if (position.y !== 0) {
      centerColor = position.y > 0 ? Materials.up : Materials.down;
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
