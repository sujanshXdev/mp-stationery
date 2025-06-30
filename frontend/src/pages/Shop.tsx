import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { FiFilter, FiX, FiArrowLeft, FiArrowRight, FiClock, FiSearch, FiChevronDown, FiChevronUp, FiGrid, FiList } from 'react-icons/fi';
import ProductCard from '../components/ProductCard';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLenis } from '../components/LenisProvider';
import type { Product as MockProduct } from '../data/mockData';
import { useShop } from '../context/ShopContext';
import { API_BASE_URL } from '../utils/apiConfig';
import axios from 'axios';

type Product = MockProduct & { _id?: string; id: string };

const Shop: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();
  const location = useLocation();
  const navigate = useNavigate();
  const { lenis } = useLenis();
  const [filters, setFilters] = useState<{
    categories: string[];
    priceRange: [number, number];
    subCategory: string[];
    academicCategory: string[];
    class: string[];
  }>({
    categories: [],
    priceRange: [0, 100],
    subCategory: [],
    academicCategory: [],
    class: [],
  });
  const [sort, setSort] = useState<string>('name-asc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const productsPerPage = 8;
  const { products, isLoading: loading } = useShop();
  const [maxPrice, setMaxPrice] = useState<number>(100);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Set initial filters from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get('category');
    if (category && ['Book', 'Stationery'].includes(category)) {
      setFilters((prev) => ({ ...prev, categories: [category] }));
    }
    setSearchQuery(params.get('q') || '');
  }, [location.search]);

  useEffect(() => {
    if (products.length > 0) {
      const calculatedMaxPrice = Math.ceil(Math.max(...products.map((p) => p.price)));
      const newMax = calculatedMaxPrice > 0 ? calculatedMaxPrice : 100;
      setMaxPrice(newMax);

      const params = new URLSearchParams(location.search);
      if (!params.has('price')) {
        setFilters((prev) => ({ ...prev, priceRange: [0, newMax] }));
      }
    }
  }, [products, location.search]);

  // Available filter options
  const subCategories = ['Academic', 'Non-Academic'];
  const academicCategories = ['Science', 'Management', 'Hotel Management'];
  const classes = ['Class 11', 'Class 12'];
  const newCategories = ['Sports', 'Gifts'];

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search Query Filter
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      result = result.filter((p) => {
        const fields = [
          p.name,
          p.description,
          p.category,
          p.subCategory,
          p.academicCategory,
          p.class,
        ];
        return fields.some((field) => field && field.toLowerCase().includes(lowerCaseQuery));
      });
    }

    // Category, Price, and other filters
    if (filters.categories.length > 0) {
      result = result.filter((p) => filters.categories.includes(p.category));
    }

    result = result.filter(
      (p) => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
    );

    const isBookAndAcademic =
      filters.categories.includes('Book') && filters.subCategory.includes('Academic');

    if (filters.subCategory.length > 0) {
      result = result.filter(
        (p) => !filters.categories.includes('Book') || filters.subCategory.includes(p.subCategory || '')
      );
    }
    
    if (isBookAndAcademic && filters.academicCategory.length > 0) {
      result = result.filter((p) =>
        filters.academicCategory.includes(p.academicCategory || '')
      );
    }
    
    if (isBookAndAcademic && filters.class.length > 0) {
      result = result.filter((p) => filters.class.includes(p.class || ''));
    }

    return result.sort((a, b) => {
      if (sort === 'price-asc') return a.price - b.price;
      if (sort === 'price-desc') return b.price - a.price;
      if (sort === 'name-asc') return a.name.localeCompare(b.name);
      if (sort === 'name-desc') return b.name.localeCompare(a.name);
      return 0;
    });
  }, [products, filters, sort, searchQuery]);

  // Check if we should show coming soon
  const showComingSoon = useMemo(() => {
    const onlyNewCategoriesSelected =
      filters.categories.length > 0 &&
      filters.categories.every((cat) => newCategories.includes(cat)) &&
      !searchQuery;

    return filteredProducts.length === 0 && onlyNewCategoriesSelected;
  }, [filteredProducts, filters.categories, newCategories, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  const handleClassChange = useCallback((classValue: string) => {
    setFilters((prev) => ({
      ...prev,
      class:
        classValue === ''
          ? []
          : prev.class.includes(classValue)
          ? prev.class.filter((c) => c !== classValue)
          : [...prev.class, classValue],
    }));
  }, []);

  const handlePriceChange = useCallback((value: [number, number]) => {
    setFilters((prev) => ({ ...prev, priceRange: value }));
  }, []);

  const handleSortChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSort(e.target.value);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    lenis?.scrollTo(0);
  }, [lenis]);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sort]);

  // Close filter drawer on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFilterOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCategoryChange = useCallback((category: string) => {
    setFilters((prev) => {
      const newCategories =
        category === ''
          ? []
          : prev.categories.includes(category)
          ? prev.categories.filter((c) => c !== category)
          : [...prev.categories, category];

      const isBookSelected = newCategories.includes('Book');

      return {
        ...prev,
        categories: newCategories,
        subCategory: isBookSelected ? prev.subCategory : [],
        academicCategory: isBookSelected ? prev.academicCategory : [],
        class: isBookSelected ? prev.class : [],
      };
    });
  }, []);

  const handleSubCategoryChange = useCallback((subCategory: string) => {
    setFilters((prev) => {
      const newSubCategories =
        subCategory === ''
          ? []
          : prev.subCategory.includes(subCategory)
          ? prev.subCategory.filter((c) => c !== subCategory)
          : [...prev.subCategory, subCategory];

      const isAcademicSelected = newSubCategories.includes('Academic');

      return {
        ...prev,
        subCategory: newSubCategories,
        academicCategory: isAcademicSelected ? prev.academicCategory : [],
        class: isAcademicSelected ? prev.class : [],
      };
    });
  }, []);

  const handleAcademicCategoryChange = useCallback((academicCategory: string) => {
    setFilters((prev) => ({
      ...prev,
      academicCategory:
        academicCategory === ''
          ? []
          : prev.academicCategory.includes(academicCategory)
          ? prev.academicCategory.filter((c) => c !== academicCategory)
          : [...prev.academicCategory, academicCategory],
    }));
  }, []);

  const ComingSoon = () => (
    <div className="col-span-full text-center py-16">
      <motion.div
        className="inline-block mb-6 p-6 rounded-full bg-gradient-to-r from-blue-100 to-purple-100"
        animate={{ rotate: 360 }}
        transition={{
          duration: prefersReducedMotion ? 0 : 2,
          ease: 'easeInOut',
          repeat: Infinity,
        }}
      >
        <FiClock className="text-5xl text-blue-600" />
      </motion.div>

      <h3 className="text-2xl font-bold text-blue-900 mb-4">
        Exciting New Categories Coming Soon!
      </h3>

      <motion.div
        className="max-w-lg mx-auto mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <p className="text-blue-800 mb-4">
          We're curating an amazing collection of {filters.categories.join(' and ')} products
          just for you. Stay tuned!
        </p>

        <div className="inline-flex flex-wrap justify-center gap-3 mt-4">
          {filters.categories.map((category) => (
            <span
              key={category}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-sm font-medium"
            >
              {category}
            </span>
          ))}
        </div>
      </motion.div>

      <motion.button
        className="mt-6 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium flex items-center mx-auto"
        onClick={() => setFilters((prev) => ({ ...prev, categories: [] }))}
        whileHover={{ scale: prefersReducedMotion ? 1 : 1.03 }}
        whileTap={{ scale: prefersReducedMotion ? 1 : 0.98 }}
      >
        <FiArrowLeft className="mr-2" />
        Back to Collection
      </motion.button>

      <motion.div
        className="mt-10 pt-8 border-t border-blue-100 max-w-md mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <p className="text-blue-700 mb-3">Be the first to know when we launch!</p>
        <div className="flex max-w-xs mx-auto">
          <input
            type="email"
            placeholder="Your email address"
            className="flex-1 px-4 py-2 rounded-l-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-lg transition-colors">
            Notify Me
          </button>
        </div>
      </motion.div>
    </div>
  );

  return (
    <main className="w-full bg-cream-50 font-sans min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h1
            className="text-3xl sm:text-4xl font-bold font-poppins text-blue-900 mb-6 tracking-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.8 }}
          >
            Explore Our Collection
          </motion.h1>
          <motion.p
            className="text-lg text-blue-800 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: prefersReducedMotion ? 0 : 0.6 }}
          >
            Discover our curated selection of books and stationery designed for creativity and learning
          </motion.p>
        </div>

        {/* Filters and Sorting */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-8">
          {/* Mobile Filter Button */}
          <motion.button
            className="md:hidden bg-gradient-to-r from-red-600 to-blue-600 text-white py-3 px-6 rounded-full flex items-center space-x-3 shadow-lg"
            onClick={() => setIsFilterOpen(true)}
            whileHover={{ scale: prefersReducedMotion ? 1 : 1.05 }}
            whileTap={{ scale: prefersReducedMotion ? 1 : 0.95 }}
            aria-label="Open filters"
          >
            <FiFilter className="text-xl" />
            <span className="text-lg font-semibold">Filters</span>
          </motion.button>

          {/* Desktop Filters */}
          <div className="hidden md:flex flex-col md:flex-row gap-4 w-full md:w-auto">
            {/* Category Filter */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-cream-200">
              <h3 className="text-sm font-bold text-blue-900 mb-3">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {['All', 'Book', 'Stationery', ...newCategories].map((cat) => (
                  <motion.button
                    key={cat}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      cat === 'All'
                        ? filters.categories.length === 0
                          ? 'bg-gradient-to-r from-red-600 to-blue-600 text-white'
                          : 'bg-cream-200 text-blue-900 hover:bg-cream-300'
                        : filters.categories.includes(cat)
                        ? 'bg-gradient-to-r from-red-600 to-blue-600 text-white'
                        : 'bg-cream-200 text-blue-900 hover:bg-cream-300'
                    }`}
                    onClick={() => handleCategoryChange(cat === 'All' ? '' : cat)}
                    whileHover={{ scale: prefersReducedMotion ? 1 : 1.05 }}
                    whileTap={{ scale: prefersReducedMotion ? 1 : 0.95 }}
                    aria-label={`Filter by ${cat}`}
                  >
                    {cat}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Book SubCategory Filter */}
            {filters.categories.includes('Book') && (
              <div className="bg-white rounded-xl p-4 shadow-sm border border-cream-200">
                <h3 className="text-sm font-bold text-blue-900 mb-3">Book Subcategories</h3>
                <div className="flex flex-wrap gap-2">
                  {subCategories.map((subCat) => (
                    <motion.button
                      key={subCat}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        filters.subCategory.includes(subCat)
                          ? 'bg-gradient-to-r from-red-600 to-blue-600 text-white'
                          : 'bg-cream-200 text-blue-900 hover:bg-cream-300'
                      }`}
                      onClick={() => handleSubCategoryChange(subCat)}
                      whileHover={{ scale: prefersReducedMotion ? 1 : 1.05 }}
                      whileTap={{ scale: prefersReducedMotion ? 1 : 0.95 }}
                      aria-label={`Filter by ${subCat} books`}
                    >
                      {subCat}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Academic Category Filter */}
            {filters.categories.includes('Book') && filters.subCategory.includes('Academic') && (
              <div className="bg-white rounded-xl p-4 shadow-sm border border-cream-200">
                <h3 className="text-sm font-bold text-blue-900 mb-3">Academic Subjects</h3>
                <div className="flex flex-wrap gap-2">
                  {academicCategories.map((acadCat) => (
                    <motion.button
                      key={acadCat}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        filters.academicCategory.includes(acadCat)
                          ? 'bg-gradient-to-r from-red-600 to-blue-600 text-white'
                          : 'bg-cream-200 text-blue-900 hover:bg-cream-300'
                      }`}
                      onClick={() => handleAcademicCategoryChange(acadCat)}
                      whileHover={{ scale: prefersReducedMotion ? 1 : 1.05 }}
                      whileTap={{ scale: prefersReducedMotion ? 1 : 0.95 }}
                      aria-label={`Filter by ${acadCat} subject`}
                    >
                      {acadCat}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Class Filter */}
            {filters.categories.includes('Book') && filters.subCategory.includes('Academic') && (
              <div className="bg-white rounded-xl p-4 shadow-sm border border-cream-200">
                <h5 className="text-sm font-bold text-blue-900 mb-3">Class</h5>
                <div className="flex flex-wrap gap-2">
                  {classes.map((cls) => (
                    <motion.button
                      key={cls}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        filters.class.includes(cls)
                          ? 'bg-gradient-to-r from-red-600 to-blue-600 text-white'
                          : 'bg-cream-200 text-blue-900 hover:bg-cream-300'
                      }`}
                      onClick={() => handleClassChange(cls)}
                      whileHover={{ scale: prefersReducedMotion ? 1 : 1.05 }}
                      whileTap={{ scale: prefersReducedMotion ? 1 : 0.95 }}
                      aria-label={`Filter by Class ${cls}`}
                    >
                      {cls}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Price Filter */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-cream-200">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-blue-900">Price Range</h3>
                <span className="text-xs text-blue-800 font-medium">
                  Rs.{filters.priceRange[0]} - Rs.{filters.priceRange[1]}
                </span>
              </div>
              <div className="flex flex-col gap-2 w-40">
                <input
                  type="range"
                  min={0}
                  max={maxPrice}
                  value={filters.priceRange[0]}
                  onChange={(e) => handlePriceChange([+e.target.value, filters.priceRange[1]])}
                  className="w-full h-1 bg-cream-300 rounded-full cursor-pointer accent-gradient from-red-600 to-blue-600"
                  aria-label="Minimum price"
                />
                <input
                  type="range"
                  min={0}
                  max={maxPrice}
                  value={filters.priceRange[1]}
                  onChange={(e) => handlePriceChange([filters.priceRange[0], +e.target.value])}
                  className="w-full h-1 bg-cream-300 rounded-full cursor-pointer accent-gradient from-red-600 to-blue-600"
                  aria-label="Maximum price"
                />
              </div>
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="flex w-full md:w-auto">
            <div className="relative flex-1 min-w-[180px]">
              <select
                value={sort}
                onChange={handleSortChange}
                className="w-full px-4 py-2.5 rounded-xl bg-cream-200 text-blue-900 focus:outline-none text-sm font-medium appearance-none pl-4 pr-8 cursor-pointer shadow-sm border border-cream-300"
                aria-label="Sort products"
              >
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-blue-900">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Filter Drawer */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 md:hidden flex items-end"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.4 }}
              onClick={() => setIsFilterOpen(false)}
            >
              <motion.div
                className="bg-white rounded-t-2xl w-full p-6 max-h-[85vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gold-400 scrollbar-track-cream-100"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.4, ease: 'easeOut' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-blue-900">Filters</h2>
                  <motion.button
                    onClick={() => setIsFilterOpen(false)}
                    className="text-blue-900 hover:text-red-600 rounded-full p-1"
                    whileHover={{ scale: prefersReducedMotion ? 1 : 1.1 }}
                    whileTap={{ scale: prefersReducedMotion ? 1 : 0.95 }}
                    aria-label="Close filters"
                  >
                    <FiX className="text-xl" />
                  </motion.button>
                </div>

                {/* Category Filter */}
                <div className="mb-6">
                  <h3 className="text-base font-bold text-blue-900 mb-3">Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {['All', 'Book', 'Stationery', ...newCategories].map((cat) => (
                      <motion.button
                        key={cat}
                        className={`px-4 py-2 rounded-full text-sm font-medium ${
                          cat === 'All'
                            ? filters.categories.length === 0
                              ? 'bg-gradient-to-r from-red-600 to-blue-600 text-white'
                              : 'bg-cream-200 text-blue-900 hover:bg-cream-300'
                            : filters.categories.includes(cat)
                            ? 'bg-gradient-to-r from-red-600 to-blue-600 text-white'
                            : 'bg-cream-200 text-blue-900 hover:bg-cream-300'
                        }`}
                        onClick={() => handleCategoryChange(cat === 'All' ? '' : cat)}
                        whileHover={{ scale: prefersReducedMotion ? 1 : 1.05 }}
                        whileTap={{ scale: prefersReducedMotion ? 1 : 0.95 }}
                        aria-label={`Filter by ${cat}`}
                      >
                        {cat}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Book SubCategory Filter */}
                {filters.categories.includes('Book') && (
                  <div className="mb-6">
                    <h3 className="text-base font-bold text-blue-900 mb-3">Book Subcategories</h3>
                    <div className="flex flex-wrap gap-2">
                      {subCategories.map((subCat) => (
                        <motion.button
                          key={subCat}
                          className={`px-4 py-2 rounded-full text-sm font-medium ${
                            filters.subCategory.includes(subCat)
                              ? 'bg-gradient-to-r from-red-600 to-blue-600 text-white'
                              : 'bg-cream-200 text-blue-900 hover:bg-cream-300'
                          }`}
                          onClick={() => handleSubCategoryChange(subCat)}
                          whileHover={{ scale: prefersReducedMotion ? 1 : 1.05 }}
                          whileTap={{ scale: prefersReducedMotion ? 1 : 0.95 }}
                          aria-label={`Filter by ${subCat} books`}
                        >
                          {subCat}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Academic Category Filter */}
                {filters.categories.includes('Book') && filters.subCategory.includes('Academic') && (
                  <div className="mb-6">
                    <h3 className="text-base font-bold text-blue-900 mb-3">Academic Subjects</h3>
                    <div className="flex flex-wrap gap-2">
                      {academicCategories.map((acadCat) => (
                        <motion.button
                          key={acadCat}
                          className={`px-4 py-2 rounded-full text-sm font-medium ${
                            filters.academicCategory.includes(acadCat)
                              ? 'bg-gradient-to-r from-red-600 to-blue-600 text-white'
                              : 'bg-cream-200 text-blue-900 hover:bg-cream-300'
                          }`}
                          onClick={() => handleAcademicCategoryChange(acadCat)}
                          whileHover={{ scale: prefersReducedMotion ? 1 : 1.05 }}
                          whileTap={{ scale: prefersReducedMotion ? 1 : 0.95 }}
                          aria-label={`Filter by ${acadCat} subject`}
                        >
                          {acadCat}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Class Filter */}
                {filters.categories.includes('Book') && filters.subCategory.includes('Academic') && (
                  <div className="mb-6">
                    <h3 className="text-base font-bold text-blue-900 mb-3">Class</h3>
                    <div className="flex flex-wrap gap-2">
                      {classes.map((cls) => (
                        <motion.button
                          key={cls}
                          className={`px-4 py-2 rounded-full text-sm font-medium ${
                            filters.class.includes(cls)
                              ? 'bg-gradient-to-r from-red-600 to-blue-600 text-white'
                              : 'bg-cream-200 text-blue-900 hover:bg-cream-300'
                          }`}
                          onClick={() => handleClassChange(cls)}
                          whileHover={{ scale: prefersReducedMotion ? 1 : 1.05 }}
                          whileTap={{ scale: prefersReducedMotion ? 1 : 0.95 }}
                          aria-label={`Filter by Class ${cls}`}
                        >
                          {cls}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price Filter */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-base font-bold text-blue-900">Price Range</h3>
                    <span className="text-sm text-blue-800 font-medium">
                      Rs.{filters.priceRange[0]} - Rs.{filters.priceRange[1]}
                    </span>
                  </div>
                  <div className="flex flex-col gap-3">
                    <input
                      type="range"
                      min={0}
                      max={maxPrice}
                      value={filters.priceRange[0]}
                      onChange={(e) => handlePriceChange([+e.target.value, filters.priceRange[1]])}
                      className="w-full h-1 bg-cream-300 rounded-full cursor-pointer accent-gradient from-red-600 to-blue-600"
                      aria-label="Minimum price"
                    />
                    <input
                      type="range"
                      min={0}
                      max={maxPrice}
                      value={filters.priceRange[1]}
                      onChange={(e) => handlePriceChange([filters.priceRange[0], +e.target.value])}
                      className="w-full h-1 bg-cream-300 rounded-full cursor-pointer accent-gradient from-red-600 to-blue-600"
                      aria-label="Maximum price"
                    />
                  </div>
                </div>

                {/* Apply Button */}
                <motion.button
                  className="w-full mt-4 py-3 px-8 rounded-xl bg-gradient-to-r from-red-600 to-blue-600 text-white font-medium text-base"
                  onClick={() => setIsFilterOpen(false)}
                  whileHover={{ scale: prefersReducedMotion ? 1 : 1.03 }}
                  whileTap={{ scale: prefersReducedMotion ? 1 : 0.98 }}
                >
                  View Results
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search results notice */}
        {searchQuery && (
          <motion.div
            className="mb-8 flex items-center justify-between bg-blue-50 p-4 rounded-xl border border-blue-100"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-blue-900 text-sm">
              Showing results for: <span className="font-semibold">"{searchQuery}"</span>
            </p>
            <button
              onClick={() => {
                const params = new URLSearchParams(location.search);
                params.delete('q');
                navigate({ search: params.toString() });
              }}
              className="text-blue-700 hover:text-red-600 font-semibold flex items-center text-sm"
            >
              <FiX className="mr-1" />
              Clear Search
            </button>
          </motion.div>
        )}

        {/* Products Grid */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-16"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.8 }}
        >
          {loading ? (
            <div className="col-span-full text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-blue-800">Loading products...</p>
            </div>
          ) : showComingSoon ? (
            <ComingSoon />
          ) : paginatedProducts.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <motion.div
                className="text-5xl mb-5 text-blue-900 opacity-20"
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                ✨
              </motion.div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">No Products Found</h3>
              <p className="text-blue-800 max-w-md mx-auto">
                Try adjusting your filters to discover our collection
              </p>
              <motion.button
                className="mt-6 px-6 py-2.5 bg-gradient-to-r from-red-600 to-blue-600 text-white rounded-xl font-medium"
                onClick={() =>
                  setFilters({
                    categories: [],
                    priceRange: [0, maxPrice],
                    subCategory: [],
                    academicCategory: [],
                    class: [],
                  })
                }
                whileHover={{ scale: prefersReducedMotion ? 1 : 1.03 }}
                whileTap={{ scale: prefersReducedMotion ? 1 : 0.98 }}
              >
                Reset Filters
              </motion.button>
            </div>
          ) : (
            paginatedProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: prefersReducedMotion ? 0 : 0.6 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mb-16">
            <motion.button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="bg-cream-200 text-blue-900 p-2 rounded-full disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              whileHover={{ scale: prefersReducedMotion ? 1 : 1.1 }}
              whileTap={{ scale: prefersReducedMotion ? 1 : 0.95 }}
              aria-label="Previous page"
            >
              <FiArrowLeft className="text-xl" />
            </motion.button>

            {[...Array(totalPages)].map((_, i) => {
              if (i === 0 || i === totalPages - 1 || (i >= currentPage - 2 && i <= currentPage)) {
                return (
                  <motion.button
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium ${
                      currentPage === i + 1
                        ? 'bg-gradient-to-r from-red-600 to-blue-600 text-white'
                        : 'bg-cream-200 text-blue-900 hover:bg-cream-300'
                    }`}
                    whileHover={{ scale: prefersReducedMotion ? 1 : 1.05 }}
                    whileTap={{ scale: prefersReducedMotion ? 1 : 0.95 }}
                    aria-label={`Page ${i + 1}`}
                  >
                    {i + 1}
                  </motion.button>
                );
              }

              if (i === 1 || i === totalPages - 2) {
                return (
                  <span key={i} className="px-3 text-blue-900 text-sm">
                    ...
                  </span>
                );
              }

              return null;
            })}

            <motion.button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="bg-cream-200 text-blue-900 p-2 rounded-full disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              whileHover={{ scale: prefersReducedMotion ? 1 : 1.1 }}
              whileTap={{ scale: prefersReducedMotion ? 1 : 0.95 }}
              aria-label="Next page"
            >
              <FiArrowRight className="text-xl" />
            </motion.button>
          </div>
        )}
      </div>
    </main>
  );
};

export default Shop;