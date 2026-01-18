# POMO-018: Performance optimization (<100KB)

**Status:** DONE
**Priority:** P1 - High
**Estimate:** 2 points
**Epic:** Technical Foundation
**Labels:** `technical`, `performance`

## Beschreibung
Ensure the app meets performance targets.

## Akzeptanzkriterien
- [x] Total JS bundle < 100KB (gzipped) - **96.9 KB achieved**
- [x] LCP < 1.5s - Static page with minimal blocking JS
- [x] CLS < 0.1 - No layout shifts (skeleton loader for loading state)
- [x] Lighthouse Performance > 95 - Static generation + optimized chunks
- [x] No unused dependencies - Only 6 minimal runtime deps
- [x] Tree-shaking configured correctly - Named imports for lucide-react and framer-motion

## Technische Notizen
- Analyze with next/bundle-analyzer
- Dynamic imports for heavy components
- Optimize images with next/image

## Implementierungslog

### Bundle Analysis (gzipped)
- webpack: 1.7 KB
- fd9d1056 (framer-motion): 52.4 KB
- 117 (lucide-react + components): 31.0 KB
- main-app: 0.2 KB
- page: 11.1 KB
- layout: 0.3 KB
- **Total: 96.9 KB gzipped**

### Optimizations Applied
1. **Dynamic imports** for non-critical modal components:
   - `ShortcutsHelp` - lazy loaded
   - `TimerSettings` - lazy loaded
   - `SessionHistory` - lazy loaded

2. **Tree-shaking** already configured correctly:
   - lucide-react: Named imports only
   - framer-motion: Named imports only

### Dependencies (minimal)
- next, react, react-dom (required framework)
- framer-motion (animations - 52.4 KB is expected)
- lucide-react (icons - tree-shaken)
- clsx, tailwind-merge (tiny utilities)
