/**
 * @typedef {typeof Movements[keyof typeof Movements]} Movement
 */
export const Movements = Object.freeze({
    R: 'R',
    R2: 'R2',
    RP: "R'",
    L: 'L',
    L2: 'L2',
    LP: "L'",
    U: 'U',
    U2: 'U2',
    UP: "U'",
    D: 'D',
    D2: 'D2',
    DP: "D'",
    F: 'F',
    F2: 'F2',
    FP: "F'",
    B: 'B',
    B2: 'B2',
    BP: "B'",
    // Wide moves
    r: 'r',
    r2: 'r2',
    rP: "r'",
    l: 'l',
    l2: 'l2',
    lP: "l'",
    u: 'u',
    u2: 'u2',
    uP: "u'",
    d: 'd',
    d2: 'd2',
    dP: "d'",
    f: 'f',
    f2: 'f2',
    fP: "f'",
    b: 'b',
    b2: 'b2',
    bP: "b'",
    // Slice moves
    M: 'M',
    M2: 'M2',
    MP: "M'",
    E: 'E',
    E2: 'E2',
    EP: "E'",
    S: 'S',
    S2: 'S2',
    SP: "S'",
});

/**
 * @typedef {typeof Rotations[keyof typeof Rotations]} Rotation
 */
export const Rotations = Object.freeze({
    x: 'x',
    x2: 'x2',
    xP: "x'",
    y: 'y',
    y2: 'y2',
    yP: "y'",
    z: 'z',
    z2: 'z2',
    zP: "z'",
});

/**
 * @typedef {typeof Axi[keyof typeof Axi]} Axis
 */
export const Axi = Object.freeze({
    x: 'x',
    y: 'y',
    z: 'z',
});

/**
 * @typedef {typeof Faces [keyof typeof Faces]} Face
 */
export const Faces = Object.freeze({
    up: 'U',
    down: 'D',
    left: 'L',
    right: 'R',
    front: 'F',
    back: 'B',
});

/**
 * @typedef {typeof FaceColours [keyof typeof FaceColours]} FaceColour
 */
export const FaceColours = Object.freeze({
    up: 'white',
    down: 'yellow',
    left: 'orange',
    right: 'red',
    front: 'green',
    back: 'blue',
});

/**
 * @typedef {typeof PeekTypes [keyof typeof PeekTypes]} PeekType
 */
export const PeekTypes = Object.freeze({
    Horizontal: 'horizontal',
    Vertical: 'vertical',
    Right: 'right',
    Left: 'left',
    Up: 'up',
    Down: 'down',
    RightUp: 'rightUp',
    RightDown: 'rightDown',
    LeftUp: 'leftUp',
    LeftDown: 'leftDown',
});

/**
 * @typedef {typeof PeekStates [keyof typeof PeekStates]} PeekState
 */
export const PeekStates = Object.freeze({
    RightUp: 'rightUp',
    RightDown: 'rightDown',
    LeftUp: 'leftUp',
    LeftDown: 'leftDown',
});
