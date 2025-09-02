'use client';

import Link from 'next/link';
import { Header, Footer } from '../../components/layout';

export default function Help() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 transition-colors duration-300">
        
        {/* Hero Section */}
        <section className="pt-16 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Help
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Get support and answers to your questions
            </p>
          </div>
        </section>

        {/* Help Content */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            
            {/* FAQ Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Frequently Asked Questions
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    How do I search for Bible verses?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Use natural language to search for verses. For example, type &quot;love your enemies&quot; or &quot;be strong and courageous&quot; to find relevant passages.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Can I bookmark verses?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Yes! Click the bookmark icon next to any verse to save it. Access your bookmarks from the navigation menu.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Which Bible versions are available?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    We offer multiple Bible versions including ESV, NIV, KJV, and others. You can switch versions in the reading interface.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Is my data private?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Yes, we respect your privacy. Read our{' '}
                    <Link href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">
                      Privacy Policy
                    </Link>{' '}
                    for more details.
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Need More Help?
              </h2>
              
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  If you can&apos;t find the answer you&apos;re looking for, feel free to contact us.
                </p>
                
                <div className="inline-flex items-center justify-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a 
                    href="mailto:info@jabin.org" 
                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    info@jabin.org
                  </a>
                </div>
              </div>
            </div>

          </div>
        </section>

      </div>
      <Footer />
    </>
  );
}
