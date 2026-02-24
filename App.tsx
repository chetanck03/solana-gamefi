import "./src/polyfills";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { WalletProvider } from './src/context/WalletContext';
import { ToastProvider } from './src/context/ToastContext';
import AppNavigator from "./src/navigation/AppNavigator";
import "./global.css";

export default function App() {
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
