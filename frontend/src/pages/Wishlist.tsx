// Wishlist Page
import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { FiHeart, FiTrash2, FiShoppingBag, FiLogIn, FiX, FiSearch } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';

const Wishlist: React.FC = () => {
  const { wishlist, removeFromWishlist } = useShop();
  const { isAuthenticated, loading } = useAuth();
  const prefersReducedMotion = useReducedMotion();
  const [searchTerm, setSearchTerm] = React.useState('');

  const handleRemove = (id: number) => {
    removeFromWishlist(id);
  };

  const filteredWishlist = wishlist.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <main className="w-full bg-gray-50 font-sans min-h-screen py-16 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your wishlist...</p>
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
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Your Wishlist</h1>
              <p className="text-gray-600 mb-6">Sign in to view and manage your saved items</p>
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

  if (wishlist.length === 0) {
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
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-pink-100 text-pink-500 mb-6">
                <FiHeart className="text-3xl" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Your Wishlist is Empty</h1>
              <p className="text-gray-600 mb-6">Save your favorite books and stationery items for later</p>
              <Link
                to="/shop"
                className="inline-flex items-center justify-center w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
              >
                <FiShoppingBag className="mr-2" />
                Browse Collection
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
                <h1 className="text-2xl font-bold text-gray-900">Your Wishlist</h1>
                <p className="text-gray-600">{wishlist.length} saved items</p>
              </div>
              
              <div className="relative w-full md:w-80">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search your wishlist..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setSearchTerm('')}
                  >
                    <FiX className="text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {filteredWishlist.length === 0 ? (
          <motion.div
            className="bg-white rounded-xl shadow-md p-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
              <FiSearch className="text-2xl" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">No matching items</h2>
            <p className="text-gray-600 mb-6">We couldn't find any items matching your search</p>
            <button
              className="text-blue-600 hover:text-blue-800 font-medium"
              onClick={() => setSearchTerm('')}
            >
              Clear search
            </button>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
          >
            <AnimatePresence>
              {filteredWishlist.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className="relative group"
                >
                  <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-200 overflow-hidden h-full flex flex-col">
                    <ProductCard product={product} />
                    <div className="p-4 mt-auto">
                      <button
                        onClick={() => handleRemove(product.id)}
                        className="w-full flex items-center justify-center gap-2 text-red-600 hover:text-red-800 font-medium py-2 rounded-lg transition-colors duration-200 border border-red-100 hover:border-red-200"
                      >
                        <FiTrash2 />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </main>
  );
};

export default Wishlist;