import React, { useState, useEffect } from "react";
import { Plus, Minus, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import ProductDetails from "./ProductDetails";
import { useAppContext } from "./AppContext";
import axios from "axios";
import { auth } from "../../firebase";
import { v4 as uuidv4 } from "uuid";

const FreshDaily = () => {
  // Use app context for cart and favorites
  const { addToCart, toggleFavorite, isProductFavorite } = useAppContext();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [userId, setUserId] = useState(null);
  const [sessionId] = useState(() => uuidv4());

  // Get backend URL from environment variables
  const backendUrl = import.meta.env.VITE_MODEL_BACKEND;

  // Get user ID on component mount
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) setUserId(user.uid);
    });

    return () => unsubscribe();
  }, []);

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      if (!userId) {
        console.warn("User ID is null. Skipping product fetch.");
        return;
      }

      try {
        setLoading(true);
        console.log("Fetching products from:", backendUrl);

        const response = await axios.get(`${backendUrl}/${userId}`);

        // Transform backend data to match component needs
        const formattedProducts = response.data.map((product) => ({
          id: product._id,
          name: product.title,
          price: product.price,
          image: product.photos,
          unit: `1-${product.category === "Fruits" || product.category === "Vegetables" ? "KG" : "PS"}`,
          description: product.description,
          category: product.category,
          nutritionalInfo: product.nutritionalInfo,
          healthConditions: product.healthConditions,
          seasonal: product.seasonal,
          discount: product.discount,
        }));
        setProducts(formattedProducts);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [backendUrl, userId]);



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

  const sendEvent = async (product, eventType) => {
    if (!userId || !product) return;

    const eventData = {
      userId,
      productId: product.id,
      eventType,
      context: {
        device: getDeviceType(),
        timeOfDay: getTimeOfDay(),
        page: "fresh-daily"
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

  const handleToggleFavorite = (product, e) => {
    e.stopPropagation();
    toggleFavorite(product);
    sendEvent(product, "favourite");
  };

  const toggleCounter = (product, e) => {
    e.stopPropagation();
    
    // If quantity doesn't exist, set it to 1, otherwise toggle it off
    setQuantities((prev) => {
      if (!prev[product.id]) {
        return { ...prev, [product.id]: 1 };
      }
      const newQuantities = { ...prev };
      delete newQuantities[product.id];
      return newQuantities;
    });
    
    // If we're setting a quantity of 1, also add to cart
    if (!quantities[product.id]) {
      addToCart(product, 1);
      sendEvent(product, "add_to_cart");
    }
  };

  const handleIncrement = (product, e) => {
    e.stopPropagation();
    setQuantities((prev) => ({
      ...prev,
      [product.id]: (prev[product.id] || 1) + 1,
    }));
  };

  const handleDecrement = (product, e) => {
    e.stopPropagation();
    setQuantities((prev) => {
      const newQuantity = (prev[product.id] || 1) - 1;
      if (newQuantity < 1) {
        const updated = { ...prev };
        delete updated[product.id];
        return updated;
      }
      return { ...prev, [product.id]: newQuantity };
    });
  };

  const openProductDetails = (product) => {
    setSelectedProduct(product);
    setIsDetailsOpen(true);
    sendEvent(product, "view");
  };

  const closeProductDetails = () => {
    setIsDetailsOpen(false);
  };

  if (loading) {
    return (
      <div className="py-10 px-4 mt-4 mx-auto text-center">
        <div className="container mx-auto">
          <h2 className="text-2xl font-semibold">Fresh Daily</h2>
          <p className="text-gray-600 mb-6 mt-4">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-10 px-4 mt-4 mx-auto text-center">
        <div className="container mx-auto">
          <h2 className="text-2xl font-semibold">Fresh Daily</h2>
          <p className="text-red-500 mb-6 mt-4">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 px-4 mt-4 mx-auto text-center">
      <div className="container mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">Fresh Daily</h2>
          <p className="text-gray-600 mb-6 mt-4 text-lg">
            Order now for fresh and natural, 100% chemical-free, organic seasonal produce—safe and healthy!
          </p>
        </div>
        
        {products.length === 0 ? (
          <p className="text-gray-500">No products available at the moment.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {products.map((product) => (
              <div 
                key={product.id}
                className="border relative group rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white cursor-pointer"
                onClick={() => openProductDetails(product)}
              >
                <div className="relative overflow-hidden p-4">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-40 mx-auto transition-transform group-hover:scale-110 object-cover rounded-lg"
                  />
                  
                  {!quantities[product.id] ? (
                    <button
                      onClick={(e) => toggleCounter(product, e)}
                      className="absolute bottom-0 right-2 bg-emerald-600 text-white rounded-full p-2 "
                    >
                      <Plus size={24} />
                    </button>
                  ) : (
                    <div className="absolute bottom-0 right-12 flex items-center bg-white shadow-lg rounded-md p-2">
                      <button 
                        onClick={(e) => handleDecrement(product, e)} 
                        className="p-2 text-gray-700 hover:text-black hover:bg-gray-200 rounded-full"
                      >
                        <Minus size={20} />
                      </button>
                      <span className="mx-4 text-sm font-semibold">{quantities[product.id]}</span>
                      <button 
                        onClick={(e) => handleIncrement(product, e)} 
                        className="p-2 text-gray-700 hover:text-black hover:bg-gray-200 rounded-full"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="p-4 pt-0">
                  <p className="font-bold text-lg text-emerald-600">₹{product.price.toFixed(2)}</p>
                  <h3 className="mt-2 font-medium text-gray-900 truncate">{product.name}</h3>
                  <p className="text-gray-500 text-sm">{product.unit}</p>
                  
                  <div className="mt-2 flex justify-between items-center">
                    <button
                      onClick={(e) => handleToggleFavorite(product, e)}
                      className="text-gray-400 hover:text-emerald-600 transition-colors"
                    >
                      <Heart 
                        size={20} 
                        fill={isProductFavorite(product.id) ? "#02B290" : "none"}
                        stroke={isProductFavorite(product.id) ? "#02B290" : "currentColor"}
                      />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product Details Modal */}
      {isDetailsOpen && selectedProduct && (
        <ProductDetails
          product={selectedProduct}
          isOpen={isDetailsOpen}
          onClose={closeProductDetails}
        />
      )}
    </div>
  );
};

export default FreshDaily;