import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';
import App from './App'; // Your existing app becomes the home screen

// Import auth context
import { useAuth } from './AuthContext';

// Create stacks
const AuthStack = createStackNavigator();
const MainStack = createStackNavigator();

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

// Main navigator for authenticated users
const MainNavigator = () => (
  <MainStack.Navigator>
    <MainStack.Screen 
      name="Home" 
      component={App}
      options={{
        headerShown: false, // Hide header as your App already has its own header
      }}
    />
    {/* Add more screens here as needed */}
  </MainStack.Navigator>
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
      {isSignedIn ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default Navigation;