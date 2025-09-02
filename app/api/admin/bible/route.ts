import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/admin/bible - Get Bible versions and statistics
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user || !['admin', 'moderator'].includes((session.user as { role: string }).role)) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    // Check if Bible tables exist
    try {
      // Get all Bible versions with verse counts
      const versions = await prisma.bibleVersion.findMany({
        include: {
          _count: {
            select: { verses: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      // Get overall statistics
      const [totalVerses, totalVersions] = await Promise.all([
        prisma.bibleVerse.count(),
        prisma.bibleVersion.count()
      ]);

      return NextResponse.json({
        versions,
        statistics: {
          totalVersions,
          totalVerses,
          activeVersions: versions.filter((v) => v.isActive).length
        }
      });
    } catch (dbError: unknown) {
      if (dbError && typeof dbError === 'object' && 'code' in dbError && 
          (dbError.code === 'P2021' || ('message' in dbError && 
           typeof dbError.message === 'string' && dbError.message.includes('does not exist')))) {
        return NextResponse.json({
          versions: [],
          statistics: {
            totalVersions: 0,
            totalVerses: 0,
            activeVersions: 0
          },
          message: 'Bible tables not yet created. Please run database migration first.'
        });
      }
      throw dbError;
    }

  } catch (error) {
    console.error('Bible API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Bible data' },
      { status: 500 }
    );
  }
}

// POST /api/admin/bible - Create or update Bible version
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || (session.user as { role: string }).role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { code, name, language, publisher, year, isActive } = body;

    if (!code || !name) {
      return NextResponse.json(
        { error: 'Code and name are required' },
        { status: 400 }
      );
    }

    const version = await prisma.bibleVersion.upsert({
      where: { code },
      update: {
        name,
        language: language || 'en',
        publisher,
        year,
        isActive: isActive !== undefined ? isActive : true,
        updatedAt: new Date()
      },
      create: {
        code,
        name,
        language: language || 'en',
        publisher,
        year,
        isActive: isActive !== undefined ? isActive : true
      }
    });

    return NextResponse.json({
      success: true,
      version
    });

  } catch (error) {
    console.error('Bible version creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create Bible version' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/bible/[id] - Delete Bible version and all its verses
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || (session.user as { role: string }).role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const versionId = url.searchParams.get('id');

    if (!versionId) {
      return NextResponse.json(
        { error: 'Version ID is required' },
        { status: 400 }
      );
    }

    // Delete the version (CASCADE will handle verses)
    await prisma.bibleVersion.delete({
      where: { id: parseInt(versionId) }
    });

    return NextResponse.json({
      success: true,
      message: 'Bible version deleted successfully'
    });

  } catch (error) {
    console.error('Bible version deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete Bible version' },
      { status: 500 }
    );
  }
}
