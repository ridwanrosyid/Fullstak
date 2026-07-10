import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useApi } from "@/lib/api";

interface QrisPaymentModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  qrCodeUrl: string | null;
  orderId: string | null;
  amount: number;
}

const formatRupiah = (amount: number) => {
  return `Rp ${amount.toLocaleString("id-ID")}`;
};

const QrisPaymentModal = ({
  visible,
  onClose,
  onSuccess,
  qrCodeUrl,
  orderId,
  amount,
}: QrisPaymentModalProps) => {
  const api = useApi();
  const [checking, setChecking] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (visible && orderId) {
      intervalRef.current = setInterval(async () => {
        try {
          const { data } = await api.get(`/payment/status/${orderId}`);
          if (data.status === "paid") {
            if (intervalRef.current) clearInterval(intervalRef.current);
            onSuccess();
          }
        } catch (error) {
          console.log("Error polling payment status:", error);
        }
      }, 3000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [visible, orderId]);

  const handleCheckNow = async () => {
    if (!orderId) return;
    setChecking(true);
    try {
      const { data } = await api.get(`/payment/status/${orderId}`);
      if (data.status === "paid") {
        if (intervalRef.current) clearInterval(intervalRef.current);
        onSuccess();
      }
    } catch (error) {
      console.log("Error checking payment status:", error);
    } finally {
      setChecking(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-background rounded-t-3xl pb-10">
          <View className="flex-row items-center justify-between p-6 border-b border-surface">
            <Text className="text-text-primary text-2xl font-bold">
              Scan to Pay
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="bg-surface rounded-full p-2"
            >
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View className="p-6 items-center">
            <Text className="text-text-secondary text-base mb-1">
              Total Payment
            </Text>
            <Text className="text-primary font-bold text-2xl mb-6">
              {formatRupiah(amount)}
            </Text>

            {qrCodeUrl ? (
              <View className="bg-white rounded-3xl p-4">
                <Image
                  source={{ uri: qrCodeUrl }}
                  style={{ width: 240, height: 240 }}
                  contentFit="contain"
                />
              </View>
            ) : (
              <ActivityIndicator size="large" color="#1DB954" />
            )}

            <Text className="text-text-secondary text-sm text-center mt-6 px-4">
              Open GoPay, OVO, DANA, or any QRIS-supported app and scan this
              code to complete your payment.
            </Text>

            <TouchableOpacity
              className="bg-primary rounded-2xl py-4 px-8 mt-6 flex-row items-center"
              activeOpacity={0.9}
              onPress={handleCheckNow}
              disabled={checking}
            >
              {checking ? (
                <ActivityIndicator size="small" color="#121212" />
              ) : (
                <>
                  <Ionicons
                    name="refresh"
                    size={18}
                    color="#121212"
                    style={{ marginRight: 8 }}
                  />
                  <Text className="text-background font-bold">
                    Check Payment Status
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default QrisPaymentModal;
