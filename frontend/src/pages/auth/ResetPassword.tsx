import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { FiEye, FiEyeOff, FiLock, FiArrowRight, FiCheck } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import type { SubmitHandler } from 'react-hook-form';
import { API_BASE_URL } from '../../utils/apiConfig';
import axios from 'axios';
import toast from 'react-hot-toast';

interface ResetPasswordForm {
  resetCode: string;
  password: string;
  confirmPassword: string;
}

const ResetPassword: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const email = location.state?.email;
  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ResetPasswordForm>();

  const passwordResetForm = watch('password');

  // Check for reset code in URL parameters
  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      setValue('resetCode', code);
      toast.success('Reset code found in email link!');
    }
  }, [searchParams, setValue]);

  const onSubmit: SubmitHandler<ResetPasswordForm> = async (formData) => {
    setIsLoading(true);
    try {
      const payload = {
        resetCode: formData.resetCode,
        password: formData.password,
      };
      await axios.put(`${API_BASE_URL}/password/reset`, payload);
      toast.success('Password reset successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Password reset failed');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  return (
    <main className="w-full min-h-screen bg-gradient-to-b from-cream-50 to-cream-100 font-poppins flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-wave-pattern bg-repeat opacity-5 animate-wave" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.6, ease: 'easeOut' }}
        className="max-w-md w-full bg-gradient-to-b from-cream-50 to-cream-100 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-cream-200 relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10 bg-[url('/nepali-pattern.png')] bg-repeat" />
        <div className="relative z-10">
          <div className="text-center mb-8">
            <motion.div
              className="w-16 h-16 mx-auto bg-gradient-to-r from-red-600 to-blue-600 text-white rounded-full flex items-center justify-center mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: prefersReducedMotion ? 0 : 0.5 }}
            >
              <FiLock className="text-2xl" />
            </motion.div>
            <motion.h1
              className="text-3xl font-bold text-blue-900 mb-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: prefersReducedMotion ? 0 : 0.5 }}
            >
              Reset Password
            </motion.h1>
            <motion.p
              className="text-blue-800 text-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: prefersReducedMotion ? 0 : 0.5 }}
            >
              Enter the reset code sent to {email ? <strong>{email}</strong> : 'your email'} and your new password
            </motion.p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: prefersReducedMotion ? 0 : 0.5 }}
              className="space-y-2"
            >
              <label
                htmlFor="resetCode"
                className={`block text-sm font-medium text-blue-900 ${
                  errors.resetCode ? 'text-red-600' : ''
                }`}
              >
                Reset Code
              </label>
              <input
                id="resetCode"
                type="text"
                placeholder="Enter 6-digit code"
                autoFocus
                className={`w-full px-4 py-3 rounded-lg bg-cream-50 text-blue-900 text-sm border focus:outline-none focus:ring-2 focus:ring-gold-400 transition-all duration-200 ${
                  errors.resetCode ? 'border-red-600' : 'border-cream-200'
                }`}
                {...register('resetCode', {
                  required: 'Reset code is required',
                  pattern: {
                    value: /^\d{6}$/,
                    message: 'Code must be a 6-digit number',
                  },
                })}
                aria-invalid={errors.resetCode ? 'true' : 'false'}
              />
              {errors.resetCode && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-600 text-xs"
                >
                  {errors.resetCode.message}
                </motion.p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: prefersReducedMotion ? 0 : 0.5 }}
              className="space-y-2"
            >
              <label
                htmlFor="password"
                className={`block text-sm font-medium text-blue-900 ${
                  errors.password ? 'text-red-600' : ''
                }`}
              >
                New Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-900/60" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  className={`w-full pl-10 pr-12 py-3 rounded-lg bg-cream-50 text-blue-900 text-sm border focus:outline-none focus:ring-2 focus:ring-gold-400 transition-all duration-200 ${
                    errors.password ? 'border-red-600' : 'border-cream-200'
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
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-900/60 hover:text-blue-900"
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

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: prefersReducedMotion ? 0 : 0.5 }}
              className="space-y-2"
            >
              <label
                htmlFor="confirmPassword"
                className={`block text-sm font-medium text-blue-900 ${
                  errors.confirmPassword ? 'text-red-600' : ''
                }`}
              >
                Confirm Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-900/60" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  className={`w-full pl-10 pr-12 py-3 rounded-lg bg-cream-50 text-blue-900 text-sm border focus:outline-none focus:ring-2 focus:ring-gold-400 transition-all duration-200 ${
                    errors.confirmPassword ? 'border-red-600' : 'border-cream-200'
                  }`}
                  {...register('confirmPassword', {
                    required: 'Please confirm password',
                    validate: (value) =>
                      value === passwordResetForm || 'Passwords do not match',
                  })}
                  aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-900/60 hover:text-blue-900"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.confirmPassword && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-600 text-xs"
                >
                  {errors.confirmPassword.message}
                </motion.p>
              )}
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: prefersReducedMotion ? 0 : 0.5 }}
              whileHover={{ scale: prefersReducedMotion ? 1 : 1.05 }}
              whileTap={{ scale: prefersReducedMotion ? 1 : 0.95 }}
              type="submit"
              disabled={isLoading}
              className={`w-full bg-gradient-to-r from-red-600 to-blue-600 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              aria-label="Reset Password"
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
                  Resetting...
                </>
              ) : (
                <>
                  Reset Password
                  <FiArrowRight className="text-lg" />
                </>
              )}
            </motion.button>
          </form>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: prefersReducedMotion ? 0 : 0.5 }}
            className="text-center mt-8"
          >
            <p className="text-sm text-blue-800/80">
              Back to{' '}
              <Link to="/login" className="text-gold-400 hover:text-gold-300 transition-colors duration-200 font-medium">
                Log In
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </main>
  );
};

export default ResetPassword;