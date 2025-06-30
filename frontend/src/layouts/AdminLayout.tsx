// frontend/src/layouts/AdminLayout.tsx
import React, { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import { NotificationProvider, useNotificationContext } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { FiMenu, FiBell } from 'react-icons/fi';

interface AdminTopbarProps {
  toggleSidebar: () => void;
}

const AdminTopbar: React.FC<AdminTopbarProps> = ({ toggleSidebar }) => {
  const { notifications } = useNotificationContext();
  const { user } = useAuth();
  const unreadCount = notifications.filter(notification => !notification.read).length;

  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 mr-4 transition-colors"
          >
            <FiMenu className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          <Link 
            to="/admin/notifications"
            className="p-2 rounded-full hover:bg-gray-100 relative transition-colors"
          >
            <FiBell className="w-5 h-5 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full border-2 border-white flex items-center justify-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>
          
          <div className="flex items-center cursor-pointer group">
            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium shadow-sm">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="ml-3 hidden lg:block">
              <p className="text-sm font-medium text-gray-800">{user?.name || 'Admin User'}</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar 
        isOpen={sidebarOpen} 
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        isMobile={isMobile}
      />

      {/* Main Content */}
      <div className={`flex-1 min-h-screen transition-all duration-300 ${
        sidebarOpen && !isMobile ? 'lg:ml-64' : 'lg:ml-20'
      }`}>
        {/* Enhanced Topbar */}
        <NotificationProvider>
          <AdminTopbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          
          {/* Content Area */}
          <main className="p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
        </NotificationProvider>
      </div>
    </div>
  );
};

export default AdminLayout;