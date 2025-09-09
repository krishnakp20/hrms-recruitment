import { Outlet, Link, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  UserPlus,
  Briefcase,
  FileText,
  LogOut,
  Menu,
  X,
  Settings,
  HelpCircle,
  FileSignature,
  ChevronDown,
  ChevronRight,
  Building2,
  Workflow,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null); // Track open submenu
  const location = useLocation();
  const { user, logout } = useAuth();

  const navigation = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Jobs", href: "/jobs", icon: Briefcase },
    { name: "Candidates", href: "/candidates", icon: UserPlus },
    { name: "Applications", href: "/applications", icon: FileText },
    { name: "Create Bank Question", href: "/bank-questions/create", icon: HelpCircle },
    { name: "Candidate Offers", href: "/offers", icon: FileSignature },
    { name: "Internal Careers", href: "/careers", icon: Briefcase },

    {
      name: "Settings",
      icon: Settings,
      children: [
        { name: "Users", href: "/users", icon: Users },
        { name: "Recruitment Agencies", href: "/recruitment-agencies", icon: Building2 },
        { name: "Recruitment Workflows", href: "/recruitment-workflow", icon: Workflow },
      ],
    },
  ];

  const isActive = (href) => {
    if (!href) return false;
    if (href === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(href);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">HRMS</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;

              if (item.children) {
                const isOpen = openMenu === item.name;
                return (
                  <div key={item.name}>
                    {/* Parent */}
                    <button
                      onClick={() =>
                        setOpenMenu(isOpen ? null : item.name)
                      }
                      className={`group flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                        isOpen || item.children.some((c) => isActive(c.href))
                          ? "bg-primary-100 text-primary-900"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <div className="flex items-center">
                        <Icon className="mr-3 h-5 w-5" />
                        {item.name}
                      </div>
                      {isOpen ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>

                    {/* Submenu */}
                    {isOpen && (
                      <div className="ml-6 mt-1 space-y-1">
                        {item.children.map((child) => {
                          const ChildIcon = child.icon;
                          return (
                            <Link
                              key={child.name}
                              to={child.href}
                              className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors duration-200 ${
                                isActive(child.href)
                                  ? "bg-primary-50 text-primary-900"
                                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                              }`}
                            >
                              {ChildIcon && (
                                <ChildIcon className="mr-2 h-4 w-4" />
                              )}
                              {child.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              // Normal link
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    isActive(item.href)
                      ? "bg-primary-100 text-primary-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Welcome back, {user?.full_name || user?.username || "User"}
              </div>
            </div>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
