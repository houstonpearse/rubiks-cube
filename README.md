# Rubiks Cube Web Component

A Rubik's Cube web component built with Three.js, WebGPU, and GSAP. The cube renders into a shadow‑DOM canvas and exposes a small, promise‑based API for cube moves, rotations, reset, state setting, and camera "peek" positions. Supports 2x2, 3x3, 4x4, 5x5, 6x6, and 7x7 Rubik's cubes.

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
        <!-- Create a 3x3 cube with custom settings -->
        <rubiks-cube cube-type="Three" animation-speed-ms="1000" animation-style="exponential" piece-gap="1.04" camera-speed-ms="100"></rubiks-cube>

        <!-- Or create a 2x2 cube -->
        <rubiks-cube cube-type="Two"></rubiks-cube>

        <!-- Or create a 7x7 cube -->
        <rubiks-cube cube-type="Seven"></rubiks-cube>

        <script type="module" src="index.js"></script>
    </body>
</html>
```

## Component attributes

These attributes control animation, spacing, camera behavior, and cube type. The available attributes
can be imported so that they can be get and set easily.

```js
import { RubiksCubeElement, AttributeNames } from '@houstonp/rubiks-cube';
import { CubeTypes, AnimationStyles } from '@houstonp/rubiks-cube/core';

const cube = document.querySelector('rubiks-cube');

// Get an attribute value
const animationSpeed = cube.getAttribute(AttributeNames.animationSpeed);
console.log('Current animation speed:', animationSpeed);

// Set an attribute value
cube.setAttribute(AttributeNames.animationSpeed, '500');
cube.setAttribute(AttributeNames.cubeType, CubeTypes.Four); // Change to 4x4 cube
cube.setAttribute(AttributeNames.animationStyle, AnimationStyles.Exponential);
cube.setAttribute(AttributeNames.pieceGap, '1.05');
cube.setAttribute(AttributeNames.cameraRadius, '6');
cube.setAttribute(AttributeNames.cameraFieldOfView, '80');
cube.setAttribute(AttributeNames.cameraPeekAngleHorizontal, '0.7');
cube.setAttribute(AttributeNames.cameraPeekAngleVertical, '0.7');
```

| attribute                    | accepted values                                            | Description                                                                                                                                                              |
| ---------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| cube-type                    | `"Two"`, `"Three"`, `"Four"`, `"Five"`, `"Six"`, `"Seven"` | Sets the cube size (2x2 through 7x7). Default is `"Three"`                                                                                                               |
| animation-speed-ms           | integer greater than or equal to 0                         | Sets the duration of cube animations in milliseconds                                                                                                                     |
| animation-style              | `"exponential"`, `"next"`, `"fixed"`, `"match"`            | `fixed`: fixed animation lengths, `next`: skips to next animation, `exponential`: speeds up successive animations, `match`: matches the speed to the frequency of events |
| piece-gap                    | greater than 1                                             | Sets the gap between Rubik's Cube pieces                                                                                                                                 |
| camera-speed-ms              | greater than or equal to 0                                 | Sets the duration of camera animations in milliseconds                                                                                                                   |
| camera-radius                | greater than or equal to 4                                 | Sets the camera radius                                                                                                                                                   |
| camera-peek-angle-horizontal | decimal between 0 and 1                                    | Sets the horizontal peek angle                                                                                                                                           |
| camera-peek-angle-vertical   | decimal between 0 and 1                                    | Sets the vertical peek angle                                                                                                                                             |
| camera-field-of-view         | integer between 40 and 100                                 | Sets the field of view of the camera                                                                                                                                     |

## Programmatic control

The `RubiksCubeElement` instance exposes async methods that return the cube state after the operation completes:

### Move

Performs a cube movement and resolves with the new state string.

```js
import { RubiksCubeElement } from '@houstonp/rubiks-cube';
import { Movements } from '@houstonp/rubiks-cube/core';

const cube = document.querySelector('rubiks-cube');

// Single layer moves
await cube.move(Movements.Single.R); // Right face clockwise
await cube.move(Movements.Single.R2); // Right face 180 degrees
await cube.move(Movements.Single.RP); // Right face counter-clockwise
await cube.move(Movements.Single.U); // Upper face clockwise
await cube.move(Movements.Single.FP); // Front face counter-clockwise

// Wide moves
await cube.move(Movements.Wide.Rw); // Wide right move
await cube.move(Movements.Wide.r); // Right two layers

// Layer-specific moves (for 4x4+ cubes)
await cube.move(Movements.Two.R); // Second layer right
await cube.move(Movements.Three.R); // Third layer right (for 4x4+)
await cube.move(Movements.Four.R); // Fourth layer right (for 5x5+)

