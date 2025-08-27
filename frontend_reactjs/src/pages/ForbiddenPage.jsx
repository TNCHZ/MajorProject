import React from 'react';
import { Link } from 'react-router-dom';

const ForbiddenPage = () => {
  return (
    <div className="p-6 min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-md p-6 text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">403 - Truy cập bị từ chối</h1>
        <p className="text-gray-700 mb-4">Bạn không có quyền truy cập trang này.</p>
        <Link
          to="/main/dashboard"
          className="px-5 py-3 bg-blue-600 text-white rounded-2xl shadow hover:bg-blue-700 font-semibold transition"
        >
          Quay lại Trang chính
        </Link>
      </div>
    </div>
  );
};

export default ForbiddenPage;