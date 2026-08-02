import NetInfo from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';

import i18n from '@/i18n';
import { toast } from '@/store/useToastStore';

/**
 * Live connectivity for the API layer.
 *
 * Axios cannot tell "this phone has no internet" from "the server is down" —
 * both surface as a response-less error. NetInfo can, so the interceptor asks
 * this before choosing which message to show.
 *
 * The subscription is module-level and never torn down: it lasts as long as the
 * app process, and NetInfo's listener is cheap.
 */
let offline = false;

/**
 * Losing the connection typically fails several in-flight requests at once
 * (plus react-query retries), and the drop itself also announces. One shared
 * throttle keeps that to a single message; the toast store additionally ignores
 * a message already on screen.
 */
const TOAST_COOLDOWN_MS = 4000;
let lastToastAt = 0;

/** Throttled connectivity toast, shared by the drop event and failed requests. */
export function notifyConnectivityIssue(message: string): void {
  const now = Date.now();
  if (now - lastToastAt < TOAST_COOLDOWN_MS) return;
  lastToastAt = now;
  toast.error(message);
}

NetInfo.addEventListener((state) => {
  // `isInternetReachable` is null until the first probe resolves — only treat
  // an explicit false as offline, so a slow probe never fakes a disconnection.
  const nowOffline =
    state.isConnected === false || state.isInternetReachable === false;

  // Announce the drop itself. Without this the user only learns they are
  // offline if something happens to be fetching at that moment.
  if (nowOffline && !offline) {
    notifyConnectivityIssue(i18n.t('errors.offline'));
  }
  offline = nowOffline;

  // react-query has no idea about connectivity on React Native unless told.
  // This drives refetch-on-reconnect; requests themselves still run while
  // offline (see queryClient's `networkMode`) so failures surface as errors
  // rather than a query paused behind a spinner that never resolves.
  onlineManager.setOnline(!nowOffline);
});

/** True when the device itself has no usable connection. */
export const isDeviceOffline = (): boolean => offline;
