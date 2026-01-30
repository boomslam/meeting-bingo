# Meeting Bingo MVP - Execution Plan

## Overview

This plan orchestrates specialist agents to complete the remaining 11 issues across 4 execution waves. Issues are grouped by dependencies and parallelization opportunities.

**Total Estimated Tokens:** ~395k
**Agent Types:** coder, tester, reviewer
**Swarm Topology:** hierarchical (anti-drift)
**Max Concurrent Agents:** 6

---

## Swarm Initialization

```bash
npx @claude-flow/cli@latest swarm init \
  --topology hierarchical \
  --max-agents 6 \
  --strategy specialized
```

---

## Wave 1: Build & Configuration (P0)

**Objective:** Verify production build and create deployment configuration
**Parallelization:** Full (no dependencies between tasks)
**Total Tokens:** ~35k

### Wave 1 Agents

| Agent | Issue | Task | Est. Tokens |
|-------|-------|------|-------------|
| coder-1 | OSD-37 | Verify production build in Docker | 20k |
| coder-2 | OSD-38 | Create Vercel deployment configuration | 15k |

### Wave 1 Execution

```bash
# Spawn Wave 1 agents in parallel
npx @claude-flow/cli@latest agent spawn -t coder --name wave1-build
npx @claude-flow/cli@latest agent spawn -t coder --name wave1-config
```

### Wave 1 Task Prompts

**coder-1 (OSD-37):**
```
Execute Linear issue OSD-37: Verify production build in Docker

Commands to run:
1. docker exec meeting-bingo-dev-1 npm run build
2. docker exec meeting-bingo-dev-1 npm run preview
3. docker exec meeting-bingo-dev-1 ls -la dist/assets/

Acceptance criteria:
- Build completes with no errors
- Preview serves the application
- All 4 screens render (landing, category, game, win)
- Bundle size under 500KB gzipped

Report: List any errors found or confirm all criteria pass.
```

**coder-2 (OSD-38):**
```
Execute Linear issue OSD-38: Create Vercel deployment configuration

Create vercel.json:
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}

Also update .gitignore to include .vercel directory.

Report: Confirm files created and validated.
```

### Wave 1 Completion Gate
- [ ] OSD-37 passes all build checks
- [ ] OSD-38 vercel.json created and validated

---

## Wave 2: Deployment (P0)

**Objective:** Deploy application to Vercel production
**Parallelization:** Sequential (blocked by Wave 1)
**Total Tokens:** ~30k

### Wave 2 Agents

| Agent | Issue | Task | Est. Tokens |
|-------|-------|------|-------------|
| coder-1 | OSD-39 | Deploy application to Vercel | 30k |

### Wave 2 Execution

```bash
# Spawn Wave 2 agent after Wave 1 completes
npx @claude-flow/cli@latest agent spawn -t coder --name wave2-deploy
```

### Wave 2 Task Prompt

**coder-1 (OSD-39):**
```
Execute Linear issue OSD-39: Deploy application to Vercel

Prerequisites verified:
- OSD-37: Build verification passed
- OSD-38: Vercel configuration created

Deployment steps:
1. Ensure vercel CLI available or use npx
2. Run: npx vercel --prod
3. Follow prompts to configure project
4. Note the production URL

Post-deployment verification:
1. Open production URL in browser
2. Test category selection
3. Test speech recognition (grant mic permission)
4. Test manual square toggle
5. Test bingo win detection
6. Verify HTTPS enabled (required for Web Speech API)

Report: Production URL and verification results.
```

### Wave 2 Completion Gate
- [ ] Application deployed to *.vercel.app
- [ ] All 4 screens functional
- [ ] Speech recognition works (HTTPS verified)

---

## Wave 3: Features & Testing (P1)

**Objective:** Add share functionality and create unit tests
**Parallelization:** Full (independent tasks)
**Total Tokens:** ~175k

### Wave 3 Agents

| Agent | Issue | Task | Est. Tokens |
|-------|-------|------|-------------|
| coder-1 | OSD-40 | Implement share functionality | 50k |
| tester-1 | OSD-41 | Unit tests for card generator | 40k |
| tester-2 | OSD-42 | Unit tests for word detector | 45k |
| tester-3 | OSD-43 | Unit tests for bingo checker | 40k |

### Wave 3 Execution

```bash
# Spawn Wave 3 agents in parallel (4 agents)
npx @claude-flow/cli@latest agent spawn -t coder --name wave3-share
npx @claude-flow/cli@latest agent spawn -t tester --name wave3-test-card
npx @claude-flow/cli@latest agent spawn -t tester --name wave3-test-word
npx @claude-flow/cli@latest agent spawn -t tester --name wave3-test-bingo
```

