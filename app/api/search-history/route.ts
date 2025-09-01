import { NextRequest, NextResponse } from 'next/server';
import { SearchHistoryService } from '../../../services/searchHistoryService';
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
    const limit = parseInt(url.searchParams.get('limit') || '20');

    const history = await SearchHistoryService.getUserSearchHistory(
      session.user.id,
      limit
    );

    return NextResponse.json(history);
  } catch (error) {
    console.error('Search History API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch search history' },
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
    const itemId = url.searchParams.get('id');

    if (itemId) {
      // Delete specific item
      const success = await SearchHistoryService.deleteSearchItem(
        session.user.id,
        itemId
      );
      
      return NextResponse.json({ success });
    } else {
      // Clear all history
      const success = await SearchHistoryService.clearUserHistory(
        session.user.id
      );
      
      return NextResponse.json({ success });
    }
  } catch (error) {
    console.error('Search History Delete API Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete search history' },
      { status: 500 }
    );
  }
}
