# Wave 3: Features & Testing

**Priority:** P1 - High
**Est. Tokens:** 175k total
**Parallelization:** Full (4 agents)
**Agents:** 1 coder, 3 tester

---

## Prerequisites

- Wave 2 completed (deployment live)
- Application running at Vercel URL
- Docker container available for testing

---

## Agent 1: Share Functionality (OSD-40)

**Est. Tokens:** 50k
**Linear Issue:** https://linear.app/openspace/issue/OSD-40
**Type:** coder

### Prompt

```
You are a coder agent executing Linear issue OSD-40.

## Task
Implement share functionality on the win screen.

## Files to Create

### 1. src/lib/shareUtils.ts

export function generateShareText(
  categoryName: string,
  filledCount: number,
  durationMs: number
): string {
  const minutes = Math.floor(durationMs / 60000);
  const seconds = Math.floor((durationMs % 60000) / 1000);
  const timeStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

  return [
    '🎯 BINGO!',
    '',
    `I won ${categoryName} Meeting Bingo!`,
    `📊 ${filledCount}/25 squares in ${timeStr}`,
    '',
    '🎮 Play: meetingbingo.vercel.app'
  ].join('\n');
}

export async function shareResult(text: string): Promise<'native' | 'clipboard'> {
  // Try native share first (mobile)
  if (navigator.share) {
    try {
      await navigator.share({ text });
      return 'native';
    } catch (err) {
      // User cancelled or error, fall through to clipboard
    }
  }

  // Fall back to clipboard
  await navigator.clipboard.writeText(text);
  return 'clipboard';
}

### 2. src/components/ui/Toast.tsx

import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, isVisible, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-gray-800 text-white rounded-lg shadow-lg text-sm animate-fade-in">
      {message}
    </div>
  );
}

### 3. Update src/App.tsx

Add imports:
import { generateShareText, shareResult } from './lib/shareUtils'
import { Toast } from './components/ui/Toast'

Add state:
const [startedAt, setStartedAt] = useState<number | null>(null)
const [toast, setToast] = useState<{ message: string; visible: boolean }>({
  message: '',
  visible: false,
})

Update handleSelectCategory to set startedAt:
setStartedAt(Date.now())

Add share handler:
const handleShare = async () => {
  if (!startedAt || !category) return;

  const categoryName = CATEGORIES.find(c => c.id === category)?.name || '';
  const duration = Date.now() - startedAt;
  const filledCount = card?.squares.flat().filter(s => s.isFilled).length || 0;

  const text = generateShareText(categoryName, filledCount, duration);
  const method = await shareResult(text);

  setToast({
    message: method === 'native' ? 'Shared!' : 'Copied to clipboard!',
    visible: true,
  });
};

Update win screen to include share button:
<button
  onClick={handleShare}
  className="px-8 py-4 bg-white text-green-600 rounded-full font-bold text-lg hover:bg-opacity-90 transition-all shadow-lg mr-4"
>
  📤 Share Result
</button>

Add Toast component at end of App:
<Toast
  message={toast.message}
  isVisible={toast.visible}
  onClose={() => setToast(prev => ({ ...prev, visible: false }))}
/>

### 4. Update src/index.css

Add animation:
@keyframes fade-in {
  from { opacity: 0; transform: translate(-50%, 10px); }
  to { opacity: 1; transform: translate(-50%, 0); }
}

.animate-fade-in {
  animation: fade-in 0.2s ease-out;
}

## Testing

1. Complete a bingo game
2. Click "Share Result" on win screen
3. Verify toast appears
4. Verify text copied to clipboard (paste somewhere to check)
5. On mobile: verify native share sheet opens

## Output

Report:
1. Files created/modified
2. Test results
3. Any issues encountered
```

---

## Agent 2: Card Generator Tests (OSD-41)

**Est. Tokens:** 40k
**Linear Issue:** https://linear.app/openspace/issue/OSD-41
**Type:** tester

### Prompt

