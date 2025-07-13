import React, { useEffect, useState } from 'react';
import { Text, Platform, LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import DrawerNavigator from './screens/DrawerNavigator';
import { ApiProvider } from './src/contexts/ApiContext';

const Stack = createNativeStackNavigator();

export default function App() {
  const [firstLaunch, setFirstLaunch] = useState(null);
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    
    const init = async () => {
      // Check if first launch
      const launchFlag = await AsyncStorage.getItem('alreadyLaunched');
      if (launchFlag === null) {
        await AsyncStorage.setItem('alreadyLaunched', 'true');
        setFirstLaunch(true);
      } else {
        setFirstLaunch(false);
      }

      // Check login status
      const storedData = await AsyncStorage.getItem('userData');
      if (storedData) {
        const { loginTime } = JSON.parse(storedData);
        const now = new Date().getTime();
        const twentyFourHours = 24 * 60 * 60 * 1000;

        if (now - loginTime < twentyFourHours) {
          setInitialRoute('MainApp');
        } else {
          await AsyncStorage.removeItem('userData');
          setInitialRoute('Login');
        }
      } else {
        setInitialRoute('Login');
      }
    };

    init();
  }, []);

  if (firstLaunch === null || initialRoute === null) return null;
///////////////Global font setting////////////////////////////
//  useEffect(() => {
//     // Suppress any specific warnings if needed
//     LogBox.ignoreLogs(['Warning: ...']);

//     // Set global default for all <Text>
//     if (Text.defaultProps == null) Text.defaultProps = {};
//     Text.defaultProps.allowFontScaling = false;
//     Text.defaultProps.style = {
//       fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
//       fontSize: 14,
//       fontWeight: '400',
//       color: '#000',
//     };
//   }, []);
  return (
    <ApiProvider>
      <PaperProvider>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{ headerShown: false }}
            initialRouteName={firstLaunch ? 'Welcome' : initialRoute}
          >
            {firstLaunch && <Stack.Screen name="Welcome" component={WelcomeScreen} />}
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="MainApp" component={DrawerNavigator} />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </ApiProvider>
  );
}
