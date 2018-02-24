/**
 * An implementation of John Conway's game of life
 */

 /**
  * TODO:
  * 
  * - Decouple DOM writes from the game logic
  * - Improve performance! Rewriting the entire DOM every generation makes the fans spin at 60fps.
  * A reactive DOM would solve both of these problems
  * https://www.monterail.com/blog/2016/how-to-build-a-reactive-engine-in-javascript-part-1-observable-objects
  *
  * x Make the "world" "round" i.e. connect the first and last columns and rows. 
  *   Notice how a glider crystalizes into a static square at the edge of the grid.
  *
  * - Halt if stasis is reached?
  */

var DOMrows;

const glider = [
	[0, 1, 0],
	[0, 0, 1],
	[1, 1, 1]
];

// take x steps
function iterate(count, timeout, grid, callback){
	if (typeof grid === 'undefined') { 
		const grid = randomGrid(24, 24); 
	}
	if(count > 0){
		grid = step(grid);
		if (typeof callback === 'function') {
			callback(grid);
		}
		setTimeout( () =>{
			iterate(count - 1, timeout, grid, callback);
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

	return [].concat(prevRowNeighbors).concat(sameRowNeighbors).concat(nextRowNeighbors);
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



function buildDOM(grid){

	const DOMrows = [];

	for(let i = 0; i < grid.length; i++){
		let row = document.createElement('div');
		row.classList.add('row');

		let cells = grid[i].map((cell) => {
			const el = document.createElement('span');
			el.classList.add('cell');
			return el;
		});

		for(let j = 0; j < cells.length; j++){
			row.appendChild(cells[j]);
		}

		DOMrows.push(row);
	}

	return DOMrows;
}

function appendGrid(DOMrows){
	const app = document.getElementById('app');
	for(i = 0; i < DOMrows.length; i++){
		app.appendChild(DOMrows[i]);
	}
}

function updateDOM(grid){
	for (let i = 0; i < grid.length; i++){
		let row = grid[i];
		let DOMrow = DOMrows[i];
		for( let j = 0; j < row.length; j++ ){
			let cell = row[j];
			let DOMcell = DOMrow.getElementsByClassName('cell')[j];
			if( cell === 0 && DOMcell.classList.contains('live')){
				DOMcell.classList.remove('live');
			}
			else if (cell === 1 && !DOMcell.classList.contains('live')){
				DOMcell.classList.add('live');
			}
		}
	}
}

document.addEventListener('DOMContentLoaded', function(){
	const grid = randomGrid(24, 24);
	DOMrows = buildDOM(grid);
	appendGrid(DOMrows);
	iterate(1000, 100, grid, updateDOM);	
})();

// exports.randomGrid = randomGrid;
// exports.step = step;
// exports.iterate = iterate;




