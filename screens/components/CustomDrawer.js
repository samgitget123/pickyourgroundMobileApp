// components/CustomDrawer.js

import React from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';

export default function CustomDrawer(props) {
  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/sample.jpg')} // Replace with your logo path
          style={styles.logo}
          resizeMode="contain"
        />
         <Text style={styles.name}>Pick Your Ground</Text>
    
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
    marginBottom: 10,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50, // This makes the image fully rounded (circle)
    borderWidth: 2,
    borderColor: '#6200ee', // Optional: colored border around logo
  },
   name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  email: {
    fontSize: 14,
    color: '#777',
  },
});
