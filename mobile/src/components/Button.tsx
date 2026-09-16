import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const isPrimary = variant === 'primary';

  const content = (
    <View style={styles.innerContainer}>
      {loading ? (
        <ActivityIndicator color={isPrimary ? '#000000' : COLORS.text} size="small" />
      ) : (
        <>
          {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
          <Text
            style={[
              styles.text,
              variant === 'primary' && styles.textPrimary,
              variant === 'secondary' && styles.textSecondary,
              variant === 'outline' && styles.textOutline,
              variant === 'danger' && styles.textDanger,
              variant === 'ghost' && styles.textGhost,
              size === 'sm' && styles.textSm,
              size === 'lg' && styles.textLg,
              textStyle,
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
        </>
      )}
    </View>
  );

  if (isPrimary && !disabled) {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        disabled={disabled || loading}
        style={[styles.touchable, style]}
      >
        <LinearGradient
          colors={['#FFFFFF', '#F4F4F5']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.base, styles.primaryBase, size === 'sm' && styles.sizeSm, size === 'lg' && styles.sizeLg]}
        >
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.base,
        variant === 'secondary' && styles.secondaryBase,
        variant === 'outline' && styles.outlineBase,
        variant === 'danger' && styles.dangerBase,
        variant === 'ghost' && styles.ghostBase,
        size === 'sm' && styles.sizeSm,
        size === 'lg' && styles.sizeLg,
        disabled && styles.disabled,
        style,
      ]}
    >
      {content}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  base: {
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBase: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  secondaryBase: {
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  outlineBase: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  dangerBase: {
    backgroundColor: COLORS.roseMuted,
    borderWidth: 1,
    borderColor: COLORS.rose,
  },
  ghostBase: {
    backgroundColor: 'transparent',
  },
  sizeSm: {
    paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.md,
  },
  sizeLg: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xxl,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '700',
    fontSize: 15,
  },
  textPrimary: {
    color: '#000000',
    fontWeight: '800',
  },
  textSecondary: {
    color: COLORS.text,
  },
  textOutline: {
    color: COLORS.primaryLight,
  },
  textDanger: {
    color: COLORS.rose,
  },
  textGhost: {
    color: COLORS.textSecondary,
  },
  textSm: {
    fontSize: 13,
  },
  textLg: {
    fontSize: 17,
  },
  iconLeft: {
    marginRight: SPACING.sm,
  },
  iconRight: {
    marginLeft: SPACING.sm,
  },
});
