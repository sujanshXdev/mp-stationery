import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { FiShoppingCart, FiArrowRight, FiBookOpen, FiPackage, FiCalendar, FiBox, FiClock, FiCheckCircle, FiXCircle, FiEye } from 'react-icons/fi';
import { RiCoinLine } from 'react-icons/ri';
import { API_BASE_URL } from '../utils/apiConfig';
import axios from 'axios';
import toast from 'react-hot-toast';

const OrderSkeleton: React.FC = () => {
  return (
    <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-cream-200 animate-pulse">
      <div className="flex items-center space-x-4 mb-6">
        <div className="h-12 w-12 bg-cream-200 rounded-full" />
        <div>
          <div className="h-5 w-32 bg-cream-200 rounded mb-2" />
          <div className="h-4 w-24 bg-cream-200 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="h-8 w-8 bg-cream-200 rounded-full mb-2" />
            <div className="h-3 w-16 bg-cream-200 rounded" />
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full bg-cream-200 rounded" />
        <div className="h-3 w-3/4 bg-cream-200 rounded" />
      </div>
    </div>
  );
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusColors: Record<string, string> = {
    Delivered: 'from-green-400 to-green-600',
    Processing: 'from-amber-400 to-amber-600',
    Cancelled: 'from-red-400 to-red-600',
    Shipped: 'from-blue-400 to-blue-600'
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${statusColors[status] || 'from-blue-400 to-blue-600'} text-white`}>
      {status}
    </span>
  );
};

interface OrderItem {
  id: string;
  name: string;
  image?: string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  id?: string;
  items: OrderItem[];
  status: string;
  total: number;
  date: string;
}

const Orders: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(true);
  const [orders, setOrders] = React.useState<Order[]>([]);

  useEffect(() => {
    setIsLoading(true);
    axios.get(`${API_BASE_URL}/orders/me/orders`, { withCredentials: true })
      .then(res => {
        if (res.data && res.data.orders) {
          const normalized = res.data.orders.map((o: any) => ({
            _id: o._id,
            id: o.orderID || o._id,
            date: new Date(o.createdAt).toLocaleDateString(),
            total: o.totalAmount,
            status: o.orderStatus,
            items: o.orderItems.map((item: any) => ({
              id: item.product._id || item.product,
              name: item.name,
              quantity: item.quantity,
              price: item.purchasePrice,
              image: item.product.images?.[0] || '/stationery.jpg',
              returnable: item.returnable
            }))
          }));
          setOrders(normalized);
        }
      })
      .catch(err => {
        console.error('Failed to fetch orders:', err);
        toast.error('Failed to load orders');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <main className="w-full bg-gradient-to-b from-cream-50 to-cream-100 min-h-screen py-12 font-poppins">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <motion.h1
              className="text-3xl md:text-4xl font-bold text-blue-900 mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              Your Orders
            </motion.h1>
            <motion.div 
              className="h-1 w-32 bg-gradient-to-r from-red-600 to-blue-600 mx-auto rounded-full"
              initial={{ width: 0 }}
              animate={{ width: 128 }}
              transition={{ duration: 0.8 }}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <OrderSkeleton />
            <OrderSkeleton />
            <OrderSkeleton />
          </div>
        </div>
      </main>
    );
  }

  if (orders.length === 0) {
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
              <FiBookOpen className="text-3xl" />
            </motion.div>
            <motion.h1
              className="text-3xl md:text-4xl font-bold text-blue-900 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
            >
              No Orders Yet
            </motion.h1>
            <motion.p
              className="text-blue-800 max-w-md mx-auto mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: prefersReducedMotion ? 0 : 0.5 }}
            >
              Your literary journey hasn't started yet. Explore our collection of books and stationery to find your next adventure.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: prefersReducedMotion ? 0 : 0.5 }}
            >
              <Link
                to="/shop"
                className="inline-flex items-center space-x-3 bg-gradient-to-r from-red-600 to-blue-600 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <FiShoppingCart className="transition-transform group-hover:scale-110" />
                <span>Discover Our Collection</span>
                <FiArrowRight className="transition-transform group-hover:translate-x-1" />
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
        <div className="text-center mb-12">
          <motion.h1
            className="text-3xl md:text-4xl font-bold text-blue-900 mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.6 }}
          >
            Your Order History
          </motion.h1>
          <motion.div 
            className="h-1 w-32 bg-gradient-to-r from-red-600 to-blue-600 mx-auto rounded-full"
            initial={{ width: 0 }}
            animate={{ width: 128 }}
            transition={{ duration: 0.8 }}
          />
          <motion.p 
            className="text-blue-800 mt-4 max-w-lg mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            All your literary adventures in one place
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {orders.map((order) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                whileHover={prefersReducedMotion ? {} : { y: -10 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.4, ease: "easeOut" }}
                className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-cream-200 overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div 
                  className="cursor-pointer p-6"
                  onClick={() => navigate(`/orders/${order.id}`)}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(`/orders/${order.id}`)}
                  tabIndex={0}
                  role="button"
                  aria-label={`View order ${order.id}`}
                >
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center space-x-4">
                      <div className="bg-gradient-to-r from-red-100 to-blue-100 p-3 rounded-xl">
                        <FiPackage className="text-2xl text-blue-900" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-blue-900">Order #{order.id}</h3>
                        <p className="text-sm text-blue-700">{order.date}</p>
                      </div>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="flex flex-col items-center">
                      <div className="bg-blue-100 text-blue-900 p-2 rounded-full mb-2">
                        <FiCalendar />
                      </div>
                      <span className="text-xs text-blue-800">{order.date.split(',')[0]}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="bg-amber-100 text-amber-900 p-2 rounded-full mb-2">
                        <FiBox />
                      </div>
                      <span className="text-xs text-blue-800">{order.items.length} items</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="bg-green-100 text-green-900 p-2 rounded-full mb-2">
                        <RiCoinLine />
                      </div>
                      <span className="text-xs text-blue-800">Rs. {order.total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-blue-900 mb-2">Items</h4>
                    <div className="flex flex-wrap gap-2">
                      {order.items.slice(0, 3).map((item, index) => (
                        <span 
                          key={index} 
                          className="bg-cream-100 text-blue-800 text-xs px-3 py-1 rounded-full"
                        >
                          {item.name} × {item.quantity}
                        </span>
                      ))}
                      {order.items.length > 3 && (
                        <span className="bg-blue-100 text-blue-900 text-xs px-3 py-1 rounded-full">
                          +{order.items.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t border-cream-200 px-6 py-4 bg-gradient-to-r from-red-50/30 to-blue-50/30">
                  <motion.button
                    whileHover={prefersReducedMotion ? {} : { scale: 1.03 }}
                    whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
                    onClick={() => navigate(`/orders/${order.id}`)}
                    className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-red-600 to-blue-600 text-white py-2.5 rounded-lg shadow hover:shadow-md transition-all"
                  >
                    <span>View Order Details</span>
                    <FiArrowRight className="transition-transform group-hover:translate-x-1" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
};

export default Orders;