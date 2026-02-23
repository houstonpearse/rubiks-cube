// @ts-check
import './setup.js';
import { describe, it, expect, test } from 'bun:test';
import { CubeTypes, Movements, Rotations } from '../src/core.js';
import { toKociemba } from '../src/cube/stickerState.js';
import { createTestCube, drainUpdates } from './common.js';

describe('5x5 Tests', () => {
    it('Valid initial Kociemba state string', () => {
        //Arange
        const cube = createTestCube(CubeTypes.Five);

        //Act
        const state = toKociemba(cube._cubeInfo.initialStickerState);

        //Assert
        expect(state.length).toBe(150);
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
        expect(Object.values(counts).every((c) => c === 25)).toBe(true);
    });

    it('reset method returns the cube to the initial state', () => {
        // Arrange
        const cube = createTestCube(CubeTypes.Five);
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
        const cube = createTestCube(CubeTypes.Five);
        const scramble =
            "Dw Uw' U' Fw' L Fw R' U2 Rw Dw Fw' L' Lw D Dw U2 Bw' U' D Lw R B Lw2 U D' Uw R' L F B2 Lw2 R2 Dw U2 Rw' Lw' R D2 Fw Uw L' Bw B2 D2 Fw' Rw D U2 Lw' Fw2 Lw' Uw2 B2 Rw' F2 Rw2 L' D F' Rw";
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
            "z' y r U b 3r' z' U r2 U' r' U' r z x' 3r U' 3r' z' x' D r' F' r U' U' r' z r U' r' z' y' r U2' r' z x' F' U' r x' l R u' R2' u D' R U r' U' D' x' U' R' U' r2 3r2' 4r U x' L r' U2' r2 3r2' L' D' x L2 U 4r U' r' r' U' r U' U' 4r' U' 3r2 U2' 3r2' 4r2 U r 4r 4r' U' r U U r' 4r r' 4r U' 4r2' r2 U' r' 4r U' r' 4r U2 r U' r2' U2' r2 4r' U' r' 3r U 3r' r2 U r' z' U L 3d' U F R' F' R 3u' D' R U R U' R2' F R' F' R u y R U' R' u' d U' R U' R' u2' R' U R2 U' R' u 3u' U' U' U R U' R' y' R U R' F R' F' R d R U' R' 3u' R' F R F' R U' R' d R U R' u2' R' U' R2 U' R' y' 4d R U' R' u' 3u R U' R' u d' R U R' 3u' U F R' F' R U' d U' R' U R U' R' U' R U' L' U L y' R' U2' R U' U 4d D' L' U L D U R U' R' U R U' R' 4d' U' F' R U R' U' R' F R2 U R' U R U2' R' L' U' L F L' U' L U L F' L2' U L U x2 y'";
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
