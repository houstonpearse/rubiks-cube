export default class Resizer {
  constructor() {
    this.x = 0;
    document.querySelectorAll(".resizer").forEach((elem) => {
      const direction = elem.className.includes("left") ? "left" : "right";
      const resizeFunc = (e) => this.resize(e, elem, direction);
      elem.addEventListener("mousedown", (e) => {
        this.x = e.x;
        document.addEventListener("mousemove", resizeFunc);
      });
      document.addEventListener("mouseup", (e) => {
        document.removeEventListener("mousemove", resizeFunc);
      });
    });
  }

  resize(e, elem, direction) {
    const dx = (this.x - e.x) * (direction === "right" ? 1 : -1);
    this.x = e.x;
    elem.parentElement.style.width =
      parseInt(getComputedStyle(elem.parentElement).width) - dx + "px";
  }
}
