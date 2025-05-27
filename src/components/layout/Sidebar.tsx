import { useState, useEffect } from 'react'; // Added useEffect for debugging
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, FileText, 
  ChevronRight, ChevronLeft,
  Database, BarChart2
} from 'lucide-react';
import logo from '../../assets/Accenture-Logo.png';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  // Debug: Log the pathname on every render to check its value
  useEffect(() => {
    console.log('Current location.pathname:', location.pathname);
  }, [location.pathname]);

  const navItems = [
    { name: 'Dashboard', icon: <Home size={20} />, path: '/' },
    { name: 'Analysis', icon: <BarChart2 size={20} />, path: '/analysis' },
    { name: 'Companies', icon: <Database size={20} />, path: '/companies' },
    { name: 'Reports', icon: <FileText size={20} />, path: '/reports' },
  ];

  // Helper function to determine if the current path matches or starts with the item path
  const isActivePath = (itemPath: string, currentPath: string) => {
    // Exact match for root path "/"
    if (itemPath === '/') {
      return currentPath === '/';
    }
    // For other paths, check if the current path starts with the item path
    return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`);
  };

  return (
    <aside 
      className={`bg-white border-r border-gray-200 h-screen flex flex-col transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200 h-16">
        {!collapsed && (
          <Link to="/" className="flex items-center">
            <img src={logo} alt="Accenture Logo" className='h-8 rounded'/>
            <span className="ml-2 font-bold text-lg text-gray-800">Accenture</span>
          </Link>
        )}
        {collapsed && (
          <Link to="/" className="flex items-center justify-center flex-1">
            <img src={logo} alt="Accenture Logo" className='h-4 rounded'/>
          </Link>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-md hover:bg-gray-100 transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={18} className="text-gray-600" /> : <ChevronLeft size={18} className="text-gray-600" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                className={`
                  relative group flex items-center p-2 rounded-md transition-colors
                  ${collapsed ? 'justify-center' : ''}
                  ${isActivePath(item.path, location.pathname)
                    ? 'bg-purple-100 text-purple-600' 
                    : 'text-gray-700 hover:bg-purple-50 hover:text-purple-500'}
                `}
                title={collapsed ? item.name : undefined}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {!collapsed && <span className="ml-3">{item.name}</span>}
                {collapsed && (
                  <span className="absolute left-full ml-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 z-10">
                    {item.name}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;