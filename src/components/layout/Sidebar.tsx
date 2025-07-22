
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, FileText,  ChevronLeft,
  Database, BarChart2,
  MessageSquare
} from 'lucide-react';
import logo from '../../assets/Accenture-Logo.png';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    console.log('Current location.pathname:', location.pathname);
  }, [location.pathname]);

  const navItems = [
    { name: 'Dashboard', icon: <Home size={20} />, path: '/' },
    { name: 'Analysis', icon: <BarChart2 size={20} />, path: '/analysis' },
    { name: 'Companies', icon: <Database size={20} />, path: '/companies' },
    { name: 'Reports', icon: <FileText size={20} />, path: '/reports' },
    { name: 'Chat', icon: <MessageSquare size={20} />, path: '/chat' },
  ];

  const isActivePath = (itemPath: string, currentPath: string) => {
    if (itemPath === '/') {
      return currentPath === '/';
    }
    return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`);
  };

  return (
    <aside 
      className={`bg-white border-r border-gray-200 h-screen flex flex-col transition-all duration-300 shadow-sm ${
        collapsed ? 'w-20' : 'w-72'
      }`}
    >
      <div className="flex items-center justify-between p-6 border-b border-gray-200 h-20 bg-purple-500/10">
        {!collapsed && (
          <Link to="/" className="flex items-center group">
            <img src={logo} alt="Accenture Logo" className='h-6 rounded'/>
            <div className="ml-3">
              <span className="font-bold text-xl text-gray-900 group-hover:text-purple-600 transition-colors">
                Accenture
              </span>
              <p className="text-xs text-gray-600 font-medium">M&A Intelligence</p>
            </div>
          </Link>
        )}
        {collapsed && (
          <Link to="/" className="flex items-center justify-center flex-1 group">
            <img src={logo} alt="Accenture Logo" className='h-8 mx-auto rounded'/>
          </Link>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-lg hover:bg-white hover:shadow-sm transition-all duration-200 border border-transparent hover:border-gray-200"
          aria-label={collapsed ? 'Expand sidebar ml-5' : 'Collapse sidebar p-2 '}
        >
          {collapsed ? 
            <></> : 
            <ChevronLeft size={18} className="text-gray-600" />
          }
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-6">
        <ul className="space-y-2 px-4">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                className={`
                  relative group flex items-center p-4 rounded-xl transition-all duration-200
                  ${collapsed ? 'justify-center' : ''}
                  ${isActivePath(item.path, location.pathname)
                    ? 'bg-purple-100 shadow-sm border border-purple-200' 
                    : 'text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 hover:text-purple-600 hover:shadow-sm'}
                `}
                title={collapsed ? item.name : undefined}
              >
                <span className={`flex-shrink-0 ${isActivePath(item.path, location.pathname) ? 'text-purple-600' : ''}`}>
                  {item.icon}
                </span>
                {!collapsed && <span className="ml-4 font-medium">{item.name}</span>}
                {/* {collapsed && (
                  <span className="absolute left-full ml-4 hidden group-hover:block bg-gray-900 text-white text-sm rounded-lg py-2 px-3 z-50 whitespace-nowrap shadow-lg border border-gray-700">
                    {item.name}
                  </span>
                )} */}
                {isActivePath(item.path, location.pathname) && !collapsed && (
                  <div className="absolute right-3 w-2 h-2 rounded-full bg-purple-500"></div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className={`p-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-purple-50 ${collapsed ? 'text-center' : ''}`}>
        {!collapsed && (
          <div className="text-xs text-gray-600">
            <p className="font-semibold">v2.1.0</p>
            <p>© 2024 Accenture</p>
          </div>
        )}
        {collapsed && (
          <div className="w-2 h-2 rounded-full bg-purple-400 mx-auto"></div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
