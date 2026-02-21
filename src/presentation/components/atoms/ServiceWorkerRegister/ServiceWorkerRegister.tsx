'use client';

import { type FC, useEffect } from 'react';

const ServiceWorkerRegister: FC = () => {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Service worker registration failed silently
      });
    }
  }, []);

  return null;
};

ServiceWorkerRegister.displayName = 'ServiceWorkerRegister';

export { ServiceWorkerRegister };
