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

    // Get search statistics
    const [totalSearches, uniqueUsersResult] = await Promise.all([
      prisma.searchHistory.count(),
      prisma.searchHistory.groupBy({
        by: ['userId'],
        _count: {
          userId: true
        }
      })
    ]);

    const uniqueUsers = uniqueUsersResult.length;
    const averageSearchesPerUser = uniqueUsers > 0 ? totalSearches / uniqueUsers : 0;

    // Get top queries
    const topQueriesResult = await prisma.searchHistory.groupBy({
      by: ['query'],
      _count: {
        query: true
      },
      orderBy: {
        _count: {
          query: 'desc'
        }
      },
      take: 10
    });

    const topQueries = topQueriesResult.map(item => ({
      query: item.query,
      count: item._count.query
    }));

    const stats = {
      totalSearches,
      uniqueUsers,
      averageSearchesPerUser,
      topQueries
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error fetching search stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
