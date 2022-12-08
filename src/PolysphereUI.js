import { useMemo, useState } from "react";
import "./App.css";
import "./assets/css/style.css";
import nextl from "./assets/img/next-left.png";
import nextr from "./assets/img/next-right.png";
import Playground from "./components/Playground";
import { SHAPE_DATA, SHAPE_COLOR } from "./constants/shapedata";

import { solve, stopSolve } from './polysphere';

let worker;

let solutionsPerRow = 5;

function PolysphereUI() {
  const INITIAL_BLOCK = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ];

  const [data, setData] = useState([]);
  const [selectedAdd, setSelectedAdd] = useState(0);
  const [selectedMove, setSelectedMove] = useState(0);
  const [solutions, setSolutions] = useState([]);

  const getSolutions = () => {
    setSolutions([]);
    let board = [];
    for (let i=0; i<11; i++) {
      let row = [];
      for (let j=0; j<5; j++) {
        row.push(-1);
      }
      board.push(row);
    }

    let invalid_shapes = [];

    for (let i=0; i<data.length; i++) {
      let shape = data[i];
      let shapeID = parseInt(shape.name.slice(5));

      let points = shape.points;
      let overlap = false;
      let pointsToAdd = [];

      for (let point=0; point<points.length; point++) {
        let x = parseInt(points[point].x);
        let y = parseInt(points[point].y);

        if (board[y][x] === -1) {
          pointsToAdd.push([y, x]);
        }

        else {
          overlap = true;
        }
      }

      if (!overlap) {
        for (let i=0; i<pointsToAdd.length; i++) {
          let point = pointsToAdd[i];
          board[point[0]][point[1]] = parseInt(shapeID)-1;
        }

        invalid_shapes.push(parseInt(shapeID)-1);
      }
    }
    worker = solve(board, invalid_shapes, setSolutions);
  }

  const stopSolutions = () => {
    worker = stopSolve(worker);
  }

  const groundData = useMemo(() => {
    return data
      .reduce((ret, cur, curIndex) => {
        return [
          ...(ret ?? []),
          ...(cur?.points ?? []).map((point) => ({
            ...point,
            selected: curIndex === selectedMove,
          })),
        ];
      }, [])
      .reduce((ret, cur) => {
        const { x, y, selected } = cur;
        ret[x][y] = selected ? 2 : 1;
        return ret;
      }, INITIAL_BLOCK);
      //eslint-disable-next-line
  }, [data, selectedMove]);

  const handleSubmit = () => {
    const newBlock = SHAPE_DATA?.[selectedAdd];

    setData((s = []) => [...(s ?? []), newBlock]);
  };

  const handlenbtnClick = (nextbtnStatus) => {
    if (nextbtnStatus) {
      if (selectedAdd === 0) setSelectedAdd(12);
      setSelectedAdd((state) => state - 1);
    } else {
      if (selectedAdd === 12) setSelectedAdd(0);
      setSelectedAdd((state) => state + 1);
    }
  };

  const handleSelectMove = (value = "") => {
    const num = data.length;
    if (value === "next") {
      if (selectedMove < num) setSelectedMove((s) => s + 1);
      else setSelectedMove(0);
    } else {
      if (selectedMove === 0) setSelectedMove(num);
      else setSelectedMove((s) => s - 1);
    }
  };

  const handleMove = (direct = "") => {
    let d = { x: 0, y: 0 };
    switch (direct) {
      case "up":
        d = { x: -1, y: 0 };
        break;
      case "left":
        d = { x: 0, y: -1 };
        break;
      case "right":
        d = { x: 0, y: 1 };
        break;
      case "down":
        d = { x: 1, y: 0 };
        break;

      default:
        break;
    }

    if (!Object.values(d).reduce((a, b) => a + b, 0)) {
      return false;
    }

    const xarr = data[selectedMove].points.map((item) => item.x);
    const yarr = data[selectedMove].points.map((item) => item.y);
    const xmax = Math.max(...xarr);
    const xmin = Math.min(...xarr);
    const ymax = Math.max(...yarr);
    const ymin = Math.min(...yarr);
    if (ymin + d.y < 0 || ymax + d.y > 10 || xmin + d.x < 0 || xmax + d.x > 4) {
      return false;
    }

    let newpoint = [];
    data[selectedMove]?.points.map((item) => {
      const newx = item.x + d.x;
      const newy = item.y + d.y;
      newpoint = [...newpoint, { x: newx, y: newy }];
      return true;
    });

    setData((s = []) => {
      s[selectedMove].points = newpoint;
      return [
        ...s.slice(0, selectedMove),
        s[selectedMove],
        ...s.slice(selectedMove + 1),
      ];
    });
  };

  return (
    <>
      <div className="shapes-wrapper">
        <div className="shapes">
          <div className="nextbtn" onClick={() => handlenbtnClick(true)}>
            <img src={nextl} alt="leftbutton" />
          </div>
          <div className="selected-shape">
            <img
              src={SHAPE_DATA?.[selectedAdd]?.img ?? ""}
              alt={SHAPE_DATA?.[selectedAdd]?.name ?? ""}
            />
          </div>
          <div className="nextbtn" onClick={() => handlenbtnClick(false)}>
            <img src={nextr} alt="rightbutton" />
          </div>
        </div>
        <button className="submitbtn" onClick={handleSubmit}>
          Submit
        </button>
        <div className="ctrlbtn-wrapper">
          <button className="ctrlbtn" onClick={() => handleMove("up")}>
            Up
          </button>
          <button className="ctrlbtn" onClick={() => handleMove("left")}>
            Left
          </button>
          <button className="ctrlbtn" onClick={() => handleMove("right")}>
            Right
          </button>
          <button className="ctrlbtn" onClick={() => handleMove("down")}>
            Down
          </button>
          <button
            className="ctrlbtn"
            onClick={() => handleSelectMove("previous")}
          >
            Prev
          </button>
          <button className="ctrlbtn" onClick={() => handleSelectMove("next")}>
            Next
          </button>
        </div>
      </div>
      <div className="playground">
        <Playground data={groundData} />
      </div>
      <div className="getsolutionscontainer">
        <button className="submitbtn" onClick={getSolutions}>
          Get solutions
        </button>
        <button className="submitbtn" onClick={stopSolutions}>
          Stop
        </button>
      </div>
      {
        solutions.length > 0 && <div>
          <h1>Solutions</h1>
          <h3>Total solutions found: {solutions.length}</h3>

          <table>
            {
              [...Array(Math.ceil(solutions.length/solutionsPerRow))].map((row, rowI) => (
                <tr>
                  {
                    solutions.slice((rowI*solutionsPerRow), ((rowI+1)*solutionsPerRow)).map(solution => (
                      <td className="solcontainer">
                        {
                          [...Array(5)].map((row, rowI) => (
                            <div key={rowI} className="row">
                              {
                                [...Array(11)].map((col, colI) => (
                                  <div key={colI} className={`cell ${SHAPE_COLOR[solution[colI][rowI]]}`}></div>
                                ))
                              }
                            </div>
                          ))
                        }
                      </td>
                    ))
                  }
                </tr>
              ))
            }
          </table>
        </div>
      }
    </>
  );
}

export default PolysphereUI;