// Middle layer moves
await cube.move(Movements.Single.M); // Middle layer
await cube.move(Movements.Single.E); // Equatorial layer
await cube.move(Movements.Single.S); // Standing layer

// Chain multiple moves
const moves = [Movements.Single.R, Movements.Single.U, Movements.Single.RP, Movements.Single.UP];
for (const move of moves) {
    const state = await cube.move(move);
    console.log('State after', move, ':', state);
}
```

### Rotate

Rotates the entire cube and resolves with the new state string.

```js
import { RubiksCubeElement } from '@houstonp/rubiks-cube';
import { Rotations } from '@houstonp/rubiks-cube/core';

const cube = document.querySelector('rubiks-cube');

// Rotate cube on x-axis (like R move)
await cube.rotate(Rotations.x); // 90 degrees clockwise
await cube.rotate(Rotations.x2); // 180 degrees
await cube.rotate(Rotations.xP); // 90 degrees counter-clockwise

// Rotate cube on y-axis (like U move)
await cube.rotate(Rotations.y); // 90 degrees clockwise
await cube.rotate(Rotations.y2); // 180 degrees
await cube.rotate(Rotations.yP); // 90 degrees counter-clockwise

// Rotate cube on z-axis (like F move)
await cube.rotate(Rotations.z); // 90 degrees clockwise
await cube.rotate(Rotations.z2); // 180 degrees
await cube.rotate(Rotations.zP); // 90 degrees counter-clockwise
```

### Reset

Resets the cube to the solved state and resolves with the new state string.

```js
import { RubiksCubeElement } from '@houstonp/rubiks-cube';
import { Movements } from '@houstonp/rubiks-cube/core';

const cube = document.querySelector('rubiks-cube');

// Reset to solved state
const solvedState = await cube.reset();
console.log('Cube reset to solved state:', solvedState);

// Reset after performing some moves
await cube.move(Movements.Single.R);
await cube.move(Movements.Single.U);
const resetState = await cube.reset();
```

### SetState

Sets the cube to a specific state using a Kociemba-format state string. This allows you to restore a previously saved state or set up specific cube configurations.

```js
import { RubiksCubeElement } from '@houstonp/rubiks-cube';
import { Movements } from '@houstonp/rubiks-cube/core';

const cube = document.querySelector('rubiks-cube');

// Save current state
const currentState = await cube.move(Movements.Single.R);

// Later, restore that state
try {
    const restoredState = await cube.setState(currentState);
    console.log('State restored:', restoredState);
} catch (error) {
    console.error('Failed to set state:', error);
    // Error occurs if the state string is invalid for the current cube type
}

// Set a specific scrambled state (example for 3x3)
const scrambledState = 'UULUUFUUFRRUBRRURRFFDFFUFFFDDRDDDDDDBLLLLLLLLBRRBBBBBB';
await cube.setState(scrambledState);
```

### Peek

Animates the camera to a new "peek" position and resolves with the new peek state.

```js
import { RubiksCubeElement } from '@houstonp/rubiks-cube';
import { PeekTypes, PeekStates } from '@houstonp/rubiks-cube/core';

const cube = document.querySelector('rubiks-cube');

// Peek in different directions
await cube.peek(PeekTypes.Right); // Peek right
await cube.peek(PeekTypes.Left); // Peek left
await cube.peek(PeekTypes.Up); // Peek up
await cube.peek(PeekTypes.Down); // Peek down
await cube.peek(PeekTypes.RightUp); // Peek right and up
await cube.peek(PeekTypes.RightDown); // Peek right and down
await cube.peek(PeekTypes.LeftUp); // Peek left and up
await cube.peek(PeekTypes.LeftDown); // Peek left and down
await cube.peek(PeekTypes.Horizontal); // Reset horizontal peek
await cube.peek(PeekTypes.Vertical); // Reset vertical peek

// The peek method returns the current peek state
const peekState = await cube.peek(PeekTypes.RightUp);
console.log('Current peek state:', peekState); // e.g., 'rightUp'
```

### Complete Example

```js
import { RubiksCubeElement, AttributeNames } from '@houstonp/rubiks-cube';
import { Movements, Rotations, PeekTypes, CubeTypes, AnimationStyles } from '@houstonp/rubiks-cube/core';

const cube = document.querySelector('rubiks-cube');

// Configure cube settings
cube.setAttribute(AttributeNames.cubeType, CubeTypes.Four); // Use 4x4 cube
cube.setAttribute(AttributeNames.animationSpeed, '800');
cube.setAttribute(AttributeNames.animationStyle, AnimationStyles.Exponential);

