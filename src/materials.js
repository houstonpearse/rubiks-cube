import * as THREE from "three";
export default class Materials {
  static front = new THREE.MeshStandardMaterial({
    color: "#2cbf13",
    metalness: 0,
    roughness: 0.4,
    userData: { face: "front", color: "green" },
  });
  static back = new THREE.MeshStandardMaterial({
    color: "blue",
    metalness: 0,
    roughness: 0.4,
    userData: { face: "back", color: "blue" },
  });
  static up = new THREE.MeshStandardMaterial({
    color: "white",
    metalness: 0,
    roughness: 0.4,
    userData: { face: "up", color: "white" },
  });
  static down = new THREE.MeshStandardMaterial({
    color: "yellow",
    metalness: 0,
    roughness: 0.4,
    userData: { face: "down", color: "yellow" },
  });
  static left = new THREE.MeshStandardMaterial({
    color: "#fc9a05",
    metalness: 0,
    roughness: 0.4,
    userData: { face: "left", color: "orange" },
  });
  static right = new THREE.MeshStandardMaterial({
    color: "red",
    metalness: 0,
    roughness: 0.4,
    userData: { face: "right", color: "red" },
  });
  static core = new THREE.MeshBasicMaterial({
    color: "black",
  });
}
