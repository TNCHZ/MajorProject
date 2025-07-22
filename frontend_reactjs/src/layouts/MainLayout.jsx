import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

const tabs = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Cài đặt", path: "/settings" },
];

const MainLayout = () => {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg">
        <div className="p-4 text-xl font-bold border-b">Trang quản trị</div>
        <nav className="mt-4">
          {tabs.map((tab) => (
            <Link
              key={tab.path}
              to={tab.path}
              className={`block px-4 py-2 hover:bg-blue-100 ${
                location.pathname === tab.path ? "bg-blue-200 font-semibold" : ""
              }`}
            >
              {tab.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
