import React, { useCallback, useRef, useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { colors, radius, spacing } from '@/theme';

interface Props {
  urls: string[];
  /** Square edge length of the image box; also each page's width. */
  size: number;
}

/**
 * Inline swipeable image strip for list cards. Products keep several photos in
 * one comma-separated column, so this pages through them in place.
 *
 * Every dimension is an explicit number rather than a percentage: paging
 * measures against the scroll view's own width, and a percentage inside a
 * centered flex parent collapses to content width, which silently kills the
 * swipe.
 */
export function ImageCarousel({ urls, size }: Props) {
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  // `onScroll` — NOT `onMomentumScrollEnd`, which never fires on react-native-web
  // because web scrolling has no momentum phase. Without this the dots freeze
  // on the first page even though the image moved.
  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const next = Math.round(e.nativeEvent.contentOffset.x / size);
      setIndex((prev) => (prev === next ? prev : next));
    },
    [size],
  );

  const goTo = useCallback(
    (i: number) => {
      const clamped = Math.max(0, Math.min(i, urls.length - 1));
      setIndex(clamped);
      scrollRef.current?.scrollTo({ x: clamped * size, animated: true });
    },
    [size, urls.length],
  );

  if (urls.length === 0) return null;

  const box = { width: size, height: size };

  // One photo needs no scroll view at all.
  if (urls.length === 1) {
    return (
      <View style={[styles.frame, box]}>
        <Image source={{ uri: urls[0] }} style={box} />
      </View>
    );
  }

  return (
    <View style={{ width: size }}>
      <View style={[styles.frame, box]}>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          nestedScrollEnabled
          directionalLockEnabled
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onScroll={onScroll}
          style={box}
        >
          {urls.map((url, i) => (
            <Image key={`${url}-${i}`} source={{ uri: url }} style={box} />
          ))}
        </ScrollView>

        {/* A mouse can't drag-scroll a container, so web needs real controls.
            Touch devices keep the plain swipe. */}
        {Platform.OS === 'web' ? (
          <>
            {index > 0 ? (
              <Pressable
                style={[styles.arrow, styles.arrowLeft]}
                onPress={() => goTo(index - 1)}
                accessibilityRole="button"
              >
                <Ionicons name="chevron-back" size={14} color="#FFFFFF" />
              </Pressable>
            ) : null}
            {index < urls.length - 1 ? (
              <Pressable
                style={[styles.arrow, styles.arrowRight]}
                onPress={() => goTo(index + 1)}
                accessibilityRole="button"
              >
                <Ionicons name="chevron-forward" size={14} color="#FFFFFF" />
              </Pressable>
            ) : null}
          </>
        ) : null}
      </View>

      {/* Below the image, not overlaid — dots on top of a small thumbnail are
          unreadable and cover the photo. Tappable so there's always a way to
          change page even if the gesture fails. */}
      <View style={styles.dots}>
        {urls.map((url, i) => (
          <Pressable
            key={`${url}-dot-${i}`}
            onPress={() => goTo(i)}
            hitSlop={6}
            accessibilityRole="button"
          >
            <View style={[styles.dot, i === index && styles.dotActive]} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    marginTop: spacing.xs,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
  },
  dotActive: { backgroundColor: colors.primary },
  arrow: {
    position: 'absolute',
    top: '50%',
    marginTop: -11,
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowLeft: { left: 2 },
  arrowRight: { right: 2 },
});
