import { MeshStandardMaterial, MeshBasicMaterial } from "three";
export default class Materials {
  static front = new MeshStandardMaterial({
    color: "#2cbf13",
    metalness: 0,
    roughness: 0.4,
    userData: { face: "front", color: "green" },
  });
  static back = new MeshStandardMaterial({
    color: "blue",
    metalness: 0,
    roughness: 0.4,
    userData: { face: "back", color: "blue" },
  });
  static up = new MeshStandardMaterial({
    color: "white",
    metalness: 0,
    roughness: 0.4,
    userData: { face: "up", color: "white" },
  });
  static down = new MeshStandardMaterial({
    color: "yellow",
    metalness: 0,
    roughness: 0.4,
    userData: { face: "down", color: "yellow" },
  });
  static left = new MeshStandardMaterial({
    color: "#fc9a05",
    metalness: 0,
    roughness: 0.4,
    userData: { face: "left", color: "orange" },
  });
  static right = new MeshStandardMaterial({
    color: "red",
    metalness: 0,
    roughness: 0.4,
    userData: { face: "right", color: "red" },
  });
  static core = new MeshBasicMaterial({
    color: "black",
  });
}
