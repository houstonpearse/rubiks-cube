# Rubiks Cube Web Component

A Rubik’s Cube web component built with Three.js, WebGPU, and GSAP. The cube renders into a shadow‑DOM canvas and exposes a small, promise‑based API for cube moves, rotations, reset, and camera “peek” positions.

![cube](cube.png)

## Installation

This package is published as `@houstonp/rubiks-cube`.

```bash
bun add @houstonp/rubiks-cube
# or
npm install @houstonp/rubiks-cube
```

## Adding the component

Register the custom element and then use the tag in your HTML.

```js
// index.js
import { RubiksCubeElement } from '@houstonp/rubiks-cube';

// Registers <rubiks-cube> (you can pass a different tag name if you prefer)
RubiksCubeElement.register();
```

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8" />
        <title>Rubiks Cube Demo</title>
    </head>
    <body>
        <rubiks-cube animation-speed-ms="1000" animation-style="exponential" piece-gap="1.04" camera-speed-ms="100"></rubiks-cube>

        <script type="module" src="index.js"></script>
    </body>
</html>
```

## Component attributes

These attributes control animation, spacing, and camera behavior. The available attributes
can be imported so that they can be get and set easily.

```js
import { Attributes } from '@houstonp/rubiks-cube/schema';

const cube = document.querySelector('rubiks-cube');
const animationSpeed = cube.getAttribute(AttributeNames.animationSpeed);
cube.getAttribute(AttributeNames.animationSpeed, animationSpeed + 1);
```

| attribute                    | accepted values                                 | Description                                                                                                                                                              |
| ---------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| animation-speed-ms           | integer greater than or equal to 0              | Sets the duration of cube animations in milliseconds                                                                                                                     |
| animation-style              | `"exponential"`, `"next"`, `"fixed"`, `"match"` | `fixed`: fixed animation lengths, `next`: skips to next animation, `exponential`: speeds up successive animations, `match`: matches the speed to the frequency of events |
| piece-gap                    | greater than 1                                  | Sets the gap between Rubik’s Cube pieces                                                                                                                                 |
| camera-speed-ms              | greater than or equal to 0                      | Sets the duration of camera animations in milliseconds                                                                                                                   |
| camera-radius                | greater than or equal to 4                      | Sets the camera radius                                                                                                                                                   |
| camera-peek-angle-horizontal | decimal between 0 and 1                         | Sets the horizontal peek angle                                                                                                                                           |
| camera-peek-angle-vertical   | decimal between 0 and 1                         | Sets the vertical peek angle                                                                                                                                             |
| camera-field-of-view         | integer between 40 and 100                      | Sets the field of view of the camera                                                                                                                                     |

## Programmatic control

The `RubiksCubeElement` instance exposes async methods that return the cube state after the operation completes:

```js
import { RubiksCubeElement } from '@houstonp/rubiks-cube';
const cube = document.querySelector('rubiks-cube');

// Reset the cube; resolves with the new state string
const stateAfterReset = await cube.reset();

// Perform a move (see “Rubiks Cube Notation” below for allowed moves)
// The concrete Movement/Rotation types are exported from the package types.
cube.move(move).then((state) => {
    console.log('state after move:', state);
});
```

Available methods:

- `cube.move(move)` – performs a cube movement and resolves with the new state string.
- `cube.rotate(rotation)` – rotates the entire cube and resolves with the new state string.
- `cube.reset()` – resets the cube to the solved state and resolves with the new state string.
- `cube.peek(peekType)` – animates the camera to a new “peek” position and resolves with the new peek state.

All methods time out and reject if the underlying animation does not complete within an expected window.

## Camera Actions

The camera position can be changed with the peek method available on the component.

```js
import { RubiksCubeElement } from '@houstonp/rubiks-cube';
import { Rotations, Movements, PeekTypes, PeekState } from '@houstonp/rubiks-cube/core';

const cube = document.querySelector('rubiks-cube');
cube.peek(PeekTypes.right);
cube.peek(PeekState.rightUp);
```

## Rubiks Cube Notation

Notations can include the number of rotations of a face. For example, `U2` means rotate the upper face 180 degrees.

Notations can also include a prime symbol `'` to indicate a counter‑clockwise rotation. For example, `U'` means rotate the upper face counter‑clockwise. The direction is always determined relative to the face being moved.

When both a number and a prime symbol are included, the number is stated before the prime symbol. For example, `U2'` means rotate the upper face 180 degrees counter‑clockwise, and `U'2` is invalid.

Valid Notation is available via an export called core.

```js
import { RubiksCubeElement } from '@houstonp/rubiks-cube';
import { Rotations, Movements, PeekTypes, PeekState } from '@houstonp/rubiks-cube/core';

const cube = document.querySelector('rubiks-cube');
cube.move(Movements.R);
cube.rotation(Rotations.x2);
```

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

These symbols align with the movements and rotations accepted by the component’s API.

## Development

This repository is set up as an npm package and uses **Bun** for scripts and type generation.

- **Install dependencies**

    ```bash
    bun install
    ```

- **Generate TypeScript declaration files**

    ```bash
    bun run build:types
    ```

The generated `.d.ts` files are emitted into the `types/` directory (ignored in git) and are used for consumers of the package. There is currently no dedicated demo app or automated test suite in this repository; you can import the component into your own app (e.g., Vite, Next.js, or any ES‑module‑aware bundler) to experiment locally.
