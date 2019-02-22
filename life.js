/**
 * An implementation of John Conway's game of life
 */

 /**
  * TODO:
  * 
  * x Decouple DOM writes from the game logic
  * x Improve performance! Rewriting the entire DOM every generation makes the fans spin at 60fps.
  * A reactive DOM would solve both of these problems
  * https://www.monterail.com/blog/2016/how-to-build-a-reactive-engine-in-javascript-part-1-observable-objects
  *
  * x Make the "world" "round" i.e. connect the first and last columns and rows. 
  *   Notice how a glider crystalizes into a static square at the edge of the grid.
  *
  * - Halt if stasis is reached? Find the most performant way to test array equality.
  *
  * - Create a way to manually toggle a cell on the canvas.
  */

const glider = [
	[0, 1, 0],
	[0, 0, 1],
	[1, 1, 1]
];

/* - - - - - - -
 *
 * SETTINGS
 *
 */

const CELL_HEIGHT = 6; //px
const CELL_WIDTH = 6; //px

const GRID_HEIGHT = 128; // cells
const GRID_WIDTH = 128; // cells

const TIMEOUT = 50; //ms
const COUNT = 10000; // iterations before stopping

/* - - - - - - - 
 *
 * Game logic
 *
 */

// take x steps
function iterate(count, timeout, grid, callback){
	if (typeof grid === 'undefined') { 
		const grid = randomGrid(GRID_HEIGHT, GRID_WIDTH); 
	}
	if(count > 0){
		const newGrid = step(grid);
		if (typeof callback === 'function') {
			callback(newGrid);
		}
		setTimeout( () =>{
			iterate(count - 1, timeout, newGrid, callback);
		}, timeout);
	}
	else{
		console.log('done!');
		return;
	}
}

// an iteration of the algorithm
function step(grid){
	return grid.map((row, yIndex) => row.map((val, xIndex) => calcNext(xIndex, yIndex, grid)));	
}

// build an empty grid
function randomGrid(width, height){
	const grid = [];
	for(let i = 0; i < height; i ++){
		let row = [];
		for(j = 0; j < width; j++){
			const val = Math.round(Math.random());
			row.push(val);
		}
		grid.push(row);
	}
	return grid;
}

// return the value of a grid cell by its x and y coordinates
function findByCoordinates(x, y, grid){
	return grid[y][x];
}

// create an array of the values of all neighboring cells in the 9-square surrounding the cell at x, y
function getNeighbors(x, y, grid){

	const prevRow = mod(y - 1, grid.length);
	const nextRow = mod(y + 1, grid.length);

	const prevCol = mod(x - 1, grid[y].length);
	const nextCol = mod(x + 1, grid[y].length);

	const prevRowNeighbors = [ grid[prevRow][prevCol], grid[prevRow][x], grid[prevRow][nextCol] ];
	const sameRowNeighbors = [ grid[y][prevCol], grid[y][nextCol] ];
	const nextRowNeighbors = [ grid[nextRow][prevCol], grid[nextRow][x], grid[nextRow][nextCol] ];

	return prevRowNeighbors.concat(sameRowNeighbors).concat(nextRowNeighbors);
}

// obvious
function sum(a, b){
	return parseInt(a) + parseInt(b);
}

// a modulo that works for both addition and subtraction
function mod(x, m){
	return ((x % m) + m) % m;
}


// sum the values of neighboring cells
function evalNeighbors(x, y, grid){
	return getNeighbors(x, y, grid).reduce(sum);
}

// apply the rules of the game to the cell and return its next value 
function calcNext(x, y, grid){
	const totalNeighbors = evalNeighbors(x, y, grid);
	if( !findByCoordinates(x, y, grid) && totalNeighbors === 3) return 1;
	if (totalNeighbors < 2) return 0;
	if (totalNeighbors === 2 || totalNeighbors === 3) return findByCoordinates(x, y, grid);
	else{
		return 0;
	}
}

// manually change a cell's value
function toggleCell(){
	cell = !cell
}

/* - - - - - - - - - -
 *
 * DOM manipulation
 *
 */

var DOMCells; // keep a reference of the cell elements

