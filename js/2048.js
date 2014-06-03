$(document).keydown(function(e){
	GameManager.keydown(e);
});

$( document ).ready(function() {
	$('#button-new-game').click(function() {

        GameManager.startNewGame();
        $('#gameover').fadeOut({
            duration:1000,
            complete: function() {
                GameManager.isGameOver = false;
            }
        });
	});

    // GameManager.startNewGame();
});

var GameManager = {
    isGameOver: false,
    startNewGame: function() {
        $('#game').find('.row').find('.cell').empty();
        this.insertNewNumber();
        this.insertNewNumber();
        this.isGameOver = false;
    },
    insertNewNumber: function(){
        var emptyCells = this.getEmptyCells();
        var cellIndex = Helper.randomIntFromInterval(0, emptyCells.length-1);
        var cell = emptyCells[cellIndex];
        cell.number = Helper.randomIntFromInterval(0, 1) * 2 + 2;
        CellManager.show(cell.row, cell.column, cell.number);
    },
    getEmptyCells: function() {
        var emptyCells = [];
        for(var row = 0; row < 4; row++) {
            for(var column = 0; column < 4; column++) {
                if(!CellManager.getBoxInCell(row, column)){
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
        if(this.isGameOver || $(":animated").length != 0) {
            return;
        }
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
    },

    doActionKeydown: function(isRow, targetCellIndex) {
        if(isRow) {
            var rowIndexManager = (targetCellIndex == 0) ? 1 : -1;
        } else {
            var columnIndexManager = (targetCellIndex == 0) ? 1 : -1;
        }

        var anyMove = false;
        var cells;
        for(var i = 0; i < 4; i++){
            if(isRow) {
                cells = this.getOrderedRow(targetCellIndex, rowIndexManager, i, 0);    
            } else {
                cells = this.getOrderedRow(i, 0, targetCellIndex, columnIndexManager);
            }
            var moved = this.move(cells);
            anyMove = anyMove || moved;
        }
        this.doAfterMove(anyMove);
    },

    doAfterMove: function(anyMove) {
        if(anyMove) {
            var self = this;
            $(":animated").promise().done(function() {
                self.insertNewNumber();
            });            
        } else {
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
                num: CellManager.getNumberInCell(row, column)
            });
            row += rowIndexManager;
            column += columnIndexManager;
        }
        return cells;
    },

    move: function(cells) {
        var moved = false;
        for(var currIndex = 0; currIndex< 3; currIndex++){

            var currRow = cells[currIndex].row;
            var currColumn = cells[currIndex].column;
            var currNum = cells[currIndex].num;

            for(var firstNextIndex=currIndex+1; firstNextIndex<4; firstNextIndex++) {

                if(cells[firstNextIndex].num) {

                    var firstNextRow = cells[firstNextIndex].row;
                    var firstNextColumn = cells[firstNextIndex].column;
                    var firstNextNum = cells[firstNextIndex].num;

                    if(currNum && currNum != firstNextNum) {
                        break;
                    } else if(!currNum) {
                        var secondNextRow = undefined;
                        var secondNextColumn = undefined;
                        var secondNextNum = undefined;
                        var secondNextIndex = firstNextIndex+1;

                        while(secondNextIndex < 4) {
                            if(cells[secondNextIndex].num) {
                                secondNextRow = cells[secondNextIndex].row;
                                secondNextColumn = cells[secondNextIndex].column;
                                secondNextNum = cells[secondNextIndex].num;
                                break;
                            }
                            secondNextIndex += 1;
                        }
                    }

                    if(firstNextNum == secondNextNum) {
                        moved = true;

                        cells[currIndex].num = cells[firstNextIndex].num * 2;
                        cells[firstNextIndex].num = undefined;
                        cells[secondNextIndex].num = undefined;

                        CellManager.moveBox(firstNextRow, firstNextColumn, firstNextNum, currRow, currColumn, cells[currIndex].num, true);
                        CellManager.moveBox(secondNextRow, secondNextColumn, secondNextNum, currRow, currColumn, cells[currIndex].num);
                    } else {
                        moved = true;

                        cells[currIndex].num = cells[firstNextIndex].num;
                        cells[firstNextIndex].num = undefined;

                        CellManager.moveBox(firstNextRow, firstNextColumn, firstNextNum, currRow, currColumn, currNum * 2);
                    }
                    break;
                }
            }
        }
        return moved;
    },
    isMovePossible: function() {
        var emptyCells = this.getEmptyCells();
        if(emptyCells.length == 0) {
            for(var row = 0; row < 4; row++) {
                for(var column = 0; column < 4; column++) {
                    var thisNumber = CellManager.getNumberInCell(row, column);
                    if(column < 3){
                        var rightNumber = CellManager.getNumberInCell(row, column + 1);
                        if(thisNumber == rightNumber) {
                            return true;
                        }
                    } 
                    if(row < 3) {                    
                        var bottomNumber = CellManager.getNumberInCell(row + 1, column);
                        if(thisNumber == bottomNumber) {
                            return true;
                        }
                    }
                }
            }
        } else {
            return true;
        }
        return false;
    },
    gameOver: function() {
        this.isGameOver = true;
        $('#gameover').fadeIn({duration:1000});

    }
}

var CellManager = {
	show: function(row, column, number) {
        var cell = this.getCell(row, column);
        cell.html(this.createBox(row, column, number));
	},
    getCell: function(row, column) {
        var cellId = '#' + row + column;
        return $('#game').find(cellId);
    },
    createBox: function(row, column, number) {
        if(number){
            var boxId = "box-" + row + "-" + column;
            return "<div " + "class='box " + boxId + " num-" + number + "'>" + number + "</div>"   
        } else {
            return "";
        }
    },
    getBoxInCell: function(row, column) {
        var box = this.getCell(row, column).find(".box");
        if(box.length == 1) {
            return box[0];
        }  else {
            return undefined;
        }
    },
    getNumberInCell: function(row, column) {
        var box = this.getBoxInCell(row, column);
        if(box) {
            return $(box).text().trim();
        }
    },   
    moveBox: function(fromRow, fromCol, fromNum, toRow, toCol, toNum, destroy) {
        // console.log("[" + fromRow + "," + fromCol + "] " + fromNum + " -> [" + toRow + "," + toCol + "] " + toNum );
        var classFrom = this.getClassNameForBox(fromRow, fromCol);
        var classTo= this.getClassNameForBox(toRow, toCol);

        var cellTo = this.getCell(toRow, toCol);

        var boxFrom = this.getBoxInCell(fromRow, fromCol);
        var boxTo = this.getBoxInCell(toRow, toCol);

        if(!toNum || destroy) {
            $(boxFrom).detach();
            if(!destroy) {
                $(boxFrom).appendTo($(cellTo));   
            }

            $(boxFrom).switchClass(classFrom, classTo, 
            {
                duration: 100,
                complete: function() {
                    $(boxTo).detach();
                }
            });
        } else {
            var self = this;
            $(boxFrom).switchClass(classFrom, classTo, {
                duration: 100, 
                complete: function() {
                    var newBox = self.createBox(toRow, toCol, toNum);
                    $(newBox).appendTo($(cellTo));
                    $(boxFrom).detach();
                    $(boxTo).detach();
                }
            });            
        }
    }, 
    getClassNameForBox: function(row, column) {
        return "box-" + row + "-" + column;
    }
}

var Helper = {
    randomIntFromInterval: function(min,max){
       return Math.floor(Math.random()*(max-min+1)+min);
    },
}