import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ version: string; book: string; chapter: string }> }
) {
  try {
    const resolvedParams = await params;
    const versionCode = resolvedParams.version.toUpperCase();
    const bookName = decodeURIComponent(resolvedParams.book);
    const chapterNumber = parseInt(resolvedParams.chapter);

    // Get the Bible version
    const bibleVersion = await prisma.bibleVersion.findUnique({
      where: { code: versionCode }
    });

    if (!bibleVersion) {
      return NextResponse.json(
        { error: `Bible version ${versionCode} not found` },
        { status: 404 }
      );
    }

    // Get all verses for this chapter
    const verses = await prisma.bibleVerse.findMany({
      where: { 
        versionId: bibleVersion.id,
        book: bookName,
        chapter: chapterNumber
      },
      select: {
        verse: true,
        text: true
      },
      orderBy: { verse: 'asc' }
    });

    // Transform to match the frontend format: { "1": "verse text", "2": "verse text", ... }
    const chapterData = verses.reduce((acc, verse) => {
      acc[verse.verse.toString()] = verse.text;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json(chapterData);
  } catch (error) {
    console.error('Error fetching chapter verses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chapter verses' },
      { status: 500 }
    );
  }
}
