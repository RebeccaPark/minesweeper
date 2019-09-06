import React, { useState, useEffect } from 'react';
import './Game.css';

import { Board } from './components/Board';

import { ROWS, COLUMNS, NUM_MINE, InjectMineEnum } from './constants/gameConstants';

function Game() {
  const [board, setBoard] = useState([]);

  useEffect(() => {
    populateMines();
  }, []);

  function initiateEmptyBoard() {
    return Array.from(
      Array(ROWS), () =>
      new Array(COLUMNS).fill({
        hasMine: false,
        isUncovered: false,
        numMinesAround: 0,
      })
      );
  }

  function populateMines() {
    let emptyBoard = initiateEmptyBoard();

    let numInjectedMines = 0;
    let tempBoard = JSON.parse(JSON.stringify(emptyBoard));

    let rowIndex = 0;

    while(numInjectedMines < NUM_MINE) {
      for(let i=0; i < emptyBoard[rowIndex].length; i++) {
        if(numInjectedMines === NUM_MINE) {
          break;
        }

        const shouldInjectMine = Math.floor(Math.random() * Math.floor(Object.keys(InjectMineEnum).length));

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
    //setBoard(tempBoard);
    populateNumber(tempBoard)
  }

  function populateNumber(prevBoard) {
    for(let i=0; i <prevBoard.length; i++) {
      for(let j=0; j<prevBoard[i].length; j++) {
        let placesToCheck = ['topLeft', 'top', 'topRight', 'left', 'right', 'bottomLeft', 'bottom', 'bottomRight'];
        
        if(i === 0) {
          placesToCheck = getRidOf(placesToCheck, ['topLeft', 'top', 'topRight']);
        }
        
        if(j === 0) { 
          placesToCheck = getRidOf(placesToCheck, ['topLeft', 'left', 'bottomLeft']);
        }

        if(i === prevBoard.length - 1) {
          placesToCheck = getRidOf(placesToCheck, ['bottomLeft', 'bottom', 'bottomRight']);
        }

        if(j === prevBoard[i].length - 1) {
          placesToCheck = getRidOf(placesToCheck, ['topRight', 'right', 'bottomRight']);
        }

        let numberOfMinesAroundCell = 0;
        
        for(let k=0; k < placesToCheck.length; k++) {
          const currentPosition = placesToCheck[k];
          
          if ((currentPosition === 'topLeft' && prevBoard[i - 1][j - 1].hasMine) ||
              (currentPosition === 'top' && prevBoard[i -1][j].hasMine) ||
              (currentPosition === 'topRight' && prevBoard[i - 1][j + 1].hasMine) ||
              (currentPosition === 'left' && prevBoard[i][j-1].hasMine) ||
              (currentPosition === 'right' && prevBoard[i][j+1].hasMine) ||
              (currentPosition === 'bottomLeft' && prevBoard[i+1][j-1].hasMine) ||
              (currentPosition === 'bottom' && prevBoard[i+1][j].hasMine) ||
              (currentPosition === 'bottomRight' && prevBoard[i+1][j+1].hasMine)
          ) {
            numberOfMinesAroundCell++;
          }
        }

        prevBoard[i][j].numMinesAround = numberOfMinesAroundCell;
      }
    }

    setBoard(prevBoard);

    function getRidOf(originalArray, toEraseArray) {
      return originalArray.filter(element => !toEraseArray.includes(element));
    }
  }

  return(
    <div className="game">
      <Board board={board}/>
    </div>
  );
}

export default Game;
