'use client';

import { Header, Footer } from '../../components/layout';

export default function Privacy() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 transition-colors duration-300">
        
        {/* Hero Section */}
        <section className="pt-16 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Privacy Policy
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              How we protect and handle your information
            </p>
          </div>
        </section>

        {/* Privacy Content */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg space-y-8">
              
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Information We Collect
                </h2>
                <div className="text-gray-600 dark:text-gray-300 space-y-4">
                  <p>
                    When you use Logos AI, we may collect the following information:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Account information when you sign in (email, name)</li>
                    <li>Search queries to improve our service</li>
                    <li>Bookmarked verses and reading history</li>
                    <li>Usage analytics to enhance user experience</li>
                  </ul>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  How We Use Your Information
                </h2>
                <div className="text-gray-600 dark:text-gray-300 space-y-4">
                  <p>
                    We use your information to:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Provide and improve our Bible study services</li>
                    <li>Save your bookmarks and preferences</li>
                    <li>Enhance search accuracy and relevance</li>
                    <li>Send important service updates (only when necessary)</li>
                  </ul>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Data Protection
                </h2>
                <div className="text-gray-600 dark:text-gray-300 space-y-4">
                  <p>
                    We take your privacy seriously and implement appropriate security measures to protect your personal information. Your data is encrypted and stored securely.
                  </p>
                  <p>
                    We do not sell, trade, or share your personal information with third parties for marketing purposes.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Bible Text Disclaimer
                </h2>
                <div className="text-gray-600 dark:text-gray-300 space-y-4">
                  <p className="font-medium">
                    The Bible text provided in this app are for educational, personal, non-commercial, and reference purposes only. This project does not claim ownership of any Bible text and is not affiliated with anyone or any copyright holder.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Your Rights
                </h2>
                <div className="text-gray-600 dark:text-gray-300 space-y-4">
                  <p>
                    You have the right to:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Access your personal data</li>
                    <li>Correct inaccurate information</li>
                    <li>Request deletion of your account and data</li>
                    <li>Export your bookmarks and data</li>
                  </ul>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Contact Us
                </h2>
                <div className="text-gray-600 dark:text-gray-300">
                  <p>
                    If you have any questions about this Privacy Policy, please contact us at{' '}
                    <a 
                      href="mailto:info@jabin.org" 
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      info@jabin.org
                    </a>
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Last updated: September 2, 2025
                </p>
              </div>

            </div>
          </div>
        </section>

      </div>
      <Footer />
    </>
  );
}
