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
        if($(":animated").length != 0) {
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
        e.preventDefault();
    },

    doActionKeydown: function(isRow, targetCellIndex) {
        if(isRow) {
            var rowIndexManager = (targetCellIndex == 0) ? 1 : -1;
        } else {
            var columnIndexManager = (targetCellIndex == 0) ? 1 : -1;
        }

        var anyMove = false;
        for(var i = 0; i < 4; i++){
            if(isRow) {
                var cells = this.getOrderedRow(targetCellIndex, rowIndexManager, i, 0);    
            } else {
                var cells = this.getOrderedRow(i, 0, targetCellIndex, columnIndexManager);
            }
            var moved = this.move(cells);
            anyMove = anyMove || moved;
        }
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
        var isAlreadyMerged = false;
        for(var currIndex = 0; currIndex< 3; currIndex++){

            var currRow = cells[currIndex].row;
            var currColumn = cells[currIndex].column;
            var currNum = cells[currIndex].num;

            if(currNum && isAlreadyMerged) {
                continue;
            } else {
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

                            if(!isAlreadyMerged && firstNextIndex < 3) {

                                secondNextIndex = firstNextIndex+1;
                                while(secondNextIndex < 4) {
                                    if(cells[secondNextIndex].num) {
                                        secondNextRow = cells[secondNextIndex].row;
                                        secondNextColumn = cells[secondNextIndex].column;
                                        secondNextNum = cells[secondNextIndex].num;

                                        if(secondNextNum == firstNextNum) {
                                            break;
                                        }
                                        
                                    }
                                    secondNextIndex += 1;
                                }
                            }
                        }
                        if(firstNextNum == secondNextNum) {
                            cells[currIndex].num = cells[firstNextIndex].num * 2;
                            cells[firstNextIndex].num = undefined;
                            cells[secondNextIndex].num = undefined;
                            isAlreadyMerged = true;

                            moved = true;
                            CellManager.moveBox(firstNextRow, firstNextColumn, firstNextNum, currRow, currColumn, cells[currIndex].num, true);
                            CellManager.moveBox(secondNextRow, secondNextColumn, secondNextNum, currRow, currColumn, cells[currIndex].num);
                            
                            break;
                        } else {
                            
                            cells[currIndex].num = cells[firstNextIndex].num;
                            cells[firstNextIndex].num = undefined;
                            moved = true;
                            CellManager.moveBox(firstNextRow, firstNextColumn, firstNextColumn, currRow, currColumn, currNum * 2);

                            break;
                        }
                    }
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
        alert("TODO - gameOver");
    }
}

var CellManager = {
    getCellDiv: function(row, column) {
        var cellId = '#' + row + column;
        return $('#game').find(cellId);
    },
	show: function(row, column, number) {
        var cellDiv = this.getCellDiv(row, column);
        cellDiv.html(this.getBox(row, column, number));
	},
    getBox: function(row, column, number) {
        //REFACTOR
        if(number){
            var boxId = "box-" + row + "-" + column;
            return "<div " + "class='box " + boxId + " num-" + number + "'>" + number + "</div>"   
        } else {
            return "";
        }
    },
    getBoxForClass: function(row, column, number) {
        //RENAME TO GETBOX
        var boxId = "box-" + row + "-" + column;
        return "<div " + "class='box " + boxId + " num-" + number + "'>" + number + "</div>";
    },
    getBoxInCell: function(row, column) {
    	var cellId = '#' + row + column;
        var box = $('#game').find(cellId).find(".box");
        if(box.length == 1) {
            return box[0];
        }  else {
            return undefined;
        }
    },
    getNumberInCell: function(row, column) {
        var cellId = '#' + row + column;
        var box = this.getBoxInCell(row, column);
        if(box) {
            return $(box).text().trim();
        }
    },
    detachBox: function(row, column) {
        var box = this.getBoxInCell(row, column);
        $(box).detach();
    },
    attachBox: function(row, column, box) {
        var cellDiv = this.getCellDiv(row, column);
        $(cellDiv).html(box);
        $(box).attr('class', 'box box-' + row + '-' + column);
    }, 
    moveBox: function(fromRow, fromCol, fromNum, toRow, toCol, toNum, destroy) {
        // console.log("[" + fromRow + "," + fromCol + "] " + fromNum + " -> [" + toRow + "," + toCol + "] " + toNum );
        var classFrom = this.getClassNameForBox(fromRow, fromCol);
        var classTo= this.getClassNameForBox(toRow, toCol);

        var cellFrom = this.getCellDiv(fromRow, fromCol);
        var cellTo = this.getCellDiv(toRow, toCol);

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
                        var newBox = self.getBoxForClass(toRow, toCol, toNum);
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