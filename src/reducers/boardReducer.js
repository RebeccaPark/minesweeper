import { InjectMineEnum } from '../constants/gameConstants';

import { BoardActions } from '../actions/BoardActions';
import { referenceToAdjacentCells } from '../utility/utility';

export function boardReducer (state, { type, payload }) {
  switch(type) {
    case BoardActions.INITIATE_BOARD:
      console.log('initiate board');
      return {
        ...state,
        minesLeft: payload.level.num_mine,
        gameOver: false,
        gameClear: false,
        board: resetBoard(payload.level),
        clickNumber: 1,
      };
    
    case BoardActions.INITIATE_DUMMY_BOARD:
      console.log('initiate dummy');
      return {
        ...state,
        clickNumber: 0,
        board: initiateEmptyBoard(state.level),
      }

    case BoardActions.UNCOVER_CELL:
      return {
        ...state,
        board: uncoverCell(state.board, payload.row, payload.column),
        gameClear: didGameClear(state.board, state.minesLeft),
      };

    case BoardActions.DOUBLE_CLICK_CELL:
      return {
        ...state,
        board: uncoverAdjacentCells(state.board, payload.row, payload.column),
        gameClear: didGameClear(state.board, state.minesLeft),
      };

    case BoardActions.RIGHT_CLICK_CELL:
      return {
        ...state,
        minesLeft: minesLeft(state.board, payload.row, payload.column, state.minesLeft),
        board: toggleFlagCell(state.board, payload.row, payload.column),
        //hmm....
        gameClear: didGameClear(state.board, minesLeft(state.board, payload.row, payload.column, state.minesLeft)),
      };

    case BoardActions.CHANGE_LEVEL:
      return {
        ...state,
        gameOver: false,
        level: payload.level,
        minesLeft: payload.level.num_mine,
        board: resetBoard(payload.level),
      };
    
    case BoardActions.GAME_OVER:
      return {
        ...state,
        gameOver: true,
      };

    default:
      throw new Error('No matching action type in reducer');
  }
}

function initiateEmptyBoard({ rows, columns, num_mine }) {
  return Array.from(
    Array(rows), () =>
    new Array(columns).fill({
      hasMine: false,
      isUncovered: false,
      numMinesAround: 0,
      flagged: false,
    })
    );
}

function populateMines(emptyBoard, numMine) {
  let numInjectedMines = 0;
  let tempBoard = JSON.parse(JSON.stringify(emptyBoard));

  let rowIndex = 0;

  while(numInjectedMines < numMine) {
    for(let i=0; i < emptyBoard[rowIndex].length; i++) {
      if(numInjectedMines === numMine) {
        break;
      }

      const shouldInjectMine = Math.floor(Math.random() * Math.floor(10));

      if(shouldInjectMine === InjectMineEnum.INJECT && 
        tempBoard[rowIndex][i].hasMine === false
        ) {
        tempBoard[rowIndex][i].hasMine = true;
        numInjectedMines++;
      }
    }
    
    if (rowIndex === emptyBoard.length - 1) {
      rowIndex = 0;
    } else {
      rowIndex++;
    }
  }
  return tempBoard;
}

function populateNumber(prevBoard) {
  for(let i=0; i <prevBoard.length; i++) {
    for(let j=0; j<prevBoard[i].length; j++) {
      const adjacentCells = referenceToAdjacentCells(prevBoard, i, j);
      let minesAround = 0;
      adjacentCells.forEach(({cell, row, column}) => {
        if(cell.hasMine) minesAround++;
      })

      prevBoard[i][j].numMinesAround = minesAround;
    }
  }
  console.log(prevBoard);
  return prevBoard;
};

function resetBoard(level) {
  let emptyBoard = initiateEmptyBoard(level);
  let boardWithMines = populateMines(emptyBoard, level.num_mine);
  return populateNumber(boardWithMines);
}

function minesLeft(board, row, column, minesLeft) {
  return board[row][column].flagged ? minesLeft + 1: minesLeft - 1
}

function uncoverCell(originalBoard, row, column) {
  const newBoard = JSON.parse(JSON.stringify(originalBoard));
  newBoard[row][column].isUncovered = true;
  if(newBoard[row][column].numMinesAround === 0 && !newBoard[row][column].hasMine) {
    return uncoverAdjacentCells(newBoard, row, column);
  }
  return newBoard;
}

function toggleFlagCell(originalBoard, row, column) {
  const newBoard = JSON.parse(JSON.stringify(originalBoard));
  newBoard[row][column].flagged = !newBoard[row][column].flagged;
  return newBoard
}

function uncoverAdjacentCells(originalBoard, row, column) {

  const memo = {};
  const stack = [{ cell: originalBoard[row][column], row, column }];

  while(stack.length > 0) {
    const centerCell = stack.pop();
    const surroundingCells = referenceToAdjacentCells(originalBoard, centerCell.row, centerCell.column);
    
    const flagsInAdjacentCells = surroundingCells.reduce((acc, currCell) => {
      if(currCell.cell.flagged) return acc + 1;
      return acc;
    }, 0);

    if (flagsInAdjacentCells < centerCell.cell.numMinesAround) return originalBoard;

    for (let cell of surroundingCells) {
      if(memo[`${cell.row}-${cell.column}`]) continue;
      else {
        memo[`${cell.row}-${cell.column}`] = true;
      }

      cell.cell.isUncovered = cell.cell.flagged ? false : true;

      if(cell.cell && !cell.cell.numMinesAround && !cell.cell.hasMine) {
        stack.push(cell);
      }
    }
  }

  return originalBoard;
};

function didGameClear(board, minesLeft) {
  if(minesLeft === 0) {
    for(let i=0; i < board.length; i++) {
      for(let j=0; j < board[0].length; j++) {
        if(!board[i][j].hasMine && !board[i][j].isUncovered) {
          console.log('here4');
          return false;
        }

        if(!board[i][j].hasMine && board[i][j].flagged) {
          console.log('here2');
          return false;
        }
      }
    }
    return true;
  }
  return false;
}