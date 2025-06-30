import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiLock, FiEye, FiEyeOff, FiArrowRight, FiRefreshCw } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { API_BASE_URL } from '../../utils/apiConfig';
import axios from 'axios';
import toast from 'react-hot-toast';

interface RegisterForm {
  name: string;
  email: string;
  phone: string;
  password: string;
}

interface VerifyForm {
  code: string;
}

const Register: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isVerificationStep, setIsVerificationStep] = useState(false);
  const [email, setEmailInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Register Form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>();

  // Verification Form
  const {
    register: registerVerify,
    handleSubmit: handleVerifySubmit,
    setValue: setVerifyValue,
    formState: { errors: verifyErrors },
  } = useForm<VerifyForm>();

  // Check for verification code and email in URL parameters
  useEffect(() => {
    const code = searchParams.get('code');
    const emailParam = searchParams.get('email');
    
    if (code && emailParam) {
      setEmailInput(emailParam);
      setIsVerificationStep(true);
      // Pre-fill the verification code
      setVerifyValue('code', code);
      toast.success('Verification code found in email link!');
    }
  }, [searchParams, setVerifyValue]);

  const onRegisterSubmit: SubmitHandler<RegisterForm> = async (data) => {
    setIsLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/register`, data);
      setEmailInput(data.email);
      setIsVerificationStep(true);
      toast.success('Verification code sent to your email!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const onVerifySubmit: SubmitHandler<VerifyForm> = async (data) => {
    setIsLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/verify-email`, {
        email,
        code: data.code,
      });
      navigate('/login', { state: { message: 'Email verified successfully. Please log in.' } });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    try {
      await axios.post(`${API_BASE_URL}/resend-verification-code`, { email });
      toast.success('Verification code resent to your email');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to resend code');
    } finally {
      setIsResending(false);
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
              {isVerificationStep ? 'Verify Your Email' : 'Create an Account'}
            </motion.h1>
            <motion.p
              className="text-blue-800 text-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: prefersReducedMotion ? 0 : 0.5 }}
            >
              {isVerificationStep
                ? 'Enter the code sent to your email'
                : 'Join us to explore our premium collection'}
            </motion.p>
          </div>

          {!isVerificationStep ? (
            <form onSubmit={handleSubmit(onRegisterSubmit)} className="space-y-6">
              {/* Name Field */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: prefersReducedMotion ? 0 : 0.5 }}
                className="space-y-2"
              >
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-blue-900"
                >
                  Full Name
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-900/60" />
                  <input
                    id="name"
                    type="text"
                    placeholder="Enter your name"
                    className={`w-full pl-10 pr-4 py-3 rounded-lg bg-cream-50 text-blue-900 text-sm border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gold-400 ${
                      errors.name ? 'border-red-500' : 'border-cream-200'
                    }`}
                    {...register('name', { required: 'Name is required' })}
                    aria-invalid={errors.name ? 'true' : 'false'}
                  />
                </div>
                {errors.name && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-600 text-xs"
                  >
                    {errors.name.message}
                  </motion.p>
                )}
              </motion.div>

              {/* Email Field */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: prefersReducedMotion ? 0 : 0.5 }}
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

              {/* Phone Field */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: prefersReducedMotion ? 0 : 0.5 }}
                className="space-y-2"
              >
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-blue-900"
                >
                  Phone Number
                </label>
                <div className="relative">
                  <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-900/60" />
                  <input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    className={`w-full pl-10 pr-4 py-3 rounded-lg bg-cream-50 text-blue-900 text-sm border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gold-400 ${
                      errors.phone ? 'border-red-500' : 'border-cream-200'
                    }`}
                    {...register('phone', {
                      required: 'Phone number is required',
                      pattern: {
                        value: /^\+?[1-9]\d{1,14}$/,
                        message: 'Invalid phone number',
                      },
                    })}
                    aria-invalid={errors.phone ? 'true' : 'false'}
                  />
                </div>
                {errors.phone && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-600 text-xs"
                  >
                    {errors.phone.message}
                  </motion.p>
                )}
              </motion.div>

              {/* Password Field */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: prefersReducedMotion ? 0 : 0.5 }}
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
                      minLength: { value: 6, message: 'Password must be at least 6 characters' },
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

              {/* Submit Button */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: prefersReducedMotion ? 0 : 0.5 }}
                whileHover={{ scale: prefersReducedMotion ? 1 : 1.02 }}
                whileTap={{ scale: prefersReducedMotion ? 1 : 0.98 }}
                type="submit"
                disabled={isLoading}
                className={`w-full bg-gradient-to-r from-red-600 to-blue-600 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                aria-label="Register"
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
                    Registering...
                  </>
                ) : (
                  <>
                    Register
                    <FiArrowRight className="text-lg" />
                  </>
                )}
              </motion.button>
            </form>
          ) : (
            <form onSubmit={handleVerifySubmit(onVerifySubmit)} className="space-y-6">
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: prefersReducedMotion ? 0 : 0.5 }}
                className="text-sm text-blue-800/80 text-center"
              >
                A verification code has been sent to <strong>{email}</strong>.
              </motion.p>
              
              {/* Verification Code Field */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: prefersReducedMotion ? 0 : 0.5 }}
                className="space-y-2"
              >
                <label
                  htmlFor="code"
                  className="block text-sm font-medium text-blue-900"
                >
                  Verification Code
                </label>
                <input
                  id="code"
                  type="text"
                  placeholder="Enter 6-digit code"
                  autoFocus
                  className={`w-full px-4 py-3 rounded-lg bg-cream-50 text-blue-900 text-sm border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gold-400 ${
                    verifyErrors.code ? 'border-red-500' : 'border-cream-200'
                  }`}
                  {...registerVerify('code', {
                    required: 'Verification code is required',
                    pattern: {
                      value: /^\d{6}$/,
                      message: 'Code must be a 6-digit number',
                    },
                  })}
                  aria-invalid={verifyErrors.code ? 'true' : 'false'}
                />
                {verifyErrors.code && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-600 text-xs"
                  >
                    {verifyErrors.code.message}
                  </motion.p>
                )}
              </motion.div>

              {/* Verify Button */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: prefersReducedMotion ? 0 : 0.5 }}
                whileHover={{ scale: prefersReducedMotion ? 1 : 1.02 }}
                whileTap={{ scale: prefersReducedMotion ? 1 : 0.98 }}
                type="submit"
                disabled={isLoading}
                className={`w-full bg-gradient-to-r from-red-600 to-blue-600 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                aria-label="Verify Email"
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
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify Email
                    <FiArrowRight className="text-lg" />
                  </>
                )}
              </motion.button>

              {/* Resend Code Button */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: prefersReducedMotion ? 0 : 0.5 }}
                whileHover={{ scale: prefersReducedMotion ? 1 : 1.02 }}
                whileTap={{ scale: prefersReducedMotion ? 1 : 0.98 }}
                type="button"
                onClick={handleResendCode}
                disabled={isLoading || isResending}
                className={`w-full text-gold-400 hover:text-gold-300 text-sm text-center transition-colors duration-200 ${
                  (isLoading || isResending) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                aria-label="Resend verification code"
              >
                {isResending ? 'Resending...' : 'Resend Code'}
              </motion.button>
            </form>
          )}

          {/* Login Link */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: prefersReducedMotion ? 0 : 0.5 }}
            className="text-center mt-8 pt-6 border-t border-cream-200"
          >
            <p className="text-sm text-blue-800/80">
              {!isVerificationStep ? 'Already have an account? ' : 'Back to registration? '}
              <Link 
                to={!isVerificationStep ? "/login" : "/register"} 
                onClick={() => !isVerificationStep || setIsVerificationStep(false)}
                className="text-gold-400 hover:text-gold-300 transition-colors duration-200 font-medium"
              >
                {!isVerificationStep ? 'Log In' : 'Register'}
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </main>
  );
};

export default Register;