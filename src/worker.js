onmessage = e => {
  if (e.data.action === "start") {
    let all_layouts = JSON.parse(e.data.all_layouts);
    let pyramid = JSON.parse(e.data.pyramid);
    startSolving(all_layouts, pyramid);
  }
}

const startSolving = (all_layouts, pyramid) => {
  startrecursiveSolver(all_layouts, pyramid, 0, 0, 0);
  postMessage("done");
}

const startrecursiveSolver = (layouts, pyramid, x, y, z) => {

  while (true) {
    if (pyramid[x][y][z] === 0) {
      break;
    }

    else {
      if (++x > 4) {
        x = 0;
        if (++y > 4) {
          y = 0;
          if (++z > 4) {
            return;
          }
        }
      }
    }
  }

  for (let shapeI=0; shapeI<layouts.length; shapeI++) {
    let cLayouts = layouts[shapeI].layouts;
    for (let iLayout=0; iLayout<cLayouts.length; iLayout++) {
      let layout = cLayouts[iLayout];
      for (let points=0; points<layout.length; points++) {
        let xOff = x-layout[points][0];
        let yOff = y-layout[points][1];
        let zOff = z-layout[points][2];

        let isFit = true;
        for (let point=0; point<layout.length; point++) {
          let ptx = xOff + layout[point][0];
          let pty = yOff + layout[point][1];
          let ptz = zOff + layout[point][2];

          if (ptx<0 || ptx>4 || pty<0 || pty>4 || ptz<0 || ptz>4) {
            isFit = false;
            break;
          }

          if (!isPresentInPyramid(x, y, z)) {
            isFit = false;
            break;
          }

          if (pyramid[ptx][pty][ptz] !== 0) {
            isFit = false;
            break;
          }
        }

        if (isFit) {
          let newPyramid = [];
          for (let i=0; i<5; i++) {
            let row = [];
            for (let j=0; j<5; j++){
              let col = [];
              for (let k=0; k<5; k++) {
                col.push(pyramid[i][j][k]);
              }
              row.push(col)
            }
            newPyramid.push(row)
          }

          for (let point=0; point<layout.length; point++) {
            let ptx = xOff + layout[point][0];
            let pty = yOff + layout[point][1];
            let ptz = zOff + layout[point][2];
            newPyramid[ptx][pty][ptz] = layouts[shapeI].shapeIndex;
          }

          let newLayouts = layouts.filter(layout => parseInt(layout.shapeIndex) !== parseInt(layouts[shapeI].shapeIndex));
          if (newLayouts.length === 0) {
            postMessage({"solution": JSON.stringify(newPyramid)});
          }

          else {
            startrecursiveSolver(newLayouts, newPyramid, x, y, z);
          }
        }
      }
    }
  }
}

const isPresentInPyramid = (row, col, height) => {
  if (row < 0 || col < 0 || height < 0) {
    return false;
  }
  return row <= 4-col && height <= 4-col;
}
