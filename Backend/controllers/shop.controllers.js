import Shop from "../models/shop.model.js";
import User from "../models/user.model.js";

// Create new shop
export const createShop = async (req, res) => {
  try {
    const userId = req.user._id;

    // Check if user already has a shop
    const existingShop = await Shop.findOne({ owner: userId });
    if (existingShop) {
      return res.status(400).json({
        success: false,
        message: "You already have a shop registered",
      });
    }

    const {
      name,
      description,
      phone,
      address,
      city,
      zipCode,
      latitude,
      longitude,
      images,
      openTime,
      closeTime,
    } = req.body;

    // Validate required fields
    if (
      !name ||
      !phone ||
      !address ||
      !city ||
      !latitude ||
      !longitude ||
      !openTime ||
      !closeTime
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Create shop
    const shop = await Shop.create({
      owner: userId,
      name,
      description,
      phone,
      address,
      city,
      zipCode,
      location: {
        latitude,
        longitude,
      },
      images: images || [],
      openTime,
      closeTime,
    });

    res.status(201).json({
      success: true,
      message: "Shop created successfully",
      shop,
    });
  } catch (error) {
    console.error("Create shop error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating shop",
      error: error.message,
    });
  }
};

// Get owner's shop
export const getMyShop = async (req, res) => {
  try {
    const userId = req.user._id;

    const shop = await Shop.findOne({ owner: userId }).populate(
      "owner",
      "fullName email"
    );

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "No shop found",
        hasShop: false,
      });
    }

    res.status(200).json({
      success: true,
      shop,
      hasShop: true,
    });
  } catch (error) {
    console.error("Get shop error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching shop",
      error: error.message,
    });
  }
};

// Update shop
export const updateShop = async (req, res) => {
  try {
    const userId = req.user._id;
    const updateData = req.body;

    const shop = await Shop.findOne({ owner: userId });

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      });
    }

    // Update shop fields
    Object.keys(updateData).forEach((key) => {
      if (key === "latitude" || key === "longitude") {
        shop.location[key] = updateData[key];
      } else {
        shop[key] = updateData[key];
      }
    });

    await shop.save();

    res.status(200).json({
      success: true,
      message: "Shop updated successfully",
      shop,
    });
  } catch (error) {
    console.error("Update shop error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating shop",
      error: error.message,
    });
  }
};

// Get shop by ID (for users browsing)
export const getShopById = async (req, res) => {
  try {
    const { shopId } = req.params;

    const shop = await Shop.findById(shopId).populate(
      "owner",
      "fullName email"
    );

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      });
    }

    res.status(200).json({
      success: true,
      shop,
    });
  } catch (error) {
    console.error("Get shop by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching shop",
      error: error.message,
    });
  }
};

// Get all shops (with filters)
export const getAllShops = async (req, res) => {
  try {
    const { city, isActive } = req.query;

    const filter = {};
    if (city) filter.city = city;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const shops = await Shop.find(filter).populate("owner", "fullName email");

    res.status(200).json({
      success: true,
      count: shops.length,
      shops,
    });
  } catch (error) {
    console.error("Get all shops error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching shops",
      error: error.message,
    });
  }
};

// Toggle shop active status
export const toggleShopStatus = async (req, res) => {
  try {
    const userId = req.user._id;

    const shop = await Shop.findOne({ owner: userId });

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      });
    }

    shop.isActive = !shop.isActive;
    await shop.save();

    res.status(200).json({
      success: true,
      message: `Shop ${shop.isActive ? "activated" : "deactivated"} successfully`,
      shop,
    });
  } catch (error) {
    console.error("Toggle shop status error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating shop status",
      error: error.message,
    });
  }
};
