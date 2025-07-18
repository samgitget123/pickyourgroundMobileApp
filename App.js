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
  const [initialRoute, setInitialRoute] = useState(null);

  // GLOBAL FONT SETTING
  useEffect(() => {
    // LogBox.ignoreLogs(['Warning: ...']);

    // if (Text.defaultProps == null) Text.defaultProps = {};
    // Text.defaultProps.allowFontScaling = false;
    // Text.defaultProps.style = {
    //   fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    //   fontSize: 12,
    //   fontWeight: '300',
    //   color: '#fff',
    // };

    const init = async () => {
      const launchFlag = await AsyncStorage.getItem('alreadyLaunched');
      const storedData = await AsyncStorage.getItem('userData');

      if (!launchFlag) {
        await AsyncStorage.setItem('alreadyLaunched', 'true');
        setInitialRoute('Welcome');
      } else if (storedData) {
        const { loginTime } = JSON.parse(storedData);
        const now = new Date().getTime();
        const expired = now - loginTime > 24 * 60 * 60 * 1000;

        if (expired) {
          await AsyncStorage.removeItem('userData');
          setInitialRoute('Login');
        } else {
          setInitialRoute('MainApp');
        }
      } else {
        setInitialRoute('Login');
      }
    };

    init();
  }, []);

  if (!initialRoute) return null;

  return (
    <ApiProvider>
      <PaperProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="MainApp" component={DrawerNavigator} />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </ApiProvider>
  );
}
