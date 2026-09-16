import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

const { width } = Dimensions.get('window');

export type ToastType = 'success' | 'info' | 'warning' | 'error';

export interface ToastOptions {
  message: string;
  description?: string;
  type?: ToastType;
  duration?: number;
}

export interface ToastContextData {
  showToast: (options: ToastOptions) => void;
  success: (message: string, description?: string) => void;
  info: (message: string, description?: string) => void;
  warning: (message: string, description?: string) => void;
  error: (message: string, description?: string) => void;
  toast: {
    success: (message: string, description?: string) => void;
    info: (message: string, description?: string) => void;
    warning: (message: string, description?: string) => void;
    error: (message: string, description?: string) => void;
  };
}

const ToastContext = createContext<ToastContextData | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toastData, setToastData] = useState<ToastOptions | null>(null);
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<any>(null);

  const hideToast = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -120,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setToastData(null);
    });
  }, [opacity, translateY]);

  const showToast = useCallback(
    (options: ToastOptions) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      setToastData(options);
      const duration = options.duration || (options.type === 'error' ? 4000 : 2500);

      // Animate In
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 70,
          friction: 9,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      timerRef.current = setTimeout(() => {
        hideToast();
      }, duration);
    },
    [hideToast, opacity, translateY]
  );

  const success = useCallback((message: string, description?: string) => showToast({ message, description, type: 'success' }), [showToast]);
  const info = useCallback((message: string, description?: string) => showToast({ message, description, type: 'info' }), [showToast]);
  const warning = useCallback((message: string, description?: string) => showToast({ message, description, type: 'warning' }), [showToast]);
  const error = useCallback((message: string, description?: string) => showToast({ message, description, type: 'error' }), [showToast]);

  const toastObj = { success, info, warning, error };

  const getIcon = (type: ToastType = 'success') => {
    switch (type) {
      case 'error':
        return <Ionicons name="alert-circle" size={20} color="#FFFFFF" />;
      case 'warning':
        return <Ionicons name="warning" size={20} color="#FFFFFF" />;
      case 'info':
        return <Ionicons name="information-circle" size={20} color="#FFFFFF" />;
      case 'success':
      default:
        return <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />;
    }
  };

  return (
    <ToastContext.Provider
      value={{
        showToast,
        success,
        info,
        warning,
        error,
        toast: toastObj,
      }}
    >
      {children}
      {toastData && (
        <Animated.View
          style={[
            styles.toastContainer,
            {
              transform: [{ translateY }],
              opacity,
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={hideToast}
            style={styles.toastCard}
          >
            <View style={styles.iconContainer}>{getIcon(toastData.type)}</View>
            <View style={styles.textContainer}>
              <Text style={styles.messageText}>{toastData.message}</Text>
              {toastData.description && (
                <Text style={styles.descriptionText}>{toastData.description}</Text>
              )}
            </View>
            <TouchableOpacity onPress={hideToast} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={16} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </TouchableOpacity>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextData => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 35,
    left: SPACING.md,
    right: SPACING.md,
    zIndex: 9999,
    alignItems: 'center',
  },
  toastCard: {
    width: Math.min(width - 32, 420),
    backgroundColor: '#121214',
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 10,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  messageText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  descriptionText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
});
