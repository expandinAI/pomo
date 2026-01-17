# POMO-015: PWA manifest and service worker

**Status:** DONE
**Priority:** P0 - Urgent
**Estimate:** 3 points
**Epic:** Technical Foundation
**Labels:** `pwa`, `technical`

## Beschreibung
Set up Progressive Web App capabilities.

## Akzeptanzkriterien
- [x] Valid manifest.json
- [x] App icons (192px, 512px)
- [x] Install prompt works on supported browsers
- [x] App launches in standalone mode
- [x] Basic offline capability
- [x] Proper theme colors

## Technische Notizen
- Use next-pwa or manual setup
- Test on Chrome, Safari, Firefox
- Maskable icons for Android

## Implementierungslog
- 2026-01-17: Teilweise implementiert
  - Manifest: `public/manifest.json`
  - Icons: nur 192px vorhanden
- 2026-01-17: Fertiggestellt
  - Icons: `public/icons/icon-192.png` und `icon-512.png`
  - Service Worker: `public/sw.js` (network-first, cache fallback)
  - SW Registration: `src/app/layout.tsx`
  - Offline: App cached für offline Nutzung
  - Install prompt: funktioniert mit manifest + SW
