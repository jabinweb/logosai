import { NextRequest, NextResponse } from 'next/server';
import { BookmarkService } from '../../../services/bookmarkService';
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
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const search = url.searchParams.get('search');

    let bookmarks;
    if (search) {
      bookmarks = await BookmarkService.searchBookmarks(
        session.user.id,
        search
      );
    } else {
      bookmarks = await BookmarkService.getUserBookmarks(
        session.user.id,
        limit
      );
    }

    return NextResponse.json(bookmarks);
  } catch (error) {
    console.error('Bookmarks API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookmarks' },
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

    const bookmarkData = await request.json();

    const bookmark = await BookmarkService.createBookmark(
      session.user.id,
      bookmarkData
    );

    if (!bookmark) {
      return NextResponse.json(
        { error: 'Failed to create bookmark' },
        { status: 500 }
      );
    }

    return NextResponse.json(bookmark);
  } catch (error) {
    console.error('Create Bookmark API Error:', error);
    return NextResponse.json(
      { error: 'Failed to create bookmark' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const bookmarkId = url.searchParams.get('id');

    if (!bookmarkId) {
      return NextResponse.json(
        { error: 'Bookmark ID is required' },
        { status: 400 }
      );
    }

    const success = await BookmarkService.deleteBookmark(
      session.user.id,
      bookmarkId
    );

    return NextResponse.json({ success });
  } catch (error) {
    console.error('Delete Bookmark API Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete bookmark' },
      { status: 500 }
    );
  }
}
