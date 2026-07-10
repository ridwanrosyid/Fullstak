import { View, Text } from "react-native";

// ✨ Fungsi format Rupiah (hanya untuk tampilan)
const formatRupiah = (amount: number) => {
  return `Rp ${amount.toLocaleString("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

interface OrderSummaryProps {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

export default function OrderSummary({
  subtotal,
  shipping,
  tax,
  total,
}: OrderSummaryProps) {
  return (
    <View className="px-6 mt-6">
      <View className="bg-surface rounded-3xl p-5">
        <Text className="text-text-primary text-xl font-bold mb-4">
          Summary
        </Text>

        <View className="space-y-3">
          <View className="flex-row justify-between items-center">
            <Text className="text-text-secondary text-base">Subtotal</Text>
            <Text className="text-text-primary font-semibold text-base">
              {formatRupiah(subtotal)} {/* ✨ DIUBAH */}
            </Text>
          </View>

          <View className="flex-row justify-between items-center">
            <Text className="text-text-secondary text-base">Shipping</Text>
            <Text className="text-text-primary font-semibold text-base">
              {formatRupiah(shipping)} {/* ✨ DIUBAH */}
            </Text>
          </View>

          <View className="flex-row justify-between items-center">
            <Text className="text-text-secondary text-base">Tax</Text>
            <Text className="text-text-primary font-semibold text-base">
              {formatRupiah(tax)} {/* ✨ DIUBAH */}
            </Text>
          </View>

          {/* Divider */}
          <View className="border-t border-background-lighter pt-3 mt-1" />

          {/* Total */}
          <View className="flex-row justify-between items-center">
            <Text className="text-text-primary font-bold text-lg">Total</Text>
            <Text className="text-primary font-bold text-2xl">
              {formatRupiah(total)} {/* ✨ DIUBAH */}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
