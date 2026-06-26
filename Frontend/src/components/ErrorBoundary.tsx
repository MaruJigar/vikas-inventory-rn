import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/theme';
import { Button } from '@/components/Button';

interface Props {
  children: React.ReactNode;
}
interface State {
  hasError: boolean;
}

/** Catches render-time crashes and shows a recoverable fallback. */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    if (__DEV__) console.error('ErrorBoundary caught:', error);
  }

  reset = () => this.setState({ hasError: false });

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.wrap}>
          <Text style={typography.h2}>Something went wrong</Text>
          <Text style={styles.message}>
            The app hit an unexpected error. Please try again.
          </Text>
          <Button label="Try again" onPress={this.reset} style={styles.action} />
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  message: { ...typography.body, textAlign: 'center', marginTop: spacing.sm },
  action: { marginTop: spacing.lg, alignSelf: 'stretch' },
});
