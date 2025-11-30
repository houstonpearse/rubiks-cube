import { Group } from 'three';
import Materials from '../threejs/materials';
import { createCornerGroup, createEdgeGroup, createCenterGroup } from '../threejs/pieces';

/**
 * @typedef {{x: number,y: number,z: number}} vector
 */

/**
 * @typedef {{position: vector, rotation: vector, type: "corner" | "edge" | "center", group: Group}} state
 */

/**
 * @return {state[]}
 */
const corners = () => [
    {
        position: { x: 1, y: 1, z: 1 },
        rotation: { x: 0, y: 0, z: 0 },
        type: 'corner',
        group: createCornerGroup(Materials.front, Materials.right, Materials.up, Materials.core),
    },
    {
        position: { x: 1, y: 1, z: -1 },
        rotation: { x: 0, y: Math.PI / 2, z: 0 },
        type: 'corner',
        group: createCornerGroup(Materials.right, Materials.back, Materials.up, Materials.core),
    },
    {
        position: { x: 1, y: -1, z: 1 },
        rotation: { x: 0, y: Math.PI / 2, z: Math.PI },
        type: 'corner',
        group: createCornerGroup(Materials.right, Materials.front, Materials.down, Materials.core),
    },
    {
        position: { x: 1, y: -1, z: -1 },
        rotation: { x: 0, y: Math.PI, z: Math.PI },
        type: 'corner',
        group: createCornerGroup(Materials.back, Materials.right, Materials.down, Materials.core),
    },
    {
        position: { x: -1, y: 1, z: 1 },
        rotation: { x: 0, y: -Math.PI / 2, z: 0 },
        type: 'corner',
        group: createCornerGroup(Materials.left, Materials.front, Materials.up, Materials.core),
    },
    {
        position: { x: -1, y: 1, z: -1 },
        rotation: { x: 0, y: Math.PI, z: 0 },
        type: 'corner',
        group: createCornerGroup(Materials.back, Materials.left, Materials.up, Materials.core),
    },
    {
        position: { x: -1, y: -1, z: 1 },
        rotation: { x: 0, y: 0, z: Math.PI },
        type: 'corner',
        group: createCornerGroup(Materials.front, Materials.left, Materials.down, Materials.core),
    },
    {
        position: { x: -1, y: -1, z: -1 },
        rotation: { x: 0, y: -Math.PI / 2, z: Math.PI },
        type: 'corner',
        group: createCornerGroup(Materials.left, Materials.back, Materials.down, Materials.core),
    },
];

/**
 * @return {state[]}
 */
const edges = () => [
    {
        position: { x: 1, y: 1, z: 0 },
        rotation: { x: 0, y: Math.PI / 2, z: 0 },
        type: 'edge',
        group: createEdgeGroup(Materials.right, Materials.up, Materials.core),
    },
    {
        position: { x: 1, y: 0, z: 1 },
        rotation: { x: 0, y: 0, z: -Math.PI / 2 },
        type: 'edge',
        group: createEdgeGroup(Materials.front, Materials.right, Materials.core),
    },
    {
        position: { x: 1, y: 0, z: -1 },
        rotation: { x: 0, y: Math.PI / 2, z: -Math.PI / 2 },
        type: 'edge',
        group: createEdgeGroup(Materials.right, Materials.back, Materials.core),
    },
    {
        position: { x: 1, y: -1, z: 0 },
        rotation: { x: Math.PI, y: Math.PI / 2, z: 0 },
        type: 'edge',
        group: createEdgeGroup(Materials.right, Materials.down, Materials.core),
    },
    {
        position: { x: 0, y: 1, z: 1 },
        rotation: { x: 0, y: 0, z: 0 },
        type: 'edge',
        group: createEdgeGroup(Materials.front, Materials.up, Materials.core),
    },
    {
        position: { x: 0, y: 1, z: -1 },
        rotation: { x: -Math.PI / 2, y: 0, z: 0 },
        type: 'edge',
        group: createEdgeGroup(Materials.up, Materials.back, Materials.core),
    },
    {
        position: { x: 0, y: -1, z: 1 },
        rotation: { x: Math.PI / 2, y: 0, z: 0 },
        type: 'edge',
        group: createEdgeGroup(Materials.down, Materials.front, Materials.core),
    },
    {
        position: { x: 0, y: -1, z: -1 },
        rotation: { x: Math.PI, y: 0, z: 0 },
        type: 'edge',
        group: createEdgeGroup(Materials.back, Materials.down, Materials.core),
    },
    {
        position: { x: -1, y: 1, z: 0 },
        rotation: { x: 0, y: -Math.PI / 2, z: 0 },
        type: 'edge',
        group: createEdgeGroup(Materials.left, Materials.up, Materials.core),
    },
    {
        position: { x: -1, y: 0, z: 1 },
        rotation: { x: 0, y: 0, z: Math.PI / 2 },
        type: 'edge',
        group: createEdgeGroup(Materials.front, Materials.left, Materials.core),
    },
    {
        position: { x: -1, y: 0, z: -1 },
        rotation: { x: 0, y: -Math.PI / 2, z: Math.PI / 2 },
        type: 'edge',
        group: createEdgeGroup(Materials.left, Materials.back, Materials.core),
    },
    {
        position: { x: -1, y: -1, z: 0 },
        rotation: { x: 0, y: -Math.PI / 2, z: Math.PI },
        type: 'edge',
        group: createEdgeGroup(Materials.left, Materials.down, Materials.core),
    },
];

/**
 * @return {state[]}
 */
const centers = () => [
    {
        position: { x: 1, y: 0, z: 0 },
        rotation: { x: 0, y: Math.PI / 2, z: 0 },
        type: 'center',
        group: createCenterGroup(Materials.right, Materials.core),
    },
    {
        position: { x: 0, y: 1, z: 0 },
        rotation: { x: -Math.PI / 2, y: 0, z: 0 },
        type: 'center',
        group: createCenterGroup(Materials.up, Materials.core),
    },
    {
        position: { x: 0, y: 0, z: 1 },
        rotation: { x: 0, y: 0, z: 0 },
        type: 'center',
        group: createCenterGroup(Materials.front, Materials.core),
    },
    {
        position: { x: 0, y: 0, z: -1 },
        rotation: { x: 0, y: Math.PI, z: 0 },
        type: 'center',
        group: createCenterGroup(Materials.back, Materials.core),
    },
    {
        position: { x: 0, y: -1, z: 0 },
        rotation: { x: Math.PI / 2, y: 0, z: 0 },
        type: 'center',
        group: createCenterGroup(Materials.down, Materials.core),
    },
    {
        position: { x: -1, y: 0, z: 0 },
        rotation: { x: 0, y: -Math.PI / 2, z: 0 },
        type: 'center',
        group: createCenterGroup(Materials.left, Materials.core),
    },
];

/**
 * @return {state[]}
 */
const createCubeState = () => [...corners(), ...edges(), ...centers()];
export { createCubeState };
