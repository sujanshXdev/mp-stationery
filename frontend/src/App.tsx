import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './utils/apiConfig'; 
import './utils/getNetworkInfo'; 
import Home from './pages/Home';
import Shop from './pages/Shop';
import Layout from './layout';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Register from './pages/auth/Register';
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import ScrollToTop from './components/ScrollToTop';
import AboutUs from './pages/AboutUs';
import PosterModal from './components/PosterModal';
import LenisProvider from './components/LenisProvider';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import Users from './pages/admin/Users';
import AddProduct from './pages/admin/AddProduct';
import Products from './pages/admin/Products';
import OrderPage from './pages/admin/Orders';
import Notifications from './pages/admin/Notifications';
import MessagesPage from './pages/admin/MessagesPage';
import Analytics from './pages/admin/Analytics';
import Settings from './pages/admin/Settings';
import ProtectedRoute from './components/ProtectedRoute';
import PosterManagement from './pages/admin/PosterManagement';

const App: React.FC = () => {
  return (
    <LenisProvider>
      <Router>
        <ScrollToTop />
        <Toaster position="bottom-center" reverseOrder={false} />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/about-us" element={<AboutUs />} />
          </Route>
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="orders" element={<OrderPage />} /> 
            <Route path="products" element={<Products />} />
            <Route path="products/add-product" element={<AddProduct />} />
            <Route path="posters" element={<PosterManagement />} />
            <Route path="notifications" element={<Notifications/>} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="analytics" element={<Analytics/>} />
            <Route path="settings" element={<Settings/>} />
          </Route>
        </Routes>
        <PosterModal />
      </Router>
    </LenisProvider>
  );
};

export default App;