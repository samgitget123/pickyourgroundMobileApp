// utils/auth.js
import AsyncStorage from '@react-native-async-storage/async-storage';

export const isAuthenticated = async () => {
  try {
    const storedUser = await AsyncStorage.getItem('userData');
    const user = storedUser ? JSON.parse(storedUser) : null;
    return user && user.token ? user : null;
  } catch (err) {
    return null;
  }
};
