'use client';

import { motion } from 'framer-motion';
import { SPRING } from '@/styles/design-tokens';
import { prefersReducedMotion } from '@/lib/utils';

export type DashboardTab = 'overview' | 'history';

interface DashboardTabsProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function TabButton({ active, onClick, children }: TabButtonProps) {
  const reducedMotion = prefersReducedMotion();

  return (
    <button
      onClick={onClick}
      className={`
        relative px-4 py-2 text-sm font-medium rounded-lg transition-colors
        focus:outline-none focus-visible:ring-2 focus-visible:ring-accent
        ${active
          ? 'text-primary light:text-primary-dark'
          : 'text-tertiary light:text-tertiary-dark hover:text-secondary light:hover:text-secondary-dark'
        }
      `}
      aria-selected={active}
      role="tab"
    >
      {children}
      {active && (
        <motion.div
          layoutId="activeTab"
          className="absolute inset-0 bg-tertiary/10 light:bg-tertiary-dark/10 rounded-lg -z-10"
          initial={false}
          transition={reducedMotion ? { duration: 0 } : { type: 'spring', ...SPRING.snappy }}
        />
      )}
    </button>
  );
}

/**
 * Tab navigation for the Statistics Dashboard
 * Switches between Overview and History views
 */
export function DashboardTabs({ activeTab, onTabChange }: DashboardTabsProps) {
  return (
    <div
      className="flex gap-1 px-4 pb-3 border-b border-tertiary/10 light:border-tertiary-dark/10"
      role="tablist"
      aria-label="Dashboard views"
    >
      <TabButton
        active={activeTab === 'overview'}
        onClick={() => onTabChange('overview')}
      >
        Overview
      </TabButton>
      <TabButton
        active={activeTab === 'history'}
        onClick={() => onTabChange('history')}
      >
        History
      </TabButton>
    </div>
  );
}
