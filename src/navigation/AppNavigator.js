// AppNavigator.js
// Handles app navigation and Firebase Auth state listener
// Stack: Auth (Login, Register) | App (Home, Calculate, History, AI Predict, Compare, Profile, Result)
// Load IQ | UNAM I3691CP | Semester 1, 2026

import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { onAuthStateChanged } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../services/firebaseConfig';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import CalculateScreen from '../screens/CalculateScreen';
import ResultScreen from '../screens/ResultScreen';
import HistoryScreen from '../screens/HistoryScreen';
import PredictScreen from '../screens/PredictScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CompareScreen from '../screens/CompareScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Calculate') iconName = focused ? 'calculator' : 'calculator-outline';
          else if (route.name === 'Compare') iconName = focused ? 'git-compare' : 'git-compare-outline';
          else if (route.name === 'AI Predict') iconName = focused ? 'hardware-chip' : 'hardware-chip-outline';
          else if (route.name === 'History') iconName = focused ? 'time' : 'time-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarStyle: { backgroundColor: '#1E1E1E', borderTopColor: '#333' },
        tabBarActiveTintColor: '#FF9800',
        tabBarInactiveTintColor: '#666',
        headerStyle: { backgroundColor: '#1E1E1E' },
        headerTintColor: '#FF9800',
        headerTitleStyle: { fontWeight: 'bold' },
        tabBarLabelStyle: { fontSize: 10 },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Calculate" component={CalculateScreen} />
      <Tab.Screen name="Compare" component={CompareScreen} />
      <Tab.Screen name="AI Predict" component={PredictScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{
      headerStyle: { backgroundColor: '#1E1E1E' },
      headerTintColor: '#FF9800',
    }}>
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Create Account' }} />
    </Stack.Navigator>
  );
}

function AppStack() {
  return (
    <Stack.Navigator screenOptions={{
      headerStyle: { backgroundColor: '#1E1E1E' },
      headerTintColor: '#FF9800',
    }}>
      <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen name="Result" component={ResultScreen} options={{ title: 'Stress Result' }} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) return null;

  return (
    <NavigationContainer>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}