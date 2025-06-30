import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { FiArrowLeft, FiPackage, FiXCircle } from 'react-icons/fi';
import { API_BASE_URL, SERVER_BASE_URL } from '../utils/apiConfig';
import axios from 'axios';
import toast from 'react-hot-toast';

interface OrderItem {
  id: string;
  name: string;
  image?: string;
  quantity: number;
  price: number;
  unitType?: 'Piece' | 'Packet';
}

interface Order {
  _id: string;
  id?: string;
  items: OrderItem[];
  status: string;
  total: number;
  date: string;
}

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const prefersReducedMotion = useReducedMotion();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  const getImageUrl = (path?: string) => {
    if (!path) return '/stationery.jpg';
    if (path.startsWith('http')) return path;
    return `${SERVER_BASE_URL}/${path}`;
  };

  useEffect(() => {
    setIsLoading(true);
    axios.get(`${API_BASE_URL}/orders/${id}`, { withCredentials: true })
      .then(res => {
        if (res.data && res.data.order) {
          const o = res.data.order;
          setOrder({
            _id: o._id,
            id: o.orderID || o._id,
            items: (o.orderItems || []).map((item: any) => ({
              id: item._id,
              name: item.name,
              image: item.image,
              quantity: item.quantity,
              price: item.purchasePrice,
              unitType: item.unitType,
            })),
            status: o.orderStatus,
            total: o.totalAmount,
            date: o.createdAt ? new Date(o.createdAt).toLocaleString() : new Date().toLocaleString(),
          });
        } else {
          setOrder(null);
        }
      })
      .catch(err => {
        console.error('Failed to fetch order:', err);
        toast.error('Failed to load order details');
        setOrder(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [id]);

  const handleCancelOrder = async () => {
    if (!order || order.status !== 'Processing') {
      toast.error(`Cannot cancel order as it is ${order?.status?.toLowerCase() || 'unknown'}`);
      return;
    }

    if (!window.confirm(`Are you sure you want to cancel order #${order.id}?`)) {
      return;
    }

    try {
      setIsCancelling(true);
      const response = await axios.put(
        `${API_BASE_URL}/orders/${order._id}/cancel`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success('Order cancelled successfully');
        setOrder(prev => prev ? { ...prev, status: 'Cancelled' } : null);
      } else {
        toast.error(response.data.message || 'Failed to cancel order');
      }
    } catch (error: any) {
      console.error('Error cancelling order:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    } finally {
      setIsCancelling(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Delivered':
        return <div className="w-3 h-3 rounded-full bg-green-500" />;
      case 'Processing':
        return <div className="w-3 h-3 rounded-full bg-amber-500" />;
      case 'Cancelled':
        return <div className="w-3 h-3 rounded-full bg-red-500" />;
      default:
        return <div className="w-3 h-3 rounded-full bg-blue-500" />;
    }
  };

  if (isLoading) {
    return (
      <main className="w-full bg-gradient-to-b from-cream-50 to-cream-100 min-h-screen py-12 font-poppins">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <div className="h-6 w-40 bg-cream-200 rounded-full animate-pulse" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-cream-200 animate-pulse">
                <div className="h-6 w-32 bg-cream-200 rounded-full mb-6" />
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center mb-6">
                    <div className="w-16 h-16 bg-cream-200 rounded-md mr-4" />
                    <div className="flex-1">
                      <div className="h-4 w-48 bg-cream-200 rounded mb-2" />
                      <div className="h-3 w-32 bg-cream-200 rounded" />
                    </div>
                    <div className="h-5 w-20 bg-cream-200 rounded" />
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-cream-200 animate-pulse">
                <div className="h-6 w-32 bg-cream-200 rounded-full mb-6" />
                <div className="h-10 w-full bg-cream-200 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="w-full bg-gradient-to-b from-cream-50 to-cream-100 min-h-screen py-16 font-poppins">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="bg-gradient-to-br from-red-50 to-blue-50 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-cream-200 shadow-xl text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.6 }}
          >
            <motion.div
              className="inline-flex items-center justify-center bg-gradient-to-r from-red-600 to-blue-600 text-white p-5 rounded-2xl mb-6"
              animate={prefersReducedMotion ? {} : { rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            >
              <FiPackage className="text-3xl" />
            </motion.div>
            <motion.h1
              className="text-3xl md:text-4xl font-bold text-blue-900 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
            >
              Order Not Found
            </motion.h1>
            <motion.p
              className="text-blue-800 max-w-md mx-auto mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: prefersReducedMotion ? 0 : 0.5 }}
            >
              We couldn't find the order you're looking for.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: prefersReducedMotion ? 0 : 0.5 }}
            >
              <Link
                to="/orders"
                className="inline-flex items-center space-x-3 bg-gradient-to-r from-red-600 to-blue-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <FiArrowLeft className="transition-transform group-hover:-translate-x-1" />
                <span>Back to Orders</span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full bg-gradient-to-b from-cream-50 to-cream-100 min-h-screen py-12 font-poppins">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
          className="mb-6"
        >
          <Link
            to="/orders"
            className="inline-flex items-center space-x-2 text-blue-900 hover:text-blue-700 transition-colors"
          >
            <FiArrowLeft />
            <span className="font-medium">Back to Orders</span>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: prefersReducedMotion ? 0 : 0.5 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-900">Order #{order.id}</h1>
            <p className="text-sm text-blue-800 mt-1">
              Placed on {order.date}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xl">
              {getStatusIcon(order.status)}
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                order.status === 'Delivered'
                  ? 'bg-green-100 text-green-800'
                  : order.status === 'Processing'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {order.status}
            </span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: prefersReducedMotion ? 0 : 0.5 }}
            className="lg:col-span-2 bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-cream-200"
          >
            <h2 className="text-xl font-semibold text-blue-900 mb-6">Items in your order</h2>
            <ul className="divide-y divide-cream-200">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center py-6">
                  <img
                    src={getImageUrl(item.image)}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-md mr-4 border border-cream-200"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-900">{item.name}</h3>
                    <p className="text-sm text-blue-800">
                      {item.quantity} x Rs. {item.price.toLocaleString()} {item.unitType && `/ ${item.unitType}`}
                    </p>
                  </div>
                  <span className="font-bold text-blue-900">
                    Rs. {(item.quantity * item.price).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>

          <div className="lg:col-span-1 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: prefersReducedMotion ? 0 : 0.5 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-cream-200"
            >
              <div className="bg-gradient-to-r from-red-50 to-blue-50 px-6 py-4 border-b border-cream-200">
                <h2 className="text-xl font-bold text-blue-900">Order Summary</h2>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-blue-900">Total</span>
                  <span className="text-2xl font-bold text-gold-500">Rs {(order.total ?? 0).toFixed(2)}</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: prefersReducedMotion ? 0 : 0.5 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-cream-200"
            >
              <div className="bg-gradient-to-r from-red-50 to-blue-50 px-6 py-4 border-b border-cream-200">
                <h2 className="text-xl font-bold text-blue-900">Order Actions</h2>
              </div>
              <div className="p-6">
                {order.status === 'Processing' && (
                  <button
                    onClick={handleCancelOrder}
                    disabled={isCancelling}
                    className={`w-full flex items-center justify-center gap-2 font-medium py-3 px-6 rounded-xl shadow-md transition-all duration-300 ${
                      isCancelling 
                        ? 'bg-gray-400 text-white cursor-not-allowed' 
                        : 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:shadow-lg'
                    }`}
                  >
                    {isCancelling ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Cancelling...</span>
                      </>
                    ) : (
                      <>
                        <FiXCircle className="text-lg" />
                        <span>Cancel Order</span>
                      </>
                    )}
                  </button>
                )}
                {order.status !== 'Processing' && (
                  <p className="text-center text-blue-800 py-4">
                    No actions available for {(order.status ? order.status.toLowerCase() : 'unknown')} orders
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default OrderDetail;