import { SHAPE_DATA } from './constants/shapedata';

const sorter = (p1, p2) => {
  if (p1[0] < p2[0]) return -1;
  if (p1[0] > p2[0]) return 1;
  if (p1[1] < p2[1]) return -1;
  if (p1[1] > p2[1]) return 1;
  if (p1[2] < p2[2]) return -1;
  if (p1[2] > p2[2]) return 1;
  return 0;
}

const compareLayout = (l1, l2) => {
  for (let i=0; i<l1.length; i++) {
    if (l1[i][0] !== l2[i][0]) return false;
    if (l1[i][1] !== l2[i][1]) return false;
    if (l1[i][2] !== l2[i][2]) return false;
  }
  return true;
}

const duplicate = (layouts, layout) => {
  for (let i=0; i<layouts.length; i++) {
    if (compareLayout(layouts[i], layout)) {
      return true;
    }
  }
  return false;
}

export const flipPoints = (points, axis) => {
  //points: [[0, 0, 0], [1, 0, 0], [2, 0, 0], [0, 0, 1], [2, 0, 1]]

  let size = -1;
  for (let i=0; i<3; i++) {
    if (points[i][0] > size) size = points[i][0];
    if (points[i][1] > size) size = points[i][1];
    if (points[i][2] > size) size = points[i][2];
  }

  // because indexed at 0
  size += 1;


  let newPoints = [];
  for (let i=0; i<points.length; i++) {
    let point = points[i];
    // point: [0, 0, 0]

    let center = (size-1)/2;

    let newX = point[0] - center;
    let newY = point[1] - center;
    let newZ = point[2] - center;

    if (axis === "x") {
      newX = -newX;
    }

    if (axis === "y") {
      newY = -newY;
    }

    if (axis === "z") {
      newZ = -newZ;
    }

    newX += center;
    newY += center;
    newZ += center;

    newPoints.push([newX, newY, newZ]);
  }

  return transformBack(newPoints).sort(sorter);
}

export const rotatePoints = (points, axis) => {
  //points: [[0, 0, 0], [1, 0, 0], [2, 0, 0], [0, 0, 1], [2, 0, 1]]

  let size = -10;
  for (let i=0; i<3; i++) {
    if (points[i][0] > size) size = points[i][0];
    if (points[i][1] > size) size = points[i][1];
    if (points[i][2] > size) size = points[i][2];
  }

  // because indexed at 0
  size += 1;


  let newPoints = [];
  for (let i=0; i<points.length; i++) {
    let point = points[i];
    // point: [0, 0, 0]

    let center = (size-1)/2;

    let newX = point[0] - center;
    let newY = point[1] - center;
    let newZ = point[2] - center;

    if (axis === "x") {
      let temp = newY;
      newY = -newZ;
      newZ = temp;
    }

    if (axis === "y") {
      let temp = newX;
      newX = newZ;
      newZ = -temp;
    }

    if (axis === "z") {
      let temp = newX;
      newX = -newY;
      newY = temp;
    }

    newX += center;
    newY += center;
    newZ += center;

    newPoints.push([newX, newY, newZ]);
  }

  return transformBack(newPoints).sort(sorter);
}

const transformBack = points => {
  let newPoints = [];

  let minX = points[0][0];
  let minY = points[0][1];
  let minZ = points[0][2];
  for (let i=0; i<points.length; i++) {
    if (points[i][0] < minX) minX = points[i][0];
    if (points[i][1] < minY) minY = points[i][1];
    if (points[i][2] < minZ) minZ = points[i][2];
  }

  for (let i=0; i<points.length; i++) {
    newPoints.push([points[i][0]-minX, points[i][1]-minY, points[i][2]-minZ]);
  }

  return newPoints;
}

export const solve = (pyramid, setSolutions, solutionsLength, setNotification, setShowNotification) => {

  let invalid_shapes = [];
  for (let x=0; x<5; x++) {
    for (let y=0; y<5; y++) {
      for (let z=0; z<5; z++) {
        if (!invalid_shapes.includes(pyramid[x][y][z]-1)) {
          invalid_shapes.push(pyramid[x][y][z]-1);
        }
      }
    }
  }

  let all_layouts = [];
  let layouts, layout;

  let axes = ["x", "y", "z"];
  for (let i=0; i<SHAPE_DATA.length; i++) {
    if (invalid_shapes.includes(i)) {
      continue;
    }
    layouts = [];

    layout = SHAPE_DATA[i].points.map(point => [point.y, 0, point.x]);
    for (let rotateC=0; rotateC<3; rotateC++) {
      for (let flipC=0; flipC<3; flipC++) {
        for (let j=0; j<4; j++) {
          layout = rotatePoints(layout, axes[rotateC]);
          if (!duplicate(layouts, layout)) {
            layouts.push(layout);
          }
        }
        layout = flipPoints(layout, axes[flipC]);
        if (!duplicate(layouts, layout)) {
          layouts.push(layout);
        }
      }
    }

    all_layouts.push({
      shapeIndex: i+1,
      layouts: layouts
    });
  }

  let worker = new window.Worker(new URL('./worker.js', import.meta.url), {type: 'module'});
  worker.onmessage = e => {
    if (e.data === 'done') {
      solutionsLength === 0 ? setNotification("Cannot be solved.") : setNotification("All solutions done.");
      setShowNotification(true);
    }
    else if ('solution' in e.data) {
      let solution = JSON.parse(e.data.solution);
      setSolutions(prevSolutions => {
        if (prevSolutions.length === 0) {
          return [...prevSolutions, solution];
        }

        let duplicate = true;
        for (let i=0; i<prevSolutions.length; i++) {
          for (let x=0; x<5; x++) {
            for (let y=0; y<5; y++) {
              for (let z=0; z<5; z++) {
                if (solution[x][y][z] !== prevSolutions[i][x][y][z]) {
                  duplicate = false;
                  break;
                }
              }
            }
            if (!duplicate) {
              break;
            }
          }
        }

        if (duplicate) {
          return [...prevSolutions];
        }

        else {
          return [...prevSolutions, solution];
        }
      });
    }

    else {
      console.log(e.data);
    }
  }
  worker.postMessage({action: "start", all_layouts:JSON.stringify(all_layouts), pyramid: JSON.stringify(pyramid)});
  return worker;
}

export const stopSolve = (worker) => {
  worker.terminate();
  return null;
}
