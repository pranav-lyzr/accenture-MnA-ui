
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Home,  FileText, 
   ChevronRight, ChevronLeft,
  Database, BarChart2
} from 'lucide-react';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { name: 'Dashboard', icon: <Home size={20} />, path: '/' },
    // { name: 'Search', icon: <Search size={20} />, path: '/search' },
    { name: 'Analysis', icon: <BarChart2 size={20} />, path: '/analysis' },
    { name: 'Companies', icon: <Database size={20} />, path: '/companies' },
    // { name: 'Candidates', icon: <Users size={20} />, path: '/candidates' },
    { name: 'Reports', icon: <FileText size={20} />, path: '/reports' },
    // { name: 'Settings', icon: <Settings size={20} />, path: '/settings' },
  ];

  return (
    <aside 
      className={`bg-white border-r border-gray-200 h-screen flex flex-col transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!collapsed && (
          <Link to="/" className="flex items-center">
            {/* <div className="h-8 w-8 rounded bg-purple-500"></div> */}
            <span className="ml-2 font-bold text-lg">Accenture</span>
          </Link>
        )}
        {collapsed && (
          <div className="h-8 w-8 mx-auto rounded bg-purple-500"></div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-md hover:bg-gray-100"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                className="flex items-center p-2 rounded-md text-gray-700 hover:bg-gray-100 hover:text-purple-500 group transition-colors"
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {!collapsed && <span className="ml-3">{item.name}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
