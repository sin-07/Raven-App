import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { NoticeCard, Badge, Button } from '../components';
import { Notice } from '../types';
import { apiService } from '../services/api';
import { useToast } from '../context/ToastContext';

interface NoticesScreenProps {
  navigation: any;
}

export const NoticesScreen: React.FC<NoticesScreenProps> = ({ navigation }) => {
  const toast = useToast();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [activeNotice, setActiveNotice] = useState<Notice | null>(null);

  const filters = ['All', 'Important', 'Exam', 'Academic'];

  useEffect(() => {
    apiService.getNotices().then(setNotices);
  }, []);

  const filteredNotices = notices.filter((n) => {
    if (selectedFilter === 'All') return true;
    if (selectedFilter === 'Important') return n.isImportant;
    return n.category.toLowerCase() === selectedFilter.toLowerCase();
  });

  return (
    <View style={styles.container}>
      {/* Top Header */}
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
        <Text style={styles.headerTitle}>Notice Board & Circulars</Text>
        <View style={{ width: 38 }} />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filtersWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
        >
          {filters.map((f) => {
            const isSelected = selectedFilter === f;
            return (
              <TouchableOpacity
                key={f}
                activeOpacity={0.8}
                onPress={() => {
                  setSelectedFilter(f);
                  toast.info(`Notice filter: ${f}`);
                }}
                style={[styles.chip, isSelected && styles.chipActive]}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{f}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Notices List */}
      <FlatList
        data={filteredNotices}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <NoticeCard
            notice={item}
            onPress={() => {
              setActiveNotice(item);
              toast.info(`Viewing circular: ${item.title}`);
            }}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="megaphone-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No notices found</Text>
            <Text style={styles.emptySubtitle}>Check back later for circulars and exam alerts.</Text>
          </View>
        }
      />

      {/* Notice Detail Modal */}
      <Modal
        visible={activeNotice !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setActiveNotice(null);
          toast.info('Circular closed');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalBadgeRow}>
                <Badge label={activeNotice?.category || 'General'} variant="primary" />
                {activeNotice?.isImportant && <Badge label="IMPORTANT" variant="rose" />}
              </View>
              <TouchableOpacity
                onPress={() => {
                  setActiveNotice(null);
                  toast.info('Circular closed');
                }}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={20} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalNoticeTitle}>{activeNotice?.title}</Text>
            <Text style={styles.modalNoticeDate}>Published: {activeNotice?.date}</Text>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalNoticeMessage}>{activeNotice?.message}</Text>

              <View style={styles.signatureBox}>
                <Text style={styles.sigIssuedBy}>Issued by:</Text>
                <Text style={styles.sigName}>{activeNotice?.postedBy}</Text>
                <Text style={styles.sigInstitute}>Raven Tutorials Academic Administration, Patna</Text>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <Button
                title="Download Official Notice PDF"
                variant="outline"
                icon={<Ionicons name="download-outline" size={16} color={COLORS.primaryLight} />}
                onPress={() => toast.success('Official circular PDF downloaded to device!')}
                style={{ marginBottom: SPACING.sm }}
              />
              <Button
                title="Close"
                variant="secondary"
                onPress={() => {
                  setActiveNotice(null);
                  toast.info('Circular closed');
                }}
              />
            </View>
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
    padding: SPACING.lg,
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
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalBadgeRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalNoticeTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    lineHeight: 24,
    marginBottom: 4,
  },
  modalNoticeDate: {
    fontSize: 12,
    color: COLORS.amber,
    fontWeight: '600',
    marginBottom: SPACING.md,
  },
  modalScroll: {
    maxHeight: 250,
    marginBottom: SPACING.lg,
  },
  modalNoticeMessage: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  signatureBox: {
    backgroundColor: COLORS.surfaceLight,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  sigIssuedBy: {
    fontSize: 10,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  sigName: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 2,
  },
  sigInstitute: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  modalActions: {
    paddingTop: SPACING.sm,
  },
});
