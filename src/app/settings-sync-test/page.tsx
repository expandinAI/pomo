'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useSupabase, useSupabaseUser, isSupabaseConfigured } from '@/lib/supabase';
import {
  extractSyncedSettings,
  applySyncedSettings,
  pushSettings,
  pullSettings,
  dispatchSettingsChanged,
} from '@/lib/sync/settings-sync';
import type { SyncedSettings } from '@/lib/sync/types';
import { LAST_SETTINGS_SYNC_KEY } from '@/lib/sync/types';

export default function SettingsSyncTestPage() {
  const { isSignedIn, userId: clerkUserId } = useAuth();
  const supabase = useSupabase();
  const { user: supabaseUser, isLoading: userLoading } = useSupabaseUser();

  const [localSettings, setLocalSettings] = useState<SyncedSettings | null>(null);
  const [remoteSettings, setRemoteSettings] = useState<SyncedSettings | null>(null);
  const [remoteUpdatedAt, setRemoteUpdatedAt] = useState<string | null>(null);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Load local settings
  const loadLocal = useCallback(() => {
    const settings = extractSyncedSettings();
    setLocalSettings(settings);
    const lastSync = localStorage.getItem(LAST_SETTINGS_SYNC_KEY);
    setLastSyncAt(lastSync);
  }, []);

  // Load remote settings
  const loadRemote = useCallback(async () => {
    if (!supabase || !supabaseUser) return;

    setIsLoading(true);
    const { settings, updatedAt, error } = await pullSettings(supabase, supabaseUser.id);
    setIsLoading(false);

    if (error) {
      setMessage({ type: 'error', text: `Pull failed: ${error}` });
    } else if (settings) {
      setRemoteSettings(settings);
      setRemoteUpdatedAt(updatedAt);
      setMessage({ type: 'info', text: 'Remote settings loaded' });
    } else {
      setRemoteSettings(null);
      setMessage({ type: 'info', text: 'No remote settings found' });
    }
  }, [supabase, supabaseUser]);

  // Initial load
  useEffect(() => {
    loadLocal();
  }, [loadLocal]);

  useEffect(() => {
    if (supabaseUser) {
      loadRemote();
    }
  }, [supabaseUser, loadRemote]);

  // Listen for localStorage changes
  useEffect(() => {
    const handleStorage = () => {
      loadLocal();
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('particle:settings-synced', handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('particle:settings-synced', handleStorage);
    };
  }, [loadLocal]);

  // Push to remote
  const handlePush = async () => {
    if (!supabase || !supabaseUser || !localSettings) return;

    setIsLoading(true);
    setMessage({ type: 'info', text: 'Pushing...' });

    const { success, error } = await pushSettings(supabase, supabaseUser.id, localSettings);

    if (success) {
      localStorage.setItem(LAST_SETTINGS_SYNC_KEY, new Date().toISOString());
      setMessage({ type: 'success', text: 'Push successful!' });
      await loadRemote();
      loadLocal();
    } else {
      setMessage({ type: 'error', text: `Push failed: ${error}` });
    }

    setIsLoading(false);
  };

  // Pull from remote
  const handlePull = async () => {
    if (!supabase || !supabaseUser) return;

    setIsLoading(true);
    setMessage({ type: 'info', text: 'Pulling...' });

    const { settings, error } = await pullSettings(supabase, supabaseUser.id);

    if (error) {
      setMessage({ type: 'error', text: `Pull failed: ${error}` });
    } else if (settings) {
      const changed = applySyncedSettings(settings);
      if (changed) {
        dispatchSettingsChanged();
        setMessage({ type: 'success', text: 'Pull successful! Settings applied.' });
      } else {
        setMessage({ type: 'info', text: 'Pull successful! No changes needed.' });
      }
      localStorage.setItem(LAST_SETTINGS_SYNC_KEY, new Date().toISOString());
      loadLocal();
      await loadRemote();
    } else {
      setMessage({ type: 'info', text: 'No remote settings to pull' });
    }

    setIsLoading(false);
  };

  // Refresh both
  const handleRefresh = async () => {
    loadLocal();
    await loadRemote();
    setMessage({ type: 'info', text: 'Refreshed' });
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 font-mono">
      <h1 className="text-2xl mb-2">Settings Sync Test</h1>
      <p className="text-white/50 mb-8 text-sm">POMO-308 Workflow Settings Sync</p>

      {/* Status Message */}
      {message && (
        <div
          className={`mb-6 p-3 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-500/20 text-green-400'
              : message.type === 'error'
              ? 'bg-red-500/20 text-red-400'
              : 'bg-blue-500/20 text-blue-400'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        {/* Auth Status */}
        <Section title="Authentication">
          <Row label="Supabase configured" value={isSupabaseConfigured} />
          <Row label="Clerk signed in" value={isSignedIn} />
          <Row label="Clerk User ID" value={clerkUserId || '-'} />
          <Row label="Supabase User loading" value={userLoading} />
          <Row label="Supabase User ID" value={supabaseUser?.id || '-'} />
        </Section>

        {/* Sync Status */}
        <Section title="Sync Status">
          <Row label="Last sync" value={lastSyncAt ? formatDate(lastSyncAt) : 'Never'} />
          <Row label="Remote updated at" value={remoteUpdatedAt ? formatDate(remoteUpdatedAt) : '-'} />
        </Section>

        {/* Actions */}
        {supabaseUser && (
          <Section title="Actions">
            <div className="flex gap-3 flex-wrap">
              <Button onClick={handlePush} disabled={isLoading}>
                ↑ Push Local → Remote
              </Button>
              <Button onClick={handlePull} disabled={isLoading}>
                ↓ Pull Remote → Local
              </Button>
              <Button onClick={handleRefresh} disabled={isLoading} secondary>
                ⟳ Refresh
              </Button>
            </div>
          </Section>
        )}

        {/* Settings Comparison */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Local Settings */}
          <Section title="Local Settings (localStorage)">
            {localSettings ? (
              <SettingsDisplay settings={localSettings} />
            ) : (
              <p className="text-white/50">Loading...</p>
            )}
          </Section>

          {/* Remote Settings */}
          <Section title="Remote Settings (Supabase)">
            {!supabaseUser ? (
              <p className="text-yellow-500">Sign in to view remote settings</p>
            ) : isLoading ? (
              <p className="text-white/50">Loading...</p>
            ) : remoteSettings ? (
              <SettingsDisplay settings={remoteSettings} />
            ) : (
              <p className="text-white/50">No remote settings</p>
            )}
          </Section>
        </div>

        {/* Diff View */}
        {localSettings && remoteSettings && (
          <Section title="Differences">
            <DiffView local={localSettings} remote={remoteSettings} />
          </Section>
        )}

        {/* Instructions */}
        <Section title="Test Instructions">
          <ol className="list-decimal list-inside space-y-2 text-white/70 text-sm">
            <li>Ensure migration 003_settings_sync.sql is applied in Supabase</li>
            <li>Sign in with Clerk</li>
            <li>Click &quot;Push Local → Remote&quot; to upload current settings</li>
            <li>Open another browser/incognito and sign in</li>
            <li>Settings should sync automatically, or click &quot;Pull&quot;</li>
            <li>Change settings in the main app, observe sync here</li>
          </ol>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-white/20 rounded-lg p-4">
      <h2 className="text-sm text-white/50 mb-3">{title}</h2>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | boolean | number | undefined | null }) {
  const displayValue =
    typeof value === 'boolean' ? (value ? '✓ Yes' : '✗ No') : value ?? '-';

  const color =
    typeof value === 'boolean'
      ? value
        ? 'text-green-400'
        : 'text-red-400'
      : 'text-white';

  return (
    <div className="flex justify-between text-sm">
      <span className="text-white/70">{label}</span>
      <span className={color}>{displayValue}</span>
    </div>
  );
}

function Button({
  onClick,
  disabled,
  secondary,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  secondary?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        secondary
          ? 'bg-white/10 hover:bg-white/20 text-white'
          : 'bg-white text-black hover:bg-white/90'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}

function SettingsDisplay({ settings }: { settings: SyncedSettings }) {
  return (
    <div className="space-y-1 text-sm">
      <Row label="Preset" value={settings.presetId} />
      <Row label="Work" value={`${settings.workDuration / 60}m`} />
      <Row label="Short Break" value={`${settings.shortBreakDuration / 60}m`} />
      <Row label="Long Break" value={`${settings.longBreakDuration / 60}m`} />
      <Row label="Sessions until long" value={settings.sessionsUntilLongBreak} />
      <Row label="Overflow enabled" value={settings.overflowEnabled} />
      <Row label="Daily goal" value={settings.dailyGoal ?? 'None'} />
      <Row label="Auto-start enabled" value={settings.autoStartEnabled} />
      <Row label="Auto-start delay" value={`${settings.autoStartDelay}s`} />
      <Row label="Auto-start mode" value={settings.autoStartMode} />
      <Row label="Custom preset" value={settings.customPreset ? 'Yes' : 'No'} />
    </div>
  );
}

function DiffView({ local, remote }: { local: SyncedSettings; remote: SyncedSettings }) {
  const diffs: { field: string; local: string; remote: string }[] = [];

  const compare = (field: string, l: unknown, r: unknown) => {
    const lStr = String(l ?? 'null');
    const rStr = String(r ?? 'null');
    if (lStr !== rStr) {
      diffs.push({ field, local: lStr, remote: rStr });
    }
  };

  compare('presetId', local.presetId, remote.presetId);
  compare('workDuration', local.workDuration, remote.workDuration);
  compare('shortBreakDuration', local.shortBreakDuration, remote.shortBreakDuration);
  compare('longBreakDuration', local.longBreakDuration, remote.longBreakDuration);
  compare('sessionsUntilLongBreak', local.sessionsUntilLongBreak, remote.sessionsUntilLongBreak);
  compare('overflowEnabled', local.overflowEnabled, remote.overflowEnabled);
  compare('dailyGoal', local.dailyGoal, remote.dailyGoal);
  compare('autoStartEnabled', local.autoStartEnabled, remote.autoStartEnabled);
  compare('autoStartDelay', local.autoStartDelay, remote.autoStartDelay);
  compare('autoStartMode', local.autoStartMode, remote.autoStartMode);

  if (diffs.length === 0) {
    return <p className="text-green-400 text-sm">✓ Local and remote are in sync</p>;
  }

  return (
    <div className="space-y-2">
      <p className="text-yellow-400 text-sm">⚠ {diffs.length} difference(s) found:</p>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-white/50">
            <th className="text-left py-1">Field</th>
            <th className="text-left py-1">Local</th>
            <th className="text-left py-1">Remote</th>
          </tr>
        </thead>
        <tbody>
          {diffs.map((diff) => (
            <tr key={diff.field} className="border-t border-white/10">
              <td className="py-1 text-white/70">{diff.field}</td>
              <td className="py-1 text-blue-400">{diff.local}</td>
              <td className="py-1 text-purple-400">{diff.remote}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatDate(iso: string): string {
  try {
    const date = new Date(iso);
    return date.toLocaleString();
  } catch {
    return iso;
  }
}
