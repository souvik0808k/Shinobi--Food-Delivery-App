import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import { serverUrl } from "../App";
import { addItem } from "../redux/shopSlice";
import { FiCheck, FiPlus } from "react-icons/fi";
import { IoFastFoodOutline } from "react-icons/io5";

function AddItem() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [items, setItems] = useState([]);
  const [currentItem, setCurrentItem] = useState({
    name: "",
    description: "",
    category: "Veg",
    price: "",
    image: "",
    preparationTime: "30",
  });
  const [imagePreview, setImagePreview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = ["Veg", "Non-Veg", "Dessert", "Beverage", "Snack", "Main Course"];

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setCurrentItem({ ...currentItem, image: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const handleAddItem = async () => {
    // Validation
    if (!currentItem.name || !currentItem.price || !currentItem.image) {
      alert("Please fill in all required fields (Name, Price, Image)");
      return;
    }

    if (currentItem.price <= 0) {
      alert("Price must be greater than 0");
      return;
    }

    try {
      const response = await axios.post(
        `${serverUrl}/api/item/create`,
        {
          name: currentItem.name,
          description: currentItem.description,
          category: currentItem.category,
          price: parseFloat(currentItem.price),
          image: currentItem.image,
          preparationTime: parseInt(currentItem.preparationTime),
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        // Add to local items list
        setItems([...items, response.data.item]);
        
        // Add to Redux
        dispatch(addItem(response.data.item));

        // Reset form
        setCurrentItem({
          name: "",
          description: "",
          category: "Veg",
          price: "",
          image: "",
          preparationTime: "30",
        });
        setImagePreview("");

        alert("Item added successfully!");
      }
    } catch (error) {
      console.error("Error adding item:", error);
      const errorMsg = error.response?.data?.message || "Failed to add item. Please try again.";
      alert(errorMsg);
    }
  };

  const handleFinish = () => {
    if (items.length === 0) {
      if (!window.confirm("You haven't added any items yet. Are you sure you want to finish?")) {
        return;
      }
    }
    navigate("/dashboard/owner");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              Add Food Items
            </h1>
            <p className="text-gray-600 mt-2">
              Add your menu items to start receiving orders
            </p>
          </div>
          <button
            onClick={handleFinish}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
          >
            Finish & Go to Dashboard
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add Item Form */}
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <IoFastFoodOutline className="text-orange-500" />
              Add New Item
            </h2>

            <div className="space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Food Image *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-orange-500 transition-all cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="item-image"
                  />
                  <label htmlFor="item-image" className="cursor-pointer">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="py-8">
                        <FiPlus className="text-4xl text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">Click to upload image</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Item Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Item Name *
                </label>
                <input
                  type="text"
                  value={currentItem.name}
                  onChange={(e) =>
                    setCurrentItem({ ...currentItem, name: e.target.value })
                  }
                  placeholder="e.g., Butter Chicken"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={currentItem.description}
                  onChange={(e) =>
                    setCurrentItem({ ...currentItem, description: e.target.value })
                  }
                  placeholder="Describe your dish..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Category & Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={currentItem.category}
                    onChange={(e) =>
                      setCurrentItem({ ...currentItem, category: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    value={currentItem.price}
                    onChange={(e) =>
                      setCurrentItem({ ...currentItem, price: e.target.value })
                    }
                    placeholder="0"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Preparation Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preparation Time (minutes)
                </label>
                <input
                  type="number"
                  value={currentItem.preparationTime}
                  onChange={(e) =>
                    setCurrentItem({
                      ...currentItem,
                      preparationTime: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Add Button */}
              <button
                onClick={handleAddItem}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <FiPlus /> Add Item
              </button>
            </div>
          </div>

          {/* Items List */}
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <FiCheck className="text-green-500" />
              Added Items ({items.length})
            </h2>

            {items.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <IoFastFoodOutline className="text-6xl mx-auto mb-4 opacity-50" />
                <p className="text-lg">No items added yet</p>
                <p className="text-sm mt-2">Start adding your menu items</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-xl p-4 flex gap-4 hover:shadow-md transition-all"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{item.name}</h3>
                      <p className="text-sm text-gray-600 line-clamp-1">
                        {item.description || "No description"}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-medium">
                          {item.category}
                        </span>
                        <span className="font-bold text-orange-600">
                          ₹{item.price}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddItem;
