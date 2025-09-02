import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '7d';

    // Calculate date range
    const now = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case '1d':
        startDate.setDate(now.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    // Get overview statistics
    const [
      totalUsers,
      totalBookmarks,
      totalSearches
    ] = await Promise.all([
      prisma.user.count(),
      prisma.bookmark.count(),
      prisma.searchHistory.count()
    ]);

    const averageSearchesPerUser = totalUsers > 0 ? totalSearches / totalUsers : 0;
    const averageBookmarksPerUser = totalUsers > 0 ? totalBookmarks / totalUsers : 0;

    // Get daily statistics for the time range
    const dailyStats = [];
    for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
      const dayStart = new Date(d);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(d);
      dayEnd.setHours(23, 59, 59, 999);

      const [users, searches, bookmarks] = await Promise.all([
        prisma.user.count({
          where: {
            createdAt: {
              gte: dayStart,
              lte: dayEnd
            }
          }
        }),
        prisma.searchHistory.count({
          where: {
            createdAt: {
              gte: dayStart,
              lte: dayEnd
            }
          }
        }),
        prisma.bookmark.count({
          where: {
            createdAt: {
              gte: dayStart,
              lte: dayEnd
            }
          }
        })
      ]);

      dailyStats.push({
        date: dayStart.toISOString().split('T')[0],
        users,
        searches,
        bookmarks
      });
    }

    // Calculate weekly growth (compare current week with previous week)
    const weekAgo = new Date();
    weekAgo.setDate(now.getDate() - 7);
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(now.getDate() - 14);

    const [
      currentWeekUsers,
      previousWeekUsers,
      currentWeekSearches,
      previousWeekSearches,
      currentWeekBookmarks,
      previousWeekBookmarks
    ] = await Promise.all([
      prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.user.count({ where: { createdAt: { gte: twoWeeksAgo, lt: weekAgo } } }),
      prisma.searchHistory.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.searchHistory.count({ where: { createdAt: { gte: twoWeeksAgo, lt: weekAgo } } }),
      prisma.bookmark.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.bookmark.count({ where: { createdAt: { gte: twoWeeksAgo, lt: weekAgo } } })
    ]);

    const weeklyGrowth = {
      users: previousWeekUsers > 0 ? Math.round(((currentWeekUsers - previousWeekUsers) / previousWeekUsers) * 100) : 0,
      searches: previousWeekSearches > 0 ? Math.round(((currentWeekSearches - previousWeekSearches) / previousWeekSearches) * 100) : 0,
      bookmarks: previousWeekBookmarks > 0 ? Math.round(((currentWeekBookmarks - previousWeekBookmarks) / previousWeekBookmarks) * 100) : 0
    };

    // Get top search queries
    const topSearches = await prisma.searchHistory.groupBy({
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

    const topSearchesWithDates = await Promise.all(
      topSearches.map(async (search) => {
        const lastSearch = await prisma.searchHistory.findFirst({
          where: { query: search.query },
          orderBy: { createdAt: 'desc' },
          select: { createdAt: true }
        });
        
        return {
          query: search.query,
          count: search._count.query,
          lastSearched: lastSearch?.createdAt.toISOString() || new Date().toISOString()
        };
      })
    );

    // Get user activity
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thisWeekStart = new Date();
    thisWeekStart.setDate(now.getDate() - 7);
    const thisMonthStart = new Date();
    thisMonthStart.setDate(now.getDate() - 30);

    const [activeToday, activeThisWeek, activeThisMonth] = await Promise.all([
      prisma.searchHistory.groupBy({
        by: ['userId'],
        where: {
          createdAt: { gte: today }
        }
      }).then(result => result.length),
      prisma.searchHistory.groupBy({
        by: ['userId'],
        where: {
          createdAt: { gte: thisWeekStart }
        }
      }).then(result => result.length),
      prisma.searchHistory.groupBy({
        by: ['userId'],
        where: {
          createdAt: { gte: thisMonthStart }
        }
      }).then(result => result.length)
    ]);

    // Get search language statistics from actual search history data
    const languageStats = await prisma.searchHistory.groupBy({
      by: ['language'],
      _count: {
        language: true
      },
      where: {
        createdAt: {
          gte: startDate,
          lte: now
        }
      }
    });

    // Calculate language percentages
    const totalLanguageSearches = languageStats.reduce((sum, lang) => sum + lang._count.language, 0);
    const searchLanguages = {
      english: 0,
      hindi: 0,
      hinglish: 0
    };

    languageStats.forEach(stat => {
      const percentage = totalLanguageSearches > 0 ? Math.round((stat._count.language / totalLanguageSearches) * 100) : 0;
      if (stat.language === 'english') {
        searchLanguages.english = percentage;
      } else if (stat.language === 'hindi') {
        searchLanguages.hindi = percentage;
      } else if (stat.language === 'hinglish') {
        searchLanguages.hinglish = percentage;
      }
    });

    const analytics = {
      overview: {
        totalUsers,
        totalBookmarks,
        totalSearches,
        averageSearchesPerUser,
        averageBookmarksPerUser
      },
      trends: {
        dailyStats,
        weeklyGrowth
      },
      topSearches: topSearchesWithDates,
      userActivity: {
        activeToday,
        activeThisWeek,
        activeThisMonth
      },
      searchLanguages
    };

    return NextResponse.json(analytics);

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
