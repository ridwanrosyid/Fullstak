import { Ionicons } from "@expo/vector-icons";
import { Modal, Text, TouchableOpacity, View } from "react-native";

interface PaymentMethodModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (method: "card" | "qris") => void;
}

const PaymentMethodModal = ({
  visible,
  onClose,
  onSelect,
}: PaymentMethodModalProps) => {
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
              Payment Method
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="bg-surface rounded-full p-2"
            >
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View className="p-6 gap-4">
            <TouchableOpacity
              className="bg-surface rounded-3xl p-6 flex-row items-center border-2 border-background-lighter"
              activeOpacity={0.7}
              onPress={() => onSelect("card")}
            >
              <View className="bg-primary/20 rounded-full p-3 mr-4">
                <Ionicons name="card-outline" size={28} color="#1DB954" />
              </View>
              <View className="flex-1">
                <Text className="text-text-primary font-bold text-lg">
                  Card / Bank Transfer
                </Text>
                <Text className="text-text-secondary text-sm mt-1">
                  Pay with credit card or virtual account
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-surface rounded-3xl p-6 flex-row items-center border-2 border-background-lighter"
              activeOpacity={0.7}
              onPress={() => onSelect("qris")}
            >
              <View className="bg-primary/20 rounded-full p-3 mr-4">
                <Ionicons name="qr-code-outline" size={28} color="#1DB954" />
              </View>
              <View className="flex-1">
                <Text className="text-text-primary font-bold text-lg">
                  QRIS
                </Text>
                <Text className="text-text-secondary text-sm mt-1">
                  Pay with GoPay, OVO, DANA, and other e-wallets
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default PaymentMethodModal;