function createDOMCells(grid){
	const rows = [];

	for(let i = 0; i < grid.length; i++){
		let row = []

		let cells = grid[i].map((cell) => {
			const el = document.createElement('span');
			el.classList.add('cell');
			return el;
		});

		for(let j = 0; j < cells.length; j++){
			row.push(cells[j]);
		}

		rows.push(row);
	}
	return rows;
}

function appendGrid(DOMCells){
	const DOMRows = createDOMRows(DOMCells)
	const app = document.getElementById('app');
	for(i = 0; i < DOMRows.length; i++){
		app.appendChild(DOMRows[i]);
	}

	function createDOMRows(DOMCells){
		const rows = DOMCells.map((row, index) => {
			var el = document.createElement('div');
			el.classList.add('row')
			for(i = 0; i < row.length; i++){
				el.appendChild(row[i]);
			}
			return el;
		});
	
		return rows;
	}
}

function updateDOM(grid){
	for (let i = 0; i < grid.length; i++){
		let row = grid[i];
		let DOMrow = DOMCells[i];
		for( let j = 0; j < row.length; j++ ){
			let cell = row[j];
			let DOMcell = DOMrow[j];
			if( cell === 0 && DOMcell.classList.contains('live')){
				DOMcell.classList.remove('live');
			}
			else if (cell === 1 && !DOMcell.classList.contains('live')){
				DOMcell.classList.add('live');
			}
		}
	}
}

/** - - - - - - - - - - - -
 *
 * Canvas manipulation
 *
 */

 var ctx;

function drawCell(ctx, x, y, w, h, fill){
	ctx.beginPath();
	ctx.fillStyle = fill;
	ctx.rect(x, y, w, h);
	ctx.fill();
}

function drawGrid(ctx, grid, cellSize){

	const height = grid.length * cellSize;
	const width = grid[0].length * cellSize;

	for(let i = 0; i <= grid.length; i++){
		let yPos = i * cellSize + 1;
		drawHorizontal(ctx, yPos, width);
	}

	for( let j = 0; j <= grid[0].length; j++ ){
		let xPos = j * cellSize + 1;
		drawVertical(ctx, xPos, height);
	}
}

function drawLine(ctx, startX, startY, endX, endY){
	ctx.strokeStyle = 'rgb(100, 100, 100)';
	ctx.lineWidth = .125;
	ctx.beginPath();
	ctx.moveTo(startX, startY);
	ctx.lineTo(endX, endY);
	ctx.stroke();
}

function drawHorizontal(ctx, yPos, length){
	drawLine(ctx, 0, yPos, length, yPos);
}

function drawVertical(ctx, xPos, length){
	drawLine(ctx, xPos, 0, xPos, length);
}

function updateCanvas(grid){
	const cellWidth = CELL_WIDTH;
	const cellHeight = CELL_HEIGHT;
	const canvasHeight = (cellWidth + 1) * grid.length;
	const canvasWidth = (cellWidth + 1) * grid[0].length;


	ctx.clearRect(0, 0, canvasHeight, canvasWidth);
	drawGrid(ctx, grid, cellWidth);

	for( let i = 0; i < grid.length; i++ ){
		let row = grid[i];
		for( let j = 0; j < row.length; j++ ){
			let x = j * cellWidth + 1;
			let y = i * cellWidth + 1;
			let fill = row[j] ? 'rgb(0, 0, 0)' : 'rgb(255, 255, 255)';
			if(row[j]){
				drawCell(ctx, x, y, cellWidth, cellHeight, fill);
			}
		}
	}
}





/** - - - - - - - - 
 *
 * Run in browser 
 *
 */

 function startDOMGame(){
 	const grid = randomGrid(24, 24);
	DOMCells = createDOMCells(grid);
	appendGrid(DOMCells);
	iterate(1000, 100, grid, updateDOM);	
 }

 function startCanvasGame(){
 	const grid = randomGrid(GRID_WIDTH, GRID_HEIGHT);
 	ctx = document.getElementById('canvasApp').getContext('2d');
 	iterate(COUNT, TIMEOUT, grid, updateCanvas);
 }

document.addEventListener('DOMContentLoaded', function(){
	// startDOMGame();
	startCanvasGame();
});

// exports.randomGrid = randomGrid;
// exports.step = step;
// exports.iterate = iterate;




