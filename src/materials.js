import * as THREE from "three";
export class CubeMaterials {
  static green = new THREE.MeshStandardMaterial({
    color: "#2cbf13",
    metalness: 0,
    roughness: 0.4,
  });
  static blue = new THREE.MeshStandardMaterial({
    color: "blue",
    metalness: 0,
    roughness: 0.4,
  });
  static white = new THREE.MeshStandardMaterial({
    color: "white",
    metalness: 0,
    roughness: 0.4,
  });
  static yellow = new THREE.MeshStandardMaterial({
    color: "yellow",
    metalness: 0,
    roughness: 0.4,
  });
  static orange = new THREE.MeshStandardMaterial({
    color: "#fc9a05",
    metalness: 0,
    roughness: 0.4,
  });
  static red = new THREE.MeshStandardMaterial({
    color: "red",
    metalness: 0,
    roughness: 0.4,
  });
  static core = new THREE.MeshBasicMaterial({
    color: "black",
  });
}
