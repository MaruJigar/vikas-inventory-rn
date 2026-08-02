import { QueryClient } from '@tanstack/react-query';

import { isDeviceOffline } from '@/lib/network'; // also starts the listener

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      /**
       * Retrying while the device is offline just holds the spinner through the
       * backoff before failing anyway — fail on the first attempt instead, so
       * the toast and the retry-able error state appear immediately.
       */
      retry: (failureCount) => !isDeviceOffline() && failureCount < 2,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      /**
       * Default ('online') PAUSES a query when the device is offline: no
       * request is made, `status` stays pending, and the screen spins forever
       * with nothing to explain it. 'always' lets the request run and fail, so
       * the user gets the offline toast and an error state they can retry from.
       */
      networkMode: 'always',
    },
    mutations: {
      // Same reasoning: an offline "Place order" must fail and say so, not
      // queue up invisibly behind a paused mutation.
      networkMode: 'always',
    },
  },
});
