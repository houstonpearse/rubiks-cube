export default class Controls {
  movementControls = new Map([
    ["t", "x"],
    ["y", "x'"],
    ["g", "y"],
    ["h", "y'"],
    ["b", "z"],
    ["n", "z'"],
    ["f", "U'"],
    ["F", "u'"],
    ["j", "U"],
    ["J", "u"],
    ["d", "L"],
    ["s", "L'"],
    ["k", "R"],
    ["l", "R'"],
    ["a", "D"],
    [";", "D'"],
    ["r", "F'"],
    ["u", "F"],
    ["i", "M"],
    ["e", "M'"],
    ["o", "S"],
    ["w", "S'"],
    ["q", "B"],
    ["p", "B'"],
    ["v", "E"],
    ["m", "E'"],
  ]);

  cameraControls = new Map([
    [" ", "peek-toggle-horizontal"],
    ["Meta", "peek-toggle-vertical"],
    ["ArrowRight", "peek-right"],
    ["ArrowLeft", "peek-left"],
    ["ArrowUp", "peek-up"],
    ["ArrowDown", "peek-down"],
  ]);

  constructor() {
    window.addEventListener("keydown", (e) => {
      const cubes = document.querySelectorAll("rubiks-cube");
      const action = this.movementControls.get(e.key);
      if (action) {
        const event = new CustomEvent("rotate", {
          detail: { action },
        });
        cubes.forEach((cube) => cube.dispatchEvent(event));
      }
      const cameraAction = this.cameraControls.get(e.key);
      if (cameraAction) {
        const event = new CustomEvent("camera", {
          detail: { action: cameraAction },
        });
        cubes.forEach((cube) => cube.dispatchEvent(event));
      }
    });
  }
}
