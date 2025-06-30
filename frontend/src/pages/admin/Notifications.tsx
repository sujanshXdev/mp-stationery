import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiBell, 
  FiCheck, 
  FiPlus, 
  FiFilter,
  FiClock,
  FiShoppingBag,
  FiCreditCard,
  FiAlertCircle,
  FiLoader,
  FiChevronLeft,
  FiChevronRight,
  FiVolume2,
  FiX,
  FiMail,
  FiMessageSquare,
  FiTrash2,
  FiSend,
  FiEdit3
} from 'react-icons/fi';
import { useNotificationContext } from '../../context/NotificationContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../../utils/apiConfig';

interface Notification {
  _id: string;
  message: string;
  type: 'system' | 'order' | 'payment' | 'message';
  read: boolean;
  createdAt: string;
  order?: string;
  messageRef?: {
    _id: string;
    name: string;
    email: string;
    message: string;
  };
}

const Notifications: React.FC = () => {
  const { notifications, loading, error, refetch } = useNotificationContext();
  const [filteredNotifications, setFilteredNotifications] = React.useState<Notification[]>([]);
  const [filter, setFilter] = React.useState<'all' | 'read' | 'unread'>('all');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [isMarkingAll, setIsMarkingAll] = React.useState(false);
  const navigate = useNavigate();
  const itemsPerPage = 8;

  React.useEffect(() => {
    let result = notifications;
    if (filter === 'read') {
      result = result.filter((notification) => notification.read);
    } else if (filter === 'unread') {
      result = result.filter((notification) => !notification.read);
    }
    setFilteredNotifications(result);
    setCurrentPage(1);
  }, [filter, notifications]);

  // Pagination logic
  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentNotifications = filteredNotifications.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const toggleReadStatus = async (id: string) => {
    try {
      const notification = notifications.find((n) => n._id === id);
      if (!notification) return;
      const { data } = await axios.put(
        `${API_BASE_URL}/notifications/${id}`,
        { read: !notification.read },
        { withCredentials: true }
      );
      if (data.success) {
        refetch();
      }
    } catch (err) {
      // Optionally handle error
    }
  };

  const markAllAsRead = async () => {
    try {
      setIsMarkingAll(true);
      const { data } = await axios.put(
        `${API_BASE_URL}/notifications/mark-all-read`,
        {},
        { withCredentials: true }
      );
      if (data.success) {
        refetch();
      }
    } catch (err) {
      // Optionally handle error
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (notification.type === 'order' && notification.order) {
      navigate(`/admin/orders`);
    } else if (notification.type === 'message') {
      navigate(`/admin/messages`);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <FiShoppingBag className="mr-2" />;
      case 'payment':
        return <FiCreditCard className="mr-2" />;
      case 'message':
        return <FiMessageSquare className="mr-2" />;
      default:
        return <FiAlertCircle className="mr-2" />;
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
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
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 mt-2">Manage system and order alerts</p>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              onClick={markAllAsRead}
              disabled={isMarkingAll || notifications.every((n) => n.read)}
            >
              {isMarkingAll ? (
                <FiLoader className="animate-spin" />
              ) : (
                <FiCheck className="text-lg" />
              )}
              <span>Mark All as Read</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Modern Filter Buttons */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100"
        >
          <div className="flex flex-wrap gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setFilter('all')}
            >
              All Notifications
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'unread'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setFilter('unread')}
            >
              Unread
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'read'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setFilter('read')}
            >
              Read
            </motion.button>
          </div>
        </motion.div>

        {/* Enhanced Notifications List */}
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
          ) : error ? (
            <div className="p-6 text-center">
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded flex items-center justify-center">
                <FiAlertCircle className="mr-2" />
                <span>{error}</span>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Notification
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Type
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Date
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentNotifications.length > 0 ? (
                      currentNotifications.map((notification) => (
                        <tr
                          key={notification._id}
                          className={`${
                            !notification.read ? 'bg-blue-50' : 'hover:bg-gray-50'
                          } transition-colors cursor-pointer`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {!notification.read && (
                                <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900 flex items-start">
                              <div className="flex-shrink-0 mt-1 mr-3 text-blue-500">
                                {getTypeIcon(notification.type)}
                              </div>
                              <div className="flex-1">
                                <span>{notification.message}</span>
                                {notification.type === 'message' && notification.messageRef && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    <span className="font-medium">From:</span> {notification.messageRef.name} ({notification.messageRef.email})
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {notification.type.charAt(0).toUpperCase() +
                                notification.type.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <FiClock className="mr-1.5" />
                              {formatDate(notification.createdAt)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                notification.read
                                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleReadStatus(notification._id);
                              }}
                            >
                              {notification.read ? 'Mark Unread' : 'Mark Read'}
                            </motion.button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-12 text-center"
                        >
                          <div className="flex flex-col items-center justify-center text-gray-500">
                            <FiMail className="w-12 h-12 text-gray-300 mb-3" />
                            <p className="text-lg font-medium">No notifications yet</p>
                            <p className="mt-1">When you have notifications, they'll appear here.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Modern Pagination */}
              {filteredNotifications.length > 0 && (
                <div className="bg-gray-50 px-6 py-4 flex flex-col md:flex-row items-center justify-between border-t border-gray-200">
                  <div className="text-sm text-gray-600 mb-4 md:mb-0">
                    Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(indexOfLastItem, filteredNotifications.length)}
                    </span>{' '}
                    of <span className="font-medium">{filteredNotifications.length}</span> notifications
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
                        className={`w-10 h-10 rounded text-sm ${
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
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Notifications;