'use client';

import { useEffect, useState, useCallback } from 'react';
import { Header, Footer } from '../../../components/layout';
import Link from 'next/link';
import { 
  ArrowLeftIcon,
  ChartBarIcon,
  UsersIcon,
  BookmarkIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    totalBookmarks: number;
    totalSearches: number;
    averageSearchesPerUser: number;
    averageBookmarksPerUser: number;
  };
  trends: {
    dailyStats: Array<{
      date: string;
      users: number;
      searches: number;
      bookmarks: number;
    }>;
    weeklyGrowth: {
      users: number;
      searches: number;
      bookmarks: number;
    };
  };
  topSearches: Array<{
    query: string;
    count: number;
    lastSearched: string;
  }>;
  userActivity: {
    activeToday: number;
    activeThisWeek: number;
    activeThisMonth: number;
  };
  searchLanguages: {
    english: number;
    hindi: number;
    hinglish: number;
  };
}

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/analytics?timeRange=${timeRange}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
        <Header />
        <main className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent"></div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 transition-colors duration-300">
        
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Link
                  href="/admin"
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  <ArrowLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </Link>
                <div className="w-10 h-10 bg-purple-600 dark:bg-purple-500 rounded-lg flex items-center justify-center">
                  <ChartBarIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Analytics & Reports
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Monitor application performance and user behavior
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <select
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                >
                  <option value="1d">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {analytics && (
            <>
              {/* Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center">
                      <UsersIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {analytics.overview.totalUsers.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-lg flex items-center justify-center">
                      <BookmarkIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Bookmarks</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {analytics.overview.totalBookmarks.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/40 rounded-lg flex items-center justify-center">
                      <ClockIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Searches</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {analytics.overview.totalSearches.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/40 rounded-lg flex items-center justify-center">
                      <ArrowTrendingUpIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Searches/User</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {analytics.overview.averageSearchesPerUser.toFixed(1)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/40 rounded-lg flex items-center justify-center">
                      <BookmarkIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Bookmarks/User</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {analytics.overview.averageBookmarksPerUser.toFixed(1)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Growth Trends */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <ArrowTrendingUpIcon className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                    Weekly Growth
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">New Users</span>
                      <span className={`text-sm font-medium ${
                        analytics.trends.weeklyGrowth.users >= 0 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {analytics.trends.weeklyGrowth.users >= 0 ? '+' : ''}{analytics.trends.weeklyGrowth.users}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Searches</span>
                      <span className={`text-sm font-medium ${
                        analytics.trends.weeklyGrowth.searches >= 0 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {analytics.trends.weeklyGrowth.searches >= 0 ? '+' : ''}{analytics.trends.weeklyGrowth.searches}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Bookmarks</span>
                      <span className={`text-sm font-medium ${
                        analytics.trends.weeklyGrowth.bookmarks >= 0 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {analytics.trends.weeklyGrowth.bookmarks >= 0 ? '+' : ''}{analytics.trends.weeklyGrowth.bookmarks}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <UsersIcon className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
                    User Activity
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Active Today</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {analytics.userActivity.activeToday}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Active This Week</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {analytics.userActivity.activeThisWeek}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Active This Month</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {analytics.userActivity.activeThisMonth}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <ClockIcon className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
                    Search Languages
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">English</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {analytics.searchLanguages.english}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Hindi</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {analytics.searchLanguages.hindi}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Hinglish</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {analytics.searchLanguages.hinglish}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Searches and Daily Trends */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <ClockIcon className="w-5 h-5 mr-2 text-orange-600 dark:text-orange-400" />
                    Top Search Queries
                  </h3>
                  <div className="space-y-3">
                    {analytics.topSearches.map((search, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {search.query}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Last searched: {new Date(search.lastSearched).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="ml-4 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs font-medium text-gray-900 dark:text-white rounded">
                          {search.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <CalendarIcon className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                    Daily Activity Trend
                  </h3>
                  <div className="space-y-3">
                    {analytics.trends.dailyStats.slice(-7).map((day, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {new Date(day.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex space-x-4 text-xs">
                          <span className="text-blue-600 dark:text-blue-400">
                            {day.users} users
                          </span>
                          <span className="text-green-600 dark:text-green-400">
                            {day.searches} searches
                          </span>
                          <span className="text-purple-600 dark:text-purple-400">
                            {day.bookmarks} bookmarks
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

        </main>
      </div>
      <Footer />
    </>
  );
}
