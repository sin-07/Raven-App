import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface HeaderProps {
  onPressNotifications?: () => void;
  onPressProfile?: () => void;
  showBack?: boolean;
  onPressBack?: () => void;
  title?: string;
  isGuest?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onPressNotifications,
  onPressProfile,
  showBack = false,
  onPressBack,
  title,
}) => {
  const { isLoggedIn, user, loginAsStudent, logout } = useAuth();
  const { toast } = useToast();

  if (showBack) {
    return (
      <View style={styles.backHeader}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onPressBack}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title || ''}
        </Text>
        <View style={styles.placeholder} />
      </View>
    );
  }

  const handleNotifications = () => {
    if (onPressNotifications) {
      onPressNotifications();
    } else {
      toast.info(
        isLoggedIn ? 'All notices up to date' : 'Visitor Announcements',
        isLoggedIn
          ? 'No new unread notices for Class 12th.'
          : 'Admissions open for 2026-27 batch in Patna.'
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Brand & Greeting */}
      <View style={styles.brandRow}>
        <View style={styles.logoBadge}>
          <Ionicons name="school" size={20} color={COLORS.primary} />
        </View>
        <View style={styles.brandTextContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.brandName}>RAVEN</Text>
            <View style={styles.patnaBadge}>
              <Text style={styles.patnaText}>PATNA</Text>
            </View>
          </View>
          <Text style={styles.welcomeText}>
            {!isLoggedIn
              ? 'Premier Coaching • Patna'
              : `Hi, ${(user?.name || 'Student').split(' ')[0]} 👋`}
          </Text>
        </View>
      </View>

      {/* Action Icons */}
      <View style={styles.actions}>
        {!isLoggedIn ? (
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.loginHeaderBtn}
            onPress={() => loginAsStudent()}
          >
            <Ionicons name="log-in-outline" size={16} color="#000000" />
            <Text style={styles.loginHeaderBtnText}>Student Login</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.iconButton}
              onPress={handleNotifications}
            >
              <Ionicons name="notifications-outline" size={20} color={COLORS.text} />
              <View style={styles.notificationDot} />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.avatarTouchable}
              onPress={onPressProfile || logout}
            >
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.guestAvatar}>
                  <Ionicons name="person" size={18} color={COLORS.primary} />
                </View>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryMuted,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  brandTextContainer: {
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandName: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: 1.2,
  },
  patnaBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: RADIUS.xs,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  patnaText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  welcomeText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginTop: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  loginHeaderBtn: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: RADIUS.full,
    gap: 5,
  },
  loginHeaderBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: 0.2,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  avatarTouchable: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  guestAvatar: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: SPACING.sm,
  },
  placeholder: {
    width: 38,
  },
});
