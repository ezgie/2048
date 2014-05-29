$(document).keydown(function(e){
	CellManager.keydown(e);
});

$( document ).ready(function() {

	$('#button-new-game').click(function() {
		$('#game').find('.row').find('.cell').empty();
		CellManager.insertNewNumber();
		CellManager.insertNewNumber();
	});

});

var CellManager = {
	insertNewNumber: function(){
		emptyCells = [];
		for(var row = 0; row < 4; row++) {
			for(var column = 0; column < 4; column++) {
				if(!this.getNumberInCell(row, column)){
					emptyCells.push({
						row: row,
						column: column
					});
				}
			}
		}
		var cellIndex = this.randomIntFromInterval(0, emptyCells.length);
		var cell = emptyCells[cellIndex];
		cell.number = this.randomIntFromInterval(0, 1) * 2 + 2;
		this.show(cell);
	},

	randomIntFromInterval: function(min,max){
 	   return Math.floor(Math.random()*(max-min+1)+min);
	},
	getRandomCellForBegin: function() {
		var cell = {
			row: this.randomIntFromInterval(0, 3),
			column: this.randomIntFromInterval(0, 3),
			number: this.randomIntFromInterval(0, 1)
		}
		cell.number = cell.number * 2 + 2;
		return cell;
	},
	show: function(cell) {
		var cellId = '#' + cell.row + cell.column;
		var cellDiv = $('#game').find(cellId);
		// $(cellDiv).hide();
		$(cellDiv).html(cell.number);
		$(cellDiv).fadeIn("slow");
	},
	keydown: function(e) {
		switch(e.which) {
	        case 37: // left
	        console.log('left');
	        this.moveAllLines(false, 0);
	        break;

	        case 38: // up
	        console.log('up');
	        this.moveAllLines(true, 0);
	        break;

	        case 39: // right
	        console.log('right');
	        this.moveAllLines(false, 3);
	        break;

	        case 40: // down
	        console.log('down');
	        this.moveAllLines(true, 3);
	        break;

        	default: return;
    	}
    	e.preventDefault();
    },

    moveAllLines: function(isRow, targetCellIndex) {
    	if(isRow) {
    		var rowIndexManager = (targetCellIndex == 0) ? 1 : -1;
    		for(var i = 0; i < 4; i++){
    			var cells = this.getOrderedRow(targetCellIndex, rowIndexManager, i, 0);
    			cells = this.normalizeCells(cells);
    			cells = this.processMove(cells);
    			for(var j = 0; j < 4; j++){
    				this.show(cells[j]);
    			}
    			// console.log(cells);
    		}
    	} else {
    		var columnIndexManager = (targetCellIndex == 0) ? 1 : -1;
    		for(var i = 0; i < 4; i++){
    			var cells = this.getOrderedRow(i, 0, targetCellIndex, columnIndexManager);
    			cells = this.normalizeCells(cells);
    			cells = this.processMove(cells);
    			for(var j = 0; j < 4; j++){
    				this.show(cells[j]);
    			}
    			// console.log(cells);
    		}    		
    	}
    	this.insertNewNumber();

    },
    getOrderedRow: function(row, rowIndexManager, column, columnIndexManager) {
    	var cells = [];
    	for(var i = 0; i<4; i++) {
    		cells.push({
    			row: row,
    			column: column,
    			number: this.getNumberInCell(row, column)
    		});
    		row += rowIndexManager;
    		column += columnIndexManager;
    	}
    	return cells;
    },
    getNumberInCell: function(row, column) {
    	var cellId = '#' + row + column;
		return $('#game').find(cellId).text().trim();
    },

    normalizeCells: function(cells) {
    	console.log("move");
    	// console.log(cells);
    	for(var i = 0; i< 3; i++){
    		if(!cells[i].number) {
    			for(var j=i+1; j<4; j++) {
    				if(cells[j].number) {
    					cells[i].number = cells[j].number;
    					cells[j].number = "";
    					break;
    				}
    			}
    		}
    	}
    	return cells;
    },
    processMove: function(cells) {
    	for(var i = 0; i< 3; i++){
    		if(!cells[i].number) {
    			break;
    		} else if(cells[i].number == cells[i+1].number) {
    			cells[i].number *= 2;
    			cells[i+1].number = "";
    			cells = this.normalizeCells(cells);
    		} 
    	}
    	return cells;
    }
}