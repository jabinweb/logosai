'use client';

import Link from 'next/link';
import UserAuth from '../UserAuth';
import { LogosAIIcon } from '../icons';
import { useState, useEffect, useRef } from 'react';

interface HeaderProps {
  className?: string;
}

export default function Header({ className = '' }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className={`bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-300 sticky top-0 z-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4" ref={menuRef}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Link href="/" className="flex items-center space-x-2 sm:space-x-3 hover:opacity-80 transition-opacity">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center p-1">
                <LogosAIIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">LogosAI</h1>
              <span className="hidden sm:inline text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full">AI Powered</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
            <Link href="/read" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors text-sm lg:text-base">
              Read Bible
            </Link>
            <Link href="/history" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
              Search History
            </Link>
            <Link href="/bookmarks" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
              Bookmarks
            </Link>
            <Link href="#" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
              About
            </Link>
            <UserAuth />
          </nav>

          {/* Mobile Navigation */}
          <div className="flex items-center space-x-2 sm:space-x-3 md:hidden">
            {/* Mobile Read Bible icon - visible only on mobile */}
            <Link href="/read" className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </Link>
            
            <UserAuth />
            
            {/* Mobile menu button - moved to the end */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-lg">
              <nav className="px-4 py-3 space-y-2">
                <Link 
                  href="/history" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
                >
                  Search History
                </Link>
                <Link 
                  href="/bookmarks" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
                >
                  Bookmarks
                </Link>
                <Link 
                  href="#" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
                >
                  About
                </Link>
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
