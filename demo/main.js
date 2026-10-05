import { RubiksCubePlayer, RubiksCubePlayerAttributes } from '../src/player/index.js';
import { RubiksCubeElement, AttributeNames, PeekActions } from '../src/webComponent/index.js';
import { CubeTypes, LayerCount, Movements, Rotations } from '../src/core/index.js';

// ---- tabs ----

const tabs = document.querySelectorAll('[role="tab"]');
for (const tab of tabs) {
    tab.addEventListener('click', () => {
        for (const other of tabs) {
            const selected = other === tab;
            other.setAttribute('aria-selected', String(selected));
            document.getElementById(other.getAttribute('aria-controls')).hidden = !selected;
        }
    });
}

/** @param {HTMLSelectElement} select */
function fillCubeTypes(select, selected) {
    for (const type of Object.values(CubeTypes)) {
        const n = LayerCount[type];
        select.add(new Option(`${n}x${n}`, type, false, type === selected));
    }
}

// ---- player tab ----

const player = document.getElementById('player');
const playerCubeType = document.getElementById('player-cube-type');
const setup = document.getElementById('setup');
const alg = document.getElementById('alg');

// start the form from whatever the player was given in the markup
fillCubeTypes(playerCubeType, player.getAttribute(RubiksCubePlayerAttributes.CubeType) ?? CubeTypes.Three);
setup.value = player.getAttribute(RubiksCubePlayerAttributes.Setup) ?? '';
alg.value = player.getAttribute(RubiksCubePlayerAttributes.Alg) ?? '';

playerCubeType.addEventListener('change', () => player.setAttribute(RubiksCubePlayerAttributes.CubeType, playerCubeType.value));
setup.addEventListener('input', () => player.setAttribute(RubiksCubePlayerAttributes.Setup, setup.value));
alg.addEventListener('input', () => player.setAttribute(RubiksCubePlayerAttributes.Alg, alg.value));

// ---- cube tab ----

const cube = document.getElementById('cube');
const cubeCubeType = document.getElementById('cube-cube-type');
const animationStyle = document.getElementById('animation-style');
const logo = document.getElementById('logo');

fillCubeTypes(cubeCubeType, cube.getAttribute(AttributeNames.cubeType) ?? CubeTypes.Three);
cubeCubeType.addEventListener('change', () => showState(cube.setType(cubeCubeType.value)));
animationStyle.addEventListener('change', () => cube.setAttribute(AttributeNames.animationStyle, animationStyle.value));
logo.addEventListener('change', () => (logo.value ? cube.setAttribute(AttributeNames.logo, logo.value) : cube.removeAttribute(AttributeNames.logo)));

// ranges mirror the validation in src/webComponent/settings.js; values are the element's defaults
const sliders = [
    { label: 'Piece gap', attr: AttributeNames.pieceGap, min: 1, max: 1.1, step: 0.005, value: 1.04 },
    { label: 'Animation speed (ms)', attr: AttributeNames.animationSpeed, min: 0, max: 1000, step: 10, value: 100 },
    { label: 'Camera speed (ms)', attr: AttributeNames.cameraSpeed, min: 0, max: 1000, step: 10, value: 100 },
    { label: 'Camera radius', attr: AttributeNames.cameraRadius, min: 4, max: 15, step: 0.1, value: 10 },
    { label: 'Camera field of view', attr: AttributeNames.cameraFieldOfView, min: 30, max: 100, step: 1, value: 40 },
    { label: 'Peek angle horizontal', attr: AttributeNames.cameraPeekAngleHorizontal, min: 0, max: 1, step: 0.05, value: 0.6 },
    { label: 'Peek angle vertical', attr: AttributeNames.cameraPeekAngleVertical, min: 0, max: 1, step: 0.05, value: 0.6 },
];
const slidersContainer = document.getElementById('sliders');
for (const { label, attr, min, max, step, value } of sliders) {
    const wrapper = document.createElement('label');
    const output = document.createElement('output');
    const input = Object.assign(document.createElement('input'), { type: 'range', min, max, step });
    input.value = cube.getAttribute(attr) ?? String(value);
    output.value = input.value;
    wrapper.append(label, ' ', output, input);
    slidersContainer.append(wrapper);
    cube.setAttribute(attr, input.value);
    input.addEventListener('input', () => {
        output.value = input.value;
        cube.setAttribute(attr, input.value);
    });
}
cube.setAttribute(AttributeNames.animationStyle, animationStyle.value);

/**
 * @param {string} containerId
 * @param {string[]} labels
 * @param {(label: string) => Promise<unknown>} action
 */
function addButtons(containerId, labels, action) {
    const container = document.getElementById(containerId);
    for (const label of labels) {
        const button = Object.assign(document.createElement('button'), { type: 'button', textContent: label });
        button.addEventListener('click', () => action(label).catch((err) => console.warn(err)));
        container.append(button);
    }
}

const state = document.getElementById('state');
const stateHint = document.getElementById('state-hint');
const setState = document.getElementById('set-state');

/** @param {string} kociembaState */
function showState(kociembaState) {
    state.value = kociembaState;
    validateState();
}

// move and rotate resolve with the kociemba state once the animation completes
addButtons('moves', Object.values(Movements.Single), (move) => cube.move(move).then(showState));
addButtons('rotations', Object.values(Rotations), (rotation) => cube.rotate(rotation).then(showState));
addButtons('peeks', Object.values(PeekActions), (action) => cube.peek(action));

// a kociemba state has one facelet per sticker: 6 faces of n x n
function validateState() {
    const n = LayerCount[cubeCubeType.value];
    const expected = 6 * n * n;
    state.maxLength = expected;
    const valid = state.value.length === expected;
    setState.disabled = !valid;
    stateHint.textContent = `${state.value.length} / ${expected} characters for a ${n}x${n}`;
    return valid;
}

state.addEventListener('input', validateState);
document.getElementById('reset').addEventListener('click', () => showState(cube.reset()));
document.getElementById('get-state').addEventListener('click', () => showState(cube.getState()));
setState.addEventListener('click', () => {
    if (validateState() && !cube.setState(state.value)) {
        stateHint.textContent = 'Invalid kociemba state';
    }
});
validateState();

RubiksCubePlayer.register();
RubiksCubeElement.register();

// Exposed for poking at the methods from the devtools console
window.player = player;
window.cube = cube;
