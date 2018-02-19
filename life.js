/**
 * An implementation of John Conway's game of life
 */


// an iteration of the algorithm
function step(grid){
	return grid.map((row, yIndex) => row.map((val, xIndex) => calcNext(xIndex, yIndex, grid)));	
}

// build an empty grid
function buildGrid(width, height){
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
// taking a short-cut by masking out all but the adjacent cells
function getNeighbors(x, y, grid){
	
	const prevRowNeighbors = y - 1 >= 0 ? grid[y - 1].map((val, index) => index >= x - 1 && index <= x + 1 ? val : 0) : [];
	const sameRowNeighbors = grid[y].map((val, index) => index === x + 1 || index === x - 1 ? val : 0); // exclude self
	const nextRowNeighbors = y + 1 < grid.length ? grid[y + 1].map((val, index) => index >= x - 1 && index <= x + 1 ? val : 0) : [];

	return [].concat(prevRowNeighbors).concat(sameRowNeighbors).concat(nextRowNeighbors);
}

// obvious
function sum(a, b){
	return parseInt(a) + parseInt(b);
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

exports.buildGrid = buildGrid;
exports.step = step;





