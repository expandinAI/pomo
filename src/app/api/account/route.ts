/**
 * Account API Route
 *
 * DELETE /api/account - Delete the authenticated user's account
 *
 * POMO-328
 */

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { deleteAccount } from '@/lib/account/delete-account';

/**
 * DELETE /api/account
 *
 * Permanently deletes the authenticated user's account and all associated data.
 * This action cannot be undone.
 *
 * Returns:
 * - 204: Account successfully deleted
 * - 401: User not authenticated
 * - 500: Deletion failed
 */
export async function DELETE(): Promise<NextResponse> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const result = await deleteAccount(userId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to delete account' },
        { status: 500 }
      );
    }

    // 204 No Content - account successfully deleted
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[Account API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