```
You are a tester agent executing Linear issue OSD-41.

## Task
Create unit tests for the card generator library.

## Setup (if not done)

1. Install vitest:
docker exec meeting-bingo-dev-1 npm install -D vitest @vitest/ui

2. Create vitest.config.ts:
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})

3. Update package.json scripts:
"test": "vitest",
"test:run": "vitest run",
"test:ui": "vitest --ui"

## Create Test File

Create src/lib/__tests__/cardGenerator.test.ts:

import { describe, it, expect } from 'vitest';
import { generateCard } from '../cardGenerator';
import { CATEGORIES } from '../../data/categories';

describe('generateCard', () => {
  describe('grid structure', () => {
    it('generates a 5x5 grid', () => {
      const card = generateCard('corporate');
      expect(card.squares).toHaveLength(5);
      card.squares.forEach(row => {
        expect(row).toHaveLength(5);
      });
    });

    it('assigns correct row and col to each square', () => {
      const card = generateCard('corporate');
      card.squares.forEach((row, rowIndex) => {
        row.forEach((square, colIndex) => {
          expect(square.row).toBe(rowIndex);
          expect(square.col).toBe(colIndex);
          expect(square.id).toBe(`${rowIndex}-${colIndex}`);
        });
      });
    });
  });

  describe('free space', () => {
    it('has free space at center (2,2)', () => {
      const card = generateCard('corporate');
      const center = card.squares[2][2];
      expect(center.isFreeSpace).toBe(true);
      expect(center.word).toBe('FREE');
    });

    it('free space is pre-filled', () => {
      const card = generateCard('corporate');
      const center = card.squares[2][2];
      expect(center.isFilled).toBe(true);
      expect(center.filledAt).not.toBeNull();
    });

    it('only center square is free space', () => {
      const card = generateCard('corporate');
      card.squares.flat().forEach(square => {
        if (square.row === 2 && square.col === 2) {
          expect(square.isFreeSpace).toBe(true);
        } else {
          expect(square.isFreeSpace).toBe(false);
        }
      });
    });
  });

  describe('words', () => {
    it('has 24 unique words (excluding free space)', () => {
      const card = generateCard('corporate');
      expect(card.words).toHaveLength(24);
      expect(new Set(card.words).size).toBe(24);
    });

    it('words come from the selected category', () => {
      const card = generateCard('corporate');
      const categoryWords = CATEGORIES.find(c => c.id === 'corporate')!.words;
      card.words.forEach(word => {
        expect(categoryWords).toContain(word);
      });
    });

    it('non-free squares have words from the card', () => {
      const card = generateCard('corporate');
      const nonFreeSquares = card.squares.flat().filter(s => !s.isFreeSpace);
      nonFreeSquares.forEach(square => {
        expect(card.words).toContain(square.word);
      });
    });
  });

  describe('randomization', () => {
    it('produces different cards on subsequent calls', () => {
      const card1 = generateCard('corporate');
      const card2 = generateCard('corporate');
      // Words should be different (statistically near-certain)
      expect(card1.words).not.toEqual(card2.words);
    });
  });

  describe('categories', () => {
    it('works with agile category', () => {
      const card = generateCard('agile');
      expect(card.words).toHaveLength(24);
    });

    it('works with tech category', () => {
      const card = generateCard('tech');
      expect(card.words).toHaveLength(24);
    });

    it('throws for unknown category', () => {
      expect(() => generateCard('unknown' as any)).toThrow();
    });
  });

  describe('initial state', () => {
    it('non-free squares start unfilled', () => {
      const card = generateCard('corporate');
      const nonFreeSquares = card.squares.flat().filter(s => !s.isFreeSpace);
      nonFreeSquares.forEach(square => {
        expect(square.isFilled).toBe(false);
        expect(square.isAutoFilled).toBe(false);
        expect(square.filledAt).toBeNull();
      });
    });
  });
});

## Run Tests

docker exec meeting-bingo-dev-1 npm run test:run

## Output

Report:
1. Test file created
2. Number of tests: X passing, Y failing
3. Any failures with details
4. Coverage summary if available
```

---

## Agent 3: Word Detector Tests (OSD-42)

**Est. Tokens:** 45k
**Linear Issue:** https://linear.app/openspace/issue/OSD-42
**Type:** tester

### Prompt

