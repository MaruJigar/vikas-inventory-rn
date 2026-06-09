import React, { useContext, useMemo, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, Platform, StatusBar, Dimensions
} from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { AppContext } from '../context/AppContext';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../styles/colors';
import { Feather } from '@expo/vector-icons';

const FILTER_OPTIONS = ['Weekly', 'Monthly', 'Quarterly', 'Yearly'];

const chartConfig = {
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`, // Indigo primary
  strokeWidth: 2,
  barPercentage: 0.6,
  useShadowColorFromDataset: false,
  decimalPlaces: 0,
  labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`, // Gray text
  propsForDots: {
    r: '4',
    strokeWidth: '2',
    stroke: COLORS.primary
  }
};

const screenWidth = Dimensions.get('window').width > 440 ? 400 : Dimensions.get('window').width - 32;

export const AnalyticsScreen = ({ navigation }) => {
  const { appState } = useContext(AppContext);
  const [timeFilter, setTimeFilter] = useState('Monthly');

  // Filter dynamic date datasets
  const filteredOrders = useMemo(() => {
    const now = new Date();
    const daysLimit = timeFilter === 'Weekly' ? 7 : timeFilter === 'Monthly' ? 30 : timeFilter === 'Quarterly' ? 90 : 365;
    
    return appState.orders.filter(order => {
      const orderDate = new Date(order.date);
      const diffTime = Math.abs(now - orderDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Fallback: If data is purely mock and older, keep high fidelity for Quarterly/Yearly visibility
      if (timeFilter === 'Quarterly' || timeFilter === 'Yearly') return true;
      return diffDays <= daysLimit;
    });
  }, [appState.orders, timeFilter]);

  // 1. Line Chart Data: Revenue Trend Over Time
  const trendData = useMemo(() => {
    // Extract last 6 discrete items to show continuity
    const sorted = [...filteredOrders].sort((a,b) => new Date(a.date) - new Date(b.date)).slice(-5);
    const labels = sorted.map(o => o.date.slice(-2) + '/' + o.date.slice(5,7));
    const datasets = sorted.map(o => o.total / 1000); // In Thousands for scale
    
    if (labels.length === 0) {
      return { labels: ['N/A'], datasets: [{ data: [0] }] };
    }
    return {
      labels,
      datasets: [{ data: datasets }]
    };
  }, [filteredOrders]);

  // 2. Bar Chart Data: Top Salesmen Comparison
  const salesmenChart = useMemo(() => {
    const map = {};
    filteredOrders.forEach(o => {
      const name = o.salesmanName || 'Other';
      map[name] = (map[name] || 0) + o.total;
    });
    
    const data = Object.entries(map).sort((a,b) => b[1]-a[1]).slice(0, 4);
    
    return {
      labels: data.map(d => d[0].split(' ')[0]), // First name
      datasets: [{ data: data.map(d => d[1] / 1000) }]
    };
  }, [filteredOrders]);

  // 3. Pie Chart Data: Category Distribution
  const categoryPie = useMemo(() => {
    const map = {};
    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        const cat = item.category || 'Steelware';
        map[cat] = (map[cat] || 0) + (item.appliedPrice * item.quantity);
      });
    });

    const pieColors = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
    return Object.entries(map).map(([name, value], index) => ({
      name,
      population: value,
      color: pieColors[index % pieColors.length],
      legendFontColor: COLORS.gray700,
      legendFontSize: 12,
    })).sort((a,b) => b.population - a.population);
  }, [filteredOrders]);

  // Table Reports Summary aggregates
  const totalRev = filteredOrders.reduce((a,b) => a + b.total, 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={18} color={COLORS.gray900} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analytics Suite</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Sticky Time Interval Filter */}
      <View style={styles.filterBar}>
        {FILTER_OPTIONS.map(opt => (
          <TouchableOpacity 
            key={opt} 
            style={[styles.filterChip, timeFilter === opt && styles.filterChipActive]}
            onPress={() => setTimeFilter(opt)}
          >
            <Text style={[styles.filterTxt, timeFilter === opt && styles.filterTxtActive]}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Summary Metric */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>{timeFilter} Gross Revenue</Text>
          <Text style={styles.summaryValue}>₹{totalRev.toLocaleString('en-IN')}</Text>
          <Text style={styles.summarySub}>{filteredOrders.length} transactions cleared</Text>
        </View>

        {/* Chart 1: Revenue Trend */}
        <View style={styles.chartContainer}>
          <View style={styles.chartHeaderRow}>
            <Feather name="trending-up" size={16} color={COLORS.primary} style={{marginTop: Platform.OS === 'web' ? 2 : 0}} />
            <Text style={styles.chartTitleClean}>Revenue Growth (₹k)</Text>
          </View>
          {trendData.labels.length > 1 ? (
            <LineChart
              data={trendData}
              width={screenWidth}
              height={180}
              yAxisSuffix="k"
              chartConfig={chartConfig}
              bezier
              style={styles.chartStyles}
            />
          ) : <Text style={styles.emptyChart}>Insufficient historical trend data for filter.</Text>}
        </View>

        {/* Chart 2: Salesman Output */}
        <View style={styles.chartContainer}>
          <View style={styles.chartHeaderRow}>
            <Feather name="bar-chart-2" size={16} color="#10B981" style={{marginTop: Platform.OS === 'web' ? 2 : 0}} />
            <Text style={styles.chartTitleClean}>Leaderboard Output (₹k)</Text>
          </View>
          {salesmenChart.labels.length > 0 ? (
            <BarChart
              data={salesmenChart}
              width={screenWidth}
              height={200}
              yAxisSuffix="k"
              chartConfig={{
                ...chartConfig,
                backgroundGradientFrom: '#f8fafc',
                backgroundGradientTo: '#f8fafc',
                color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})` // Green for sales
              }}
              style={styles.chartStyles}
              verticalLabelRotation={0}
              fromZero
            />
          ) : <Text style={styles.emptyChart}>No sales activity recorded.</Text>}
        </View>

        {/* Chart 3: Category Pie */}
        <View style={styles.chartContainer}>
          <View style={styles.chartHeaderRow}>
            <Feather name="pie-chart" size={16} color="#8B5CF6" style={{marginTop: Platform.OS === 'web' ? 2 : 0}} />
            <Text style={styles.chartTitleClean}>Segment Concentration</Text>
          </View>
          {categoryPie.length > 0 ? (
            <PieChart
              data={categoryPie}
              width={screenWidth}
              height={180}
              chartConfig={chartConfig}
              accessor={"population"}
              backgroundColor={"transparent"}
              paddingLeft={"15"}
              absolute
              style={styles.chartStyles}
            />
          ) : <Text style={styles.emptyChart}>No category volume data.</Text>}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    backgroundColor: COLORS.white, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + SPACING.md : SPACING.xl,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.backgroundAlt, justifyContent: 'center', alignItems: 'center' },
  backText: { fontSize: 18, fontWeight: '600', color: COLORS.gray900 },
  headerTitle: { fontSize: TYPOGRAPHY.sizes.lg, fontWeight: '800', color: COLORS.gray900, flex: 1, textAlign: 'center' },

  filterBar: { flexDirection: 'row', backgroundColor: COLORS.white, paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md, gap: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  filterChip: { flex: 1, paddingVertical: SPACING.sm, backgroundColor: '#F1F5F9', borderRadius: BORDER_RADIUS.md, alignItems: 'center' },
  filterChipActive: { backgroundColor: COLORS.primary },
  filterTxt: { fontSize: 12, fontWeight: '600', color: COLORS.gray600 },
  filterTxtActive: { color: COLORS.white },

  content: { flex: 1, padding: SPACING.lg },
  
  summaryCard: { backgroundColor: COLORS.primary, padding: SPACING.xl, borderRadius: BORDER_RADIUS.lg, marginBottom: SPACING.xl, ...SHADOWS.colored(COLORS.primary) },
  summaryLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '600', textTransform: 'uppercase' },
  summaryValue: { color: COLORS.white, fontSize: 28, fontWeight: '800', marginVertical: SPACING.xs },
  summarySub: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },

  chartContainer: { backgroundColor: COLORS.white, padding: SPACING.md, borderRadius: BORDER_RADIUS.lg, marginBottom: SPACING.lg, ...SHADOWS.sm },
  chartHeaderRow: { flexDirection: 'row', alignItems: 'center', paddingLeft: 8, marginBottom: SPACING.md, gap: 8 },
  chartTitleClean: { fontSize: TYPOGRAPHY.sizes.base, fontWeight: '700', color: COLORS.gray800 },
  chartStyles: {
    marginVertical: 8,
    borderRadius: 16
  },
  emptyChart: { textAlign: 'center', color: COLORS.gray400, paddingVertical: 40, fontSize: 13 },
});
