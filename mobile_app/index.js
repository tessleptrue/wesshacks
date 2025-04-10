import { registerRootComponent } from 'expo';
import React from 'react';
import Navigation from './Navigation';
import { AuthProvider } from './AuthContext';

// Wrap the entire app with AuthProvider
const Root = () => {
  return (
    <AuthProvider>
      <Navigation />
    </AuthProvider>
  );
};

// Register the Root component instead of App
registerRootComponent(Root);