```
You are a tester agent executing Linear issue OSD-42.

## Task
Create unit tests for the word detector library.

## Create Test File

Create src/lib/__tests__/wordDetector.test.ts:

import { describe, it, expect } from 'vitest';
import {
  normalizeText,
  detectWords,
  detectWordsWithAliases,
  WORD_ALIASES
} from '../wordDetector';

describe('normalizeText', () => {
  it('converts to lowercase', () => {
    expect(normalizeText('SYNERGY')).toBe('synergy');
    expect(normalizeText('SyNeRgY')).toBe('synergy');
  });

  it('removes punctuation', () => {
    expect(normalizeText('hello!')).toBe('hello');
    expect(normalizeText("let's go")).toBe('let s go');
    expect(normalizeText('well...')).toBe('well');
  });

  it('replaces punctuation with spaces', () => {
    expect(normalizeText('circle-back')).toBe('circle back');
    expect(normalizeText('win/win')).toBe('win win');
  });

  it('collapses multiple spaces', () => {
    expect(normalizeText('deep   dive')).toBe('deep dive');
    expect(normalizeText('  spaced  out  ')).toBe('spaced out');
  });

  it('trims whitespace', () => {
    expect(normalizeText('  hello  ')).toBe('hello');
  });

  it('handles empty string', () => {
    expect(normalizeText('')).toBe('');
  });
});

describe('detectWords', () => {
  const cardWords = ['synergy', 'leverage', 'circle back', 'API', 'deep dive'];

  describe('single word detection', () => {
    it('detects exact word match', () => {
      const result = detectWords('we need more synergy', cardWords, new Set());
      expect(result).toContain('synergy');
    });

    it('is case insensitive', () => {
      const result = detectWords('SYNERGY is key', cardWords, new Set());
      expect(result).toContain('synergy');
    });

    it('detects multiple words', () => {
      const result = detectWords('synergy and leverage', cardWords, new Set());
      expect(result).toContain('synergy');
      expect(result).toContain('leverage');
    });
  });

  describe('phrase detection', () => {
    it('detects multi-word phrases', () => {
      const result = detectWords("let's circle back on that", cardWords, new Set());
      expect(result).toContain('circle back');
    });

    it('detects phrases with extra words around', () => {
      const result = detectWords('we should do a deep dive into this', cardWords, new Set());
      expect(result).toContain('deep dive');
    });
  });

  describe('word boundaries', () => {
    it('does not match partial words', () => {
      const result = detectWords('synergistic approach', cardWords, new Set());
      expect(result).not.toContain('synergy');
    });

    it('does not match word within word', () => {
      const result = detectWords('leverage', ['lever'], new Set());
      expect(result).not.toContain('lever');
    });

    it('matches word at start of text', () => {
      const result = detectWords('synergy matters', cardWords, new Set());
      expect(result).toContain('synergy');
    });

    it('matches word at end of text', () => {
      const result = detectWords('we need synergy', cardWords, new Set());
      expect(result).toContain('synergy');
    });
  });

  describe('already filled words', () => {
    it('skips already filled words', () => {
      const filled = new Set(['synergy']);
      const result = detectWords('synergy and leverage', cardWords, filled);
      expect(result).not.toContain('synergy');
      expect(result).toContain('leverage');
    });

    it('handles case-insensitive filled check', () => {
      const filled = new Set(['synergy']); // lowercase in set
      const result = detectWords('SYNERGY is great', cardWords, filled);
      expect(result).not.toContain('synergy');
    });
  });

  describe('edge cases', () => {
    it('returns empty array for no matches', () => {
      const result = detectWords('hello world', cardWords, new Set());
      expect(result).toEqual([]);
    });

    it('handles empty transcript', () => {
      const result = detectWords('', cardWords, new Set());
      expect(result).toEqual([]);
    });

    it('handles empty card words', () => {
      const result = detectWords('synergy', [], new Set());
      expect(result).toEqual([]);
    });
  });
});

describe('detectWordsWithAliases', () => {
  it('detects CI/CD from continuous integration', () => {
    const result = detectWordsWithAliases(
      'we use continuous integration',
      ['CI/CD'],
      new Set()
    );
    expect(result).toContain('CI/CD');
  });

  it('detects MVP from minimum viable product', () => {
    const result = detectWordsWithAliases(
      'ship the minimum viable product',
      ['MVP'],
      new Set()
    );
    expect(result).toContain('MVP');
  });

  it('detects ROI from return on investment', () => {
    const result = detectWordsWithAliases(
      'what is the return on investment',
      ['ROI'],
      new Set()
    );
    expect(result).toContain('ROI');
  });

  it('still detects direct matches', () => {
    const result = detectWordsWithAliases(
      'synergy is important',
      ['synergy', 'CI/CD'],
      new Set()
    );
    expect(result).toContain('synergy');
  });

  it('does not duplicate if both alias and direct match', () => {
    const result = detectWordsWithAliases(
      'CI/CD and continuous integration',
      ['CI/CD'],
      new Set()
    );
    expect(result.filter(w => w === 'CI/CD')).toHaveLength(1);
  });
});

describe('WORD_ALIASES', () => {
  it('has aliases for common abbreviations', () => {
    expect(WORD_ALIASES['ci/cd']).toBeDefined();
    expect(WORD_ALIASES['mvp']).toBeDefined();
    expect(WORD_ALIASES['roi']).toBeDefined();
    expect(WORD_ALIASES['api']).toBeDefined();
  });
});

## Run Tests

docker exec meeting-bingo-dev-1 npm run test:run

## Output

Report:
1. Test file created
2. Number of tests: X passing, Y failing
3. Any failures with details
```

