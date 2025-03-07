import React, { useState } from "react";
import { Plus, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import ProductDetails from "./ProductDetails"; // Import the ProductDetails component

// You would replace these with your actual imports
import mushroom from "../assets/products/Musrom.webp";
import orange from "../assets/products/orange.webp";
import egg from "../assets/products/egg.webp";
import redRice from "../assets/products/red-rice.webp";
import banana from "../assets/products/banana.webp";
import mango from "../assets/products/mango.webp";

const products = [
  { id: 1, name: "Mushroom/காளான்", price: 50.00, image: mushroom, unit: "1-PS" },
  { id: 2, name: "Orange Peel Herbal Soap", price: 120.00, image: orange, unit: "1-PS" },
  { id: 3, name: "Country Egg (naatu Koli Muttai)", price: 14.00, image: egg, unit: "1-PS" },
  { id: 4, name: "Red Rice", price: 107.00, image: redRice, unit: "1-KG" },
  { id: 5, name: "Hill Banana (malai Vaalai)", price: 150.00, image: banana, unit: "1-KG" },
  { id: 6, name: "Vadu Mangai", price: 112.50, image: mango, unit: "250-G" }
];

const FreshDaily = ({ onAddToCart }) => {
  const [favorites, setFavorites] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const toggleFavorite = (productId, e) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId) 
        : [...prev, productId]
    );
  };

  const handleAddToCart = (product, e) => {
    e.stopPropagation();
    
    // Set default quantity if not already set
    if (!quantities[product.id]) {
      setQuantities((prev) => ({
        ...prev,
        [product.id]: 1,
      }));
    }
    
    // Call the onAddToCart prop if provided
    if (onAddToCart) {
      onAddToCart(product, quantities[product.id] || 1);
    }
  };

  const openProductDetails = (product) => {
    setSelectedProduct(product);
    setIsDetailsOpen(true);
  };

  const closeProductDetails = () => {
    setIsDetailsOpen(false);
  };

  const handleIncrement = (productId) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 1) + 1,
    }));
  };

  const handleDecrement = (productId) => {
    setQuantities((prev) => {
      const newQuantity = (prev[productId] || 1) - 1;
      if (newQuantity < 1) {
        return { ...prev, [productId]: 1 }; // Minimum quantity is 1
      }
      return { ...prev, [productId]: newQuantity };
    });
  };

  const addToCartFromModal = () => {
    if (selectedProduct) {
      // Set default quantity if not already set
      if (!quantities[selectedProduct.id]) {
        setQuantities((prev) => ({
          ...prev,
          [selectedProduct.id]: 1,
        }));
      }
      
      // Call the onAddToCart prop if provided
      if (onAddToCart) {
        onAddToCart(selectedProduct, quantities[selectedProduct.id] || 1);
      }
      
      // Optionally close the modal after adding to cart
      // closeProductDetails();
    }
  };

  return (
    <div className="py-10 px-4 mt-4 mx-auto text-center">
      <div className="container mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">Fresh Daily</h2>
          <p className="text-gray-600 mb-6 mt-4 text-lg">
            Order now for fresh and natural, 100% chemical-free, organic seasonal produce—safe and healthy!
          </p>
        </div>
        
        <div className="flex justify-end mb-4">
          <Link to="/products" className="text-emerald-600 hover:underline font-medium">
            View All
          </Link>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {products.map((product) => (
            <div 
              key={product.id}
              className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white cursor-pointer"
              onClick={() => openProductDetails(product)}
            >
              <div className="relative p-4">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-40 object-contain mx-auto"
                />
                <button
                  onClick={(e) => handleAddToCart(product, e)}
                  className="absolute bottom-2 right-2 bg-emerald-600 text-white rounded-full p-2 hover:bg-emerald-700 transition-colors"
                >
                  <Plus size={20} />
                </button>
              </div>
              
              <div className="p-4 pt-0">
                <p className="font-bold text-lg text-emerald-600">₹{product.price.toFixed(2)}</p>
                <h3 className="mt-2 font-medium text-gray-900 truncate">{product.name}</h3>
                <p className="text-gray-500 text-sm">{product.unit}</p>
                
                <div className="mt-2 flex justify-between items-center">
                  <button
                    onClick={(e) => toggleFavorite(product.id, e)}
                    className="text-gray-400 hover:text-emerald-600 transition-colors"
                  >
                    <Heart 
                      size={20} 
                      fill={favorites.includes(product.id) ? "#02B290" : "none"}
                      stroke={favorites.includes(product.id) ? "#02B290" : "currentColor"}
                    />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Product Details Modal */}
      <ProductDetails
        product={selectedProduct}
        isOpen={isDetailsOpen}
        onClose={closeProductDetails}
        onAddToCart={addToCartFromModal}
        onToggleFavorite={(e) => {
          if (selectedProduct) {
            toggleFavorite(selectedProduct.id, e);
          }
        }}
        quantity={selectedProduct ? quantities[selectedProduct.id] || 1 : 1}
        onIncrement={() => selectedProduct && handleIncrement(selectedProduct.id)}
        onDecrement={() => selectedProduct && handleDecrement(selectedProduct.id)}
        isFavorite={selectedProduct ? favorites.includes(selectedProduct.id) : false}
      />
    </div>
  );
};

export default FreshDaily;