import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert 
} from 'react-native';
import { useAuth } from './AuthContext';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    // Validate inputs
    if (!username || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('http://10.0.2.2/wesshacks/api/users.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'login',
          username,
          password,
        }),
      });
      
      const json = await response.json();
      
      if (json.status === 'success') {
        // Save auth info and navigate to main app
        const userData = {
          id: json.user_id,
          username: json.username
        };
        
        await login(userData, json.token);
        
        // Navigation is handled by the Navigation component
      } else {
        Alert.alert('Login Failed', json.message || 'Please check your credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.registerLink}
        onPress={() => navigation.navigate('Register')}
      >
        <Text>Don't have an account? <Text style={styles.linkText}>Register</Text></Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#0066cc',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#0066cc',
    fontWeight: 'bold',
  },
});

export default LoginScreen;