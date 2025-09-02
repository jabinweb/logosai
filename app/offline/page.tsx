'use client';

import Link from 'next/link'
import { WifiIcon, HomeIcon, BookOpenIcon } from '@heroicons/react/24/outline'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Offline Icon */}
        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gray-200 dark:bg-gray-700 mb-6">
          <WifiIcon className="h-10 w-10 text-gray-500 dark:text-gray-400" />
        </div>
        
        {/* Heading */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          You&apos;re Offline
        </h1>
        
        {/* Description */}
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          It looks like you&apos;ve lost your internet connection. Don&apos;t worry - you can still access some features of LogosAI while offline.
        </p>
        
        {/* Available Features */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Available Offline Features
          </h2>
          <ul className="space-y-3 text-left">
            <li className="flex items-center text-gray-700 dark:text-gray-300">
              <BookOpenIcon className="h-5 w-5 mr-3 text-blue-500" />
              Read previously loaded Bible chapters
            </li>
            <li className="flex items-center text-gray-700 dark:text-gray-300">
              <BookOpenIcon className="h-5 w-5 mr-3 text-blue-500" />
              View your saved bookmarks
            </li>
            <li className="flex items-center text-gray-700 dark:text-gray-300">
              <BookOpenIcon className="h-5 w-5 mr-3 text-blue-500" />
              Browse your search history
            </li>
          </ul>
        </div>
        
        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Try Again
          </button>
          
          <Link
            href="/"
            className="w-full inline-flex items-center justify-center bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
          >
            <HomeIcon className="h-5 w-5 mr-2" />
            Go to Home
          </Link>
        </div>
        
        {/* Connection Status */}
        <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Tip:</strong> Once you&apos;re back online, all your offline actions will be synchronized automatically.
          </p>
        </div>
      </div>
    </div>
  )
}
