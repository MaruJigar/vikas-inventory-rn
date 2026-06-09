import React, { useContext, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, Platform, StatusBar,
} from 'react-native';
import { AppContext } from '../context/AppContext';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../styles/colors';

export const InvoiceScreen = ({ navigation, route }) => {
  const { appState } = useContext(AppContext);
  const orderId = route?.params?.orderId;

  const order = useMemo(() => appState.orders.find(o => o.id === orderId), [appState.orders, orderId]);
  const customer = useMemo(() => order ? appState.customers.find(c => c.id === order.customerId) : null, [order, appState.customers]);
  const config = appState.businessConfig;

  const isInterState = customer ? customer.stateCode !== config?.stateCode : false;

  const invoiceData = useMemo(() => {
    if (!order) return null;

    const items = order.items.map(item => {
      const unitPrice = item.appliedPrice || item.price;
      const taxableValue = unitPrice * item.quantity;
      const gstRate = item.gstRate || 18;
      const taxAmount = taxableValue * (gstRate / 100);
      return {
        ...item, unitPrice, taxableValue, gstRate,
        cgst: isInterState ? 0 : taxAmount / 2,
        sgst: isInterState ? 0 : taxAmount / 2,
        igst: isInterState ? taxAmount : 0,
        lineTotal: taxableValue + taxAmount,
      };
    });

    const subtotal = items.reduce((s, i) => s + i.taxableValue, 0);
    const totalCgst = items.reduce((s, i) => s + i.cgst, 0);
    const totalSgst = items.reduce((s, i) => s + i.sgst, 0);
    const totalIgst = items.reduce((s, i) => s + i.igst, 0);
    const grandTotal = subtotal + totalCgst + totalSgst + totalIgst;

    return { items, subtotal, totalCgst, totalSgst, totalIgst, grandTotal };
  }, [order, isInterState]);

  if (!order || !invoiceData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Invoice</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.emptyState}><Text style={{ fontSize: 48 }}>🧾</Text><Text style={styles.emptyText}>Order not found</Text></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tax Invoice</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Invoice Header */}
        <View style={styles.invoiceHeader}>
          <Text style={styles.invoiceTitle}>TAX INVOICE</Text>
          <Text style={styles.invoiceSubtitle}>{isInterState ? 'Inter-State (IGST)' : 'Intra-State (CGST + SGST)'}</Text>
        </View>

        {/* Seller & Buyer */}
        <View style={styles.partiesRow}>
          <View style={[styles.partyCard, { borderLeftColor: COLORS.primary }]}>
            <Text style={styles.partyLabel}>FROM</Text>
            <Text style={styles.partyName}>{config?.companyName}</Text>
            <Text style={styles.partyDetail}>{config?.address}</Text>
            <Text style={styles.partyGst}>GSTIN: {config?.gstin}</Text>
          </View>
          <View style={[styles.partyCard, { borderLeftColor: COLORS.secondary }]}>
            <Text style={styles.partyLabel}>TO</Text>
            <Text style={styles.partyName}>{customer?.name}</Text>
            <Text style={styles.partyDetail}>{customer?.city}, {customer?.state}</Text>
            {customer?.gstNumber && <Text style={styles.partyGst}>GSTIN: {customer.gstNumber}</Text>}
          </View>
        </View>

        {/* Invoice Meta */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Invoice No</Text>
            <Text style={styles.metaValue}>INV-{order.id.slice(4)}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Date</Text>
            <Text style={styles.metaValue}>{order.date}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Order Ref</Text>
            <Text style={styles.metaValue}>{order.id}</Text>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.tableCard}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.th, { flex: 2.5 }]}>Item</Text>
            <Text style={styles.th}>HSN</Text>
            <Text style={styles.th}>Qty</Text>
            <Text style={styles.th}>Rate</Text>
            <Text style={styles.th}>Taxable</Text>
            {isInterState ? (
              <Text style={styles.th}>IGST</Text>
            ) : (
              <><Text style={styles.th}>CGST</Text><Text style={styles.th}>SGST</Text></>
            )}
            <Text style={[styles.th, { textAlign: 'right' }]}>Total</Text>
          </View>

          {/* Table Rows */}
          {invoiceData.items.map((item, i) => (
            <View key={i} style={[styles.tableRow, i % 2 === 0 && styles.tableRowAlt]}>
              <View style={{ flex: 2.5 }}>
                <Text style={styles.tdBold} numberOfLines={1}>{item.name}</Text>
              </View>
              <Text style={styles.td}>{item.hsnCode || '—'}</Text>
              <Text style={styles.td}>{item.quantity}</Text>
              <Text style={styles.td}>₹{item.unitPrice}</Text>
              <Text style={styles.td}>₹{item.taxableValue.toLocaleString('en-IN')}</Text>
              {isInterState ? (
                <View style={{ flex: 1 }}>
                  <Text style={styles.td}>₹{item.igst.toFixed(0)}</Text>
                  <Text style={styles.tdRate}>@{item.gstRate}%</Text>
                </View>
              ) : (
                <>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.td}>₹{item.cgst.toFixed(0)}</Text>
                    <Text style={styles.tdRate}>@{item.gstRate / 2}%</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.td}>₹{item.sgst.toFixed(0)}</Text>
                    <Text style={styles.tdRate}>@{item.gstRate / 2}%</Text>
                  </View>
                </>
              )}
              <Text style={[styles.tdBold, { flex: 1, textAlign: 'right' }]}>₹{item.lineTotal.toFixed(0)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsCard}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Taxable Value</Text>
            <Text style={styles.totalsValue}>₹{invoiceData.subtotal.toLocaleString('en-IN')}</Text>
          </View>
          {isInterState ? (
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>IGST</Text>
              <Text style={styles.totalsValue}>₹{invoiceData.totalIgst.toLocaleString('en-IN')}</Text>
            </View>
          ) : (
            <>
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>CGST</Text>
                <Text style={styles.totalsValue}>₹{invoiceData.totalCgst.toLocaleString('en-IN')}</Text>
              </View>
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>SGST</Text>
                <Text style={styles.totalsValue}>₹{invoiceData.totalSgst.toLocaleString('en-IN')}</Text>
              </View>
            </>
          )}
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Grand Total</Text>
            <Text style={styles.grandTotalValue}>₹{invoiceData.grandTotal.toLocaleString('en-IN')}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.invoiceFooter}>
          <Text style={styles.footerNote}>This is a computer-generated invoice preview.</Text>
          <Text style={styles.footerCompany}>For {config?.companyName}</Text>
        </View>

        <View style={{ height: SPACING['2xl'] }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  header: {
    backgroundColor: COLORS.white, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + SPACING.md : SPACING.xl,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.backgroundAlt, justifyContent: 'center', alignItems: 'center' },
  backText: { fontSize: 18, fontWeight: '600', color: COLORS.gray900 },
  headerTitle: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: '700', color: COLORS.gray900, flex: 1, textAlign: 'center' },

  content: { flex: 1, padding: SPACING.lg },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: TYPOGRAPHY.sizes.lg, color: COLORS.gray500, marginTop: SPACING.md },

  // Invoice Header
  invoiceHeader: { alignItems: 'center', marginBottom: SPACING.xl },
  invoiceTitle: { fontSize: TYPOGRAPHY.sizes['2xl'], fontWeight: '800', color: COLORS.gray900, letterSpacing: 2 },
  invoiceSubtitle: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.primary, fontWeight: '600', marginTop: SPACING.xs },

  // Parties
  partiesRow: { gap: SPACING.md, marginBottom: SPACING.lg },
  partyCard: {
    backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.md, padding: SPACING.lg,
    borderLeftWidth: 4, ...SHADOWS.sm,
  },
  partyLabel: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.gray400, fontWeight: '700', letterSpacing: 1, marginBottom: SPACING.xs },
  partyName: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: '700', color: COLORS.gray900 },
  partyDetail: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.gray600, marginTop: 2 },
  partyGst: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.primary, fontWeight: '600', marginTop: SPACING.xs },

  // Meta
  metaRow: {
    flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg,
  },
  metaItem: { flex: 1, backgroundColor: COLORS.white, padding: SPACING.md, borderRadius: BORDER_RADIUS.md, ...SHADOWS.sm },
  metaLabel: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.gray500, textTransform: 'uppercase', marginBottom: SPACING.xs },
  metaValue: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: '700', color: COLORS.gray900 },

  // Table
  tableCard: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, overflow: 'hidden', marginBottom: SPACING.lg, ...SHADOWS.sm },
  tableHeader: { flexDirection: 'row', backgroundColor: COLORS.gray800, padding: SPACING.sm },
  th: { flex: 1, fontSize: 9, fontWeight: '700', color: COLORS.white, textTransform: 'uppercase', letterSpacing: 0.3 },
  tableRow: { flexDirection: 'row', alignItems: 'center', padding: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  tableRowAlt: { backgroundColor: COLORS.gray50 },
  td: { flex: 1, fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.gray700 },
  tdBold: { flex: 1, fontSize: TYPOGRAPHY.sizes.xs, fontWeight: '600', color: COLORS.gray900 },
  tdRate: { fontSize: 8, color: COLORS.gray400 },

  // Totals
  totalsCard: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg, marginBottom: SPACING.lg, ...SHADOWS.sm },
  totalsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  totalsLabel: { fontSize: TYPOGRAPHY.sizes.sm, color: COLORS.gray600 },
  totalsValue: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: '600', color: COLORS.gray900 },
  grandTotalRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: SPACING.md, marginTop: SPACING.sm,
  },
  grandTotalLabel: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: '700', color: COLORS.gray900 },
  grandTotalValue: { fontSize: TYPOGRAPHY.sizes.xl, fontWeight: '800', color: COLORS.primary },

  // Footer
  invoiceFooter: { alignItems: 'center', paddingVertical: SPACING.lg },
  footerNote: { fontSize: TYPOGRAPHY.sizes.xs, color: COLORS.gray400 },
  footerCompany: { fontSize: TYPOGRAPHY.sizes.sm, fontWeight: '700', color: COLORS.gray700, marginTop: SPACING.sm },
});
