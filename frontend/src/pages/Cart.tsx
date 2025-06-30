import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { FiShoppingCart, FiTrash2, FiPlus, FiMinus, FiShoppingBag, FiLogIn, FiArrowRight } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import type { CartItem } from '../data/mockData';
import { SERVER_BASE_URL } from '../utils/apiConfig';

const Cart: React.FC = () => {
  const { cart, removeFromCart, updateCartQuantity, updateCartUnitType, getCartTotal, placeOrder } = useShop();
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const getImageUrl = (path: string) => {
    if (!path) return '/stationery.jpg';
    if (path.startsWith('http')) return path;
    return `${SERVER_BASE_URL}/${path}`;
  };

  const getItemPrice = (item: CartItem) => {
    if (item.category === 'Book') return item.price ?? 0;
    const type = item.unitType || 'Piece';
    if (type === 'Packet') return item.pricePerPacket ?? item.price ?? 0;
    return item.pricePerPiece ?? item.price ?? 0;
  };

  const handleRemove = (cartItemId: string) => {
    removeFromCart(cartItemId);
  };

  const handleQuantityChange = (cartItemId: string, quantity: number) => {
    if (quantity < 1) return;
    updateCartQuantity(cartItemId, quantity);
  };

  const handleUnitTypeChange = (cartItemId: string, type: 'Packet' | 'Piece') => {
    updateCartUnitType(cartItemId, type);
  };

  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);
    const newOrder = await placeOrder();
    if (newOrder) {
      navigate(`/orders/${newOrder._id}`);
    }
    setIsPlacingOrder(false);
  };

  if (loading) {
    return (
      <main className="w-full bg-gray-50 font-sans min-h-screen py-16 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your cart...</p>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="w-full bg-gray-50 font-sans min-h-screen py-16 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <motion.div
            className="bg-white rounded-xl shadow-lg overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 w-full"></div>
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 text-blue-600 mb-6">
                <FiLogIn className="text-3xl" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Your Cart</h1>
              <p className="text-gray-600 mb-6">Sign in to view and manage your shopping cart</p>
              <div className="space-y-4">
                <Link
                  to="/login"
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
                >
                  Sign In
                </Link>
                <p className="text-gray-500 text-sm">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-blue-600 hover:underline">
                    Register now
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    );
  }

  if (cart.length === 0) {
    return (
      <main className="w-full bg-gray-50 font-sans min-h-screen py-16 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <motion.div
            className="bg-white rounded-xl shadow-lg overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 w-full"></div>
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 text-blue-600 mb-6">
                <FiShoppingCart className="text-3xl" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Your Cart is Empty</h1>
              <p className="text-gray-600 mb-6">Add books and stationery to your cart to continue shopping</p>
              <Link
                to="/shop"
                className="inline-flex items-center justify-center w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
              >
                <FiShoppingBag className="mr-2" />
                Continue Shopping
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full bg-gray-50 font-sans min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <motion.div
            className="bg-white rounded-xl shadow-md p-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
                <p className="text-gray-600">{cart.length} items</p>
              </div>
              <Link
                to="/shop"
                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
              >
                <FiShoppingBag className="mr-2" />
                Continue Shopping
              </Link>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <motion.div
              className="bg-white rounded-xl shadow-md overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="hidden md:grid grid-cols-12 bg-gray-50 border-b border-gray-200 px-6 py-3 text-sm font-medium text-gray-500">
                <div className="col-span-5">Product</div>
                <div className="col-span-3 text-center">Quantity</div>
                <div className="col-span-3 text-center">Price</div>
                <div className="col-span-1"></div>
              </div>
              
              <div className="divide-y divide-gray-100">
                <AnimatePresence>
                  {cart.map((item: CartItem) => (
                    <motion.div
                      key={item.cartItemId || item.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      className="p-4 md:p-6"
                    >
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex-shrink-0">
                          <img
                            src={getImageUrl(item.image)}
                            alt={item.name}
                            className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
                          <p className="text-gray-500 text-sm mt-1">Rs {getItemPrice(item).toFixed(2)}</p>
                          {item.category !== 'Book' && item.unitType && (
                            <p className="text-gray-500 text-sm mt-1">Unit: {item.unitType}</p>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between md:justify-center md:w-32">
                          <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50">
                            <button
                              className="p-2 text-gray-600 hover:text-blue-600 disabled:opacity-30"
                              onClick={() => handleQuantityChange(item.cartItemId, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              aria-label="Decrease quantity"
                            >
                              <FiMinus />
                            </button>
                            <span className="px-4 text-gray-800 font-medium">{item.quantity}</span>
                            <button
                              className="p-2 text-gray-600 hover:text-blue-600"
                              onClick={() => handleQuantityChange(item.cartItemId, item.quantity + 1)}
                              aria-label="Increase quantity"
                            >
                              <FiPlus />
                            </button>
                          </div>
                        </div>
                        
                        <div className="text-center font-medium text-gray-900 md:w-24">
                          Rs {(getItemPrice(item) * item.quantity).toFixed(2)}
                        </div>
                        
                        <div className="flex justify-end md:justify-center">
                          <button
                            className="text-gray-400 hover:text-red-500 p-2"
                            onClick={() => handleRemove(item.cartItemId)}
                            aria-label="Remove item"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-1">
            <motion.div
              className="bg-white rounded-xl shadow-md overflow-hidden sticky top-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">Order Summary</h2>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex justify-between pt-2">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-lg font-bold text-blue-600">Rs {getCartTotal().toFixed(2)}</span>
                </div>
              </div>
              
              <div className="p-6 bg-gray-50">
                <motion.button
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
                  whileHover={{ scale: prefersReducedMotion ? 1 : 1.02 }}
                  whileTap={{ scale: prefersReducedMotion ? 1 : 0.98 }}
                  onClick={handlePlaceOrder}
                  disabled={cart.length === 0 || isPlacingOrder}
                >
                  {isPlacingOrder ? (
                    'Placing Order...'
                  ) : (
                    <>
                      <FiShoppingBag />
                      Place Order
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Cart;