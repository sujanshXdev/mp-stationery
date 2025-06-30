import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FiSearch,
  FiHeart,
  FiShoppingCart,
  FiUser,
  FiMenu,
  FiX,
  FiHome,
  FiShoppingBag,
  FiLogIn,
  FiUserPlus,
  FiSettings,
  FiLogOut,
  FiChevronDown,
  FiInfo,
  FiGrid
} from 'react-icons/fi';
import { useShop } from "../context/ShopContext";
import { useAuth } from '../context/AuthContext';
import type { Product } from '../data/mockData';

interface NavLink {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface BadgeProps {
  count: number;
  className?: string;
}

const Navbar: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const { isAuthenticated, user, logout, loading } = useAuth();
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { cart, wishlist, products } = useShop();

  const navLinks: NavLink[] = [
    { name: 'Home', href: '/', icon: FiHome },
    { name: 'Shop', href: '/shop', icon: FiShoppingBag },
    { name: 'About Us', href: '/about-us', icon: FiInfo }
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleUserDropdown = () => setIsUserDropdownOpen(!isUserDropdownOpen);
  const toggleSearch = () => setIsSearchOpen(!isSearchOpen);

  const handleLinkClick = (href: string) => {
    setIsMobileMenuOpen(false);
    navigate(href);
  };

  const handleLogout = async () => {
    setIsUserDropdownOpen(false);
    setIsMobileMenuOpen(false);
    await logout();
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setIsUserDropdownOpen(false);
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  useEffect(() => {
    if (isSearchOpen) searchInputRef.current?.focus();
  }, [isSearchOpen]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (searchQuery.length > 1) {
      const lowerCaseQuery = searchQuery.toLowerCase();

      const scoredProducts = products
        .map((product) => {
          let score = 0;
          const name = product.name.toLowerCase();
          const category = product.category.toLowerCase();
          const subCategory = product.subCategory?.toLowerCase();
          const academicCategory = product.academicCategory?.toLowerCase();
          const pClass = product.class?.toLowerCase();
          const description = product.description?.toLowerCase();

          if (name.includes(lowerCaseQuery)) {
            score += name.startsWith(lowerCaseQuery) ? 20 : 10;
          }
          if (category.includes(lowerCaseQuery)) score += 5;
          if (subCategory?.includes(lowerCaseQuery)) score += 5;
          if (academicCategory?.includes(lowerCaseQuery)) score += 5;
          if (pClass?.includes(lowerCaseQuery)) score += 5;
          if (description?.includes(lowerCaseQuery)) score += 1;

          return { product, score };
        })
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score);

      setSuggestions(scoredProducts.map((item) => item.product).slice(0, 5));
    } else {
      setSuggestions([]);
    }
  }, [searchQuery, products]);

  const Badge: React.FC<BadgeProps> = ({ count, className = '' }) => (
    count > 0 ? (
      <motion.span
        initial={{ scale: prefersReducedMotion ? 1 : 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.2, type: 'spring', stiffness: 300 }}
        className={`absolute -top-1 -right-1 bg-amber-300 text-gray-900 text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center ${className}`}
      >
        {count > 99 ? '99+' : count}
      </motion.span>
    ) : null
  );

