// components/CustomDrawer.js

import React from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
const IMAGE_BASE_URL = `https://pickyourground.com/uploads`;
export default function CustomDrawer(props) {
  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.logoContainer}>
        <Image
          //source={require('../../assets/sample.jpg')} // Replace with your logo path
          source={{ uri: `${IMAGE_BASE_URL}/1751805024605-PYGLOGO.jpeg` }}//1751805024605-PYGLOGO.jpeg it is in the database
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.name}>
          <Text style={{ color: '#fff' }}>Pick Your </Text>
          <Text style={{ color: '#00EE64' }}>Ground</Text>
        </Text>
      </View>
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 30,
    backgroundColor:'#006849'
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50, // This makes the image fully rounded (circle)
    borderWidth: 2,
    borderColor: '#fff', // Optional: colored border around logo
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 10,
  },
  email: {
    fontSize: 14,
    color: '#777',
  },
});
