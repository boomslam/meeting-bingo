import { describe, it, expect } from 'vitest';
import { checkForBingo } from '../bingoChecker';
import type { BingoSquare } from '../../types';

// Helper to create a test grid
function createGrid(filledPositions: [number, number][]): BingoSquare[][] {
  const grid: BingoSquare[][] = [];

  for (let row = 0; row < 5; row++) {
    grid[row] = [];
    for (let col = 0; col < 5; col++) {
      const isFreeSpace = row === 2 && col === 2;
      const isFilled = isFreeSpace || filledPositions.some(([r, c]) => r === row && c === col);

      grid[row][col] = {
        id: `${row}-${col}`,
        word: isFreeSpace ? 'FREE' : `word-${row}-${col}`,
        isFilled,
        isFreeSpace,
        row,
        col,
        isAutoFilled: false,
        filledAt: isFilled ? Date.now() : null,
      };
    }
  }

  return grid;
}

describe('checkForBingo', () => {
  describe('row wins', () => {
    it('detects row 0 win', () => {
      const filled: [number, number][] = [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]];
      const grid = createGrid(filled);
      const result = checkForBingo(grid);

      expect(result).not.toBeNull();
      expect(result?.type).toBe('row');
      expect(result?.index).toBe(0);
      expect(result?.squares).toHaveLength(5);
    });

    it('detects row 2 win (includes free space)', () => {
      // Row 2 includes the free space at (2,2) which is auto-filled
      const filled: [number, number][] = [[2, 0], [2, 1], [2, 3], [2, 4]];
      const grid = createGrid(filled);
      const result = checkForBingo(grid);

      expect(result).not.toBeNull();
      expect(result?.type).toBe('row');
      expect(result?.index).toBe(2);
    });

    it('detects row 4 win', () => {
      const filled: [number, number][] = [[4, 0], [4, 1], [4, 2], [4, 3], [4, 4]];
      const grid = createGrid(filled);
      const result = checkForBingo(grid);

      expect(result).not.toBeNull();
      expect(result?.type).toBe('row');
      expect(result?.index).toBe(4);
    });
  });

  describe('column wins', () => {
    it('detects column 0 win', () => {
      const filled: [number, number][] = [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]];
      const grid = createGrid(filled);
      const result = checkForBingo(grid);

      expect(result).not.toBeNull();
      expect(result?.type).toBe('column');
      expect(result?.index).toBe(0);
      expect(result?.squares).toHaveLength(5);
    });

    it('detects column 2 win (includes free space)', () => {
      // Column 2 includes the free space at (2,2)
      const filled: [number, number][] = [[0, 2], [1, 2], [3, 2], [4, 2]];
      const grid = createGrid(filled);
      const result = checkForBingo(grid);

      expect(result).not.toBeNull();
      expect(result?.type).toBe('column');
      expect(result?.index).toBe(2);
    });

    it('detects column 4 win', () => {
      const filled: [number, number][] = [[0, 4], [1, 4], [2, 4], [3, 4], [4, 4]];
      const grid = createGrid(filled);
      const result = checkForBingo(grid);

      expect(result).not.toBeNull();
      expect(result?.type).toBe('column');
      expect(result?.index).toBe(4);
    });
  });

  describe('diagonal wins', () => {
    it('detects main diagonal win (top-left to bottom-right)', () => {
      // (0,0), (1,1), (2,2), (3,3), (4,4) - free space at (2,2)
      const filled: [number, number][] = [[0, 0], [1, 1], [3, 3], [4, 4]];
      const grid = createGrid(filled);
      const result = checkForBingo(grid);

      expect(result).not.toBeNull();
      expect(result?.type).toBe('diagonal');
      expect(result?.index).toBe(0);
      expect(result?.squares).toHaveLength(5);
    });

    it('detects anti-diagonal win (top-right to bottom-left)', () => {
      // (0,4), (1,3), (2,2), (3,1), (4,0) - free space at (2,2)
      const filled: [number, number][] = [[0, 4], [1, 3], [3, 1], [4, 0]];
      const grid = createGrid(filled);
      const result = checkForBingo(grid);

      expect(result).not.toBeNull();
      expect(result?.type).toBe('diagonal');
      expect(result?.index).toBe(1);
      expect(result?.squares).toHaveLength(5);
    });
  });

  describe('no win conditions', () => {
    it('returns null for only 4 in a row', () => {
      const filled: [number, number][] = [[0, 0], [0, 1], [0, 2], [0, 3]];
      const grid = createGrid(filled);
      const result = checkForBingo(grid);

      expect(result).toBeNull();
    });

    it('returns null for empty grid (only free space filled)', () => {
      const grid = createGrid([]);
      const result = checkForBingo(grid);

      expect(result).toBeNull();
    });

    it('returns null for scattered fills', () => {
      const filled: [number, number][] = [[0, 0], [1, 2], [3, 4], [4, 1]];
      const grid = createGrid(filled);
      const result = checkForBingo(grid);

      expect(result).toBeNull();
    });

    it('returns null for almost-diagonal (missing one)', () => {
      const filled: [number, number][] = [[0, 0], [1, 1], [3, 3]]; // missing (4,4)
      const grid = createGrid(filled);
      const result = checkForBingo(grid);

      expect(result).toBeNull();
    });

    it('returns null for 4 in column', () => {
      const filled: [number, number][] = [[0, 0], [1, 0], [3, 0], [4, 0]]; // missing (2,0)
      const grid = createGrid(filled);
      const result = checkForBingo(grid);

      expect(result).toBeNull();
    });
  });

  describe('priority order', () => {
    it('returns row win first when both row and column complete', () => {
      // Row 0 and Column 0 both complete
      const filled: [number, number][] = [
        [0, 0], [0, 1], [0, 2], [0, 3], [0, 4], // row 0
        [1, 0], [2, 0], [3, 0], [4, 0], // rest of column 0
      ];
      const grid = createGrid(filled);
      const result = checkForBingo(grid);

      expect(result).not.toBeNull();
      expect(result?.type).toBe('row');
      expect(result?.index).toBe(0);
    });
  });
});
