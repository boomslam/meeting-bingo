# Security Plan - Meeting Bingo

## Overview

This document outlines the security scanning strategy for the Meeting Bingo application. All security checks run automatically on PRs and block deployment to Vercel if any high-severity issues are found.

## Application Profile

| Attribute | Value |
|-----------|-------|
| Framework | React 18 + TypeScript + Vite |
| Backend | None (browser-only SPA) |
| External APIs | None (Web Speech API is browser-native) |
| Deployment | Vercel |
| Storage | localStorage (non-sensitive game state only) |

## Security Scanning Strategy

### 1. Dependency Vulnerability Scanning

**Tools:**
- **GitHub Dependabot** - Automatic alerts and PRs for vulnerable dependencies
- **Dependency Review Action** - Blocks PRs that introduce vulnerabilities
- **npm audit** - Additional check during CI

**Configuration:**
- Fail on: `high` and `critical` severity
- Schedule: On every PR + weekly scheduled scan

### 2. Static Application Security Testing (SAST)

**Tools:**
- **GitHub CodeQL** - Deep semantic analysis for JavaScript/TypeScript
- **ESLint Security Plugin** - Development-time security linting

**Coverage:**
- XSS vulnerabilities
- Injection attacks
- Insecure patterns
- React-specific security issues

### 3. Secrets Detection

**Tool:** Gitleaks

**Why Gitleaks:**
- Fast and lightweight
- Low false positive rate
- Scans entire git history
- Free and open source

**What it detects:**
- API keys
- Passwords
- Tokens
- Private keys
- Other sensitive patterns

### 4. Build Security

**Checks:**
- TypeScript strict mode compilation
- ESLint with security rules
- Production build verification

### 5. Browser Security Headers

**Headers added via `vercel.json`:**

| Header | Value | Purpose |
|--------|-------|---------|
| Content-Security-Policy | Strict policy | Prevent XSS, injection |
| X-Content-Type-Options | nosniff | Prevent MIME sniffing |
| X-Frame-Options | DENY | Prevent clickjacking |
| Referrer-Policy | strict-origin-when-cross-origin | Limit referrer leakage |

## GitHub Actions Workflow

### Trigger Events

| Event | Action |
|-------|--------|
| Pull Request to `main` | Run all security checks, block merge if failed |
| Push to `main` | Run checks, alert on failure |
| Weekly schedule | Full scan for new vulnerabilities |

### Jobs

```
┌─────────────────────────────────────────────────────────────────┐
│                        PR / Push to main                         │
└─────────────────────────────────────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│  dependency-  │    │    codeql     │    │   secrets-    │
│    review     │    │    (SAST)     │    │     scan      │
└───────────────┘    └───────────────┘    └───────────────┘
        │                       │                       │
        ▼                       ▼                       ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│   npm-audit   │    │     lint      │    │  build-test   │
└───────────────┘    └───────────────┘    └───────────────┘
        │                       │                       │
        └───────────────────────┼───────────────────────┘
                                ▼
                    ┌───────────────────┐
                    │  All checks pass  │
                    │  → Allow merge    │
                    │  → Vercel deploys │
                    └───────────────────┘
```

### Failure Behavior

| Check Failed | Action |
|--------------|--------|
| dependency-review | Block PR merge |
| npm-audit (high/critical) | Block PR merge |
| codeql | Block PR merge |
| secrets-scan | Block PR merge |
| lint | Block PR merge |
| build-test | Block PR merge |

## Tool Selection Rationale

| Tool | Why Selected | Alternatives Considered |
|------|--------------|------------------------|
| Dependabot | Built-in, zero config, automatic PRs | Snyk (paid), Renovate |
| CodeQL | Free for OSS, low false positives, deep analysis | Semgrep, SonarCloud |
| Gitleaks | Fast, lightweight, accurate | TruffleHog (heavier) |
| ESLint security | Integrates with existing lint setup | Biome |

## Implementation Files

```
.github/
└── workflows/
    └── security.yml      # Main security workflow

vercel.json               # Security headers config

.eslintrc.cjs             # Updated with security plugin

docs/security/
├── SECURITY_PLAN.md      # This document
└── INCIDENT_RESPONSE.md  # (Future) Incident procedures
```

## Security Checklist for Contributors

Before submitting a PR:

- [ ] No hardcoded secrets, API keys, or passwords
- [ ] No `dangerouslySetInnerHTML` usage
- [ ] User input is validated/sanitized
- [ ] No sensitive data stored in localStorage
- [ ] Dependencies are from trusted sources
- [ ] `npm audit` shows no high/critical vulnerabilities

## Monitoring & Alerts

| Alert Type | Destination |
|------------|-------------|
| Dependabot alerts | GitHub Security tab |
| CodeQL findings | GitHub Security tab |
| CI failures | PR checks, email |
| Weekly scan results | GitHub Actions summary |

## Future Enhancements

1. **DAST (Dynamic Analysis)** - Add runtime security testing with OWASP ZAP
2. **SCA License Compliance** - Verify dependency licenses
3. **Penetration Testing** - Manual security review before major releases
4. **Bug Bounty** - Consider for production-scale deployment

---

*Last updated: January 31, 2026*
*Ticket: OSD-121*
