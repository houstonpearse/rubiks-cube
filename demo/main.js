import { RubiksCubePlayer, RubiksCubePlayerAttributes } from '../src/player/index.js';

RubiksCubePlayer.register();

const player = document.getElementById('player');
const cubeType = document.getElementById('cube-type');
const setup = document.getElementById('setup');
const alg = document.getElementById('alg');

// start the form from whatever the player was given in the markup
cubeType.value = player.getAttribute(RubiksCubePlayerAttributes.CubeType) ?? 'Three';
setup.value = player.getAttribute(RubiksCubePlayerAttributes.Setup) ?? '';
alg.value = player.getAttribute(RubiksCubePlayerAttributes.Alg) ?? '';

cubeType.addEventListener('change', () => player.setAttribute(RubiksCubePlayerAttributes.CubeType, cubeType.value));
setup.addEventListener('input', () => player.setAttribute(RubiksCubePlayerAttributes.Setup, setup.value));
alg.addEventListener('input', () => player.setAttribute(RubiksCubePlayerAttributes.Alg, alg.value));

// Exposed for poking at the playback methods from the devtools console
window.player = player;
