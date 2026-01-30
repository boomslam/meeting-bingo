# Wave 4: Review & Polish

**Priority:** P1 (4A) / P2 (4B)
**Est. Tokens:** 155k total (60k + 95k)
**Parallelization:** Sequential then Parallel
**Agents:** 1-3 reviewer/coder

---

## Wave 4A: Code Review (P1)

**Est. Tokens:** 60k
**Agents:** 1 reviewer

### Prerequisites

- Wave 3 completed
- All tests passing
- Share functionality working

---

### Agent 1: Code Quality Review (OSD-44)

**Est. Tokens:** 60k
**Linear Issue:** https://linear.app/openspace/issue/OSD-44
**Type:** reviewer

#### Prompt

```
You are a reviewer agent executing Linear issue OSD-44.

## Task
Review the Meeting Bingo codebase for quality, security, and best practices.

## Automated Checks

Run these commands first:

1. Lint check:
docker exec meeting-bingo-dev-1 npm run lint

2. Type check:
docker exec meeting-bingo-dev-1 npm run typecheck

3. Test suite:
docker exec meeting-bingo-dev-1 npm run test:run

Report results before manual review.

## Files to Review

Read and analyze each file:

### Core Application
- src/App.tsx (~320 lines)
- src/main.tsx (~10 lines)
- src/types/index.ts (~60 lines)

### Hooks
- src/hooks/useSpeechRecognition.ts (~130 lines)

### Libraries
- src/lib/cardGenerator.ts (~55 lines)
- src/lib/wordDetector.ts (~85 lines)
- src/lib/bingoChecker.ts (~50 lines)
- src/lib/shareUtils.ts (~25 lines)

### Data
- src/data/categories.ts (~55 lines)

### Components
- src/components/ui/Toast.tsx (~25 lines)

## Review Checklist

### Security (Critical)

- [ ] No hardcoded API keys or secrets
- [ ] No sensitive data logged to console
- [ ] No external API calls (Web Speech API is browser-native, OK)
- [ ] localStorage only stores non-sensitive game state
- [ ] No innerHTML or dangerouslySetInnerHTML (XSS risk)
- [ ] User input (transcript) properly escaped in JSX

### Code Quality

- [ ] Functions are single-purpose and well-named
- [ ] TypeScript types properly defined (no 'any' except where justified)
- [ ] No unused imports or variables
- [ ] Consistent naming conventions (camelCase for functions, PascalCase for components)
- [ ] Error states handled gracefully
- [ ] No console.log left in production code (except errors)

### React Best Practices

- [ ] useEffect dependencies are correct
- [ ] useCallback/useMemo used appropriately (not over-optimized)
- [ ] State updates don't cause infinite loops
- [ ] Cleanup functions in useEffect where needed
- [ ] Keys provided for list items

### Performance

- [ ] No memory leaks in speech recognition hook
- [ ] Event listeners cleaned up on unmount
- [ ] No unnecessary re-renders (check dependency arrays)
- [ ] Large arrays not recreated on every render

### Accessibility (Basic)

- [ ] Buttons have text content or aria-label
- [ ] Color is not the only indicator of state
- [ ] Interactive elements are focusable
- [ ] Semantic HTML used (button for actions, not div)

## Issue Severity Levels

- **Critical**: Security vulnerabilities, crashes, data loss
- **High**: Bugs affecting functionality, major perf issues
- **Medium**: Code quality issues, minor bugs
- **Low**: Style/convention issues, minor improvements

## Output Format

Report findings in this format:

### Automated Check Results
- Lint: PASS/FAIL (X errors, Y warnings)
- TypeScript: PASS/FAIL (X errors)
- Tests: PASS/FAIL (X passing, Y failing)

### Manual Review Findings

#### Critical Issues
(None found / List issues)

#### High Issues
(None found / List issues)

Example:
- **[HIGH]** src/App.tsx:45 - Missing error boundary for speech recognition failures

#### Medium Issues
(List issues)

#### Low Issues
(List issues)

### Recommendations
1. [Priority] Recommendation description

### Overall Assessment
- Code Quality: Good/Fair/Poor
- Security: Good/Fair/Poor
- Test Coverage: Good/Fair/Poor
- Ready for Production: Yes/No (with conditions)
```

---

## Wave 4A Completion

### Gate Check

Code review passes when:
- No critical issues
- No high issues (or all addressed)
- Lint and TypeScript pass
- Tests pass

### Proceed to Wave 4B?

Wave 4B (P2 enhancements) is optional. Proceed if:
- Time/budget allows
- P0/P1 items complete
- No blocking issues from review

---

## Wave 4B: Polish (P2 - Optional)

**Est. Tokens:** 95k total
**Parallelization:** Full (3 agents)
**Agents:** 2 coder, 1 reviewer

---

### Agent 1: localStorage Persistence (OSD-45)

**Est. Tokens:** 30k
**Linear Issue:** https://linear.app/openspace/issue/OSD-45
**Type:** coder

#### Prompt

```
You are a coder agent executing Linear issue OSD-45.

## Task
Add localStorage persistence to save game state across browser refreshes.

## Create Hook

Create src/hooks/useLocalStorage.ts:

import { useState, useEffect } from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  // Get initial value from localStorage or use provided initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update localStorage when value changes
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

export function clearGameStorage(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem('meetingBingo_gameState');
}

## Update App.tsx

1. Import the hook:
import { useLocalStorage, clearGameStorage } from './hooks/useLocalStorage'

2. Define game state type:
interface PersistedGameState {
  screen: Screen;
  category: CategoryId | null;
  card: BingoCard | null;
  filledWords: string[];
  startedAt: number | null;
}

3. Replace useState with useLocalStorage:
const [persistedState, setPersistedState] = useLocalStorage<PersistedGameState>(
  'meetingBingo_gameState',
  {
    screen: 'landing',
    category: null,
    card: null,
    filledWords: [],
    startedAt: null,
  }
);

4. Derive component state from persisted state

5. Update handlePlayAgain to clear storage:
clearGameStorage();

## Testing

1. Start a game, select category
2. Fill a few squares
3. Refresh the page
4. Verify game state is restored
5. Click "New Game"
6. Verify state is cleared

## Output

Report:
1. Files created/modified
2. Test results
3. Any edge cases handled
```

