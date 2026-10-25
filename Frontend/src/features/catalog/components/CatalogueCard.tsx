import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { Card } from '@/components';
import { colors, radius, spacing, typography } from '@/theme';
import { notify } from '@/lib/dialog';
import type { CatalogueItem } from '@/types/catalogue';
import {
  formatBytes,
  formatDate,
  openCataloguePdf,
  downloadCataloguePdf,
  shareCataloguePdf,
} from '@/features/catalog/utils/pdfHandler';

interface CatalogueCardProps {
  item: CatalogueItem;
  isPersonalized?: boolean;
}

export function CatalogueCard({ item, isPersonalized }: CatalogueCardProps) {
  const { t } = useTranslation();
  const [opening, setOpening] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);

  const isBusy = opening || downloading || sharing;

  const handleOpen = async () => {
    if (isBusy) return;
    try {
      setOpening(true);
      await openCataloguePdf(item.pdfUrl, item.fileName);
    } catch (err: any) {
      notify(t('catalogue.openError'), t('common.appName'));
    } finally {
      setOpening(false);
    }
  };

  const handleDownload = async () => {
    if (isBusy) return;
    try {
      setDownloading(true);
      await downloadCataloguePdf(item.downloadUrl || item.pdfUrl, item.fileName);
      notify(t('catalogue.downloadSuccess'), t('common.appName'));
    } catch (err: any) {
      notify(t('catalogue.downloadError'), t('common.appName'));
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    if (isBusy) return;
    try {
      setSharing(true);
      await shareCataloguePdf(item.pdfUrl, item.fileName, item.manufacturerName);
    } catch (err: any) {
      notify(t('catalogue.shareError'), t('common.appName'));
    } finally {
      setSharing(false);
    }
  };

  const locationText = [item.city, item.state].filter(Boolean).join(', ');

  return (
    <Card style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleWrap}>
          <Text style={typography.title} numberOfLines={1}>
            {item.manufacturerName}
          </Text>
          {locationText ? (
            <Text style={styles.location} numberOfLines={1}>
              <Ionicons name="location-outline" size={13} color={colors.textMuted} />{' '}
              {locationText}
            </Text>
          ) : null}
        </View>
        {isPersonalized ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{t('catalogue.linkedBadge')}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.fileInfoRow}>
        <Ionicons name="document-text-outline" size={18} color={colors.textMuted} />
        <Text style={styles.fileName} numberOfLines={1}>
          {item.fileName}
        </Text>
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.metaText}>{formatBytes(item.fileSizeBytes)}</Text>
        <Text style={styles.metaDot}>•</Text>
        <Text style={styles.metaText}>
          {t('catalogue.updatedOn', { date: formatDate(item.updatedAt) })}
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.actionsRow}>
        {/* Open Button */}
        <Pressable
          style={[styles.actionBtn, styles.primaryBtn, isBusy && styles.disabledBtn]}
          onPress={handleOpen}
          disabled={isBusy}
          accessibilityRole="button"
          accessibilityLabel={t('catalogue.openPdf')}
        >
          {opening ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="eye-outline" size={16} color="#FFFFFF" />
              <Text style={styles.primaryBtnText}>{t('catalogue.openPdf')}</Text>
            </>
          )}
        </Pressable>

        {/* Download Button */}
        <Pressable
          style={[styles.actionBtn, styles.secondaryBtn, isBusy && styles.disabledBtn]}
          onPress={handleDownload}
          disabled={isBusy}
          accessibilityRole="button"
          accessibilityLabel={t('catalogue.downloadPdf')}
        >
          {downloading ? (
            <ActivityIndicator size="small" color={colors.text} />
          ) : (
            <>
              <Ionicons name="arrow-down-circle-outline" size={16} color={colors.text} />
              <Text style={styles.secondaryBtnText}>{t('catalogue.downloadPdf')}</Text>
            </>
          )}
        </Pressable>

        {/* Share Button */}
        <Pressable
          style={[styles.actionBtn, styles.iconOnlyBtn, isBusy && styles.disabledBtn]}
          onPress={handleShare}
          disabled={isBusy}
          accessibilityRole="button"
          accessibilityLabel={t('catalogue.sharePdf')}
        >
          {sharing ? (
            <ActivityIndicator size="small" color={colors.text} />
          ) : (
            <Ionicons name="share-social-outline" size={18} color={colors.text} />
          )}
        </Pressable>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  titleWrap: {
    flex: 1,
  },
  location: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  badge: {
    backgroundColor: '#E6F4EA',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.success,
  },
  fileInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  fileName: {
    ...typography.body,
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: spacing.xs,
  },
  metaText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  metaDot: {
    ...typography.caption,
    color: colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    gap: spacing.xs,
    minHeight: 40,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    flex: 1,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  secondaryBtn: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    flex: 1,
  },
  secondaryBtnText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 13,
  },
  iconOnlyBtn: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  disabledBtn: {
    opacity: 0.6,
  },
});