---

## Agent 4: Bingo Checker Tests (OSD-43)

**Est. Tokens:** 40k
**Linear Issue:** https://linear.app/openspace/issue/OSD-43
**Type:** tester

### Prompt

```
You are a tester agent executing Linear issue OSD-43.

## Task
Create unit tests for the bingo checker library.

## Create Test File

Create src/lib/__tests__/bingoChecker.test.ts:

import { describe, it, expect } from 'vitest';
import { checkForBingo } from '../bingoChecker';
import { BingoSquare } from '../../types';

// Helper to create a test grid
function createEmptyGrid(): BingoSquare[][] {
  const grid: BingoSquare[][] = [];
  for (let row = 0; row < 5; row++) {
    grid[row] = [];
    for (let col = 0; col < 5; col++) {
      grid[row][col] = {
        id: `${row}-${col}`,
        word: `word-${row}-${col}`,
        isFilled: false,
        isAutoFilled: false,
        isFreeSpace: row === 2 && col === 2,
        filledAt: null,
        row,
        col,
      };
    }
  }
  // Free space is always filled
  grid[2][2].isFilled = true;
  grid[2][2].word = 'FREE';
  return grid;
}

function fillSquares(grid: BingoSquare[][], positions: [number, number][]): BingoSquare[][] {
  const newGrid = grid.map(row => row.map(sq => ({ ...sq })));
  positions.forEach(([row, col]) => {
    newGrid[row][col].isFilled = true;
    newGrid[row][col].filledAt = Date.now();
  });
  return newGrid;
}

describe('checkForBingo', () => {
  describe('row wins', () => {
    it('detects row 0 win', () => {
      const grid = fillSquares(createEmptyGrid(), [[0,0], [0,1], [0,2], [0,3], [0,4]]);
      const result = checkForBingo(grid);
      expect(result).not.toBeNull();
      expect(result?.type).toBe('row');
      expect(result?.index).toBe(0);
      expect(result?.squares).toHaveLength(5);
    });

    it('detects row 2 win (includes free space)', () => {
      const grid = fillSquares(createEmptyGrid(), [[2,0], [2,1], [2,3], [2,4]]);
      // Note: [2,2] is already filled (free space)
      const result = checkForBingo(grid);
      expect(result).not.toBeNull();
      expect(result?.type).toBe('row');
      expect(result?.index).toBe(2);
    });

    it('detects row 4 win', () => {
      const grid = fillSquares(createEmptyGrid(), [[4,0], [4,1], [4,2], [4,3], [4,4]]);
      const result = checkForBingo(grid);
      expect(result).not.toBeNull();
      expect(result?.type).toBe('row');
      expect(result?.index).toBe(4);
    });
  });

  describe('column wins', () => {
    it('detects column 0 win', () => {
      const grid = fillSquares(createEmptyGrid(), [[0,0], [1,0], [2,0], [3,0], [4,0]]);
      const result = checkForBingo(grid);
      expect(result).not.toBeNull();
      expect(result?.type).toBe('column');
      expect(result?.index).toBe(0);
    });

    it('detects column 2 win (includes free space)', () => {
      const grid = fillSquares(createEmptyGrid(), [[0,2], [1,2], [3,2], [4,2]]);
      // Note: [2,2] is already filled (free space)
      const result = checkForBingo(grid);
      expect(result).not.toBeNull();
      expect(result?.type).toBe('column');
      expect(result?.index).toBe(2);
    });

    it('detects column 4 win', () => {
      const grid = fillSquares(createEmptyGrid(), [[0,4], [1,4], [2,4], [3,4], [4,4]]);
      const result = checkForBingo(grid);
      expect(result).not.toBeNull();
      expect(result?.type).toBe('column');
      expect(result?.index).toBe(4);
    });
  });

  describe('diagonal wins', () => {
    it('detects main diagonal win (top-left to bottom-right)', () => {
      const grid = fillSquares(createEmptyGrid(), [[0,0], [1,1], [3,3], [4,4]]);
      // Note: [2,2] is already filled (free space)
      const result = checkForBingo(grid);
      expect(result).not.toBeNull();
      expect(result?.type).toBe('diagonal');
      expect(result?.index).toBe(0);
    });

    it('detects anti-diagonal win (top-right to bottom-left)', () => {
      const grid = fillSquares(createEmptyGrid(), [[0,4], [1,3], [3,1], [4,0]]);
      // Note: [2,2] is already filled (free space)
      const result = checkForBingo(grid);
      expect(result).not.toBeNull();
      expect(result?.type).toBe('diagonal');
      expect(result?.index).toBe(1);
    });
  });

  describe('no win scenarios', () => {
    it('returns null for empty grid (only free space)', () => {
      const grid = createEmptyGrid();
      const result = checkForBingo(grid);
      expect(result).toBeNull();
    });

    it('returns null for 4 in a row', () => {
      const grid = fillSquares(createEmptyGrid(), [[0,0], [0,1], [0,2], [0,3]]);
      const result = checkForBingo(grid);
      expect(result).toBeNull();
    });

    it('returns null for scattered squares', () => {
      const grid = fillSquares(createEmptyGrid(), [[0,0], [1,2], [3,4], [4,1]]);
      const result = checkForBingo(grid);
      expect(result).toBeNull();
    });

    it('returns null for almost diagonal', () => {
      const grid = fillSquares(createEmptyGrid(), [[0,0], [1,1], [3,3]]);
      // Missing [4,4] and [2,2] is free space
      const result = checkForBingo(grid);
      expect(result).toBeNull();
    });
  });

  describe('winning line info', () => {
    it('returns correct square IDs for row win', () => {
      const grid = fillSquares(createEmptyGrid(), [[0,0], [0,1], [0,2], [0,3], [0,4]]);
      const result = checkForBingo(grid);
      expect(result?.squares).toEqual(['0-0', '0-1', '0-2', '0-3', '0-4']);
    });

    it('returns correct square IDs for column win', () => {
      const grid = fillSquares(createEmptyGrid(), [[0,0], [1,0], [2,0], [3,0], [4,0]]);
      const result = checkForBingo(grid);
      expect(result?.squares).toEqual(['0-0', '1-0', '2-0', '3-0', '4-0']);
    });

    it('returns correct square IDs for main diagonal', () => {
      const grid = fillSquares(createEmptyGrid(), [[0,0], [1,1], [3,3], [4,4]]);
      const result = checkForBingo(grid);
      expect(result?.squares).toEqual(['0-0', '1-1', '2-2', '3-3', '4-4']);
    });
  });

  describe('priority', () => {
    it('returns row win before column win if both exist', () => {
      // Fill row 0 and column 0
      const grid = fillSquares(createEmptyGrid(), [
        [0,0], [0,1], [0,2], [0,3], [0,4], // row 0
        [1,0], [2,0], [3,0], [4,0]          // column 0 (0,0 already filled)
      ]);
      const result = checkForBingo(grid);
      // Should return row first based on check order
      expect(result?.type).toBe('row');
    });
  });
});

## Run Tests

docker exec meeting-bingo-dev-1 npm run test:run

## Output

Report:
1. Test file created
2. Number of tests: X passing, Y failing
3. Any failures with details
```

---

## Wave 3 Completion

### Gate Check

All 4 agents must report success:

```bash
# Run all tests
docker exec meeting-bingo-dev-1 npm run test:run

# Verify share functionality manually
# 1. Complete a game
# 2. Click share on win screen
# 3. Verify clipboard has share text
```

### Handoff to Wave 4

Once Wave 3 completes:
1. Mark OSD-40, OSD-41, OSD-42, OSD-43 as Done in Linear
2. Proceed to Wave 4A (Code Review)
