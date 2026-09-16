import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { TestCard } from '../components';
import { Test } from '../types';
import { apiService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

interface TestsScreenProps {
  navigation: any;
}

export const TestsScreen: React.FC<TestsScreenProps> = ({ navigation }) => {
  const { isLoggedIn } = useAuth();
  const toast = useToast();
  const [tests, setTests] = useState<Test[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('All');

  const subjects = ['All', 'Physics', 'Mathematics', 'Chemistry'];

  useEffect(() => {
    apiService.getTests().then(setTests);
  }, []);

  const filteredTests =
    selectedSubject === 'All'
      ? tests
      : tests.filter((t) => t.subject.toLowerCase() === selectedSubject.toLowerCase());

  return (
    <View style={styles.container}>
      {/* Header Banner */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Test Series Center</Text>
        <Text style={styles.headerSubtitle}>
          {isLoggedIn
            ? 'Enrolled batch test simulations with instant percentile analytics'
            : 'RSAT simulation & demo mocks • Raven Tutorials Patna'}
        </Text>

        {/* Tip / Visitor banner */}
        <View style={styles.tipCard}>
          <View style={styles.tipIconBox}>
            <Ionicons
              name={isLoggedIn ? 'timer-outline' : 'ribbon-outline'}
              size={22}
              color="#FFFFFF"
            />
          </View>
          <View style={styles.tipTextContainer}>
            <Text style={styles.tipTitle}>
              {isLoggedIn ? 'Timed Speed & Accuracy Simulator' : 'RSAT Scholarship & Demo Mock Tests'}
            </Text>
            <Text style={styles.tipDesc}>
              {isLoggedIn
                ? 'Tests auto-submit on timer expiry. Answer review and detailed faculty solutions unlock immediately.'
                : 'Experience the real CBT examination interface used in our Patna classroom program. Open for visitor practice.'}
            </Text>
          </View>
        </View>
      </View>

      {/* Subject Filter Chips */}
      <View style={styles.filtersWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
        >
          {subjects.map((subj) => {
            const isSelected = selectedSubject === subj;
            return (
              <TouchableOpacity
                key={subj}
                activeOpacity={0.8}
                onPress={() => {
                  setSelectedSubject(subj);
                  toast.info(`Filtered by ${subj}`);
                }}
                style={[styles.chip, isSelected && styles.chipActive]}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{subj}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Test Series List */}
      <FlatList
        data={filteredTests}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TestCard
            test={item}
            onPress={() => {
              toast.info(`Starting mock simulation: ${item.title}`);
              navigation.navigate('TestRunner', { id: item.id });
            }}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No tests found</Text>
            <Text style={styles.emptySubtitle}>Try selecting a different subject filter.</Text>
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
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: '#111113',
    gap: SPACING.md,
  },
  tipIconBox: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.md,
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipTextContainer: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  tipDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 15,
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
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xxxl,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
});
