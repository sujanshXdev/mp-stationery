import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  FiUser,
  FiDollarSign,
  FiClock,
  FiTruck,
  FiCreditCard,
  FiPhone,
  FiMail,
  FiMapPin,
  FiList,
  FiDownload
} from 'react-icons/fi';
import { API_BASE_URL, SERVER_BASE_URL } from '../../utils/apiConfig';
import axios from 'axios';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

interface Order {
  _id: string;
  orderID: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  orderItems: Array<{
    name: string;
    quantity: number;
    image: string;
    purchasePrice: number;
    product: string;
    unitType?: string;
  }>;
  shippingInfo: {
    phoneNo: string;
  };
  paymentInfo: {
    id: string;
    status: string;
  };
  paidAt: string;
  itemsPrice: number;
  taxAmount: number;
  shippingAmount: number;
  totalAmount: number;
  orderStatus: 'Processing' | 'Ready for Pickup' | 'Delivered' | 'Cancelled';
  createdAt: string;
}

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<string>('');
  const [editedOrder, setEditedOrder] = useState<Partial<Order> | null>(null);
  const [updating, setUpdating] = useState(false);
  const itemsPerPage = 8;

  const getImageUrl = (path?: string) => {
    if (!path) return '/stationery.jpg'; // Default placeholder
    if (path.startsWith('http')) return path;
    return `${SERVER_BASE_URL}/${path}`;
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_BASE_URL}/admin/orders`, { withCredentials: true });
      setOrders(data.orders);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter and search logic
  useEffect(() => {
    let result = orders;
    
    if (searchTerm) {
      result = result.filter(order => 
        (order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) || 
        order.orderID.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      result = result.filter(order => order.orderStatus === statusFilter);
    }
    
    if (paymentFilter !== 'all') {
      result = result.filter(order => order.paymentInfo.status.toLowerCase() === paymentFilter.toLowerCase());
    }
    
    setFilteredOrders(result);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, paymentFilter, orders]);

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Order actions
  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setViewModalOpen(true);
  };

  const handleEditOrder = (order: Order) => {
    setSelectedOrder(order);
    setEditedOrder({ orderStatus: order.orderStatus });
    setEditModalOpen(true);
  };

  const handleDeleteOrder = (order: Order) => {
    setSelectedOrder(order);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedOrder) {
      try {
        await axios.delete(`${API_BASE_URL}/admin/orders/${selectedOrder._id}`, { withCredentials: true });
        toast.success('Order deleted successfully');
        fetchOrders();
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to delete order');
      } finally {
        setDeleteModalOpen(false);
      }
    }
  };

  // Bulk actions
  const toggleSelectOrder = (id: string) => {
    if (selectedOrderIds.includes(id)) {
      setSelectedOrderIds(selectedOrderIds.filter(orderId => orderId !== id));
    } else {
      setSelectedOrderIds([...selectedOrderIds, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedOrderIds.length === currentOrders.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(currentOrders.map(order => order._id));
    }
  };

  const handleBulkAction = () => {
    if (bulkAction === 'delete') {
      setOrders(orders.filter(o => !selectedOrderIds.includes(o._id)));
    }
    setSelectedOrderIds([]);
    setBulkAction('');
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleUpdateOrder = async () => {
    if (!selectedOrder || !editedOrder) return;
    setUpdating(true);
    try {
      const prevStatus = selectedOrder.orderStatus;
      const updatePayload: any = {};
      if (editedOrder.orderStatus) updatePayload.orderStatus = editedOrder.orderStatus;
      if (editedOrder.paymentInfo) updatePayload.paymentInfo = editedOrder.paymentInfo;
      await axios.put(`${API_BASE_URL}/orders/${selectedOrder._id}`, updatePayload, { withCredentials: true });
      setEditModalOpen(false);
      fetchOrders();
      if (
        prevStatus === 'Processing' &&
        editedOrder.orderStatus === 'Ready for Pickup'
      ) {
        toast.success('Order updated. Ready for Pickup notification sent to user.');
      } else {
        toast.success('Order updated successfully');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update order');
    } finally {
      setUpdating(false);
    }
  };

  // Export to Excel functionality
  const exportToExcel = () => {
    const deliveredPaidOrders = orders.filter(
      order => order.orderStatus === 'Delivered' && order.paymentInfo.status.toLowerCase() === 'paid'
    );

    // Detect system theme
    const isDarkTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const textColor = isDarkTheme ? 'FFFFFF' : '000000'; // White for dark theme, Black for light theme

    // Create detailed data with product information
    const data = deliveredPaidOrders.flatMap(order => 
      order.orderItems.map(item => ({
        'Order ID': order.orderID,
        'Customer Name': order.user?.name || 'Unknown User',
        'Email': order.user?.email || 'No email available',
        'Phone': order.shippingInfo?.phoneNo || 'Not Provided',
        'Date': formatDate(order.createdAt),
        'Product Name': item.name,
        'Product Unit': item.unitType || '-',
        'Quantity': item.quantity,
        'Order Total': `Rs ${order.totalAmount.toFixed(2)}`,
        'Order Status': order.orderStatus,
        'Payment Status': order.paymentInfo.status
      }))
    );

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Delivered Orders');
    
    // Customize column widths
    worksheet['!cols'] = [
      { wch: 15 }, // Order ID
      { wch: 20 }, // Customer Name
      { wch: 30 }, // Email
      { wch: 15 }, // Phone
      { wch: 20 }, // Date
      { wch: 30 }, // Product Name
      { wch: 15 }, // Product Unit
      { wch: 10 }, // Quantity
      { wch: 15 }, // Order Total
      { wch: 15 }, // Order Status
      { wch: 15 }  // Payment Status
    ];

    // Apply theme-based styling to all cells
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (!worksheet[cellAddress]) continue;
        
        // Apply text color based on theme
        if (!worksheet[cellAddress].s) worksheet[cellAddress].s = {};
        worksheet[cellAddress].s.font = {
          ...worksheet[cellAddress].s.font,
          color: { rgb: textColor }
        };
      }
    }

    XLSX.writeFile(workbook, `Delivered_Orders_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
            <p className="text-gray-600 mt-2">Manage customer orders efficiently</p>
          </div>
        </motion.div>

        {/* Modernized Filters */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Search orders..."
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiTruck className="text-gray-500" />
              </div>
              <select
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent appearance-none transition-colors"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="Processing">Processing</option>
                <option value="Ready for Pickup">Ready for Pickup</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiCreditCard className="text-gray-500" />
              </div>
              <select
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent appearance-none transition-colors"
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
              >
                <option value="all">All Payments</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            
            <div className="flex gap-2">
              {selectedOrderIds.length > 0 ? (
                <>
                  <select
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                    value={bulkAction}
                    onChange={(e) => setBulkAction(e.target.value)}
                  >
                    <option value="">Bulk Actions</option>
                    <option value="delete">Delete</option>
                  </select>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm disabled:opacity-50 transition-colors"
                    disabled={!bulkAction}
                    onClick={handleBulkAction}
                  >
                    Apply
                  </motion.button>
                </>
              ) : (
                // Show export button only when status filter is "Delivered" and payment filter is "Paid"
                statusFilter === 'Delivered' && paymentFilter === 'Paid' ? (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
                    onClick={exportToExcel}
                  >
                    <FiDownload />
                    Export to Excel
                  </motion.button>
                ) : (
                  <div className="flex-1"></div>
                )
              )}
            </div>
          </div>
        </motion.div>

        {/* Modern Table Design */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
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
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                            checked={selectedOrderIds.length === currentOrders.length && currentOrders.length > 0}
                            onChange={toggleSelectAll}
                          />
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentOrders.map((order) => (
                      <tr 
                        key={order._id} 
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => handleViewOrder(order)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                              checked={selectedOrderIds.includes(order._id)}
                              onChange={() => toggleSelectOrder(order._id)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">#{order.orderID}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white">
                              <FiUser />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {order.user?.name || 'Unknown User'}
                              </div>
                              <div className="text-xs text-gray-500">
                                {order.user?.email || 'No email available'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center font-medium">
                            Rs {order.totalAmount.toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            order.orderStatus === 'Processing' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : order.orderStatus === 'Ready for Pickup' 
                                ? 'bg-blue-100 text-blue-800' 
                                : order.orderStatus === 'Delivered' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                          }`}>
                            {order.orderStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            order.paymentInfo.status.toLowerCase() === 'paid' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.paymentInfo.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="text-gray-600 hover:text-blue-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewOrder(order);
                              }}
                            >
                              <FiEye size={18} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="text-gray-600 hover:text-indigo-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditOrder(order);
                              }}
                            >
                              <FiEdit size={18} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="text-gray-600 hover:text-red-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteOrder(order);
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
              
              {/* Enhanced Pagination */}
              <div className="bg-gray-50 px-6 py-4 flex flex-col md:flex-row items-center justify-between border-t border-gray-200">
                <div className="text-sm text-gray-600 mb-4 md:mb-0">
                  Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(indexOfLastItem, filteredOrders.length)}
                  </span>{' '}
                  of <span className="font-medium">{filteredOrders.length}</span> orders
                </div>
                <div className="flex items-center space-x-1">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded ${
                      currentPage === 1
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-600 hover:bg-gray-100'
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
                      className={`w-10 h-10 rounded ${
                        currentPage === page
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-gray-600 hover:bg-gray-100'
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
                    className={`p-2 rounded ${
                      currentPage === totalPages
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-600 hover:bg-gray-100'
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

      {/* Modern View Order Modal */}
      <AnimatePresence>
        {viewModalOpen && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
                <h3 className="text-xl font-bold text-gray-900">Order Details</h3>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Customer Information */}
                  <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                    <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <FiUser className="text-blue-500" />
                      <span>Customer Information</span>
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div className="text-gray-500 min-w-[120px]">Name:</div>
                        <div className="font-medium text-gray-900">
                          {selectedOrder.user?.name || 'Unknown User'}
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="text-gray-500 min-w-[120px]">Email:</div>
                        <div className="font-medium text-gray-900">
                          {selectedOrder.user?.email || 'No email available'}
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="text-gray-500 min-w-[120px]">Phone:</div>
                        <div className="font-medium text-gray-900">{selectedOrder.shippingInfo?.phoneNo || 'Not Provided'}</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Order Summary */}
                  <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                    <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                      <FiPackage className="text-blue-500" />
                      <span>Order Summary</span>
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div className="text-gray-500 min-w-[120px]">Order ID:</div>
                        <div className="font-medium text-gray-900">#{selectedOrder.orderID}</div>
                      </div>
                      <div className="flex items-start">
                        <div className="text-gray-500 min-w-[120px]">Date & Time:</div>
                        <div className="font-medium text-gray-900">{formatDate(selectedOrder.createdAt)}</div>
                      </div>
                      <div className="flex items-start">
                        <div className="text-gray-500 min-w-[120px]">Total Amount:</div>
                        <div className="font-medium text-gray-900">Rs {selectedOrder.totalAmount.toFixed(2)}</div>
                      </div>
                      <div className="flex items-start">
                        <div className="text-gray-500 min-w-[120px]">Order Status:</div>
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          selectedOrder.orderStatus === 'Processing' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : selectedOrder.orderStatus === 'Ready for Pickup' 
                              ? 'bg-blue-100 text-blue-800' 
                              : selectedOrder.orderStatus === 'Delivered' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                        }`}>
                          {selectedOrder.orderStatus}
                        </span>
                      </div>
                      <div className="flex items-start">
                        <div className="text-gray-500 min-w-[120px]">Payment Status:</div>
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          selectedOrder.paymentInfo.status.toLowerCase() === 'paid' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {selectedOrder.paymentInfo.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Order Items */}
                <div className="mt-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <FiList className="text-blue-500" />
                    <span>Order Items</span>
                  </h4>
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedOrder.orderItems.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <img 
                                    className="h-10 w-10 rounded object-cover border border-gray-200" 
                                    src={getImageUrl(item.image)} 
                                    alt={item.name}
                                  />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.unitType || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              Rs {item.purchasePrice.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.quantity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              Rs {(item.purchasePrice * item.quantity).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td colSpan={4} className="px-6 py-4 text-right text-sm font-medium text-gray-700">
                            Total:
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                            Rs {selectedOrder.totalAmount.toFixed(2)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all"
                  onClick={() => setViewModalOpen(false)}
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Modern Edit Modal */}
        {editModalOpen && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-lg max-w-md w-full"
            >
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">Update Order</h3>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setEditModalOpen(false)}
                >
                  <FiX size={24} />
                </motion.button>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="orderStatus" className="block text-sm font-medium text-gray-700 mb-2">Order Status</label>
                    <select
                      id="orderStatus"
                      defaultValue={selectedOrder.orderStatus}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      onChange={(e) => setEditedOrder({ ...editedOrder, orderStatus: e.target.value as any })}
                    >
                      <option value="Processing">Processing</option>
                      <option value="Ready for Pickup">Ready for Pickup</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="paymentStatus" className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
                    <select
                      id="paymentStatus"
                      defaultValue={selectedOrder.paymentInfo.status}
                      className="w HAPPYto w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      onChange={(e) => setEditedOrder({
                        ...editedOrder,
                        paymentInfo: { ...selectedOrder.paymentInfo, status: e.target.value }
                      })}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setEditModalOpen(false)}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-50"
                  onClick={handleUpdateOrder}
                  disabled={updating}
                >
                  {updating ? 'Saving...' : 'Save Changes'}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Modern Delete Modal */}
        {deleteModalOpen && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-lg max-w-md w-full"
            >
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">Confirm Deletion</h3>
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
                  Are you sure you want to delete order <span className="font-semibold text-gray-900">#{selectedOrder.orderID}</span>? This action cannot be undone.
                </p>
                <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                  <p className="text-red-700 text-sm">
                    ⚠️ Warning: This will permanently delete the order record.
                  </p>
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setDeleteModalOpen(false)}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all"
                  onClick={confirmDelete}
                >
                  Delete Order
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Orders;