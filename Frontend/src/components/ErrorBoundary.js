import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { AppEmptyState } from './ui/AppEmptyState';
import { AppButton } from './ui/AppButton';
import { COLORS, SPACING } from '../styles/colors';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // In a production environment, you would log this to a crash reporting service (e.g., Sentry)
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            <AppEmptyState
              icon="alert-octagon"
              title="Something went wrong"
              description={__DEV__ ? this.state.error?.toString() : "An unexpected error occurred. Please try again."}
            />
            <AppButton
              title="Reload App"
              variant="primary"
              onPress={this.handleReset}
              style={styles.retryButton}
              icon="refresh-cw"
            />
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  retryButton: {
    marginTop: SPACING.xl,
    minWidth: 200,
  },
});
