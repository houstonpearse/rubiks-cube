/**
 * @typedef {{x: number,y: number,z: number}} vector
 */

/**
 * @type {vector[]}
 */
const corners = [
  { position: { x: 1, y: 1, z: 1 }, rotation: { x: 0, y: 0, z: 0 } },
  { position: { x: 1, y: 1, z: -1 }, rotation: { x: 0, y: Math.PI / 2, z: 0 } },
  {
    position: { x: 1, y: -1, z: 1 },
    rotation: { x: 0, y: Math.PI / 2, z: Math.PI },
  },
  {
    position: { x: 1, y: -1, z: -1 },
    rotation: { x: 0, y: Math.PI, z: Math.PI },
  },

  {
    position: { x: -1, y: 1, z: 1 },
    rotation: { x: 0, y: -Math.PI / 2, z: 0 },
  },
  { position: { x: -1, y: 1, z: -1 }, rotation: { x: 0, y: Math.PI, z: 0 } },
  { position: { x: -1, y: -1, z: 1 }, rotation: { x: 0, y: 0, z: Math.PI } },
  {
    position: { x: -1, y: -1, z: -1 },
    rotation: { x: 0, y: -Math.PI / 2, z: Math.PI },
  },
];

/**
 * @type {vector[]}
 */
const edges = [
  { position: { x: 1, y: 1, z: 0 }, rotation: { x: 0, y: Math.PI / 2, z: 0 } },
  {
    position: { x: 1, y: 0, z: 1 },
    rotation: { x: 0, y: 0, z: -Math.PI / 2 },
  },
  {
    position: { x: 1, y: 0, z: -1 },
    rotation: { x: 0, y: Math.PI / 2, z: -Math.PI / 2 },
  },
  {
    position: { x: 1, y: -1, z: 0 },
    rotation: { x: Math.PI, y: Math.PI / 2, z: 0 },
  },
  { position: { x: 0, y: 1, z: 1 }, rotation: { x: 0, y: 0, z: 0 } },
  {
    position: { x: 0, y: 1, z: -1 },
    rotation: { x: -Math.PI / 2, y: 0, z: 0 },
  },
  { position: { x: 0, y: -1, z: 1 }, rotation: { x: Math.PI / 2, y: 0, z: 0 } },
  { position: { x: 0, y: -1, z: -1 }, rotation: { x: Math.PI, y: 0, z: 0 } },
  {
    position: { x: -1, y: 1, z: 0 },
    rotation: { x: 0, y: -Math.PI / 2, z: 0 },
  },
  { position: { x: -1, y: 0, z: 1 }, rotation: { x: 0, y: 0, z: Math.PI / 2 } },
  {
    position: { x: -1, y: 0, z: -1 },
    rotation: { x: 0, y: -Math.PI / 2, z: Math.PI / 2 },
  },
  {
    position: { x: -1, y: -1, z: 0 },
    rotation: { x: 0, y: -Math.PI / 2, z: Math.PI },
  },
];

/**
 * @type {vector[]}
 */
const centers = [
  { position: { x: 1, y: 0, z: 0 }, rotation: { x: 0, y: Math.PI / 2, z: 0 } },
  { position: { x: 0, y: 1, z: 0 }, rotation: { x: -Math.PI / 2, y: 0, z: 0 } },
  { position: { x: 0, y: 0, z: 1 }, rotation: { x: 0, y: 0, z: 0 } },
  { position: { x: 0, y: 0, z: -1 }, rotation: { x: 0, y: Math.PI, z: 0 } },
  { position: { x: 0, y: -1, z: 0 }, rotation: { x: Math.PI / 2, y: 0, z: 0 } },
  {
    position: { x: -1, y: 0, z: 0 },
    rotation: { x: 0, y: -Math.PI / 2, z: 0 },
  },
];

/**
 * @typedef {Object} state
 * @property {string} type
 * @property {vector} initialPosition
 * @property {vector} initialRotation
 * @property {vector} position
 * @property {vector} rotation
 */

/**
 *  @returns {state[]}
 */
export function newCubeState() {
  let cubeState = [];
  corners.forEach(({ position, rotation }) => {
    cubeState.push({
      type: "corner",
      initialPosition: position,
      initialRotation: rotation,
      position: position,
      rotation: rotation,
    });
  });
  edges.forEach(({ position, rotation }) => {
    cubeState.push({
      type: "edge",
      initialPosition: position,
      initialRotation: rotation,
      position: position,
      rotation: rotation,
    });
  });
  centers.forEach(({ position, rotation }) => {
    cubeState.push({
      type: "center",
      initialPosition: position,
      initialRotation: rotation,
      position: position,
      rotation: rotation,
    });
  });
  return cubeState;
}

/**
 * @typedef {{x: number|null,y: number|null,z: number|null}} layer
 */

export function isValidLayer(layer) {
  let nullCount = 0;
  if (layer.x === null) nullCount++;
  if (layer.y === null) nullCount++;
  if (layer.z === null) nullCount++;
  return nullCount === 1;
}

/**
 *
 * @param {state[]} cubeState
 * @param {layer} layer
 * @returns {state[]}
 */
export function getLayer(cubeState, layer) {
  if (!isValidLayer(layer)) {
    throw new Error("Invalid layer");
  }
  return cubeState.filter((state) => {
    if (layer.x !== null && state.position.x !== layer.x) return false;
    if (layer.y !== null && state.position.y !== layer.y) return false;
    if (layer.z !== null && state.position.z !== layer.z) return false;
    return true;
  });
}
