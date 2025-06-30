import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
  id: string;
  name: string;
  description: string;
  pricePerPacket?: number;
  pricePerPiece?: number;
  images?: string[];
}

interface UnitSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (unitType: 'Packet' | 'Piece') => void;
  product: Product | null;
}

const UnitSelectionModal: React.FC<UnitSelectionModalProps> = ({ isOpen, onClose, onSelect, product }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Close modal on Escape key press
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!product) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-opacity-70 backdrop-blur-md flex items-center justify-center z-[1000] p-4"
        >
          <motion.div
            ref={modalRef}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md relative overflow-hidden border border-gray-100"
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-6 relative">
              <div className="absolute top-0 left-0 w-full h-full opacity-10">
                <div className="absolute top-4 left-4 w-24 h-24 rounded-full bg-white"></div>
                <div className="absolute bottom-4 right-4 w-16 h-16 rounded-full bg-white"></div>
              </div>
              
              <div className="relative z-10 text-center">
                <h3 className="text-xl font-bold text-white">Select Unit Type</h3>
                <p className="text-indigo-100 mt-1 font-medium">{product.name}</p>
              </div>
            </div>
            
            {/* Product Image - Fixed display */}
            <div className="flex justify-center -mt-8 mb-4">
              <div className="bg-white rounded-full p-1 shadow-xl border-4 border-white">
                <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl w-20 h-20 flex items-center justify-center overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <img 
                      src={product.images[0]} 
                      alt={product.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center p-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs text-indigo-500 mt-1">Product</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Pricing Cards */}
            <div className="px-6 pb-8 pt-2">
              <div className="grid grid-cols-1 gap-5">
                {/* Packet Option */}
                <motion.div
                  whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.25)' }}
                  className="border border-indigo-100 rounded-xl p-5 bg-gradient-to-br from-white to-indigo-50 cursor-pointer relative overflow-hidden"
                  onClick={() => onSelect('Packet')}
                >
                  <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-indigo-500 opacity-10"></div>
                  <div className="flex justify-between items-center relative z-10">
                    <div className="flex items-center">
                      <div className="bg-indigo-100 p-2 rounded-lg mr-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">Packet</h4>
                        <p className="text-sm text-gray-500 mt-1">Price per packet</p>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg px-3 py-1.5">
                      <span className="font-bold text-white text-sm">
                        Rs. {product.pricePerPacket?.toLocaleString() || 'N/A'}
                      </span>
                    </div>
                  </div>
                </motion.div>
                
                {/* Piece Option */}
                <motion.div
                  whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(139, 92, 246, 0.25)' }}
                  className="border border-purple-100 rounded-xl p-5 bg-gradient-to-br from-white to-purple-50 cursor-pointer relative overflow-hidden"
                  onClick={() => onSelect('Piece')}
                >
                  <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-purple-500 opacity-10"></div>
                  <div className="flex justify-between items-center relative z-10">
                    <div className="flex items-center">
                      <div className="bg-purple-100 p-2 rounded-lg mr-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">Piece</h4>
                        <p className="text-sm text-gray-500 mt-1">Price per piece</p>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg px-3 py-1.5">
                      <span className="font-bold text-white text-sm">
                        Rs. {product.pricePerPiece?.toLocaleString() || 'N/A'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>
              
              {/* Additional info */}
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-500 inline-flex items-center justify-center bg-gray-50 px-4 py-2 rounded-full w-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Select your preferred unit type to add to cart
                </p>
              </div>
            </div>
            
            {/* SIMPLE CLOSE BUTTON - NO ANIMATIONS */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white flex items-center justify-center text-indigo-700 hover:bg-indigo-50 transition-colors shadow-lg border border-indigo-100"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UnitSelectionModal;