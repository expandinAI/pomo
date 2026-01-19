---
type: story
status: backlog
priority: p0
effort: 3
feature: "[[features/command-palette]]"
created: 2026-01-19
updated: 2026-01-19
done_date: null
tags: [command-palette, architecture, p0]
---

# POMO-060: Command Registry

## User Story

> Als **Entwickler**
> möchte ich **Commands zentral registrieren können**,
> damit **neue Features automatisch in der Palette erscheinen**.

## Kontext

Link zum Feature: [[features/command-palette]]

Zentrale Registry für alle Commands mit TypeScript-Typen. Muss als erstes implementiert werden.

## Akzeptanzkriterien

- [ ] **Given** commandRegistry.ts, **When** vorhanden, **Then** zentrale Datei
- [ ] **Given** Command, **When** registriert, **Then** dynamisch hinzufügbar
- [ ] **Given** Command mit disabled, **When** abgerufen, **Then** State automatisch aktualisiert
- [ ] **Given** Command mit shortcut, **When** registriert, **Then** globaler Handler verknüpft
- [ ] **Given** alle Commands, **When** TypeScript, **Then** vollständig typisiert

## Technische Details

### Neue Datei: `src/lib/commandRegistry.ts`
```typescript
interface Command {
  id: string;
  label: string;
  shortcut?: string;
  category: 'timer' | 'navigation' | 'settings' | 'integration';
  action: () => void;
  icon?: React.ReactNode;
  keywords?: string[];
  disabled?: boolean | (() => boolean);
}

const commands: Map<string, Command> = new Map();

export function registerCommand(command: Command): void {
  commands.set(command.id, command);
}

export function unregisterCommand(id: string): void {
  commands.delete(id);
}

export function getCommands(): Command[] {
  return Array.from(commands.values());
}

export function getCommandById(id: string): Command | undefined {
  return commands.get(id);
}

export function executeCommand(id: string): boolean {
  const cmd = commands.get(id);
  if (!cmd) return false;

  const isDisabled = typeof cmd.disabled === 'function'
    ? cmd.disabled()
    : cmd.disabled;

  if (isDisabled) return false;

  cmd.action();
  addToRecent(id);
  return true;
}
```

### Initiale Commands registrieren
```typescript
// Timer Commands
registerCommand({
  id: 'timer.start',
  label: 'Start Session',
  shortcut: 'Space',
  category: 'timer',
  action: () => timerStore.start(),
  disabled: () => timerStore.isRunning,
});

// Navigation Commands
registerCommand({
  id: 'nav.statistics',
  label: 'Go to Statistics',
  shortcut: 'G S',
  category: 'navigation',
  action: () => router.push('/stats'),
});

// Settings Commands
registerCommand({
  id: 'settings.toggle-dnd',
  label: 'Toggle Do Not Disturb',
  shortcut: 'D',
  category: 'settings',
  action: () => settingsStore.toggleDND(),
});
```

## Testing

### Manuell zu testen
- [ ] Commands registrierbar
- [ ] getCommands() liefert alle
- [ ] executeCommand() führt aus
- [ ] Disabled-State funktioniert
- [ ] Shortcuts verknüpft

## Definition of Done

- [ ] commandRegistry.ts erstellt
- [ ] TypeScript Interfaces
- [ ] CRUD Funktionen
- [ ] Initiale Commands registriert
- [ ] Disabled-State dynamic
