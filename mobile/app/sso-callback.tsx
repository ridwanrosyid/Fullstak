import { useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useRouter, useGlobalSearchParams } from "expo-router";
import * as SecureStore from "expo-secure-store";

export default function SSOCallback() {
  const router = useRouter();
  const params = useGlobalSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const { created_session_id, token, error } = params;

      if (error) {
        router.replace("/(auth)");
        return;
      }

      const accessToken = (token as string) || (created_session_id as string);

      if (accessToken) {
        // Simpan token secara aman
        await SecureStore.setItemAsync("auth_token", accessToken);
        // Jika ada data user, bisa simpan juga
        // await SecureStore.setItemAsync('user', JSON.stringify(userData));

        router.replace("/(tabs)");
      } else {
        router.replace("/(auth)");
      }
    };

    handleCallback();
  }, [params]);

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <ActivityIndicator size="large" color="#3b82f6" />
      <Text className="mt-4 text-gray-600">Menyelesaikan proses login...</Text>
    </View>
  );
}
