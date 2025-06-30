// frontend/src/components/admin/products/AddProduct.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUpload, FiX, FiSave } from 'react-icons/fi';
import { API_BASE_URL } from '../../utils/apiConfig';
import axios from 'axios';
import toast from 'react-hot-toast';

const initialFormData = {
  name: '',
  category: '',
  subCategory: '',
  academicCategory: '',
  class: '',
  saleType: 'piece',
  pricePerPiece: 0,
  pricePerPacket: 0,
  marketPrice: 0,
  sellPrice: 0,
  description: '',
};

// Simplified type for image state, now holding the File object
type ImageState = {
  id: string;
  previewUrl: string;
  file: File;
};

const AddProduct: React.FC<{ isEditing?: boolean }> = ({ isEditing = false }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<ImageState[]>([]);
  
  // Categories with exact values
  const categories = ['Book', 'Gift', 'Stationery', 'Sport'];
  const subCategories = ['Academic', 'Non-Academic'];
  const academicCategories = ['Science', 'Management', 'Hotel Management'];
  const classOptions = ['Class 11', 'Class 12'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Reset dependent fields when category changes
    if (name === 'category') {
      setErrors({});
      
      if (value !== 'Book') {
        setFormData(prev => ({ 
          ...prev, 
          [name]: value,
          subCategory: '',
          academicCategory: '',
          class: '',
          marketPrice: 0,
          sellPrice: 0
        }));
      } else {
        setFormData(prev => ({ 
          ...prev, 
          [name]: value,
          saleType: 'piece',
          pricePerPiece: 0,
          pricePerPacket: 0
        }));
      }
    } else if (name === 'subCategory' && value !== 'Academic') {
      setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        academicCategory: '',
        class: ''
      }));
    } else if ([
      'marketPrice',
      'sellPrice',
      'pricePerPiece',
      'pricePerPacket'
    ].includes(name)) {
      setFormData(prev => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when field is changed
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear errors when changing sale type
    if (errors.pricePerPiece || errors.pricePerPacket) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.pricePerPiece;
        delete newErrors.pricePerPacket;
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    // Required for all products
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (images.length === 0) newErrors.images = 'At least one image is required';
    
    // Category-specific validations
    if (formData.category === 'Book') {
      if (!formData.subCategory) newErrors.subCategory = 'Sub-category is required for books';
      
      if (formData.subCategory === 'Academic') {
        if (!formData.academicCategory) newErrors.academicCategory = 'Academic category is required';
        if (!formData.class) newErrors.class = 'Class is required';
      }
      
      // Book pricing validations
      if (formData.marketPrice <= 0) {
        newErrors.marketPrice = 'Market price must be greater than 0';
      }
      if (formData.sellPrice <= 0) {
        newErrors.sellPrice = 'Sell price must be greater than 0';
      }
    } else {
      // Non-book pricing validations
      if (formData.saleType === 'piece') {
        if (formData.pricePerPiece <= 0) {
          newErrors.pricePerPiece = 'Price per piece must be greater than 0';
        }
      } else if (formData.saleType === 'packet') {
        if (formData.pricePerPiece <= 0) {
          newErrors.pricePerPiece = 'Price per piece must be greater than 0';
        }
        if (formData.pricePerPacket <= 0) {
          newErrors.pricePerPacket = 'Price per packet must be greater than 0';
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    const submissionData = new FormData();

    // Append all text fields from formData state
    Object.entries(formData).forEach(([key, value]) => {
      submissionData.append(key, String(value));
    });
    
    // Manually set fields based on category, fixing the unitType bug
    if (formData.category === "Book") {
      submissionData.set('pricePerPiece', '0');
      submissionData.set('pricePerPacket', '0');
      submissionData.delete('unitType');
      submissionData.set('priceToSell', String(formData.sellPrice || 0));
      submissionData.set('marketPrice', String(formData.marketPrice || 0));
    } else {
      submissionData.set('unitType', formData.saleType === "piece" ? "Piece" : "Packet");
      submissionData.set('pricePerPiece', String(formData.pricePerPiece || 0));
      submissionData.set('pricePerPacket', formData.saleType === "packet" ? String(formData.pricePerPacket || 0) : '0');
      submissionData.set('priceToSell', '0');
      submissionData.set('marketPrice', '0');
    }

    // Append image files from our `images` state
    images.forEach(image => {
      submissionData.append('images', image.file);
    });

    try {
      const res = await axios.post(`${API_BASE_URL}/admin/products`, submissionData, {
        withCredentials: true,
      });

      if (res.data.success) {
        toast.success("Product added successfully!");
        setFormData(initialFormData);
        setImages([]);
        setErrors({});
      } else {
        toast.error(res.data.message || "Failed to add product.");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "An error occurred while adding the product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Simplified image handler, no Cloudinary upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).slice(0, 8 - images.length); // Limit to 8 total
      const newImages: ImageState[] = files.map((file, index) => ({
        id: `img-${Date.now()}-${index}`,
        previewUrl: URL.createObjectURL(file),
        file: file,
      }));

      setImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (id: string) => {
    setImages(prev => {
      const imageToRemove = prev.find(img => img.id === id);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.previewUrl);
      }
      return prev.filter(img => img.id !== id);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6 font-poppins">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-800 to-indigo-900 bg-clip-text text-transparent">
              {isEditing ? 'Edit Product' : 'Add New Product'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditing 
                ? 'Update the product details' 
                : 'Fill in the details to add a new product to your store'}
            </p>
          </div>
        </motion.div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <form onSubmit={handleSubmit}>
            <div className="p-5 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-800">Product Information</h3>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 border ${errors.name ? 'border-red-300' : 'border-gray-200'} rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Enter product name"
                />
                {errors.name && <p className="mt-1 text-red-500 text-sm">{errors.name}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`w-full px-4 py-2.5 border ${errors.category ? 'border-red-300' : 'border-gray-200'} rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                {errors.category && <p className="mt-1 text-red-500 text-sm">{errors.category}</p>}
              </div>

              {/* Book-specific fields */}
              {formData.category === 'Book' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Sub-category <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="subCategory"
                      value={formData.subCategory}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 border ${errors.subCategory ? 'border-red-300' : 'border-gray-200'} rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    >
                      <option value="">Select sub-category</option>
                      {subCategories.map(subCat => (
                        <option key={subCat} value={subCat}>{subCat}</option>
                      ))}
                    </select>
                    {errors.subCategory && <p className="mt-1 text-red-500 text-sm">{errors.subCategory}</p>}
                  </div>

                  {formData.subCategory === 'Academic' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Academic Category <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="academicCategory"
                          value={formData.academicCategory}
                          onChange={handleChange}
                          className={`w-full px-4 py-2.5 border ${errors.academicCategory ? 'border-red-300' : 'border-gray-200'} rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        >
                          <option value="">Select academic category</option>
                          {academicCategories.map(academicCat => (
                            <option key={academicCat} value={academicCat}>{academicCat}</option>
                          ))}
                        </select>
                        {errors.academicCategory && <p className="mt-1 text-red-500 text-sm">{errors.academicCategory}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Class <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="class"
                          value={formData.class}
                          onChange={handleChange}
                          className={`w-full px-4 py-2.5 border ${errors.class ? 'border-red-300' : 'border-gray-200'} rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        >
                          <option value="">Select class</option>
                          {classOptions.map(cls => (
                            <option key={cls} value={cls}>{cls}</option>
                          ))}
                        </select>
                        {errors.class && <p className="mt-1 text-red-500 text-sm">{errors.class}</p>}
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1 flex items-center">
                      Market Price ($) <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      name="marketPrice"
                      value={formData.marketPrice}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 border ${errors.marketPrice ? 'border-red-300' : 'border-gray-200'} rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="0.00"
                    />
                    {errors.marketPrice && <p className="mt-1 text-red-500 text-sm">{errors.marketPrice}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Price to Sell ($) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      name="sellPrice"
                      value={formData.sellPrice}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 border ${errors.sellPrice ? 'border-red-300' : 'border-gray-200'} rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="0.00"
                    />
                    {errors.sellPrice && <p className="mt-1 text-red-500 text-sm">{errors.sellPrice}</p>}
                  </div>
                </>
              )}

              {/* Non-Book pricing fields */}
              {formData.category !== 'Book' && (
                <>
                  <div className="md:col-span-2 border-t border-gray-100 pt-4 mt-2">
                    <h4 className="text-md font-medium text-gray-800 mb-4">Pricing</h4>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      How is this product sold? <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-6">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="saleType"
                          value="piece"
                          checked={formData.saleType === 'piece'}
                          onChange={handleRadioChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-gray-800">By Piece</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="saleType"
                          value="packet"
                          checked={formData.saleType === 'packet'}
                          onChange={handleRadioChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-gray-800">By Packet</span>
                      </label>
                    </div>
                  </div>
                  {/* Pricing Fields - Only for non-book products */}
                  {formData.saleType === 'piece' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Price per Piece ($) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        inputMode="decimal"
                        name="pricePerPiece"
                        value={formData.pricePerPiece}
                        onChange={handleChange}
                        className={`w-full px-4 py-2.5 border ${errors.pricePerPiece ? 'border-red-300' : 'border-gray-200'} rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        placeholder="0.00"
                      />
                      {errors.pricePerPiece && <p className="mt-1 text-red-500 text-sm">{errors.pricePerPiece}</p>}
                    </div>
                  )}
                  {formData.saleType === 'packet' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Price per Packet ($) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          inputMode="decimal"
                          name="pricePerPacket"
                          value={formData.pricePerPacket}
                          onChange={handleChange}
                          className={`w-full px-4 py-2.5 border ${errors.pricePerPacket ? 'border-red-300' : 'border-gray-200'} rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                          placeholder="0.00"
                        />
                        {errors.pricePerPacket && <p className="mt-1 text-red-500 text-sm">{errors.pricePerPacket}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Price per Piece ($) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          inputMode="decimal"
                          name="pricePerPiece"
                          value={formData.pricePerPiece}
                          onChange={handleChange}
                          className={`w-full px-4 py-2.5 border ${errors.pricePerPiece ? 'border-red-300' : 'border-gray-200'} rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                          placeholder="0.00"
                        />
                        {errors.pricePerPiece && <p className="mt-1 text-red-500 text-sm">{errors.pricePerPiece}</p>}
                      </div>
                    </>
                  )}
                </>
              )}
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className={`w-full px-4 py-2.5 border ${errors.description ? 'border-red-300' : 'border-gray-200'} rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Enter detailed product description"
                />
                {errors.description && <p className="mt-1 text-red-500 text-sm">{errors.description}</p>}
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Product Images <span className="text-red-500">*</span>
                </label>
                
                {errors.images && (
                  <p className="text-red-500 text-sm mb-2">{errors.images}</p>
                )}
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-2">
                  {images.map((image) => (
                    <div key={image.id} className="relative group">
                      <div className="bg-gray-50 border border-gray-200 rounded-xl h-32 flex items-center justify-center overflow-hidden">
                        <img 
                          src={image.previewUrl} 
                          alt={`Preview ${image.id}`} 
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        className="absolute top-1 right-1 bg-red-100 text-red-700 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(image.id)}
                      >
                        <FiX size={16} />
                      </motion.button>
                    </div>
                  ))}
                  
                  {images.length < 8 && (
                    <label className="bg-blue-100 border border-dashed border-blue-300 rounded-xl h-32 flex flex-col items-center justify-center text-blue-700 hover:bg-blue-200 cursor-pointer">
                      <input 
                        type="file" 
                        className="hidden" 
                        onChange={handleImageUpload}
                        accept="image/*"
                        multiple
                      />
                      <FiUpload className="text-xl mb-1" />
                      <span className="text-xs">Add Image</span>
                      <span className="text-xs mt-1">({8 - images.length} remaining)</span>
                    </label>
                  )}
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Upload up to 8 images. First image will be the main thumbnail.
                </p>
              </div>
            </div>
            
            <div className="p-5 border-t border-gray-200 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                className="px-5 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-75"
              >
                <FiSave className="text-lg" />
                <span>{isSubmitting ? 'Saving...' : 'Save Product'}</span>
              </motion.button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;