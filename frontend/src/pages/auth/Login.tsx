import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiUser } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../utils/apiConfig';

interface LoginForm {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  useEffect(() => {
    if (location.state?.message) {
      toast.success(location.state.message);
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit: SubmitHandler<LoginForm> = async (data) => {
    setIsLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/login`, data, { withCredentials: true });
      toast.success('Logged in successfully!');
      await login();
      
      // Get the user data to determine role-based redirect
      const { data: userData } = await axios.get(`${API_BASE_URL}/me`, { withCredentials: true });
      
      // Redirect based on user role
      if (userData.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        // Check if there's a redirect path from location state (for protected routes)
        const from = location.state?.from?.pathname || '/';
        navigate(from);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <main className="w-full min-h-screen bg-gradient-to-b from-cream-50 to-cream-100 font-poppins flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-wave-pattern bg-repeat opacity-5 animate-wave" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.6, ease: 'easeOut' }}
        className="w-full max-w-md bg-gradient-to-b from-cream-50 to-cream-100 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-cream-200 relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10 bg-[url('/nepali-pattern.png')] bg-repeat" />
        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              className="w-16 h-16 mx-auto bg-gradient-to-r from-red-600 to-blue-600 text-white rounded-full flex items-center justify-center mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: prefersReducedMotion ? 0 : 0.5 }}
            >
              <FiUser className="text-2xl" />
            </motion.div>
            <motion.h1
              className="text-3xl font-bold text-blue-900 mb-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: prefersReducedMotion ? 0 : 0.5 }}
            >
              Welcome Back
            </motion.h1>
            <motion.p
              className="text-blue-800 text-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: prefersReducedMotion ? 0 : 0.5 }}
            >
              Log in to explore our premium collection
            </motion.p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: prefersReducedMotion ? 0 : 0.5 }}
              className="space-y-2"
            >
              <label
                htmlFor="email"
                className="block text-sm font-medium text-blue-900"
              >
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-900/60" />
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className={`w-full pl-10 pr-4 py-3 rounded-lg bg-cream-50 text-blue-900 text-sm border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gold-400 ${
                    errors.email ? 'border-red-500' : 'border-cream-200'
                  }`}
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
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-600 text-xs"
                >
                  {errors.email.message}
                </motion.p>
              )}
            </motion.div>

            {/* Password Field */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: prefersReducedMotion ? 0 : 0.5 }}
              className="space-y-2"
            >
              <label
                htmlFor="password"
                className="block text-sm font-medium text-blue-900"
              >
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-900/60" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className={`w-full pl-10 pr-12 py-3 rounded-lg bg-cream-50 text-blue-900 text-sm border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gold-400 ${
                    errors.password ? 'border-red-500' : 'border-cream-200'
                  }`}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  aria-invalid={errors.password ? 'true' : 'false'}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-900/60 hover:text-blue-900 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-600 text-xs"
                >
                  {errors.password.message}
                </motion.p>
              )}
            </motion.div>

            {/* Forgot Password Link */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: prefersReducedMotion ? 0 : 0.5 }}
              className="flex justify-end"
            >
              <Link
                to="/forgot-password"
                className="text-sm text-gold-400 hover:text-gold-300 transition-colors duration-200"
              >
                Forgot Password?
              </Link>
            </motion.div>

            {/* Submit Button */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: prefersReducedMotion ? 0 : 0.5 }}
              whileHover={{ scale: prefersReducedMotion ? 1 : 1.02 }}
              whileTap={{ scale: prefersReducedMotion ? 1 : 0.98 }}
              type="submit"
              disabled={isLoading}
              className={`w-full bg-gradient-to-r from-red-600 to-blue-600 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              aria-label="Log In"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
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
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Logging In...
                </>
              ) : (
                <>
                  Log In
                  <FiArrowRight className="text-lg" />
                </>
              )}
            </motion.button>
          </form>

          {/* Register Link */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: prefersReducedMotion ? 0 : 0.5 }}
            className="text-center mt-8 pt-6 border-t border-cream-200"
          >
            <p className="text-sm text-blue-800/80">
              Don't have an account?{' '}
              <Link to="/register" className="text-gold-400 hover:text-gold-300 transition-colors duration-200 font-medium">
                Register
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </main>
  );
};

export default Login;