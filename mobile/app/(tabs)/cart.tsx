import SafeScreen from "@/components/SafeScreen";
import { useAddresses } from "@/hooks/useAddressess";
import useCart from "@/hooks/useCart";
import { useApi } from "@/lib/api";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useState } from "react";
import { Address } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import OrderSummary from "@/components/OrderSummary";
import AddressSelectionModal from "@/components/AddressSelectionModal";
import PaymentMethodModal from "@/components/PaymentMethodModal";

import * as Sentry from "@sentry/react-native";

// ✨ Fungsi format Rupiah (hanya untuk tampilan, tidak mengubah nilai asli)
const formatRupiah = (amount: number) => {
  return `Rp ${amount.toLocaleString("id-ID", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// ⚠️ GANTI dengan info rekening bank kamu yang sebenarnya
const BANK_ACCOUNT_INFO = "BCA 1234567890 a.n Toko Kamu";

const CartScreen = () => {
  const api = useApi();
  const {
    cart,
    cartItemCount,
    cartTotal,
    clearCart,
    isError,
    isLoading,
    isRemoving,
    isUpdating,
    removeFromCart,
    updateQuantity,
  } = useCart();
  const { addresses } = useAddresses();

  const [orderLoading, setOrderLoading] = useState(false);
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [paymentMethodModalVisible, setPaymentMethodModalVisible] =
    useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  const cartItems = cart?.items.filter((item) => item.product) || [];

  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product?.price ?? 0;
    const priceInIDR = price < 1000 ? price * 5000 : price;
    return sum + priceInIDR * item.quantity;
  }, 0);

  const shipping = 10000;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleQuantityChange = (
    productId: string,
    currentQuantity: number,
    change: number,
  ) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity < 1) return;
    updateQuantity({ productId, quantity: newQuantity });
  };

  const handleRemoveItem = (productId: string, productName: string) => {
    Alert.alert("Remove Item", `Remove ${productName} from cart?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => removeFromCart(productId),
      },
    ]);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;

    if (!addresses || addresses.length === 0) {
      Alert.alert(
        "No Address",
        "Please add a shipping address in your profile before checking out.",
        [{ text: "OK" }],
      );
      return;
    }

    setAddressModalVisible(true);
  };

  const handleAddressSelected = (address: Address) => {
    setSelectedAddress(address);
    setAddressModalVisible(false);
    setPaymentMethodModalVisible(true);
  };

  const handlePaymentMethodSelected = (method: "cod" | "transfer") => {
    setPaymentMethodModalVisible(false);
    if (!selectedAddress) return;
    handleProceedWithOrder(selectedAddress, method);
  };

  const handleProceedWithOrder = async (
    address: Address,
    method: "cod" | "transfer",
  ) => {
    Sentry.logger.info("Checkout initiated", {
      itemCount: cartItemCount,
      total: total.toFixed(2),
      city: address.city,
      method,
    });

    try {
      setOrderLoading(true);

      const orderItems = cartItems.map((item) => ({
        product: item.product?._id,
        name: item.product?.name,
        price:
          (item.product?.price ?? 0) < 1000
            ? (item.product?.price ?? 0) * 5000
            : (item.product?.price ?? 0),
        quantity: item.quantity,
        image: item.product?.images?.[0],
      }));

      const paymentResult =
        method === "cod"
          ? { id: `COD-${Date.now()}`, status: "pending_cod" }
          : { id: `TRANSFER-${Date.now()}`, status: "pending_transfer" };

      await api.post("/orders", {
        orderItems,
        shippingAddress: {
          fullName: address.fullName,
          streetAddress: address.streetAddress,
          city: address.city,
          state: address.state,
          zipCode: address.zipCode,
          phoneNumber: address.phoneNumber,
        },
        paymentMethod: method,
        paymentResult,
        totalPrice: total,
      });

      Sentry.logger.info("Order created successfully", {
        total: total.toFixed(2),
        itemCount: cartItems.length,
        method,
      });

      if (method === "cod") {
        Alert.alert(
          "Order Berhasil!",
          "Pesanan kamu sudah masuk. Silakan bayar tunai saat barang sampai (COD).",
          [{ text: "OK" }],
        );
      } else {
        Alert.alert(
          "Order Berhasil!",
          `Pesanan kamu sudah masuk. Silakan transfer ke:\n\n${BANK_ACCOUNT_INFO}\n\nlalu konfirmasi ke admin.`,
          [{ text: "OK" }],
        );
      }

      clearCart();
    } catch (error) {
      Sentry.logger.error("Order failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        cartTotal: total,
        itemCount: cartItems.length,
        method,
      });

      Alert.alert("Error", "Failed to create order. Please try again.");
    } finally {
      setOrderLoading(false);
    }
  };

  if (isLoading) return <LoadingUI />;
  if (isError) return <ErrorUI />;
  if (cartItems.length === 0) return <EmptyUI />;

  return (
    <SafeScreen>
      <Text className="px-6 pb-5 text-text-primary text-3xl font-bold tracking-tight">
        Cart
      </Text>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 240 }}
      >
        <View className="px-6 gap-2">
          {cartItems.map((item, index) => (
            <View
              key={item._id}
              className="bg-surface rounded-3xl overflow-hidden"
            >
              <View className="p-4 flex-row">
                <View className="relative">
                  <Image
                    source={item.product?.images?.[0]}
                    className="bg-background-lighter"
                    contentFit="cover"
                    style={{ width: 112, height: 112, borderRadius: 16 }}
                  />
                  <View className="absolute top-2 right-2 bg-primary rounded-full px-2 py-0.5">
                    <Text className="text-background text-xs font-bold">
                      ×{item.quantity}
                    </Text>
                  </View>
                </View>

                <View className="flex-1 ml-4 justify-between">
                  <View>
                    <Text
                      className="text-text-primary font-bold text-lg leading-tight"
                      numberOfLines={2}
                    >
                      {item.product?.name}
                    </Text>
                    <View className="flex-row items-center mt-2">
                      <Text className="text-primary font-bold text-2xl">
                        {formatRupiah(
                          (item.product?.price ?? 0) * item.quantity,
                        )}
                      </Text>
                      <Text className="text-text-secondary text-sm ml-2">
                        {formatRupiah(item.product?.price ?? 0)} each
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center mt-3">
                    <TouchableOpacity
                      className="bg-background-lighter rounded-full w-9 h-9 items-center justify-center"
                      activeOpacity={0.7}
                      onPress={() =>
                        handleQuantityChange(
                          item.product?._id || item._id,
                          item.quantity,
                          -1,
                        )
                      }
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Ionicons name="remove" size={18} color="#FFFFFF" />
                      )}
                    </TouchableOpacity>

                    <View className="mx-4 min-w-[32px] items-center">
                      <Text className="text-text-primary font-bold text-lg">
                        {item.quantity}
                      </Text>
                    </View>

                    <TouchableOpacity
                      className="bg-primary rounded-full w-9 h-9 items-center justify-center"
                      activeOpacity={0.7}
                      onPress={() =>
                        handleQuantityChange(
                          item.product?._id || item._id,
                          item.quantity,
                          1,
                        )
                      }
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <ActivityIndicator size="small" color="#121212" />
                      ) : (
                        <Ionicons name="add" size={18} color="#121212" />
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="ml-auto bg-red-500/10 rounded-full w-9 h-9 items-center justify-center"
                      activeOpacity={0.7}
                      onPress={() =>
                        handleRemoveItem(
                          item.product?._id || "",
                          item.product?.name || "Unknown Product",
                        )
                      }
                      disabled={isRemoving}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color="#EF4444"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>

        <OrderSummary
          subtotal={subtotal}
          shipping={shipping}
          tax={tax}
          total={total}
        />
      </ScrollView>

      <View
        className="absolute bottom-0 left-0 right-0 bg-background/95 backdrop-blur-xl border-t
       border-surface pt-4 pb-32 px-6"
      >
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <Ionicons name="cart" size={20} color="#1DB954" />
            <Text className="text-text-secondary ml-2">
              {cartItemCount} {cartItemCount === 1 ? "item" : "items"}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Text className="text-text-primary font-bold text-xl">
              {formatRupiah(total)}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          className="bg-primary rounded-2xl overflow-hidden"
          activeOpacity={0.9}
          onPress={handleCheckout}
          disabled={orderLoading}
        >
          <View className="py-5 flex-row items-center justify-center">
            {orderLoading ? (
              <ActivityIndicator size="small" color="#121212" />
            ) : (
              <>
                <Text className="text-background font-bold text-lg mr-2">
                  Checkout
                </Text>
                <Ionicons name="arrow-forward" size={20} color="#121212" />
              </>
            )}
          </View>
        </TouchableOpacity>
      </View>

      <AddressSelectionModal
        visible={addressModalVisible}
        onClose={() => setAddressModalVisible(false)}
        onProceed={handleAddressSelected}
        isProcessing={orderLoading}
      />

      <PaymentMethodModal
        visible={paymentMethodModalVisible}
        onClose={() => setPaymentMethodModalVisible(false)}
        onSelect={handlePaymentMethodSelected}
      />
    </SafeScreen>
  );
};

export default CartScreen;

function LoadingUI() {
  return (
    <SafeScreen>
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#00D9FF" />
        <Text className="text-text-secondary mt-4">Loading cart...</Text>
      </View>
    </SafeScreen>
  );
}

function ErrorUI() {
  return (
    <SafeScreen>
      <View className="flex-1 items-center justify-center px-6">
        <Ionicons name="alert-circle-outline" size={64} color="#FF6B6B" />
        <Text className="text-text-primary font-semibold text-xl mt-4">
          Failed to load cart
        </Text>
        <Text className="text-text-secondary text-center mt-2">
          Please check your connection and try again
        </Text>
      </View>
    </SafeScreen>
  );
}

function EmptyUI() {
  return (
    <SafeScreen>
      <View className="px-6 pt-16 pb-5">
        <Text className="text-text-primary text-3xl font-bold tracking-tight">
          Cart
        </Text>
      </View>
      <View className="flex-1 items-center justify-center px-6">
        <Ionicons name="cart-outline" size={80} color="#666" />
        <Text className="text-text-primary font-semibold text-xl mt-4">
          Your cart is empty
        </Text>
        <Text className="text-text-secondary text-center mt-2">
          Add some products to get started
        </Text>
      </View>
    </SafeScreen>
  );
}
