import React, { useEffect, useState } from 'react';
import Apis, { endpoints } from '../../configs/Apis';
import GoogleBooksSearch from './GoogleBooksSearch';
import ManualBookAdd from './ManualBookAdd';
import { PlusIcon, BookOpenIcon, PencilIcon, XMarkIcon } from '@heroicons/react/24/outline';

const BookPage = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('manual');

  useEffect(() => {
    fetchBooksFromSpring();
  }, []);

  const fetchBooksFromSpring = async () => {
    setLoading(true);
    try {
      const res = await Apis.get(`${endpoints.books}?page=0&size=20&sortBy=title`);
      setBooks(res.data.content || []);
    } catch (err) {
      console.error("Lỗi khi lấy sách từ Spring Boot:", err);
    }
    setLoading(false);
  };

  const AddBookModal = () => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-6 border w-[800px] shadow-xl rounded-3xl bg-white">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">Thêm sách mới</h3>
          <button
            onClick={() => setShowModal(false)}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex items-center px-4 py-2 rounded-xl transition-colors ${activeTab === 'manual'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            <PencilIcon className="h-5 w-5 mr-2" />
            Nhập thông tin sách
          </button>
          <button
            onClick={() => setActiveTab('google')}
            className={`flex items-center px-4 py-2 rounded-xl transition-colors ${activeTab === 'google'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            <BookOpenIcon className="h-5 w-5 mr-2" />
            Tìm từ Google Books
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'manual' ? (
            <ManualBookAdd
              onBookAdded={() => {
                fetchBooksFromSpring();
                setShowModal(false);
              }}
              onClose={() => setShowModal(false)}
            />
          ) : (
            <div className="h-[500px]">
              <GoogleBooksSearch
                onBookAdded={() => {
                  fetchBooksFromSpring();
                  setShowModal(false);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Quản lý Sách</h2>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Thêm sách mới
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl shadow-md">
            <thead>
              <tr className="bg-gray-100 text-gray-600 uppercase text-xs leading-normal">
                <th className="py-3 px-4 text-left">Hình ảnh</th>
                <th className="py-3 px-4 text-left">Tiêu đề</th>
                <th className="py-3 px-4 text-left">Tác giả</th>
                <th className="py-3 px-4 text-left">NXB</th>
                <th className="py-3 px-4 text-left">Năm XB</th>
                <th className="py-3 px-4 text-left">Ngôn ngữ</th>
                <th className="py-3 px-4 text-left">ISBN-10</th>
                <th className="py-3 px-4 text-left">ISBN-13</th>
                <th className="py-3 px-4 text-left">Giá</th>
                <th className="py-3 px-4 text-left">Sách in</th>
                <th className="py-3 px-4 text-left">Sách điện tử</th>
                <th className="py-3 px-4 text-left">Mô tả</th>
                <th className="py-3 px-4 text-left">Ngày tạo</th>
                <th className="py-3 px-4 text-left">Ngày cập nhật</th>
              </tr>
            </thead>
            <tbody className="text-gray-600 text-sm">
              {books.map((book) => (
                <tr
                  key={book.id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-4">
                    {book.image ? (
                      <img
                        src={book.image}
                        alt={book.title}
                        className="w-12 h-16 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-12 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-400">
                        No image
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 font-semibold">{book.title}</td>
                  <td className="py-3 px-4">{book.author}</td>
                  <td className="py-3 px-4">{book.publisher}</td>
                  <td className="py-3 px-4">{book.publishedDate}</td>
                  <td className="py-3 px-4">{book.language}</td>
                  <td className="py-3 px-4">{book.isbn10}</td>
                  <td className="py-3 px-4">{book.isbn13}</td>
                  <td className="py-3 px-4">{book.price} VNĐ</td>
                  <td className="py-3 px-4">{book.isPrinted ? 'Có' : 'Không'}</td>
                  <td className="py-3 px-4">{book.isElectronic ? 'Có' : 'Không'}</td>
                  <td className="py-3 px-4 max-w-xs truncate">{book.description || 'N/A'}</td>
                  <td className="py-3 px-4">{new Date(book.createdDate).toLocaleDateString()}</td>
                  <td className="py-3 px-4">{new Date(book.updatedDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && <AddBookModal />}
    </div>
  );
};

export default BookPage;