// @ts-check
export default `
:host {
    display: block;
}

.player {
    display: flex;
    flex-direction: column;
    height: 100%;
}

rubiks-cube {
    display: block;
    flex: 1 1 0;
    min-height: 0;
    overflow: hidden;
}

.playback-toggle {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.playback-options {
    flex: 0 0 auto;
    margin: 10px 0 10px 0;
    display: flex;
    justify-content: center;
}

.playback-icon {
    align-items: center;
    justify-content: center;
    padding: 0 5px 0 5px;
    margin: 0 5px 0 5px;
    border-radius: 5px;
    border: none;
    background: transparent;
}

.playback-icon[hidden] {
    display: none;
}

.playback-icon:active {
    background-color: #d7d7d7;
}

.playback-icon > svg {
    fill: #2c2c2c;
    display: block;
}
`;
