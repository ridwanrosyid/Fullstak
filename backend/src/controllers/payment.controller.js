import Stripe from "stripe";
import midtransClient from "midtrans-client";
import { ENV } from "../config/env.js";
import { User } from "../models/user.model.js";
import { Product } from "../models/product.model.js";
import { Order } from "../models/order.model.js";
import { Cart } from "../models/cart.model.js";

const stripe = new Stripe(ENV.STRIPE_SECRET_KEY);

const coreApi = new midtransClient.CoreApi({
  isProduction: false,
  serverKey: ENV.MIDTRANS_SERVER_KEY,
  clientKey: ENV.MIDTRANS_CLIENT_KEY,
});

export async function createPaymentIntent(req, res) {
  try {
    // ✅ Ambil total dari frontend (sudah dalam Rupiah)
    const { cartItems, shippingAddress, total } = req.body;
    const user = req.user;

    // Validate cart items
    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({
        error: "Cart is empty",
      });
    }

    // ✅ Validasi stok produk
    for (const item of cartItems) {
      const product = await Product.findById(item.product._id);

      if (!product) {
        return res.status(404).json({
          error: `Product ${item.product.name} not found`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for ${product.name}`,
        });
      }
    }

    // ✅ Gunakan total dari frontend
    const totalAmount = Math.round(total || 0);

    if (totalAmount <= 0) {
      return res.status(400).json({
        error: "Invalid order total",
      });
    }

    // ✅ Minimum pembayaran Stripe untuk IDR
    if (totalAmount < 5000) {
      return res.status(400).json({
        error: "Minimum payment amount is Rp5.000",
      });
    }

    // Find or create stripe customer
    let customer;

    if (user.stripeCustomerId) {
      customer = await stripe.customers.retrieve(user.stripeCustomerId);
    } else {
      customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          clerkId: user.clerkId,
          userId: user._id.toString(),
        },
      });

      await User.findByIdAndUpdate(user._id, {
        stripeCustomerId: customer.id,
      });
    }

    // CREATE PAYMENT INTENT
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount * 100, // IDR bukan zero-decimal currency di Stripe
      currency: "idr",
      customer: customer.id,

      automatic_payment_methods: {
        enabled: true,
      },

      metadata: {
        clerkId: user.clerkId,
        userId: user._id.toString(),
        totalPrice: totalAmount.toString(),
        itemCount: cartItems.length.toString(),
      },
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);

    res.status(500).json({
      error: "Failed to create payment intent",
    });
  }
}

export async function handleWebhook(req, res) {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      ENV.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);

    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;

    console.log("Payment succeeded:", paymentIntent.id);

    try {
      const { userId, clerkId, totalPrice } = paymentIntent.metadata;

      const existingOrder = await Order.findOne({
        "paymentResult.id": paymentIntent.id,
      });

      if (existingOrder) {
        console.log("Order already exists for payment:", paymentIntent.id);

        return res.json({
          received: true,
        });
      }

      const order = await Order.create({
        user: userId,
        clerkId,

        // sementara dikosongkan dulu
        orderItems: [],

        // sementara dikosongkan dulu
        shippingAddress: {},

        paymentResult: {
          id: paymentIntent.id,
          status: "succeeded",
        },

        totalPrice: parseFloat(totalPrice),
      });

      console.log("Order created successfully:", order._id);
    } catch (error) {
      console.error("Error creating order from webhook:", error);
    }
  }

  res.json({
    received: true,
  });
}

// ============ MIDTRANS QRIS ============

export async function createQrisPayment(req, res) {
  try {
    const { cartItems, shippingAddress, total } = req.body;
    const user = req.user;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({
        error: "Cart is empty",
      });
    }

    for (const item of cartItems) {
      const product = await Product.findById(item.product._id);

      if (!product) {
        return res.status(404).json({
          error: `Product ${item.product.name} not found`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for ${product.name}`,
        });
      }
    }

    const totalAmount = Math.round(total || 0);

    if (totalAmount <= 0) {
      return res.status(400).json({
        error: "Invalid order total",
      });
    }

    const orderId = `MIDTRANS-${Date.now()}-${user._id}`;

    const chargeResponse = await coreApi.charge({
      payment_type: "qris",
      transaction_details: {
        order_id: orderId,
        gross_amount: totalAmount,
      },
      qris: {
        acquirer: "gopay",
      },
      customer_details: {
        first_name: user.name,
        email: user.email,
      },
      item_details: cartItems.map((item) => ({
        id: item.product._id,
        price: item.product.price,
        quantity: item.quantity,
        name: item.product.name,
      })),
      // simpan data buat dipakai lagi pas notification masuk
      custom_field1: user._id.toString(),
      custom_field2: user.clerkId,
      custom_field3: totalAmount.toString(),
    });

    const qrAction = chargeResponse.actions?.find(
      (action) => action.name === "generate-qr-code",
    );

    res.status(200).json({
      orderId,
      qrCodeUrl: qrAction?.url,
      transactionId: chargeResponse.transaction_id,
      grossAmount: totalAmount,
    });
  } catch (error) {
    console.error("Error creating QRIS payment:", error);

    res.status(500).json({
      error: "Failed to create QRIS payment",
    });
  }
}

export async function handleMidtransNotification(req, res) {
  try {
    const statusResponse = await coreApi.transaction.notification(req.body);

    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    console.log(
      `Midtrans notification. Order ID: ${orderId}. Status: ${transactionStatus}`,
    );

    const isSuccess =
      transactionStatus === "settlement" ||
      (transactionStatus === "capture" && fraudStatus === "accept");

    if (isSuccess) {
      const existingOrder = await Order.findOne({
        "paymentResult.id": orderId,
      });

      if (existingOrder) {
        console.log("Order already exists for payment:", orderId);
        return res.status(200).json({ received: true });
      }

      const userId = statusResponse.custom_field1;
      const clerkId = statusResponse.custom_field2;
      const totalPrice = statusResponse.custom_field3;

      const order = await Order.create({
        user: userId,
        clerkId,
        orderItems: [],
        shippingAddress: {},
        paymentResult: {
          id: orderId,
          status: "succeeded",
        },
        totalPrice: parseFloat(totalPrice),
      });

      console.log("Order created successfully:", order._id);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Error handling Midtrans notification:", error);

    res.status(500).json({
      error: "Failed to handle notification",
    });
  }
}

export async function checkPaymentStatus(req, res) {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({
      "paymentResult.id": orderId,
    });

    if (order) {
      return res.status(200).json({ status: "paid" });
    }

    res.status(200).json({ status: "pending" });
  } catch (error) {
    console.error("Error checking payment status:", error);

    res.status(500).json({
      error: "Failed to check payment status",
    });
  }
}
