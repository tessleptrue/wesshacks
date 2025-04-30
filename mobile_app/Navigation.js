import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from 'react-native-vector-icons';

// Import screens
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';
import App from './App'; // Home screen
import HouseDetailScreen from './HouseDetailScreen';
import FilterScreen from './FilterScreen';
import SavedHousesScreen from './SavedHousesScreen'; // New saved houses screen

// Import auth context
import { useAuth } from './AuthContext';

// Create navigators
const AuthStack = createStackNavigator();
const MainStack = createStackNavigator();
const Tab = createBottomTabNavigator();

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

// Home stack navigator
const HomeStackNavigator = () => (
  <MainStack.Navigator>
    <MainStack.Screen 
      name="HomeScreen" 
      component={App}
      options={{
        headerShown: false, // Hide header as your App already has its own header
      }}
    />
    <MainStack.Screen 
      name="HouseDetail" 
      component={HouseDetailScreen}
      options={{
        headerShown: true, 
      }}
    />
    <MainStack.Screen 
      name="Filter" 
      component={FilterScreen}
      options={{
        headerShown: true,
        title: "Filter Houses",
        headerBackTitle: "Back"
      }}
    />
  </MainStack.Navigator>
);

// Saved houses stack navigator
const SavedStackNavigator = () => (
  <MainStack.Navigator>
    <MainStack.Screen 
      name="SavedHousesScreen" 
      component={SavedHousesScreen}
      options={{
        headerShown: false,
      }}
    />
    <MainStack.Screen 
      name="HouseDetail" 
      component={HouseDetailScreen}
      options={{
        headerShown: true,
      }}
    />
  </MainStack.Navigator>
);

// Main tab navigator for authenticated users
const MainTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        if (route.name === 'Home') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'Saved') {
          iconName = focused ? 'bookmark' : 'bookmark-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#0066cc',
      tabBarInactiveTintColor: 'gray',
    })}
  >
    <Tab.Screen 
      name="Home" 
      component={HomeStackNavigator} 
      options={{
        headerShown: false,
        title: 'Houses'
      }}
    />
    <Tab.Screen 
      name="Saved" 
      component={SavedStackNavigator}
      options={{
        headerShown: false,
        title: 'Saved Houses'
      }}
    />
  </Tab.Navigator>
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