// Perform a sequence of moves
await cube.move(Movements.Single.R);
await cube.move(Movements.Single.U);
await cube.rotate(Rotations.y);
await cube.move(Movements.Wide.Rw);

// Peek to see a different angle
await cube.peek(PeekTypes.RightUp);

// Save the current state
const currentState = await cube.move(Movements.Single.F);

// Reset and restore
await cube.reset();
await cube.setState(currentState);
```

All methods return promises that resolve with the new state string (or peek state for `peek`). They reject if the operation fails or times out.

## Rubiks Cube Notation

Notations can include the number of rotations of a face. For example, `U2` means rotate the upper face 180 degrees.

Notations can also include a prime symbol `'` to indicate a counter‑clockwise rotation. For example, `U'` means rotate the upper face counter‑clockwise. The direction is always determined relative to the face being moved.

Notations can also include a layer identifier for larger cubes. For example `3R2'` means rotate the Third layer from the right face counter-clockwise twice.

When both a number and a prime symbol are included, the number is stated before the prime symbol. For example, `U2'` means rotate the upper face 180 degrees counter‑clockwise, and `U'2` is invalid.

Valid notation constants are available via the `core` export. Use these constants instead of string literals for better type safety and autocomplete support.

Duplicate or equivalent notations are not provided in the `core` export. For example `R3` and `R'` are equivalent and only `R'` is provided in the export.

```js
import { RubiksCubeElement } from '@houstonp/rubiks-cube';
import { Rotations, Movements, PeekTypes, PeekStates, CubeTypes, AnimationStyles } from '@houstonp/rubiks-cube/core';

const cube = document.querySelector('rubiks-cube');

// Use constants for moves
cube.move(Movements.Single.R);
cube.move(Movements.Single.U2);
cube.move(Movements.Single.FP);

// Use constants for rotations
cube.rotate(Rotations.x);
cube.rotate(Rotations.y2);
cube.rotate(Rotations.zP);

// Use constants for peek types
cube.peek(PeekTypes.Right);
cube.peek(PeekTypes.RightUp);

// Use constants for cube types
cube.setAttribute(AttributeNames.CubeType, CubeTypes.Four);

// Use constants for animation styles
cube.setAttribute(AttributeNames.AnimationStyle, AnimationStyles.Exponential);
```

Notation must match the following Regex

`/([1234567]|[123456]-[1234567])?([RLUDFB]w|[RLUDFBMES]|[rludfbmes])([123])?(\')?$/`
some notation may not work as intended as there is no known interpretation. eg `2M`

Standard Notation

| Notation | Movement                                   |
| -------- | ------------------------------------------ |
| U        | Top face clockwise                         |
| u        | Top two layers clockwise                   |
| D        | Bottom face clockwise                      |
| d        | Bottom two layers clockwise                |
| L        | Left face clockwise                        |
| l        | Left two layers clockwise                  |
| R        | Right face clockwise                       |
| r        | Right two layers clockwise                 |
| F        | Front face clockwise                       |
| f        | Front two layers clockwise                 |
| B        | Back face clockwise                        |
| b        | Back two layers clockwise                  |
| M        | Middle layer clockwise (relative to L)     |
| E        | Equatorial layer clockwise (relative to D) |
| S        | Standing layer clockwise (relative to F)   |

Big Cube Notation. Not all listed for brevity.

| Notation | Movement                                        |
| -------- | ----------------------------------------------- |
| NR       | Nth Right most layer                            |
| NRw      | All Right layers up to the Nth Right most layer |
| Nr       | All Right layers up to the Nth Right most layer |

Rotation Notation

| Notation | Rotation                                         |
| -------- | ------------------------------------------------ |
| x        | Rotate cube on x axis clockwise (direction of R) |
| y        | Rotate cube on y axis clockwise (direction of U) |
| z        | Rotate cube on z axis clockwise (direction of F) |

These symbols align with the movements and rotations accepted by the component's API.

## Development

This repository is set up as an npm package and uses **Bun** for scripts and type generation.

- **Install dependencies**

    ```bash
    bun install
    ```

- **Run Tests**

    ```bash
    bun run test
    ```

- **Generate TypeScript declaration files**

    ```bash
    bun run build:types
    ```

The generated `.d.ts` files are emitted into the `types/` directory (ignored in git) and are used for consumers of the package. There is currently no dedicated demo app or automated test suite in this repository; you can import the component into your own app (e.g., Vite, Next.js, or any ES‑module‑aware bundler) to experiment locally.