### Wave 3 Task Prompts

**coder-1 (OSD-40):**
```
Execute Linear issue OSD-40: Implement share functionality

Create src/lib/shareUtils.ts:
- generateShareText(category, filledCount, duration) -> string
- shareResult(text) -> Promise<boolean> (true=native share, false=clipboard)

Create src/components/ui/Toast.tsx:
- Simple toast notification
- Auto-dismiss after 3 seconds
- Positioned at bottom center

Update src/App.tsx:
- Track startedAt timestamp when game begins
- Add share button to win screen
- Show toast on successful copy

Test manually:
- Desktop: copies to clipboard
- Mobile: opens native share sheet (if available)

Report: Files created/modified and manual test results.
```

**tester-1 (OSD-41):**
```
Execute Linear issue OSD-41: Create unit tests for card generator

Setup (if not done):
1. docker exec meeting-bingo-dev-1 npm install -D vitest
2. Add "test": "vitest" to package.json scripts

Create src/lib/__tests__/cardGenerator.test.ts with tests for:
- Generates 5x5 grid
- Has free space at center (2,2)
- Free space is pre-filled
- Has 24 unique words
- Words come from correct category
- Produces different cards on each call
- Throws for unknown category

Run: docker exec meeting-bingo-dev-1 npm test -- --run

Report: Test file created and all tests passing.
```

**tester-2 (OSD-42):**
```
Execute Linear issue OSD-42: Create unit tests for word detector

Create src/lib/__tests__/wordDetector.test.ts with tests for:

normalizeText():
- Lowercases text
- Removes punctuation
- Collapses whitespace

detectWords():
- Detects single words
- Detects multi-word phrases
- Case insensitive matching
- Skips already-filled words
- Uses word boundaries (no partial matches)

detectWordsWithAliases():
- Detects CI/CD from "continuous integration"
- Detects MVP from "minimum viable product"

Run: docker exec meeting-bingo-dev-1 npm test -- --run

Report: Test file created and all tests passing.
```

**tester-3 (OSD-43):**
```
Execute Linear issue OSD-43: Create unit tests for bingo checker

Create src/lib/__tests__/bingoChecker.test.ts with tests for:

checkForBingo():
- Detects row win (test row 0)
- Detects column win (test column 2)
- Detects main diagonal win (0,0 to 4,4)
- Detects anti-diagonal win (0,4 to 4,0)
- Returns null for no win (only 4 in a row)
- Returns correct winning line info

Helper function needed:
- createGrid(filledPositions: [number, number][]) -> BingoSquare[][]

Run: docker exec meeting-bingo-dev-1 npm test -- --run

Report: Test file created and all tests passing.
```

### Wave 3 Completion Gate
- [ ] OSD-40: Share button works, toast displays
- [ ] OSD-41: cardGenerator tests pass
- [ ] OSD-42: wordDetector tests pass
- [ ] OSD-43: bingoChecker tests pass
- [ ] All tests pass: `npm test -- --run`

---

## Wave 4: Review & Polish (P1/P2)

**Objective:** Code review and optional enhancements
**Parallelization:** Partial (review first, then enhancements)
**Total Tokens:** ~155k

### Wave 4A: Code Review

| Agent | Issue | Task | Est. Tokens |
|-------|-------|------|-------------|
| reviewer-1 | OSD-44 | Code quality review | 60k |

### Wave 4A Execution

```bash
# Spawn reviewer after Wave 3 completes
npx @claude-flow/cli@latest agent spawn -t reviewer --name wave4-review
```

### Wave 4A Task Prompt

**reviewer-1 (OSD-44):**
```
Execute Linear issue OSD-44: Code quality review

Run automated checks:
1. docker exec meeting-bingo-dev-1 npm run lint
2. docker exec meeting-bingo-dev-1 npm run typecheck

Review files for:
- src/App.tsx - Main application logic
- src/hooks/useSpeechRecognition.ts - Browser API integration
- src/lib/*.ts - Core game logic
- src/types/index.ts - Type definitions

Checklist:
Security:
- [ ] No hardcoded secrets
- [ ] No external API calls (except browser-native)
- [ ] No XSS vulnerabilities

Code Quality:
- [ ] Functions are single-purpose
- [ ] Types properly defined
- [ ] No unused imports/variables
- [ ] Error states handled

Performance:
- [ ] No memory leaks in hooks
- [ ] Proper cleanup on unmount
- [ ] Efficient re-renders

Accessibility:
- [ ] Buttons have accessible labels
- [ ] Color contrast adequate
- [ ] Keyboard navigation works

Report: Issues found (with file:line), recommended fixes, overall assessment.
```

