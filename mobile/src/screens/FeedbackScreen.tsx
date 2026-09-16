import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { Button } from '../components';
import { FeedbackFormData } from '../types';
import { apiService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

interface FeedbackScreenProps {
  navigation: any;
}

export const FeedbackScreen: React.FC<FeedbackScreenProps> = ({ navigation }) => {
  const { isLoggedIn } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState<FeedbackFormData>({
    category: isLoggedIn ? 'course_content' : 'general',
    subject: '',
    message: '',
    rating: 5,
  });
  const [loading, setLoading] = useState(false);

  const studentCategories: Array<{ id: FeedbackFormData['category']; label: string; icon: string }> = [
    { id: 'course_content', label: 'Course Content', icon: 'book-outline' },
    { id: 'teaching_method', label: 'Faculty Teaching', icon: 'person-outline' },
    { id: 'study_materials', label: 'DPPs & Materials', icon: 'document-text-outline' },
    { id: 'online_classes', label: 'Live Stream Doubt', icon: 'videocam-outline' },
    { id: 'test_system', label: 'Test System Query', icon: 'ribbon-outline' },
    { id: 'general', label: 'General Feedback', icon: 'chatbox-outline' },
  ];

  const visitorCategories: Array<{ id: FeedbackFormData['category']; label: string; icon: string }> = [
    { id: 'general', label: 'Admission Inquiry', icon: 'school-outline' },
    { id: 'course_content', label: 'Fee & RSAT Scholarship', icon: 'wallet-outline' },
    { id: 'teaching_method', label: 'Batch Timings (Patna)', icon: 'time-outline' },
    { id: 'study_materials', label: 'Study Material Inquiry', icon: 'book-outline' },
    { id: 'online_classes', label: 'Patna Campus Visit', icon: 'location-outline' },
    { id: 'test_system', label: 'Counselor Callback', icon: 'call-outline' },
  ];

  const categories = isLoggedIn ? studentCategories : visitorCategories;

  const handleSubmit = async () => {
    if (!formData.subject.trim()) {
      toast.error('Please specify a subject or topic for your query.');
      return;
    }

    if (!formData.message.trim()) {
      toast.error('Please provide details in the description field.');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.submitFeedback(formData);
      toast.success(
        isLoggedIn
          ? 'Academic query submitted! Subject faculty will respond within 24 hours.'
          : 'Inquiry received! Our Patna campus counselor will contact you shortly.'
      );
      setTimeout(() => {
        navigation.goBack();
      }, 1200);
    } catch {
      toast.error('Unable to submit inquiry. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            toast.info('Returned to previous screen');
            navigation.goBack();
          }}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isLoggedIn ? 'Ask Doubt / Academic Desk' : 'Admission Inquiry Desk • Patna'}
        </Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Info Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerIconBox}>
            <Ionicons
              name={isLoggedIn ? 'chatbubbles' : 'school'}
              size={22}
              color="#FFFFFF"
            />
          </View>
          <View style={styles.bannerText}>
            <Text style={styles.bannerTitle}>
              {isLoggedIn
                ? 'Direct Faculty Academic Desk'
                : 'Raven Tutorials Patna • Admissions Desk'}
            </Text>
            <Text style={styles.bannerDesc}>
              {isLoggedIn
                ? 'Submit conceptual doubts, assignment questions, or feedback directly to subject heads.'
                : 'Ask questions about classroom batches, RSAT scholarship up to 90%, syllabus, and Patna campus admissions.'}
            </Text>
          </View>
        </View>

        {/* Category Picker */}
        <Text style={styles.sectionLabel}>
          {isLoggedIn ? 'Select Query Category' : 'Select Inquiry Topic'}
        </Text>
        <View style={styles.categoriesGrid}>
          {categories.map((cat) => {
            const isSelected = formData.category === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                activeOpacity={0.8}
                onPress={() => {
                  setFormData({ ...formData, category: cat.id });
                  toast.info(`Selected: ${cat.label}`);
                }}
                style={[styles.categoryCard, isSelected && styles.categoryCardActive]}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={18}
                  color={isSelected ? '#000000' : COLORS.textSecondary}
                />
                <Text
                  style={[styles.categoryCardText, isSelected && styles.categoryCardTextActive]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Satisfaction Rating */}
        <Text style={styles.sectionLabel}>
          {isLoggedIn ? 'Rate Learning Experience' : 'Rate Your Exploration Experience'}
        </Text>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => {
                setFormData({ ...formData, rating: star });
                toast.info(`Rating set: ${star} of 5 stars`);
              }}
              style={styles.starTouchable}
            >
              <Ionicons
                name={formData.rating >= star ? 'star' : 'star-outline'}
                size={28}
                color={formData.rating >= star ? '#FFFFFF' : '#4B5563'}
              />
            </TouchableOpacity>
          ))}
          <Text style={styles.ratingLabelText}>
            {formData.rating === 5
              ? 'Excellent (5/5)'
              : formData.rating === 4
              ? 'Very Good (4/5)'
              : `${formData.rating} Stars`}
          </Text>
        </View>

        {/* Subject */}
        <Text style={styles.sectionLabel}>
          {isLoggedIn ? 'Query Subject / Topic *' : 'Inquiry Subject / Target Course *'}
        </Text>
        <TextInput
          style={styles.input}
          placeholder={
            isLoggedIn
              ? 'e.g. Physics - Rotational Dynamics doubt in DPP 4'
              : 'e.g. Admission for Class 11 IIT-JEE Batch starting April'
          }
          placeholderTextColor={COLORS.textMuted}
          value={formData.subject}
          onChangeText={(text) => setFormData({ ...formData, subject: text })}
        />

        {/* Message */}
        <Text style={styles.sectionLabel}>
          {isLoggedIn ? 'Detailed Description / Problem *' : 'Your Query or Contact Details *'}
        </Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder={
            isLoggedIn
              ? 'Type your question or academic feedback in detail here...'
              : 'Provide student name, contact number, or specific questions regarding Patna campus courses...'
          }
          placeholderTextColor={COLORS.textMuted}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          value={formData.message}
          onChangeText={(text) => setFormData({ ...formData, message: text })}
        />

        <Button
          title={isLoggedIn ? 'Submit Academic Query' : 'Submit Admission Inquiry'}
          variant="primary"
          loading={loading}
          onPress={handleSubmit}
          style={{ marginTop: SPACING.md }}
        />

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
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
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111113',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  bannerIconBox: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  bannerDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    marginTop: SPACING.md,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  categoryCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.sm,
  },
  categoryCardActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  categoryCardText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
    flex: 1,
  },
  categoryCardTextActive: {
    color: '#000000',
    fontWeight: '800',
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  starTouchable: {
    marginRight: 6,
  },
  ratingLabelText: {
    fontSize: 13,
    color: COLORS.amber,
    fontWeight: '700',
    marginLeft: SPACING.md,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    color: COLORS.text,
    fontSize: 14,
    marginBottom: SPACING.md,
  },
  textArea: {
    height: 120,
    paddingTop: 12,
  },
});
