import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  FileText,
  ChevronLeft,
  ChevronRight,
  Database,
  BarChart2,
  MessageSquare,
} from "lucide-react";
import logo from "../../assets/Accenture-Logo.png";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    console.log("Current location.pathname:", location.pathname);
  }, [location.pathname]);

  const navItems = [
    { name: "Dashboard", icon: <Home size={20} />, path: "/" },
    { name: "Analysis", icon: <BarChart2 size={20} />, path: "/analysis" },
    { name: "Companies", icon: <Database size={20} />, path: "/companies" },
    { name: "Reports", icon: <FileText size={20} />, path: "/reports" },
    { name: "Chat", icon: <MessageSquare size={20} />, path: "/chat" },
  ];

  const isActivePath = (itemPath: string, currentPath: string) => {
    if (itemPath === "/") {
      return currentPath === "/";
    }
    return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`);
  };

  return (
    <aside
      className={`bg-white border-r border-gray-200 h-screen flex flex-col transition-all duration-300 shadow-sm relative ${
        collapsed ? "w-20" : "w-72"
      }`}
    >
      <div className="flex items-center p-6 border-b border-gray-200 h-20 bg-white">
        {!collapsed && (
          <Link to="/" className="flex items-center group">
            <img src={logo} alt="Accenture Logo" className="h-6 rounded" />
            <div className="ml-3">
              <span className="font-bold text-xl text-gray-900 group-hover:text-purple-600 transition-colors">
                Accenture
              </span>
              <p className="text-xs text-gray-600 font-medium">
                M&A Intelligence
              </p>
            </div>
          </Link>
        )}
        {collapsed && (
          <Link to="/" className="flex items-center group">
            <img src={logo} alt="Accenture Logo" className="h-8 rounded" />
          </Link>
        )}
      </div>

      {/* Expand/Collapse Button - Positioned in the middle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-[80px] transform -translate-y-1/2 w-6 h-6 bg-white border border-gray-200 rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center z-10"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <ChevronRight size={12} className="text-gray-600" />
        ) : (
          <ChevronLeft size={12} className="text-gray-600" />
        )}
      </button>

      <nav className="flex-1 overflow-y-auto py-6">
        <ul className="space-y-2 px-4">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                className={`
                  relative group flex items-center p-3 rounded-lg transition-all duration-200
                  ${collapsed ? "justify-center" : ""}
                  ${
                    isActivePath(item.path, location.pathname)
                      ? "bg-purple-50 border border-purple-200 text-purple-700"
                      : "text-gray-700 hover:bg-gray-50 hover:text-purple-600"
                  }
                `}
                title={collapsed ? item.name : undefined}
              >
                <span
                  className={`flex-shrink-0 ${
                    isActivePath(item.path, location.pathname)
                      ? "text-purple-600"
                      : ""
                  }`}
                >
                  {item.icon}
                </span>
                {!collapsed && (
                  <span className="ml-3 font-medium">{item.name}</span>
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
