import "./src/polyfills";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { WalletProvider } from './src/context/WalletContext';
import { ToastProvider } from './src/context/ToastContext';
import AppNavigator from "./src/navigation/AppNavigator";
import "./global.css";
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, error] = useFonts({
    'Bangers': require('./assets/fonts/Bangers-Regular.ttf'),
  });

  useEffect(() => {
    if (error) {
      console.error('Font loading error:', error);
    }
    if (fontsLoaded) {
      console.log('Font loaded successfully!');
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, error]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0f0f1e' }}>
        <WalletProvider>
          <ToastProvider>
            <AppNavigator />
            <StatusBar style="light" />
          </ToastProvider>
        </WalletProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
