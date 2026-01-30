# Meeting Bingo - Implementation Plan

## Current Status Summary

### ✅ COMPLETED

| Phase | Task | Status |
|-------|------|--------|
| **Foundation** | Vite + React + TypeScript scaffold | ✅ |
| **Foundation** | Tailwind CSS setup | ✅ |
| **Foundation** | Docker development environment | ✅ |
| **Foundation** | Project structure | ✅ |
| **Foundation** | Category data (3 packs, 44 words each) | ✅ |
| **Core Game** | Type definitions | ✅ |
| **Core Game** | Card generator (5x5, shuffle, free space) | ✅ |
| **Core Game** | Bingo checker (rows/cols/diagonals) | ✅ |
| **Core Game** | Landing page | ✅ |
| **Core Game** | Category selection screen | ✅ |
| **Core Game** | Bingo card component | ✅ |
| **Core Game** | Manual square toggle | ✅ |
| **Speech** | useSpeechRecognition hook | ✅ |
| **Speech** | Word detector with aliases | ✅ |
| **Speech** | Auto-fill on detection | ✅ |
| **Speech** | Transcript display | ✅ |
| **Speech** | Microphone permission handling | ✅ |
| **Polish** | Confetti celebration | ✅ |
| **Polish** | Win screen | ✅ |

### 🔲 REMAINING

| Phase | Task | Priority | Agent Type |
|-------|------|----------|------------|
| **Polish** | Share functionality (clipboard + image) | P1 | coder |
| **Polish** | localStorage persistence | P2 | coder |
| **Polish** | Keyboard shortcuts (spacebar) | P2 | coder |
| **Testing** | Unit tests for lib functions | P1 | tester |
| **Testing** | Component tests | P2 | tester |
| **Testing** | E2E smoke test | P1 | tester |
| **Build** | Production build verification | P0 | coder |
| **Build** | Vercel configuration | P0 | coder |
| **Deploy** | Vercel deployment | P0 | coder |
| **Review** | Code quality review | P1 | reviewer |
| **Review** | Accessibility audit | P2 | reviewer |

---

## Claude-Flow Execution Plan

### Swarm Configuration

```bash
npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 6 --strategy specialized
```

### Phase 1: Build Verification (P0)

**Agent**: `coder`
**Task**: Verify production build works in Docker

```bash
# Acceptance Criteria:
# - [ ] `npm run build` succeeds with no errors
# - [ ] `npm run preview` serves the built app
# - [ ] All pages render correctly in preview mode
```

**Files to create/modify**:
- None (verification only)

**Commands**:
```bash
docker exec meeting-bingo-dev-1 npm run build
docker exec meeting-bingo-dev-1 npm run preview
```

---

### Phase 2: Share Functionality (P1)

**Agent**: `coder`
**Task**: Implement share button on win screen

**Acceptance Criteria**:
- [ ] Share button visible on win screen
- [ ] Copies game result text to clipboard
- [ ] Shows toast confirmation on copy
- [ ] Uses Web Share API if available (mobile)

**Files to create**:
- `src/lib/shareUtils.ts`
- `src/components/ui/Toast.tsx`

**Files to modify**:
- `src/App.tsx` (add share handler to win screen)

**Implementation spec** (from architecture):
```typescript
// src/lib/shareUtils.ts
export function generateShareText(
  category: string,
  filledCount: number,
  duration: number
): string {
  const minutes = Math.floor(duration / 60000);
  return `🎯 BINGO! I won ${category} Meeting Bingo!\n` +
         `📊 ${filledCount}/25 squares in ${minutes} minutes\n` +
         `🎮 Play: meetingbingo.vercel.app`;
}

export async function shareResult(text: string): Promise<boolean> {
  if (navigator.share) {
    await navigator.share({ text });
    return true;
  }
  await navigator.clipboard.writeText(text);
  return false;
}
```

---

### Phase 3: Vercel Configuration (P0)

**Agent**: `coder`
**Task**: Create Vercel deployment configuration

**Acceptance Criteria**:
- [ ] `vercel.json` created with correct settings
- [ ] Build command and output directory configured
- [ ] SPA routing configured (rewrites)

**Files to create**:
- `vercel.json`

**Implementation**:
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

---

### Phase 4: Testing (P1)

**Agent**: `tester`
**Task**: Create test suite for core functionality

**Acceptance Criteria**:
- [ ] Unit tests for `cardGenerator.ts`
- [ ] Unit tests for `wordDetector.ts`
- [ ] Unit tests for `bingoChecker.ts`
- [ ] All tests pass

**Files to create**:
- `src/lib/__tests__/cardGenerator.test.ts`
- `src/lib/__tests__/wordDetector.test.ts`
- `src/lib/__tests__/bingoChecker.test.ts`

**Dependencies to add**:
```bash
docker exec meeting-bingo-dev-1 npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

**Package.json script**:
```json
"test": "vitest",
"test:run": "vitest run"
```

---

### Phase 5: Code Review (P1)

**Agent**: `reviewer`
**Task**: Review code quality and security

**Acceptance Criteria**:
- [ ] No ESLint errors
- [ ] No TypeScript errors
- [ ] No hardcoded secrets
- [ ] Privacy-safe (no data sent to servers)
- [ ] Accessible button labels
- [ ] Semantic HTML structure

**Commands**:
```bash
docker exec meeting-bingo-dev-1 npm run lint
docker exec meeting-bingo-dev-1 npm run typecheck
```

---

### Phase 6: Deploy to Vercel (P0)

**Agent**: `coder`
**Task**: Deploy application to Vercel

**Prerequisites**:
- Vercel CLI installed or use Vercel Dashboard
- GitHub repo connected (optional)

**Option A - CLI Deployment**:
```bash
npm install -g vercel
cd /Users/jesslam/Documents/Projects/meeting-bingo-demo
vercel --prod
```

**Option B - GitHub Integration**:
1. Push to GitHub
2. Connect repo in Vercel Dashboard
3. Auto-deploys on push

**Acceptance Criteria**:
- [ ] App accessible at Vercel URL
- [ ] All pages load correctly
- [ ] Speech recognition works (HTTPS required)
- [ ] Mobile responsive

---

## Agent Assignment Summary

| Agent | Tasks | Priority |
|-------|-------|----------|
| **coder** | Build verification, Share functionality, Vercel config, Deploy | P0-P1 |
| **tester** | Unit tests, E2E smoke test | P1 |
| **reviewer** | Code quality, Accessibility audit | P1-P2 |

---

## Execution Order

```
1. [coder]    Build verification (P0)
2. [coder]    Vercel configuration (P0)
3. [coder]    Share functionality (P1)
4. [tester]   Unit tests (P1) -- parallel with #3
5. [reviewer] Code review (P1) -- after #3
6. [coder]    Deploy to Vercel (P0) -- after #5
```

---

## Quick Start Commands

```bash
# Initialize swarm
npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 6 --strategy specialized

# Verify current build
docker exec meeting-bingo-dev-1 npm run build

# Run tests (after setup)
docker exec meeting-bingo-dev-1 npm test

# Lint check
docker exec meeting-bingo-dev-1 npm run lint

# Deploy preview
vercel

# Deploy production
vercel --prod
```
