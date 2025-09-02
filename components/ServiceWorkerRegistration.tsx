'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      window.workbox !== undefined
    ) {
      const wb = window.workbox;

      const promptNewVersionAvailable = () => {
        // Check if user wants to refresh to update to new version
        if (confirm('A new version is available! Refresh to update?')) {
          wb.addEventListener('controlling', () => {
            window.location.reload();
          });

          // Send a message to the waiting service worker to skip waiting
          wb.messageSkipWaiting();
        }
      };

      wb.addEventListener('waiting', promptNewVersionAvailable);
      wb.addEventListener('externalwaiting', promptNewVersionAvailable);

      // Register the service worker
      wb.register();
    } else if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator
    ) {
      // Fallback service worker registration
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered successfully:', registration);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New content is available
                  if (confirm('A new version is available! Refresh to update?')) {
                    window.location.reload();
                  }
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []);

  return null; // This component doesn't render anything
}

// Extend Window interface for workbox
declare global {
  interface Window {
    workbox?: {
      addEventListener: (event: string, handler: () => void) => void;
      messageSkipWaiting: () => void;
      register: () => void;
    };
  }
}
