import React, { useEffect, useState } from "react";
import { X, Star, ShoppingCart, Heart, ChevronLeft, ExternalLink, Share2 } from "lucide-react";
import { useAppContext } from "./AppContext"; // Context for cart & favourites
import { axiosInstance } from "../utils/axios"; // Axios instance for API calls
import { auth } from "../../firebase"; // Firebase authentication
import { v4 as uuidv4 } from "uuid"; // Unique session ID generator
import { Link, useNavigate } from "react-router-dom"; // For navigation

const ProductDetails = ({ product, isOpen, onClose, isModal = true }) => {
  const [quantity, setQuantity] = useState(1);
  const { addToCart, toggleFavorite, isProductFavorite } = useAppContext();
  const [userId, setUserId] = useState(null);
  const [sessionId, setSessionId] = useState(() => uuidv4());
  const [relatedProducts, setRelatedProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) setUserId(user.uid);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if ((isOpen || !isModal) && product && userId) {
      sendEvent("view");
      
      // Fetch related products
      if (product.category) {
        fetchRelatedProducts(product.category, product.id);
      }
    }
  }, [isOpen, product, userId, isModal]);

  const fetchRelatedProducts = async (category, currentProductId) => {
    try {
      const response = await axiosInstance.get(`/products?category=${category}&limit=4`);
      // Filter out current product
      const filtered = response.data.filter(item => item.id !== currentProductId);
      setRelatedProducts(filtered.slice(0, 3)); // Show max 3 related products
    } catch (error) {
      console.error("Error fetching related products:", error);
    }
  };

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

  const handleViewDetailsPage = () => {
    if (isModal) {
      onClose();
      navigate(`/product/${product.id}`);
      sendEvent("navigation_to_details");
    }
  };

  const handleShareProduct = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out this ${product.name}!`,
        url: `${window.location.origin}/product/${product.id}`,
      })
      .then(() => sendEvent("share"))
      .catch(error => console.log('Error sharing', error));
    } else {
      // Fallback for browsers that don't support navigator.share
      const url = `${window.location.origin}/product/${product.id}`;
      navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
      sendEvent("copy_link");
    }
  };

  // Render different layouts for modal vs. full page
  const renderContent = () => (
    <>
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/2 p-8 flex items-center justify-center bg-gray-50">
          <img src={product.image} alt={product.name} className="w-full max-w-md h-auto object-contain" />
        </div>

        <div className="md:w-1/2 p-8">
          {!isModal && (
            <div className="mb-4">
              <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-gray-900">
                <ChevronLeft size={20} />
                <span>Back to Products</span>
              </button>
            </div>
          )}

          <h2 className="text-2xl font-bold mb-2">{product.name}</h2>

          <div className="flex items-center mb-4">
            <p className="text-2xl font-bold text-emerald-600">₹{product.price}.00</p>
            <p className="ml-2 text-gray-500">/ 1-PS</p>
          </div>

          {product.rating && (
            <div className="flex items-center mb-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={18}
                    fill={star <= product.rating ? "#FFB800" : "none"}
                    stroke={star <= product.rating ? "#FFB800" : "#D1D5DB"}
                  />
                ))}
              </div>
              <span className="ml-2 text-gray-600">{product.reviewCount || 0} reviews</span>
            </div>
          )}

          <div className="mb-6">
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-gray-600">
              Fresh {product.name} sourced directly from local farms. No pesticides used.
              Rich in nutrients and perfect for your daily cooking needs.
            </p>
          </div>

          {product.availability && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Availability</h3>
              <p className={`${product.availability === 'In Stock' ? 'text-green-600' : 'text-red-600'}`}>
                {product.availability}
              </p>
            </div>
          )}

          {product.details && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Details</h3>
              <ul className="list-disc list-inside text-gray-600">
                {product.details.map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mb-6">
            <h3 className="font-semibold mb-2">Quantity</h3>
            <div className="flex items-center border rounded-md w-fit">
              <button onClick={handleDecrement} className="px-4 py-2 text-gray-600 hover:bg-gray-100">-</button>
              <span className="px-4 py-2 border-x">{quantity}</span>
              <button onClick={handleIncrement} className="px-4 py-2 text-gray-600 hover:bg-gray-100">+</button>
            </div>
          </div>

          <div className="flex space-x-4 mb-6">
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
            
            <button onClick={handleShareProduct}
                  className="p-3 border border-gray-300 rounded-md hover:bg-gray-50">
              <Share2 size={20} />
            </button>
          </div>

          {isModal && (
            <button 
              onClick={handleViewDetailsPage} 
              className="cursor-pointer w-full flex items-center justify-center text-emerald-600 hover:text-emerald-700 py-2"
            >
              <ExternalLink size={16} className="mr-2" />
              More Details
            </button>
          )}
        </div>
      </div>

      {!isModal && relatedProducts.length > 0 && (
        <div className="p-8 border-t">
          <h3 className="text-xl font-bold mb-4">Related Products</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {relatedProducts.map(relatedProduct => (
              <div key={relatedProduct.id} className="border rounded-lg overflow-hidden">
                <Link to={`/product/${relatedProduct.id}`} className="block">
                  <div className="h-48 bg-gray-50 flex items-center justify-center">
                    <img 
                      src={relatedProduct.image} 
                      alt={relatedProduct.name} 
                      className="h-full object-contain" 
                    />
                  </div>
                  <div className="p-4">
                    <h4 className="font-medium">{relatedProduct.name}</h4>
                    <p className="text-emerald-600 font-bold mt-1">₹{relatedProduct.price}.00</p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );

  // For modal view
  if (isModal) {
    if (!isOpen || !product) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
           style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}>
        <div className="bg-white w-full max-w-4xl rounded-lg shadow-xl overflow-hidden relative">
          <button onClick={onClose}
                  className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full z-10">
            <X size={24} />
          </button>
          {renderContent()}
        </div>
      </div>
    );
  }

  // For full page view
  if (!product) return <div className="p-8">Product not found</div>;
  
  return (
    <div className="container mx-auto py-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
};

export default ProductDetails;