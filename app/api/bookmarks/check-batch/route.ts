import { NextRequest, NextResponse } from 'next/server';
import { BookmarkService } from '../../../../services/bookmarkService';
import { auth } from '@/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { references, version } = await request.json();

    if (!references || !Array.isArray(references) || !version) {
      return NextResponse.json(
        { error: 'References array and version are required' },
        { status: 400 }
      );
    }

    // Check all references in a single database query
    const bookmarkedReferences = await BookmarkService.areVersesBookmarked(
      session.user.id,
      references,
      version
    );

    return NextResponse.json({ bookmarkedReferences });
  } catch (error) {
    console.error('Batch Check Bookmark API Error:', error);
    return NextResponse.json(
      { error: 'Failed to check bookmark status' },
      { status: 500 }
    );
  }
}
