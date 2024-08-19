import * as THREE from "three";
export default class Materials {
  static front = new THREE.MeshStandardMaterial({
    color: "#2cbf13",
    metalness: 0,
    roughness: 0.4,
  });
  static back = new THREE.MeshStandardMaterial({
    color: "blue",
    metalness: 0,
    roughness: 0.4,
  });
  static top = new THREE.MeshStandardMaterial({
    color: "white",
    metalness: 0,
    roughness: 0.4,
  });
  static bottom = new THREE.MeshStandardMaterial({
    color: "yellow",
    metalness: 0,
    roughness: 0.4,
  });
  static left = new THREE.MeshStandardMaterial({
    color: "#fc9a05",
    metalness: 0,
    roughness: 0.4,
  });
  static right = new THREE.MeshStandardMaterial({
    color: "red",
    metalness: 0,
    roughness: 0.4,
  });
  static core = new THREE.MeshBasicMaterial({
    color: "black",
  });
}
