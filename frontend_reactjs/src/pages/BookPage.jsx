import React, { useCallback, useEffect, useState } from 'react';
import Apis, { authApis, endpoints } from '../configs/Apis';
import ManualBookAdd from './ManualBookAdd';
import { PlusIcon, XMarkIcon, EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const BookPage = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 5;

  // Fetch user role
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await authApis().get(endpoints.profile);
        setUserRole(response.data.role);
      } catch (err) {
        console.error("Lỗi khi lấy thông tin người dùng:", err);
      }
    };
    fetchUserRole();
  }, []);

  // Fetch books from Spring Boot
  const fetchBooksFromSpring = useCallback(async () => {
    setLoading(true);
    try {
      const res = await Apis.get(
        `${endpoints.books}?page=${currentPage}&size=${pageSize}&sortBy=title`
      );
      setBooks(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
    } catch (err) {
      console.error("Lỗi khi lấy sách từ Spring Boot:", err);
    }
    setLoading(false);
  }, [currentPage, pageSize]);

  useEffect(() => {
    fetchBooksFromSpring();
  }, [fetchBooksFromSpring]);

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Fetch book details for view or update
  const fetchBookDetails = useCallback(async (id) => {
    try {
      const res = await Apis.get(endpoints.book(id));
      setSelectedBook(res.data);
    } catch (err) {
      console.error("Lỗi khi lấy chi tiết sách:", err);
    }
  }, []);

  // Handle delete book
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa sách này?")) {
      try {
        const response = await authApis().delete(endpoints['book-delete'](id));
        alert(response.data); // Show "Xóa thành công" on success
        fetchBooksFromSpring();
      } catch (err) {
        console.error("Lỗi khi xóa sách:", err);
        const errorMessage = err.response?.data || "Xóa sách thất bại. Vui lòng thử lại.";
        alert(errorMessage); // Show specific error message from backend
      }
    }
  };

  // Add Book Modal
  const AddBookModal = () => {
    const [show, setShow] = useState(false);
    useEffect(() => {
      const timeout = setTimeout(() => setShow(true), 10);
      return () => clearTimeout(timeout);
    }, []);

    const handleClose = () => {
      setShow(false);
      setTimeout(() => setShowAddModal(false), 300);
    };

    return (
      <div className={`fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'}`}>
        <div className={`relative top-20 mx-auto p-8 border w-full max-w-4xl shadow-2xl rounded-3xl bg-white transition-transform duration-300 ${show ? 'scale-100' : 'scale-95'}`}>
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h3 className="text-2xl font-bold text-gray-900">Thêm sách mới</h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <div className="mt-6">
            <ManualBookAdd
              onBookAdded={() => {
                fetchBooksFromSpring();
                handleClose();
              }}
              onClose={handleClose}
            />
          </div>
        </div>
      </div>
    );
  };

  // View Book Modal
  const ViewBookModal = () => {
    const [show, setShow] = useState(false);
    useEffect(() => {
      const timeout = setTimeout(() => setShow(true), 10);
      return () => clearTimeout(timeout);
    }, []);

    const handleClose = () => {
      setShow(false);
      setTimeout(() => setShowViewModal(false), 300);
    };

    return (
      <div className={`fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'}`}>
        <div className={`relative top-20 mx-auto p-8 border w-full max-w-4xl shadow-2xl rounded-3xl bg-white transition-transform duration-300 ${show ? 'scale-100' : 'scale-95'}`}>
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h3 className="text-2xl font-bold text-gray-900">Chi tiết sách</h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          {selectedBook && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                {selectedBook.image ? (
                  <img
                    src={selectedBook.image}
                    alt={selectedBook.title}
                    className="w-full md:w-64 h-auto md:h-80 object-cover rounded-xl shadow-lg mb-4"
                  />
                ) : (
                  <div className="w-full md:w-64 h-auto md:h-80 bg-gray-200 rounded-xl flex items-center justify-center text-xs text-gray-400 mb-4">
                    No image
                  </div>
                )}
              </div>
              <div className="space-y-4 text-gray-700">
                <p className="flex items-center">
                  <span className="font-semibold w-32 text-gray-900">ID:</span>
                  <span>{selectedBook.id}</span>
                </p>
                <p className="flex items-center">
                  <span className="font-semibold w-32 text-gray-900">Tiêu đề:</span>
                  <span>{selectedBook.title}</span>
                </p>
                <p className="flex items-center">
                  <span className="font-semibold w-32 text-gray-900">Tác giả:</span>
                  <span>{selectedBook.author}</span>
                </p>
                <p>
                  <span className="font-semibold w-32 text-gray-900 block md:inline-block">Mô tả:</span>
                  <span className="text-sm italic">{selectedBook.description || 'Không có mô tả'}</span>
                </p>
                <p className="flex items-center">
                  <span className="font-semibold w-32 text-gray-900">Năm xuất bản:</span>
                  <span>{selectedBook.publishedDate}</span>
                </p>
                <p className="flex items-center">
                  <span className="font-semibold w-32 text-gray-900">Nhà xuất bản:</span>
                  <span>{selectedBook.publisher}</span>
                </p>
                <p className="flex items-center">
                  <span className="font-semibold w-32 text-gray-900">Ngôn ngữ:</span>
                  <span>{selectedBook.language}</span>
                </p>
                <p className="flex items-center">
                  <span className="font-semibold w-32 text-gray-900">ISBN-10:</span>
                  <span>{selectedBook.isbn10}</span>
                </p>
                <p className="flex items-center">
                  <span className="font-semibold w-32 text-gray-900">ISBN-13:</span>
                  <span>{selectedBook.isbn13}</span>
                </p>
                <p className="flex items-center">
                  <span className="font-semibold w-32 text-gray-900">Giá:</span>
                  <span>{selectedBook.price.toLocaleString('vi-VN')} VND</span>
                </p>
                <p className="flex items-center">
                  <span className="font-semibold w-32 text-gray-900">Sách in:</span>
                  <span>{selectedBook.isPrinted ? 'Có' : 'Không'}</span>
                </p>
                {selectedBook.isPrinted && (
                  <>
                    <p className="flex items-center">
                      <span className="font-semibold w-32 text-gray-900">Vị trí kệ:</span>
                      <span>{selectedBook.shelfLocation || 'Không có'}</span>
                    </p>
                    <p className="flex items-center">
                      <span className="font-semibold w-32 text-gray-900">Tổng số bản sao:</span>
                      <span>{selectedBook.totalCopy || 0}</span>
                    </p>
                    <p className="flex items-center">
                      <span className="font-semibold w-32 text-gray-900">Số sách đang mượn:</span>
                      <span>{selectedBook.borrowCount || 0}</span>
                    </p>
                  </>
                )}
                <p className="flex items-center">
                  <span className="font-semibold w-32 text-gray-900">Sách điện tử:</span>
                  <span>{selectedBook.isElectronic ? 'Có' : 'Không'}</span>
                </p>
                {selectedBook.isElectronic && (
                  <>
                    <p className="flex items-center">
                      <span className="font-semibold w-32 text-gray-900">Định dạng:</span>
                      <span>{selectedBook.format || 'Không có'}</span>
                    </p>
                    <p className="flex items-center">
                      <span className="font-semibold w-32 text-gray-900">Giấy phép:</span>
                      <span>{selectedBook.licence || 'Không có'}</span>
                    </p>
                    <p className="flex items-center">
                      <span className="font-semibold w-32 text-gray-900">Tổng số lượt xem:</span>
                      <span>{selectedBook.totalView || 0}</span>
                    </p>
                    <p className="flex items-center">
                      <span className="font-semibold w-32 text-gray-900">File PDF:</span>
                      <span>{selectedBook.filePDF || "Không có"}</span>
                    </p>
                  </>
                )}
                <p className="flex items-center">
                  <span className="font-semibold w-32 text-gray-900">Danh mục:</span>
                  <span className="flex flex-wrap gap-2">
                    {selectedBook.categories.map(cat => (
                      <span key={cat.id} className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {cat.name}
                      </span>
                    ))}
                  </span>
                </p>
                <p className="flex items-center">
                  <span className="font-semibold w-32 text-gray-900">Ngày tạo:</span>
                  <span>{new Date(selectedBook.createdDate).toLocaleString('vi-VN')}</span>
                </p>
                <p className="flex items-center">
                  <span className="font-semibold w-32 text-gray-900">Ngày cập nhật:</span>
                  <span>{new Date(selectedBook.updatedDate).toLocaleString('vi-VN')}</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Update Book Modal
  const UpdateBookModal = () => {
    const [show, setShow] = useState(false);
    useEffect(() => {
      const timeout = setTimeout(() => setShow(true), 10);
      return () => clearTimeout(timeout);
    }, []);

    const handleClose = () => {
      setShow(false);
      setTimeout(() => setShowUpdateModal(false), 300);
    };

    return (
      <div className={`fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'}`}>
        <div className={`relative top-20 mx-auto p-8 border w-full max-w-4xl shadow-2xl rounded-3xl bg-white transition-transform duration-300 ${show ? 'scale-100' : 'scale-95'}`}>
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h3 className="text-2xl font-bold text-gray-900">Cập nhật sách</h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <div className="mt-6">
            <ManualBookAdd
              initialData={selectedBook}
              onBookAdded={() => {
                fetchBooksFromSpring();
                handleClose();
              }}
              onClose={handleClose}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-3xl font-extrabold text-gray-800">Quản lý Sách</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Thêm sách mới
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto bg-white rounded-2xl shadow-xl">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-100 text-gray-600 uppercase text-xs font-semibold tracking-wide">
                  <th className="py-4 px-6 text-left">Hình ảnh</th>
                  <th className="py-4 px-6 text-left">Tiêu đề</th>
                  <th className="py-4 px-6 text-left">Tác giả</th>
                  <th className="py-4 px-6 text-left">Năm XB</th>
                  <th className="py-4 px-6 text-left">Ngôn ngữ</th>
                  <th className="py-4 px-6 text-left">ISBN-10</th>
                  <th className="py-4 px-6 text-left">ISBN-13</th>
                  <th className="py-4 px-6 text-left">Sách in</th>
                  <th className="py-4 px-6 text-left">Sách điện tử</th>
                  <th className="py-4 px-6 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="text-gray-800 text-sm divide-y divide-gray-200">
                {books.map((book) => (
                  <tr
                    key={book.id}
                    className="hover:bg-blue-50 transition-colors duration-200"
                  >
                    <td className="py-4 px-6">
                      {book.image ? (
                        <img
                          src={book.image}
                          alt={book.title}
                          className="w-14 h-20 object-cover rounded-lg shadow-md"
                        />
                      ) : (
                        <div className="w-14 h-20 bg-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-400">
                          No image
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6 font-semibold">{book.title}</td>
                    <td className="py-4 px-6">{book.author}</td>
                    <td className="py-4 px-6">{book.publishedDate}</td>
                    <td className="py-4 px-6">{book.language}</td>
                    <td className="py-4 px-6">{book.isbn10}</td>
                    <td className="py-4 px-6">{book.isbn13}</td>
                    <td className="py-4 px-6">{book.isPrinted ? 'Có' : 'Không'}</td>
                    <td className="py-4 px-6">{book.isElectronic ? 'Có' : 'Không'}</td>
                    <td className="py-4 px-6">
                      <div className="flex space-x-2 justify-center">
                        <button
                          onClick={() => {
                            fetchBookDetails(book.id);
                            setShowViewModal(true);
                          }}
                          className="p-2 text-blue-600 hover:text-blue-800 bg-blue-100 rounded-full transition-colors duration-200"
                          title="Xem chi tiết"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => {
                            fetchBookDetails(book.id);
                            setShowUpdateModal(true);
                          }}
                          className="p-2 text-yellow-600 hover:text-yellow-800 bg-yellow-100 rounded-full transition-colors duration-200"
                          title="Cập nhật"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        {userRole === 'ADMIN' && (
                          <button
                            onClick={() => handleDelete(book.id)}
                            className="p-2 text-red-600 hover:text-red-800 bg-red-100 rounded-full transition-colors duration-200"
                            title="Xóa"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-center items-center mt-8 space-x-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="px-6 py-2 bg-gray-200 text-gray-600 rounded-full disabled:opacity-50 hover:bg-gray-300 transition-colors duration-200"
            >
              Trang trước
            </button>
            <span className="px-4 py-2 text-lg text-gray-800 font-semibold">
              Trang {currentPage + 1} / {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
              className="px-6 py-2 bg-blue-600 text-white rounded-full disabled:opacity-50 hover:bg-blue-700 transition-colors duration-200"
            >
              Trang sau
            </button>
          </div>
        </>
      )}

      {showAddModal && <AddBookModal />}
      {showViewModal && <ViewBookModal />}
      {showUpdateModal && <UpdateBookModal />}
    </div>
  );
};

export default BookPage;