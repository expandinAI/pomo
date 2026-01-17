# POMO-018: Performance optimization (<100KB)

**Status:** TODO
**Priority:** P1 - High
**Estimate:** 2 points
**Epic:** Technical Foundation
**Labels:** `technical`, `performance`

## Beschreibung
Ensure the app meets performance targets.

## Akzeptanzkriterien
- [ ] Total JS bundle < 100KB (gzipped)
- [ ] LCP < 1.5s
- [ ] CLS < 0.1
- [ ] Lighthouse Performance > 95
- [ ] No unused dependencies
- [ ] Tree-shaking configured correctly

## Technische Notizen
- Analyze with next/bundle-analyzer
- Dynamic imports for heavy components
- Optimize images with next/image

## Implementierungslog
<!-- Notizen während der Implementierung hier eintragen -->
