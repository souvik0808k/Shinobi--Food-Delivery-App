import Order from "../models/order.model.js";
import Shop from "../models/shop.model.js";
import Item from "../models/item.model.js";

// Create a new order
export const createOrder = async (req, res) => {
  try {
    const userId = req.user._id; // From auth middleware
    const {
      shop,
      items,
      deliveryDetails,
      paymentMethod,
      itemsTotal,
      deliveryFee,
      platformFee,
      gst,
      totalAmount,
    } = req.body;

    // Validate required fields
    if (!shop || !items || items.length === 0 || !deliveryDetails || !totalAmount) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Verify all items are in stock
    for (const orderItem of items) {
      const item = await Item.findById(orderItem.item);
      if (!item) {
        return res.status(404).json({
          success: false,
          message: `Item ${orderItem.item} not found`,
        });
      }
      if (!item.inStock) {
        return res.status(400).json({
          success: false,
          message: `${item.name} is currently out of stock`,
        });
      }
    }

    // Create order
    const order = await Order.create({
      user: userId,
      shop,
      items,
      deliveryDetails,
      paymentMethod,
      itemsTotal,
      deliveryFee,
      platformFee,
      gst,
      totalAmount,
      status: "Placed",
      paymentStatus: paymentMethod === "COD" ? "Pending" : "Pending",
    });

    // Populate order details
    const populatedOrder = await Order.findById(order._id)
      .populate("user", "fullName email mobile")
      .populate("shop", "name phone address")
      .populate("items.item", "name image category price");

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: populatedOrder,
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating order",
      error: error.message,
    });
  }
};

// Get user's orders
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id;

    const orders = await Order.find({ user: userId })
      .populate("shop", "name images city")
      .populate("items.item", "name image category")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get user orders error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
      error: error.message,
    });
  }
};

// Get single order details
export const getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;

    const order = await Order.findById(orderId)
      .populate("user", "fullName email mobile")
      .populate("shop", "name phone address images")
      .populate("items.item", "name image category price")
      .populate("deliveryBoy", "fullName mobile");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if user is authorized to view this order
    if (order.user._id.toString() !== userId.toString()) {
      // Also check if user is shop owner or delivery boy
      const shop = await Shop.findOne({ _id: order.shop._id, owner: userId });
      const isDeliveryBoy = order.deliveryBoy && order.deliveryBoy._id.toString() === userId.toString();

      if (!shop && !isDeliveryBoy) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to view this order",
        });
      }
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get order details error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching order details",
      error: error.message,
    });
  }
};

// Get shop's orders (for restaurant owner)
export const getShopOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status } = req.query;

    // Find shop owned by this user
    const shop = await Shop.findOne({ owner: userId });

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      });
    }

    // Build query
    const query = { shop: shop._id };
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate("user", "fullName mobile")
      .populate("items.item", "name image category")
      .populate("deliveryBoy", "fullName mobile")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get shop orders error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching shop orders",
      error: error.message,
    });
  }
};

// Update order status (for restaurant owner)
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, pickupOtp } = req.body;
    const userId = req.user._id;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Verify user owns the shop
    const shop = await Shop.findOne({ _id: order.shop, owner: userId });

    if (!shop) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this order",
      });
    }

    // Validate status
    const validStatuses = ["Placed", "Confirmed", "Preparing", "Ready", "Picked", "Delivered", "Cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    order.status = status;

    // Save OTP when marking order as Ready
    if (status === "Ready" && pickupOtp) {
      order.pickupOtp = pickupOtp;
    }

    // Set delivery time if delivered
    if (status === "Delivered") {
      order.actualDeliveryTime = new Date();
      order.paymentStatus = "Paid";
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order status updated",
      order,
    });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating order status",
      error: error.message,
    });
  }
};

// Cancel order (by user)
export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Verify user owns the order
    if (order.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this order",
      });
    }

    // Can only cancel if order is not picked or delivered
    if (["Picked", "Delivered"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel order at this stage",
      });
    }

    order.status = "Cancelled";
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({
      success: false,
      message: "Error cancelling order",
      error: error.message,
    });
  }
};

