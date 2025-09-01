import { NextRequest, NextResponse } from 'next/server';
import { BookmarkService } from '../../../../services/bookmarkService';
import { auth } from '@/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const reference = url.searchParams.get('reference');
    const version = url.searchParams.get('version');

    if (!reference || !version) {
      return NextResponse.json(
        { error: 'Reference and version are required' },
        { status: 400 }
      );
    }

    const bookmarkId = await BookmarkService.isVerseBookmarked(
      session.user.id,
      reference,
      version
    );

    return NextResponse.json({ 
      isBookmarked: !!bookmarkId,
      bookmarkId: bookmarkId 
    });
  } catch (error) {
    console.error('Check Bookmark API Error:', error);
    return NextResponse.json(
      { error: 'Failed to check bookmark status' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { reference, version, text, bookName, chapter, verse } = await request.json();

    if (!reference || !version || !text) {
      return NextResponse.json(
        { error: 'Reference, version, and text are required' },
        { status: 400 }
      );
    }

    // Check if already bookmarked
    const existingBookmarkId = await BookmarkService.isVerseBookmarked(
      session.user.id,
      reference,
      version
    );

    if (existingBookmarkId) {
      // Remove bookmark
      const success = await BookmarkService.deleteBookmarkByReference(
        session.user.id,
        reference,
        version
      );

      return NextResponse.json({ 
        action: 'removed',
        isBookmarked: false,
        success 
      });
    } else {
      // Add bookmark
      const bookmark = await BookmarkService.createBookmark(
        session.user.id,
        {
          title: `${bookName} ${chapter}:${verse}`,
          description: text.length > 200 ? text.substring(0, 200) + '...' : text,
          reference,
          text,
          version,
          tags: [bookName.toLowerCase(), 'verse']
        }
      );

      return NextResponse.json({ 
        action: 'added',
        isBookmarked: true,
        bookmark,
        success: !!bookmark
      });
    }
  } catch (error) {
    console.error('Toggle Bookmark API Error:', error);
    return NextResponse.json(
      { error: 'Failed to toggle bookmark' },
      { status: 500 }
    );
  }
}
