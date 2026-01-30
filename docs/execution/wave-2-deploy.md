# Wave 2: Deployment

**Priority:** P0 - Critical Path
**Est. Tokens:** 30k
**Parallelization:** Sequential (blocked by Wave 1)
**Agents:** 1 coder

---

## Prerequisites

- Wave 1 completed (OSD-37, OSD-38)
- Build verification passed
- `vercel.json` created
- Vercel account available

---

## Agent 1: Deploy to Vercel (OSD-39)

**Est. Tokens:** 30k
**Linear Issue:** https://linear.app/openspace/issue/OSD-39
**Blocked By:** OSD-37, OSD-38

### Prompt

```
You are a coder agent executing Linear issue OSD-39.

## Task
Deploy the Meeting Bingo application to Vercel production.

## Prerequisites Verification

Confirm these are complete:
- [ ] OSD-37: Build verification passed
- [ ] OSD-38: vercel.json created

## Deployment Steps

### Option A: Vercel CLI (Recommended)

1. Install/update Vercel CLI:
npm install -g vercel

2. Navigate to project:
cd /Users/jesslam/Documents/Projects/meeting-bingo-demo

3. Deploy preview first:
vercel

4. If preview works, deploy production:
vercel --prod

### Option B: If CLI authentication issues

Use npx for one-time execution:
npx vercel --prod

## Expected Prompts

During first deployment, answer:
- Set up and deploy? Yes
- Which scope? (select your account)
- Link to existing project? No
- Project name? meeting-bingo
- Directory with code? ./
- Override settings? No

## Post-Deployment Verification

Once deployed, verify:

1. Open production URL (e.g., meeting-bingo.vercel.app)

2. Test Landing Page:
   - [ ] Page loads without errors
   - [ ] "New Game" button visible
   - [ ] Gradient background renders

3. Test Category Selection:
   - [ ] Click "New Game"
   - [ ] 3 category cards displayed
   - [ ] Hover effects work

4. Test Game Screen:
   - [ ] Select any category
   - [ ] 5x5 grid renders
   - [ ] Free space at center
   - [ ] "Start Listening" button visible

5. Test Speech Recognition:
   - [ ] Click "Start Listening"
   - [ ] Browser prompts for microphone permission
   - [ ] Grant permission
   - [ ] Red pulsing indicator shows
   - [ ] Transcript area shows spoken words

6. Test Manual Mode:
   - [ ] Click squares to toggle
   - [ ] Filled squares change color
   - [ ] Can unfill by clicking again

7. Test Bingo Win:
   - [ ] Fill 5 squares in a row
   - [ ] Confetti fires
   - [ ] Win screen displays

8. Test Mobile (if possible):
   - [ ] Open on phone
   - [ ] Layout responsive
   - [ ] Touch interactions work

## HTTPS Verification

CRITICAL: Web Speech API requires HTTPS.

Verify:
- [ ] URL starts with https://
- [ ] No mixed content warnings
- [ ] SSL certificate valid

## Output

Report:
1. Production URL
2. Deployment status
3. Verification checklist results
4. Any issues encountered
5. Screenshot links (if available)
```

### Success Criteria

Deployment successful when:
- Application accessible at Vercel URL
- HTTPS enabled
- All 4 screens functional
- Speech recognition works
- Mobile responsive

---

## Wave 2 Completion

### Gate Check

```bash
# Verify deployment
curl -I https://meeting-bingo.vercel.app

# Should return 200 OK with HTTPS
```

### Handoff to Wave 3

Once Wave 2 completes:
1. Mark OSD-39 as Done in Linear
2. Update project status
3. Proceed to Wave 3 (Features & Testing)

---

## Troubleshooting

### Deployment Fails

```bash
# Check Vercel logs
vercel logs

# Redeploy with debug
vercel --debug

# Check build locally first
docker exec meeting-bingo-dev-1 npm run build
```

### SSL Issues

Vercel provides automatic SSL. If issues:
1. Wait 5 minutes for certificate provisioning
2. Clear browser cache
3. Try incognito window

### Speech Recognition Not Working

1. Verify HTTPS (not HTTP)
2. Check browser console for errors
3. Ensure microphone permissions granted
4. Test in Chrome (best support)

### Domain Issues

If custom domain needed later:
```bash
vercel domains add yourdomain.com
```
