import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const versions = await prisma.bibleVersion.findMany({
      where: { isActive: true },
      select: {
        id: true,
        code: true,
        name: true,
        language: true,
        publisher: true,
        year: true,
        _count: {
          select: { verses: true }
        }
      },
      orderBy: { code: 'asc' }
    });

    // Transform to match the frontend interface
    const bibleVersions = versions.map(version => ({
      id: version.code,
      name: version.name,
      language: version.language === 'hi' ? 'Hindi' : 'English',
      description: `${version.name}${version.publisher ? ` by ${version.publisher}` : ''}${version.year ? ` (${version.year})` : ''} - ${version._count.verses.toLocaleString()} verses`
    }));

    return NextResponse.json(bibleVersions);
  } catch (error) {
    console.error('Error fetching Bible versions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Bible versions' },
      { status: 500 }
    );
  }
}
