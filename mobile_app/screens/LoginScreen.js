import React, { useState, useContext } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { loginUser } from '../utils/api';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { setUser } = useContext(AuthContext);

  const handleLogin = async () => {
    const user = await loginUser(username, password);
    if (user) {
      setUser(user);
      navigation.navigate('Houses');
    } else {
      alert('Login failed');
    }
  };

  return (
    <View>
      <Text>Username</Text>
      <TextInput onChangeText={setUsername} value={username} />
      <Text>Password</Text>
      <TextInput secureTextEntry onChangeText={setPassword} value={password} />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}