---

### Agent 2: Keyboard Shortcuts (OSD-46)

**Est. Tokens:** 25k
**Linear Issue:** https://linear.app/openspace/issue/OSD-46
**Type:** coder

#### Prompt

```
You are a coder agent executing Linear issue OSD-46.

## Task
Add keyboard shortcuts for common actions.

## Update App.tsx

Add useEffect for keyboard handling:

// Keyboard shortcuts
useEffect(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
    // Only handle shortcuts on game screen
    if (screen !== 'game') return;

    // Ignore if user is typing in an input
    if (event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement) {
      return;
    }

    switch (event.code) {
      case 'Space':
        event.preventDefault(); // Prevent page scroll
        handleToggleListening();
        break;
      case 'Escape':
        if (isListening) {
          stopListening();
        }
        break;
      case 'KeyN':
        // Only if not listening (prevent accidental reset)
        if (!isListening) {
          handlePlayAgain();
        }
        break;
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [screen, isListening, handleToggleListening, stopListening, handlePlayAgain]);

## Add Visual Hint

Add to game screen footer:

<footer className="mt-4 text-center text-xs text-gray-500">
  <p className="mb-1">🔒 Audio processed locally. Never recorded.</p>
  <p className="text-gray-400">
    Shortcuts: <kbd className="px-1 bg-gray-200 rounded">Space</kbd> toggle listening ·
    <kbd className="px-1 bg-gray-200 rounded">Esc</kbd> stop ·
    <kbd className="px-1 bg-gray-200 rounded">N</kbd> new game
  </p>
</footer>

## Testing

1. Go to game screen
2. Press Spacebar - listening should start
3. Press Spacebar again - listening should stop
4. Press Escape while listening - should stop
5. Press N - should go to category selection
6. Verify shortcuts don't work on other screens

## Output

Report:
1. Changes made to App.tsx
2. Test results for each shortcut
3. Any edge cases handled
```

---

### Agent 3: Accessibility Audit (OSD-47)

**Est. Tokens:** 40k
**Linear Issue:** https://linear.app/openspace/issue/OSD-47
**Type:** reviewer

#### Prompt

```
You are a reviewer agent executing Linear issue OSD-47.

## Task
Audit the application for accessibility and implement fixes.

## Audit Checklist

### Keyboard Navigation

Test in browser:
1. [ ] Tab through all interactive elements
2. [ ] Enter/Space activates buttons
3. [ ] Focus order is logical (top to bottom, left to right)
4. [ ] Focus is visible on all elements
5. [ ] No keyboard traps

### Screen Reader Testing

If screen reader available, or check code for:
1. [ ] All buttons have accessible names
2. [ ] Images have alt text (if any)
3. [ ] Form inputs have labels
4. [ ] Dynamic content updates announced

### Color and Visual

1. [ ] Color contrast ratio >= 4.5:1 for text
2. [ ] Color is not only indicator (filled squares have both color + scale)
3. [ ] Focus indicators visible
4. [ ] Text readable at 200% zoom

## Fixes to Implement

### 1. Add aria-labels to buttons

Update App.tsx buttons:

// Listen button
<button
  onClick={handleToggleListening}
  aria-label={isListening ? 'Stop listening for buzzwords' : 'Start listening for buzzwords'}
  aria-pressed={isListening}
  className={...}
>

// Square buttons
<button
  key={square.id}
  onClick={() => handleSquareClick(square)}
  aria-label={`${square.word}${square.isFilled ? ', marked' : ''}`}
  aria-pressed={square.isFilled}
  disabled={square.isFreeSpace}
  className={...}
>

### 2. Add live region for transcript

<div
  className="mt-4 p-3 bg-white rounded-lg shadow text-sm"
  role="status"
  aria-live="polite"
  aria-label="Speech transcript"
>

### 3. Add announcements for game events

Create announcement for bingo win:
<div role="alert" aria-live="assertive" className="sr-only">
  {screen === 'win' && 'Bingo! You won!'}
</div>

### 4. Add skip link (optional)

<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>

### 5. Add sr-only utility class

Add to index.css:
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.sr-only.focus\\:not-sr-only:focus {
  position: static;
  width: auto;
  height: auto;
  padding: inherit;
  margin: inherit;
  overflow: visible;
  clip: auto;
  white-space: normal;
}

### 6. Ensure focus management

When screen changes, focus should move appropriately:
- Landing -> Category: Focus first category button
- Category -> Game: Focus listen button
- Game -> Win: Focus share or play again button

## Output

Report:
1. Audit findings (pass/fail for each item)
2. Fixes implemented
3. Remaining issues (if any)
4. WCAG level achieved (A, AA, or AAA)
```

---

## Wave 4B Completion

### Gate Check

All P2 tasks complete when:
- localStorage persists game state
- Keyboard shortcuts work
- Accessibility improvements applied

### Final Checklist

```bash
# Run all checks
docker exec meeting-bingo-dev-1 npm run lint
docker exec meeting-bingo-dev-1 npm run typecheck
docker exec meeting-bingo-dev-1 npm run test:run

# Build and verify
docker exec meeting-bingo-dev-1 npm run build
```

### Deploy Updates

After Wave 4B, redeploy to Vercel:
```bash
vercel --prod
```
