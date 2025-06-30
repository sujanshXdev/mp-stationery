import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiUsers, 
  FiPackage, 
  FiShoppingBag, 
  FiDollarSign, 
  FiBell, 
  FiPlus, 
  FiList, 
  FiClock,
  FiArrowRight,
  FiTrendingUp,
  FiTrendingDown,
  FiMessageSquare
} from 'react-icons/fi';
import { useNotificationContext } from '../../context/NotificationContext';
import { API_BASE_URL } from '../../utils/apiConfig';
import axios from 'axios';
import toast from 'react-hot-toast';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, change, changeType = 'neutral' }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-sm p-5 border border-gray-100"
  >
    <div className="flex justify-between items-start">
      <div>
        <p className="text-gray-500 font-medium mb-1 text-sm">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
        {change && (
          <p className="text-xs mt-2 flex items-center">
            {changeType === 'increase' ? (
              <FiTrendingUp className="mr-1 text-green-600" />
            ) : changeType === 'decrease' ? (
              <FiTrendingDown className="mr-1 text-red-600" />
            ) : (
              <FiTrendingUp className="mr-1 text-gray-600" />
            )}
            <span className={changeType === 'increase' ? 'text-green-600' : changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'}>
              {change}
            </span>
          </p>
        )}
      </div>
      <div className="p-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        {icon}
      </div>
    </div>
  </motion.div>
);

interface TableRow {
  id: string;
  [key: string]: string | number | React.ReactNode;
}

interface TableProps {
  title: string;
  columns: string[];
  data: TableRow[];
  emptyMessage: string;
  linkText: string;
  linkTo: string;
}

