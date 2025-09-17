import { Link, Outlet, useLocation } from "react-router-dom";
import {
  HomeIcon,
  BookOpenIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ChatBubbleLeftIcon,
} from "@heroicons/react/24/outline";
import { useContext } from "react";
import { MyUserContext } from "../configs/Context";

const tabs = [
  {
    name: "Dashboard",
    path: "dashboard",
    icon: <HomeIcon className="w-6 h-6 mr-3 transition-all duration-300 group-hover:scale-110 group-hover:text-blue-500" />,
    roles: ["ADMIN"],
  },
  {
    name: "Quản lý doanh thu",
    path: "revenue-management",
    icon: <CurrencyDollarIcon className="w-6 h-6 mr-3 transition-all duration-300 group-hover:scale-110 group-hover:text-blue-500" />,
    roles: ["ADMIN"],
  },
  {
    name: "Quản lý người dùng",
    path: "users",
    icon: <UsersIcon className="w-6 h-6 mr-3 transition-all duration-300 group-hover:scale-110 group-hover:text-blue-500" />,
    roles: ["ADMIN"],
  },
  {
    name: "Quản lý sách",
    path: "books",
    icon: <BookOpenIcon className="w-6 h-6 mr-3 transition-all duration-300 group-hover:scale-110 group-hover:text-blue-500" />,
    roles: ["ADMIN", "LIBRARIAN"],
  },
  {
    name: "Quản lý độc giả",
    path: "readers",
    icon: <UserIcon className="w-6 h-6 mr-3 transition-all duration-300 group-hover:scale-110 group-hover:text-blue-500" />,
    roles: ["LIBRARIAN"],
  },
  {
    name: "Quản lý phiếu mượn",
    path: "borrow-slip",
    icon: <ClipboardDocumentListIcon className="w-6 h-6 mr-3 transition-all duration-300 group-hover:scale-110 group-hover:text-blue-500" />,
    roles: ["ADMIN", "LIBRARIAN"],
  },
  {
    name: "Quản lý phiếu phạt",
    path: "fines",
    icon: <CurrencyDollarIcon className="w-6 h-6 mr-3 transition-all duration-300 group-hover:scale-110 group-hover:text-blue-500" />,
    roles: ["ADMIN", "LIBRARIAN"],
  },
  {
    name: "Quản lý trò chuyện",
    path: "chat",
    icon: <ChatBubbleLeftIcon className="w-6 h-6 mr-3 transition-all duration-300 group-hover:scale-110 group-hover:text-blue-500" />,
    roles: ["LIBRARIAN"],
  },
  {
    name: "Đăng xuất",
    path: "logout",
    icon: <ArrowRightOnRectangleIcon className="w-6 h-6 mr-3 transition-all duration-300 group-hover:-translate-x-1 group-hover:text-red-500" />,
    roles: ["ADMIN", "LIBRARIAN"],
  },
];

const MainLayout = () => {
  const user = useContext(MyUserContext);
  const location = useLocation();
  const activeTab = location.pathname.split("/").pop();

  // Filter tabs based on user role
  const visibleTabs = user ? tabs.filter((tab) => tab.roles.includes(user.role)) : [];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-blue-200">
      {/* Sidebar with glass effect */}
      <aside className="w-72 bg-white/80 backdrop-blur-xl shadow-2xl rounded-r-3xl flex flex-col border-r border-blue-100/50">
        <div className="p-6 text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">
          Trang quản trị
        </div>
        <nav className="mt-8 flex-1 px-4">
          {visibleTabs.length > 0 ? (
            visibleTabs.map((tab) => (
              <Link
                key={tab.path}
                to={tab.path}
                className={`group flex items-center px-6 py-3.5 my-2 rounded-2xl transition-all duration-300
                  ${activeTab === tab.path
                    ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-xl scale-105 -translate-y-0.5"
                    : "text-gray-700 hover:bg-blue-50/80 hover:scale-102 hover:shadow-md"}
                `}
                style={{
                  boxShadow: activeTab === tab.path
                    ? "0 10px 20px -5px rgba(37,99,235,0.3)"
                    : undefined,
                }}
              >
                {tab.icon}
                <span className="font-medium text-lg tracking-wide">
                  {tab.name}
                </span>
              </Link>
            ))
          ) : (
            <p className="text-gray-500 text-center">Không có quyền truy cập</p>
          )}
        </nav>
        <div className="p-6 text-xs text-gray-400 border-t border-blue-100/50 text-center">
          © 2025 Library Admin
          <div className="text-blue-400 mt-1">Version 1.0</div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-10 bg-white/60 backdrop-blur-sm rounded-l-3xl shadow-inner">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;