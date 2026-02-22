// @ts-check
import './setup.js';
import { describe, it, expect, test } from 'bun:test';
import RubiksCube3D from '../src/three/cube.js';
import CubeSettings from '../src/cube/cubeSettings.js';
import { CubeTypes, Movements } from '../src/core.js';
import { toKociemba } from '../src/cube/stickerState.js';

function createTestCube() {
    // Use a fixed animation style and zero duration so rotations complete deterministically in tests.
    const settings = new CubeSettings(1.04, 0, 'fixed', CubeTypes.Three);
    return new RubiksCube3D(settings);
}

/**
 *
 * @param {RubiksCube3D} cube
 * @param {number} maxIterations
 */
function drainUpdates(cube, maxIterations = 20) {
    // Step the cube until the current rotation and queue are empty, or until we hit a safety cap.
    for (let i = 0; i < maxIterations; i++) {
        cube.update();
        if (!cube._currentRotation && cube._rotationQueue.length === 0) {
            return;
        }
    }
    throw new Error('Animation Queue not empty');
}

describe('Cube initial state and reset', () => {
    it('has a valid initial Kociemba state string', () => {
        //Arange
        const cube = createTestCube();

        //Act
        const state = toKociemba(cube._cubeInfo.initialStickerState);

        expect(state.length).toBe(54);

        // All stickers should be one of U, D, L, R, F, B
        for (const ch of state) {
            expect('UDLRFB').toContain(ch);
        }

        // Each face should have exactly 9 stickers in the solved state.
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
        expect(Object.values(counts).every((c) => c === 9)).toBe(true);
    });

    it('reset() returns the cube to the initial state', () => {
        const cube = createTestCube();
        const initialState = toKociemba(cube._cubeInfo.initialStickerState);

        // Queue a simple move and let it complete.
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

        expect(failedReason).toBeNull();
        expect(completedState).not.toBeNull();
        expect(completedState).not.toBe(initialState);

        /** @type {string?} */
        let resetState = null;
        cube.reset((state) => {
            resetState = state;
            return true;
        });
        drainUpdates(cube);
        expect(/** @type {string?} **/ (resetState)).toBe(initialState);
    });

    it('check sexy move matches the expected state', () => {
        const cube = createTestCube();
        const moves = [Movements.Single.R, Movements.Single.U, Movements.Single.RP, Movements.Single.UP];

        /** @type {string?} */
        let finalState = null;
        for (const move of moves) {
            cube.movement(
                move,
                (state) => {
                    finalState = state;
                },
                () => {
                    throw new Error('Movement failed unexpectedly');
                },
            );
            drainUpdates(cube);
        }

        const EXPECTED_STATE = 'UULUUFUUFRRUBRRURRFFDFFUFFFDDRDDDDDDBLLLLLLLLBRRBBBBBB';

        expect(/** @type {string?} **/ (finalState)).toBe(EXPECTED_STATE);
    });
});

// test.;
