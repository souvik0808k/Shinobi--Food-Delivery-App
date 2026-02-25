import Item from "../models/item.model.js";
import Shop from "../models/shop.model.js";

// Create new item
export const createItem = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find owner's shop
    const shop = await Shop.findOne({ owner: userId });
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Please create a shop first",
      });
    }

    const {
      name,
      description,
      category,
      price,
      image,
      preparationTime,
      inStock,
    } = req.body;

    // Validate required fields
    if (!name || !category || !price || !image) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Create item
    const item = await Item.create({
      shop: shop._id,
      name,
      description,
      category,
      price,
      image,
      preparationTime: preparationTime || 30,
      inStock: inStock !== undefined ? inStock : true,
    });

    res.status(201).json({
      success: true,
      message: "Item added successfully",
      item,
    });
  } catch (error) {
    console.error("Create item error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating item",
      error: error.message,
    });
  }
};

// Get all items for owner's shop
export const getMyItems = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find owner's shop
    const shop = await Shop.findOne({ owner: userId });
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      });
    }

    const items = await Item.find({ shop: shop._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: items.length,
      items,
    });
  } catch (error) {
    console.error("Get items error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching items",
      error: error.message,
    });
  }
};

// Get items by shop ID (for users browsing)
export const getItemsByShop = async (req, res) => {
  try {
    const { shopId } = req.params;

    const items = await Item.find({ shop: shopId, isActive: true }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: items.length,
      items,
    });
  } catch (error) {
    console.error("Get items by shop error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching items",
      error: error.message,
    });
  }
};

// Get single item
export const getItemById = async (req, res) => {
  try {
    const { itemId } = req.params;

    const item = await Item.findById(itemId).populate("shop", "name city");

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    res.status(200).json({
      success: true,
      item,
    });
  } catch (error) {
    console.error("Get item by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching item",
      error: error.message,
    });
  }
};

// Update item
export const updateItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { itemId } = req.params;
    const updateData = req.body;

    // Find owner's shop
    const shop = await Shop.findOne({ owner: userId });
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      });
    }

    // Find item and verify ownership
    const item = await Item.findOne({ _id: itemId, shop: shop._id });
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    // Update item fields
    Object.keys(updateData).forEach((key) => {
      item[key] = updateData[key];
    });

    await item.save();

    res.status(200).json({
      success: true,
      message: "Item updated successfully",
      item,
    });
  } catch (error) {
    console.error("Update item error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating item",
      error: error.message,
    });
  }
};

// Delete item
export const deleteItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { itemId } = req.params;

    // Find owner's shop
    const shop = await Shop.findOne({ owner: userId });
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      });
    }

    // Find and delete item
    const item = await Item.findOneAndDelete({ _id: itemId, shop: shop._id });
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Item deleted successfully",
    });
  } catch (error) {
    console.error("Delete item error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting item",
      error: error.message,
    });
  }
};

// Toggle item stock status
export const toggleItemStock = async (req, res) => {
  try {
    const userId = req.user._id;
    const { itemId } = req.params;

    // Find owner's shop
    const shop = await Shop.findOne({ owner: userId });
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: "Shop not found",
      });
    }

    // Find item and verify ownership
    const item = await Item.findOne({ _id: itemId, shop: shop._id });
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found",
      });
    }

    item.inStock = !item.inStock;
    await item.save();

    res.status(200).json({
      success: true,
      message: `Item ${item.inStock ? "in stock" : "out of stock"}`,
      item,
    });
  } catch (error) {
    console.error("Toggle item stock error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating item stock",
      error: error.message,
    });
  }
};