const DataTable: React.FC<TableProps> = ({ 
  title, 
  columns, 
  data, 
  emptyMessage, 
  linkText, 
  linkTo 
}) => (
  <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
    <div className="border-b border-gray-200 p-5 bg-gray-50 flex justify-between items-center">
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      <Link 
        to={linkTo} 
        className="text-blue-700 hover:text-blue-900 flex items-center text-sm font-medium"
      >
        {linkText} <FiArrowRight className="ml-1" />
      </Link>
    </div>
    
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column, index) => (
              <th 
                key={index} 
                className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.length > 0 ? (
            data.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                {columns.map((column, colIndex) => (
                  <td 
                    key={`${row.id}-${colIndex}`} 
                    className="px-5 py-4 whitespace-nowrap text-sm text-gray-700"
                  >
                    {row[column.toLowerCase().replace(/\s+/g, '_')]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-5 py-8 text-center text-gray-500">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

interface Notification {
  id: string;
  message: string;
  type: 'order' | 'user' | 'system' | 'message';
  date: string;
  read: boolean;
}

const NotificationItem: React.FC<Notification> = ({ message, type, date, read }) => {
  const typeColors = {
    order: 'bg-blue-100 text-blue-800',
    user: 'bg-green-100 text-green-800',
    system: 'bg-purple-100 text-purple-800',
    message: 'bg-orange-100 text-orange-800'
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <FiShoppingBag className="text-sm" />;
      case 'message':
        return <FiMessageSquare className="text-sm" />;
      default:
        return <FiBell className="text-sm" />;
    }
  };

  return (
    <div className={`p-4 border-b border-gray-200 last:border-0 ${!read ? 'bg-blue-50' : ''}`}>
      <div className="flex items-start">
        <div className={`${typeColors[type]} w-8 h-8 rounded-xl flex items-center justify-center mr-3`}>
          {getTypeIcon(type)}
        </div>
        <div className="flex-1">
          <p className="text-gray-800">{message}</p>
          <div className="flex justify-between items-center mt-1">
            <span className={`text-xs px-2 py-1 rounded-full ${typeColors[type]}`}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </span>
            <span className="text-xs text-gray-500 flex items-center">
              <FiClock className="mr-1" /> {date}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const QuickActionButton: React.FC<{ 
  icon: React.ReactNode; 
  text: string; 
  to: string; 
}> = ({ icon, text, to }) => (
  <Link 
    to={to} 
    className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-5 text-center shadow-md hover:shadow-lg transition-all text-white"
  >
    <div className="flex flex-col items-center">
      <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-3">
        {icon}
      </div>
      <span className="font-medium">{text}</span>
    </div>
  </Link>
);

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
const calculatePercentageChange = (current: number, previous: number): { percentage: number; type: 'increase' | 'decrease' | 'neutral' } => {
  if (previous === 0) {
    return { percentage: current > 0 ? 100 : 0, type: current > 0 ? 'increase' : 'neutral' };
  }
  
  const change = ((current - previous) / previous) * 100;
  const roundedChange = Math.round(change);
  
  if (roundedChange > 0) {
    return { percentage: roundedChange, type: 'increase' };
  } else if (roundedChange < 0) {
    return { percentage: Math.abs(roundedChange), type: 'decrease' };
  } else {
    return { percentage: 0, type: 'neutral' };
  }
};

// Helper function to get current and previous month data
const getMonthlyData = (items: Array<{ createdAt: string }>) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  // Get start of current month
  const currentMonthStart = new Date(currentYear, currentMonth, 1);
  
  // Get start of previous month
  const previousMonthStart = new Date(currentYear, currentMonth - 1, 1);
  
  // Get start of month before previous month (for previous month end)
  const previousMonthEnd = new Date(currentYear, currentMonth, 0);
  
  const currentMonthItems = items.filter(item => 
    new Date(item.createdAt) >= currentMonthStart
  );
  
  const previousMonthItems = items.filter(item => {
    const itemDate = new Date(item.createdAt);
    return itemDate >= previousMonthStart && itemDate <= previousMonthEnd;
  });
  
  return {
    current: currentMonthItems.length,
    previous: previousMonthItems.length
  };
};

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    orders: 0,
    sales: 0
  });
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [userChange, setUserChange] = useState<{ percentage: number; type: 'increase' | 'decrease' | 'neutral' }>({ percentage: 0, type: 'neutral' });
  const [productChange, setProductChange] = useState<{ percentage: number; type: 'increase' | 'decrease' | 'neutral' }>({ percentage: 0, type: 'neutral' });
  const { notifications, loading: notifLoading, error: notifError } = useNotificationContext();

  // Updated quick actions without Create Notification
  const quickActions = [
    { 
      icon: <FiPlus className="text-xl text-white" />, 
      text: 'Add Product', 
      to: '/admin/products/add',
    },
    { 
      icon: <FiList className="text-xl text-white" />, 
      text: 'View All Orders', 
      to: '/admin/orders',
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch users
        const usersResponse = await axios.get(`${API_BASE_URL}/admin/users`, {
          withCredentials: true
        });
        const usersData = await usersResponse.data;
        
        if (usersData.success) {
          const allUsers = usersData.users;
          setStats(prev => ({ ...prev, users: allUsers.length }));
          
          // Calculate user growth
          const userMonthlyData = getMonthlyData(allUsers);
          const userGrowth = calculatePercentageChange(userMonthlyData.current, userMonthlyData.previous);
          setUserChange(userGrowth);
          
          // Get 5 most recent users
          const sortedUsers = allUsers
            .sort((a: User, b: User) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5);
          setRecentUsers(sortedUsers);
        }

        // Fetch products
        const productsResponse = await axios.get(`${API_BASE_URL}/products`, {
          withCredentials: true
        });
        const productsData = await productsResponse.data;
        
        if (productsData.success) {
          const allProducts = productsData.products;
          setStats(prev => ({ ...prev, products: allProducts.length }));
          
          // Calculate product growth
          const productMonthlyData = getMonthlyData(allProducts);
          const productGrowth = calculatePercentageChange(productMonthlyData.current, productMonthlyData.previous);
          setProductChange(productGrowth);
          
          // Get 5 most recent products
          const sortedProducts = allProducts
            .sort((a: Product, b: Product) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5);
          setRecentProducts(sortedProducts);
        }

        // Fetch orders (admin)
        const ordersResponse = await axios.get(`${API_BASE_URL}/admin/orders`, {
          withCredentials: true
        });
        const ordersData = await ordersResponse.data;
        if (ordersData.success) {
          setStats(prev => ({ ...prev, orders: ordersData.orders.length }));
          setOrders(ordersData.orders);

          // Calculate total sales: only delivered and paid orders
          const totalSales = ordersData.orders
            .filter((order: any) => order.orderStatus === 'Delivered' && order.paymentInfo?.status === 'Paid')
            .reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);
          setStats(prev => ({ ...prev, sales: totalSales }));
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Format recent users for table
  const recentUsersTableData: TableRow[] = recentUsers.map(user => ({
    id: user._id,
    name: user.name,
    email: user.email,
    signup_date: new Date(user.createdAt).toLocaleDateString()
  }));

  // Format recent products for table
  const recentProductsTableData: TableRow[] = recentProducts.map(product => ({
    id: product._id,
    name: product.name,
    category: product.category,
    created_date: new Date(product.createdAt).toLocaleDateString()
  }));

  // Format recent orders for table (5 most recent)
  const recentOrders: TableRow[] = orders
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map((order) => ({
      id: order._id,
      order: `#${order.orderID}`,
      user: order.user?.name || 'Unknown',
      amount: `Rs. ${order.totalAmount.toFixed(2)}`,
      status: (
        <span className={
          order.orderStatus === 'Delivered'
            ? 'bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs'
            : order.orderStatus === 'Processing'
            ? 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs'
            : order.orderStatus === 'Cancelled'
            ? 'bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs'
            : 'bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs'
        }>
          {order.orderStatus}
        </span>
      ),
      date: new Date(order.createdAt).toLocaleString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    }));

  // Map notifications to NotificationItem props (limit to 5 most recent)
  const recentNotifications = notifications.slice(0, 5).map((notif) => ({
    id: notif._id,
    message: notif.message,
    type: notif.type === 'payment' ? 'system' : notif.type, // fallback for color
    date: new Date(notif.createdAt).toLocaleString('en-US', {
      month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
    }),
    read: notif.read,
  }));

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
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard 
            title="Total Users" 
            value={loading ? '...' : stats.users} 
            icon={<FiUsers className="text-xl text-white" />}
            change={loading ? undefined : `${userChange.percentage}% this month`}
            changeType={userChange.type}
          />
          <StatCard 
            title="Total Products" 
            value={loading ? '...' : stats.products} 
            icon={<FiPackage className="text-xl text-white" />}
            change={loading ? undefined : `${productChange.percentage}% this month`}
            changeType={productChange.type}
          />
          <StatCard 
            title="Total Orders" 
            value={loading ? '...' : stats.orders} 
            icon={<FiShoppingBag className="text-xl text-white" />}
            change="+24% this month"
          />
          <StatCard 
            title="Total Sales" 
            value={loading ? '...' : `Rs. ${stats.sales.toLocaleString()}`} 
            icon={<FiDollarSign className="text-xl text-white" />}
            change="+18% this month"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
          {quickActions.map((action, index) => (
            <QuickActionButton 
              key={index}
              icon={action.icon}
              text={action.text}
              to={action.to}
            />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div>
            <DataTable 
              title="Recent Orders"
              columns={['Order', 'User', 'Amount', 'Status', 'Date']}
              data={recentOrders}
              emptyMessage="No recent orders"
              linkText="View all orders"
              linkTo="/admin/orders"
            />
          </div>

          {/* Recent Users */}
          <div>
            <DataTable 
              title="Recent Users"
              columns={['Name', 'Email', 'Signup Date']}
              data={recentUsersTableData}
              emptyMessage="No recent users"
              linkText="View all users"
              linkTo="/admin/users"
            />
          </div>

          {/* Recent Products */}
          <div className="lg:col-span-2">
            <DataTable 
              title="Recent Products"
              columns={['Name', 'Category', 'Created Date']}
              data={recentProductsTableData}
              emptyMessage="No recent products"
              linkText="View all products"
              linkTo="/admin/products"
            />
          </div>

          {/* Notifications */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="border-b border-gray-200 p-5 bg-gray-50 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Recent Notifications</h3>
                <Link 
                  to="/admin/notifications" 
                  className="text-blue-700 hover:text-blue-900 flex items-center text-sm font-medium"
                >
                  View all notifications <FiArrowRight className="ml-1" />
                </Link>
              </div>
              <div className="divide-y divide-gray-200">
                {notifLoading ? (
                  <div className="p-8 text-center text-gray-500">Loading notifications...</div>
                ) : notifError ? (
                  <div className="p-8 text-center text-red-500">{notifError}</div>
                ) : recentNotifications.length > 0 ? (
                  recentNotifications.map(notification => (
                    <NotificationItem key={notification.id} {...notification} />
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    No notifications to display
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;