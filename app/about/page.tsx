'use client';

import Link from 'next/link';

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 transition-colors duration-300">
        
        {/* Hero Section */}
        <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light text-gray-900 dark:text-white mb-8">
              About
            </h1>
            <p className="text-xl sm:text-2xl text-gray-500 dark:text-gray-400 font-light">
              Discover the story behind Logos AI
            </p>
          </div>
        </section>

        {/* Mission Statement */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-3xl sm:text-4xl font-light text-gray-900 dark:text-white mb-8">
                Our Mission
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed font-light">
                Empowering deeper engagement with Scripture through intelligent search and natural language understanding.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20">
              <div className="text-center">
                <div className="text-5xl font-light text-blue-600 dark:text-blue-400 mb-3">AI</div>
                <div className="text-lg font-medium text-gray-900 dark:text-white mb-2">Powered</div>
                <div className="text-gray-500 dark:text-gray-400 font-light">Natural Language Search</div>
              </div>
              
              <div className="text-center">
                <div className="text-5xl font-light text-green-600 dark:text-green-400 mb-3">∞</div>
                <div className="text-lg font-medium text-gray-900 dark:text-white mb-2">Verses</div>
                <div className="text-gray-500 dark:text-gray-400 font-light">Searchable Content</div>
              </div>
              
              <div className="text-center">
                <div className="text-5xl font-light text-purple-600 dark:text-purple-400 mb-3">⚡</div>
                <div className="text-lg font-medium text-gray-900 dark:text-white mb-2">Fast</div>
                <div className="text-gray-500 dark:text-gray-400 font-light">Instant Results</div>
              </div>
            </div>
          </div>
        </section>

        {/* Vision Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800/30">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-3xl font-light text-gray-900 dark:text-white mb-8">
              Bridging Technology and Scripture
            </h3>
            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed font-light mb-8">
              Traditional Bible search tools require exact keywords and phrases. We believe you should be able to search Scripture the way you think - using natural language and concepts.
            </p>
            <p className="text-lg text-gray-500 dark:text-gray-400 font-light">
              Whether you&apos;re looking for &quot;verses about hope&quot; or &quot;what does the Bible say about forgiveness&quot;, Logos AI understands your intent and finds relevant passages.
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h3 className="text-3xl font-light text-gray-900 dark:text-white mb-8">
                What Makes Logos AI Different
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Smart Search</h4>
                <p className="text-gray-600 dark:text-gray-300 font-light">Find verses using natural language questions and concepts, not just keywords.</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Multiple Versions</h4>
                <p className="text-gray-600 dark:text-gray-300 font-light">Access various Bible translations to enhance your study and understanding.</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-6">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Personal Library</h4>
                <p className="text-gray-600 dark:text-gray-300 font-light">Bookmark verses and track your search history for deeper study.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Philosophy Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800/30">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-3xl font-light text-gray-900 dark:text-white mb-8">
              Our Philosophy
            </h3>
            <div className="space-y-8">
              <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed font-light">
                We believe technology should serve Scripture study, not replace it. Logos AI enhances your ability to discover and engage with God&apos;s Word.
              </p>
              <p className="text-lg text-gray-500 dark:text-gray-400 font-light italic">
                &quot;The Word of God is living and active, sharper than any two-edged sword.&quot; - Hebrews 4:12
              </p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-3xl font-light text-gray-900 dark:text-white mb-6">
              Start Your Journey
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-12 leading-relaxed font-light">
              Experience a new way to explore Scripture with intelligent search and seamless reading.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link 
                href="/" 
                className="inline-flex items-center justify-center px-8 py-2 text-base font-medium rounded-lg text-white bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors duration-200"
              >
                Try Search
              </Link>
              <Link 
                href="/read" 
                className="inline-flex items-center justify-center px-8 py-2 text-base font-medium rounded-lg text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
              >
                Read Scripture
              </Link>
            </div>
          </div>
        </section>

      </div>
  );
}
