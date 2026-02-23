// @ts-check
import './setup.js';
import { describe, it, expect, test } from 'bun:test';
import { CubeTypes, Movements, Rotations } from '../src/core.js';
import { toKociemba } from '../src/cube/stickerState.js';
import { createTestCube, drainUpdates } from './common.js';

describe('6x6 Tests', () => {
    it('Valid initial Kociemba state string', () => {
        //Arange
        const cube = createTestCube(CubeTypes.Six);

        //Act
        const state = toKociemba(cube._cubeInfo.initialStickerState);

        //Assert
        expect(state.length).toBe(216);
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
        expect(Object.values(counts).every((c) => c === 36)).toBe(true);
    });

    it('reset method returns the cube to the initial state', () => {
        // Arrange
        const cube = createTestCube(CubeTypes.Six);
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
        const cube = createTestCube(CubeTypes.Six);
        const scramble =
            "D Fw' R2 F2 Dw' Lw' Rw' F U2 3Uw 3Fw' Bw Rw2 L2 Bw2 B2 Uw 3Rw' Lw Rw2 3Uw2 Dw2 3Fw2 U2 Rw F Bw L 3Rw Dw2 3Fw' Dw2 D Bw' F Fw' D 3Fw' F' R' L B Rw' 3Fw2 U' L2 Lw' D Bw Uw2 3Fw2 Uw2 Bw' Fw U' Fw2 L 3Rw Bw' D' 3Rw' 3Uw2 Lw' U' Dw F R' B Rw U2 B2 Fw' 3Rw R 3Fw2 3Uw2 D' 3Fw' L Dw";
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
            "y' U 3r r F' F D' r r' U' r z y z' y' x U r' U' r U' r' U l y x' D U x' 4r2 L 3u x' U' U' r2 D' 3l2' U2 x' r u x U' 4r' F U x' 4l' U2 r U' 4r' z' F' 3r U2' 3r' x U' r' U' 4l R' 3u' 4u 3l' U2 3l 3u R2 u r U' U' r' z x' x' x' x' 2-3l' U2 r' F x' U 3r2' R2 U' r2' x U R' R' U' l U x x L U 3r2' x2' 5r U' 3r 4r' 5r' D 5r U 3r' U' 3r U 5r 3r' U r U r' U r U' r' U r U 2L' 5r 5r' 3r2 U 3r 5r2 3r' U' 3r 5r2' U' 4r r' U' r2 4r' 5r2 r' U' r' U' U' 5r' r3 U r' 5r U 5r2' 4r U' 4r' 5r 3r U' 3r' U 3r U' 3r2' U' U' 3r 4r' r2 U r' U' r U' r2' U 4r U' r' U 5r' r U' U' r U2' r' U2' r U r' 3r U2' 3r' U' r U' 4r r' U r' U' r 4r' z' U' L' U L R U' R' u F R' F' R u' 4u L' U' L' U L2 y' u L' U L 3u' L' U L u' y L' U L 4d L' U L 3u y' y U' y' 3u 3u 4u' 4u' U' y 5d 5d' U' U U' L' U L u' R' F R F' R U' R' 3u' d U' R U' R' u' U2 R U' R' 3u' u R U' R2' U' R y' L' U L R' F R F' R U' R' 3u' R' F R F' R U' R' 3u R U' R' u L' U L u' 4u' R' F R F' R U' R' U' d R U' R' u' 4u R' F R F' R U' R' 4u' u R U2' R2' U' R y' R' U2' R U R' U2' R U' L' U2 L U2' L' U L U R U' R' 5r U' 5r' U2 5r U 5r' U U U' R2' D' R U' R' D R U R' D' R U R' D R U R U' R' U' R 3r2' F2 U2' 3r2 R2' U2' F2 3r2 x2 y";
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
