import { render, screen } from "@testing-library/react";
import { ShapeGrid } from '../components/ShapeGrid';
import { AllTabs } from '../components/AllTabs';

test('Check load 4 tabs', () => {
  const tabs = ["Tab 1", "Tab 2", "Tab 3", "Tab 4"];
  const { container } = render(<AllTabs tabs={tabs} selectedTab={0} setSelectedTab={() => {}} />);
  expect(container.children[0].children[0].children[0].children.length).toBe(4);
})

test('Check load 3 tabs', () => {
  const tabs = ["Tab 1", "Tab 2", "Tab 3"];
  const { container } = render(<AllTabs tabs={tabs} selectedTab={0} setSelectedTab={() => {}} />);
  expect(container.children[0].children[0].children[0].children.length).toBe(3);
})

test('Always loads 12 shape blocks', () => {
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

  const { container } = render(<ShapeGrid
    selectedShape={0}
    setSelectedShape={() => {}}
    getMaxRow={getMaxRow}
    getMaxColumn={getMaxColumn}
    isPositionInShape={isPositionInShape}
    addToPyramid={() => {}}
    removeFromPyramid={() => {}}
  />)
  expect(container.getElementsByClassName('shape-container').length).toBe(12);
})
