'use client';

import Link from 'next/link';

export default function MissionSection() {
  return (
    <section className="relative py-16 sm:py-20 lg:py-24 bg-white dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Mission Content */}
        <div className="text-center mb-16 lg:mb-20">
          <h2 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 dark:text-white mb-6 lg:mb-8">
            &ldquo;Go therefore and make disciples of all nations&rdquo;
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed mb-4">
            Matthew 28:19
          </p>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Empowering believers with AI-powered Bible study tools to understand Scripture deeply 
            and share the Gospel effectively across cultures and languages.
          </p>
        </div>

        {/* Simplified Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 mb-16 lg:mb-20">
          
          {/* Study Scripture */}
          <div className="text-center group">
            <div className="w-16 h-16 mx-auto mb-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253z" />
              </svg>
            </div>
            <h3 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-white mb-3">Study Scripture</h3>
            <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
              &ldquo;Study to show yourself approved unto God&rdquo; - Dive deep into His Word with intelligent insights
            </p>
          </div>

          {/* Share the Gospel */}
          <div className="text-center group">
            <div className="w-16 h-16 mx-auto mb-6 bg-green-50 dark:bg-green-900/20 rounded-2xl flex items-center justify-center group-hover:bg-green-100 dark:group-hover:bg-green-900/30 transition-colors">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-white mb-3">Share the Gospel</h3>
            <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
              &ldquo;How beautiful are the feet of those who bring good news&rdquo; - Equipped to minister across cultures
            </p>
          </div>

          {/* Grow in Faith */}
          <div className="text-center group">
            <div className="w-16 h-16 mx-auto mb-6 bg-purple-50 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 transition-colors">
              <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-white mb-3">Grow in Faith</h3>
            <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
              &ldquo;Grow in grace and knowledge of our Lord&rdquo; - Spiritual growth through deeper understanding
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
            <Link 
              href="/read"
              className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all duration-200 hover:shadow-lg"
            >
              Start Reading
            </Link>
            <Link 
              href="/"
              className="w-full sm:w-auto px-8 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium rounded-xl transition-all duration-200 hover:shadow-lg"
            >
              Ask AI
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
