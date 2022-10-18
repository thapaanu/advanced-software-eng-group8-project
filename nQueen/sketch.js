let canvasSize = 600;
let rows ;
let cellSize = 25;
let img;
let grid = [];
let controlSize;

function workSetup(){

    grid = [];
    resizeCanvas(canvasSize,canvasSize);
    cellSize = canvasSize/rows;
    
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < rows; j++) {
            grid.push(new Cell(i, j));
        }
    }    
    let j = new solver(rows,grid);   
    j.solve(0)
   
    redraw();
}
function setup() {
    createCanvas(10, 10);
    controlSize = QuickSettings.create(150,200,"Enter the number of Queens between 4 to 21");
    
    controlSize.addNumber("BoardSize", 4, 21, 1)
    controlSize.addButton("GO FOR IT",()=>{
        applySettings();
    });
    workSetup();                                   
    controlSize.setValue("BoardSize", 4);
    noLoop();        
}
function applySettings(){    
    let newBoardSize = controlSize.getValue("BoardSize");
    rows = newBoardSize;    
    workSetup();  
        controlSize.destroy();

}
function draw() {
    for (let z = 0; z < grid.length; z++) {
        grid[z].show();
    }
    noFill();
    rect(0, 0, canvasSize-1, canvasSize-1);
}


let Cell = function(row, col,colourMap) {
    
    this.Column = col;
    this.Row = row;
    this.value = false;            
    this.colourMap = colourMap;
    if (!colourMap){
            this.colourMap = {
                true: 'green',
                false: 'gray'
            }     
    }

    this.setValue = function(t) {
        this.value = t;
    }
    this.getValue = function(){
        return this.value;
    }

    this.show = function() {
        fill(this.getCellColour());
        rect(col * cellSize, row * cellSize, cellSize+1, cellSize+1); 
    }    

    this.getCellColour = function() {         
            return this.colourMap[this.getValue()]?this.colourMap[this.getValue()]: this.colourMap.true;                
    }
}