import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  FiHome, 
  FiUsers, 
  FiPackage, 
  FiShoppingBag, 
  FiBarChart2, 
  FiSettings,
  FiChevronDown,
  FiChevronUp,
  FiX,
  FiLogOut,
  FiMessageSquare,
  FiImage 
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

interface SidebarItem {
  title: string;
  path?: string;
  icon: React.ReactNode;
  nestedItems?: SidebarItem[];
}

interface AdminSidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  isMobile: boolean;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, toggleSidebar, isMobile }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [openNestedMenus, setOpenNestedMenus] = React.useState<Record<string, boolean>>({});
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    const confirmed = window.confirm('Are you sure you want to logout?');
    if (!confirmed) return;

    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const menuItems: SidebarItem[] = [
    { 
      title: 'Dashboard', 
      path: '/admin/dashboard', 
      icon: <FiHome className="w-5 h-5" /> 
    },
    { 
      title: 'Users', 
      path: '/admin/users', 
      icon: <FiUsers className="w-5 h-5" /> 
    },
    {
      title: 'Products',
      icon: <FiPackage className="w-5 h-5" />,
      nestedItems: [
        { 
          title: 'All Products', 
          path: '/admin/products', 
          icon: <div className="w-2 h-2 rounded-full bg-gray-500" /> 
        },
        { 
          title: 'Add Product', 
          path: '/admin/products/add-product', 
          icon: <div className="w-2 h-2 rounded-full bg-gray-500" /> 
        },
      ],
    },
    { 
      title: 'Orders', 
      path: '/admin/orders', 
      icon: <FiShoppingBag className="w-5 h-5" /> 
    },
    { 
      title: 'Messages', 
      path: '/admin/messages', 
      icon: <FiMessageSquare className="w-5 h-5" /> 
    },
    { 
      title: 'Analytics', 
      path: '/admin/analytics', 
      icon: <FiBarChart2 className="w-5 h-5" /> 
    },
    { 
      title: 'Posters', // New menu item
      path: '/admin/posters', 
      icon: <FiImage className="w-5 h-5" /> 
    },
    { 
      title: 'Settings', 
      path: '/admin/settings', 
      icon: <FiSettings className="w-5 h-5" /> 
    },
  ];

  const toggleMenu = (title: string) => {
    setOpenNestedMenus(prev => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const isActive = (path?: string) => path && location.pathname.startsWith(path);

  if (isMobile) {
    return (
      <>
        {isOpen && (
          <div className="fixed inset-0 z-40 flex">
            <div 
              className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
              onClick={toggleSidebar}
            />
            <div className="relative z-50 w-64 bg-white h-full shadow-xl">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium">
                    A
                  </div>
                  <h1 className="text-lg font-bold text-gray-800">Admin Panel</h1>
                </div>
                <button
                  onClick={toggleSidebar}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              
              <div className="py-4 px-3 space-y-1">
                {menuItems.map((item) => (
                  <div key={item.title} className="mb-1">
                    {item.path ? (
                      <NavLink
                        to={item.path}
                        onClick={toggleSidebar}
                        className={({ isActive }) => 
                          `flex items-center gap-3 p-3 rounded-lg transition-colors ${
                            isActive 
                              ? 'bg-blue-50 text-blue-600 font-medium border-l-4 border-blue-500' 
                              : 'text-gray-700 hover:bg-gray-100'
                          }`
                        }
                      >
                        <span className="text-gray-600">{item.icon}</span>
                        <span>{item.title}</span>
                      </NavLink>
                    ) : (
                      <>
                        <button
                          onClick={() => toggleMenu(item.title)}
                          className={`flex items-center justify-between w-full gap-3 p-3 rounded-lg transition-colors ${
                            openNestedMenus[item.title]
                              ? 'bg-gray-100 text-gray-900'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-gray-600">{item.icon}</span>
                            <span>{item.title}</span>
                          </div>
                          {openNestedMenus[item.title] ? (
                            <FiChevronUp className="text-gray-500" />
                          ) : (
                            <FiChevronDown className="text-gray-500" />
                          )}
                        </button>
                        
                        {openNestedMenus[item.title] && item.nestedItems && (
                          <div className="ml-8 space-y-1 border-l border-gray-200 pl-3">
                            {item.nestedItems.map((nestedItem) => (
                              <NavLink
                                key={nestedItem.title}
                                to={nestedItem.path || '#'}
                                onClick={toggleSidebar}
                                className={({ isActive }) => 
                                  `flex items-center gap-3 p-2 pl-3 rounded-lg transition-colors ${
                                    isActive 
                                      ? 'text-blue-600 font-medium' 
                                      : 'text-gray-700 hover:bg-gray-100'
                                  }`
                                }
                              >
                                <span className="text-gray-500">{nestedItem.icon}</span>
                                <span>{nestedItem.title}</span>
                              </NavLink>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="p-4 border-t border-gray-200 mt-auto">
                <button 
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className={`flex items-center gap-3 p-3 w-full rounded-lg text-gray-700 hover:bg-gray-100 transition-colors ${
                    isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoggingOut ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-gray-600"></div>
                      <span className="font-medium">Logging out...</span>
                    </>
                  ) : (
                    <>
                      <FiLogOut className="w-5 h-5 text-gray-600" />
                      <span className="font-medium">Logout</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className={`fixed top-0 left-0 h-screen bg-white border-r border-gray-200 z-30 transition-all duration-300 ${
      isOpen ? 'w-64' : 'w-20'
    }`}>
      <div className="h-full flex flex-col">
        <div className="p-5 border-b border-gray-200 flex items-center">
          {isOpen ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium">
                A
              </div>
              <h1 className="text-lg font-bold text-gray-800">Admin Panel</h1>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from PNG-500 to-indigo-600 flex items-center justify-center text-white font-medium">
              A
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3">
          {menuItems.map((item) => (
            <div key={item.title} className="mb-1">
              {item.path ? (
                <NavLink
                  to={item.path}
                  className={({ isActive }) => 
                    `flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-blue-50 text-blue-600 font-medium' 
                        : 'text-gray-700 hover:bg-gray-100'
                    } ${!isOpen ? 'justify-center' : ''}`
                  }
                >
                  <span className={`${isActive(item.path) ? 'text-blue-600' : 'text-gray-600'}`}>
                    {item.icon}
                  </span>
                  {isOpen && <span>{item.title}</span>}
                </NavLink>
              ) : (
                <>
                  <button
                    onClick={() => toggleMenu(item.title)}
                    className={`flex items-center w-full gap-3 p-3 rounded-lg transition-colors ${
                      openNestedMenus[item.title]
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-700 hover:bg-gray-100'
                    } ${!isOpen ? 'justify-center' : ''}`}
                  >
                    <span className="text-gray-600">{item.icon}</span>
                    {isOpen && (
                      <>
                        <span className="font-medium flex-1 text-left">{item.title}</span>
                        {openNestedMenus[item.title] ? (
                          <FiChevronUp className="text-gray-500" />
                        ) : (
                          <FiChevronDown className="text-gray-500" />
                        )}
                      </>
                    )}
                  </button>
                  
                  {isOpen && openNestedMenus[item.title] && item.nestedItems && (
                    <div className="ml-8 space-y-1 border-l border-gray-200 pl-3">
                      {item.nestedItems.map((nestedItem) => (
                        <NavLink
                          key={nestedItem.title}
                          to={nestedItem.path || '#'}
                          className={({ isActive }) => 
                            `flex items-center gap-3 p-2 pl-3 rounded-lg transition-colors ${
                              isActive 
                                ? 'text-blue-600 font-medium' 
                                : 'text-gray-700 hover:bg-gray-100'
                            }`
                          }
                        >
                          <span className="text-gray-500">{nestedItem.icon}</span>
                          <span>{nestedItem.title}</span>
                        </NavLink>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={`flex items-center gap-3 p-3 w-full rounded-lg text-gray-700 hover:bg-gray-100 transition-colors ${
              isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''
            } ${!isOpen ? 'justify-center' : ''}`}
          >
            {isLoggingOut ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-gray-600"></div>
                {isOpen && <span className="font-medium">Logging out...</span>}
              </>
            ) : (
              <>
                <FiLogOut className="w-5 h-5 text-gray-600" />
                {isOpen && <span className="font-medium">Logout</span>}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;