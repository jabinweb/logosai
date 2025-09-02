import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface UpdateVerseRequest {
  book: string;
  chapter: string;
  verse: string;
  version: string;
  newText: string;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Check admin or moderator privileges from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    });

    if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
      return NextResponse.json({ error: 'Admin or moderator access required' }, { status: 403 });
    }

    const { book, chapter, verse, version, newText }: UpdateVerseRequest = await request.json();

    // Validate input
    if (!book || !chapter || !verse || !version || !newText) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get the Bible version from database
    const bibleVersion = await prisma.bibleVersion.findUnique({
      where: { code: version.toUpperCase() }
    });

    if (!bibleVersion) {
      return NextResponse.json({ error: 'Bible version not found' }, { status: 404 });
    }

    // Find the specific verse in the database
    const existingVerse = await prisma.bibleVerse.findFirst({
      where: {
        versionId: bibleVersion.id,
        book: book,
        chapter: parseInt(chapter),
        verse: parseInt(verse)
      }
    });

    if (!existingVerse) {
      return NextResponse.json({ error: 'Verse not found' }, { status: 404 });
    }

    // Store the old text for logging
    const oldText = existingVerse.text;

    // Update the verse in the database
    await prisma.bibleVerse.update({
      where: { id: existingVerse.id },
      data: { text: newText }
    });

    // Log the change (in production, you might want to store this in a database)
    console.log(`Verse Edit - User: ${session.user.email} (${user.role}), Reference: ${book} ${chapter}:${verse} (${version})`);
    console.log(`Old: ${oldText}`);
    console.log(`New: ${newText}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Verse updated successfully',
      reference: `${book} ${chapter}:${verse}`,
      version
    });

  } catch (error) {
    console.error('Error updating verse:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
