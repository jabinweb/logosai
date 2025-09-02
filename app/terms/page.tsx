'use client';

import { Header, Footer } from '../../components/layout';

export default function Terms() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 transition-colors duration-300">
        
        {/* Hero Section */}
        <section className="pt-16 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Terms of Service
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Terms and conditions for using Logos AI
            </p>
          </div>
        </section>

        {/* Terms Content */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg space-y-8">
              
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Acceptance of Terms
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  By accessing and using Logos AI, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Use License
                </h2>
                <div className="text-gray-600 dark:text-gray-300 space-y-4">
                  <p>
                    Permission is granted to temporarily use Logos AI for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Modify or copy the materials</li>
                    <li>Use the materials for any commercial purpose or for any public display</li>
                    <li>Attempt to reverse engineer any software contained on the website</li>
                    <li>Remove any copyright or other proprietary notations from the materials</li>
                  </ul>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Bible Text Disclaimer
                </h2>
                <div className="text-gray-600 dark:text-gray-300 space-y-4">
                  <p className="font-medium bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border-l-4 border-yellow-400">
                    The Bible text provided in this app are for educational, personal, non-commercial, and reference purposes only. This project does not claim ownership of any Bible text and is not affiliated with anyone or any copyright holder.
                  </p>
                  <p>
                    All Bible translations are the property of their respective copyright holders. We make no claims to ownership of any Bible text and use them under fair use provisions for educational and reference purposes.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  User Account
                </h2>
                <div className="text-gray-600 dark:text-gray-300 space-y-4">
                  <p>
                    You are responsible for safeguarding your account information and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Prohibited Uses
                </h2>
                <div className="text-gray-600 dark:text-gray-300 space-y-4">
                  <p>
                    You may not use our service:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
                    <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                    <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                    <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                    <li>To submit false or misleading information</li>
                  </ul>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Service Availability
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  We reserve the right to modify, suspend, or discontinue the service at any time without prior notice. We will not be liable to you or any third party for any modification, suspension, or discontinuance of the service.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Limitation of Liability
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  In no event shall Logos AI or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Logos AI&apos;s website.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Contact Information
                </h2>
                <div className="text-gray-600 dark:text-gray-300">
                  <p>
                    If you have any questions about these Terms of Service, please contact us at{' '}
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
