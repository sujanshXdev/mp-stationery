import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHeart, FaShoppingCart, FaEye } from 'react-icons/fa';
import { useShop } from '../context/ShopContext';
import type { Product } from '../data/mockData';
import UnitSelectionModal from './UnitSelectionModal';
import { SERVER_BASE_URL } from '../utils/apiConfig';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { addToCart, addToWishlist, isWishlisted } = useShop();
  const wishlisted = isWishlisted(product.id);
  
  const getImageUrl = (path: string) => {
    if (!path) return '/stationery.jpg';
    if (path.startsWith('http')) {
      return path;
    }
    return `${SERVER_BASE_URL}/${path}`;
  };

  const imageUrl = product.images.length > 0 ? getImageUrl(product.images[0]) : '/stationery.jpg';
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddToCartClick = () => {
    // Books are always added directly without unit selection
    if (product.category === 'Book') {
      addToCart(product, 1);
      return;
    }
    
    // Check if product has multiple unit types available
    const hasPacketPricing = product.pricePerPacket !== undefined && product.pricePerPacket !== null;
    const hasPiecePricing = product.pricePerPiece !== undefined && product.pricePerPiece !== null;
    
    if (hasPacketPricing && hasPiecePricing) {
      // Product has both unit types - show modal for selection
      setIsModalOpen(true);
    } else if (hasPacketPricing) {
      // Only packet pricing available - add directly with packet unit
      addToCart(product, 1, 'Packet');
    } else if (hasPiecePricing) {
      // Only piece pricing available - add directly with piece unit
      addToCart(product, 1, 'Piece');
    } else {
      // No unit pricing available - add with default behavior
      addToCart(product, 1);
    }
  };

  const handleUnitSelect = (unitType: 'Packet' | 'Piece') => {
    addToCart(product, 1, unitType);
    setIsModalOpen(false);
  };

  let displayPrice: number;
  if (product.category === 'Book') {
    displayPrice = product.priceToSell ?? product.marketPrice ?? product.price;
  } else {
    displayPrice = product.pricePerPiece ?? product.pricePerPacket ?? product.price;
  }

  return (
    <>
      <motion.div
        className="bg-gradient-to-b from-cream-50 to-cream-100 rounded-xl shadow-lg overflow-hidden group border border-cream-200 w-full h-full flex flex-col"
        whileHover={{ y: -5 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative flex-grow">
          <Link to={`/products/${product.id}`} className="block h-full">
            <div className="relative w-full pt-[100%]">
              <div className="absolute inset-0">
                <img
                  src={imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover z-0"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center z-10">
                  {onQuickView && (
                    <motion.button
                      onClick={(e) => {
                        e.preventDefault();
                        if (onQuickView) onQuickView(product);
                      }}
                      className="flex items-center text-white bg-gradient-to-r from-red-600 to-blue-600 px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-sm sm:text-base"
                      aria-label="Quick view"
                      initial={{ y: 10 }}
                      animate={{ y: 0 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <FaEye className="mr-2" />
                      <span>Quick View</span>
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          </Link>
          <div
            className={`absolute top-2 right-2 p-2 rounded-full cursor-pointer transition-colors duration-300 z-20 ${
              wishlisted
                ? 'bg-gradient-to-r from-red-600 to-blue-600 text-white'
                : 'bg-cream-200 text-blue-900 hover:bg-gradient-to-r from-red-600 to-blue-600 hover:text-white'
            }`}
            onClick={() => addToWishlist(product)}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <FaHeart className="text-sm sm:text-base" />
          </div>
        </div>

        <div className="p-3 sm:p-4 flex flex-col flex-shrink-0">
          <h3 className="text-base sm:text-lg font-semibold text-blue-900 line-clamp-2 min-h-[3em]">
            {product.name}
          </h3>
          <p className="text-xs sm:text-sm text-blue-700 truncate mt-1">
            {product.category}
            {product.subCategory && ` • ${product.subCategory}`}
          </p>
          <div className="mt-3 sm:mt-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                {product.category === 'Book' && product.marketPrice ? (
                  <>
                    <span className="text-lg sm:text-xl font-bold text-blue-900">
                      Rs {product.priceToSell?.toLocaleString()}
                    </span>
                    <span className="text-xs sm:text-sm font-medium text-gray-500 line-through">
                      Rs {product.marketPrice?.toLocaleString()}
                    </span>
                  </>
                ) : (
                  <span className="text-lg sm:text-xl font-bold text-blue-900">
                    Rs {displayPrice.toLocaleString()}
                  </span>
                )}
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center bg-gradient-to-r from-red-600 to-blue-600 text-white px-3 py-2 rounded-lg hover:shadow-lg transition-all duration-300 text-sm"
                onClick={handleAddToCartClick}
                aria-label="Add to cart"
              >
                <FaShoppingCart className="mr-1.5" />
                <span className="hidden xs:inline">Add</span>
                <span className="hidden sm:inline"> to Cart</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
      <UnitSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleUnitSelect}
        product={product}
      />
    </>
  );
};

export default ProductCard;