import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApi } from '../src/contexts/ApiContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [modalVisible, setModalVisible] = useState(false);
  const [resetPhone, setResetPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetMessage, setResetMessage] = useState('');

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
      console.log(data, 'userdatainconsole')
      if (response.ok) {
        const currentTime = new Date().getTime(); // in ms
        const loginData = {
          user: data.user,
          token: data.token,
          loginTime: currentTime,
        };

        await AsyncStorage.setItem('userData', JSON.stringify(loginData));
        setErrorMessage('');
        navigation.replace('MainApp');
      } else {
        setErrorMessage(data.message || 'Invalid phone number or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('An error occurred. Please try again.');
    }
  };

  const handleResetPassword = async () => {

    try {
      //http://192.168.1.6:5000/api/ground/resetPassword
      const response = await fetch(`${BASE_URL}/ground/resetPassword`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number: resetPhone,
          new_password: newPassword,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setResetMessage('✅ Password reset successful. Please log in.');
        setTimeout(() => {
          setModalVisible(false);
          setResetPhone('');
          setNewPassword('');
          setResetMessage('');
        }, 1500);
      } else {
        setResetMessage(data.message || 'Reset failed.');
      }
    } catch (error) {
      console.error('Reset error:', error);
      setResetMessage('Something went wrong.');
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
            mode="outlined"
            left={<TextInput.Icon icon="phone" />}
          />

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

          <Button onPress={() => setModalVisible(true)} textColor="#006849">
            Forgot Password?
          </Button>

          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}
        </View>
      </View>

      {/* Forgot Password Modal */}
      {modalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text variant="titleMedium" style={{ textAlign: 'center', marginBottom: 10 }}>
              Reset Password
            </Text>

            <TextInput
              label="Phone Number"
              value={resetPhone}
              onChangeText={setResetPhone}
              keyboardType="phone-pad"
              style={styles.input}
              mode="outlined"
              left={<TextInput.Icon icon="phone" />}
            />
            <TextInput
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showPassword}
              style={styles.input}
              mode="outlined"
              left={<TextInput.Icon icon="lock-reset" />}
              right={
                <TextInput.Icon
                  icon={showPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
            />

            {/* <TextInput
              label="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              style={styles.input}
              mode="outlined"
              left={<TextInput.Icon icon="lock-reset" />}
            /> */}

            <Button
              mode="contained"
              style={styles.loginBtn}
              onPress={handleResetPassword}
            >
              Reset Password
            </Button>

            {resetMessage ? (
              <Text style={{ color: '#006849', textAlign: 'center', marginTop: 8 }}>
                {resetMessage}
              </Text>
            ) : null}

            <Button onPress={() => setModalVisible(false)} textColor="red" style={{ marginTop: 10 }}>
              Cancel
            </Button>
          </View>
        </View>
      )}
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
    width: 180,
    backgroundColor: '#006849',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalCard: {
    width: '85%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    elevation: 10,
  },
});
