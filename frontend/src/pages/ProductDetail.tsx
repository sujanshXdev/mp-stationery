import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  FiHeart,
  FiShoppingCart,
  FiArrowLeft,
  FiArrowRight,
  FiBookOpen,
  FiAward,
  FiChevronLeft,
} from 'react-icons/fi';
import ProductCard from '../components/ProductCard';
import type { Product } from '../data/mockData';
import { useShop } from '../context/ShopContext';
import { SERVER_BASE_URL } from '../utils/apiConfig';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const prefersReducedMotion = useReducedMotion();
  const { products, isLoading, getProductById, addToCart, addToWishlist, isWishlisted } = useShop();
  const [product, setProduct] = useState<Product | null | undefined>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [unitType, setUnitType] = useState<'Packet' | 'Piece'>('Piece');

  const getImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${SERVER_BASE_URL}/${path}`;
  };

  useEffect(() => {
    if (id) {
      const foundProduct = getProductById(id);
      setProduct(foundProduct);
      if (foundProduct && foundProduct.images.length > 0) {
        setSelectedImage(getImageUrl(foundProduct.images[0]));
        setCurrentImageIndex(0);
      }
    }
  }, [id, getProductById]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return products
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, 4);
  }, [product, products]);

  const wishlisted = product ? isWishlisted(product.id) : false;

  const nextImage = () => {
    if (!product) return;
    const newIndex = (currentImageIndex + 1) % product.images.length;
    setCurrentImageIndex(newIndex);
    setSelectedImage(getImageUrl(product.images[newIndex]));
  };

  const prevImage = () => {
    if (!product) return;
    const newIndex = (currentImageIndex - 1 + product.images.length) % product.images.length;
    setCurrentImageIndex(newIndex);
    setSelectedImage(getImageUrl(product.images[newIndex]));
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="bg-cream-100 h-[60vh] rounded-2xl animate-pulse" />
          <div className="flex flex-col gap-6">
            <div className="bg-cream-100 h-8 w-3/4 rounded-lg animate-pulse" />
            <div className="bg-cream-100 h-6 w-1/2 rounded-lg animate-pulse" />
            <div className="bg-cream-100 h-24 w-full rounded-lg animate-pulse mt-4" />
            <div className="bg-cream-100 h-12 w-1/3 rounded-lg animate-pulse mt-4" />
            <div className="flex gap-4 mt-6">
              <div className="bg-cream-100 h-12 w-3/4 rounded-full animate-pulse" />
              <div className="bg-cream-100 h-12 w-12 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (product === undefined) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-2xl font-bold text-blue-900">Product loading...</h2>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="bg-white p-8 rounded-xl shadow-sm max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">Product Not Found</h2>
          <p className="text-blue-700 mb-6">The product you're looking for doesn't exist or may have been removed.</p>
          <Link
            to="/shop"
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiChevronLeft className="mr-2" />
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="w-full bg-cream-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
        {/* Back button */}
        <div className="mb-6">
          <Link
            to="/shop"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            <FiChevronLeft className="mr-1" />
            Back to Shop
          </Link>
        </div>

        {/* Product Content - Fixed layout for desktop */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Image Gallery - Fixed height container */}
          <div className="lg:w-1/2">
            <div className="relative bg-white rounded-xl shadow-sm overflow-hidden">
              <motion.div
                key={selectedImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
                className="w-full aspect-square flex items-center justify-center p-4"
              >
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="w-full h-full object-contain"
                  loading="eager"
                />
              </motion.div>
              
              {product.images.length > 1 && (
                <>
                  <div className="absolute top-1/2 left-4 transform -translate-y-1/2">
                    <motion.button
                      onClick={prevImage}
                      whileHover={{ scale: prefersReducedMotion ? 1 : 1.1 }}
                      whileTap={{ scale: prefersReducedMotion ? 1 : 0.9 }}
                      className="p-2 bg-white/90 text-blue-900 rounded-full shadow-md hover:bg-white transition-colors"
                      aria-label="Previous image"
                    >
                      <FiArrowLeft />
                    </motion.button>
                  </div>
                  <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
                    <motion.button
                      onClick={nextImage}
                      whileHover={{ scale: prefersReducedMotion ? 1 : 1.1 }}
                      whileTap={{ scale: prefersReducedMotion ? 1 : 0.9 }}
                      className="p-2 bg-white/90 text-blue-900 rounded-full shadow-md hover:bg-white transition-colors"
                      aria-label="Next image"
                    >
                      <FiArrowRight />
                    </motion.button>
                  </div>
                </>
              )}
            </div>

            {product.images.length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto py-2 px-1">
                {product.images.map((img, index) => (
                  <motion.button
                    key={index}
                    onClick={() => {
                      setSelectedImage(getImageUrl(img));
                      setCurrentImageIndex(index);
                    }}
                    className={`shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${
                      selectedImage === getImageUrl(img) ? 'border-blue-600' : 'border-transparent hover:border-blue-200'
                    }`}
                    whileHover={{ scale: prefersReducedMotion ? 1 : 1.05 }}
                  >
                    <img
                      src={getImageUrl(img)}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info - Scrollable content container */}
          <div className="lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.5, delay: 0.1 }}
              className="bg-white p-6 rounded-xl shadow-sm"
            >
              <div className="mb-6">
                <p className="text-sm font-medium text-blue-500 uppercase tracking-wider mb-1">
                  {product.category}
                </p>
                <h1 className="text-2xl sm:text-3xl font-bold text-blue-900">
                  {product.name}
                </h1>
              </div>

              {/* Price Section */}
              <div className="mb-6">
                {product.category === 'Book' ? (
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-blue-800">
                      Rs. {product.priceToSell?.toLocaleString() || product.price.toLocaleString()}
                    </span>
                    {product.marketPrice && (
                      <span className="text-base font-medium text-gray-500 line-through">
                        Rs. {product.marketPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="text-2xl font-bold text-blue-800 mb-2">
                      Rs. {(unitType === 'Packet' ? product.pricePerPacket : product.pricePerPiece)?.toLocaleString() || product.price.toLocaleString()}
                      <span className="text-sm font-normal text-blue-600 ml-2">
                        / {unitType}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => setUnitType('Piece')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          unitType === 'Piece'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-cream-100 text-blue-900 hover:bg-cream-200'
                        }`}
                      >
                        Piece
                      </button>
                      <button
                        onClick={() => setUnitType('Packet')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          unitType === 'Packet'
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-cream-100 text-blue-900 hover:bg-cream-200'
                        }`}
                      >
                        Packet
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: prefersReducedMotion ? 0 : 0.5 }}
                className="text-blue-800 mb-6 leading-relaxed"
              >
                {product.description}
              </motion.p>

              {/* Book Specific Details */}
              {product.category === 'Book' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: prefersReducedMotion ? 0 : 0.5 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-blue-800 pt-4 border-t border-cream-200 mb-6"
                >
                  {product.subCategory && (
                    <div className="flex items-center gap-2">
                      <FiBookOpen className="text-blue-500" />
                      <span>Type: {product.subCategory}</span>
                    </div>
                  )}
                  {product.academicCategory && (
                    <div className="flex items-center gap-2">
                      <FiAward className="text-blue-500" />
                      <span>Subject: {product.academicCategory}</span>
                    </div>
                  )}
                  {product.class && (
                    <div className="flex items-center gap-2">
                      <FiAward className="text-blue-500" />
                      <span>Class: {product.class}</span>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: prefersReducedMotion ? 0 : 0.5 }}
                className="flex gap-3"
              >
                <motion.button
                  whileHover={{ scale: prefersReducedMotion ? 1 : 1.02 }}
                  whileTap={{ scale: prefersReducedMotion ? 1 : 0.98 }}
                  onClick={() => product && addToCart(product, 1, product.category !== 'Book' ? unitType : undefined)}
                  className="flex-1 bg-blue-600 text-white font-medium py-3 px-6 rounded-lg shadow-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <FiShoppingCart />
                  <span>Add to Cart</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: prefersReducedMotion ? 1 : 1.05 }}
                  whileTap={{ scale: prefersReducedMotion ? 1 : 0.95 }}
                  onClick={() => product && addToWishlist(product)}
                  className={`p-3 rounded-lg border flex items-center justify-center transition-colors ${
                    wishlisted 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                      : 'bg-white text-blue-900 border-cream-300 hover:border-blue-400'
                  }`}
                  aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <FiHeart className={wishlisted ? 'fill-current' : ''} />
                </motion.button>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Related Products - Placed outside the main content container */}
        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-blue-900">
                You may also like
              </h2>
              <Link 
                to="/shop" 
                className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
              >
                View all
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
};

export default ProductDetail;