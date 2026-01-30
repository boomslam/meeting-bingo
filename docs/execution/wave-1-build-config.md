# Wave 1: Build & Configuration

**Priority:** P0 - Critical Path
**Est. Tokens:** 35k total
**Parallelization:** Full
**Agents:** 2 coder

---

## Prerequisites

- Docker container running: `meeting-bingo-dev-1`
- Dependencies installed

Verify:
```bash
docker ps --filter "name=meeting-bingo-dev-1"
```

---

## Agent 1: Build Verification (OSD-37)

**Est. Tokens:** 20k
**Linear Issue:** https://linear.app/openspace/issue/OSD-37

### Prompt

```
You are a coder agent executing Linear issue OSD-37.

## Task
Verify that the Meeting Bingo production build compiles and runs correctly in Docker.

## Commands to Execute

1. Build production bundle:
docker exec meeting-bingo-dev-1 npm run build

2. Check build output:
docker exec meeting-bingo-dev-1 ls -la dist/
docker exec meeting-bingo-dev-1 ls -la dist/assets/

3. Preview the build:
docker exec meeting-bingo-dev-1 npm run preview

4. Test in browser at http://localhost:4173

## Acceptance Criteria

- [ ] `npm run build` completes with exit code 0
- [ ] `dist/index.html` exists
- [ ] `dist/assets/` contains .js and .css files
- [ ] JavaScript bundle < 200KB (gzipped < 70KB)
- [ ] CSS bundle < 15KB (gzipped < 5KB)
- [ ] Preview serves application correctly
- [ ] No console errors in browser

## Verification Checklist

Test each screen:
- [ ] Landing page loads with "New Game" button
- [ ] Category selection shows 3 options
- [ ] Game screen displays 5x5 grid
- [ ] Win screen shows after completing bingo

## Output

Report results:
1. Build status (pass/fail)
2. Bundle sizes
3. Any errors encountered
4. Screenshot or description of each screen tested
```

### Success Criteria

Build verification passes when:
- Build completes without errors
- Bundle sizes within limits
- All screens render correctly

---

## Agent 2: Vercel Configuration (OSD-38)

**Est. Tokens:** 15k
**Linear Issue:** https://linear.app/openspace/issue/OSD-38

### Prompt

```
You are a coder agent executing Linear issue OSD-38.

## Task
Create Vercel deployment configuration for the Vite React application.

## Files to Create

### 1. vercel.json

Create `/Users/jesslam/Documents/Projects/meeting-bingo-demo/vercel.json`:

{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}

### 2. Update .gitignore

Add to .gitignore if not present:
- .vercel

## Validation

After creating files, verify:
1. vercel.json is valid JSON
2. .gitignore includes .vercel

## Output

Report:
1. Files created
2. Validation status
3. Ready for deployment confirmation
```

### Success Criteria

Configuration complete when:
- `vercel.json` created with correct schema
- `.gitignore` updated
- JSON validates without errors

---

## Wave 1 Completion

### Gate Check

Both agents must report success before proceeding to Wave 2.

```bash
# Verify build artifacts exist
docker exec meeting-bingo-dev-1 ls -la dist/

# Verify vercel.json exists
cat vercel.json
```

### Handoff to Wave 2

Once Wave 1 completes:
1. Mark OSD-37 as Done in Linear
2. Mark OSD-38 as Done in Linear
3. Proceed to Wave 2 (Deploy)

---

## Troubleshooting

### Build Fails

```bash
# Check for TypeScript errors
docker exec meeting-bingo-dev-1 npm run typecheck

# Check for lint errors
docker exec meeting-bingo-dev-1 npm run lint

# Rebuild with verbose output
docker exec meeting-bingo-dev-1 npm run build -- --debug
```

### Preview Not Working

```bash
# Check if port is in use
lsof -i :4173

# Restart container
docker compose --profile dev restart dev
```
