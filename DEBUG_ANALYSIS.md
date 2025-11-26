# Dhruva Demo - Simulation Mode Debug Analysis

## Problem Statement
The Vercel deployment at `https://dhruva-demo.vercel.app` is showing "Simulation" mode instead of "Real ML" mode, even though:
- Railway backend is healthy and responding
- CORS is properly configured
- Code has correct Railway URL hardcoded

## Systematic Cause Analysis

### ELIMINATED CAUSES (Verified NOT the issue)

| # | Possible Cause | Status | Evidence |
|---|----------------|--------|----------|
| 1 | Railway backend down | ELIMINATED | `curl https://web-production-9dfcb.up.railway.app/health` returns 200 OK |
| 2 | ML analyze endpoint broken | ELIMINATED | `curl -X POST /api/v1/ml/analyze` returns real ML results |
| 3 | CORS blocking requests | ELIMINATED | OPTIONS preflight returns `Access-Control-Allow-Origin: https://dhruva-demo.vercel.app` |
| 4 | Wrong Railway URL in code | ELIMINATED | Hardcoded fallback is `https://web-production-9dfcb.up.railway.app` |
| 5 | Missing environment variables | ELIMINATED | Hardcoded fallback doesn't need env vars |
| 6 | Health check returns unhealthy | ELIMINATED | HTTP 200 OK returned, code treats any 200 as healthy |

### REMAINING SUSPECTS (Need investigation)

| # | Possible Cause | Status | Next Steps |
|---|----------------|--------|------------|
| 7 | Vercel deployment using OLD code | SUSPECT | Check if latest commit deployed, verify bundle contains new URL |
| 8 | API call timing out (15s) | SUSPECT | Add logging to see if timeout is triggered |
| 9 | API call throwing error silently | SUSPECT | Add detailed error logging in catch block |
| 10 | JSON parsing error | SUSPECT | API response might not match expected TypeScript interface |
| 11 | Health check race condition | SUSPECT | Health check might fail initially, never recover |
| 12 | Browser blocking mixed content | UNLIKELY | Both HTTPS, but worth checking |
| 13 | AbortController not supported | UNLIKELY | Modern browsers support it |

## Debug Logging Added

### In api.ts:
- Log API_URL on initialization
- Log health check request/response
- Log analyze request/response
- Log all errors with full stack traces

### In DemoContext.tsx:
- Log backendAvailable state changes
- Log when API path vs simulation path is taken
- Log full error details on catch

## Test Plan
1. Deploy with logging
2. Open browser console on Vercel deployment
3. Submit a grievance
4. Check console for:
   - What URL is being used
   - Is health check passing
   - Is API call being made
   - What error (if any) is thrown

## Timeline
- Debug logging added: [TIMESTAMP]
- Deployed to Vercel: [PENDING]
- Results: [PENDING]
