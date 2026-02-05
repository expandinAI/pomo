'use client';

import { useState, useEffect, useCallback } from 'react';
import { getIntentionsForWeek } from '@/lib/intentions/storage';
import { getSessionsForDate } from '@/lib/db/sessions';
import type { DBIntention } from '@/lib/db/types';
import type { IntentionAlignment } from '@/lib/db/types';

interface DayIntentionData {
  date: string;
  dayLabel: string;
  isToday: boolean;
  intention: DBIntention | null;
  particles: Array<{ id: string; alignment?: IntentionAlignment }>;
  alignedCount: number;
  reactiveCount: number;
  alignmentPercentage: number | null;
}

interface WeekIntentionsData {
  days: DayIntentionData[];
  weekLabel: string;
  totalParticles: number;
  totalAligned: number;
  intentionalPercentage: number | null;
  daysWithIntention: number;
  isCurrentWeek: boolean;
}

interface UseWeekIntentionsReturn {
  data: WeekIntentionsData | null;
  isLoading: boolean;
  weekOffset: number;
  goToPreviousWeek: () => void;
  goToNextWeek: () => void;
  goToCurrentWeek: () => void;
  refresh: () => Promise<void>;
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatWeekLabel(monday: Date): string {
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);

  const startMonth = monday.toLocaleString('en-US', { month: 'short' });
  const endMonth = sunday.toLocaleString('en-US', { month: 'short' });
  const year = sunday.getFullYear();

  if (startMonth === endMonth) {
    return `${startMonth} ${monday.getDate()}–${sunday.getDate()}, ${year}`;
  }
  return `${startMonth} ${monday.getDate()} – ${endMonth} ${sunday.getDate()}, ${year}`;
}

export function useWeekIntentions(): UseWeekIntentionsReturn {
  const [weekOffset, setWeekOffset] = useState(0);
  const [data, setData] = useState<WeekIntentionsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayString = formatDateString(today);

      const currentMonday = getMonday(today);
      const targetMonday = new Date(currentMonday);
      targetMonday.setDate(targetMonday.getDate() + weekOffset * 7);

      const startDate = formatDateString(targetMonday);
      const isCurrentWeek = weekOffset === 0;

      // Load intentions for the week
      const intentions = await getIntentionsForWeek(startDate);
      const intentionsByDate = new Map<string, DBIntention>();
      for (const intention of intentions) {
        // Keep the most recent intention per date
        const existing = intentionsByDate.get(intention.date);
        if (!existing || new Date(intention.localUpdatedAt) > new Date(existing.localUpdatedAt)) {
          intentionsByDate.set(intention.date, intention);
        }
      }

      // Load sessions for each day
      const days: DayIntentionData[] = [];
      let totalParticles = 0;
      let totalAligned = 0;

      for (let i = 0; i < 7; i++) {
        const dayDate = new Date(targetMonday);
        dayDate.setDate(dayDate.getDate() + i);
        const dateString = formatDateString(dayDate);

        const allSessions = await getSessionsForDate(dateString);
        const workSessions = allSessions.filter(s => s.type === 'work');

        const intention = intentionsByDate.get(dateString) ?? null;
        const particles = workSessions.map(s => ({
          id: s.id,
          alignment: s.intentionAlignment,
        }));

        const alignedCount = workSessions.filter(
          s => s.intentionAlignment === 'aligned' || s.intentionAlignment === 'none' || !s.intentionAlignment
        ).length;
        const reactiveCount = workSessions.filter(s => s.intentionAlignment === 'reactive').length;
        const alignmentPercentage = workSessions.length > 0
          ? Math.round((alignedCount / workSessions.length) * 100)
          : null;

        totalParticles += workSessions.length;
        totalAligned += alignedCount;

        days.push({
          date: dateString,
          dayLabel: DAY_LABELS[i],
          isToday: dateString === todayString,
          intention,
          particles,
          alignedCount,
          reactiveCount,
          alignmentPercentage,
        });
      }

      const daysWithIntention = days.filter(d => d.intention !== null).length;
      const intentionalPercentage = totalParticles > 0
        ? Math.round((totalAligned / totalParticles) * 100)
        : null;

      setData({
        days,
        weekLabel: formatWeekLabel(targetMonday),
        totalParticles,
        totalAligned,
        intentionalPercentage,
        daysWithIntention,
        isCurrentWeek,
      });
    } catch (error) {
      console.error('[WeekIntentions] Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [weekOffset]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const goToPreviousWeek = useCallback(() => setWeekOffset(o => o - 1), []);
  const goToNextWeek = useCallback(() => setWeekOffset(o => o + 1), []);
  const goToCurrentWeek = useCallback(() => setWeekOffset(0), []);

  return {
    data,
    isLoading,
    weekOffset,
    goToPreviousWeek,
    goToNextWeek,
    goToCurrentWeek,
    refresh: loadData,
  };
}
