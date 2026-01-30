import { BingoSquare, WinningLine } from '../types';

/**
 * Check all possible winning lines (rows, columns, diagonals)
 * Returns the winning line if found, null otherwise
 */
export function checkForBingo(squares: BingoSquare[][]): WinningLine | null {
  // Check rows
  for (let row = 0; row < 5; row++) {
    if (squares[row].every(sq => sq.isFilled)) {
      return {
        type: 'row',
        index: row,
        squares: squares[row].map(sq => sq.id),
      };
    }
  }

  // Check columns
  for (let col = 0; col < 5; col++) {
    const columnFilled = squares.every(row => row[col].isFilled);
    if (columnFilled) {
      return {
        type: 'column',
        index: col,
        squares: squares.map(row => row[col].id),
      };
    }
  }

  // Check main diagonal (top-left to bottom-right)
  const mainDiagonal = [0, 1, 2, 3, 4].map(i => squares[i][i]);
  if (mainDiagonal.every(sq => sq.isFilled)) {
    return {
      type: 'diagonal',
      index: 0,
      squares: mainDiagonal.map(sq => sq.id),
    };
  }

  // Check anti-diagonal (top-right to bottom-left)
  const antiDiagonal = [0, 1, 2, 3, 4].map(i => squares[i][4 - i]);
  if (antiDiagonal.every(sq => sq.isFilled)) {
    return {
      type: 'diagonal',
      index: 1,
      squares: antiDiagonal.map(sq => sq.id),
    };
  }

  return null;
}
