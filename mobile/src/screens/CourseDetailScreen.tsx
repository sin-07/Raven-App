import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { Badge, Button } from '../components';
import { Course, Lesson } from '../types';
import { apiService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

interface CourseDetailScreenProps {
  route: any;
  navigation: any;
}

export const CourseDetailScreen: React.FC<CourseDetailScreenProps> = ({ route, navigation }) => {
  const { id } = route.params || {};
  const { isLoggedIn } = useAuth();
  const toast = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum'>('overview');
  const [previewLesson, setPreviewLesson] = useState<Lesson | null>(null);
  const [enrolled, setEnrolled] = useState(false);

  useEffect(() => {
    if (id) {
      apiService.getCourseById(id).then((c) => {
        if (c) setCourse(c);
      });
    }
  }, [id]);

  if (!course) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading course details...</Text>
      </View>
    );
  }

  const handleEnroll = () => {
    if (!isLoggedIn) {
      toast.info('Classroom enrollment operates at our Patna Campus. Redirecting to Admission Application...');
      setTimeout(() => {
        navigation.navigate('AdmissionTab');
      }, 900);
      return;
    }

    setEnrolled(true);
    toast.success(`Enrolled in ${course.title}! Accessible in your Student Hub.`);
  };

  return (
    <View style={styles.container}>
      {/* Top Bar with Back Button */}
      <View style={styles.topBar}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle} numberOfLines={1}>
          {course.title}
        </Text>
        <TouchableOpacity
          activeOpacity={0.7}
          style={styles.shareButton}
          onPress={() => toast.success(`Course link for ${course.title} copied to clipboard!`)}
        >
          <Ionicons name="share-social-outline" size={20} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Hero Video Thumbnail */}
        <View style={styles.heroThumbnailContainer}>
          <Image source={{ uri: course.thumbnail }} style={styles.heroThumbnail} />
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              const firstLesson = course.lessons?.[0];
              if (firstLesson) {
                setPreviewLesson(firstLesson);
                toast.info(`Opening demo lecture: ${firstLesson.title}`);
              }
            }}
            style={styles.playButtonOverlay}
          >
            <Ionicons name="play" size={28} color="#000000" style={styles.playIcon} />
          </TouchableOpacity>
          <View style={styles.previewTag}>
            <Ionicons name="eye-outline" size={12} color="#FFFFFF" />
            <Text style={styles.previewTagText}>Tap to preview free intro</Text>
          </View>
        </View>

        {/* Title & Badges Section */}
        <View style={styles.mainInfo}>
          <View style={styles.badgesRow}>
            <Badge label={course.category} variant="primary" />
            <Badge
              label={course.level}
              variant={course.level === 'Advanced' ? 'rose' : course.level === 'Intermediate' ? 'blue' : 'secondary'}
            />
            {course.isPopular && <Badge label="POPULAR" variant="amber" />}
          </View>

          <Text style={styles.courseTitle}>{course.title}</Text>
          <Text style={styles.shortDescription}>{course.shortDescription}</Text>

          {/* Metrics bar */}
          <View style={styles.metricsBar}>
            <View style={styles.metricItem}>
              <Ionicons name="star" size={16} color={COLORS.amber} />
              <Text style={styles.metricValue}>{course.rating}</Text>
              <Text style={styles.metricLabel}>({course.totalRatings || 240})</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Ionicons name="people-outline" size={16} color={COLORS.primaryLight} />
              <Text style={styles.metricValue}>{course.totalStudents.toLocaleString()}</Text>
              <Text style={styles.metricLabel}>Enrolled</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Ionicons name="time-outline" size={16} color={COLORS.cyan} />
              <Text style={styles.metricValue}>{course.duration}</Text>
            </View>
          </View>
        </View>

        {/* Instructor Card */}
        <View style={styles.instructorCard}>
          <Image source={{ uri: course.instructor.avatar }} style={styles.instructorAvatar} />
          <View style={styles.instructorDetails}>
            <Text style={styles.instructorLabel}>Lead Faculty</Text>
            <Text style={styles.instructorName}>{course.instructor.name}</Text>
            <Text style={styles.instructorQual}>{course.instructor.qualification || 'Senior Educator'}</Text>
          </View>
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              setActiveTab('overview');
              toast.info('Viewing Program Overview');
            }}
            style={[styles.tabButton, activeTab === 'overview' && styles.tabButtonActive]}
          >
            <Text style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}>Overview</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              setActiveTab('curriculum');
              toast.info('Viewing Detailed Syllabus');
            }}
            style={[styles.tabButton, activeTab === 'curriculum' && styles.tabButtonActive]}
          >
            <Text style={[styles.tabText, activeTab === 'curriculum' && styles.tabTextActive]}>
              Syllabus ({course.lessons?.length || course.totalLessons} Lessons)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === 'overview' ? (
          <View style={styles.tabContent}>
            <Text style={styles.sectionHeader}>About this Course</Text>
            <Text style={styles.fullDescription}>{course.description}</Text>

            {course.features && course.features.length > 0 && (
              <View style={styles.featuresSection}>
                <Text style={styles.sectionHeader}>Key Offerings Included</Text>
                {course.features.map((feat, idx) => (
                  <View key={idx} style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={18} color={COLORS.primaryLight} />
                    <Text style={styles.featureText}>{feat}</Text>
                  </View>
                ))}
              </View>
            )}

            {course.syllabus && (
              <View style={styles.syllabusHighlights}>
                <Text style={styles.sectionHeader}>Key Topics Covered</Text>
                {course.syllabus.map((topic, idx) => (
                  <View key={idx} style={styles.topicItem}>
                    <View style={styles.topicIndexBadge}>
                      <Text style={styles.topicIndexText}>{(idx + 1).toString().padStart(2, '0')}</Text>
                    </View>
                    <Text style={styles.topicText}>{topic}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ) : (
          <View style={styles.tabContent}>
            <Text style={styles.sectionHeader}>Curriculum Lessons</Text>
            {course.lessons && course.lessons.length > 0 ? (
              course.lessons.map((lesson, idx) => (
                <TouchableOpacity
                  key={lesson.id}
                  activeOpacity={0.7}
                  onPress={() => setPreviewLesson(lesson)}
                  style={styles.lessonItem}
                >
                  <View style={styles.lessonLeft}>
                    <View
                      style={[
                        styles.lessonNumberBadge,
                        lesson.isFree && styles.freeLessonBadge,
                      ]}
                    >
                      <Ionicons
                        name={lesson.isCompleted ? 'checkmark' : lesson.isFree ? 'play' : 'lock-closed'}
                        size={14}
                        color={lesson.isCompleted ? COLORS.primary : lesson.isFree ? COLORS.cyan : COLORS.textMuted}
                      />
                    </View>
                    <View style={styles.lessonInfo}>
                      <Text style={styles.lessonTitle}>{lesson.title}</Text>
                      <View style={styles.lessonMeta}>
                        <Ionicons name="time-outline" size={12} color={COLORS.textMuted} />
                        <Text style={styles.lessonDuration}>{lesson.duration}</Text>
                        {lesson.isFree && (
                          <View style={styles.freeChip}>
                            <Text style={styles.freeChipText}>FREE PREVIEW</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noLessonsText}>Curriculum schedule will be updated shortly.</Text>
            )}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomPriceContainer}>
          <Text style={styles.bottomPriceLabel}>
            {isLoggedIn ? 'Total Tuition Fee' : 'Tuition (RSAT Eligible)'}
          </Text>
          <View style={styles.bottomPriceRow}>
            {course.originalPrice && !course.isFree && (
              <Text style={styles.bottomOriginalPrice}>₹{course.originalPrice.toLocaleString('en-IN')}</Text>
            )}
            <Text style={[styles.bottomPrice, course.isFree && styles.bottomFreePrice]}>
              {course.isFree ? 'FREE' : `₹${course.price.toLocaleString('en-IN')}`}
            </Text>
          </View>
        </View>

        <Button
          title={enrolled ? 'Enrolled ✓' : isLoggedIn ? 'Enroll in Course' : 'Apply for Patna Batch'}
          onPress={handleEnroll}
          variant={enrolled ? 'secondary' : 'primary'}
          style={styles.enrollButton}
          disabled={enrolled}
        />
      </View>

      {/* Preview Lesson Modal */}
      <Modal
        visible={previewLesson !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPreviewLesson(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalSubtitle}>Lesson Preview</Text>
                <Text style={styles.modalTitle} numberOfLines={1}>
                  {previewLesson?.title}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setPreviewLesson(null)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={20} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            {/* Video Player Simulator */}
            <View style={styles.playerSimulator}>
              <Image source={{ uri: course.thumbnail }} style={styles.playerBackground} />
              <View style={styles.playerOverlay}>
                <TouchableOpacity
                  style={styles.playerBigPlay}
                  onPress={() => toast.info(`Streaming 1080p demo: ${previewLesson?.title}`)}
                >
                  <Ionicons name="play" size={32} color="#000000" style={{ marginLeft: 3 }} />
                </TouchableOpacity>
                <Text style={styles.playerNotice}>HD Lecture Stream • 1080p</Text>
              </View>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.modalMetaRow}>
                <Badge label="High Yield Topic" variant="primary" />
                <Text style={styles.modalDuration}>Duration: {previewLesson?.duration}</Text>
              </View>
              <Text style={styles.modalDesc}>
                This video lecture includes complete derivations, previous year questions (PYQs), and key exam shortcuts explained step-by-step by {course.instructor.name}.
              </Text>
            </View>

            <Button
              title="Close Preview"
              variant="secondary"
              onPress={() => setPreviewLesson(null)}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: SPACING.sm,
  },
  shareButton: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  scrollContent: {
    paddingBottom: SPACING.xxxl,
  },
  heroThumbnailContainer: {
    width: '100%',
    height: 220,
    position: 'relative',
    backgroundColor: '#000000',
  },
  heroThumbnail: {
    width: '100%',
    height: '100%',
    opacity: 0.85,
  },
  playButtonOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -28 }, { translateY: -28 }],
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  playIcon: {
    marginLeft: 3,
  },
  previewTag: {
    position: 'absolute',
    bottom: SPACING.md,
    left: SPACING.md,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    gap: 5,
  },
  previewTagText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  mainInfo: {
    padding: SPACING.lg,
    backgroundColor: COLORS.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  courseTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.text,
    lineHeight: 28,
    marginBottom: SPACING.xs,
  },
  shortDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: SPACING.md,
  },
  metricsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.text,
  },
  metricLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  metricDivider: {
    width: 1,
    height: 16,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.md,
  },
  instructorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  instructorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: SPACING.md,
  },
  instructorDetails: {
    flex: 1,
  },
  instructorLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  instructorName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },
  instructorQual: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  verifiedText: {
    fontSize: 11,
    color: COLORS.primaryLight,
    fontWeight: '700',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: RADIUS.sm,
  },
  tabButtonActive: {
    backgroundColor: COLORS.primaryMuted,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.primaryLight,
    fontWeight: '800',
  },
  tabContent: {
    paddingHorizontal: SPACING.lg,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  fullDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  featuresSection: {
    marginTop: SPACING.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  featureText: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '500',
  },
  syllabusHighlights: {
    marginTop: SPACING.md,
  },
  topicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  topicIndexBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  topicIndexText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primaryLight,
  },
  topicText: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '600',
    flex: 1,
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  lessonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  lessonNumberBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  freeLessonBadge: {
    backgroundColor: COLORS.cyanMuted,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lessonDuration: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  freeChip: {
    backgroundColor: COLORS.cyanMuted,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: RADIUS.xs,
    marginLeft: 6,
  },
  freeChipText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.cyan,
  },
  noLessonsText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    paddingVertical: SPACING.md,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomPriceContainer: {
    flex: 1,
  },
  bottomPriceLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  bottomPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  bottomOriginalPrice: {
    fontSize: 12,
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
  },
  bottomPrice: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.primaryLight,
  },
  bottomFreePrice: {
    color: COLORS.cyan,
  },
  enrollButton: {
    flex: 1,
    marginLeft: SPACING.lg,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalSubtitle: {
    fontSize: 11,
    color: COLORS.primaryLight,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerSimulator: {
    width: '100%',
    height: 180,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000000',
    marginBottom: SPACING.md,
  },
  playerBackground: {
    width: '100%',
    height: '100%',
    opacity: 0.6,
  },
  playerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerBigPlay: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  playerNotice: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  modalBody: {
    marginBottom: SPACING.lg,
  },
  modalMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  modalDuration: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  modalDesc: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 19,
  },
});
