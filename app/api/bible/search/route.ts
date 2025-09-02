import { NextRequest, NextResponse } from 'next/server';
import { BibleSearchService } from '@/services/bibleSearchService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const version = searchParams.get('version') || 'ESV';
    const book = searchParams.get('book') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    // Use the database-powered search service
    const bibleSearchService = BibleSearchService.getInstance();
    
    // Perform the search using the database with pagination
    const response = await bibleSearchService.searchBibleWithPagination(query.trim(), version, book, page, limit);
    
    // Return the results with pagination info
    return NextResponse.json({
      results: response.results.map(result => ({
        book: result.book,
        chapter: result.chapter,
        verse: result.verse,
        text: result.text
      })),
      totalCount: response.totalCount,
      page,
      limit,
      hasMore: response.hasMore,
      query: query.trim(),
      version,
      book
    });
  } catch (error) {
    console.error('Bible search API error:', error);
    return NextResponse.json(
      { error: 'Failed to search Bible verses' },
      { status: 500 }
    );
  }
}
