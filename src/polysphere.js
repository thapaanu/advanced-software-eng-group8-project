import { SHAPE_DATA } from './constants/shapedata';

const shift = (layout) => {
  let newLayout = [];
  for (let i=0; i<layout.length; i++) {
    let row = [];
    for (let j=0; j<layout[0].length; j++) {
      row.push(layout[i][j]);
    }
    newLayout.push(row);
  }

  let minX = newLayout[0][0];
  let minY = newLayout[0][1];

  for (let i=0; i<newLayout.length; i++) {
    minX = Math.min(minX, newLayout[i][0]);
    minY = Math.min(minY, newLayout[i][1]);
  }

  for (let i=0; i<newLayout.length; i++) {
    newLayout[i][0] -= minX;
    newLayout[i][1] -= minY;
  }

  return newLayout;

}

const sorter = (p1, p2) => {
  if (p1[0] < p2[0]) return -1;
  if (p1[0] > p2[0]) return 1;
  if (p1[1] < p2[1]) return -1;
  if (p1[1] > p2[1]) return 1;
  return 0;
}

const flipY = (layout) => {
  let newLayout = [];
  for (let i=0; i<layout.length; i++) {
    let row = [];
    for (let j=0; j<layout[0].length; j++) {
      row.push(layout[i][j]);
    }
    newLayout.push(row);
  }

  for (let i=0; i<newLayout.length; i++) {
    newLayout[i][1] = 6-newLayout[i][1];
  }
  newLayout.sort(sorter);
  return shift(newLayout);
}

const flipX = (layout) => {
  let newLayout = [];
  for (let i=0; i<layout.length; i++) {
    let row = [];
    for (let j=0; j<layout[0].length; j++) {
      row.push(layout[i][j]);
    }
    newLayout.push(row);
  }

  for (let i=0; i<newLayout.length; i++) {
    newLayout[i][0] = 6-newLayout[i][0];
  }
  newLayout.sort(sorter);
  return shift(newLayout);
}

const compareLayout = (l1, l2) => {
  for (let i=0; i<l1.length; i++) {
    if (l1[i][0] !== l2[i][0]) return false;
    if (l1[i][1] !== l2[i][1]) return false;
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

const rotate = layout => {
  let newLayout = [];
  for (let i=0; i<layout.length; i++) {
    let row = [];
    for (let j=0; j<layout[0].length; j++) {
      row.push(layout[i][j]);
    }
    newLayout.push(row);
  }

  for (let i=0; i<newLayout.length; i++) {
    let temp = newLayout[i][0]
    newLayout[i][0] = 6 - newLayout[i][1]
    newLayout[i][1] = temp;
  }

  newLayout.sort(sorter);
  return shift(newLayout);
}

export const solve = (board, invalid_shapes, setSolutions) => {
  let all_layouts = [];
  let layouts, layout;
  for (let i=0; i<SHAPE_DATA.length; i++) {
    if (invalid_shapes.includes(i)) {
      continue;
    }
    layouts = [];
    for (let j=0; j<3; j++) {
      layout = SHAPE_DATA[i].points.map(point => { return [point.x+1, point.y+1] });
      if (j===0) {
        layout = shift(layout);
        layout.sort(sorter);
      }

      else if (j===1) {
        layout = flipX(layout);
      }

      else {
        layout = flipY(layout);
      }


      for (let k=0; k<4; k++) {
        if (!duplicate(layouts, layout)) {
          layouts.push(layout);
        }

        layout = rotate(layout);
      }
    }

    all_layouts.push({
      shapeIndex: i,
      layouts: layouts
    });
  }


  let worker = new window.Worker(new URL('./worker.js', import.meta.url), {type: 'module'});
  worker.onmessage = e => {
    if (e.data === 'done') {
      console.log("DONE")
    }

    else if (e.data === "All points done.") {
      console.log("Solutions not found.");
    }
    else if ('solution' in e.data) {
      let solution = JSON.parse(e.data.solution);
      console.log(solution);
      setSolutions(prevSolutions => {

        if (prevSolutions.length === 0) {
          return [...prevSolutions, solution];
        }

        let duplicate = true;
        for (let i=0; i<prevSolutions.length; i++) {
          for (let r=0; r<11; r++) {
            for (let c=0; c<5; c++) {
              if (solution[r][c] !== prevSolutions[i][r][c]) {
                duplicate = false;
                break;
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
  worker.postMessage({action: "start", all_layouts:JSON.stringify(all_layouts), board: JSON.stringify(board)});
  return worker;
}

export const stopSolve = (worker) => {
  worker.terminate();
  return null;
}
