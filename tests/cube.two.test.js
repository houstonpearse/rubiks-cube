// @ts-check
import './setup.js';
import { describe, it, expect, test } from 'bun:test';
import { CubeTypes, Movements, Rotations } from '../src/core.js';
import { toKociemba } from '../src/cube/stickerState.js';
import { createTestCube, drainUpdates } from './common.js';

describe('2x2 Tests', () => {
    it('Valid initial Kociemba state string', () => {
        //Arange
        const cube = createTestCube(CubeTypes.Two);

        //Act
        const state = toKociemba(cube._cubeInfo.initialStickerState);

        //Assert
        expect(state.length).toBe(24);
        for (const ch of state) {
            expect('UDLRFB').toContain(ch);
        }

        const counts = {
            U: 0,
            D: 0,
            L: 0,
            R: 0,
            F: 0,
            B: 0,
        };
        for (const ch of state) {
            const face = /** @type {"R" | "U" | "F" | "L" | "D" | "B"} */ (ch);
            counts[face]++;
        }
        expect(Object.values(counts).every((c) => c === 4)).toBe(true);
    });

    it('reset method returns the cube to the initial state', () => {
        // Arrange
        const cube = createTestCube(CubeTypes.Two);
        const initialState = toKociemba(cube._cubeInfo.initialStickerState);
        /** @type {string?} */
        let completedState = null;
        /** @type {string?} */
        let failedReason = null;
        cube.movement(
            Movements.Single.R,
            (state) => {
                completedState = state;
                return true;
            },
            (reason) => {
                failedReason = reason;
                return true;
            },
        );
        drainUpdates(cube);

        // Act
        /** @type {string?} */
        let resetState = null;
        cube.reset((state) => {
            resetState = state;
            return true;
        });
        drainUpdates(cube);

        // Assert
        expect(failedReason).toBeNull();
        expect(completedState).not.toBeNull();
        expect(completedState).not.toBe(initialState);
        expect(/** @type {string?} **/ (resetState)).toBe(initialState);
    });

    it('solve', () => {
        // Arrange
        const cube = createTestCube(CubeTypes.Two);
        const scramble = "D U R2 B2 D' B2 D R2 F2 L2 R B U2 R2 U' B' L D' R U' R";
        const scrambleMoves = /** @type {import('../src/core.js').Movement[]} */ (scramble.split(' '));

        for (const move of scrambleMoves) {
            cube.movement(
                move,
                () => {},
                () => {
                    throw new Error('Movement failed unexpectedly');
                },
            );
            drainUpdates(cube);
        }

        // Act
        const solution =
            "D L R' F R D2 R U' R' F U R U2' R' U R U' R' U' L U L' D U L' U' L U2 L' U L L F' L' F U R' U2 R U2' R' U R U2' R' U R U2' R' U' R U y'";
        const solutionActions = /** @type {(import('../src/core.js').Movement | import('../src/core.js').Rotation)[]} */ (solution.split(' '));

        let finalState = null;
        for (const action of solutionActions) {
            if (action.includes('x') || action.includes('y') || action.includes('z')) {
                cube.rotate(
                    /** @type {import('../src/core.js').Rotation} */ (action),
                    (state) => {
                        finalState = state;
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
                    },
                    () => {
                        throw new Error('Movement failed unexpectedly');
                    },
                );
            }
            drainUpdates(cube);
        }

        // Assert
        expect(/** @type {string?} **/ (finalState)).toBe(toKociemba(cube._cubeInfo.initialStickerState));
    });
});
