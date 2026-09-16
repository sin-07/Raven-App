import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { Badge } from '../components';
import { User } from '../types';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface ProfileScreenProps {
  navigation: any;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { isLoggedIn, user, loginAsStudent, logout } = useAuth();
  const { toast } = useToast();
  const [enrollments, setEnrollments] = useState<any[]>([]);

  useEffect(() => {
    apiService.getStudentEnrollments().then(setEnrollments);
  }, []);

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{isLoggedIn ? 'Student LMS Hub' : 'Visitor Information Hub'}</Text>
        <TouchableOpacity
          onPress={() => {
            toast.info('Raven Tutorials', 'Patna Classroom LMS • Version 1.0.0');
          }}
          style={styles.settingsButton}
        >
          <Ionicons name="information-circle-outline" size={20} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {!isLoggedIn ? (
          /* ================= VISITOR PROFILE VIEW ================= */
          <View style={styles.visitorWrapper}>
            <View style={styles.visitorCard}>
              <View style={styles.visitorIconCircle}>
                <Ionicons name="person" size={28} color="#FFFFFF" />
              </View>
              <Text style={styles.visitorTitle}>Guest Visitor Mode</Text>
              <Text style={styles.visitorSub}>
                Explore batches, faculty profiles, and fee structures for Raven Tutorials, Patna.
              </Text>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => loginAsStudent()}
                style={styles.primaryLoginBtn}
              >
                <Ionicons name="log-in-outline" size={16} color="#000000" />
                <Text style={styles.primaryLoginBtnText}>Sign In as Enrolled Student</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  toast.info('New Admission', 'Opening admission registration form.');
                  navigation.navigate('Admission');
                }}
                style={styles.secondaryActionBtn}
              >
                <Text style={styles.secondaryActionBtnText}>Apply for 2026 Batch Admission</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* ================= LOGGED-IN STUDENT ID CARD ================= */
          <>
            <View style={styles.idCardWrapper}>
              <View style={styles.idCard}>
                {/* Top Row: Institute Brand & Batch */}
                <View style={styles.idCardTop}>
                  <View style={styles.idBrandRow}>
                    <View style={styles.idLogoBox}>
                      <Ionicons name="school" size={18} color="#FFFFFF" />
                    </View>
                    <View>
                      <Text style={styles.idBrandName}>RAVEN TUTORIALS</Text>
                      <Text style={styles.idCampusName}>Patna Campus, Bihar</Text>
                    </View>
                  </View>
                  <Badge label="ACTIVE" variant="primary" size="sm" />
                </View>

                {/* Middle Row: Student Photo & Details */}
                <View style={styles.idCardMiddle}>
                  <Image source={{ uri: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=140&h=140&fit=crop' }} style={styles.idAvatar} />
                  <View style={styles.idDetails}>
                    <Text style={styles.idStudentName}>{user?.name || 'Rahul Sharma'}</Text>
                    <Text style={styles.idRegistration}>ID: {user?.registrationId || 'RAV-2026-0842'}</Text>
                    <Text style={styles.idStandard}>{user?.standard || '12th Standard (IIT-JEE Super-30)'}</Text>
                    <Text style={styles.idPhone}>📞 {user?.phone || '+91 98765 43210'}</Text>
                  </View>
                </View>

                {/* Bottom Row: Barcode Mockup */}
                <View style={styles.idCardBottom}>
                  <View style={styles.barcodeMock}>
                    <View style={styles.barcodeLine} />
                    <View style={[styles.barcodeLine, { width: 3 }]} />
                    <View style={[styles.barcodeLine, { width: 1 }]} />
                    <View style={[styles.barcodeLine, { width: 4 }]} />
                    <View style={[styles.barcodeLine, { width: 2 }]} />
                    <View style={[styles.barcodeLine, { width: 1 }]} />
                    <View style={[styles.barcodeLine, { width: 3 }]} />
                    <View style={[styles.barcodeLine, { width: 2 }]} />
                  </View>
                  <Text style={styles.idValidity}>Valid: 2026-2027 Session</Text>
                </View>
              </View>
            </View>

            {/* Academic Performance Snapshot */}
            <View style={styles.metricsRow}>
              <View style={styles.metricCard}>
                <Ionicons name="calendar-outline" size={20} color="#FFFFFF" />
                <Text style={styles.metricVal}>94.2%</Text>
                <Text style={styles.metricName}>Attendance</Text>
              </View>

              <View style={styles.metricCard}>
                <Ionicons name="document-text-outline" size={20} color="#FFFFFF" />
                <Text style={styles.metricVal}>14</Text>
                <Text style={styles.metricName}>Tests Taken</Text>
              </View>

              <View style={styles.metricCard}>
                <Ionicons name="ribbon-outline" size={20} color="#FFFFFF" />
                <Text style={styles.metricVal}>98.6%</Text>
                <Text style={styles.metricName}>Percentile</Text>
              </View>
            </View>

            {/* Enrolled Courses */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Enrolled Classroom Courses</Text>
              {enrollments.map((item, idx) => (
                <View key={idx} style={styles.courseProgressItem}>
                  <View style={styles.courseProgressHeader}>
                    <Text style={styles.courseProgressTitle}>
                      {item?.courseTitle || item?.courseName || 'Classroom Program'}
                    </Text>
                    <Badge
                      label={(item?.status || 'Active').toUpperCase()}
                      variant="primary"
                      size="sm"
                    />
                  </View>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${item?.progress || 0}%` }]} />
                  </View>
                  <Text style={styles.courseProgressMeta}>
                    Progress: {item?.progress || 0}% • ⏰ {item?.batchTime || item?.lastAccessed || 'Patna Classroom Batch'}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Institute Quick Links */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Institute Portals</Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Notices')}
            style={styles.portalRow}
          >
            <View style={[styles.portalIconBox, { backgroundColor: 'rgba(255, 255, 255, 0.08)' }]}>
              <Ionicons name="megaphone-outline" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.portalInfo}>
              <Text style={styles.portalTitle}>Notices & Exam Circulars</Text>
              <Text style={styles.portalSubtitle}>Admit cards, mock test dates, schedules</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              toast.info('Admissions', 'Opening 2026-27 admission registration form.');
              navigation.navigate('Admission');
            }}
            style={styles.portalRow}
          >
            <View style={[styles.portalIconBox, { backgroundColor: 'rgba(255, 255, 255, 0.08)' }]}>
              <Ionicons name="school-outline" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.portalInfo}>
              <Text style={styles.portalTitle}>Admission Registration Form</Text>
              <Text style={styles.portalSubtitle}>Apply for offline classroom or test series</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              toast.info('Faculty Desk', 'Opening academic query resolution form.');
              navigation.navigate('Feedback');
            }}
            style={styles.portalRow}
          >
            <View style={[styles.portalIconBox, { backgroundColor: 'rgba(255, 255, 255, 0.08)' }]}>
              <Ionicons name="chatbubbles-outline" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.portalInfo}>
              <Text style={styles.portalTitle}>Ask Faculty Doubt / Feedback</Text>
              <Text style={styles.portalSubtitle}>One-on-one academic query resolution</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Institute Contact Info (Patna Only Unified Campus) */}
        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>Raven Tutorials Patna Campus</Text>
          <Text style={styles.contactText}>
            📍 Kankarbagh Main Road, Opposite Pillar 42, Patna, Bihar - 800020
          </Text>
          <Text style={styles.contactText}>📞 Helpline: +91 91234 56789 (08:30 AM - 07:30 PM)</Text>
          <Text style={styles.contactText}>✉️ Support: admissions@raventutorials.com</Text>
        </View>

        {/* Logout / Switch to Visitor Mode */}
        {isLoggedIn && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => logout()}
            style={styles.logoutButton}
          >
            <Ionicons name="log-out-outline" size={18} color="#FFFFFF" />
            <Text style={styles.logoutText}>Sign Out of Student LMS Hub</Text>
          </TouchableOpacity>
        )}

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
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.text,
  },
  settingsButton: {
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
    padding: SPACING.lg,
    paddingBottom: SPACING.xxxl,
  },
  idCardWrapper: {
    marginBottom: SPACING.lg,
  },
  idCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  idCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    paddingBottom: SPACING.sm,
  },
  idBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  idLogoBox: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.xs,
    backgroundColor: COLORS.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  idBrandName: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  idCampusName: {
    fontSize: 10,
    color: COLORS.primaryLight,
  },
  idCardMiddle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  idAvatar: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginRight: SPACING.lg,
  },
  idDetails: {
    flex: 1,
  },
  idStudentName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  idRegistration: {
    fontSize: 12,
    color: COLORS.amber,
    fontWeight: '700',
    marginBottom: 2,
  },
  idStandard: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  idPhone: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  idCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  barcodeMock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    height: 14,
  },
  barcodeLine: {
    width: 2,
    height: '100%',
    backgroundColor: COLORS.textMuted,
  },
  idValidity: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  metricCard: {
    width: '31%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  metricVal: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.text,
    marginTop: 4,
    marginBottom: 2,
  },
  metricName: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
  },
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  sectionActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryLight,
  },
  courseProgressItem: {
    backgroundColor: COLORS.surfaceLight,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  courseProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  courseProgressTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
    marginRight: SPACING.sm,
  },
  courseProgressPercent: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primaryLight,
  },
  progressTrack: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.surface,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  courseProgressMeta: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  portalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  portalIconBox: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  portalInfo: {
    flex: 1,
  },
  portalTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  portalSubtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  contactCard: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  contactTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 6,
  },
  contactText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 4,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: '#27272A',
    backgroundColor: '#18181B',
    gap: 6,
  },
  logoutText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Visitor View Styles
  visitorWrapper: {
    marginBottom: SPACING.xl,
  },
  visitorCard: {
    backgroundColor: '#121214',
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
  },
  visitorIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  visitorTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  visitorSub: {
    fontSize: 12,
    color: '#A1A1AA',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: SPACING.lg,
  },
  primaryLoginBtn: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    gap: 6,
    marginBottom: SPACING.sm,
  },
  primaryLoginBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#000000',
  },
  secondaryActionBtn: {
    width: '100%',
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
  },
  secondaryActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
