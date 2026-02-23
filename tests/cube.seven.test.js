// @ts-check
import './setup.js';
import { describe, it, expect, test } from 'bun:test';
import { CubeTypes, Movements, Rotations } from '../src/core.js';
import { toKociemba } from '../src/cube/stickerState.js';
import { createTestCube, drainUpdates } from './common.js';

describe('7x7 Tests', () => {
    it('Valid initial Kociemba state string', () => {
        //Arange
        const cube = createTestCube(CubeTypes.Seven);

        //Act
        const state = toKociemba(cube._cubeInfo.initialStickerState);

        //Assert
        expect(state.length).toBe(294);
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
        expect(Object.values(counts).every((c) => c === 49)).toBe(true);
    });

    it('reset method returns the cube to the initial state', () => {
        // Arrange
        const cube = createTestCube(CubeTypes.Seven);
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
        const cube = createTestCube(CubeTypes.Seven);
        const scramble =
            "B' Rw' Lw2 3Rw2 Fw' 3Rw' 3Uw2 Lw2 3Lw' 3Rw B Rw2 U 3Bw' 3Fw2 U' Bw F' Uw R' Lw 3Fw' Fw2 R' 3Rw' 3Uw 3Rw' Fw' 3Lw' R2 B Uw' Rw2 Bw Uw' F2 R B Fw' Rw' Bw 3Bw 3Uw2 3Dw' L2 D2 R 3Rw 3Uw2 3Lw' 3Fw Fw2 B' Rw' 3Rw Lw R U' Rw' 3Bw' 3Rw2 3Bw2 Fw U2 Uw B2 Dw' Lw' Dw2 Rw2 Lw2 Dw Rw' D L' 3Bw 3Fw2 D 3Fw2 3Bw' Rw 3Fw2 Uw2 3Fw2 3Rw L' D 3Bw' 3Fw2 3Lw Rw 3Bw D2 3Uw U 3Dw2 3Rw Rw 3Lw2 3Uw'";
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
            "x' y 4r 3r' U' 4r' 3r 5r U 5r' U' 5r U F r U r' z' F' 4r U' 4r' 3r r' U' r U' r' U' x' 4r' x' U' r2' 5r2 U x' l2' z U' 3r 4r' z' r' z x' 4r U 4r' 3r U x2' 3r' x' D r2 y' U' x' D' U' r' F r2 3r' r U r' U x 3r' U' 3r U' y x' 3r U 4r' x2 U x' U' 4r' z' U2 4l' U2 4l z U x' U' 3r' z' z U' R R' u' R2 u U' x' x' 4r2 U' U' 4r2' x x U r U' r' U x2 U' x' l' 3l' l U2 3l 4l' l' B' l U x l2 F z' 4l' U2 3r z y' U' x' U 4l x' U' 4r' R' F x' l2' x' D' x' R' L' 3l U 5r2 3r2' x' x' r' L F U 6r2 U' 3l' L x' l2' L U' x' 6r U x' L' U' r' 6r U' 6r' 5r U 4r' U' 3r' U' 4r U' 3r' U 3r U' r' U' 5r' 6r' 6r' 3r r' U' r U' r' U' U2 4r x L U' U' 3r U' U' r 6r' U' 6r2 4r2' 3r2 U' 4r r' U' r' U' r' 4r 3r' U 6r' 4r U' 4r' U' r U r' U x' L' U' 5r2 U' 5r2' U' r U r' 6r l' x' 4r2 3r2' U' 4r2 3r2' 5r 4r' U' 4r U' 3r U' 3r' r U r2' 3r U' 6r' r 3r' 4r U' 4r' U' 3r U 3r' 5r 4r' U' l' 3l r U' r U' U' r2' U' 6r r' U' r 6r' U 5r U 4r' U 4r 5r' U' 4r U' r' U r U' 4r' 3r U' 3r' U' 3r U 3r' U' 3r U' 3r' U' r U' U' r' U' r U' r' U r U' U' r' U' r U 4r 3r' U' r' U 4r' 3r 6r2' U R U 3r 6r' U' U' R' U R U r' R2' 6r U R U' x2' U' R U 5r' x' 3l2' U F U' F' 6r 4r 5r R' U R U' 5r' R U' R' U D R' D' r' 3r2 x' x' D R' D' 4r r' R R' F R F' x' U' R U r 3r2' 5r2 x' R' D R' D' U R U' 3r 4r2' 5r U' R U x r l2 3l2' R' U R U' x' 4r 3r' R' U R U' 4r' x 3r' r 4r' U' R' U 6l' U R U' 4r 6l' U' R' U 6l U R U' 3r' U' R' U 6l' U R U' 4l 3l 3l' l R' U' R U 4r' U' R' U 6l' U U' U R U' l' 3l x' 3r U' U 3r' r U' R' U 6l' U R U' r' z' y' R' F R 6d R' U L U L' D U2 R U R' D' R U' R' U R U' R' y U2 R U' R' U R' F R F' L' U L L' U L U L' U L U' x R' U R' D D R U' R' D D R2 y2 x'";
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
