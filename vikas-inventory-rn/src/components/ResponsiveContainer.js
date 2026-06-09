import React from 'react';
import { View, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { COLORS } from '../styles/colors';

/**
 * ResponsiveContainer
 * - On Android: renders children full-width (standard mobile layout)
 * - On Web: constrains to max 480px (phone-like) and centers on screen
 *   with a subtle background behind it
 */
export const ResponsiveContainer = ({ children, style }) => {
  const { width } = useWindowDimensions();

  if (Platform.OS === 'web' && width > 500) {
    return (
      <View style={styles.webOuter}>
        <View style={[styles.webInner, style]}>
          {children}
        </View>
      </View>
    );
  }

  return <View style={[styles.mobileContainer, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  mobileContainer: {
    flex: 1,
  },
  webOuter: {
    flex: 1,
    backgroundColor: '#0F172A', // Sophisticated Slate Background for Web
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        backgroundImage: 'radial-gradient(circle at top left, #1e293b 0%, #0f172a 100%)',
      },
    }),
  },
  webInner: {
    width: '100%',
    maxWidth: 600, // Perfect "Tablet" scale for web, avoiding stretch while retaining full usability
    height: '100%',
    backgroundColor: COLORS.white,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
      },
    }),
  },
});
