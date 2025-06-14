import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApi } from '../src/contexts/ApiContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { BASE_URL } = useApi();

  const handleLogin = async () => {
    try {
      const response = await fetch(`${BASE_URL}/user/loginUser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: phoneNumber,
          password: password,
        }),
      });

      const data = await response.json();
      console.log(data, 'userdata')
      if (response.ok) {
        await AsyncStorage.setItem('userData', JSON.stringify(data));
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

          {/* Phone Number Input with icon */}
          <TextInput
            label="Phone Number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            style={styles.input}
            mode="outlined"
            left={<TextInput.Icon icon="phone" />}
          />

          {/* Password Input with icon and toggle */}
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            style={styles.input}
            mode="outlined"
            left={<TextInput.Icon icon="lock" />}
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
          />

          <Button
            mode="contained"
            onPress={handleLogin}
            style={styles.loginBtn}
          >
            Login
          </Button>

          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#006849',
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
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
});
