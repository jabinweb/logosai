import type { Metadata } from "next";
import { Inter, Eczar } from "next/font/google";
import "./globals.css";
import Providers from "../components/Providers";
import ServiceWorkerRegistration from "../components/ServiceWorkerRegistration";
import PWAInstallPrompt from "../components/PWAInstallPrompt";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const eczar = Eczar({
  variable: "--font-eczar",
  subsets: ["latin", "devanagari"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "LogosAI - AI-Powered Bible Study & Search",
  description: "Your intelligent companion for Bible study, sermon preparation, and spiritual discovery. Search scriptures, explore topics, and find inspiration through AI-powered insights.",
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Logos AI',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'Logos AI',
    'application-name': 'Logos AI',
    'msapplication-TileColor': '#2563eb',
    'msapplication-config': '/browserconfig.xml',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#2563eb',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${eczar.variable} antialiased font-sans bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200`}
      >
        <Providers>
          {children}
          <ServiceWorkerRegistration />
          <PWAInstallPrompt />
        </Providers>
      </body>
    </html>
  );
}