  return (
    <>
      <motion.nav
        initial={{ y: prefersReducedMotion ? 0 : -100 }}
        animate={{ y: 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.3, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 z-50 bg-white text-blue-900 font-sans shadow-lg border-b-4 border-blue-200/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: prefersReducedMotion ? 1 : 1.05 }}
              whileTap={{ scale: prefersReducedMotion ? 1 : 0.95 }}
              className="flex-shrink-0 flex items-center space-x-2"
            >
              <Link to="/" className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 border-2 border-blue-200 rounded-full flex items-center justify-center p-1.5">
                  <img
                    src="/logo.png"
                    alt="Books & Stationery Logo"
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                </div>
                <span className="ml-2 text-base sm:text-lg font-bold font-quintessential text-blue-900" style={{ fontFamily: '"Quintessential", serif' }}>
                  Books & Stationery
                </span>
              </Link>
            </motion.div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-3">
              {navLinks.map((link) => (
                <motion.div
                  key={link.name}
                  whileHover={{ y: prefersReducedMotion ? 0 : -2 }}
                  className="relative"
                >
                  <Link
                    to={link.href}
                    className={`flex items-center space-x-2 px-4 py-2.5 text-sm font-semibold font-sans transition-all duration-300 group ${
                      location.pathname === link.href 
                        ? 'text-blue-900' 
                        : 'text-blue-700 hover:text-blue-900'
                    }`}
                  >
                    <span>{link.name}</span>
                    <motion.div 
                      className={`absolute bottom-0 left-0 right-0 h-0.5 ${
                        location.pathname === link.href 
                          ? 'bg-gradient-to-r from-blue-700 to-amber-300' 
                          : 'bg-gradient-to-r from-blue-700 to-amber-300 opacity-0 group-hover:opacity-100'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: location.pathname === link.href ? "100%" : 0 }}
                      whileHover={{ width: "100%" }}
                      transition={{ duration: 0.3 }}
                    />
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: prefersReducedMotion ? 1 : 1.1 }}
                whileTap={{ scale: prefersReducedMotion ? 1 : 0.9 }}
                onClick={toggleSearch}
                className="p-2.5 rounded-full hover:bg-blue-100 transition-all duration-300 shadow-sm"
                aria-label="Open search"
              >
                <FiSearch className="text-xl text-blue-700 hover:text-blue-900" />
              </motion.button>
              
              {user?.role !== 'admin' && (
                <>
                  <Link to="/wishlist" aria-label={`Wishlist with ${wishlist.length} items`}>
                    <motion.div
                      whileHover={{ scale: prefersReducedMotion ? 1 : 1.1 }}
                      whileTap={{ scale: prefersReducedMotion ? 1 : 0.9 }}
                      className="relative p-2.5 rounded-full hover:bg-blue-100 transition-all duration-300 shadow-sm"
                    >
                      <FiHeart className="text-xl text-blue-700 hover:text-blue-900" />
                      <Badge count={wishlist.length} />
                    </motion.div>
                  </Link>
                  
                  <Link to="/cart" aria-label={`Cart with ${cart.length} items`}>
                    <motion.div
                      whileHover={{ scale: prefersReducedMotion ? 1 : 1.1 }}
                      whileTap={{ scale: prefersReducedMotion ? 1 : 0.9 }}
                      className="relative p-2.5 rounded-full hover:bg-blue-100 transition-all duration-300 shadow-sm"
                    >
                      <FiShoppingCart className="text-xl text-blue-700 hover:text-blue-900" />
                      <Badge count={cart.length} />
                    </motion.div>
                  </Link>
                </>
              )}
              
              <div className="relative" ref={userDropdownRef}>
                <motion.button
                  whileHover={{ scale: prefersReducedMotion ? 1 : 1.05 }}
                  whileTap={{ scale: prefersReducedMotion ? 1 : 0.95 }}
                  onClick={toggleUserDropdown}
                  className="flex items-center p-2.5 rounded-full hover:bg-blue-100 transition-all duration-300 shadow-sm"
                  aria-label="User account"
                  disabled={loading}
                >
                  <div className="w-9 h-9 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center">
                    <FiUser className="text-lg text-blue-900" />
                  </div>
                  <FiChevronDown 
                    className={`text-blue-700 ml-1 text-lg transition-transform duration-300 ${isUserDropdownOpen ? 'rotate-180' : ''}`} 
                  />
                </motion.button>
                
                <AnimatePresence>
                  {isUserDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: prefersReducedMotion ? 0 : 0.15 }}
                      className="absolute right-0 mt-3 w-60 bg-white rounded-xl shadow-lg border border-blue-200/50 py-2 z-50"
                    >
                      {isAuthenticated ? (
                        <>
                          <div className="px-4 py-3 border-b border-blue-200/50 flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center">
                              <FiUser className="text-lg text-blue-900" />
                            </div>
                            <div>
                              <div className="font-semibold text-blue-900 text-sm font-sans">{user?.name}</div>
                              <div className="text-xs text-blue-700 truncate">{user?.email}</div>
                            </div>
                          </div>
                          {user?.role === 'admin' ? (
                            <Link
                              to="/admin/dashboard"
                              className="flex items-center space-x-3 px-4 py-3 text-blue-700 hover:bg-blue-100 hover:text-blue-900 text-sm font-sans transition-all duration-300"
                              onClick={() => setIsUserDropdownOpen(false)}
                            >
                              <FiGrid className="text-sm" />
                              <span>Admin Dashboard</span>
                            </Link>
                          ) : (
                            <>
                              <Link
                                to="/profile"
                                className="flex items-center space-x-3 px-4 py-3 text-blue-700 hover:bg-blue-100 hover:text-blue-900 text-sm font-sans transition-all duration-300"
                                onClick={() => setIsUserDropdownOpen(false)}
                              >
                                <FiUser className="text-sm" />
                                <span>Profile</span>
                              </Link>
                              <Link
                                to="/orders"
                                className="flex items-center space-x-3 px-4 py-3 text-blue-700 hover:bg-blue-100 hover:text-blue-900 text-sm font-sans transition-all duration-300"
                                onClick={() => setIsUserDropdownOpen(false)}
                              >
                                <FiShoppingCart className="text-sm" />
                                <span>My Orders</span>
                              </Link>
                              <Link
                                to="/settings"
                                className="flex items-center space-x-3 px-4 py-3 text-blue-700 hover:bg-blue-100 hover:text-blue-900 text-sm font-sans transition-all duration-300"
                                onClick={() => setIsUserDropdownOpen(false)}
                              >
                                <FiSettings className="text-sm" />
                                <span>Settings</span>
                              </Link>
                              <button
                                onClick={handleLogout}
                                className="w-full flex items-center space-x-3 px-4 py-3 text-amber-700 hover:bg-blue-100 hover:text-amber-800 text-sm font-sans transition-all duration-300"
                              >
                                <FiLogOut className="text-sm" />
                                <span>Logout</span>
                              </button>
                            </>
                          )}
                        </>
                      ) : (
                        <>
                          <Link
                            to="/login"
                            className="flex items-center space-x-3 px-4 py-3 text-blue-700 hover:bg-blue-100 hover:text-blue-900 text-sm font-sans transition-all duration-300"
                            onClick={() => setIsUserDropdownOpen(false)}
                          >
                            <FiLogIn className="text-sm" />
                            <span>Login</span>
                          </Link>
                          <Link
                            to="/register"
                            className="flex items-center space-x-3 px-4 py-3 text-blue-700 hover:bg-blue-100 hover:text-blue-900 text-sm font-sans transition-all duration-300"
                            onClick={() => setIsUserDropdownOpen(false)}
                          >
                            <FiUserPlus className="text-sm" />
                            <span>Register</span>
                          </Link>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center space-x-4">
              <motion.button
                whileHover={{ scale: prefersReducedMotion ? 1 : 1.1 }}
                whileTap={{ scale: prefersReducedMotion ? 1 : 0.9 }}
                onClick={toggleSearch}
                className="p-2.5 rounded-full hover:bg-blue-100 transition-all duration-300 shadow-sm"
                aria-label="Open search"
              >
                <FiSearch className="text-xl text-blue-700" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: prefersReducedMotion ? 1 : 1.1 }}
                whileTap={{ scale: prefersReducedMotion ? 1 : 0.9 }}
                onClick={toggleMobileMenu}
                className="p-2.5 rounded-full hover:bg-blue-100 transition-all duration-300 shadow-sm"
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {isMobileMenuOpen ? (
                  <FiX className="text-xl text-blue-700" />
                ) : (
                  <FiMenu className="text-xl text-blue-700" />
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            className="fixed inset-0 bg-white/95 backdrop-blur-lg z-50 flex items-start justify-center pt-28"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
            onClick={toggleSearch}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4 border border-blue-200/50 shadow-xl"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center border-b border-blue-200/50 pb-3">
                <FiSearch className="text-blue-700 text-xl mr-3" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search products, categories..."
                  className="flex-1 py-3 bg-transparent text-blue-900 placeholder-blue-700/50 focus:outline-none text-base font-sans"
                  aria-label="Search products"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery) {
                      setIsSearchOpen(false);
                      navigate(`/shop?q=${encodeURIComponent(searchQuery)}`);
                    }
                  }}
                />
                <motion.button
                  whileTap={{ scale: prefersReducedMotion ? 1 : 0.9 }}
                  onClick={toggleSearch}
                  className="p-2 text-blue-700 hover:text-blue-900"
                  aria-label="Close search"
                >
                  <FiX className="text-xl" />
                </motion.button>
              </div>
              <AnimatePresence>
                {suggestions.length > 0 && (
                  <motion.div
                    className="mt-4 space-y-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <p className="text-blue-900 text-sm font-sans px-3 pt-2 font-semibold">Suggestions</p>
                    {suggestions.map((product) => (
                      <Link
                        key={product.id}
                        to={`/products/${product.id}`}
                        className="flex items-center px-4 py-3 text-blue-700 hover:bg-blue-100 text-sm font-sans transition-all duration-300 rounded-lg group"
                        onClick={() => {
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }}
                      >
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-10 h-10 object-contain mr-4 rounded-md bg-gray-100 p-1"
                        />
                        <div className="flex-1">
                          <span className="font-semibold text-blue-800 group-hover:text-blue-900">
                            {product.name}
                          </span>
                          <p className="text-xs text-blue-700/80">{product.category}</p>
                        </div>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.15 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
              onClick={toggleMobileMenu}
            />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.3, ease: 'easeOut' }}
              className="fixed top-0 right-0 h-full w-96 bg-white shadow-xl z-50 md:hidden flex flex-col text-blue-900"
            >
              <div className="p-6 border-b border-blue-200/50">
                <div className="flex items-center justify-between mb-6">
                  <Link to="/" className="flex items-center" onClick={() => handleLinkClick('/')}>
                    <div className="w-10 h-10 bg-blue-100 border-2 border-blue-200 rounded-full flex items-center justify-center p-1.5">
                      <img
                        src="/logo.png"
                        alt="Books & Stationery Logo"
                        className="w-full h-full object-contain"
                        loading="lazy"
                      />
                    </div>
                    <span className="ml-2 text-base font-bold font-quintessential text-blue-900" style={{ fontFamily: '"Quintessential", serif' }}>
                      Books & Stationery
                    </span>
                  </Link>
                  <motion.button
                    whileHover={{ scale: prefersReducedMotion ? 1 : 1.1 }}
                    whileTap={{ scale: prefersReducedMotion ? 1 : 0.9 }}
                    onClick={toggleMobileMenu}
                    className="p-2.5 rounded-full hover:bg-blue-100 transition-all duration-300 shadow-sm"
                    aria-label="Close menu"
                  >
                    <FiX className="text-xl text-blue-900" />
                  </motion.button>
                </div>
                
                <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center">
                    <FiUser className="text-lg text-blue-900" />
                  </div>
                  <div>
                    <div className="font-semibold text-blue-900 text-sm font-sans">
                      {isAuthenticated ? user?.name : 'Guest'}
                    </div>
                    <div className="text-xs text-blue-700">
                      {isAuthenticated ? user?.email : 'Sign in for full access'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto py-6 px-6">
                <div className="space-y-2">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.href}
                      className={`flex items-center space-x-3 p-4 text-blue-700 text-base font-semibold font-sans transition-all duration-300 rounded-xl group ${
                        location.pathname === link.href 
                          ? 'bg-blue-100 text-blue-900' 
                          : 'hover:bg-blue-100'
                      }`}
                      onClick={() => handleLinkClick(link.href)}
                    >
                      <link.icon 
                        className={`text-lg ${location.pathname === link.href ? 'text-blue-900' : 'text-blue-700'}`} 
                      />
                      <span>{link.name}</span>
                    </Link>
                  ))}
                </div>
                
                <div className="mt-8">
                  <h3 className="text-blue-900 text-sm font-sans uppercase tracking-wider px-4 mb-3 font-semibold">
                    Account
                  </h3>
                  <div className="space-y-2">
                    {user?.role === 'admin' ? (
                      <Link
                        to="/admin/dashboard"
                        className="flex items-center space-x-3 p-4 text-blue-700 hover:bg-blue-100 text-base font-sans transition-all duration-300 rounded-xl"
                        onClick={() => handleLinkClick('/admin/dashboard')}
                      >
                        <FiGrid className="text-lg" />
                        <span>Admin Dashboard</span>
                      </Link>
                    ) : (
                      <>
                        <Link
                          to="/profile"
                          className="flex items-center space-x-3 p-4 text-blue-700 hover:bg-blue-100 text-base font-sans transition-all duration-300 rounded-xl"
                          onClick={() => handleLinkClick('/profile')}
                        >
                          <FiUser className="text-lg" />
                          <span>Profile</span>
                        </Link>
                        <Link
                          to="/orders"
                          className="flex items-center space-x-3 p-4 text-blue-700 hover:bg-blue-100 text-base font-sans transition-all duration-300 rounded-xl"
                          onClick={() => handleLinkClick('/orders')}
                        >
                          <FiShoppingCart className="text-lg" />
                          <span>My Orders</span>
                        </Link>
                        <Link
                          to="/settings"
                          className="flex items-center space-x-3 p-4 text-blue-700 hover:bg-blue-100 text-base font-sans transition-all duration-300 rounded-xl"
                          onClick={() => handleLinkClick('/settings')}
                        >
                          <FiSettings className="text-lg" />
                          <span>Settings</span>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-blue-200/50">
                {user?.role !== 'admin' && (
                  <div className="grid grid-cols-2 gap-4">
                    <Link to="/wishlist" className="w-full" aria-label={`Wishlist with ${wishlist.length} items`} onClick={() => handleLinkClick('/wishlist')}>
                      <motion.div
                        whileHover={{ y: prefersReducedMotion ? 0 : -3 }}
                        whileTap={{ scale: prefersReducedMotion ? 1 : 0.97 }}
                        className="relative flex flex-col items-center justify-center p-4 w-full bg-blue-50 rounded-xl text-blue-700 hover:bg-blue-100 text-sm font-sans shadow-sm"
                      >
                        <div className="relative">
                          <FiHeart className="text-xl mb-1" />
                          <Badge count={wishlist.length} className="top-0 right-0 transform translate-x-1/2 -translate-y-1/2" />
                        </div>
                        <span>Wishlist</span>
                      </motion.div>
                    </Link>
                    
                    <Link to="/cart" className="w-full" aria-label={`Cart with ${cart.length} items`} onClick={() => handleLinkClick('/cart')}>
                      <motion.div
                        whileHover={{ y: prefersReducedMotion ? 0 : -3 }}
                        whileTap={{ scale: prefersReducedMotion ? 1 : 0.97 }}
                        className="relative flex flex-col items-center justify-center p-4 w-full bg-blue-50 rounded-xl text-blue-700 hover:bg-blue-100 text-sm font-sans shadow-sm"
                      >
                        <div className="relative">
                          <FiShoppingCart className="text-xl mb-1" />
                          <Badge count={cart.length} className="top-0 right-0 transform translate-x-1/2 -translate-y-1/2" />
                        </div>
                        <span>Cart</span>
                      </motion.div>
                    </Link>
                  </div>
                )}
                
                {isAuthenticated && user?.role !== 'admin' ? (
                  <motion.button
                    onClick={handleLogout}
                    whileHover={{ y: prefersReducedMotion ? 0 : -3 }}
                    whileTap={{ scale: prefersReducedMotion ? 1 : 0.97 }}
                    className="w-full mt-4 py-3.5 rounded-xl bg-gradient-to-r from-blue-700 to-amber-300 text-white font-semibold shadow-md flex items-center justify-center"
                  >
                    <FiLogOut className="mr-2 text-lg" />
                    <span>Sign Out</span>
                  </motion.button>
                ) : !isAuthenticated ? (
                  <Link to="/login" className="w-full" onClick={() => handleLinkClick('/login')}>
                    <motion.button
                      whileHover={{ y: prefersReducedMotion ? 0 : -3 }}
                      whileTap={{ scale: prefersReducedMotion ? 1 : 0.97 }}
                      className="w-full mt-4 py-3.5 rounded-xl bg-gradient-to-r from-blue-700 to-amber-300 text-white font-semibold shadow-md flex items-center justify-center"
                    >
                      <FiLogIn className="mr-2 text-lg" />
                      <span>Sign In</span>
                    </motion.button>
                  </Link>
                ) : null}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="h-16" />
    </>
  );
};

export default Navbar;