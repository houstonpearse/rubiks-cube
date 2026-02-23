import CubeSettings from '../src/cube/cubeSettings.js';
import RubiksCube3D from '../src/three/cube.js';
/**
 * @param {import('../src/core.js').CubeType} cubeType
 * @returns {RubiksCube3D}
 **/
export function createTestCube(cubeType) {
    // Use a fixed animation style and zero duration so rotations complete deterministically in tests.
    const settings = new CubeSettings(1.04, 0, 'fixed', cubeType);
    return new RubiksCube3D(settings);
}

/**
 *
 * @param {RubiksCube3D} cube
 * @param {number} maxIterations
 */
export function drainUpdates(cube, maxIterations = 20) {
    // Step the cube until the current rotation and queue are empty, or until we hit a safety cap.
    for (let i = 0; i < maxIterations; i++) {
        cube.update();
        if (!cube._currentAnimation && cube._animationQueue.length === 0) {
            return;
        }
    }
    throw new Error('Animation Queue not empty');
}
