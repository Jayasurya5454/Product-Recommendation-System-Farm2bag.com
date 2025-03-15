import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ShoppingCart, Heart, ArrowLeft } from "lucide-react";
import { useAppContext } from "../components/AppContext";
import { axiosInstance } from "../utils/axios";
import { auth } from "../../firebase";
import { v4 as uuidv4 } from "uuid";
import Navbar from "./NavbarPage";

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleFavorite, isProductFavorite } = useAppContext();
  
  const [product, setProduct] = useState(null);
  const [complementaryProducts, setComplementaryProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [userId, setUserId] = useState(null);
  const [sessionId, setSessionId] = useState(() => uuidv4());

  // Handle authentication
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) setUserId(user.uid);
    });

    return () => unsubscribe();
  }, []);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/product/${id}`);
        
        // Transform the product data to match the expected structure
        const transformedProduct = {
          ...response.data,
          id: response.data._id,  // Make sure we have id property for compatibility
          name: response.data.title, // Map title to name for compatibility
          image: response.data.photos // Map photos to image for compatibility
        };
        
        setProduct(transformedProduct);
        
        // If we have complementary products names, fetch them one by one
        if (response.data.complementaryProducts && response.data.complementaryProducts.length > 0) {
          fetchComplementaryProducts(response.data.complementaryProducts);
        }
      } catch (err) {
        setError("Failed to fetch product. Please try again later.");
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

 
  const fetchComplementaryProducts = async (productNames) => {
    try {
      const compProducts = [];
      
      // Fetch each complementary product individually by name
      for (const productName of productNames) {
        try {
          // Use the existing search endpoint with description parameter
          const response = await axiosInstance.get('/product/search', {
            params: { description: productName }
          });
          
          console.log(`Search results for ${productName}:`, response.data);
          
          // Find the exact match or closest match
          const matchedProduct = response.data.find(
            product => product.title.toLowerCase() === productName.toLowerCase()
          ) || response.data[0]; // Take first result if no exact match
          
          if (matchedProduct) {
            compProducts.push({
              ...matchedProduct,
              id: matchedProduct._id,
              name: matchedProduct.title,
              image: matchedProduct.photos
            });
          }
        } catch (error) {
          console.error(`Error fetching complementary product ${productName}:`, error);
        }
      }
      
      if (compProducts.length > 0) {
        setComplementaryProducts(compProducts);
      }
    } catch (err) {
      console.error("Error in fetchComplementaryProducts:", err);
    }
  };

  // Send view event when product loads
  useEffect(() => {
    if (product && userId) {
      sendEvent("view");
    }
  }, [product, userId]);

  // Event tracking functions
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
      productId: product.id, // Using id instead of _id
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

  // Handlers
  const handleAddToCart = () => {
    if (!product) return;
    
    addToCart(product, quantity);
    sendEvent("add_to_cart");
    alert(`${quantity} ${product.name} added to cart!`);
  };

  const handleToggleFavorite = (productId, productObj = null) => {
    if (!productId) return;
    
    // Determine product data source based on context
    let productData;
    
    // If we're dealing with a product object that was passed in
    if (productObj) {
      productData = {
        id: productId,
        name: productObj.title || productObj.name, // Handle both title and name
        price: productObj.price,
        image: productObj.photos || productObj.image // Handle both photos and image
      };
    } 
    // If it's the main product
    else if (product && productId === product.id) {
      productData = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image
      };
    } 
    // If it's a complementary product
    else {
      const complementaryProduct = complementaryProducts.find(p => p.id === productId);
      if (complementaryProduct) {
        productData = {
          id: complementaryProduct.id,
          name: complementaryProduct.name,
          price: complementaryProduct.price,
          image: complementaryProduct.image
        };
      } else {
        // If we can't find the product but we're trying to remove it (it's already a favorite)
        if (isProductFavorite(productId)) {
          // Just pass the ID for removal
          productData = { id: productId };
        } else {
          console.error("Cannot add product to favorites: insufficient data");
          return;
        }
      }
    }
    
    toggleFavorite(productData);
    sendEvent("favourite");
  };

  const handleIncrement = () => setQuantity((prev) => prev + 1);
  
  const handleDecrement = () => setQuantity((prev) => (prev > 1 ? prev - 1 : prev));

  const handleNavigateToProduct = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleAddComplementaryToCart = (event, complementaryProduct) => {
    event.stopPropagation(); // Prevent navigating to the product page
    addToCart(complementaryProduct, 1);
    alert(`${complementaryProduct.name} added to cart!`);
    
    // Track the event using the standard "add_to_cart" event type
    if (userId && complementaryProduct) {
      const eventData = {
        userId,
        productId: complementaryProduct.id,
        eventType: "add_to_cart",
        context: {
          device: getDeviceType(),
          timeOfDay: getTimeOfDay(),
          referringProductId: product.id // Still track the referring product in context
        },
        sessionId
      };
      
      try {
        axiosInstance.post("/event", eventData);
      } catch (error) {
        console.error("Error sending complementary product event:", error);
      }
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  if (error || !product) return <div className="flex justify-center items-center h-screen">{error || "Product not found"}</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-30">
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center text-emerald-600 hover:text-emerald-700 mb-6"
        >
          <ArrowLeft size={20} className="mr-2" />
          Home
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="flex flex-col md:flex-row">
            {/* Product Image */}
            <div className="md:w-1/2 p-8 flex items-center justify-center bg-gray-50">
              <img 
                src={product.image || "https://via.placeholder.com/300x200?text=No+Image"} 
                alt={product.name} 
                className="w-full max-w-md h-auto object-contain"
              />
            </div>

            {/* Product Information */}
            <div className="md:w-1/2 p-8">
              <h2 className="text-2xl font-bold mb-2">{product.name}</h2>

              <div className="flex items-center mb-4">
                <p className="text-2xl font-bold text-emerald-600">₹{product.price?.toFixed(2)}</p>
                {product.discount > 0 && (
                  <span className="ml-2 bg-red-100 text-red-600 px-2 py-1 rounded text-sm">
                    {product.discount}% OFF
                  </span>
                )}
              </div>

              <div className="mb-6">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-600">{product.description}</p>
              </div>

              {/* Nutritional Information */}
              {product.nutritionalInfo && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Nutritional Information</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {product.nutritionalInfo.calories && (
                      <p className="text-gray-600">Calories: {product.nutritionalInfo.calories}</p>
                    )}
                    {product.nutritionalInfo.protein && (
                      <p className="text-gray-600">Protein: {product.nutritionalInfo.protein}g</p>
                    )}
                    {product.nutritionalInfo.fiber && (
                      <p className="text-gray-600">Fiber: {product.nutritionalInfo.fiber}g</p>
                    )}
                  </div>
                  {product.nutritionalInfo.vitamins && product.nutritionalInfo.vitamins.length > 0 && (
                    <p className="text-gray-600 mt-2">
                      Vitamins: {product.nutritionalInfo.vitamins.join(", ")}
                    </p>
                  )}
                </div>
              )}

              {/* Health Benefits */}
              {product.healthConditions && product.healthConditions.length > 0 && product.healthConditions[0] !== 'none' && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Good For</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.healthConditions.map((condition) => (
                      <span key={condition} className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded text-sm">
                        {condition.charAt(0).toUpperCase() + condition.slice(1)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Seasonal Information */}
              {product.seasonal && product.seasonal.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Best Season</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.seasonal.map((season) => (
                      <span key={season} className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-sm">
                        {season.charAt(0).toUpperCase() + season.slice(1)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-semibold mb-2">Quantity</h3>
                <div className="flex items-center border rounded-md w-fit">
                  <button 
                    onClick={handleDecrement} 
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border-x">{quantity}</span>
                  <button 
                    onClick={handleIncrement} 
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {product.quantity > 10 
                    ? "In Stock" 
                    : product.quantity > 0 
                      ? `Only ${product.quantity} left in stock!` 
                      : "Out of Stock"}
                </p>
              </div>

              <div className="flex space-x-4">
                <button 
                  onClick={handleAddToCart}
                  disabled={product.quantity <= 0}
                  className={`flex-1 ${
                    product.quantity > 0 
                      ? "bg-emerald-600 hover:bg-emerald-700" 
                      : "bg-gray-400 cursor-not-allowed"
                  } text-white py-3 px-6 rounded-md font-medium flex items-center justify-center`}
                >
                  <ShoppingCart size={20} className="mr-2" />
                  Add to Cart
                </button>

                <button 
                  onClick={() => handleToggleFavorite(product.id, product)}
                  className="p-3 border border-gray-300 rounded-md hover:bg-gray-50"
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
        </div>

        {/* Complementary Products Section */}
        {product.complementaryProducts && product.complementaryProducts.length > 0 && (
          <div className="bg-white rounded-md shadow-sm overflow-hidden mb-8 mx-auto w-full max-w-7xl">
            <div className="p-6">
              <h3 className="text-xl font-bold mb-4">Frequently Bought Together</h3>
              
              {complementaryProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {complementaryProducts.map((complementaryProduct) => (
                    <div
                      key={complementaryProduct.id}
                      className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleNavigateToProduct(complementaryProduct.id)}
                    >
                      <div className="h-40 bg-gray-50 flex items-center justify-center p-4">
                        <img
                          src={complementaryProduct.image || "https://via.placeholder.com/150x150?text=No+Image"}
                          alt={complementaryProduct.name}
                          className="h-full object-contain"
                        />
                      </div>
                      <div className="p-4">
                        <h4 className="font-medium text-sm mb-1 truncate">{complementaryProduct.name}</h4>
                        <p className="text-emerald-600 font-bold mb-2">₹{complementaryProduct.price?.toFixed(2)}</p>
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddComplementaryToCart(e, complementaryProduct);
                            }}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-md font-medium flex items-center justify-center"
                          >
                            <ShoppingCart size={18} className="mr-2" />
                            Add to Cart
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleFavorite(complementaryProduct.id, complementaryProduct);
                            }}
                            className="p-2 border border-gray-300 rounded-md hover:bg-gray-50"
                          >
                            <Heart
                              size={18}
                              fill={isProductFavorite(complementaryProduct.id) ? "#02B290" : "none"}
                              stroke={isProductFavorite(complementaryProduct.id) ? "#02B290" : "currentColor"}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <p>Loading complementary products...</p>
                </div>
              )}
              
              {/* Fallback display of complementary product names if products can't be fetched */}
              {complementaryProducts.length === 0 && product.complementaryProducts.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  <p className="text-gray-600 mr-2">Pairs well with:</p>
                  {product.complementaryProducts.map((productName) => (
                    <span key={productName} className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded text-sm">
                      {productName}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductPage;