import { useState, useEffect } from 'react';

import { SHAPE_DATA } from './constants/shapedata';

import { Sphere } from './Sphere';

import { solve, stopSolve, flipPoints, rotatePoints } from './pyramid';

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stage } from "@react-three/drei";

import { Box, Grid, IconButton, Tooltip, Typography, Snackbar, Alert } from "@mui/material";

import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import AddIcon from '@mui/icons-material/Add';
import NorthIcon from '@mui/icons-material/North';
import SouthIcon from '@mui/icons-material/South';
import EastIcon from '@mui/icons-material/East';
import WestIcon from '@mui/icons-material/West';
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDown';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import FlipIcon from '@mui/icons-material/Flip';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import HeightIcon from '@mui/icons-material/Height';

import '@fontsource/barriecito/400.css';

import './assets/css/style.css';

let worker = null;

function PyramidUI() {

  const [pyramid, setPyramid] = useState([]);
  const [blockPositions, setBlockPositions] = useState(new Array(12).fill([]));
  const [blockRotationsFlips, setBlockRotationsFlips] = useState(new Array(12).fill([]));

  const [selectedShape, setSelectedShape] = useState(-1);

  const [inProgress, setInProgress] = useState(false);
  const [solutions, setSolutions] = useState([]);
  const [solutionIndex, setSolutionIndex] = useState(-1);

  const [stretch, setStretch] = useState(1);

  const [notification, setNotification] = useState("");
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (solutions.length > 0) {
      setPyramid(solutions[solutionIndex]);
    }
  }, [solutionIndex, solutions]);

  useEffect(() => {
    setPyramid(prevPyramid => {
      let newPyramid = [];
      for (let x=0; x<5; x++){
        let row = [];
        for (let y=0; y<5; y++){
          let col = [];
          for (let z=0; z<5; z++){
            if (isPresentInPyramid(x, y, z)) {
              col.push(0);
            }
            else {
              col.push(-1);
            }
          }
          row.push(col);
        }
        newPyramid.push(row);
      }

      for (let i=0; i<blockPositions.length; i++) {
        if (blockPositions[i].length !== 0) {
          let shape = SHAPE_DATA.filter(s => s.name==="shape"+(i+1))[0];
          let shapePositions = shape.points.map(point => [point.y, 0, point.x]);
          blockRotationsFlips[i].forEach(rotationFlip => {
            if (rotationFlip.charAt(0) === "r") {
              shapePositions = rotatePoints(shapePositions, rotationFlip.charAt(1));
            }
            else {
              shapePositions = flipPoints(shapePositions, rotationFlip.charAt(1));
            }
          });

          shapePositions = shapePositions.map(pos => [pos[0] + blockPositions[i][0], pos[1] + blockPositions[i][1], pos[2] + blockPositions[i][2]])

          for (let j=0; j<shapePositions.length; j++) {
            newPyramid[shapePositions[j][0]][shapePositions[j][1]][shapePositions[j][2]] = (i+1).toString();
          }
        }
      }
      return newPyramid;
    });
  }, [blockPositions, blockRotationsFlips]);

  const isPresentInPyramid = (row, col, height) => {
    if (row < 0 || col < 0 || height < 0) {
      return false;
    }
    return row <= 4-col && height <= 4-col;
  }

  const getMaxRow = points => {
    let max = -10;
    for(let i=0; i<points.length; i++) {
      if (parseInt(points[i].x) >= max) {
        max = points[i].x;
      }
    }
    return max;
  }

  const getMaxColumn = points => {
    let max = -10;
    for(let i=0; i<points.length; i++) {
      if (parseInt(points[i].y) >= max) {
        max = points[i].y;
      }
    }

    return max;
  }

  const isPositionInShape = (points, x, y) => {
    for (let i=0; i<points.length; i++) {
      if (parseInt(points[i].x) === parseInt(x) && parseInt(points[i].y) === parseInt(y)) {
        return true;
      }
    }
    return false;
  }

  const removeFromPyramid = blockID => {
    let indexInBlockPositions = parseInt(blockID) - 1;
    setBlockPositions(prevBlockPositions => {
      let newBlockPositions = [];
      for(let i=0; i<prevBlockPositions.length; i++) {
        if (i === indexInBlockPositions) {
          newBlockPositions.push([]);
        }

        else {
          newBlockPositions.push([...prevBlockPositions[i]]);
        }
      }
      return newBlockPositions;
    })
  }

  const addToPyramid = shapeID => {
    let indexInBlockPositions = parseInt(shapeID) - 1;
    setBlockPositions(prevBlockPositions => {
      let newBlockPositions = [];
      for(let i=0; i<prevBlockPositions.length; i++) {
        if (i === indexInBlockPositions) {
          if (canShapeBePlaced(shapeID, [0, 0, 0], [])) {
            newBlockPositions.push([0, 0, 0]);
          }
          else {
            setNotification("Shapes cannot be overlapped. Try again.");
            setShowNotification(true);
            newBlockPositions.push([...prevBlockPositions[i]]);
          }

        }

        else {
          newBlockPositions.push([...prevBlockPositions[i]]);
        }
      }
      return newBlockPositions;
    })
  }

  const canShapeBePlaced = (shapeID, position, rotationFlips) => {
    const shape = SHAPE_DATA.filter(s => s.name==="shape"+shapeID)[0];

    let newPositions = shape.points.map(point => [point.y, 0, point.x]);
    rotationFlips.forEach(rotationFlip => {
      if (rotationFlip.charAt(0) === "r") {
        newPositions = rotatePoints(newPositions, rotationFlip.charAt(1));
      }
      else {
        newPositions = flipPoints(newPositions, rotationFlip.charAt(1));
      }
    });

    newPositions = newPositions.map(newPosition=> [newPosition[0]+position[0], newPosition[1]+position[1], newPosition[2]+position[2]]);
    for (let i=0; i<newPositions.length; i++) {
      let position = newPositions[i];
      if (position[0] < 0 || position[0] > 4 || position[1] < 0 || position[1] > 4 || position[2] < 0 || position[2] > 4){
        return false;
      }

      if (!isPresentInPyramid(position[0], position[1], position[2])) {
          return false;
      }

      if (parseInt(pyramid[position[0]][position[1]][position[2]]) !== 0 && parseInt(pyramid[position[0]][position[1]][position[2]]) !== shapeID) {
        return false;
      }
    }
    return true;
  }

  const rotateFlip = (rotateFlip, axis) => {
    setBlockRotationsFlips(prevBlockRotationsFlips => {
      let newBlockRotationsFlips = [];

      for (let i=0; i<prevBlockRotationsFlips.length; i++) {
        if (i === selectedShape-1) {
          if (canShapeBePlaced(selectedShape, blockPositions[i], blockRotationsFlips[i].concat([rotateFlip+axis,]))) {
            newBlockRotationsFlips.push([...prevBlockRotationsFlips[i], rotateFlip+axis]);
          }
          else {
            newBlockRotationsFlips.push([...prevBlockRotationsFlips[i]]);
          }
        }

        else {
          newBlockRotationsFlips.push([...prevBlockRotationsFlips[i]]);
        }
      }
      return newBlockRotationsFlips;
    })
  }

  const move = direction => {
    setBlockPositions(prevBlockPositions => {
      let newBlockPositions = [];
      let newPosition;

      for (let i=0; i<prevBlockPositions.length; i++) {
        if (i === parseInt(selectedShape)-1) {

          newPosition = [prevBlockPositions[i][0], prevBlockPositions[i][1], prevBlockPositions[i][2]];
          if (direction === "up") newPosition[2] = newPosition[2]-1;
          if (direction === "down") newPosition[2] = newPosition[2]+1;
          if (direction === "left") newPosition[0] = newPosition[0]-1;
          if (direction === "right") newPosition[0] = newPosition[0]+1;
          if (direction === "zup") newPosition[1] = newPosition[1]+1;
          if (direction === "zdown") newPosition[1] = newPosition[1]-1;

          if (canShapeBePlaced(selectedShape, newPosition, blockRotationsFlips[i])) {
            newBlockPositions.push([...newPosition]);
          }
          else {
            console.log("Cannot move block");
            newBlockPositions.push([...prevBlockPositions[i]]);
          }

        }
        else {
          newBlockPositions.push([...prevBlockPositions[i]]);
        }
      }

      return newBlockPositions;
    })
  }

  const applySolution = solutionNumber => {
    if (solutionNumber > 0 && solutionNumber < solutions.length) {
      setSolutionIndex(solutionNumber);
    }
  }

  const handleHideNotification = reason => {
    if (reason === 'clickaway') {
      return;
    }

    setNotification("");
    setShowNotification(false);
  }

  return (
    <Grid container>
      <Grid item container sm={12}>
        <Typography variant="h3" className="heading">
          Polysphere Puzzle
        </Typography>
      </Grid>
      <Grid item container gap={2} sm={4}>
        {
          SHAPE_DATA.map((shape, index) => (
            <Grid
              key={shape.name}
              item sm={3}
              className={`shape-container ${selectedShape === index+1 && "selected-container"}`}
              onClick={() => setSelectedShape(parseInt(shape.name.substr(5)))}
            >
              {
                Object.keys([...Array(getMaxRow(shape.points)+1)]).map(row => (
                  <Box className="shape-row" key={row}>
                    {
                      Object.keys([...Array(getMaxColumn(shape.points)+1)]).map(col => (
                        <Box key={row+""+col} className={`shape-cell ${isPositionInShape(shape.points, row, col) && shape.color}`}></Box>
                      ))
                    }
                  </Box>
                ))
              }
              <Box>
                <Tooltip title="Add to pyramid" arrow>
                  <IconButton size="small" onClick={() => addToPyramid(parseInt(shape.name.substr(5)))}>
                    <AddIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Remove from pyramid" arrow>
                  <IconButton size="small" onClick={() => removeFromPyramid(parseInt(shape.name.substr(5)))}>
                    <RemoveCircleOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>
          ))
        }
      </Grid>
      <Grid item sm={8}>
        <Box style={{height: "500px"}}>
          {
            solutions.length > 0 &&
            <Grid container justifyContent="flex-end">
              <Grid item sm={4}>
                { (solutionIndex+1) } of { solutions.length } solutions.
              </Grid>
            </Grid>
          }
          {
            pyramid.length > 0 && <Canvas camera={{fov:1, position:[-1, 1, 1], zoom:0.5}}>
              <OrbitControls />
              <Stage adjustCamera intensity={0.5} shadows="contact" environment="city">
                {
                  Object.keys([...Array(5)]).map(x => (
                    Object.keys([...Array(5)]).map(y => (
                      Object.keys([...Array(5)]).map(z => (
                        pyramid[x][y][z] !== -1 &&
                        <Sphere
                          key={x.toString()+y+z}
                          position={[x*1.75+y*0.875, y*1.75*stretch, z*1.75+y*0.875]}
                          blockID={pyramid[x][y][z]}
                          color={pyramid[x][y][z] === 0 ? "empty" : SHAPE_DATA[pyramid[x][y][z]-1].color}
                        />
                      ))
                    ))
                  ))
                }
              </Stage>
            </Canvas>
          }
        </Box>
        <Grid container>
          <Grid item sm={4}>
            <Grid container justifyContent="center">
              <Grid item sm={2}>
                <Tooltip title="Go up" arrow>
                  <IconButton size="small" onClick={() => move("up")}>
                    <NorthIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Grid>
            </Grid>
            <Grid container justifyContent="center">
              <Grid item sm={2}>
                <Tooltip title="Go left" arrow>
                  <IconButton size="small" onClick={() => move("left")}>
                    <WestIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Grid>
              <Grid item sm={2}>
                <Tooltip title="Go down" arrow>
                  <IconButton size="small" onClick={() => move("down")}>
                    <SouthIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Grid>
              <Grid item sm={2}>
                <Tooltip title="Go right" arrow>
                  <IconButton size="small" onClick={() => move("right")}>
                    <EastIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Grid>
            </Grid>
            <Grid container justifyContent="center">
              <Grid item sm={2}>
                <Tooltip title="Go a level above" arrow>
                  <IconButton size="small" onClick={() => move("zup")}>
                    <ArrowCircleUpIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Grid>
              <Grid item sm={2}>
                <Tooltip title="Go a level below" arrow>
                  <IconButton size="small" onClick={() => move("zdown")}>
                    <ArrowCircleDownIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Grid>
            </Grid>
          </Grid>
          <Grid item sm={4}>
            <Grid container justifyContent="center">
              <Grid item sm={2}>
                <Tooltip title="Rotate in x-axis" arrow>
                  <IconButton size="small" onClick={() => rotateFlip("r", "x")}>
                    <RotateLeftIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Grid>
              <Grid item sm={2}>
                <Tooltip title="Rotate in y-axis" arrow>
                  <IconButton size="small" onClick={() => rotateFlip("r", "y")}>
                    <RotateLeftIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Grid>
              <Grid item sm={2}>
                <Tooltip title="Rotate in z-axis" arrow>
                  <IconButton size="small" onClick={() => rotateFlip("r", "z")}>
                    <RotateLeftIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Grid>
            </Grid>
            <Grid container justifyContent="center">
              <Grid item sm={2}>
                <Tooltip title="Flip in x-axis" arrow>
                  <IconButton size="small" onClick={() => rotateFlip("f", "x")}>
                    <FlipIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Grid>
              <Grid item sm={2}>
                <Tooltip title="Flip in y-axis" arrow>
                  <IconButton size="small" onClick={() => rotateFlip("f", "y")}>
                    <FlipIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Grid>
              <Grid item sm={2}>
                <Tooltip title="Flip in z-axis" arrow>
                  <IconButton size="small" onClick={() => rotateFlip("f", "z")}>
                    <FlipIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Grid>
            </Grid>
          </Grid>
          <Grid item sm={4}>
            <Grid container justifyContent="center">
              <Grid item sm={2}>
                <Tooltip title="Expand puzzle" arrow>
                  <IconButton size="small" onClick={() => {
                    if (stretch === 2) setStretch(1);
                    if (stretch === 1) setStretch(2);
                  }}>
                    <HeightIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Grid>
              <Grid item sm={2}>
                {
                  inProgress
                  ?
                  <Tooltip title="Stop searching solutions" arrow>
                    <IconButton size="small" onClick={() => {
                      setInProgress(false);
                      worker = stopSolve(worker);
                    }}>
                      <StopCircleIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  :
                  <Tooltip title="Search solutions" arrow>
                    <IconButton size="small" onClick={() => {
                      setSolutions([]);
                      setInProgress(true);
                      worker = solve(pyramid, setSolutions, solutions.length, setNotification, setShowNotification);
                    }}>
                      <PlayCircleFilledIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                }
              </Grid>
            </Grid>
            {
              solutions.length > 1 && <Grid container justifyContent="center">
                <Grid item sm={2}>
                  <Tooltip title="Previous solution" arrow>
                    <IconButton size="small" onClick={() => applySolution(solutionIndex-1)}>
                      <ArrowLeftIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Grid>
                <Grid item sm={2}>
                  <Tooltip title="View a random solution" arrow>
                    <IconButton size="small" onClick={() => applySolution(Math.floor(Math.random() * solutions.length))}>
                      <ShuffleIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Grid>
                <Grid item sm={2}>
                  <Tooltip title="Next solution" arrow>
                    <IconButton size="small" onClick={() => applySolution(solutionIndex+1)}>
                      <ArrowRightIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Grid>
              </Grid>
            }
          </Grid>
        </Grid>
      </Grid>

      <Snackbar anchorOrigin={{vertical: 'top', horizontal: 'right'}} open={showNotification} autoHideDuration={6000} onClose={handleHideNotification}>
        <Alert onClose={handleHideNotification} severity="success" sx={{ width: '100%' }}>
          {notification}
        </Alert>
      </Snackbar>
    </Grid>
  )
}

export default PyramidUI;
