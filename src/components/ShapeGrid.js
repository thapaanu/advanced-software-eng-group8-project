import { SHAPE_DATA } from '../constants/shapedata';

import { Grid, Box, Tooltip, IconButton } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

export const ShapeGrid = ({ selectedShape, setSelectedShape, getMaxRow, getMaxColumn, isPositionInShape, addToPyramid, removeFromPyramid }) => (
  <>{
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
  }</>
)
