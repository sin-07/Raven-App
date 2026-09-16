import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { Badge, Button } from '../components';
import { LiveSession, VideoLecture } from '../types';
import { apiService } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

interface LiveScreenProps {
  navigation: any;
}

export const LiveScreen: React.FC<LiveScreenProps> = ({ navigation }) => {
  const { isLoggedIn } = useAuth();
  const toast = useToast();
  const [activeSegment, setActiveSegment] = useState<'live' | 'videos'>('live');
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);
  const [videoLectures, setVideoLectures] = useState<VideoLecture[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [activeVideo, setActiveVideo] = useState<VideoLecture | null>(null);

  const subjects = ['All', 'Physics', 'Mathematics', 'Chemistry', 'Biology'];

  useEffect(() => {
    apiService.getLiveSessions().then(setLiveSessions);
    apiService.getVideoLectures().then(setVideoLectures);
  }, []);

  const filteredVideos =
    selectedSubject === 'All'
      ? videoLectures
      : videoLectures.filter((v) => v.subject.toLowerCase() === selectedSubject.toLowerCase());

  return (
    <View style={styles.container}>
      {/* Segment Switcher Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Live & Lectures</Text>
        <Text style={styles.headerSubtitle}>
          {isLoggedIn
            ? 'Real-time interactive classrooms and recorded masterclasses'
            : 'Interactive lecture stream & demo masterclasses • Patna Campus'}
        </Text>

        <View style={styles.segmentedControl}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              setActiveSegment('live');
              toast.info('Viewing Live Broadcasts');
            }}
            style={[styles.segmentButton, activeSegment === 'live' && styles.segmentButtonActive]}
          >
            <Ionicons
              name="videocam"
              size={16}
              color={activeSegment === 'live' ? '#FFFFFF' : COLORS.textSecondary}
            />
            <Text
              style={[
                styles.segmentButtonText,
                activeSegment === 'live' && styles.segmentButtonTextActive,
              ]}
            >
              Live Sessions ({liveSessions.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              setActiveSegment('videos');
              toast.info('Viewing Recorded Masterclasses');
            }}
            style={[styles.segmentButton, activeSegment === 'videos' && styles.segmentButtonActive]}
          >
            <Ionicons
              name="play-circle"
              size={16}
              color={activeSegment === 'videos' ? '#FFFFFF' : COLORS.textSecondary}
            />
            <Text
              style={[
                styles.segmentButtonText,
                activeSegment === 'videos' && styles.segmentButtonTextActive,
              ]}
            >
              Video Library ({videoLectures.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {activeSegment === 'live' ? (
          // ================= LIVE SESSIONS TAB =================
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Interactive Classroom Schedule</Text>
            <Text style={styles.sectionSubtitle}>
              Classes run on Raven Live Stream with integrated doubt chat
            </Text>

            {liveSessions.map((session) => {
              const isLive = session.status === 'live';

              return (
                <View
                  key={session.id}
                  style={[styles.sessionCard, isLive && styles.sessionCardLive]}
                >
                  <View style={styles.sessionCardHeader}>
                    <View style={styles.sessionBadges}>
                      {isLive ? (
                        <View style={styles.livePulseBadge}>
                          <View style={styles.pulseDot} />
                          <Text style={styles.livePulseText}>LIVE NOW</Text>
                        </View>
                      ) : (
                        <Badge label="UPCOMING" variant="blue" />
                      )}
                      <Badge label={session.subject} variant="primary" />
                    </View>
                    <Text style={styles.sessionTimeText}>
                      {session.scheduledDate}, {session.scheduledTime}
                    </Text>
                  </View>

                  <Text style={styles.sessionTitle}>{session.title}</Text>
                  <Text style={styles.sessionStandard}>{session.standard}</Text>

                  <View style={styles.sessionInstructorRow}>
                    <Image
                      source={{ uri: session.instructorAvatar }}
                      style={styles.sessionInstructorAvatar}
                    />
                    <View style={styles.sessionInstructorInfo}>
                      <Text style={styles.sessionInstructorName}>{session.instructor}</Text>
                      <Text style={styles.sessionDuration}>
                        Duration: {session.durationMinutes} minutes
                      </Text>
                    </View>

                    {isLive && session.participantsCount && (
                      <View style={styles.participantsBadge}>
                        <Ionicons name="people" size={13} color={COLORS.cyan} />
                        <Text style={styles.participantsText}>{session.participantsCount} online</Text>
                      </View>
                    )}
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => {
                      if (isLive) {
                        if (!isLoggedIn) {
                          toast.warning('Live interactive broadcast is exclusive to enrolled Patna students. Please login.');
                        } else {
                          toast.success(`Connecting to live stream: ${session.title}...`);
                        }
                      } else {
                        toast.success(`Class reminder scheduled for ${session.title}!`);
                      }
                    }}
                    style={[styles.sessionActionButton, isLive ? styles.joinLiveButton : styles.reminderButton]}
                  >
                    <Ionicons
                      name={isLive ? 'enter-outline' : 'notifications-outline'}
                      size={16}
                      color={isLive ? '#000000' : '#FFFFFF'}
                    />
                    <Text
                      style={[
                        styles.sessionActionText,
                        isLive ? styles.joinLiveText : styles.reminderText,
                      ]}
                    >
                      {isLive ? 'Join Live Class' : 'Set Class Reminder'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        ) : (
          // ================= VIDEO LIBRARY TAB =================
          <View style={styles.tabContent}>
            {/* Subject Filters */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.subjectChipsContainer}
            >
              {subjects.map((s) => {
                const isSelected = selectedSubject === s;
                return (
                  <TouchableOpacity
                    key={s}
                    activeOpacity={0.8}
                    onPress={() => {
                      setSelectedSubject(s);
                      toast.info(`Subject: ${s}`);
                    }}
                    style={[styles.subjectChip, isSelected && styles.subjectChipActive]}
                  >
                    <Text
                      style={[styles.subjectChipText, isSelected && styles.subjectChipTextActive]}
                    >
                      {s}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Text style={styles.resultsCountText}>
              Showing {filteredVideos.length} Recorded Masterclasses
            </Text>

            {filteredVideos.map((video) => (
              <TouchableOpacity
                key={video.id}
                activeOpacity={0.85}
                onPress={() => {
                  setActiveVideo(video);
                  toast.info(`Masterclass: ${video.title}`);
                }}
                style={styles.videoCard}
              >
                <View style={styles.videoThumbnailBox}>
                  <Image source={{ uri: video.thumbnail }} style={styles.videoThumbnail} />
                  <View style={styles.videoPlayOverlay}>
                    <Ionicons name="play" size={24} color="#FFFFFF" />
                  </View>
                  <View style={styles.durationBadge}>
                    <Text style={styles.durationText}>{video.duration}</Text>
                  </View>
                </View>

                <View style={styles.videoCardBody}>
                  <View style={styles.videoBadgesRow}>
                    <Badge label={video.subject} variant="primary" />
                    <Text style={styles.viewsText}>
                      <Ionicons name="eye-outline" size={12} color={COLORS.textMuted} />{' '}
                      {video.views.toLocaleString()} views
                    </Text>
                  </View>

                  <Text style={styles.videoTitle} numberOfLines={2}>
                    {video.title}
                  </Text>

                  <Text style={styles.videoDescription} numberOfLines={2}>
                    {video.description}
                  </Text>

                  <View style={styles.videoFooter}>
                    <Text style={styles.videoFaculty}>
                      Faculty: <Text style={styles.facultyHighlight}>{video.instructor}</Text>
                    </Text>
                    <View style={styles.watchNowRow}>
                      <Text style={styles.watchNowText}>Watch</Text>
                      <Ionicons name="chevron-forward" size={14} color={COLORS.primaryLight} />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Video Player Modal */}
      <Modal
        visible={activeVideo !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setActiveVideo(null);
          toast.info('Player closed');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Badge label={activeVideo?.subject || 'Lecture'} variant="primary" />
                <Text style={styles.modalVideoTitle} numberOfLines={1}>
                  {activeVideo?.title}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setActiveVideo(null);
                  toast.info('Player closed');
                }}
                style={styles.modalCloseIcon}
              >
                <Ionicons name="close" size={20} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            {/* Video Simulator */}
            <View style={styles.modalPlayer}>
              <Image source={{ uri: activeVideo?.thumbnail }} style={styles.modalPlayerImage} />
              <TouchableOpacity
                onPress={() => toast.info(`Streaming 1080p: ${activeVideo?.title}`)}
                style={styles.modalPlayButton}
              >
                <Ionicons name="play" size={32} color="#000000" style={{ marginLeft: 3 }} />
              </TouchableOpacity>
              <View style={styles.playerStreamQuality}>
                <Text style={styles.qualityText}>Full HD 1080p • 60fps</Text>
              </View>
            </View>

            <View style={styles.modalDetails}>
              <Text style={styles.modalDescTitle}>About This Lecture</Text>
              <Text style={styles.modalDescText}>{activeVideo?.description}</Text>
              <Text style={styles.modalFacultyText}>
                Taught by {activeVideo?.instructor} • Duration {activeVideo?.duration}
              </Text>
            </View>

            <Button
              title="Close Player"
              variant="secondary"
              onPress={() => {
                setActiveVideo(null);
                toast.info('Player closed');
              }}
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
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  segmentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: RADIUS.sm,
    gap: 6,
  },
  segmentButtonActive: {
    backgroundColor: COLORS.surfaceLight,
  },
  segmentButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  segmentButtonTextActive: {
    color: COLORS.text,
    fontWeight: '800',
  },
  scrollContent: {
    paddingBottom: SPACING.xxxl,
  },
  tabContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  sessionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  sessionCardLive: {
    borderColor: 'rgba(244, 63, 94, 0.4)',
    backgroundColor: '#16111C',
  },
  sessionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sessionBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  livePulseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.roseMuted,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.rose,
    gap: 4,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.rose,
  },
  livePulseText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.rose,
  },
  sessionTimeText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    lineHeight: 22,
    marginBottom: 4,
  },
  sessionStandard: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  sessionInstructorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
  },
  sessionInstructorAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: SPACING.md,
  },
  sessionInstructorInfo: {
    flex: 1,
  },
  sessionInstructorName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  sessionDuration: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  participantsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  participantsText: {
    fontSize: 11,
    color: COLORS.cyan,
    fontWeight: '600',
  },
  sessionActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md - 2,
    borderRadius: RADIUS.md,
    gap: 6,
  },
  joinLiveButton: {
    backgroundColor: COLORS.rose,
  },
  reminderButton: {
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sessionActionText: {
    fontSize: 14,
    fontWeight: '800',
  },
  joinLiveText: {
    color: '#0A0E1A',
  },
  reminderText: {
    color: COLORS.text,
  },

  // Videos Tab
  subjectChipsContainer: {
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  subjectChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  subjectChipActive: {
    backgroundColor: COLORS.primaryMuted,
    borderColor: COLORS.primary,
  },
  subjectChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  subjectChipTextActive: {
    color: COLORS.primaryLight,
    fontWeight: '700',
  },
  resultsCountText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },
  videoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
  },
  videoThumbnailBox: {
    width: '100%',
    height: 160,
    position: 'relative',
    backgroundColor: '#000000',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
    opacity: 0.8,
  },
  videoPlayOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -22 }, { translateY: -22 }],
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  durationBadge: {
    position: 'absolute',
    bottom: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.xs,
  },
  durationText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  videoCardBody: {
    padding: SPACING.md,
  },
  videoBadgesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  viewsText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  videoTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
    lineHeight: 21,
    marginBottom: 4,
  },
  videoDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
    marginBottom: SPACING.sm,
  },
  videoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  videoFaculty: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  facultyHighlight: {
    color: COLORS.text,
    fontWeight: '600',
  },
  watchNowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  watchNowText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryLight,
  },

  // Modal Player
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
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
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  modalVideoTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 4,
  },
  modalCloseIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalPlayer: {
    width: '100%',
    height: 190,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000000',
    marginBottom: SPACING.md,
  },
  modalPlayerImage: {
    width: '100%',
    height: '100%',
    opacity: 0.6,
  },
  modalPlayButton: {
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
  },
  playerStreamQuality: {
    position: 'absolute',
    bottom: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.xs,
  },
  qualityText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  modalDetails: {
    marginBottom: SPACING.lg,
  },
  modalDescTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  modalDescText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 6,
  },
  modalFacultyText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
});
