/**
 * @param {string} action
 * @returns {{axis: "x"|"y"|"z", layers: (0|1|-1)[], direction: (1|-1|2|-2)}}
 */
export default function getRotationDetails(action) {
  if (!action) return;
  const reverse = action.includes("'") ? -1 : 1;
  action = action.replace("'", "");
  const multiplier = action.includes("2") ? 2 : 1;
  action = action.replace("2", "");
  if (!action) return;
  const move = action[0];

  if (move === "x") {
    return { axis: "x", layers: [], direction: -reverse * multiplier };
  } else if (move === "y") {
    return { axis: "y", layers: [], direction: -reverse * multiplier };
  } else if (move === "z") {
    return { axis: "z", layers: [], direction: -reverse * multiplier };
  } else if (move === "U") {
    return { axis: "y", layers: [1], direction: -reverse * multiplier };
  } else if (move === "u") {
    return { axis: "y", layers: [1, 0], direction: -reverse * multiplier };
  } else if (move === "R") {
    return { axis: "x", layers: [1], direction: -reverse * multiplier };
  } else if (move === "r") {
    return { axis: "x", layers: [1, 0], direction: -reverse * multiplier };
  } else if (move === "L") {
    return { axis: "x", layers: [-1], direction: -reverse * multiplier };
  } else if (move == "l") {
    return { axis: "x", layers: [-1, 0], direction: -reverse * multiplier };
  } else if (move === "D") {
    return { axis: "y", layers: [-1], direction: -reverse * multiplier };
  } else if (move === "d") {
    return { axis: "y", layers: [-1, 0], direction: -reverse * multiplier };
  } else if (move === "F") {
    return { axis: "z", layers: [1], direction: -reverse * multiplier };
  } else if (move === "f") {
    return { axis: "z", layers: [1, 0], direction: -reverse * multiplier };
  } else if (move === "B") {
    return { axis: "z", layers: [-1], direction: -reverse * multiplier };
  } else if (move === "b") {
    return { axis: "z", layers: [-1, 0], direction: -reverse * multiplier };
  } else if (move === "M") {
    return { axis: "x", layers: [0], direction: -reverse * multiplier };
  } else if (move === "E") {
    return { axis: "y", layers: [0], direction: -reverse * multiplier };
  } else if (move === "S") {
    return { axis: "z", layers: [0], direction: -reverse * multiplier };
  }
  return undefined;
}
