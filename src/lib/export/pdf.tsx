/**
 * PDF Export Generator
 *
 * Uses @react-pdf/renderer to create professional time reports.
 * This runs server-side in API routes.
 */

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from '@react-pdf/renderer';
import type { ExportData, ExportSession } from './types';

// Styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1a1a1a',
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 8,
    color: '#000',
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  period: {
    fontSize: 11,
    color: '#444',
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginVertical: 20,
  },
  daySection: {
    marginBottom: 16,
  },
  dayHeader: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#333',
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sessionRow: {
    flexDirection: 'row',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  sessionRowAlt: {
    backgroundColor: '#fafafa',
  },
  taskColumn: {
    flex: 1,
    paddingRight: 10,
  },
  taskText: {
    fontSize: 10,
    color: '#333',
  },
  noTask: {
    fontSize: 10,
    color: '#999',
    fontStyle: 'italic',
  },
  timeColumn: {
    width: 100,
    textAlign: 'center',
  },
  durationColumn: {
    width: 60,
    textAlign: 'right',
  },
  subtotalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  subtotalLabel: {
    fontSize: 9,
    color: '#666',
    marginRight: 8,
  },
  subtotalValue: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    width: 60,
    textAlign: 'right',
  },
  totalSection: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 2,
    borderTopColor: '#333',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
  },
  totalValue: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
  },
  sessionCount: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#999',
  },
});

/**
 * Format date for display
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format duration as Xh Ym
 */
function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
}

/**
 * Format period range
 */
function formatPeriod(start: Date, end: Date): string {
  const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${startStr} – ${endStr}`;
}

/**
 * Format date as local YYYY-MM-DD (avoids UTC timezone issues)
 */
function toLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse local date key back to Date object
 */
function fromLocalDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Group sessions by date
 */
function groupByDate(sessions: ExportSession[]): Map<string, ExportSession[]> {
  const groups = new Map<string, ExportSession[]>();

  // Sort sessions by date first
  const sorted = [...sessions].sort((a, b) => a.date.getTime() - b.date.getTime());

  for (const session of sorted) {
    // Use local date format to avoid UTC timezone issues
    const dateKey = toLocalDateKey(session.date);
    const existing = groups.get(dateKey) || [];
    existing.push(session);
    groups.set(dateKey, existing);
  }

  return groups;
}

/**
 * PDF Document Component
 */
interface TimeReportProps {
  data: ExportData;
}

function TimeReport({ data }: TimeReportProps) {
  const groupedSessions = groupByDate(data.sessions);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Time Report</Text>
          <Text style={styles.subtitle}>{data.projectName}</Text>
          <Text style={styles.period}>
            {formatPeriod(data.periodStart, data.periodEnd)}
          </Text>
        </View>

        <View style={styles.divider} />

        {/* Sessions grouped by day */}
        {Array.from(groupedSessions.entries()).map(([dateKey, sessions]) => {
          const dayTotal = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
          const date = fromLocalDateKey(dateKey);

          return (
            <View key={dateKey} style={styles.daySection}>
              <Text style={styles.dayHeader}>{formatDate(date)}</Text>

              {sessions.map((session, idx) => (
                <View
                  key={session.id}
                  style={idx % 2 === 1 ? [styles.sessionRow, styles.sessionRowAlt] : styles.sessionRow}
                >
                  <View style={styles.taskColumn}>
                    {session.task ? (
                      <Text style={styles.taskText}>{session.task}</Text>
                    ) : (
                      <Text style={styles.noTask}>No task</Text>
                    )}
                  </View>
                  <Text style={styles.timeColumn}>
                    {session.startTime} – {session.endTime}
                  </Text>
                  <Text style={styles.durationColumn}>
                    {formatDuration(session.durationMinutes)}
                  </Text>
                </View>
              ))}

              <View style={styles.subtotalRow}>
                <Text style={styles.subtotalLabel}>Subtotal:</Text>
                <Text style={styles.subtotalValue}>{formatDuration(dayTotal)}</Text>
              </View>
            </View>
          );
        })}

        {/* Total */}
        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatDuration(data.totalMinutes)}</Text>
          </View>
          <Text style={styles.sessionCount}>
            {data.sessionCount} {data.sessionCount === 1 ? 'session' : 'sessions'}
          </Text>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Generated on {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} with Particle
        </Text>
      </Page>
    </Document>
  );
}

/**
 * Generate PDF buffer from export data
 */
export async function generatePDFBuffer(data: ExportData): Promise<Buffer> {
  return renderToBuffer(<TimeReport data={data} />);
}

/**
 * Generate PDF as base64 string (for API responses)
 */
export async function generatePDFBase64(data: ExportData): Promise<string> {
  const buffer = await generatePDFBuffer(data);
  return buffer.toString('base64');
}
