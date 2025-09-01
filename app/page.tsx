'use client';

import AIBibleSearch from '../components/AIBibleSearch';
import { Header, Footer } from '../components/layout';
import { MissionSection } from '../components/home';
// import { ThemeToggle } from '../components/ThemeToggle';

export default function Home() {
  return (
    <>
    {/* Header */}
    <Header />
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900 transition-colors duration-300">

      {/* AI Bible Search Section */}
      <section className="pt-8 sm:pt-12 lg:pt-16 pb-8 sm:pb-12">
        <AIBibleSearch />
      </section>

      {/* Mission Section */}
      <MissionSection />

      {/* Footer */}
      <Footer />
    </div>
    </>
  );
}
     