import { Alert, Platform } from 'react-native';

/**
 * Cross-platform dialogs. react-native-web ships `Alert.alert` as a no-op, so
 * on web we fall back to the browser's native `confirm`/`alert`.
 */

interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel: string;
  cancelLabel: string;
  destructive?: boolean;
  onConfirm: () => void;
}

export function confirmAction({
  title,
  message,
  confirmLabel,
  cancelLabel,
  destructive,
  onConfirm,
}: ConfirmOptions): void {
  if (Platform.OS === 'web') {
    const w = globalThis as { confirm?: (m?: string) => boolean };
    const ok = w.confirm?.(message ? `${title}\n\n${message}` : title);
    if (ok) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: cancelLabel, style: 'cancel' },
    {
      text: confirmLabel,
      style: destructive ? 'destructive' : 'default',
      onPress: onConfirm,
    },
  ]);
}

/** Simple message dialog (web uses window.alert). */
export function notify(message: string, title?: string): void {
  if (Platform.OS === 'web') {
    const w = globalThis as { alert?: (m?: string) => void };
    w.alert?.(title ? `${title}\n\n${message}` : message);
    return;
  }
  Alert.alert(title ?? message, title ? message : undefined);
}
