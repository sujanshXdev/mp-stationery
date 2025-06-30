import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { FiMapPin, FiPhone, FiClock, FiArrowRight, FiBook, FiPenTool, FiPrinter, FiGift, FiAward, FiSmile, FiShoppingBag, FiMail, FiUser, FiHeart, FiUsers, FiShield } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { API_BASE_URL } from '../utils/apiConfig';
import axios from 'axios';
import toast from 'react-hot-toast';

interface ContactForm {
  name: string;
  email: string;
  message: string;
}

const AboutUs: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactForm>();

  const onSubmit: SubmitHandler<ContactForm> = async (data) => {
    setIsSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');
    try {
      const response = await axios.post(`${API_BASE_URL}/contact`, data);

      if (response.data.success) {
        setSuccessMessage('Your message has been sent successfully!');
        reset();
      } else {
        setErrorMessage(response.data.message || 'Failed to send message. Please try again.');
      }
    } catch (err) {
      setErrorMessage('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="w-full min-h-screen bg-cream-50 font-poppins">
      {/* Hero Section */}
      <div className="relative h-[70vh] bg-gradient-to-b from-blue-900/30 to-blue-900/80">
        <div 
          className="absolute inset-0 bg-[url('/mpbooksandstationery.png')] bg-cover bg-center z-0" 
          style={{ backgroundPosition: 'center 30%' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/40 to-blue-900/90 z-10" />
        <div className="relative z-20 h-full flex flex-col justify-center items-center text-center px-4 sm:px-6 lg:px-8">
          <motion.h1 
            className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.8 }}
          >
            MP Books & Stationery
          </motion.h1>
          <motion.p 
            className="text-xl text-gold-400 max-w-3xl leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.8, delay: 0.2 }}
          >
            Your premier destination for education and creativity in Bharatpur
          </motion.p>
        </div>
      </div>

      {/* Introduction Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.7 }}
          >
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <h2 className="text-3xl font-bold text-blue-900 mb-6 relative pb-4 after:absolute after:bottom-0 after:left-0 after:w-16 after:h-1 after:bg-gradient-to-r after:from-red-600 after:to-blue-600">
                Welcome to Our Store
              </h2>
              <p className="text-blue-800 text-lg leading-relaxed mb-6">
                Nestled in the heart of Bharatpur (MCGP+37F, Bharatpur 44200), we are your friendly neighborhood haven for stationery and books. Open daily from 6 AM to 9 PM, we cater to early risers, students, artists, and professionals with a curated selection of academic materials and creative tools.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center bg-blue-50 px-4 py-2 rounded-lg">
                  <FiClock className="text-blue-700 mr-2" />
                  <span className="text-blue-900 font-medium">6 AM - 9 PM Daily</span>
                </div>
                <div className="flex items-center bg-blue-50 px-4 py-2 rounded-lg">
                  <FiMapPin className="text-blue-700 mr-2" />
                  <span className="text-blue-900 font-medium">Bharatpur 44200</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Static Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.7 }}
            className="grid grid-cols-2 gap-4"
          >
            <div className="bg-[url('https://picsum.photos/500/350?random=2')] bg-cover bg-center h-56 rounded-xl" />
            <div className="bg-[url('https://picsum.photos/500/350?random=3')] bg-cover bg-center h-56 rounded-xl" />
            <div className="bg-[url('https://picsum.photos/500/350?random=4')] bg-cover bg-center h-56 rounded-xl" />
            <div className="bg-[url('https://picsum.photos/500/350?random=5')] bg-cover bg-center h-56 rounded-xl" />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.7 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-blue-900 mb-4">What We Offer</h2>
            <p className="text-blue-800 max-w-3xl mx-auto">
              Discover our carefully curated selection of products and services designed to meet all your educational and creative needs
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { 
                icon: FiBook, 
                title: 'Book Collection', 
                description: 'Textbooks, course guides, literature, and hobby reads for all interests' 
              },
              { 
                icon: FiPenTool, 
                title: 'Premium Stationery', 
                description: 'Pens, notebooks, art supplies, and office essentials' 
              },
              { 
                icon: FiPrinter, 
                title: 'Print Services', 
                description: 'Photocopying, lamination, and binding for projects' 
              },
              { 
                icon: FiGift, 
                title: 'Gift Items', 
                description: 'Greeting cards, gift wraps, calendars, and planners' 
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.7, delay: index * 0.1 }}
                className="bg-white p-6 rounded-2xl shadow-lg text-center hover:shadow-xl transition-shadow duration-300"
              >
                <div className="w-16 h-16 mx-auto bg-gradient-to-r from-red-600 to-blue-600 text-white rounded-full flex items-center justify-center mb-4">
                  <feature.icon className="text-2xl" />
                </div>
                <h3 className="text-xl font-semibold text-blue-900 mb-3">{feature.title}</h3>
                <p className="text-blue-800">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold text-blue-900 mb-4">Our Core Values</h2>
          <p className="text-blue-800 max-w-3xl mx-auto">
            The principles that guide everything we do at MP Books & Stationery
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { 
              icon: FiAward, 
              title: 'Education Focus', 
              description: 'Supporting learners of all ages with affordable pricing and wide selection' 
            },
            { 
              icon: FiSmile, 
              title: 'Community First', 
              description: 'Prioritizing the needs of Bharatpur residents as a local business' 
            },
            { 
              icon: FiShoppingBag, 
              title: 'Creative Inspiration', 
              description: 'Fueling imagination for projects, designs, and personal creativity' 
            },
          ].map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.7, delay: index * 0.1 }}
              className="bg-white p-8 rounded-2xl shadow-lg"
            >
              <div className="w-16 h-16 mx-auto bg-gradient-to-r from-red-600 to-blue-600 text-white rounded-full flex items-center justify-center mb-6">
                <value.icon className="text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-blue-900 mb-3 text-center">{value.title}</h3>
              <p className="text-blue-800 text-center">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gradient-to-br from-blue-900 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.7 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">Why Choose Us</h2>
            <p className="text-blue-200 max-w-3xl mx-auto">
              Discover what makes MP Books & Stationery the preferred choice for our community
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Flexible Hours', description: 'Open daily 6 AM–9 PM to fit your schedule' },
              { title: 'Expert Service', description: 'Knowledgeable staff providing personalized recommendations' },
              { title: 'Quality Products', description: 'Carefully curated selection of premium items' },
              { title: 'Local Focus', description: 'Committed to serving the Bharatpur community' },
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.7, delay: index * 0.1 }}
                className="bg-blue-700/30 backdrop-blur-sm p-6 rounded-2xl border border-blue-600/50"
              >
                <h3 className="text-xl font-semibold mb-3 text-gold-400">{benefit.title}</h3>
                <p>{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.7 }}
          >
            <h2 className="text-3xl font-bold text-blue-900 mb-6">Get In Touch</h2>
            <p className="text-blue-800 mb-8 max-w-xl">
              Have questions or need assistance? Our friendly team is ready to help you find exactly what you need.
            </p>
            
            <div className="space-y-6 mb-8">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <FiPhone className="text-blue-700 text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-1">Phone</h3>
                  <div className="flex flex-wrap gap-4">
                    <a href="tel:+9855038599" className="text-blue-700 hover:text-red-600 transition-colors">
                      985-5038599
                    </a>
                    <a href="tel:+056534129" className="text-blue-700 hover:text-red-600 transition-colors">
                      056-534129
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <FiMapPin className="text-blue-700 text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-1">Address</h3>
                  <a 
                    href="https://maps.google.com/?q=MCGP+37F,Bharatpur+44200" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-700 hover:text-red-600 transition-colors"
                  >
                    MCGP+37F, Bharatpur 44200
                  </a>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <FiClock className="text-blue-700 text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-1">Business Hours</h3>
                  <p className="text-blue-800">Open every day from 6:00 AM–9:00 PM</p>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="bg-white p-4 rounded-2xl shadow-lg">
              <div className="aspect-w-16 aspect-h-9 rounded-xl overflow-hidden">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3533.362545998067!2d84.43567192516086!3d27.675187484913497!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3994fb2af8844661%3A0xbefff0542e12967c!2sMP%20Books%20%26%20Stationery%20Stores!5e0!3m2!1sen!2snp!4v1750483715031!5m2!1sen!2snp"
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  className="rounded-xl"
                  title="MP Books & Stationery Stores Location"
                />
              </div>
            </div>
          </motion.div>
          
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.8 }}
            className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-blue-100"
          >
            <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-900 mb-6 relative pb-4 after:absolute after:bottom-0 after:left-0 after:w-16 after:h-1 after:bg-gradient-to-r after:from-red-600 after:to-blue-600">
              Send Us a Message
            </h2>
            
            {successMessage && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-green-600 bg-green-100/50 p-3 rounded-lg text-sm mb-4 text-center"
              >
                {successMessage}
              </motion.p>
            )}
            {errorMessage && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-600 bg-red-100/50 p-3 rounded-lg text-sm mb-4 text-center"
              >
                {errorMessage}
              </motion.p>
            )}
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className={`block text-sm font-medium text-blue-900 ${errors.name ? 'text-red-600' : ''}`}
                >
                  Name
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-700" />
                  <input
                    id="name"
                    type="text"
                    placeholder="Enter your name"
                    className={`w-full pl-10 pr-4 py-2 rounded-lg bg-blue-50 text-blue-900 text-sm border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${errors.name ? 'border-red-600' : ''}`}
                    {...register('name', { required: 'Name is required' })}
                    aria-invalid={errors.name ? 'true' : 'false'}
                  />
                </div>
                {errors.name && (
                  <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className={`block text-sm font-medium text-blue-900 ${errors.email ? 'text-red-600' : ''}`}
                >
                  Email
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-700" />
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className={`w-full pl-10 pr-4 py-2 rounded-lg bg-blue-50 text-blue-900 text-sm border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${errors.email ? 'border-red-600' : ''}`}
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Invalid email address',
                      },
                    })}
                    aria-invalid={errors.email ? 'true' : 'false'}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="message"
                  className={`block text-sm font-medium text-blue-900 ${errors.message ? 'text-red-600' : ''}`}
                >
                  Message
                </label>
                <textarea
                  id="message"
                  placeholder="Your message"
                  className={`w-full px-4 py-2 rounded-lg bg-blue-50 text-blue-900 text-sm border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 resize-y min-h-32 ${errors.message ? 'border-red-600' : ''}`}
                  {...register('message', { required: 'Message is required' })}
                  aria-invalid={errors.message ? 'true' : 'false'}
                />
                {errors.message && (
                  <p className="text-red-600 text-xs mt-1">{errors.message.message}</p>
                )}
              </div>

              <motion.button
                whileHover={{ scale: prefersReducedMotion ? 1 : 1.05 }}
                whileTap={{ scale: prefersReducedMotion ? 1 : 0.95 }}
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-gradient-to-r from-red-600 to-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:from-red-700 hover:to-blue-700'}`}
                aria-label="Send Message"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message
                    <FiArrowRight className="text-lg" />
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-cream-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.7 }}
          >
            <h2 className="text-3xl font-bold text-blue-900 mb-6">Ready to Explore Our Collection?</h2>
            <p className="text-blue-800 text-xl mb-8 max-w-3xl mx-auto leading-relaxed">
              Visit us in-store or browse our online selection to discover quality books and stationery
            </p>
            <Link 
              to="/shop" 
              className="inline-flex items-center gap-3 bg-gradient-to-r from-red-600 to-blue-600 text-white font-semibold py-3 px-8 rounded-lg text-lg hover:shadow-lg transition-all"
            >
              <span>Shop Now</span>
              <FiArrowRight className="text-xl" />
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
};

export default AboutUs;