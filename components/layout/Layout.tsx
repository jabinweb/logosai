'use client';

import { ReactNode } from 'react';
import { Header, Footer } from './index';

interface LayoutProps {
  children: ReactNode;
  className?: string;
  showHeader?: boolean;
  showFooter?: boolean;
}

export default function Layout({ 
  children, 
  className = '', 
  showHeader = true, 
  showFooter = true 
}: LayoutProps) {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 transition-colors duration-300 ${className}`}>
      {showHeader && <Header />}
      {children}
      {showFooter && <Footer />}
    </div>
  );
}
