import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TabNavigator } from './TabNavigator';
import {
  CourseDetailScreen,
  TestRunnerScreen,
  NoticesScreen,
  AdmissionScreen,
  FeedbackScreen,
} from '../screens';

const Stack = createNativeStackNavigator();

export const RootNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
      <Stack.Screen
        name="TestRunner"
        component={TestRunnerScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name="Notices"
        component={NoticesScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="Admission"
        component={AdmissionScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="Feedback"
        component={FeedbackScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
    </Stack.Navigator>
  );
};
