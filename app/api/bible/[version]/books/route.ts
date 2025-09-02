import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ version: string }> }
) {
  try {
    const resolvedParams = await params;
    const versionCode = resolvedParams.version.toUpperCase();

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

    // Get distinct books for this version
    const books = await prisma.bibleVerse.findMany({
      where: { versionId: bibleVersion.id },
      distinct: ['book'],
      select: { book: true },
      orderBy: { book: 'asc' }
    });

    const bookList = books.map(b => b.book);

    return NextResponse.json(bookList);
  } catch (error) {
    console.error('Error fetching books:', error);
    return NextResponse.json(
      { error: 'Failed to fetch books' },
      { status: 500 }
    );
  }
}
