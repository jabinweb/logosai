'use client';

import { useSession, signIn, signOut } from "next-auth/react";
import { UserIcon, ChevronDownIcon, BookmarkIcon, ClockIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

export default function UserAuth() {
  const { data: session, status } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (status === "loading") {
    return (
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600"></div>
    );
  }

  if (session) {
    return (
      <div className="relative" ref={dropdownRef}>
        {/* User Profile Button */}
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {session.user?.image ? (
            <Image
              src={session.user.image}
              alt={session.user?.name || "User"}
              width={32}
              height={32}
              className="h-8 w-8 rounded-full border border-gray-300 dark:border-gray-600"
            />
          ) : (
            <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
              <UserIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </div>
          )}
          <div className="hidden sm:flex items-center space-x-1">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {session.user?.name?.split(' ')[0] || 'User'}
            </span>
            <ChevronDownIcon className={`h-4 w-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
            {/* User Info Section */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                {session.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user?.name || "User"}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-full border border-gray-300 dark:border-gray-600"
                  />
                ) : (
                  <div className="h-12 w-12 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    <UserIcon className="h-7 w-7 text-gray-600 dark:text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {session.user?.name || 'User'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {session.user?.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-1">
              <Link
                href="/history"
                onClick={() => setIsDropdownOpen(false)}
                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ClockIcon className="h-5 w-5 mr-3 text-gray-400" />
                Search History
              </Link>

              <Link
                href="/bookmarks"
                onClick={() => setIsDropdownOpen(false)}
                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <BookmarkIcon className="h-5 w-5 mr-3 text-gray-400" />
                My Bookmarks
              </Link>

              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  // Navigate to settings
                }}
                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Cog6ToothIcon className="h-5 w-5 mr-3 text-gray-400" />
                Settings
              </button>
            </div>

            {/* Sign Out Section */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-1">
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  signOut();
                }}
                className="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn()}
      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 md:px-4 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center"
    >
      {/* Mobile: Show icon only */}
      <svg className="w-4 h-4 md:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
      </svg>
      {/* Desktop: Show text */}
      <span className="hidden md:inline">Sign in</span>
    </button>
  );
}
