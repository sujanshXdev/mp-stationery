import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { Category } from '../data/mockData';
import { 
  FiChevronLeft, 
  FiChevronRight, 
  FiPlay, 
  FiPause,
  FiArrowRight,
  FiShoppingCart,
  FiPhone,
  FiHome,
  FiArrowUp,
  FiPackage,
} from 'react-icons/fi';
import ProductCard from '../components/ProductCard';
import { useLenis } from '../components/LenisProvider';
import { categories } from '../data/mockData';
import { useShop } from '../context/ShopContext';

// PosterSlide Component
interface PosterSlideProps {
  category: Category;
  isActive: boolean;
  prefersReducedMotion: boolean;
}

const PosterSlide: React.FC<PosterSlideProps> = ({ category, isActive, prefersReducedMotion }) => {
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="absolute inset-0 w-full h-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.8 }}
        >
          <div className="absolute inset-0 w-full h-full">
            <div 
              className="absolute inset-0 w-full h-full bg-cover bg-center transform transition-all duration-[12000ms] ease-out scale-100 group-hover:scale-105"
              style={{ backgroundImage: `url(${category.image})` }}
            />
            <div className={`absolute inset-0 ${category.gradient}`} />
          </div>
          
          <div className="relative z-10 h-full flex flex-col justify-center items-center text-white px-4 sm:px-8 lg:px-16">
            <motion.div
              className="text-center max-w-3xl mx-auto"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: prefersReducedMotion ? 0 : 0.7 }}
            >
              <div className="w-16 h-16 mx-auto bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center mb-6 border border-white/20">
                <category.icon className="text-2xl text-gold-400" />
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-poppins mb-4 tracking-tight">
                <span className="bg-gradient-to-r from-gold-400 to-white bg-clip-text text-transparent">
                  {category.name}
                </span>
              </h1>
              <p className="text-base lg:text-lg max-w-2xl mx-auto mb-8 text-white/90 font-sans leading-relaxed">
                {category.description}
              </p>
              <Link
                to={category.buttonLink}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-900/80 to-blue-800/80 text-white font-medium py-2.5 px-8 rounded-lg border border-white/20 hover:bg-blue-900 transition-all duration-300 group"
              >
                <span>{category.buttonText}</span>
                <FiArrowRight className="text-lg opacity-80 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// PosterCarousel Component
interface PosterCarouselProps {
  categories: Category[];
  interval?: number;
}

