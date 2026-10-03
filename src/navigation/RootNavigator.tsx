import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import TrackDetailScreen from '../screens/TrackDetailScreen';
import RequestTrackScreen from '../screens/RequestTrackScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const theme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: '#111318', card: '#111318', border: '#2a2e37' },
};

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeList" component={HomeScreen} />
      <Stack.Screen
        name="TrackDetail"
        component={TrackDetailScreen}
        options={{ headerShown: true, headerTitle: '', headerStyle: { backgroundColor: '#111318' }, headerTintColor: '#fff' }}
      />
    </Stack.Navigator>
  );
}

const icon = (emoji: string) => ({ color }: { color: string }) => (
  <Text style={{ fontSize: 20 }}>{emoji}</Text>
);

export default function RootNavigator() {
  return (
    <NavigationContainer theme={theme}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: { backgroundColor: '#111318', borderTopColor: '#2a2e37' },
          tabBarActiveTintColor: '#ff5a1f',
          tabBarInactiveTintColor: '#6d7280',
        }}
      >
        <Tab.Screen
          name="Piste"
          component={HomeStack}
          options={{ tabBarIcon: icon('🏁') }}
        />
        <Tab.Screen
          name="Aggiungi pista"
          component={RequestTrackScreen}
          options={{ tabBarIcon: icon('➕') }}
        />
        <Tab.Screen
          name="Profilo"
          component={ProfileScreen}
          options={{ tabBarIcon: icon('👤') }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
