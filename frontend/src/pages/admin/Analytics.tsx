import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiDollarSign,
  FiShoppingBag,
  FiUsers,
  FiPackage,
  FiTrendingUp,
  FiClock,
  FiLoader,
  FiAlertCircle,
  FiTrendingDown,
  FiShoppingCart,
  FiCalendar
} from 'react-icons/fi';
import {
  LineChart,
  BarChart,
  PieChart,
  Line,
  Bar,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { API_BASE_URL } from '../../utils/apiConfig';
import axios from 'axios';
import toast from 'react-hot-toast';

interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface Product {
  _id: string;
  name: string;
  category: string;
  createdAt: string;
}

// Helper function to calculate percentage change
const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return Math.round(((current - previous) / previous) * 100);
};

// Helper function to get current and previous period data
const getPeriodData = (items: Array<{ createdAt: string }>, timeRange: 'week' | 'month' | 'year') => {
  const now = new Date();
  let currentPeriodStart: Date;
  let previousPeriodStart: Date;
  let previousPeriodEnd: Date;

  if (timeRange === 'week') {
    // Current week (Monday to Sunday)
    const dayOfWeek = now.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    currentPeriodStart = new Date(now.getTime() - daysToMonday * 24 * 60 * 60 * 1000);
    currentPeriodStart.setHours(0, 0, 0, 0);
    
    // Previous week
    previousPeriodStart = new Date(currentPeriodStart.getTime() - 7 * 24 * 60 * 60 * 1000);
    previousPeriodEnd = new Date(currentPeriodStart.getTime() - 1);
  } else if (timeRange === 'month') {
    // Current month
    currentPeriodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Previous month
    previousPeriodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    previousPeriodEnd = new Date(now.getFullYear(), now.getMonth(), 0);
  } else {
    // Current year
    currentPeriodStart = new Date(now.getFullYear(), 0, 1);
    
    // Previous year
    previousPeriodStart = new Date(now.getFullYear() - 1, 0, 1);
    previousPeriodEnd = new Date(now.getFullYear() - 1, 11, 31);
  }

  const currentPeriodItems = items.filter(item => 
    new Date(item.createdAt) >= currentPeriodStart
  );
  
  const previousPeriodItems = items.filter(item => {
    const itemDate = new Date(item.createdAt);
    return itemDate >= previousPeriodStart && itemDate <= previousPeriodEnd;
  });
  
  return {
    current: currentPeriodItems.length,
    previous: previousPeriodItems.length
  };
};

