import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';
import { HomeScreen } from '../screens/HomeScreen';
import { CoursesScreen } from '../screens/CoursesScreen';
import { TestsScreen } from '../screens/TestsScreen';
import { LiveScreen } from '../screens/LiveScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#52525B',
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'CoursesTab') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'TestsTab') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'LiveTab') {
            iconName = focused ? 'videocam' : 'videocam-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="CoursesTab"
        component={CoursesScreen}
        options={{ tabBarLabel: 'Courses' }}
      />
      <Tab.Screen
        name="TestsTab"
        component={TestsScreen}
        options={{ tabBarLabel: 'Tests' }}
      />
      <Tab.Screen
        name="LiveTab"
        component={LiveScreen}
        options={{ tabBarLabel: 'Live' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Hub' }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.tabBarBg,
    borderTopWidth: 1,
    borderTopColor: COLORS.tabBarBorder,
    height: Platform.OS === 'ios' ? 88 : 64,
    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
    paddingTop: 8,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
});
