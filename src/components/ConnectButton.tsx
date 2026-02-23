import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
} from "react-native";

interface Props {
  connected: boolean;
  connecting: boolean;
  publicKey: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function ConnectButton({
  connected,
  connecting,
  publicKey,
  onConnect,
  onDisconnect,
}: Props) {
  if (connecting) {
    return (
      <View 
        className="items-center justify-center rounded-2xl w-full"
        style={{
          backgroundColor: '#333',
          paddingVertical: 18,
          paddingHorizontal: 32,
        }}
      >
        <ActivityIndicator size="small" color="#fff" />
        <Text className="text-white text-base font-semibold mt-2">Connecting...</Text>
      </View>
    );
  }

  if (connected && publicKey) {
    return (
      <TouchableOpacity
        className="items-center justify-between rounded-2xl w-full border-2"
        style={{
          backgroundColor: '#14F19515',
          borderColor: '#14F195',
          paddingVertical: 16,
          paddingHorizontal: 24,
          flexDirection: 'row',
        }}
        onPress={onDisconnect}
      >
        <View className="flex-row items-center gap-2">
          <View 
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: '#14F195' }}
          />
          <Text className="text-base font-bold font-mono" style={{ color: '#14F195' }}>
            {publicKey.slice(0, 4)}...{publicKey.slice(-4)}
          </Text>
        </View>
        <View className="px-3 py-1.5 rounded-lg" style={{ backgroundColor: '#14F19530' }}>
          <Text className="text-sm font-semibold" style={{ color: '#14F195' }}>Disconnect</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      className="items-center justify-center rounded-2xl w-full"
      style={{
        backgroundColor: '#9945FF',
        paddingVertical: 18,
        paddingHorizontal: 32,
      }}
      onPress={onConnect}
    >
      <Text className="text-white text-lg font-bold">Connect Wallet</Text>
    </TouchableOpacity>
  );
}
