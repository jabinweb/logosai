import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    });

    if (user?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get current date for today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Fetch statistics
    const [
      totalUsers,
      totalBookmarks,
      totalSearches,
      adminUsers,
      moderatorUsers,
      newUsersToday,
      searchesToday,
      bookmarksToday
    ] = await Promise.all([
      prisma.user.count(),
      prisma.bookmark.count(),
      prisma.searchHistory.count(),
      prisma.user.count({ where: { role: 'admin' } }),
      prisma.user.count({ where: { role: 'moderator' } }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: today,
            lt: tomorrow
          }
        }
      }),
      prisma.searchHistory.count({
        where: {
          createdAt: {
            gte: today,
            lt: tomorrow
          }
        }
      }),
      prisma.bookmark.count({
        where: {
          createdAt: {
            gte: today,
            lt: tomorrow
          }
        }
      })
    ]);

    const stats = {
      totalUsers,
      totalBookmarks,
      totalSearches,
      adminUsers,
      moderatorUsers,
      recentActivity: {
        newUsersToday,
        searchesToday,
        bookmarksToday
      }
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
