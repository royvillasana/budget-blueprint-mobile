/**
 * Registra el Service Worker para caching de assets y mejor performance
 */
export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      // Solo registrar en producción
      if (import.meta.env.MODE !== 'production') {
        console.log('[SW] Service Worker disabled in development');
        return;
      }

      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      console.log('[SW] Service Worker registered successfully:', registration.scope);

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New service worker available
            console.log('[SW] New version available. Please refresh.');

            // Optionally show a notification to the user
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Nueva versión disponible', {
                body: 'Hay una nueva versión de la aplicación. Por favor recarga la página.',
                icon: '/icon-192x192.png',
              });
            }
          }
        });
      });

      // Handle controller change (when new SW takes over)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[SW] Controller changed, reloading page...');
        window.location.reload();
      });

      return registration;
    } catch (error) {
      console.error('[SW] Service Worker registration failed:', error);
    }
  } else {
    console.log('[SW] Service Workers are not supported in this browser');
  }
}

/**
 * Desregistra el Service Worker
 */
export async function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.unregister();
      console.log('[SW] Service Worker unregistered');
    } catch (error) {
      console.error('[SW] Service Worker unregistration failed:', error);
    }
  }
}

/**
 * Limpia el cache del Service Worker
 */
export async function clearServiceWorkerCache() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      if (registration.active) {
        const messageChannel = new MessageChannel();

        return new Promise((resolve, reject) => {
          messageChannel.port1.onmessage = (event) => {
            if (event.data.success) {
              console.log('[SW] Cache cleared successfully');
              resolve(true);
            } else {
              reject(new Error('Failed to clear cache'));
            }
          };

          registration.active.postMessage(
            { type: 'CLEAR_CACHE' },
            [messageChannel.port2]
          );
        });
      }
    } catch (error) {
      console.error('[SW] Failed to clear cache:', error);
    }
  }
}

/**
 * Request notification permission (opcional)
 */
export async function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    const permission = await Notification.requestPermission();
    console.log('[Notifications] Permission:', permission);
    return permission;
  }
  return Notification.permission;
}
