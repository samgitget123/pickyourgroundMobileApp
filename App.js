import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import DrawerNavigator from './screens/DrawerNavigator'; // <-- NEW
import GroundSlots from './screens/GroundSlots';
// ✅ Correct
import { ApiProvider } from './src/contexts/ApiContext';


const Stack = createNativeStackNavigator();

export default function App() {
  const [firstLaunch, setFirstLaunch] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem('alreadyLaunched').then(value => {
      if (value === null) {
        AsyncStorage.setItem('alreadyLaunched', 'true');
        setFirstLaunch(true);
      } else {
        setFirstLaunch(false);
      }
    });
  }, []);

  if (firstLaunch === null) return null;

  return (
    <ApiProvider>
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <>
            {firstLaunch && (
              <Stack.Screen name="Welcome" component={WelcomeScreen} />
            )}
            {/* <Stack.Screen name="Welcome" component={WelcomeScreen} /> */}
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="MainApp" component={DrawerNavigator} />
           

          </>
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
    </ApiProvider>
  );
}
