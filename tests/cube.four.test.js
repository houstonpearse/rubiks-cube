// @ts-check
import './setup.js';
import { describe, it, expect, test } from 'bun:test';
import { CubeTypes, Movements, Rotations } from '../src/core.js';
import { toKociemba } from '../src/cube/stickerState.js';
import { createTestCube, drainUpdates } from './common.js';

describe('4x4 Tests', () => {
    it('Valid initial Kociemba state string', () => {
        //Arange
        const cube = createTestCube(CubeTypes.Four);

        //Act
        const state = toKociemba(cube._cubeInfo.initialStickerState);

        //Assert
        expect(state.length).toBe(96);
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
        expect(Object.values(counts).every((c) => c === 16)).toBe(true);
    });

    it('reset method returns the cube to the initial state', () => {
        // Arrange
        const cube = createTestCube(CubeTypes.Four);
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
        const cube = createTestCube(CubeTypes.Four);
        const scramble =
            "D2 F D2 F U2 L2 F R2 F2 D2 L2 R B L' B' L' D' F U Uw2 Rw2 L' Fw2 L' F' L' B' Uw2 B Rw2 F' L Uw' B' U Rw2 D U2 Fw' Rw' B' F2 Uw' B2 L'";
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
            "z r U' r' F U r' y u' u' U2 l' U2 l z' x' r2' F U2 x' U' U' r2' 3r2 B U' r' F' 3r 3r' U' U' r2 U' r2' 3r2 U' 3r' r U2 r' U' U' r2 U' U' r2' 3r2 U r' U' 3r' r2 U2' r' x' y' x' u' U' R' U' R u D' F D u' R' U' R 3d U' U L' U L d U' R U' R' u' U R U' R' u U' R U' R' u' U' y' R' U' R u U' R U R' L U L' 3d R U' R' U' R U' R' U R U' R' y R U' R' U R U' R' 3d' U' F' U F U' L' U2 R U R' U2 L R' U R' U' R3 U' R' U R U R2' z2";
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
