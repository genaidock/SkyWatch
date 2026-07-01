'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      if (process.env.NODE_ENV === 'production') {
        navigator.serviceWorker.register('/sw.js')
          .then((reg) => console.log('SW registered:', reg.scope))
          .catch((err) => console.warn('SW registration failed:', err));
      } else {
        // Unregister any active service workers in dev mode to prevent stale caching
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (let registration of registrations) {
            registration.unregister();
            console.log('Unregistered stale development Service Worker');
          }
        });
      }
    }
  }, []);

  return null;
}
