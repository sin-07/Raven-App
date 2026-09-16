import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Course } from '../types';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { Badge } from './Badge';

interface CourseCardProps {
  course: Course;
  onPress: () => void;
  compact?: boolean;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, onPress, compact = false }) => {
  if (compact) {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        style={styles.compactCard}
      >
        <Image source={{ uri: course.thumbnail }} style={styles.compactImage} />
        <View style={styles.compactContent}>
          <View style={styles.topRow}>
            <Badge label={course.category} size="sm" variant="primary" />
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={13} color={COLORS.amber} />
              <Text style={styles.ratingText}>{course.rating}</Text>
            </View>
          </View>
          <Text style={styles.compactTitle} numberOfLines={2}>
            {course.title}
          </Text>
          <View style={styles.compactFooter}>
            <Text style={styles.compactDuration}>
              <Ionicons name="time-outline" size={12} color={COLORS.textMuted} /> {course.duration}
            </Text>
            <Text style={styles.compactPrice}>
              {course.isFree ? 'FREE' : `₹${course.price.toLocaleString('en-IN')}`}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={styles.card}
    >
      {/* Thumbnail */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: course.thumbnail }} style={styles.image} />
        <View style={styles.imageBadges}>
          <Badge label={course.category} variant="primary" />
          <Badge
            label={course.level}
            variant={course.level === 'Advanced' ? 'rose' : course.level === 'Intermediate' ? 'blue' : 'secondary'}
          />
        </View>
        {course.isPopular && (
          <View style={styles.popularBadge}>
            <Ionicons name="flash" size={12} color="#000000" />
            <Text style={styles.popularText}>POPULAR</Text>
          </View>
        )}
      </View>

      {/* Body */}
      <View style={styles.content}>
        {/* Rating and Lessons */}
        <View style={styles.metaRow}>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color={COLORS.amber} />
            <Text style={styles.ratingText}>{course.rating}</Text>
            <Text style={styles.ratingCount}>({course.totalRatings || 120})</Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaItem}>
            <Ionicons name="book-outline" size={13} color={COLORS.textSecondary} />
            <Text style={styles.metaText}>{course.totalLessons} Lessons</Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={13} color={COLORS.textSecondary} />
            <Text style={styles.metaText}>{course.duration}</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>
          {course.title}
        </Text>

        {/* Short Description */}
        <Text style={styles.description} numberOfLines={2}>
          {course.shortDescription}
        </Text>

        {/* Instructor & Price Row */}
        <View style={styles.footer}>
          <View style={styles.instructorRow}>
            <Image
              source={{ uri: course.instructor.avatar }}
              style={styles.instructorAvatar}
            />
            <View>
              <Text style={styles.instructorName} numberOfLines={1}>
                {course.instructor.name}
              </Text>
              <Text style={styles.instructorRole}>Faculty</Text>
            </View>
          </View>

          <View style={styles.priceContainer}>
            {course.originalPrice && !course.isFree && (
              <Text style={styles.originalPrice}>₹{course.originalPrice.toLocaleString('en-IN')}</Text>
            )}
            <Text style={[styles.price, course.isFree && styles.freePrice]}>
              {course.isFree ? 'FREE' : `₹${course.price.toLocaleString('en-IN')}`}
            </Text>
          </View>
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
    overflow: 'hidden',
    marginBottom: SPACING.lg,
  },
  imageContainer: {
    width: '100%',
    height: 170,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageBadges: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.md,
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  popularBadge: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    gap: 3,
  },
  popularText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 0.5,
  },
  content: {
    padding: SPACING.lg,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.amber,
  },
  ratingCount: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  metaDivider: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: COLORS.textMuted,
    marginHorizontal: SPACING.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
    lineHeight: 23,
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: SPACING.md,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  instructorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  instructorAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  instructorName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  instructorRole: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  originalPrice: {
    fontSize: 11,
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
  },
  price: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.primaryLight,
  },
  freePrice: {
    color: COLORS.cyan,
  },

  // Compact horizontal card for carousel
  compactCard: {
    width: 250,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    marginRight: SPACING.md,
  },
  compactImage: {
    width: '100%',
    height: 120,
  },
  compactContent: {
    padding: SPACING.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    lineHeight: 19,
    marginBottom: 8,
    height: 38,
  },
  compactFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  compactDuration: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  compactPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primaryLight,
  },
});
