import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { COLORS, BORDER_RADIUS, SPACING } from '../../styles/colors';

export const AppLoadingSkeleton = ({ 
  type = 'card', // card | list | detail
  count = 3,
  style 
}) => {
  const animatedValue = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [animatedValue]);

  const ItemCard = () => (
    <Animated.View style={[styles.card, { opacity: animatedValue }]}>
      <View style={styles.headerRow}>
        <View style={styles.blockLine} />
        <View style={styles.blockBadge} />
      </View>
      <View style={styles.blockLong} />
      <View style={styles.blockShort} />
    </Animated.View>
  );

  const ItemList = () => (
    <Animated.View style={[styles.listRow, { opacity: animatedValue }]}>
      <View style={styles.blockAvatar} />
      <View style={styles.listContent}>
        <View style={styles.blockLine} />
        <View style={styles.blockShort} />
      </View>
    </Animated.View>
  );

  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <View style={[styles.container, style]}>
      {items.map(i => (
        <View key={i}>
          {type === 'card' || type === 'detail' ? <ItemCard /> : <ItemList />}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  card: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  blockLine: {
    height: 16,
    backgroundColor: COLORS.gray200,
    borderRadius: BORDER_RADIUS.sm,
    width: '50%',
  },
  blockBadge: {
    height: 20,
    backgroundColor: COLORS.gray200,
    borderRadius: BORDER_RADIUS.full,
    width: 60,
  },
  blockLong: {
    height: 12,
    backgroundColor: COLORS.gray200,
    borderRadius: BORDER_RADIUS.sm,
    width: '80%',
    marginBottom: SPACING.sm,
  },
  blockShort: {
    height: 12,
    backgroundColor: COLORS.gray200,
    borderRadius: BORDER_RADIUS.sm,
    width: '40%',
  },
  blockAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.gray200,
    marginRight: SPACING.md,
  },
  listContent: {
    flex: 1,
    gap: SPACING.sm,
  }
});