const Analytics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  const API_URL = API_BASE_URL;

  // Real data state
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  
  // Metrics state
  const [metrics, setMetrics] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
  });

  // Growth percentages
  const [userGrowth, setUserGrowth] = useState(0);
  const [productGrowth, setProductGrowth] = useState(0);

  const [salesData, setSalesData] = useState<any[]>([]);
  const [ordersData, setOrdersData] = useState<any[]>([]);
  const [orderStatusData, setOrderStatusData] = useState<any[]>([]);
  const [userGrowthData, setUserGrowthData] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch users
        const usersResponse = await axios.get(`${API_URL}/admin/users`, {
          withCredentials: true
        });
        const usersData = await usersResponse.data;
        
        if (usersData.success) {
          setUsers(usersData.users);
          setMetrics(prev => ({ ...prev, totalUsers: usersData.users.length }));
          
          // Calculate user growth
          const userPeriodData = getPeriodData(usersData.users, timeRange);
          const userGrowthPercent = calculatePercentageChange(userPeriodData.current, userPeriodData.previous);
          setUserGrowth(userGrowthPercent);
        }

        // Fetch products
        const productsResponse = await axios.get(`${API_URL}/products`, {
          withCredentials: true
        });
        const productsData = await productsResponse.data;
        
        // Fetch best sellers for Top Products
        const bestSellersResponse = await axios.get(`${API_URL}/products/best-sellers`);
        const bestSellersData = await bestSellersResponse.data;

        // Fetch orders (admin)
        const ordersResponse = await axios.get(`${API_URL}/admin/orders`, {
          withCredentials: true
        });
        const ordersData = await ordersResponse.data;

        if (productsData.success) {
          setProducts(productsData.products);
          setMetrics(prev => ({ ...prev, totalProducts: productsData.products.length }));
          
          // Calculate product growth
          const productPeriodData = getPeriodData(productsData.products, timeRange);
          const productGrowthPercent = calculatePercentageChange(productPeriodData.current, productPeriodData.previous);
          setProductGrowth(productGrowthPercent);
        }

        if (productsData.success && ordersData.success) {
          // Only delivered and paid orders
          const deliveredPaidOrders = ordersData.orders.filter((o: any) => o.orderStatus === 'Delivered' && o.paymentInfo?.status === 'Paid');

          // Calculate revenue for each best seller
          const topProductsWithRevenue = (bestSellersData.products || []).map((product: any) => {
            let revenue = 0;
            deliveredPaidOrders.forEach((order: any) => {
              order.orderItems.forEach((item: any) => {
                if (item.product === product._id || item.product?._id === product._id) {
                  revenue += (item.purchasePrice || 0) * (item.quantity || 0);
                }
              });
            });
            return {
              ...product,
              revenue
            };
          });
          setTopProducts(topProductsWithRevenue);
        }

        // Only include delivered and paid orders for sales calculations
        const deliveredPaidOrders = ordersData.orders.filter((o: any) => o.orderStatus === 'Delivered' && o.paymentInfo?.status === 'Paid');

        setOrders(ordersData.orders);
        setMetrics(prev => ({
          ...prev,
          totalOrders: ordersData.orders.length,
          totalSales: deliveredPaidOrders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0 as number)
        }));

        // Order status distribution
        const statusCounts: Record<string, number> = {};
        ordersData.orders.forEach((order: any) => {
          statusCounts[order.orderStatus] = (statusCounts[order.orderStatus] || 0) + 1;
        });
        setOrderStatusData(
          Object.entries(statusCounts).map(([name, value]) => ({ name, value }))
        );

        // Recent orders (5 most recent)
        setRecentOrders(
          ordersData.orders
            .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5)
            .map((order: any) => ({
              id: order.orderID,
              customer: order.user?.name || 'Unknown',
              amount: order.totalAmount,
              status: order.orderStatus,
              date: order.createdAt
            }))
        );

        // Sales Over Time (real data)
        let realSalesData: any[] = [];
        if (timeRange === 'week') {
          // Last 7 days
          const now = new Date();
          for (let i = 6; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000 - 1);
            const sales = deliveredPaidOrders
              .filter((order: any) => {
                const orderDate = new Date(order.createdAt);
                return orderDate >= dayStart && orderDate <= dayEnd;
              })
              .reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);
            realSalesData.push({ name: dayName, sales });
          }
        } else if (timeRange === 'month') {
          // Last 4 weeks (Sunday to Saturday)
          const today = new Date();
          const dayOfWeek = today.getDay(); // 0 (Sun) - 6 (Sat)
          const startOfThisWeek = new Date(today);
          startOfThisWeek.setDate(today.getDate() - dayOfWeek);
          startOfThisWeek.setHours(0, 0, 0, 0);
          for (let i = 3; i >= 0; i--) {
            const weekStart = new Date(startOfThisWeek);
            weekStart.setDate(startOfThisWeek.getDate() - 7 * i);
            weekStart.setHours(0, 0, 0, 0);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            weekEnd.setHours(23, 59, 59, 999);
            const sales = deliveredPaidOrders
              .filter((order: any) => {
                const orderDate = new Date(order.createdAt);
                return orderDate >= weekStart && orderDate <= weekEnd;
              })
              .reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);
            realSalesData.push({ name: `Week ${4 - i}`, sales });
          }
        } else {
          // Last 6 months
          const now = new Date();
          for (let i = 5; i >= 0; i--) {
            const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthName = monthDate.toLocaleDateString('en-US', { month: 'short' });
            const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
            const sales = deliveredPaidOrders
              .filter((order: any) => {
                const orderDate = new Date(order.createdAt);
                return orderDate >= monthDate && orderDate <= monthEnd;
              })
              .reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);
            realSalesData.push({ name: monthName, sales });
          }
        }
        setSalesData(realSalesData);

        // Orders Over Time (real data)
        let ordersOverTime: any[] = [];
        if (timeRange === 'week') {
          // Last 7 days
          const now = new Date();
          for (let i = 6; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000 - 1);
            const count = ordersData.orders.filter((order: any) => {
              const orderDate = new Date(order.createdAt);
              return orderDate >= dayStart && orderDate <= dayEnd;
            }).length;
            ordersOverTime.push({ name: dayName, orders: count });
          }
        } else if (timeRange === 'month') {
          // Last 4 weeks (Sunday to Saturday)
          const today = new Date();
          const dayOfWeek = today.getDay(); // 0 (Sun) - 6 (Sat)
          const startOfThisWeek = new Date(today);
          startOfThisWeek.setDate(today.getDate() - dayOfWeek);
          startOfThisWeek.setHours(0, 0, 0, 0);
          for (let i = 3; i >= 0; i--) {
            const weekStart = new Date(startOfThisWeek);
            weekStart.setDate(startOfThisWeek.getDate() - 7 * i);
            weekStart.setHours(0, 0, 0, 0);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            weekEnd.setHours(23, 59, 59, 999);
            const count = ordersData.orders.filter((order: any) => {
              const orderDate = new Date(order.createdAt);
              return orderDate >= weekStart && orderDate <= weekEnd;
            }).length;
            ordersOverTime.push({ name: `Week ${4 - i}`, orders: count });
          }
        } else {
          // Last 6 months
          const now = new Date();
          for (let i = 5; i >= 0; i--) {
            const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthName = monthDate.toLocaleDateString('en-US', { month: 'short' });
            const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
            const count = ordersData.orders.filter((order: any) => {
              const orderDate = new Date(order.createdAt);
              return orderDate >= monthDate && orderDate <= monthEnd;
            }).length;
            ordersOverTime.push({ name: monthName, orders: count });
          }
        }
        setOrdersData(ordersOverTime);

        // Generate user growth data from real user data
        if (usersData.success) {
          const userGrowthChartData = generateUserGrowthData(usersData.users, timeRange);
          setUserGrowthData(userGrowthChartData);
        }

      } catch (err) {
        setError('Failed to load analytics data. Please try again.');
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange, API_URL]);

  // Helper function to generate user growth chart data
  const generateUserGrowthData = (users: User[], timeRange: 'week' | 'month' | 'year') => {
    const now = new Date();
    const data: any[] = [];

    if (timeRange === 'week') {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000 - 1);
        
        const usersOnDay = users.filter(user => {
          const userDate = new Date(user.createdAt);
          return userDate >= dayStart && userDate <= dayEnd;
        }).length;

        data.push({ name: dayName, users: usersOnDay });
      }
    } else if (timeRange === 'month') {
      // Last 4 weeks
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (now.getDay() + 7 * i));
        const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
        
        const usersInWeek = users.filter(user => {
          const userDate = new Date(user.createdAt);
          return userDate >= weekStart && userDate <= weekEnd;
        }).length;

        data.push({ name: `Week ${4 - i}`, users: usersInWeek });
      }
    } else {
      // Last 6 months
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = monthDate.toLocaleDateString('en-US', { month: 'short' });
        const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
        
        const usersInMonth = users.filter(user => {
          const userDate = new Date(user.createdAt);
          return userDate >= monthDate && userDate <= monthEnd;
        }).length;

        data.push({ name: monthName, users: usersInMonth });
      }
    }

    return data;
  };

  const formatCurrency = (value: number) => {
    return `Rs ${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 font-poppins">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-800 to-indigo-900 bg-clip-text text-transparent">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 mt-1">Key metrics and insights for your store</p>
          </div>
          <div className="flex items-center gap-1 bg-white rounded-xl shadow-sm p-1 border border-gray-200">
            {(['week', 'month', 'year'] as const).map((range) => (
              <motion.button
                key={range}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  timeRange === range
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md'
                    : 'text-gray-600 hover:text-blue-700'
                }`}
                onClick={() => setTimeRange(range)}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6"
          >
            <div className="flex items-center text-red-700">
              <FiAlertCircle className="mr-3 text-xl" />
              <span>{error}</span>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Key Metrics */}
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, staggerChildren: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8"
            >
              {/* Total Sales */}
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Sales</p>
                    <h3 className="text-2xl font-bold text-gray-800">{formatCurrency(metrics.totalSales)}</h3>
                  </div>
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-3 rounded-xl">
                    <FiDollarSign size={20} />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-green-500 font-medium">
                  <FiTrendingUp className="mr-1.5" />
                  <span>12.5% from last {timeRange}</span>
                </div>
              </motion.div>

              {/* Total Orders */}
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Orders</p>
                    <h3 className="text-2xl font-bold text-gray-800">{metrics.totalOrders}</h3>
                  </div>
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-3 rounded-xl">
                    <FiShoppingBag size={20} />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-green-500 font-medium">
                  <FiTrendingUp className="mr-1.5" />
                  <span>8.3% from last {timeRange}</span>
                </div>
              </motion.div>

              {/* Total Users */}
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Users</p>
                    <h3 className="text-2xl font-bold text-gray-800">{metrics.totalUsers}</h3>
                  </div>
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-3 rounded-xl">
                    <FiUsers size={20} />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-green-500 font-medium">
                  <FiTrendingUp className="mr-1.5" />
                  <span>{userGrowth}% from last {timeRange}</span>
                </div>
              </motion.div>

              {/* Total Products */}
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Products</p>
                    <h3 className="text-2xl font-bold text-gray-800">{metrics.totalProducts}</h3>
                  </div>
                  <div className="bg-gradient-to-r from-violet-500 to-purple-600 text-white p-3 rounded-xl">
                    <FiPackage size={20} />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm text-green-500 font-medium">
                  <FiTrendingUp className="mr-1.5" />
                  <span>{productGrowth}% from last {timeRange}</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Charts Section */}
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
            >
              {/* Sales Over Time */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Sales Over Time</h3>
                  <div className="text-sm text-gray-500">
                    {timeRange === 'week' 
                      ? 'Last 7 days' 
                      : timeRange === 'month' 
                        ? 'Last 4 weeks' 
                        : 'Last 6 months'}
                  </div>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salesData}>
                      <defs>
                        <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        stroke="#94a3b8" 
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        stroke="#94a3b8" 
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `Rs ${value}`}
                      />
                      <Tooltip 
                        formatter={(value) => [formatCurrency(Number(value)), 'Sales']}
                        labelFormatter={(label) => `Period: ${label}`}
                        contentStyle={{ 
                          borderRadius: '12px',
                          border: '1px solid #e2e8f0',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="sales" 
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                        activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2, fill: '#fff' }}
                        name="Sales"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Orders Over Time */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Orders Over Time</h3>
                  <div className="text-sm text-gray-500">
                    {timeRange === 'week' 
                      ? 'Last 7 days' 
                      : timeRange === 'month' 
                        ? 'Last 4 weeks' 
                        : 'Last 6 months'}
                  </div>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ordersData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        stroke="#94a3b8" 
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        stroke="#94a3b8" 
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip 
                        formatter={(value) => [value, 'Orders']}
                        labelFormatter={(label) => `Period: ${label}`}
                        contentStyle={{ 
                          borderRadius: '12px',
                          border: '1px solid #e2e8f0',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                        }}
                      />
                      <Bar 
                        dataKey="orders" 
                        fill="#6366f1" 
                        name="Orders"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Order Status Distribution */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Status Distribution</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={orderStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        innerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                      >
                        {orderStatusData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[index % COLORS.length]} 
                            stroke="#fff"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name, props) => [
                          value, 
                          props.payload.name
                        ]}
                        contentStyle={{ 
                          borderRadius: '12px',
                          border: '1px solid #e2e8f0',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                        }}
                      />
                      <Legend 
                        layout="vertical"
                        verticalAlign="middle"
                        align="right"
                        wrapperStyle={{ paddingLeft: '20px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* User Growth */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">User Growth</h3>
                  <div className="text-sm text-gray-500">
                    {timeRange === 'week' 
                      ? 'Last 7 days' 
                      : timeRange === 'month' 
                        ? 'Last 4 weeks' 
                        : 'Last 6 months'}
                  </div>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={userGrowthData}>
                      <defs>
                        <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        stroke="#94a3b8" 
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        stroke="#94a3b8" 
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip 
                        formatter={(value) => [value, 'Users']}
                        labelFormatter={(label) => `Period: ${label}`}
                        contentStyle={{ 
                          borderRadius: '12px',
                          border: '1px solid #e2e8f0',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="users" 
                        stroke="#10b981" 
                        strokeWidth={3}
                        dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                        activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }}
                        name="Users"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>

            {/* Tables Section */}
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Recent Orders */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                <div className="p-5 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-lg font-semibold text-gray-800">Recent Orders</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentOrders.map((order, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {order.id}
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700">
                            {order.customer}
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                            {formatCurrency(order.amount)}
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span className={`px-2.5 py-1 text-xs rounded-full font-medium inline-flex items-center ${
                              order.status === 'Processing' ? 'bg-amber-100 text-amber-800' :
                              order.status === 'Ready for Pickup' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {order.status === 'Processing' && <FiLoader className="mr-1" size={12} />}
                              {order.status === 'Ready for Pickup' && <FiClock className="mr-1" size={12} />}
                              {order.status}
                            </span>
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(order.date)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Top Products */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                <div className="p-5 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-lg font-semibold text-gray-800">Top Products</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sales</th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {topProducts.map((product, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10 mr-3" />
                              <div>
                                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                <div className="text-xs text-gray-500">{product.category}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700">
                            {product.salesCount}
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">
                            {formatCurrency(product.revenue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default Analytics;