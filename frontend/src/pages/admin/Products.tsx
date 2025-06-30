import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiSearch, 
  FiEdit, 
  FiTrash2, 
  FiEye, 
  FiX, 
  FiPlus, 
  FiCheck, 
  FiFilter,
  FiChevronLeft,
  FiChevronRight,
  FiPackage,
  FiImage
} from 'react-icons/fi';
import { API_BASE_URL, SERVER_BASE_URL } from '../../utils/apiConfig';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Product {
  _id: string;
  name: string;
  category: string;
  stock: number;
  description: string;
  images: string[];
  createdAt: string;
  price?: number;
  priceToSell?: number;
  marketPrice?: number;
  pricePerPacket?: number;
  pricePerPiece?: number;
  unitType?: string;
}

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<string>('');
  const [editedProduct, setEditedProduct] = useState<Partial<Product>>({});
  const [newImages, setNewImages] = useState<File[]>([]);
  const itemsPerPage = 8;

  const categories = ['Books', 'Stationery', 'Gifts', 'Sports', 'Beauty', 'Electronics', 'Clothing', 'Home & Kitchen'];

  const getImageUrl = (path?: string) => {
    if (!path) return '/stationery.jpg';
    if (path.startsWith('http')) return path;
    return `${SERVER_BASE_URL}/${path}`;
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_BASE_URL}/products`, { withCredentials: true });
      setProducts(data.products);
      setFilteredProducts(data.products);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter and search logic
  useEffect(() => {
    let result = products;
    
    if (searchTerm) {
      result = result.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (categoryFilter !== 'all') {
      result = result.filter(product => product.category === categoryFilter);
    }
    
    setFilteredProducts(result);
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, products]);

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Product actions
  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setViewModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setEditedProduct({ ...product });
    setNewImages([]);
    setEditModalOpen(true);
  };

  const handleDeleteProduct = (product: Product) => {
    setSelectedProduct(product);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedProduct) {
      try {
        await axios.delete(`${API_BASE_URL}/admin/products/${selectedProduct._id}`, { withCredentials: true });
        toast.success('Product deleted successfully');
        fetchProducts(); // Refetch products after deletion
        setDeleteModalOpen(false);
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to delete product');
      }
    }
  };

  const handleUpdateProduct = async () => {
    if (selectedProduct) {
      const formData = new FormData();
      
      // Append all non-file fields from editedProduct
      Object.entries(editedProduct).forEach(([key, value]) => {
        if (key !== 'images') {
          formData.append(key, value as string);
        }
      });
      
      // Append the list of images to keep
      const imagesToKeep = editedProduct.images || [];
      formData.append('imagesToKeep', JSON.stringify(imagesToKeep));
      
      // Append new image files
      newImages.forEach(file => {
        formData.append('images', file);
      });

      try {
        await axios.put(`${API_BASE_URL}/admin/products/${selectedProduct._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true,
        });
        toast.success('Product updated successfully');
        fetchProducts();
        setEditModalOpen(false);
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to update product');
      }
    }
  };

  const handleImageRemove = (imgToRemove: string) => {
    if (editedProduct.images) {
      setEditedProduct({
        ...editedProduct,
        images: editedProduct.images.filter(img => img !== imgToRemove),
      });
    }
  };

  const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewImages(Array.from(e.target.files));
    }
  };

  // Bulk actions
  const toggleSelectProduct = (id: string) => {
    if (selectedProductIds.includes(id)) {
      setSelectedProductIds(selectedProductIds.filter(productId => productId !== id));
    } else {
      setSelectedProductIds([...selectedProductIds, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedProductIds.length === currentProducts.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(currentProducts.map(product => product._id));
    }
  };

  const handleBulkAction = () => {
    if (bulkAction === 'delete') {
      // This would need a backend endpoint that accepts an array of IDs
      // For now, we'll just show a message.
      toast.error('Bulk deletion is not yet implemented.');
    }
    setSelectedProductIds([]);
    setBulkAction('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6 font-poppins">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-800 to-indigo-900 bg-clip-text text-transparent">
              Product Management
            </h1>
            <p className="text-gray-600 mt-1">Manage your store's products and inventory</p>
          </div>
          <Link to="/admin/products/add-product">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-5 py-3 rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              <FiPlus className="text-lg" />
              <span>Add Product</span>
            </motion.button>
          </Link>
        </motion.div>

        {/* Filters */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm p-5 mb-6 border border-gray-100"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiFilter className="text-gray-500" />
              </div>
              <select
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            {selectedProductIds.length > 0 && (
              <div className="flex gap-2">
                <select
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                >
                  <option value="">Bulk Actions</option>
                  <option value="delete">Delete</option>
                  <option value="publish">Publish</option>
                  <option value="draft">Move to Draft</option>
                </select>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-4 py-2.5 rounded-xl disabled:opacity-50"
                  disabled={!bulkAction}
                  onClick={handleBulkAction}
                >
                  Apply
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Product Table */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100"
        >
          {loading ? (
            <div className="flex justify-center items-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                            checked={selectedProductIds.length === currentProducts.length && currentProducts.length > 0}
                            onChange={toggleSelectAll}
                          />
                        </div>
                      </th>
                      <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th scope="col" className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th scope="col" className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentProducts.map((product) => (
                      <tr 
                        key={product._id} 
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => handleViewProduct(product)}
                      >
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                              checked={selectedProductIds.includes(product._id)}
                              onChange={() => toggleSelectProduct(product._id)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                              {product.images && product.images.length > 0 ? (
                                <img 
                                  src={getImageUrl(product.images[0])} 
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  <FiImage />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">{product.name}</p>
                              <p className="text-sm text-gray-500">{product.category}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700">{product.category}</td>
                        <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                          {(() => {
                            if (product.category === "Book") {
                              return `Rs ${(product.priceToSell ?? product.marketPrice ?? 0).toFixed(2)}`;
                            } else if (product.unitType === "Packet") {
                              return `Rs ${(product.pricePerPacket ?? 0).toFixed(2)}`;
                            } else {
                              return `Rs ${(product.pricePerPiece ?? 0).toFixed(2)}`;
                            }
                          })()}
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-3">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="text-blue-600 hover:text-blue-800"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewProduct(product);
                              }}
                            >
                              <FiEye size={18} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="text-indigo-600 hover:text-indigo-800"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditProduct(product);
                              }}
                            >
                              <FiEdit size={18} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="text-red-600 hover:text-red-800"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteProduct(product);
                              }}
                            >
                              <FiTrash2 size={18} />
                            </motion.button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              <div className="bg-gray-50 px-5 py-3 flex flex-col md:flex-row items-center justify-between border-t border-gray-200">
                <div className="text-sm text-gray-600 mb-4 md:mb-0">
                  Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(indexOfLastItem, filteredProducts.length)}
                  </span>{' '}
                  of <span className="font-medium">{filteredProducts.length}</span> products
                </div>
                <div className="flex items-center space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-xl ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <FiChevronLeft />
                  </motion.button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <motion.button
                      key={page}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 rounded-xl ${
                        currentPage === page
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white'
                          : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </motion.button>
                  ))}
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-xl ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <FiChevronRight />
                  </motion.button>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* View Product Modal */}
      {viewModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200"
          >
            <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-2xl">
              <h3 className="text-xl font-bold text-gray-800">Product Details</h3>
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setViewModalOpen(false)}
              >
                <FiX size={24} />
              </motion.button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-medium text-gray-800 mb-4 pb-2 border-b border-gray-200">Product Images</h4>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4">
                    {selectedProduct.images.map((img, index) => (
                      <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl h-24 flex items-center justify-center overflow-hidden">
                        <img 
                          src={getImageUrl(img)}
                          alt={`Product ${index + 1}`} 
                          className="object-cover w-full h-full"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium text-gray-800 mb-4 pb-2 border-b border-gray-200">Product Information</h4>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Product Name</p>
                      <p className="font-medium text-gray-800">{selectedProduct.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Description</p>
                      <p className="font-medium text-gray-800">{selectedProduct.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Category</p>
                        <p className="font-medium text-gray-800">{selectedProduct.category}</p>
                      </div>
                      {selectedProduct.category === 'Book' && (
                        <div>
                          <p className="text-sm text-gray-500">Price</p>
                          <p className="font-medium text-gray-800">
                            {`Rs ${(selectedProduct.priceToSell ?? selectedProduct.marketPrice ?? 0).toFixed(2)}`}
                          </p>
                        </div>
                      )}
                    </div>
                    {selectedProduct.category !== 'Book' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Unit Type</p>
                          <p className="font-medium text-gray-800">{selectedProduct.unitType || '–'}</p>
                        </div>
                        {selectedProduct.unitType && selectedProduct.unitType.toLowerCase() === 'packet' && (
                          <>
                            <div>
                              <p className="text-sm text-gray-500">Price Per Packet</p>
                              <p className="font-medium text-gray-800">{selectedProduct.pricePerPacket !== undefined ? `Rs ${selectedProduct.pricePerPacket.toFixed(2)}` : '–'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Price Per Piece</p>
                              <p className="font-medium text-gray-800">{selectedProduct.pricePerPiece !== undefined ? `Rs ${selectedProduct.pricePerPiece.toFixed(2)}` : '–'}</p>
                            </div>
                          </>
                        )}
                        {selectedProduct.unitType && selectedProduct.unitType.toLowerCase() === 'piece' && (
                          <div>
                            <p className="text-sm text-gray-500">Price Per Piece</p>
                            <p className="font-medium text-gray-800">{selectedProduct.pricePerPiece !== undefined ? `Rs ${selectedProduct.pricePerPiece.toFixed(2)}` : '–'}</p>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Date Added</p>
                        <p className="font-medium text-gray-800">
                          {new Date(selectedProduct.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-gray-200 flex justify-end bg-gray-50 rounded-b-2xl">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg"
                onClick={() => setViewModalOpen(false)}
              >
                Close
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-gray-200"
          >
            <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-2xl">
              <h3 className="text-xl font-bold text-gray-800">Edit Product</h3>
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setEditModalOpen(false)}
              >
                <FiX size={24} />
              </motion.button>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Product Name</label>
                  <input
                    type="text"
                    value={editedProduct.name || ''}
                    onChange={(e) => setEditedProduct({ ...editedProduct, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Category</label>
                  <select
                    value={editedProduct.category || ''}
                    onChange={(e) => setEditedProduct({ ...editedProduct, category: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                {/* Book-specific fields */}
                {editedProduct.category === 'Book' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Market Price (Rs)</label>
                      <input
                        type="number"
                        value={editedProduct.marketPrice ?? ''}
                        onChange={e => setEditedProduct({ ...editedProduct, marketPrice: Number(e.target.value) })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Price To Sell (Rs)</label>
                      <input
                        type="number"
                        value={editedProduct.priceToSell ?? ''}
                        onChange={e => setEditedProduct({ ...editedProduct, priceToSell: Number(e.target.value) })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </>
                )}
                {/* Non-book fields */}
                {editedProduct.category !== 'Book' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Unit Type</label>
                      <input
                        type="text"
                        value={editedProduct.unitType || ''}
                        onChange={e => setEditedProduct({ ...editedProduct, unitType: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    {editedProduct.unitType && editedProduct.unitType.toLowerCase() === 'packet' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Price Per Packet (Rs)</label>
                          <input
                            type="number"
                            value={editedProduct.pricePerPacket ?? ''}
                            onChange={e => setEditedProduct({ ...editedProduct, pricePerPacket: Number(e.target.value) })}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">Price Per Piece (Rs)</label>
                          <input
                            type="number"
                            value={editedProduct.pricePerPiece ?? ''}
                            onChange={e => setEditedProduct({ ...editedProduct, pricePerPiece: Number(e.target.value) })}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </>
                    )}
                    {editedProduct.unitType && editedProduct.unitType.toLowerCase() === 'piece' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Price Per Piece (Rs)</label>
                        <input
                          type="number"
                          value={editedProduct.pricePerPiece ?? ''}
                          onChange={e => setEditedProduct({ ...editedProduct, pricePerPiece: Number(e.target.value) })}
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    )}
                  </>
                )}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
                  <textarea
                    value={editedProduct.description || ''}
                    onChange={(e) => setEditedProduct({ ...editedProduct, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">Product Images</label>
                  <div className="grid grid-cols-4 gap-3 mt-2">
                    {editedProduct.images?.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={getImageUrl(img)}
                          alt={`Product ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg"
                        />
                        <button 
                          onClick={() => handleImageRemove(img)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FiX size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Upload New Images</label>
                    <input
                      type="file"
                      multiple
                      onChange={handleNewImageChange}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-gray-200 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="px-5 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-100"
                onClick={() => setEditModalOpen(false)}
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg"
                onClick={handleUpdateProduct}
              >
                Save Changes
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gray-200"
          >
            <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-2xl">
              <h3 className="text-xl font-bold text-gray-800">Confirm Deletion</h3>
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setDeleteModalOpen(false)}
              >
                <FiX size={24} />
              </motion.button>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete <span className="font-semibold text-gray-900">{selectedProduct.name}</span>? This action cannot be undone.
              </p>
              <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                <p className="text-red-700 text-sm">
                  Warning: Deleting this product will permanently remove it from your store.
                </p>
              </div>
            </div>
            <div className="p-5 border-t border-gray-200 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="px-5 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-100"
                onClick={() => setDeleteModalOpen(false)}
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg"
                onClick={confirmDelete}
              >
                Delete Product
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Products;