import React from 'react';
import { View, Button } from 'react-native';

export default function LogoutScreen({ navigation }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="Confirm Logout" onPress={() => navigation.replace('Login')} />
    </View>
  );
}
