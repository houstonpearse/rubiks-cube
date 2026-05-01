// @ts-check
import './setup.js';
import { expect, test } from 'bun:test';
import { CubeTypes } from '../src/core.js';
import { toKociemba } from '../src/state/stickerState.js';
import { createTestCube, drainUpdates } from './common.js';
import { scrambles } from './testScrambles.js';
import { CubeState } from '../src/state/state.js';

test.each(scrambles)('$cubeType solve with scramble = $scramble', ({ cubeType, scramble, solution }) => {
    // Arrange
    const cube = createTestCube(cubeType);
    const scrambleMoves = /** @type {import('../src/core.js').Movement[]} */ (scramble.split(' '));

    let finalState = null;
    for (const move of scrambleMoves) {
        cube.movement(
            move,
            (state) => {
                finalState = state;
                return true;
            },
            () => {
                throw new Error('Movement failed unexpectedly');
            },
        );
        drainUpdates(cube);
    }
    expect(/** @type {string?} **/ (finalState)).not.toBe(toKociemba(cube._initialStickerState));

    // Act
    const solutionActions = /** @type {(import('../src/core.js').Movement | import('../src/core.js').Rotation)[]} */ (solution.split(' '));
    for (const action of solutionActions) {
        if (action.includes('x') || action.includes('y') || action.includes('z')) {
            cube.rotate(
                /** @type {import('../src/core.js').Rotation} */ (action),
                (state) => {
                    finalState = state;
                    return true;
                },
                () => {
                    throw new Error('Rotation failed unexpectedly');
                },
            );
        } else {
            cube.movement(
                /** @type {import('../src/core.js').Movement} */ (action),
                (state) => {
                    finalState = state;
                    return true;
                },
                () => {
                    throw new Error('Movement failed unexpectedly');
                },
            );
        }
        drainUpdates(cube);
    }

    // Assert
    expect(/** @type {string?} **/ (finalState)).toBe(toKociemba(cube._initialStickerState));
});

test.each(scrambles)('$cubeType reset scramble = $scramble', ({ cubeType, scramble, solution }) => {
    // Arrange
    const cube = createTestCube(cubeType);
    const scrambleMoves = /** @type {import('../src/core.js').Movement[]} */ (scramble.split(' '));
    const cubeState = new CubeState(cubeType);
    for (const move of scrambleMoves) {
        cubeState.move(move);
    }
    let stateString = toKociemba(/** @type {import('../src/state/stickerState.js').StickerState} **/ (cubeState.stickerState));

    // Act
    let finalState = null;
    cube.setState(
        stateString,
        (state) => {
            finalState = state;
        },
        () => {},
    );

    // Assert
    expect(stateString).not.toBe(toKociemba(cube._initialStickerState));
    expect(/** @type {string?} **/ (finalState)).toBe(stateString);
});

test.each(scrambles)('$cubeType reverse scramble = $scramble', ({ cubeType, scramble, solution }) => {
    // Arrange
    const cube = createTestCube(cubeType);
    const scrambleMoves = /** @type {import('../src/core.js').Movement[]} */ (scramble.split(' '));

    let finalState = null;
    for (const move of scrambleMoves) {
        cube.movement(
            move,
            (state) => {
                finalState = state;
                return true;
            },
            () => {
                throw new Error('Movement failed unexpectedly');
            },
        );
        drainUpdates(cube);
    }

    expect(/** @type {string?} **/ (finalState)).not.toBe(toKociemba(cube._initialStickerState));

    // Act
    for (const move of scrambleMoves.reverse()) {
        cube.movement(
            move,
            (state) => {
                finalState = state;
                return true;
            },
            () => {
                throw new Error('Movement failed unexpectedly');
            },
            { reverse: true },
        );
        drainUpdates(cube);
        drainUpdates(cube);
    }

    // Assert
    expect(/** @type {string?} **/ (finalState)).toBe(toKociemba(cube._initialStickerState));
});

const bigCubes = [CubeTypes.Four, CubeTypes.Five, CubeTypes.Six, CubeTypes.Seven];
const threeSolves = scrambles.filter((x) => x.cubeType === CubeTypes.Three);
const solves = bigCubes.flatMap((cubeType) =>
    threeSolves.map((solve) => {
        return { ...solve, bigCubeType: cubeType };
    }),
);
test.each(solves)('3x3 solve on $bigCubeType with scramble = $scramble', ({ bigCubeType, cubeType, scramble, solution }) => {
    // Arrange
    const cube = createTestCube(bigCubeType);
    const scrambleMoves = /** @type {import('../src/core.js').Movement[]} */ (scramble.split(' '));

    let finalState = null;
    for (const move of scrambleMoves) {
        cube.movement(
            move,
            (state) => {
                finalState = state;
                return true;
            },
            () => {
                throw new Error('Movement failed unexpectedly');
            },
        );
        drainUpdates(cube);
    }
    expect(/** @type {string?} **/ (finalState)).not.toBe(toKociemba(cube._initialStickerState));

    // Act
    const solutionActions = /** @type {(import('../src/core.js').Movement | import('../src/core.js').Rotation)[]} */ (solution.split(' '));
    for (const action of solutionActions) {
        if (action.includes('x') || action.includes('y') || action.includes('z')) {
            cube.rotate(
                /** @type {import('../src/core.js').Rotation} */ (action),
                (state) => {
                    finalState = state;
                    return true;
                },
                () => {
                    throw new Error('Rotation failed unexpectedly');
                },
            );
        } else {
            cube.movement(
                /** @type {import('../src/core.js').Movement} */ (action),
                (state) => {
                    finalState = state;
                    return true;
                },
                () => {
                    throw new Error('Movement failed unexpectedly');
                },
                { translate: true },
            );
        }
        drainUpdates(cube);
    }

    // Assert
    expect(/** @type {string?} **/ (finalState)).toBe(toKociemba(cube._initialStickerState));
});
