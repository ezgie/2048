$(document).keydown(function(e){
	GameManager.keydown(e);
});

$( document ).ready(function() {
	$('#button-new-game').click(function() {
        GameManager.startNewGame();
	});

    GameManager.startNewGame();
});

var GameManager = {
    startNewGame: function() {
        $('#game').find('.row').find('.cell').empty();
        this.insertNewNumber();
        this.insertNewNumber();
    },
    insertNewNumber: function(){
        var emptyCells = this.getEmptyCells();
        var cellIndex = Helper.randomIntFromInterval(0, emptyCells.length-1);
        var cell = emptyCells[cellIndex];
        cell.number = Helper.randomIntFromInterval(0, 1) * 2 + 2;
        CellManager.show(cell);
    },
    getEmptyCells: function() {
        var emptyCells = [];
        for(var row = 0; row < 4; row++) {
            for(var column = 0; column < 4; column++) {
                if(!CellManager.getNumberInCell(row, column)){
                    emptyCells.push({
                        row: row,
                        column: column
                    });
                }
            }
        }
        return emptyCells;
    },
    keydown: function(e) {
        switch(e.which) {
            case 37: // left
            this.doActionKeydown(false, 0);
            break;

            case 38: // up
            this.doActionKeydown(true, 0);
            break;

            case 39: // right
            this.doActionKeydown(false, 3);
            break;

            case 40: // down
            this.doActionKeydown(true, 3);
            break;

            default: return;
        }
        e.preventDefault();
    },

    doActionKeydown: function(isRow, targetCellIndex) {
        if(isRow) {
            var rowIndexManager = (targetCellIndex == 0) ? 1 : -1;
        } else {
            var columnIndexManager = (targetCellIndex == 0) ? 1 : -1;
        }

        var anyChanges = false;
        for(var i = 0; i < 4; i++){
            if(isRow) {
                var cells = this.getOrderedRow(targetCellIndex, rowIndexManager, i, 0);    
            } else {
                var cells = this.getOrderedRow(i, 0, targetCellIndex, columnIndexManager);
            }     
            var cellsBeforeKeydown = JSON.parse(JSON.stringify(cells));   
            var cells = this.normalizeCells(cells);
            var cells = this.processMove(cells);
            for(var j = 0; j < 4; j++){
                CellManager.show(cells[j]);
            }
            anyChanges = anyChanges || this.isListChanged(cellsBeforeKeydown, cells);
        }
        if(anyChanges) {
            this.insertNewNumber();
        } else {
            console.log("isMovePossible : " + this.isMovePossible());
            if(!this.isMovePossible()){
                this.gameOver();
            }
        }
    },
    getOrderedRow: function(row, rowIndexManager, column, columnIndexManager) {
        var cells = [];
        for(var i = 0; i<4; i++) {
            cells.push({
                row: row,
                column: column,
                number: CellManager.getNumberInCell(row, column)
            });
            row += rowIndexManager;
            column += columnIndexManager;
        }
        return cells;
    },

    normalizeCells: function(cells) {
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
    },
    isListChanged: function(cellsBeforeKeydown, cells) {
        for(var i = 0; i < 4; i++) {
            if(cellsBeforeKeydown[i].number != cells[i].number) {
                return true;
            }
        }
        return false;
    },
    isMovePossible: function() {
        var emptyCells = this.getEmptyCells();
        if(emptyCells.length == 0) {
            for(var row = 0; row < 3; row++) {
                for(var column = 0; column < 3; column++) {
                    var thisNumber = CellManager.getNumberInCell(row, column);
                    var rightNumber = CellManager.getNumberInCell(row, column + 1);
                    var bottomNumber = CellManager.getNumberInCell(row + 1, column);
                    if(thisNumber == rightNumber || thisNumber == bottomNumber) {
                        return true;
                    }
                }
            }
        } else {
            return true;
        }
        return false;
    },
    gameOver: function() {
        alert("TODO - gameOver");
    }
}

var CellManager = {
	show: function(cell) {
		var cellId = '#' + cell.row + cell.column;
		var cellDiv = $('#game').find(cellId);
		// $(cellDiv).hide();
		$(cellDiv).html(cell.number);
		$(cellDiv).fadeIn("slow");
	},

    getNumberInCell: function(row, column) {
    	var cellId = '#' + row + column;
		return $('#game').find(cellId).text().trim();
    }
}

var Helper = {
    randomIntFromInterval: function(min,max){
       return Math.floor(Math.random()*(max-min+1)+min);
    },
}