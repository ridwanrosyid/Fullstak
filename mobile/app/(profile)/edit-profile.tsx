import { useUser } from "@clerk/clerk-expo";
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import SafeScreen from "@/components/SafeScreen";
import { useApi } from "@/lib/api"; // ✅ TAMBAHKAN

export default function EditProfileScreen() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [isSaving, setIsSaving] = useState(false);
  const api = useApi(); // ✅ TAMBAHKAN

  if (!isLoaded || !isSignedIn) {
    return (
      <SafeScreen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#00D9FF" />
          <Text className="text-text-secondary mt-4">Loading profile...</Text>
        </View>
      </SafeScreen>
    );
  }

  const handleSave = async () => {
    if (!user) return;
    if (!firstName.trim() && !lastName.trim()) {
      Alert.alert("Error", "Please enter your name");
      return;
    }
    setIsSaving(true);
    try {
      // Update data user di Clerk
      await user.update({
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
      });

      // ✨ Kirim notifikasi ke backend
      await api.post("/notifications", {
        title: "Profil Diperbarui",
        message: `Anda telah memperbarui profil Anda menjadi ${firstName.trim()} ${lastName.trim()}`,
        type: "system",
      });

      Alert.alert("Success", "Profile updated successfully!");
      router.back();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeScreen>
      <View className="flex-1 bg-background">
        {/* Header */}
        <View className="px-6 pt-6 pb-4 flex-row items-center border-b border-surface">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Ionicons name="arrow-back" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <Text className="text-text-primary text-2xl font-bold">
            Edit Profile
          </Text>
        </View>

        <View className="px-6 mt-6">
          <View className="bg-surface rounded-3xl p-4">
            <Text className="text-text-secondary text-sm mb-2">First Name</Text>
            <TextInput
              className="bg-background-lighter rounded-xl px-4 py-3 text-text-primary text-base"
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Enter first name"
              placeholderTextColor="#666"
            />

            <Text className="text-text-secondary text-sm mt-4 mb-2">
              Last Name
            </Text>
            <TextInput
              className="bg-background-lighter rounded-xl px-4 py-3 text-text-primary text-base"
              value={lastName}
              onChangeText={setLastName}
              placeholder="Enter last name"
              placeholderTextColor="#666"
            />

            <Text className="text-text-secondary text-sm mt-4 mb-2">Email</Text>
            <TextInput
              className="bg-background-lighter rounded-xl px-4 py-3 text-text-primary text-base opacity-60"
              value={user?.emailAddresses?.[0]?.emailAddress || ""}
              editable={false}
            />
            <Text className="text-text-secondary text-xs mt-1">
              Email cannot be changed
            </Text>
          </View>

          <TouchableOpacity
            className="bg-primary rounded-2xl py-4 mt-6 items-center"
            activeOpacity={0.8}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#121212" />
            ) : (
              <Text className="text-background font-bold text-lg">
                Save Changes
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeScreen>
  );
}
