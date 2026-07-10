import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import SafeScreen from "@/components/SafeScreen";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useApi } from "@/lib/api";
import { useState } from "react";

const formatTimeAgo = (date: string) => {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Baru saja";
  if (minutes < 60) return `${minutes} menit lalu`;
  if (hours < 24) return `${hours} jam lalu`;
  if (days < 7) return `${days} hari lalu`;
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "order":
      return { name: "cart-outline", color: "#10B981" };
    case "promo":
      return { name: "pricetag-outline", color: "#F59E0B" };
    case "system":
      return { name: "settings-outline", color: "#3B82F6" };
    default:
      return { name: "notifications-outline", color: "#00D9FF" };
  }
};

export default function NotificationsScreen() {
  const api = useApi();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  // 🔥 Panggil API backend, bukan data dummy!
  const {
    data: notifications = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data } = await api.get("/notifications");
      return data.notifications || [];
    },
    refetchInterval: 10000, // real-time setiap 10 detik
    refetchIntervalInBackground: true,
  });

  const unreadCount = notifications.filter((item: any) => !item.isRead).length;

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.put(`/notifications/${id}/read`);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await api.put("/notifications/read-all");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      Alert.alert("Berhasil", "Semua notifikasi telah ditandai sudah dibaca");
    },
    onError: () => Alert.alert("Error", "Gagal menandai semua notifikasi"),
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (isLoading) {
    return (
      <SafeScreen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#00D9FF" />
          <Text className="text-text-secondary mt-4">Memuat notifikasi...</Text>
        </View>
      </SafeScreen>
    );
  }

  if (isError) {
    return (
      <SafeScreen>
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="alert-circle-outline" size={64} color="#FF6B6B" />
          <Text className="text-text-primary font-semibold text-xl mt-4">
            Gagal memuat notifikasi
          </Text>
          <Text className="text-text-secondary text-center mt-2">
            Periksa koneksi Anda dan coba lagi
          </Text>
          <TouchableOpacity
            className="bg-primary rounded-2xl px-6 py-3 mt-4"
            onPress={() => refetch()}
          >
            <Text className="text-background font-bold">Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen>
      <View className="flex-1 px-6 pt-6">
        <View className="flex-row items-center mb-6">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <Text className="text-text-primary text-2xl font-bold">
            Notifikasi
          </Text>
          {unreadCount > 0 && (
            <View className="ml-2 bg-red-500 rounded-full px-2 py-0.5">
              <Text className="text-white text-xs font-bold">
                {unreadCount}
              </Text>
            </View>
          )}
          {notifications.length > 0 && (
            <TouchableOpacity
              className="ml-auto"
              onPress={() => markAllReadMutation.mutate()}
              disabled={unreadCount === 0}
            >
              <Ionicons
                name="checkmark-done-circle-outline"
                size={24}
                color={unreadCount > 0 ? "#00D9FF" : "#666"}
              />
            </TouchableOpacity>
          )}
        </View>

        {notifications.length > 0 ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor="#00D9FF"
              />
            }
          >
            {notifications.map((item: any) => {
              const icon = getNotificationIcon(item.type);
              const isRead = item.isRead;
              return (
                <TouchableOpacity
                  key={item._id}
                  className={`bg-surface rounded-2xl p-4 mb-3 ${!isRead ? "border-l-4 border-primary" : ""}`}
                  activeOpacity={0.7}
                  onPress={() => {
                    if (!isRead) markAsReadMutation.mutate(item._id);
                  }}
                >
                  <View className="flex-row items-start">
                    <View
                      className="rounded-full p-2 mr-3"
                      style={{ backgroundColor: icon.color + "20" }}
                    >
                      <Ionicons
                        name={icon.name as any}
                        size={20}
                        color={icon.color}
                      />
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center justify-between">
                        <Text
                          className={`text-text-primary font-semibold ${!isRead ? "text-primary" : ""}`}
                        >
                          {item.title}
                        </Text>
                        {!isRead && (
                          <View className="bg-primary rounded-full w-2 h-2 ml-2" />
                        )}
                      </View>
                      <Text className="text-text-secondary text-sm mt-1">
                        {item.message}
                      </Text>
                      <View className="flex-row items-center mt-2">
                        <Text className="text-text-secondary text-xs">
                          {formatTimeAgo(item.createdAt)}
                        </Text>
                        {!isRead && (
                          <TouchableOpacity
                            className="ml-auto"
                            onPress={() => markAsReadMutation.mutate(item._id)}
                          >
                            <Text className="text-primary text-xs font-semibold">
                              Tandai sudah dibaca
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        ) : (
          <View className="flex-1 items-center justify-center">
            <Ionicons name="notifications-off-outline" size={64} color="#666" />
            <Text className="text-text-secondary text-lg mt-4">
              Belum ada notifikasi
            </Text>
            <Text className="text-text-secondary text-sm mt-2 text-center">
              Kami akan memberitahu Anda jika ada sesuatu
            </Text>
          </View>
        )}

        <Text className="text-text-secondary text-xs text-center mt-4 opacity-50">
          Update real-time setiap 10 detik
        </Text>
      </View>
    </SafeScreen>
  );
}
