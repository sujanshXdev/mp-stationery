import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import axios from 'axios';
import { API_BASE_URL, SERVER_BASE_URL } from '../utils/apiConfig';

const PosterModal: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();
  const [isOpen, setIsOpen] = useState(false);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Fetch poster URL from the backend
  useEffect(() => {
    const fetchPoster = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/poster`, { withCredentials: true });
        if (response.data.success && response.data.poster) {
          setPosterUrl(response.data.poster.image);
        }
      } catch (error) {
        console.error('Error fetching poster:', error);
      }
    };

    const hasShown = sessionStorage.getItem('hasShownPosterModal');
    if (!hasShown) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        fetchPoster();
        sessionStorage.setItem('hasShownPosterModal', 'true');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const getImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${SERVER_BASE_URL}/${path}`;
  };

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Accessibility: Focus trap and escape key handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const modal = modalRef.current;
    const focusableElements = modal?.querySelectorAll('button');
    const firstElement = focusableElements?.[0] as HTMLElement;
    const lastElement = focusableElements?.[focusableElements.length - 1] as HTMLElement;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    if (isOpen) {
      closeButtonRef.current?.focus();
      modal?.addEventListener('keydown', handleTab);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      modal?.removeEventListener('keydown', handleTab);
    };
  }, [isOpen, handleClose]);

  const modalVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: prefersReducedMotion ? 0 : 0.25,
        ease: "easeOut"
      } 
    },
    exit: { 
      opacity: 0,
      transition: { duration: prefersReducedMotion ? 0 : 0.15 }
    },
  };

  const iconVariants = {
    normal: { scale: 1, rotate: 0 },
    hover: { scale: 1.1, rotate: 90 },
    tap: { scale: 0.95 }
  };

  if (!isOpen || !posterUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="poster-modal-title"
    >
      <motion.div
        ref={modalRef}
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={modalVariants}
        className="relative bg-white p-5 rounded-lg max-w-4xl w-full mx-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Beautiful Close Icon */}
        <motion.button
          ref={closeButtonRef}
          onClick={handleClose}
          className="absolute -top-3 -right-3 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-lg border border-gray-200 focus:outline-none"
          aria-label="Close modal"
          variants={iconVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <div className="relative w-6 h-6">
            <FiX className="absolute inset-0 text-gray-600 w-full h-full" />
          </div>
        </motion.button>
        
        <div className="flex flex-col">
          <motion.div 
            className="w-full overflow-hidden rounded-sm"
          >
            <img
              src={getImageUrl(posterUrl)}
              alt="Promotional Poster"
              className="w-full object-contain max-h-[70vh]"
            />
          </motion.div>
          
          <div className="mt-5 flex justify-end space-x-3">
            {/* Download button removed */}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PosterModal;