import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApi } from '../src/contexts/ApiContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
export default function LoginScreen({ navigation }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const { BASE_URL } = useApi();
  console.log(BASE_URL, 'base_url');
  const handleLogin = async () => {
    try {
      const response = await fetch(`${BASE_URL}/user/loginUser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: phoneNumber,
          password: password
        }),
      });

      const data = await response.json();
      console.log(data, 'data');

      if (response.ok) {
           // ✅ Save user details in AsyncStorage
      await AsyncStorage.setItem('userData', JSON.stringify(data));
        console.log('Login success:', data);
        setErrorMessage('');

        navigation.replace('MainApp');
      } else {
        setErrorMessage(data.message || 'Invalid phone number or password');
      }

    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.card}>
          <Text variant="headlineSmall" style={styles.title}>
            Login
          </Text>
          <TextInput
            label="Phone Number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            style={styles.input}
          />
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />
          <Button
            mode="contained"
            onPress={handleLogin}
            style={styles.loginBtn}
          >
            Login
          </Button>
        </View>
        {errorMessage ? (
  <Text style={{ color: 'red', textAlign: 'center', marginBottom: 10 }}>
    {errorMessage}
  </Text>
) : null}

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#006849', // green background fills the whole screen
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    padding: 20,
    borderRadius: 10,
    backgroundColor: 'white',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  title: {
    marginBottom: 20,
    textAlign: 'center',
    color: '#006849',
    fontWeight: '500',
  },
  input: {
    marginBottom: 15,
  },
  loginBtn: {
    marginTop: 10,
    alignSelf: 'center',
    width: 150,
    backgroundColor: '#006849',
  },
});
