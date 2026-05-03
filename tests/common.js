import RubiksCube3DSettings from '../src/rubiksCube3D/cubeSettings.js';
import RubiksCube3D from '../src/rubiksCube3D/rubiksCube3D.js';
/**
 * @param {import('../src/core.js').CubeType} cubeType
 * @returns {RubiksCube3D}
 **/
export function createTestCube(cubeType) {
    // Use a fixed animation style and zero duration so rotations complete deterministically in tests.
    const settings = new RubiksCube3DSettings(1.04, 0, cubeType, 'sine');
    return new RubiksCube3D(settings);
}
