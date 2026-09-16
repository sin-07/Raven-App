import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'amber' | 'blue' | 'purple' | 'rose' | 'secondary';
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'primary', size = 'sm', style }) => {
  const getColors = () => {
    switch (variant) {
      case 'amber':
        return { bg: 'rgba(255, 255, 255, 0.08)', text: '#E4E4E7', border: 'rgba(255, 255, 255, 0.18)' };
      case 'blue':
        return { bg: 'rgba(255, 255, 255, 0.08)', text: '#D4D4D8', border: 'rgba(255, 255, 255, 0.18)' };
      case 'purple':
        return { bg: 'rgba(255, 255, 255, 0.08)', text: '#D4D4D8', border: 'rgba(255, 255, 255, 0.18)' };
      case 'rose':
        return { bg: 'rgba(255, 255, 255, 0.14)', text: '#FFFFFF', border: 'rgba(255, 255, 255, 0.28)' };
      case 'secondary':
        return { bg: '#18181B', text: '#A1A1AA', border: '#27272A' };
      case 'primary':
      default:
        return { bg: 'rgba(255, 255, 255, 0.12)', text: '#FFFFFF', border: 'rgba(255, 255, 255, 0.25)' };
    }
  };

  const colors = getColors();

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: colors.bg, borderColor: colors.border },
        size === 'md' && styles.badgeMd,
        style,
      ]}
    >
      <Text style={[styles.text, { color: colors.text }, size === 'md' && styles.textMd]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeMd: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 5,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  textMd: {
    fontSize: 12,
  },
});
