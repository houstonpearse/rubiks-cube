# Rubiks Cube Web Component

This package is a rubiks cube web component built with threejs. Camera animation smoothing is done with the tweenjs package.

## Adding the component

You can add the component to a webpage by adding an import statement in the index.js file. And then
by adding the webcomponent tag.

```js
//index.js
import "@houstonp/rubiks-cube";
```

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
  </head>
  <body>
    <rubiks-cube></rubiks-cube>
    <script type="module" src="index.js"></script>
  </body>
</html>
```

## state of the component

A state event occurs when a movement animation is completed. The event details contains the current state of the cube. The state is an object containing the stickers of each face. A sticker is either "up", "down", "left", "right", "front" or "back".

To listen for the state event, add an event listener to the rubiks-cube element.

```js
const cube = document.querySelector("rubiks-cube");
cube.addEventListener("state", (e) => {
  console.log(e.detail.state);
});
/*
{
    up: [
        [sticker, sticker, sticker],
        [sticker, sticker, sticker],
        [sticker, sticker, sticker],
    ],
    down: [
        [sticker, sticker, sticker],
        [sticker, sticker, sticker],
        [sticker, sticker, sticker],
    ],
    left: [
        [sticker, sticker, sticker],
        [sticker, sticker, sticker],
        [sticker, sticker, sticker],
    ],
    right: [
        [sticker, sticker, sticker],
        [sticker, sticker, sticker],
        [sticker, sticker, sticker],
    ],
    front: [
        [sticker, sticker, sticker],
        [sticker, sticker, sticker],
        [sticker, sticker, sticker],
    ],
    back: [
        [sticker, sticker, sticker],
        [sticker, sticker, sticker],
        [sticker, sticker, sticker],
    ],
}
*/
```

## Updating the component

The Rubiks cube web component listens for custom events to perform twists, rotations and camera changes. As per convention, the starting rotation has green facing forward, white facing up and red facing to the right.

### Reset event

The rubiks-cube element listens for the `reset` custom event and resets the cube to its initial state.

#### Example

```js
const cube = document.querySelector("rubiks-cube");
cube.dispatchEvent(new CustomEvent("reset"));
```

### Camera events

The rubiks-cube element listens for the `camera` custom event and moves the camera to the specified position.

The camera position specified in the event details must be one of the following:

- `peek-right` - Camera is moved to the right of the cube so that the right face is visible
- `peek-left` - Camera is moved to the left of the cube so that the left face is visible
- `peek-top` - Camera is moved above the cube so that the top face is visible
- `peek-bottom` - Camera is moved below the cube so that the bottom face is visible
- `peek-toggle-horizontal` - Camera is moved to the opposite side of the cube in the horizontal plane
- `peek-toggle-vertical` - Camera is moved to the opposite side of the cube in the vertical plane

Note: The camera position cannot change to perform an equivalent cube rotation.

#### Example

```js
const cube = document.querySelector("rubiks-cube");
cube.dispatchEvent(
  new CustomEvent("camera", {
    detail: { action: "peek-right" },
  })
);
```

### Rotation event

The rubiks-cube element listens for the `rotate` custom event and rotates a face or entire cube in the direction specified by the event details.

The rotation type specified in the event details must follow standard rubiks cube notation.

#### Rubiks Cube Notation

Notations can include the number of roations of a face. For example, `U2` means rotate the upper face 180 degrees.

Noations can also include a prime symbol `'` to indicate a counter clockwise rotation. For example, `U'` means rotate the upper face counter clockwise. The direction is always determined relative to the face being moved.

When both a number and a prime symbol are included the number is stated before the prime symbol. For example, `U2'` means rotate the upper face 180 degrees counter clockwise. and `U'2` is invalid.

| Notation | Movement                                         |
| -------- | ------------------------------------------------ |
| U        | Top face clockwise                               |
| u        | Top two layers clockwise                         |
| D        | Bottom face clockwise                            |
| d        | Bottom two layers clockwise                      |
| L        | Left face clockwise                              |
| l        | Left two layers clockwise                        |
| R        | Right face clockwise                             |
| r        | Right two layers clockwise                       |
| F        | Front face clockwise                             |
| f        | Front two layers clockwise                       |
| B        | Back face clockwise                              |
| b        | Back two layers clockwise                        |
| M        | Middle layer clockwise (relative to L)           |
| E        | Equatorial layer clockwise (relative to D)       |
| S        | Standing layer clockwise (relative to F)         |
| x        | Rotate cube on x axis clockwise (direction of R) |
| y        | Rotate cube on y axis clockwise (direction of U) |
| z        | Rotate cube on z axis clockwise (direction of F) |

#### Example

```js
const cube = document.querySelector("rubiks-cube");
cube.dispatchEvent(
  new CustomEvent("rotate", {
    detail: { action: "u2'" },
  })
);
```
