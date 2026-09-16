import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Test } from '../types';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { Badge } from './Badge';

interface TestCardProps {
  test: Test;
  onPress: () => void;
}

export const TestCard: React.FC<TestCardProps> = ({ test, onPress }) => {
  const getDifficultyVariant = (diff: Test['difficulty']) => {
    switch (diff) {
      case 'Hard':
        return 'rose';
      case 'Medium':
        return 'amber';
      case 'Easy':
      default:
        return 'primary';
    }
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <Badge label={test.subject} variant="primary" />
          <Badge label={test.difficulty} variant={getDifficultyVariant(test.difficulty)} />
        </View>
        <View style={styles.standardBadge}>
          <Text style={styles.standardText}>{test.standard}</Text>
        </View>
      </View>

      {/* Title & Description */}
      <Text style={styles.title}>{test.title}</Text>
      <Text style={styles.description} numberOfLines={2}>
        {test.description}
      </Text>

      {/* Test Meta Info */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricItem}>
          <Ionicons name="time-outline" size={15} color={COLORS.textSecondary} />
          <View>
            <Text style={styles.metricLabel}>Duration</Text>
            <Text style={styles.metricValue}>{test.durationMinutes} mins</Text>
          </View>
        </View>

        <View style={styles.metricItem}>
          <Ionicons name="help-circle-outline" size={15} color={COLORS.textSecondary} />
          <View>
            <Text style={styles.metricLabel}>Questions</Text>
            <Text style={styles.metricValue}>{test.questionsCount} MCQs</Text>
          </View>
        </View>

        <View style={styles.metricItem}>
          <Ionicons name="trophy-outline" size={15} color={COLORS.textSecondary} />
          <View>
            <Text style={styles.metricLabel}>Marks</Text>
            <Text style={styles.metricValue}>{test.totalMarks} (Pass: {test.passingMarks})</Text>
          </View>
        </View>
      </View>

      {/* Action CTA */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        style={styles.actionButton}
      >
        <Text style={styles.actionButtonText}>Start Test Now</Text>
        <Ionicons name="arrow-forward" size={16} color="#000000" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  standardBadge: {
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  standardText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    lineHeight: 22,
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: SPACING.md,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metricLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '700',
    marginTop: 1,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md - 2,
    borderRadius: RADIUS.md,
    gap: 6,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000000',
  },
});
