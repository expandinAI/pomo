/**
 * Export API Route
 *
 * Generates CSV or PDF exports of session data.
 *
 * POST /api/export
 * Body: {
 *   format: 'csv' | 'pdf',
 *   projectName: string,
 *   sessions: ExportSession[],
 *   periodStart: string (ISO),
 *   periodEnd: string (ISO),
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import type { ExportData } from '@/lib/export/types';
import { generateCSV } from '@/lib/export/csv';
import { generatePDFBuffer } from '@/lib/export/pdf';

interface ExportRequest {
  format: 'csv' | 'pdf';
  projectName: string;
  sessions: Array<{
    id: string;
    date: string;
    task?: string;
    startTime: string;
    endTime: string;
    durationMinutes: number;
  }>;
  periodStart: string;
  periodEnd: string;
  totalMinutes: number;
  sessionCount: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ExportRequest;

    // Validate required fields
    if (!body.format || !body.projectName || !body.sessions) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Convert to ExportData
    const data: ExportData = {
      projectName: body.projectName,
      periodStart: new Date(body.periodStart),
      periodEnd: new Date(body.periodEnd),
      sessions: body.sessions.map((s) => ({
        ...s,
        date: new Date(s.date),
      })),
      totalMinutes: body.totalMinutes,
      sessionCount: body.sessionCount,
    };

    // Generate filename
    const safeName = body.projectName.replace(/[^a-zA-Z0-9]/g, '-');
    const dateStr = new Date().toISOString().split('T')[0];

    if (body.format === 'csv') {
      // Generate CSV
      const csv = generateCSV(data);
      const filename = `${safeName}_${dateStr}.csv`;

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    } else if (body.format === 'pdf') {
      // Generate PDF
      const pdfBuffer = await generatePDFBuffer(data);
      const filename = `${safeName}_${dateStr}.pdf`;

      // Convert Buffer to Uint8Array for NextResponse compatibility
      const uint8Array = new Uint8Array(pdfBuffer);

      return new NextResponse(uint8Array, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid format. Use "csv" or "pdf".' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('[Export API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate export' },
      { status: 500 }
    );
  }
}
