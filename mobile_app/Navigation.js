import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Import screens
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';
import App from './App'; // The existing app (renamed to HomeScreen in the tabs)
import HouseDetailScreen from './HouseDetailScreen';
import FilterScreen from './FilterScreen';
import ProfileScreen from './ProfileScreen';
import ForumScreen from './ForumScreen';

// Import auth context
import { useAuth } from './AuthContext';

// Create stacks and tabs
const AuthStack = createStackNavigator();
const HomeStack = createStackNavigator();
const ProfileStack = createStackNavigator();
const MainTab = createBottomTabNavigator();

// Auth navigator for unauthenticated users
const AuthNavigator = () => (
  <AuthStack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
  </AuthStack.Navigator>
);

// Home stack navigator (for houses list and details)
const HomeStackNavigator = () => (
  <HomeStack.Navigator>
    <HomeStack.Screen 
      name="Home" 
      component={App}
      options={{
        headerShown: false,
      }}
    />
    <HomeStack.Screen 
      name="HouseDetail" 
      component={HouseDetailScreen}
      options={{
        headerShown: true,
      }}
    />
    <HomeStack.Screen 
      name="Filter" 
      component={FilterScreen}
      options={{
        headerShown: true,
        title: "Filter Houses",
        headerBackTitle: "Back"
      }}
    />
  </HomeStack.Navigator>
);

// Profile stack navigator
const ProfileStackNavigator = () => (
  <ProfileStack.Navigator>
    <ProfileStack.Screen 
      name="ProfileScreen" 
      component={ProfileScreen}
      options={{
        headerShown: false,
      }}
    />
    <ProfileStack.Screen 
      name="HouseDetail" 
      component={HouseDetailScreen}
      options={{
        headerShown: true,
      }}
    />
  </ProfileStack.Navigator>
);

// Main tab navigator that contains stacks for Home and Profile
const MainTabNavigator = () => (
  <MainTab.Navigator
    screenOptions={{
      tabBarActiveTintColor: '#0066cc',
      tabBarInactiveTintColor: '#999',
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '500',
      },
      tabBarStyle: {
        paddingBottom: 5,
        height: 60,
      },
    }}
  >
    <MainTab.Screen 
      name="Houses" 
      component={HomeStackNavigator} 
      options={{
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="home" color={color} size={size} />
        ),
        headerShown: false,
      }}
    />
    <MainTab.Screen 
      name="Forum" 
      component={ForumScreen} 
      options={{
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="forum" color={color} size={size} />
        ),
      }}
    />
    <MainTab.Screen 
      name="Profile" 
      component={ProfileStackNavigator} 
      options={{
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="account" color={color} size={size} />
        ),
        headerShown: false,
      }}
    />
  </MainTab.Navigator>
);

// Root navigator that switches between Auth and Main based on authentication status
const Navigation = () => {
  const { isLoading, isSignedIn } = useAuth();

  // Show a loading screen while checking authentication
  if (isLoading) {
    return null; // Or a loading component
  }

  return (
    <NavigationContainer>
      {isSignedIn ? <MainTabNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default Navigation;