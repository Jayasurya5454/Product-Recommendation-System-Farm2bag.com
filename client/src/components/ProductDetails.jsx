import React, { useEffect, useState } from "react";
import { X, Star, ShoppingCart, Heart } from "lucide-react";
import { useAppContext } from "./AppContext"; // Context for cart & favourites
import { axiosInstance } from "../utils/axios"; // Axios instance for API calls
import { auth } from "../../firebase"; // Firebase authentication
import { v4 as uuidv4 } from "uuid"; // Unique session ID generator

const ProductDetails = ({ product, isOpen, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const { addToCart, toggleFavorite, isProductFavorite } = useAppContext();
  const [userId, setUserId] = useState(null);
  const [sessionId, setSessionId] = useState(() => uuidv4());

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) setUserId(user.uid);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isOpen && product && userId) {
      sendEvent("view");
    }
  }, [isOpen, product, userId]);

  const getDeviceType = () => {
    const userAgent = navigator.userAgent;
    if (/Mobi|Android/i.test(userAgent)) return "mobile";
    if (/iPad|Tablet/i.test(userAgent)) return "tablet";
    return "desktop";
  };

  const getTimeOfDay = () => {
    const hours = new Date().getHours();
    if (hours >= 5 && hours < 12) return "morning";
    if (hours >= 12 && hours < 17) return "afternoon";
    if (hours >= 17 && hours < 21) return "evening";
    return "night";
  };

  const sendEvent = async (eventType) => {
    if (!userId || !product) return;

    const eventData = {
      userId,
      productId: product.id,
      eventType,
      context: {
        device: getDeviceType(),
        timeOfDay: getTimeOfDay()
      },
      sessionId
    };

    try {
      const response = await axiosInstance.post("/event", eventData);
      console.log(`Event "${eventType}" sent successfully!`, response.data);
    } catch (error) {
      console.error("Error sending event:", error.response ? error.response.data : error.message);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    sendEvent("add_to_cart");
    alert(`${quantity} ${product.name} added to cart!`);
  };

  const handleToggleFavorite = () => {
    toggleFavorite(product);
    sendEvent("favourite");
  };

  const handleIncrement = () => setQuantity((prev) => prev + 1);
  const handleDecrement = () => setQuantity((prev) => (prev > 1 ? prev - 1 : prev));

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
         style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}>
      <div className="bg-white w-full max-w-4xl rounded-lg shadow-xl overflow-hidden relative">
        <button onClick={onClose}
                className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full z-10">
          <X size={24} />
        </button>

        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/2 p-8 flex items-center justify-center bg-gray-50">
            <img src={product.image} alt={product.name} className="w-full max-w-md h-auto object-contain" />
          </div>

          <div className="md:w-1/2 p-8">
            <h2 className="text-2xl font-bold mb-2">{product.name}</h2>

            <div className="flex items-center mb-4">
              <p className="text-2xl font-bold text-emerald-600">₹{product.price}.00</p>
              <p className="ml-2 text-gray-500">/ 1-PS</p>
            </div>

            <div className="flex items-center mb-6">
              <div className="flex mr-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={16}
                        className={star <= 4 ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
                ))}
              </div>
              <span className="text-gray-600 text-sm">(4.0)</span>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-gray-600">
                Fresh {product.name} sourced directly from local farms. No pesticides used.
                Rich in nutrients and perfect for your daily cooking needs.
              </p>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-2">Quantity</h3>
              <div className="flex items-center border rounded-md w-fit">
                <button onClick={handleDecrement} className="px-4 py-2 text-gray-600 hover:bg-gray-100">-</button>
                <span className="px-4 py-2 border-x">{quantity}</span>
                <button onClick={handleIncrement} className="px-4 py-2 text-gray-600 hover:bg-gray-100">+</button>
              </div>
            </div>

            <div className="flex space-x-4">
              <button onClick={handleAddToCart}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-6 rounded-md font-medium flex items-center justify-center">
                <ShoppingCart size={20} className="mr-2" />
                Add to Cart
              </button>

              <button onClick={handleToggleFavorite}
                      className="p-3 border border-gray-300 rounded-md hover:bg-gray-50">
                <Heart size={20}
                       fill={isProductFavorite(product.id) ? "#02B290" : "none"}
                       stroke={isProductFavorite(product.id) ? "#02B290" : "currentColor"} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;


