import React from 'react';

// This import is a virtual module provided by the vite-plugin-pwa.
// It provides a hook that handles the complex logic of service worker registration and updates.
// The `useRegisterSW` hook will give us the status of the service worker and a function to update it.
import { useRegisterSW } from 'virtual:pwa-register/react';

/**
 * A React component that prompts the user to reload the page when a new version of the app is available.
 * This is a common and important pattern for Progressive Web Apps (PWAs) to ensure users get updates.
 */
export const PwaReloadPrompt: React.FC = () => {
  // The options for the service worker registration.
  // `onRegistered` is called when the service worker is successfully registered.
  // `onRegisterError` is called if there's an error during registration.
  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW({
    onRegistered(r) {
      // This callback runs when the service worker is registered.
      // We log the registration for debugging purposes.
      console.log(`Service Worker registered: ${r}`);
    },
    onRegisterError(error) {
      // This callback runs if the service worker registration fails.
      // This is important for debugging PWA issues.
      console.error('Service Worker registration error:', error);
    },
  });

  // If the `needRefresh` state is false, it means there is no new version available,
  // so we don't render anything.
  if (!needRefresh) {
    return null;
  }

  // When `needRefresh` is true, we render the update prompt.
  return (
    <div className="pwa-toast fixed right-4 bottom-4 z-50 bg-[var(--toolbox-bg)] border border-[var(--border-color)] rounded-lg shadow-xl p-4 w-64">
      <div className="mb-2 font-semibold">Update Available</div>
      <div className="text-sm mb-4">A new version of the application is available. Reload to update.</div>
      {needRefresh && (
        <button 
          className="w-full px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors"
          onClick={() => updateServiceWorker(true)}
        >
          Reload
        </button>
      )}
    </div>
  );
};