import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ version: string; book: string }> }
) {
  try {
    const resolvedParams = await params;
    const versionCode = resolvedParams.version.toUpperCase();
    const bookName = decodeURIComponent(resolvedParams.book);

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

    // Get distinct chapters for this book and version
    const chapters = await prisma.bibleVerse.findMany({
      where: { 
        versionId: bibleVersion.id,
        book: bookName
      },
      distinct: ['chapter'],
      select: { chapter: true },
      orderBy: { chapter: 'asc' }
    });

    const chapterList = chapters.map(c => c.chapter.toString());

    return NextResponse.json(chapterList);
  } catch (error) {
    console.error('Error fetching chapters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chapters' },
      { status: 500 }
    );
  }
}
