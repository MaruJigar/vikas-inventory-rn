import React, { useContext, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { AppContext } from '../context/AppContext';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS, SHADOWS } from '../styles/colors';

const TaskCard = ({ task, onComplete }) => {
  const getPriorityColor = () => {
    switch (task.priority) {
      case 'high':
        return COLORS.danger;
      case 'medium':
        return COLORS.warning;
      case 'low':
        return COLORS.success;
      default:
        return COLORS.gray500;
    }
  };

  return (
    <View
      style={[
        styles.taskCard,
        task.status === 'completed' && styles.taskCardCompleted,
      ]}
    >
      <View style={styles.taskHeader}>
        <View style={styles.taskTitle}>
          <Text
            style={[
              styles.taskTitleText,
              task.status === 'completed' && styles.taskTitleCompleted,
            ]}
          >
            {task.title}
          </Text>
          <View
            style={[
              styles.priorityBadge,
              { backgroundColor: getPriorityColor() + '30' },
            ]}
          >
            <Text
              style={[
                styles.priorityText,
                { color: getPriorityColor() },
              ]}
            >
              {task.priority}
            </Text>
          </View>
        </View>

        {task.status === 'pending' && (
          <TouchableOpacity
            style={styles.completeButton}
            onPress={() => onComplete(task.id)}
          >
            <Text style={styles.completeButtonText}>✓</Text>
          </TouchableOpacity>
        )}
        {task.status === 'completed' && (
          <View style={styles.completedCheckmark}>
            <Text style={styles.completedCheckmarkText}>✓</Text>
          </View>
        )}
      </View>

      <Text style={styles.taskDescription}>{task.description}</Text>

      <View style={styles.taskFooter}>
        <Text style={styles.taskDate}>Due: {task.dueDate}</Text>
        <View
          style={[
            styles.statusBadge,
            task.status === 'completed'
              ? styles.statusCompleted
              : styles.statusPending,
          ]}
        >
          <Text style={styles.statusText}>
            {task.status === 'completed' ? 'Completed' : 'Pending'}
          </Text>
        </View>
      </View>
    </View>
  );
};

export const TasksScreen = ({ navigation }) => {
  const { appState, completeTask } = useContext(AppContext);

  const sortedTasks = useMemo(() => {
    return [...appState.tasks].sort((a, b) => {
      if (a.status === 'pending' && b.status === 'completed') return -1;
      if (a.status === 'completed' && b.status === 'pending') return 1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    });
  }, [appState.tasks]);

  const pendingTasks = sortedTasks.filter(t => t.status === 'pending');
  const completedTasks = sortedTasks.filter(t => t.status === 'completed');

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tasks</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Pending Tasks */}
        {pendingTasks.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>
              Pending ({pendingTasks.length})
            </Text>
            <FlatList
              data={pendingTasks}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item }) => (
                <TaskCard task={item} onComplete={completeTask} />
              )}
              scrollEnabled={false}
            />
          </>
        )}

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>
              Completed ({completedTasks.length})
            </Text>
            <FlatList
              data={completedTasks}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item }) => (
                <TaskCard task={item} onComplete={completeTask} />
              )}
              scrollEnabled={false}
            />
          </>
        )}

        {sortedTasks.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>✓</Text>
            <Text style={styles.emptyText}>All tasks completed!</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundAlt,
  },
  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  backButton: {
    paddingHorizontal: SPACING.sm,
  },
  backText: {
    color: COLORS.primary,
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '600',
    color: COLORS.gray900,
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: '600',
    color: COLORS.gray900,
    marginBottom: SPACING.md,
    marginTop: SPACING.lg,
  },
  taskCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
    ...SHADOWS.sm,
  },
  taskCardCompleted: {
    borderLeftColor: COLORS.success,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  taskTitle: {
    flex: 1,
  },
  taskTitleText: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: '600',
    color: COLORS.gray900,
    marginBottom: SPACING.xs,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: COLORS.gray500,
  },
  priorityBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    alignSelf: 'flex-start',
  },
  priorityText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  completeButton: {
    backgroundColor: COLORS.success,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: 'bold',
  },
  completedCheckmark: {
    backgroundColor: COLORS.successLight,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedCheckmarkText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: 'bold',
  },
  taskDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray600,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  taskDate: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray500,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  statusPending: {
    backgroundColor: COLORS.warningLight,
  },
  statusCompleted: {
    backgroundColor: COLORS.successLight,
  },
  statusText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING['3xl'],
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.gray500,
  },
});
