# POMO-162: Settings Overlay Polish

## Story
**As a** user
**I want** a consistent, compact, and polished Settings overlay
**So that** I can quickly configure my preferences without excessive scrolling

## Context
The Settings overlay has grown organically and now shows inconsistencies:
- Mixed language (German in WeekStartSetting, English everywhere else)
- Different layout patterns (1-column vs 2-column grids)
- Excessive vertical space usage requiring scrolling
- No shared components for common patterns (toggles, sliders, option grids)

## Acceptance Criteria

### Language Consistency
- [ ] All labels, descriptions, and options in English
- [ ] Fix `WeekStartSetting.tsx`: "Wochenstart" → "Week Start"
- [ ] Fix labels: "Montag" → "Monday", "Sonntag" → "Sunday"
- [ ] Fix description: "Erster Tag der Woche..." → "First day of week..."

### Compact Layout
- [ ] Particle Style: Change from 4x1 vertical to 2x2 grid
- [ ] Reduce section spacing from `space-y-5` to `space-y-4` in main container
- [ ] Consider collapsible sections for Visual Effects sub-settings
- [ ] Aim for minimal scrolling on standard viewport (900px height)

### Systematic Design Patterns
- [ ] Create shared `SettingsToggle` component for consistent toggle rows
- [ ] Create shared `SettingsOptionGrid` component for option buttons
- [ ] Standardize label styling across all sections
- [ ] Consistent padding: `p-3` for all interactive cards

### Visual Polish
- [ ] Consistent ring styling on selected states
- [ ] Consistent icon sizing (w-4 h-4 for all section icons)
- [ ] Review and unify transition durations

## Technical Notes

### Files to Modify
1. `src/components/settings/WeekStartSetting.tsx` - Language fix
2. `src/components/settings/VisualEffectsSettings.tsx` - Grid layout for Particle Style
3. `src/components/settings/TimerSettings.tsx` - Reduce main spacing
4. (Optional) Create `src/components/settings/shared/` for reusable components

### Current Structure Analysis
| Setting Section | Layout | Items | Notes |
|----------------|--------|-------|-------|
| Timer Presets | 4-col grid | 4 | Good |
| Custom Preset | Sliders | 4 | Good, conditional |
| Overflow Mode | Toggle | 1 | Good |
| Auto-Start | Toggle + options | 1+2+3 | Good, collapsible |
| Volume | Slider | 1 | Good |
| Session Sound | Toggle | 1 | Good |
| Completion Sound | 2-col grid | 4 | Good |
| Ambient Volume | Slider | 1 | Good |
| Ambient Sound | 2-col grid | 6 | Good |
| Visual Effects | Toggle | 1 | Good |
| Visual Mode | 3-col grid | 3 | Good |
| **Particle Style** | **1-col** | **4** | **→ Change to 2-col** |
| Parallax Depth | Toggle | 1 | Good |
| Particle Pace | 3-col grid | 3 | Good |
| Week Start | 2-col grid | 2 | Language fix needed |

### Design Tokens to Apply
- Section spacing: `space-y-4` (currently mixed)
- Inner spacing: `space-y-2`
- Card padding: `p-3`
- Label: `text-xs font-medium text-tertiary uppercase tracking-wider`

## Out of Scope
- Adding new settings
- Changing settings functionality
- Settings persistence changes

## Estimation
**Complexity:** Low
**Impact:** Medium (UX polish)

## Related
- Part of overall UI polish initiative
- CLAUDE.md design guidelines

---
*Created: 2025-01-24*
