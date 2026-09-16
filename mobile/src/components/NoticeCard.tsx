import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Notice } from '../types';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { Badge } from './Badge';

interface NoticeCardProps {
  notice: Notice;
  onPress: () => void;
}

export const NoticeCard: React.FC<NoticeCardProps> = ({ notice, onPress }) => {
  const getCategoryVariant = (cat: Notice['category']) => {
    switch (cat) {
      case 'Urgent':
        return 'rose';
      case 'Exam':
        return 'amber';
      case 'Academic':
        return 'blue';
      default:
        return 'secondary';
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.card, notice.isImportant && styles.importantCard]}
    >
      <View style={styles.header}>
        <View style={styles.badgeRow}>
          <Badge label={notice.category} variant={getCategoryVariant(notice.category)} />
          {notice.isImportant && (
            <View style={styles.urgentBadge}>
              <Ionicons name="alert-circle" size={12} color="#FFFFFF" />
              <Text style={styles.urgentText}>IMPORTANT</Text>
            </View>
          )}
        </View>
        <Text style={styles.dateText}>{notice.date}</Text>
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {notice.title}
      </Text>

      <Text style={styles.message} numberOfLines={2}>
        {notice.message}
      </Text>

      <View style={styles.footer}>
        <Text style={styles.postedBy}>
          Posted by: <Text style={styles.postedByName}>{notice.postedBy}</Text>
        </Text>
        <View style={styles.readMore}>
          <Text style={styles.readMoreText}>View Details</Text>
          <Ionicons name="chevron-forward" size={14} color="#FFFFFF" />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  importantCard: {
    borderColor: 'rgba(244, 63, 94, 0.4)',
    backgroundColor: '#161324',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  urgentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
    gap: 3,
  },
  urgentText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  dateText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
    lineHeight: 21,
    marginBottom: 6,
  },
  message: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: SPACING.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  postedBy: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  postedByName: {
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  readMore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  readMoreText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryLight,
  },
});
