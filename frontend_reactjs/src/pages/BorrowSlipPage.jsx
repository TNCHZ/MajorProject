import React, { useCallback, useEffect, useState } from 'react';
import { authApis, endpoints } from '../configs/Apis';

const BorrowSlipPage = () => {
  // Function to format date for display (dd-MM-yyyy) or API (yyyy-MM-dd)
  const formatDate = (date, forApi = false) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return forApi ? `${year}-${month}-${day}` : `${day}-${month}-${year}`;
  };

  // Calculate today's date and one month from today
  const today = new Date();
  const oneMonthLater = new Date(today);
  oneMonthLater.setMonth(today.getMonth() + 1);

  const [borrowSlips, setBorrowSlips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [markingLost, setMarkingLost] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showLostBooksModal, setShowLostBooksModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [lostBooks, setLostBooks] = useState([]);
  const [selectedBookIds, setSelectedBookIds] = useState([]);
  const [selectedSlipId, setSelectedSlipId] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [userRole, setUserRole] = useState(null); // State for user role
  const [form, setForm] = useState({
    borrowDate: formatDate(today),
    dueDate: formatDate(oneMonthLater),
    note: '',
    readerId: null,
    bookId: null,
  });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');
  const [phone, setPhone] = useState('');
  const [reader, setReader] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [isbn, setIsbn] = useState('');
  const [books, setBooks] = useState([]);
  const [bookSearching, setBookSearching] = useState(false);
  const [bookSearchError, setBookSearchError] = useState('');
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize] = useState(10); // Fixed pageSize to 10
  const [filterPhone, setFilterPhone] = useState(''); // State for filter phone number
  const [filterError, setFilterError] = useState(''); // State for filter error

  // Fetch user role
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await authApis().get(endpoints.profile);
        setUserRole(response.data.role);
      } catch (err) {
        console.error("Lỗi khi lấy thông tin người dùng:", err);
        setUserRole(null); // Default to null if error occurs
      }
    };
    fetchUserRole();
  }, []);

  // Fetch borrow slips with pagination, optionally filtered by phone
  const fetchBorrowSlips = useCallback(async () => {
    setLoading(true);
    setFilterError('');
    try {
      const params = {
        page: currentPage,
        size: pageSize,
        sortBy: 'id',
      };
      const endpoint = filterPhone ? endpoints['borrow-slips-reader'] : endpoints['borrow-slips'];
      if (filterPhone) {
        params.phone = filterPhone;
      }
      const res = await authApis().get(endpoint, {
        params,
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      setBorrowSlips(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
    } catch (err) {
      console.error('Lỗi khi lấy phiếu mượn từ API:', err);
      if (err.response?.status === 404) {
        setFilterError('Không tìm thấy độc giả với số điện thoại này!');
        setBorrowSlips([]);
        setTotalPages(0);
      } else if (err.response?.status === 403) {
        setFilterError('Bạn không có quyền xem phiếu mượn của người khác!');
      } else {
        setFilterError(`Lỗi khi lấy danh sách phiếu mượn: ${err.response?.data || err.message}`);
      }
    }
    setLoading(false);
  }, [currentPage, pageSize, filterPhone]);

  useEffect(() => {
    fetchBorrowSlips();
  }, [fetchBorrowSlips]);

  // Search reader by phone for add modal
  useEffect(() => {
    if (!phone || phone.length !== 10) {
      setReader(null);
      setSearchError('');
      setForm((prev) => ({ ...prev, readerId: null }));
      return;
    }
    setSearching(true);
    setSearchError('');
    authApis()
      .get(endpoints['find-reader-by-phone'], { params: { phone } })
      .then((res) => {
        if (res.data && res.data.id) {
          setReader(res.data);
          setForm((prev) => ({ ...prev, readerId: res.data.id }));
        } else {
          setReader(null);
          setSearchError('Không tìm thấy độc giả với số điện thoại này!');
          setForm((prev) => ({ ...prev, readerId: null }));
        }
      })
      .catch(() => {
        setReader(null);
        setSearchError('Không tìm thấy độc giả với số điện thoại này!');
        setForm((prev) => ({ ...prev, readerId: null }));
      })
      .finally(() => setSearching(false));
  }, [phone]);

  // Search books by ISBN
  useEffect(() => {
    if (!isbn || (isbn.length !== 10 && isbn.length !== 13)) {
      setBooks([]);
      setBookSearchError('');
      return;
    }
    setBookSearching(true);
    setBookSearchError('');
    authApis()
      .get(endpoints['find-book-by-isbn'], { params: { isbn } })
      .then((res) => {
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          setBooks(res.data);
        } else {
          setBooks([]);
          setBookSearchError('Không tìm thấy sách với mã ISBN này!');
        }
      })
      .catch(() => {
        setBooks([]);
        setBookSearchError('Không tìm thấy sách với mã ISBN này!');
      })
      .finally(() => setBookSearching(false));
  }, [isbn]);

  const fetchBooksForStatus = async (slipId, status) => {
    try {
      const res = await authApis().get(endpoints['books-by-borrow-slip'](slipId));
      const books = res.data || [];
      const booksWithIds = books.map((book, index) => ({
        ...book,
        id: book.id !== undefined ? book.id : index,
      }));
      setLostBooks(booksWithIds);
      setSelectedSlipId(slipId);
      setSelectedStatus(status);
      setShowLostBooksModal(true);
    } catch (err) {
      console.error(`Lỗi khi lấy danh sách sách cho trạng thái ${status}:`, err);
      alert('Không thể lấy danh sách sách cho phiếu mượn này');
    }
  };

  const handleBookSelection = (bookId) => {
    setSelectedBookIds((prev) =>
      prev.includes(bookId) ? prev.filter((id) => id !== bookId) : [...prev, bookId]
    );
  };

  const handleSelectAll = () => {
    setSelectedBookIds(
      selectedBookIds.length === lostBooks.length ? [] : lostBooks.map((book) => book.id)
    );
  };

  const openStatusModal = (slipId) => {
    const slip = borrowSlips.find((s) => s.id === slipId);
    setSelectedSlipId(slipId);
    setSelectedStatus(slip?.status || null);
    setShowStatusModal(true);
  };

  const updateBorrowSlipStatus = async (slipId, status) => {
    if (status === 'LOST' || status === 'DAMAGED') {
      setMarkingLost(true);
      await fetchBooksForStatus(slipId, status);
      setMarkingLost(false);
      return;
    }

    if (status === 'RETURNED' || status === 'BORROWING') {
      if (!window.confirm(`Bạn có chắc muốn xác nhận ${status === 'RETURNED' ? 'trả sách' : 'đã lấy sách'} cho phiếu mượn này?`)) {
        return;
      }

      setMarkingLost(true);
      try {
        const res = await authApis().get(endpoints['books-by-borrow-slip'](slipId));
        const books = res.data || [];
        const bookIds = books.map((book) => book.id);

        const payload = {
          status,
          book_price: 0,
          bookIds: status === 'RETURNED' ? bookIds : [],
          returnDate: status === 'RETURNED' ? formatDate(new Date(), true) : null,
        };

        const updateEndpoint =
          typeof endpoints['update-borrow-slip'] === 'function'
            ? endpoints['update-borrow-slip'](slipId)
            : endpoints['update-borrow-slip'].replace('{id}', slipId);

        const response = await authApis().patch(updateEndpoint, payload);
        alert(response.data || `${status === 'RETURNED' ? 'Trả sách' : 'Đã lấy sách'} thành công`);
        fetchBorrowSlips();
        setShowStatusModal(false);
      } catch (err) {
        console.error(`Lỗi khi cập nhật trạng thái ${status}:`, err);
        alert(`Có lỗi xảy ra khi ${status === 'RETURNED' ? 'xác nhận trả sách' : 'xác nhận đã lấy sách'}: ${err.response?.data || err.message}`);
      }
      setMarkingLost(false);
      return;
    }
  };

  const deleteBorrowSlip = async (slipId) => {
    if (!window.confirm('Bạn có chắc muốn xóa phiếu mượn này?')) {
      return;
    }
    try {
      const response = await authApis().delete(endpoints['borrow-slip-delete'](slipId));
      alert(response.data || 'Xóa phiếu mượn thành công');
      fetchBorrowSlips();
      setShowStatusModal(false);
    } catch (err) {
      console.error('Lỗi khi xóa phiếu mượn:', err);
      alert(`Có lỗi xảy ra khi xóa phiếu mượn: ${err.response?.data || err.message}`);
    }
  };

  const confirmBooksStatus = async () => {
    if (selectedBookIds.length === 0) {
      alert(`Vui lòng chọn ít nhất một cuốn sách để đánh dấu ${selectedStatus === 'LOST' ? 'mất' : 'hư'}.`);
      return;
    }

    const selectedBooks = lostBooks.filter((book) => selectedBookIds.includes(book.id));
    const invalidPriceBooks = selectedBooks.filter((book) => !book.price || isNaN(book.price));
    if (invalidPriceBooks.length > 0) {
      alert('Một số sách được chọn không có giá hợp lệ. Vui lòng kiểm tra.');
      return;
    }

    setMarkingLost(true);
    try {
      const totalPrice = selectedBooks.reduce((sum, book) => sum + book.price, 0).toFixed(2);
      const payload = {
        status: selectedStatus,
        book_price: totalPrice,
        bookIds: selectedBookIds,
        returnDate: formatDate(new Date(), true),
      };

      const updateEndpoint =
        typeof endpoints['update-borrow-slip'] === 'function'
          ? endpoints['update-borrow-slip'](selectedSlipId)
          : endpoints['update-borrow-slip'].replace('{id}', selectedSlipId);

      const response = await authApis().patch(updateEndpoint, payload);
      alert(response.data || `Đã đánh dấu sách ${selectedStatus === 'LOST' ? 'mất' : 'hư'}`);
      fetchBorrowSlips();
      closeLostBooksModal();
      setShowStatusModal(false);
    } catch (err) {
      console.error(`Lỗi khi xác nhận trạng thái ${selectedStatus}:`, err);
      alert(
        `Có lỗi xảy ra khi đánh dấu sách ${selectedStatus === 'LOST' ? 'mất' : 'hư'}: ${err.response?.data || err.message}`
      );
    }
    setMarkingLost(false);
  };

  const closeLostBooksModal = () => {
    setShowLostBooksModal(false);
    setLostBooks([]);
    setSelectedBookIds([]);
    setSelectedStatus(null);
  };

  const closeStatusModal = () => {
    setShowStatusModal(false);
    setSelectedSlipId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhoneChange = (e) => {
    setPhone(e.target.value);
  };

  const handleIsbnChange = (e) => {
    setIsbn(e.target.value);
  };

  const handleAddBook = (book) => {
    if (book && !selectedBooks.find((b) => b.id === book.id)) {
      setSelectedBooks((prev) => [...prev, book]);
      setBooks([]);
      setIsbn('');
    }
  };

  const handleRemoveBook = (bookId) => {
    setSelectedBooks((prev) => prev.filter((b) => b.id !== bookId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAddError('');
    setAddLoading(true);

    try {
      const submitData = {
        ...form,
        borrowDate: formatDate(new Date(form.borrowDate.split('-').reverse().join('-')), true),
        dueDate: formatDate(new Date(form.dueDate.split('-').reverse().join('-')), true),
        bookIds: selectedBooks.map((b) => b.id),
      };
      const formData = new FormData();
      formData.append('borrow-slip', new Blob([JSON.stringify(submitData)], { type: 'application/json' }));
      formData.append('bookIds', new Blob([JSON.stringify(selectedBooks.map((b) => b.id))], { type: 'application/json' }));
      const res = await authApis().post(endpoints['add-borrow-slip'], formData);

      if (res.status === 200) {
        setShowAddModal(false);
        resetAddForm();
        fetchBorrowSlips();
        alert('Thêm phiếu mượn thành công!');
      } else {
        setAddError('Thêm phiếu mượn thất bại!');
      }
    } catch (err) {
      setAddError(`Lỗi khi thêm phiếu mượn: ${err.response?.data || err.message}`);
    } finally {
      setAddLoading(false);
    }
  };

  const resetAddForm = () => {
    setForm({
      borrowDate: formatDate(new Date()),
      dueDate: formatDate(new Date(new Date().setMonth(new Date().getMonth() + 1))),
      note: '',
      readerId: null,
      bookId: null,
    });
    setPhone('');
    setReader(null);
    setSearchError('');
    setIsbn('');
    setBooks([]);
    setBookSearchError('');
    setSelectedBooks([]);
    setAddError('');
  };

  const handleFilterPhoneChange = (e) => {
    setFilterPhone(e.target.value);
    setCurrentPage(0); // Reset to first page when filter changes
  };

  const clearFilter = () => {
    setFilterPhone('');
    setFilterError('');
    setCurrentPage(0); // Reset to first page
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Quản lý Phiếu mượn</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow transition-colors duration-200 font-medium"
        >
          Thêm phiếu mượn
        </button>
      </div>

      {/* Filter by Phone Number */}
      <div className="mb-6">
        <label className="block text-base font-semibold text-gray-700 mb-2">Lọc theo số điện thoại độc giả</label>
        <div className="flex items-center gap-4">
          <input
            type="text"
            value={filterPhone}
            onChange={handleFilterPhoneChange}
            placeholder="Nhập số điện thoại (10 số)"
            className="w-full max-w-md p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition"
          />
          <button
            onClick={clearFilter}
            className="px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors duration-200 font-medium"
          >
            Xóa bộ lọc
          </button>
        </div>
        {filterError && <div className="text-red-500 mt-2">{filterError}</div>}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-gray-600">
              Trang {currentPage + 1} / {totalPages}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="grid grid-cols-11 gap-4 p-4 bg-gray-100 font-semibold text-gray-800">
              <div>Mã phiếu</div>
              <div>Mã độc giả</div>
              <div>Tên độc giả</div>
              <div>SĐT độc giả</div>
              <div>Ngày mượn</div>
              <div>Ngày trả dự kiến</div>
              <div>Ngày trả thực tế</div>
              <div>Trạng thái</div>
              <div>Tiền phạt</div>
              <div>Ghi chú</div>
              <div>Hành động</div>
            </div>
            {borrowSlips.map((slip) => (
              <div
                key={slip.id}
                className="grid grid-cols-11 gap-4 p-4 border-b border-gray-200 hover:bg-gray-50"
              >
                <div className="font-semibold text-gray-900">{slip.id}</div>
                <div className="text-gray-600">{slip.readerId}</div>
                <div className="text-gray-600">{slip.readerName}</div>
                <div className="text-gray-600">{slip.readerPhone}</div>
                <div className="text-sm text-gray-500">
                  {slip.borrowDate ? new Date(slip.borrowDate).toLocaleDateString('vi-VN') : ''}
                </div>
                <div className="text-sm text-gray-500">
                  {slip.dueDate ? new Date(slip.dueDate).toLocaleDateString('vi-VN') : ''}
                </div>
                <div className="text-sm text-gray-500">
                  {slip.returnDate ? new Date(slip.returnDate).toLocaleDateString('vi-VN') : 'Chưa trả'}
                </div>
                <div className="text-sm text-gray-500">{slip.status}</div>
                <div className="text-sm text-gray-500">
                  {slip.fine === true ? 'Đã nộp' : slip.fine === false ? 'Chưa nộp' : 'Không có phiếu phạt'}
                </div>
                <div className="text-sm text-gray-500 truncate">{slip.note || 'N/A'}</div>
                <div className="flex justify-center items-center space-x-2">
                  {(slip.status === 'RESERVED' || slip.status === 'BORROWING') && (
                    <button
                      onClick={() => openStatusModal(slip.id)}
                      className="px-3 py-1 text-sm text-white rounded-lg font-medium transition-colors duration-200 bg-blue-600 hover:bg-blue-700"
                    >
                      Cập nhật trạng thái
                    </button>
                  )}
                  {userRole === 'ADMIN' && (
                    <button
                      onClick={() => deleteBorrowSlip(slip.id)}
                      className="px-3 py-1 text-sm text-white rounded-lg font-medium transition-colors duration-200 bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800"
                    >
                      Xóa
                    </button>
                  )}
                </div>
              </div>
            ))}
            {borrowSlips.length === 0 && (
              <div className="p-4 text-center text-gray-500">Không có phiếu mượn nào.</div>
            )}
          </div>
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl disabled:opacity-50 hover:bg-blue-700 transition"
            >
              Trang trước
            </button>
            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i)}
                  className={`px-3 py-1 rounded-lg ${currentPage === i ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl disabled:opacity-50 hover:bg-blue-700 transition"
            >
              Trang sau
            </button>
          </div>
        </>
      )}

      {/* Add Borrow Slip Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity duration-300">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 max-w-5xl mx-auto max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-blue-700">Thêm Phiếu Mượn</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetAddForm();
                }}
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-8 col-span-2">
                  <div>
                    <label className="block text-base font-semibold text-gray-700 mb-2">Số điện thoại độc giả</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={handlePhoneChange}
                      placeholder="Nhập số điện thoại"
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition"
                    />
                    {searching && <div className="text-blue-500 mt-2">Đang tìm độc giả...</div>}
                    {searchError && <div className="text-red-500 mt-2">{searchError}</div>}
                    {reader && (
                      <div className="mt-3 flex items-center gap-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-blue-700">{reader.name || reader.fullName}</span>
                          <span className="text-sm text-gray-600">Email: {reader.email}</span>
                          <span className="text-sm text-gray-600">SĐT: {reader.phone}</span>
                          <span className="text-sm text-gray-600">ID: {reader.id}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-base font-semibold text-gray-700 mb-2">Mã ISBN sách</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={isbn}
                        onChange={handleIsbnChange}
                        placeholder="Nhập mã ISBN (10 hoặc 13 số)"
                        className="flex-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition"
                      />
                    </div>
                    {bookSearching && <div className="text-blue-500 mt-2">Đang tìm sách...</div>}
                    {bookSearchError && <div className="text-red-500 mt-2">{bookSearchError}</div>}
                    {books.length > 0 && (
                      <div className="mt-3 space-y-3">
                        {books.map((book) => (
                          <div
                            key={book.id}
                            className="flex items-center gap-4 bg-green-50 border border-green-200 rounded-xl p-4"
                          >
                            {book.image && (
                              <img src={book.image} alt="Bìa sách" className="w-16 h-20 object-cover rounded shadow" />
                            )}
                            <div className="flex-1">
                              <div className="font-semibold text-green-700">{book.title}</div>
                              <div className="text-sm text-gray-600">Tác giả: {book.author}</div>
                              <div className="text-sm text-gray-600">Năm xuất bản: {book.publishedDate}</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleAddBook(book)}
                              className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 font-semibold transition"
                            >
                              Thêm
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-base font-semibold text-gray-700 mb-2">
                        Ngày mượn (dd-MM-yyyy)
                      </label>
                      <input
                        type="text"
                        name="borrowDate"
                        value={form.borrowDate}
                        readOnly
                        className="w-full p-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-base font-semibold text-gray-700 mb-2">
                        Ngày trả dự kiến (dd-MM-yyyy)
                      </label>
                      <input
                        type="text"
                        name="dueDate"
                        value={form.dueDate}
                        readOnly
                        className="w-full p-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-base font-semibold text-gray-700 mb-2">Ghi chú</label>
                    <textarea
                      name="note"
                      value={form.note}
                      onChange={handleChange}
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition"
                    />
                  </div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow col-span-1 h-fit">
                  <h3 className="text-xl font-bold text-gray-700 mb-4 text-center">Danh sách sách đã chọn</h3>
                  {selectedBooks.length === 0 ? (
                    <div className="text-gray-400 text-center">Chưa có sách nào được chọn</div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {selectedBooks.map((b) => (
                        <div
                          key={b.id}
                          className="flex items-center gap-3 bg-white rounded-xl shadow px-3 py-2"
                        >
                          {b.image && (
                            <img src={b.image} alt="Bìa sách" className="w-10 h-14 object-cover rounded" />
                          )}
                          <div className="flex-1">
                            <div className="font-semibold text-gray-800">{b.title}</div>
                            <div className="text-xs text-gray-500">{b.author}</div>
                            <div className="text-xs text-gray-500">{b.id}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveBook(b.id)}
                            className="ml-2 text-red-500 hover:text-red-700 text-lg font-bold"
                            title="Xóa sách"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetAddForm();
                  }}
                  className="px-5 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-semibold transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={addLoading || !reader || selectedBooks.length === 0}
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  {addLoading ? 'Đang xử lý...' : 'Thêm phiếu mượn'}
                </button>
              </div>
              {addError && <div className="text-red-500 text-center font-semibold mt-4">{addError}</div>}
            </form>
          </div>
        </div>
      )}

      {/* Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity duration-300">
          <div className="bg-white rounded-2xl shadow-2xl p-6 mx-auto max-w-md sm:max-w-lg">
            <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-2">
              <h3 className="text-2xl font-bold text-gray-900">Cập nhật trạng thái phiếu mượn #{selectedSlipId}</h3>
              <button
                onClick={closeStatusModal}
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {selectedStatus === 'RESERVED' && (
                <>
                  <button
                    onClick={() => updateBorrowSlipStatus(selectedSlipId, 'BORROWING')}
                    className="px-4 py-2 text-white rounded-lg font-medium transition-colors duration-200 bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800"
                  >
                    Xác nhận đang mượn
                  </button>
                  <button
                    onClick={() => deleteBorrowSlip(selectedSlipId)}
                    className="px-4 py-2 text-white rounded-lg font-medium transition-colors duration-200 bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800"
                  >
                    Xóa
                  </button>
                </>
              )}
              {selectedStatus === 'BORROWING' && (
                <>
                  <button
                    onClick={() => updateBorrowSlipStatus(selectedSlipId, 'RETURNED')}
                    className="px-4 py-2 text-white rounded-lg font-medium transition-colors duration-200 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800"
                  >
                    Trả sách
                  </button>
                  <button
                    onClick={() => updateBorrowSlipStatus(selectedSlipId, 'LOST')}
                    className="px-4 py-2 text-white rounded-lg font-medium transition-colors duration-200 bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800"
                  >
                    Mất sách
                  </button>
                  <button
                    onClick={() => updateBorrowSlipStatus(selectedSlipId, 'DAMAGED')}
                    className="px-4 py-2 text-white rounded-lg font-medium transition-colors duration-200 bg-gradient-to-r from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800"
                  >
                    Hư sách
                  </button>
                  {userRole === 'ADMIN' && (
                    <button
                      onClick={() => deleteBorrowSlip(selectedSlipId)}
                      className="px-4 py-2 text-white rounded-lg font-medium transition-colors duration-200 bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800"
                    >
                      Xóa
                    </button>
                  )}
                </>
              )}
              {(selectedStatus === 'RETURNED' || selectedStatus === 'LOST' || selectedStatus === 'DAMAGED') && userRole === 'ADMIN' && (
                <button
                  onClick={() => deleteBorrowSlip(selectedSlipId)}
                  className="px-4 py-2 text-white rounded-lg font-medium transition-colors duration-200 bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800"
                >
                  Xóa
                </button>
              )}
              <button
                onClick={closeStatusModal}
                className="px-4 py-2 text-white rounded-lg font-medium transition-colors duration-200 bg-gray-500 hover:bg-gray-600"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lost Books Modal */}
      {showLostBooksModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity duration-300">
          <div className="bg-white rounded-2xl shadow-2xl p-6 mx-auto max-w-md sm:max-w-lg md:max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-2">
              <h3 className="text-2xl font-bold text-gray-900">
                Chọn sách {selectedStatus === 'LOST' ? 'mất' : 'hư'} - Phiếu mượn #{selectedSlipId}
              </h3>
              <button
                onClick={closeLostBooksModal}
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {lostBooks.length > 0 ? (
              <>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full text-sm text-left text-gray-600">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedBookIds.length === lostBooks.length && lostBooks.length > 0}
                            onChange={handleSelectAll}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </th>
                        <th className="px-4 py-3">Tiêu đề</th>
                        <th className="px-4 py-3">Tác giả</th>
                        <th className="px-4 py-3">Ngày xuất bản</th>
                        <th className="px-4 py-3">Giá</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lostBooks.map((book, index) => (
                        <tr
                          key={book.id}
                          className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors duration-150`}
                        >
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedBookIds.includes(book.id)}
                              onChange={() => handleBookSelection(book.id)}
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-4 py-3 font-medium">{book.title}</td>
                          <td className="px-4 py-3">{book.author}</td>
                          <td className="px-4 py-3">
                            {book.publishedDate ? new Date(book.publishedDate).toLocaleDateString('vi-VN') : 'N/A'}
                          </td>
                          <td className="px-4 py-3">{book.price ? `${book.price.toFixed(2)} VNĐ` : 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm font-semibold text-gray-700">
                  Tổng giá sách được chọn:{' '}
                  {lostBooks
                    .filter((book) => selectedBookIds.includes(book.id))
                    .reduce((sum, book) => sum + (book.price || 0), 0)
                    .toFixed(2)}{' '}
                  VNĐ
                </div>
              </>
            ) : (
              <div className="text-center text-gray-500 py-4">Không có sách nào cho phiếu mượn này.</div>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={closeLostBooksModal}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200 font-medium"
              >
                Hủy
              </button>
              <button
                onClick={confirmBooksStatus}
                disabled={markingLost || lostBooks.length === 0}
                className={`px-4 py-2 rounded-lg text-white font-medium transition-colors duration-200 ${markingLost || lostBooks.length === 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : selectedStatus === 'LOST'
                      ? 'bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800'
                      : 'bg-gradient-to-r from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800'
                  }`}
              >
                {markingLost ? 'Đang xử lý...' : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BorrowSlipPage;