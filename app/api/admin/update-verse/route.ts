import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import fs from 'fs/promises';
import path from 'path';
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

    // Determine the file path based on version
    let filePath: string;
    if (version === 'IBP') {
      filePath = path.join(process.cwd(), 'public', 'bibles', 'IBP_bible.json');
    } else if (version === 'ESV') {
      filePath = path.join(process.cwd(), 'public', 'bibles', 'ESV_bible.json');
    } else if (version === 'NIV') {
      filePath = path.join(process.cwd(), 'public', 'bibles', 'NIV_bible.json');
    } else {
      return NextResponse.json({ error: 'Unsupported version' }, { status: 400 });
    }

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return NextResponse.json({ error: 'Bible file not found' }, { status: 404 });
    }

    // Read the current Bible file
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const bibleData = JSON.parse(fileContent);

    // Update the specific verse
    if (!bibleData[book]) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    if (!bibleData[book][chapter]) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }

    if (!bibleData[book][chapter][verse]) {
      return NextResponse.json({ error: 'Verse not found' }, { status: 404 });
    }

    // Store the old text for logging
    const oldText = bibleData[book][chapter][verse];

    // Update the verse
    bibleData[book][chapter][verse] = newText;

    // Write the updated data back to the file
    await fs.writeFile(filePath, JSON.stringify(bibleData, null, 2), 'utf-8');

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
  }
}
