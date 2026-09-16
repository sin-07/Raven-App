import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { CourseCard } from '../components';
import { Course } from '../types';
import { apiService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

interface CoursesScreenProps {
  navigation: any;
}

export const CoursesScreen: React.FC<CoursesScreenProps> = ({ navigation }) => {
  const { isLoggedIn } = useAuth();
  const toast = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');

  const categories = ['All', 'Science', 'Mathematics', 'Technology', 'Language'];

  useEffect(() => {
    apiService.getCourses().then(setCourses);
  }, []);

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' || course.category.toLowerCase() === selectedCategory.toLowerCase();

    const matchesLevel =
      selectedLevel === 'All' || course.level.toLowerCase() === selectedLevel.toLowerCase();

    return matchesSearch && matchesCategory && matchesLevel;
  });

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Course Catalog</Text>
        <Text style={styles.headerSubtitle}>
          {isLoggedIn
            ? 'Access all registered batch subjects, DPPs, and modules'
            : 'Explore Patna campus classroom programs & preparation curricula'}
        </Text>

        {/* Visitor Banner if not logged in */}
        {!isLoggedIn && (
          <View style={styles.visitorProgramBanner}>
            <View style={styles.visitorBannerIconBox}>
              <Ionicons name="sparkles" size={18} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.visitorBannerTitle}>Patna Campus Classroom Admissions Open</Text>
              <Text style={styles.visitorBannerSub}>
                Up to 90% scholarship available through RSAT. Tap any program to review syllabus.
              </Text>
            </View>
          </View>
        )}

        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={COLORS.textMuted} style={styles.searchIcon} />
          <TextInput
            placeholder="Search subjects, topics, or faculty..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
            }}
            style={styles.searchInput}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                toast.info('Search query cleared');
              }}
            >
              <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Categories Filter */}
      <View style={styles.filtersWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
        >
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                activeOpacity={0.8}
                onPress={() => {
                  setSelectedCategory(cat);
                  toast.info(`Subject filter: ${cat}`);
                }}
                style={[styles.chip, isSelected && styles.chipActive]}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{cat}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Results Header */}
      <View style={styles.resultsInfo}>
        <Text style={styles.resultsCount}>
          Showing <Text style={styles.highlight}>{filteredCourses.length}</Text> Courses
        </Text>
      </View>

      {/* Courses List */}
      <FlatList
        data={filteredCourses}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <CourseCard
            course={item}
            onPress={() => {
              toast.info(`Opening ${item.title}`);
              navigation.navigate('CourseDetail', { id: item.id });
            }}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="book-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No courses found</Text>
            <Text style={styles.emptySubtitle}>Try adjusting your search keywords or filter pills.</Text>
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedLevel('All');
                toast.info('All filters reset');
              }}
              style={styles.resetButton}
            >
              <Text style={styles.resetButtonText}>Reset Filters</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
    marginBottom: SPACING.md,
  },
  visitorProgramBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111113',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  visitorBannerIconBox: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  visitorBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  visitorBannerSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 15,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    height: 44,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
  },
  filtersWrapper: {
    paddingVertical: SPACING.sm + 2,
    backgroundColor: COLORS.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  chipsContainer: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  chipTextActive: {
    color: '#000000',
    fontWeight: '800',
  },
  resultsInfo: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm + 2,
  },
  resultsCount: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  highlight: {
    color: COLORS.primaryLight,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: SPACING.md,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  resetButton: {
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  resetButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primaryLight,
  },
});
