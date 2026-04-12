// @ts-check
import './setup.js';
import { expect, test } from 'bun:test';
import { toKociemba } from '../src/state/stickerState.js';
import { scrambles } from './testScrambles.js';
import { CubeState } from '../src/state/state.js';

test.each(scrambles)('CubeState solve on $cubeType with scramble = $scramble', ({ cubeType, scramble, solution }) => {
    // Arrange
    const cube = new CubeState(cubeType);
    const initialState = cube.getState();
    const initialKociembaState = toKociemba(initialState);
    const scrambleMoves = /** @type {import('../src/core.js').Movement[]} */ (scramble.split(' '));

    let stickerState = initialState;
    scrambleMoves.forEach((move) => {
        stickerState = cube.move(move) ?? stickerState;
    });

    expect(toKociemba(stickerState)).not.toBe(initialKociembaState);

    // Act
    const solutionActions = /** @type {(import('../src/core.js').Movement | import('../src/core.js').Rotation)[]} */ (solution.split(' '));

    /** @type {import('../src/state/stickerState.js').StickerState} */
    let finalState = initialState;
    for (const action of solutionActions) {
        if (action.includes('x') || action.includes('y') || action.includes('z')) {
            finalState = cube.rotate(/** @type {import('../src/core.js').Rotation} */ (action)) ?? finalState;
        } else {
            finalState = cube.move(/** @type {import('../src/core.js').Movement} */ (action)) ?? finalState;
        }
    }

    // Assert
    expect(toKociemba(finalState)).toBe(initialKociembaState);
});
