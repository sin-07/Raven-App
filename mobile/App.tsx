import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { StyleSheet, View } from 'react-native';
import { RootNavigator } from './src/navigation/RootNavigator';
import { COLORS } from './src/constants/theme';
import { ToastProvider } from './src/context/ToastContext';
import { AuthProvider } from './src/context/AuthContext';

const customDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: COLORS.primary,
    background: COLORS.background,
    card: COLORS.surface,
    text: COLORS.text,
    border: COLORS.border,
    notification: COLORS.rose,
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <ToastProvider>
        <AuthProvider>
          <View style={styles.container}>
            <StatusBar style="light" />
            <SafeAreaView style={styles.safeArea} edges={['top']}>
              <NavigationContainer theme={customDarkTheme}>
                <RootNavigator />
              </NavigationContainer>
            </SafeAreaView>
          </View>
        </AuthProvider>
      </ToastProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