const PosterCarousel: React.FC<PosterCarouselProps> = ({ categories, interval = 8000 }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const prefersReducedMotion = useReducedMotion();

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % categories.length);
  }, [categories.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === 0 ? categories.length - 1 : prev - 1));
  }, [categories.length]);

  useEffect(() => {
    if (!isPlaying || prefersReducedMotion) return;
    const timer = setInterval(nextSlide, interval);
    return () => clearInterval(timer);
  }, [interval, nextSlide, isPlaying, prefersReducedMotion]);

  return (
    <div className="relative w-full h-[60vh] sm:h-[70vh] overflow-hidden group" role="region" aria-label="Hero carousel">
      {categories.map((category, index) => (
        <PosterSlide
          key={category.id}
          category={category}
          isActive={index === currentSlide}
          prefersReducedMotion={!!prefersReducedMotion}
        />
      ))}
      
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
        {categories.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-8 h-1 rounded-full transition-all duration-300 ${
              index === currentSlide ? 'bg-gold-400' : 'bg-white/30'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
      
      <div className="absolute bottom-6 right-6 z-20 flex space-x-2">
        <motion.button
          onClick={prevSlide}
          className="bg-white/10 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-white/20 transition-all"
          aria-label="Previous slide"
        >
          <FiChevronLeft className="text-xl" />
        </motion.button>
        <motion.button
          onClick={nextSlide}
          className="bg-white/10 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-white/20 transition-all"
          aria-label="Next slide"
        >
          <FiChevronRight className="text-xl" />
        </motion.button>
        {!prefersReducedMotion && (
          <motion.button
            onClick={() => setIsPlaying(!isPlaying)}
            className="bg-white/10 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-white/20"
            aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
          >
            {isPlaying ? <FiPause className="text-lg" /> : <FiPlay className="text-lg" />}
          </motion.button>
        )}
      </div>
    </div>
  );
};

// HomePage Component
const HomePage: React.FC = () => {
  const { products, isLoading } = useShop();
  const [activeCategory, setActiveCategory] = useState('All');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const { lenis } = useLenis();

  useEffect(() => {
    if (!lenis) return;
    const handleScroll = ({ scroll }: { scroll: number }) => {
      setShowBackToTop(scroll > 600);
    };
    lenis.on('scroll', handleScroll);
    return () => {
      lenis.off('scroll', handleScroll);
    };
  }, [lenis]);

  const bestSellingProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => (b.salesCount ?? 0) - (a.salesCount ?? 0))
      .slice(0, 4);
  }, [products]);

  const recentlyAddedProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())
      .slice(0, 8);
  }, [products]);

  const recentlyAddedFiltered =
    activeCategory === 'All'
      ? recentlyAddedProducts
      : recentlyAddedProducts.filter((p) => {
          // Map filter button names to actual category values
          const categoryMap: { [key: string]: string } = {
            'Books': 'Book',
            'Gifts': 'Gift', 
            'Sports': 'Sport',
            'Stationery': 'Stationery'
          };
          return p.category === categoryMap[activeCategory];
        });

  const sectionAnimation = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.15 },
    transition: { duration: 0.7, ease: 'easeOut' as const }
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.7, ease: 'easeOut' }
    }
  };

  return (
    <main className="w-full bg-cream-50 font-sans">
      {/* Hero Carousel */}
      <PosterCarousel categories={categories} />

      {/* Featured Categories */}
      <motion.section
        className="max-w-7xl mx-auto px-5 py-16 sm:px-6 lg:px-8"
        {...sectionAnimation}
      >
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold font-poppins text-blue-900 mb-3">
            Shop by Category
          </h2>
          <div className="w-16 h-0.5 bg-gradient-to-r from-blue-900 to-gold-400 mx-auto"></div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={category.buttonLink}
              className="group relative rounded-xl overflow-hidden aspect-square"
            >
              <div
                className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url(${category.image})` }}
              >
                <div className={`absolute inset-0 ${category.gradient} opacity-90 group-hover:opacity-95 transition-opacity`} />
              </div>
              <div className="absolute inset-0 flex flex-col justify-end p-5">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center mb-3">
                  <category.icon className="text-xl text-gold-400" />
                </div>
                <h3 className="text-lg font-semibold text-white font-poppins">{category.name}</h3>
                <span className="text-sm text-gold-300 opacity-0 group-hover:opacity-100 transition-opacity">
                  Shop now →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </motion.section>

      {/* Best Selling Products */}
      <motion.section
        className="bg-blue-50 py-16"
        {...sectionAnimation}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold font-poppins text-blue-900 mb-3">
              Best Selling Products
            </h2>
            <div className="w-16 h-0.5 bg-gradient-to-r from-blue-900 to-gold-400 mx-auto"></div>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white h-72 rounded-lg animate-pulse shadow-sm" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {bestSellingProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>
          )}
          
          <div className="mt-12 text-center">
            <Link
              to="/shop"
              className="inline-flex items-center space-x-2 bg-blue-900 text-white font-medium py-2.5 px-8 rounded-lg border border-blue-800 hover:bg-blue-800 transition-all"
            >
              <span>View All Products</span>
              <FiArrowRight className="text-lg" />
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Recently Added */}
      <motion.section
        className="max-w-7xl mx-auto px-5 py-16 sm:px-6 lg:px-8"
        {...sectionAnimation}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold font-poppins text-blue-900">
              Recently Added
            </h2>
            <div className="w-16 h-0.5 bg-gradient-to-r from-blue-900 to-gold-400 mt-2"></div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {['All', 'Books', 'Stationery', 'Gifts', 'Sports'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm transition-all ${
                  activeCategory === cat
                    ? 'bg-blue-900 text-white'
                    : 'bg-cream-200 text-blue-900 hover:bg-cream-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white h-72 rounded-lg animate-pulse shadow-sm" />
            ))}
          </div>
        ) : recentlyAddedFiltered.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FiPackage className="text-2xl text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500">
              {activeCategory === 'All' 
                ? 'No recently added products available at the moment.'
                : `No recently added ${activeCategory.toLowerCase()} products available.`
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {recentlyAddedFiltered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        )}
      </motion.section>

      {/* Why Shop With Us */}
      <motion.section
        className="bg-gradient-to-br from-blue-900 to-blue-800 text-white py-16"
        {...sectionAnimation}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold font-poppins text-white mb-3">
              Why Shop With Us
            </h2>
            <div className="w-16 h-0.5 bg-gradient-to-r from-gold-400 to-white mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: FiShoppingCart,
                title: 'Easy Browsing',
                description: 'Intuitive navigation to discover products effortlessly',
              },
              {
                icon: FiPhone,
                title: 'Personal Assistance',
                description: 'Dedicated support for order confirmation and inquiries',
              },
              {
                icon: FiHome,
                title: 'Convenient Pickup',
                description: 'Collect your orders at our centrally located store',
              },
              {
                icon: FiArrowRight,
                title: 'Fast Processing',
                description: 'Quick order fulfillment and ready notifications',
              },
            ].map((benefit, index) => (
              <div
                key={index}
                className="bg-blue-800/30 backdrop-blur-sm rounded-xl p-6 border border-blue-700/50"
              >
                <div className="w-12 h-12 rounded-lg bg-blue-700/50 flex items-center justify-center mb-4">
                  <benefit.icon className="text-xl text-gold-400" />
                </div>
                <h3 className="text-lg font-semibold font-poppins mb-2">{benefit.title}</h3>
                <p className="text-blue-100 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={() => lenis?.scrollTo(0)}
            className="fixed bottom-6 right-6 bg-blue-900 text-white p-3 rounded-lg shadow-lg z-50"
            aria-label="Back to top"
          >
            <FiArrowUp className="text-xl" />
          </motion.button>
        )}
      </AnimatePresence>
    </main>
  );
};

export default HomePage;