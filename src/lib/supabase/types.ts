/**
 * Supabase Database Types
 *
 * Manual type definitions based on schema.sql
 * TODO: Replace with generated types from `supabase gen types typescript`
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserTier = 'free' | 'flow' | 'pro' | 'lifetime';
export type SubscriptionStatus = 'active' | 'cancelled' | 'past_due' | 'trialing';
export type SessionMode = 'work' | 'break' | 'longBreak';
export type Theme = 'light' | 'dark' | 'system';
export type AutoStartMode = 'all' | 'breaks-only';
export type AutoStartDelay = 3 | 5 | 10;

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          clerk_id: string;
          email: string | null;
          tier: UserTier;
          subscription_status: SubscriptionStatus | null;
          subscription_ends_at: string | null;
          trial_started_at: string | null;
          trial_ends_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          clerk_id: string;
          email?: string | null;
          tier?: UserTier;
          subscription_status?: SubscriptionStatus | null;
          subscription_ends_at?: string | null;
          trial_started_at?: string | null;
          trial_ends_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          clerk_id?: string;
          email?: string | null;
          tier?: UserTier;
          subscription_status?: SubscriptionStatus | null;
          subscription_ends_at?: string | null;
          trial_started_at?: string | null;
          trial_ends_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      sessions: {
        Row: {
          id: string;
          user_id: string;
          local_id: string;
          started_at: string;
          ended_at: string | null;
          duration_seconds: number;
          mode: SessionMode;
          project_id: string | null;
          task: string | null;
          is_overflow: boolean;
          overflow_seconds: number;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          local_id: string;
          started_at: string;
          ended_at?: string | null;
          duration_seconds: number;
          mode: SessionMode;
          project_id?: string | null;
          task?: string | null;
          is_overflow?: boolean;
          overflow_seconds?: number;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          local_id?: string;
          started_at?: string;
          ended_at?: string | null;
          duration_seconds?: number;
          mode?: SessionMode;
          project_id?: string | null;
          task?: string | null;
          is_overflow?: boolean;
          overflow_seconds?: number;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          local_id: string;
          name: string;
          color: string | null;
          icon: string | null;
          is_active: boolean;
          sort_order: number;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          local_id: string;
          name: string;
          color?: string | null;
          icon?: string | null;
          is_active?: boolean;
          sort_order?: number;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          local_id?: string;
          name?: string;
          color?: string | null;
          icon?: string | null;
          is_active?: boolean;
          sort_order?: number;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_settings: {
        Row: {
          id: string;
          user_id: string;
          work_duration_seconds: number;
          break_duration_seconds: number;
          long_break_duration_seconds: number;
          sessions_until_long_break: number;
          auto_start_breaks: boolean;
          auto_start_work: boolean;
          sound_enabled: boolean;
          notification_enabled: boolean;
          theme: Theme;
          keyboard_hints_visible: boolean;
          settings_json: Json;
          // Workflow settings (synced between devices) - POMO-308
          overflow_enabled: boolean;
          daily_goal: number | null;
          auto_start_delay: AutoStartDelay;
          auto_start_mode: AutoStartMode;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          work_duration_seconds?: number;
          break_duration_seconds?: number;
          long_break_duration_seconds?: number;
          sessions_until_long_break?: number;
          auto_start_breaks?: boolean;
          auto_start_work?: boolean;
          sound_enabled?: boolean;
          notification_enabled?: boolean;
          theme?: Theme;
          keyboard_hints_visible?: boolean;
          settings_json?: Json;
          // Workflow settings (synced between devices) - POMO-308
          overflow_enabled?: boolean;
          daily_goal?: number | null;
          auto_start_delay?: AutoStartDelay;
          auto_start_mode?: AutoStartMode;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          work_duration_seconds?: number;
          break_duration_seconds?: number;
          long_break_duration_seconds?: number;
          sessions_until_long_break?: number;
          auto_start_breaks?: boolean;
          auto_start_work?: boolean;
          sound_enabled?: boolean;
          notification_enabled?: boolean;
          theme?: Theme;
          keyboard_hints_visible?: boolean;
          settings_json?: Json;
          // Workflow settings (synced between devices) - POMO-308
          overflow_enabled?: boolean;
          daily_goal?: number | null;
          auto_start_delay?: AutoStartDelay;
          auto_start_mode?: AutoStartMode;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_user_id: {
        Args: Record<string, never>;
        Returns: string | null;
      };
      is_authenticated: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Convenience type aliases
export type User = Database['public']['Tables']['users']['Row'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type UserUpdate = Database['public']['Tables']['users']['Update'];

export type Session = Database['public']['Tables']['sessions']['Row'];
export type SessionInsert = Database['public']['Tables']['sessions']['Insert'];
export type SessionUpdate = Database['public']['Tables']['sessions']['Update'];

export type Project = Database['public']['Tables']['projects']['Row'];
export type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
export type ProjectUpdate = Database['public']['Tables']['projects']['Update'];

export type UserSettings = Database['public']['Tables']['user_settings']['Row'];
export type UserSettingsInsert = Database['public']['Tables']['user_settings']['Insert'];
export type UserSettingsUpdate = Database['public']['Tables']['user_settings']['Update'];
