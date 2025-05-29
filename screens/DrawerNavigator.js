import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import HomeScreen from './HomeScreen';
import DashboardScreen from './DashboardScreen';
import LogoutScreen from './LogoutScreen';
import CustomDrawer from './components/CustomDrawer';
import GroundSlots from './GroundSlots';
const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator initialRouteName="Home"
     drawerContent={(props) => <CustomDrawer {...props} />}
    screenOptions={{
    headerTitle: '', // Hide title text
    headerStyle: { backgroundColor: '#fff' }, // Optional: change header color
    headerTintColor: '#000', // Optional: change icon color
  }}>
      <Drawer.Screen name="Home" component={HomeScreen}/>
      <Drawer.Screen name="Dashboard" component={DashboardScreen}/>
        <Drawer.Screen name="Slots" component={GroundSlots} />
      <Drawer.Screen name="Logout" component={LogoutScreen} />
    </Drawer.Navigator>
  );
}