### Wave 4A Completion Gate
- [ ] Lint passes with no errors
- [ ] TypeScript passes with no errors
- [ ] No critical issues found
- [ ] Recommended fixes documented

### Wave 4B: Polish (Optional P2)

| Agent | Issue | Task | Est. Tokens |
|-------|-------|------|-------------|
| coder-1 | OSD-45 | Add localStorage persistence | 30k |
| coder-2 | OSD-46 | Add keyboard shortcuts | 25k |
| reviewer-1 | OSD-47 | Accessibility audit and fixes | 40k |

### Wave 4B Execution

```bash
# Spawn Wave 4B agents in parallel (optional)
npx @claude-flow/cli@latest agent spawn -t coder --name wave4-storage
npx @claude-flow/cli@latest agent spawn -t coder --name wave4-keyboard
npx @claude-flow/cli@latest agent spawn -t reviewer --name wave4-a11y
```

### Wave 4B Task Prompts

**coder-1 (OSD-45):**
```
Execute Linear issue OSD-45: Add localStorage persistence

Create src/hooks/useLocalStorage.ts:
- Generic hook for localStorage state
- Handles JSON serialization
- Returns [value, setValue] tuple

Update src/App.tsx:
- Persist game state (card, category, filled squares)
- Restore on page refresh
- Clear on "New Game"

Test:
- Start game, fill some squares, refresh page
- Game state should restore

Report: Files created/modified and test results.
```

**coder-2 (OSD-46):**
```
Execute Linear issue OSD-46: Add keyboard shortcuts

Update src/App.tsx with useEffect:
- Spacebar: Toggle listening
- Escape: Stop listening
- N: New game

Add visual hint in footer showing available shortcuts.

Only active on game screen (not landing/category/win).

Test:
- Press spacebar to start/stop listening
- Press Escape to stop
- Press N to reset

Report: Implementation and test results.
```

**reviewer-1 (OSD-47):**
```
Execute Linear issue OSD-47: Accessibility audit and fixes

Audit checklist:
- [ ] Tab through all interactive elements
- [ ] Enter/Space activates buttons
- [ ] Focus order is logical
- [ ] Screen reader announces state changes
- [ ] Color contrast meets WCAG AA

Fixes to implement:
1. Add aria-label to icon-only buttons
2. Add role="status" to transcript area
3. Add aria-live="polite" for game updates
4. Add focus management on screen changes

Update src/App.tsx with accessibility improvements.

Report: Audit results and fixes applied.
```

### Wave 4B Completion Gate
- [ ] OSD-45: Game persists across refresh
- [ ] OSD-46: Keyboard shortcuts work
- [ ] OSD-47: Accessibility improvements applied

---

## Execution Summary

| Wave | Issues | Agents | Est. Tokens | Dependencies |
|------|--------|--------|-------------|--------------|
| 1 | OSD-37, OSD-38 | 2 coder | 35k | None |
| 2 | OSD-39 | 1 coder | 30k | Wave 1 |
| 3 | OSD-40, OSD-41, OSD-42, OSD-43 | 1 coder, 3 tester | 175k | Wave 2 |
| 4A | OSD-44 | 1 reviewer | 60k | Wave 3 |
| 4B | OSD-45, OSD-46, OSD-47 | 2 coder, 1 reviewer | 95k | Wave 4A (optional) |

**Critical Path (P0):** Wave 1 → Wave 2 = **65k tokens**
**Full Execution (P0+P1):** Waves 1-4A = **300k tokens**
**Complete (P0+P1+P2):** All waves = **395k tokens**

---

## Quick Start

### Minimum Viable Deployment (P0 only)

```bash
# Initialize swarm
npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 2

# Wave 1: Build + Config (parallel)
# Execute OSD-37 and OSD-38 concurrently

# Wave 2: Deploy (sequential)
# Execute OSD-39 after Wave 1 completes
```

### Full Execution (P0 + P1)

```bash
# Initialize swarm
npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 6

# Wave 1: 2 agents
# Wave 2: 1 agent
# Wave 3: 4 agents (parallel)
# Wave 4A: 1 agent
```

---

## Monitoring

```bash
# Check swarm status
npx @claude-flow/cli@latest swarm status

# Check agent health
npx @claude-flow/cli@latest agent list

# View memory/patterns
npx @claude-flow/cli@latest memory list --namespace patterns
```

---

## Rollback Plan

If deployment fails:
1. Check Vercel logs: `vercel logs`
2. Redeploy previous version: `vercel rollback`
3. Fix issues locally in Docker
4. Redeploy: `vercel --prod`
