import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
    items: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Item",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    deliveryDetails: {
      name: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      zipCode: {
        type: String,
      },
      instructions: {
        type: String,
      },
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
    },
    paymentMethod: {
      type: String,
      enum: ["COD", "UPI", "Card", "Wallet"],
      default: "COD",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Refunded"],
      default: "Pending",
    },
    itemsTotal: {
      type: Number,
      required: true,
    },
    deliveryFee: {
      type: Number,
      default: 0,
    },
    platformFee: {
      type: Number,
      default: 0,
    },
    gst: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "Placed",
        "Confirmed",
        "Preparing",
        "Ready",
        "Picked",
        "Delivered",
        "Cancelled",
      ],
      default: "Placed",
    },
    deliveryBoy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    pickupOtp: {
      type: String,
    },
    estimatedDeliveryTime: {
      type: Date,
    },
    actualDeliveryTime: {
      type: Date,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Update shop revenue and order count when order is confirmed
orderSchema.post("save", async function () {
  if (this.status === "Confirmed" && this.isNew) {
    const Shop = mongoose.model("Shop");
    await Shop.findByIdAndUpdate(this.shop, {
      $inc: {
        totalOrders: 1,
        totalRevenue: this.totalAmount,
      },
    });

    // Update item sold count
    const Item = mongoose.model("Item");
    for (const orderItem of this.items) {
      await Item.findByIdAndUpdate(orderItem.item, {
        $inc: { soldCount: orderItem.quantity },
      });
    }
  }
});

const Order = mongoose.model("Order", orderSchema);

export default Order;
