onmessage = e => {
  if (e.data.action === "start") {
    let all_layouts = JSON.parse(e.data.all_layouts);
    let board = JSON.parse(e.data.board);
    startSolving(all_layouts, board);
  }
}

const startSolving = (all_layouts, board) => {
  startrecursiveSolver(all_layouts, board, 0, 0);
  postMessage("done");
}

const startrecursiveSolver = (layouts, board, x, y) => {

  while (true) {
    if (board[x][y] === -1) {
      break;
    }

    else {
      if (++x >= 11) {
        x = 0;
        if (++y >= 5) {
          postMessage("All points done.");
          return;
        }
      }
    }
  }

  for (let shapeI=0; shapeI<=layouts.length; shapeI++) {
    if (layouts[shapeI] === undefined) {
      return;
    }
    let cLayouts = layouts[shapeI].layouts;
    for (let iLayout=0; iLayout<cLayouts.length; iLayout++) {
      let layout = cLayouts[iLayout];
      for (let points=0; points<layout.length; points++) {
        let xOff = x-layout[points][0];
        let yOff = y-layout[points][1];

        let isFit = true;
        for (let point=0; point<layout.length; point++) {
          let ptx = xOff + layout[point][0];
          let pty = yOff + layout[point][1];

          if (ptx<0 || ptx >= 11 || pty<0 || pty>=5) {
            isFit = false;
            break;
          }

          if (board[ptx][pty] !== -1) {
            isFit = false;
            break;
          }
        }

        if (isFit) {
          let newBoard = [];
          for (let i=0; i<board.length; i++) {
            let row = [];
            for (let j=0; j<board[0].length; j++){
              row.push(board[i][j]);
            }
            newBoard.push(row)
          }

          for (let point=0; point<layout.length; point++) {
            let ptx = xOff + layout[point][0];
            let pty = yOff + layout[point][1];
            newBoard[ptx][pty] = layouts[shapeI].shapeIndex;
          }

          let newLayouts = layouts.filter(layout => parseInt(layout.shapeIndex) !== parseInt(layouts[shapeI].shapeIndex));
          if (newLayouts.length === 0) {
            postMessage({"solution": JSON.stringify(newBoard)});
          }

          else {
            startrecursiveSolver(newLayouts, newBoard, x, y);
          }
        }


      }
    }
  }
}
