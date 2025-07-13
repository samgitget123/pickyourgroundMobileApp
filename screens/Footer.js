// components/CustomDrawer.js

import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
 const currentYear = new Date().getFullYear();
export default function Footer(props) {
  return (
      <View style={styles.footer}>
             <Text style={styles.footerText}> &copy; {currentYear} Pick Your <Text>Ground</Text> | AyyappaEnterprises</Text>
           </View>
  );
}

const styles = StyleSheet.create({
 footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
  },
  footerText: {
    color: '#999',
    fontSize: 12,
  },
});