// Get delivery boy's orders
export const getDeliveryOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status } = req.query;

    // Get both available orders (Ready status, no delivery boy assigned) and assigned orders
    const availableQuery = {
      status: "Ready",
      deliveryBoy: { $exists: false },
    };

    const assignedQuery = { deliveryBoy: userId };
    if (status) {
      assignedQuery.status = status;
    }

    const [availableOrders, assignedOrders] = await Promise.all([
      Order.find(availableQuery)
        .populate("shop", "name phone address images location")
        .populate("user", "fullName mobile")
        .populate("items.item", "name image")
        .sort({ createdAt: -1 }),
      Order.find(assignedQuery)
        .populate("shop", "name phone address images location")
        .populate("user", "fullName mobile")
        .populate("items.item", "name image")
        .sort({ createdAt: -1 }),
    ]);

    res.status(200).json({
      success: true,
      availableOrders,
      assignedOrders,
      count: availableOrders.length + assignedOrders.length,
    });
  } catch (error) {
    console.error("Get delivery orders error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching delivery orders",
      error: error.message,
    });
  }
};

// Assign delivery boy to order (can be called by shop owner OR delivery boy self-assigning)
export const assignDeliveryBoy = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { deliveryBoyId } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if delivery boy is self-assigning (accepting order)
    if (userRole === "deliveryBoy") {
      // Delivery boy can only assign themselves to Ready orders with no delivery boy
      if (order.status !== "Ready") {
        return res.status(400).json({
          success: false,
          message: "Order is not ready for pickup",
        });
      }

      if (order.deliveryBoy) {
        return res.status(400).json({
          success: false,
          message: "Order already assigned to another delivery partner",
        });
      }

      order.deliveryBoy = userId;
    } else {
      // Shop owner assigning a delivery boy
      const shop = await Shop.findOne({ _id: order.shop, owner: userId });

      if (!shop) {
        return res.status(403).json({
          success: false,
          message: "Not authorized",
        });
      }

      order.deliveryBoy = deliveryBoyId;
    }

    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate("shop", "name phone address images location")
      .populate("user", "fullName mobile")
      .populate("deliveryBoy", "fullName mobile")
      .populate("items.item", "name image");

    res.status(200).json({
      success: true,
      message: "Delivery partner assigned",
      order: populatedOrder,
    });
  } catch (error) {
    console.error("Assign delivery boy error:", error);
    res.status(500).json({
      success: false,
      message: "Error assigning delivery partner",
      error: error.message,
    });
  }
};

// Verify pickup OTP and mark order as Picked
export const verifyPickupOtp = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { otp } = req.body;
    const userId = req.user._id;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Verify the delivery boy is assigned to this order
    if (!order.deliveryBoy || order.deliveryBoy.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to pickup this order",
      });
    }

    // Verify order is in Ready status
    if (order.status !== "Ready") {
      return res.status(400).json({
        success: false,
        message: "Order is not ready for pickup",
      });
    }

    // Verify OTP
    if (!order.pickupOtp || order.pickupOtp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // Update order status to Picked
    order.status = "Picked";
    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate("shop", "name phone address images location")
      .populate("user", "fullName mobile")
      .populate("deliveryBoy", "fullName mobile")
      .populate("items.item", "name image");

    res.status(200).json({
      success: true,
      message: "Order picked up successfully",
      order: populatedOrder,
    });
  } catch (error) {
    console.error("Verify pickup OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying OTP",
      error: error.message,
    });
  }
};

// Mark order as delivered (by delivery boy)
export const markOrderDelivered = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Verify the delivery boy is assigned to this order
    if (!order.deliveryBoy || order.deliveryBoy.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this order",
      });
    }

    // Verify order was picked up first
    if (order.status !== "Picked") {
      return res.status(400).json({
        success: false,
        message: "Order must be picked up before marking as delivered",
      });
    }

    // Update order status to Delivered
    order.status = "Delivered";
    order.actualDeliveryTime = new Date();
    order.paymentStatus = "Paid";
    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate("shop", "name phone address images location")
      .populate("user", "fullName mobile")
      .populate("deliveryBoy", "fullName mobile")
      .populate("items.item", "name image");

    res.status(200).json({
      success: true,
      message: "Order delivered successfully",
      order: populatedOrder,
    });
  } catch (error) {
    console.error("Mark order delivered error:", error);
    res.status(500).json({
      success: false,
      message: "Error marking order as delivered",
      error: error.message,
    });
  }
};
