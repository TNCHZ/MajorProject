import React from "react";
import { BookOpen, Users, Clock, CheckCircle } from "lucide-react";

const IntroducePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold">Hệ thống Quản lý Thư viện</h1>
          <p className="mt-2 text-lg text-blue-100">
            Giải pháp hiện đại giúp quản lý sách, bạn đọc và hoạt động mượn trả.
          </p>
        </div>
      </header>

      {/* Giới thiệu chung */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Giới thiệu
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Hệ thống quản lý thư viện được xây dựng bằng ReactJS và TailwindCSS,
              hỗ trợ cán bộ thư viện và bạn đọc tra cứu, mượn trả sách một cách nhanh chóng.
              Nền tảng hiện đại, dễ sử dụng, có khả năng mở rộng và tích hợp với nhiều dịch vụ khác.
            </p>
          </div>
          <img
            src="https://cdn-icons-png.flaticon.com/512/2972/2972356.png"
            alt="Library illustration"
            className="w-80 mx-auto drop-shadow-lg"
          />
        </div>
      </section>

      {/* Các tính năng chính */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-semibold text-center text-gray-800 mb-12">
            Tính năng nổi bật
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 bg-white rounded-2xl shadow-md hover:shadow-lg transition">
              <BookOpen className="w-10 h-10 text-blue-600 mb-4" />
              <h3 className="font-bold text-gray-800 mb-2">Quản lý sách</h3>
              <p className="text-gray-600 text-sm">
                Thêm, sửa, xóa và tra cứu sách nhanh chóng theo nhiều tiêu chí.
              </p>
            </div>
            <div className="p-6 bg-white rounded-2xl shadow-md hover:shadow-lg transition">
              <Users className="w-10 h-10 text-green-600 mb-4" />
              <h3 className="font-bold text-gray-800 mb-2">Quản lý bạn đọc</h3>
              <p className="text-gray-600 text-sm">
                Theo dõi thông tin, phân loại thành viên, hỗ trợ đăng ký trực tuyến.
              </p>
            </div>
            <div className="p-6 bg-white rounded-2xl shadow-md hover:shadow-lg transition">
              <Clock className="w-10 h-10 text-yellow-600 mb-4" />
              <h3 className="font-bold text-gray-800 mb-2">Mượn & Trả sách</h3>
              <p className="text-gray-600 text-sm">
                Ghi nhận lịch sử mượn, tự động tính phí phạt khi quá hạn.
              </p>
            </div>
            <div className="p-6 bg-white rounded-2xl shadow-md hover:shadow-lg transition">
              <CheckCircle className="w-10 h-10 text-purple-600 mb-4" />
              <h3 className="font-bold text-gray-800 mb-2">Báo cáo thống kê</h3>
              <p className="text-gray-600 text-sm">
                Cung cấp báo cáo trực quan: số lượt mượn, sách được yêu thích nhất.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Kết luận */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Hệ thống quản lý thư viện – Nhanh chóng, Hiện đại, Hiệu quả
        </h2>
        <p className="text-gray-600 mb-6">
          Với nền tảng ReactJS và TailwindCSS, hệ thống mang lại trải nghiệm thân thiện,
          tốc độ xử lý cao, và hỗ trợ quản lý toàn diện các hoạt động thư viện.
        </p>
        <button className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 transition">
          Bắt đầu ngay
        </button>
      </section>
    </div>
  );
};

export default IntroducePage;