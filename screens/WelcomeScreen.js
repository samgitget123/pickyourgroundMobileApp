import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Button, Text } from 'react-native-paper';

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* <Image source={require('')} style={styles.image} /> */}
      <Text variant="headlineMedium" style={{ marginBottom: 20 }}>
        Welcome to PickYourGround
      </Text>
      <Button mode="contained" onPress={() => navigation.replace('Login')}>
        Get Started
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  image: { width: 250, height: 250, marginBottom: 30 },
});
