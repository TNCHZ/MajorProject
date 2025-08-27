import React, { useEffect, useState } from 'react';
import { authApis, endpoints } from '../configs/Apis';

const BorrowSlipPage = () => {
  const [borrowSlips, setBorrowSlips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [markingLost, setMarkingLost] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showLostBooksModal, setShowLostBooksModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false); // Toggle for add borrow slip modal
  const [lostBooks, setLostBooks] = useState([]);
  const [selectedBookIds, setSelectedBookIds] = useState([]);
  const [selectedSlipId, setSelectedSlipId] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [form, setForm] = useState({
    borrowDate: '',
    dueDate: '',
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
  const [book, setBook] = useState(null);
  const [bookSearching, setBookSearching] = useState(false);
  const [bookSearchError, setBookSearchError] = useState('');
  const [selectedBooks, setSelectedBooks] = useState([]);

  // Fetch borrow slips
  useEffect(() => {
    fetchBorrowSlips();
  }, []);

  // Search reader by phone
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

  // Search book by ISBN
  useEffect(() => {
    if (!isbn || (isbn.length !== 10 && isbn.length !== 13)) {
      setBook(null);
      setBookSearchError('');
      return;
    }
    setBookSearching(true);
    setBookSearchError('');
    authApis()
      .get(endpoints['find-book-by-isbn'], { params: { isbn } })
      .then((res) => {
        if (res.data && res.data.title) {
          setBook(res.data);
        } else {
          setBook(null);
          setBookSearchError('Không tìm thấy sách với mã ISBN này!');
        }
      })
      .catch(() => {
        setBook(null);
        setBookSearchError('Không tìm thấy sách với mã ISBN này!');
      })
      .finally(() => setBookSearching(false));
  }, [isbn]);

  const fetchBorrowSlips = async () => {
    setLoading(true);
    try {
      const res = await authApis().get(`${endpoints['borrow-slips']}?page=0&size=20&sortBy=id`, {
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      setBorrowSlips(res.data.content || []);
    } catch (err) {
      console.error('Lỗi khi lấy phiếu mượn từ API:', err);
      alert('Không thể lấy danh sách phiếu mượn');
    }
    setLoading(false);
  };

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
    setSelectedSlipId(slipId);
    setShowStatusModal(true);
  };

  const updateBorrowSlipStatus = async (slipId, status) => {
    if (status === 'LOST' || status === 'DAMAGED') {
      setMarkingLost(true);
      await fetchBooksForStatus(slipId, status);
      setMarkingLost(false);
      return;
    }

    if (!window.confirm('Bạn có chắc muốn xác nhận trả sách cho phiếu mượn này?')) {
      return;
    }

    setMarkingLost(true);
    try {
      const payload = {
        status,
        book_price: 0,
        bookIds: [],
        returnDate: `${new Date().getDate().toString().padStart(2, '0')}/${(new Date().getMonth() + 1)
          .toString()
          .padStart(2, '0')}/${new Date().getFullYear()}`,
      };

      const updateEndpoint =
        typeof endpoints['update-borrow-slip'] === 'function'
          ? endpoints['update-borrow-slip'](slipId)
          : endpoints['update-borrow-slip'].replace('{id}', slipId);

      const response = await authApis().patch(updateEndpoint, payload);
      alert(response.data || 'Trả sách thành công');
      fetchBorrowSlips();
      setShowStatusModal(false);
    } catch (err) {
      console.error(`Lỗi khi cập nhật trạng thái ${status}:`, err);
      alert(`Có lỗi xảy ra khi xác nhận trả sách: ${err.response?.data || err.message}`);
    }
    setMarkingLost(false);
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
        returnDate: `${new Date().getDate().toString().padStart(2, '0')}/${(new Date().getMonth() + 1)
          .toString()
          .padStart(2, '0')}/${new Date().getFullYear()}`,
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
        `Có lỗi xảy ra khi đánh dấu sách ${selectedStatus === 'LOST' ? 'mất' : 'hư'}: ${
          err.response?.data || err.message
        }`
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

  // Add borrow slip handlers
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

  const handleAddBook = () => {
    if (book && !selectedBooks.find((b) => b.isbn === isbn)) {
      setSelectedBooks((prev) => [...prev, book]);
      setBook(null);
      setIsbn('');
    }
  };

  const handleRemoveBook = (isbnToRemove) => {
    setSelectedBooks((prev) => prev.filter((b) => b.isbn !== isbnToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAddError('');
    setAddLoading(true);

    try {
      const submitData = {
        ...form,
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
      setAddError('Lỗi khi thêm phiếu mượn!');
    } finally {
      setAddLoading(false);
    }
  };

  const resetAddForm = () => {
    setForm({
      borrowDate: '',
      dueDate: '',
      note: '',
      readerId: null,
      bookId: null,
    });
    setPhone('');
    setReader(null);
    setSearchError('');
    setIsbn('');
    setBook(null);
    setBookSearchError('');
    setSelectedBooks([]);
    setAddError('');
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

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="grid grid-cols-9 gap-4 p-4 bg-gray-100 font-semibold text-gray-800">
            <div>Mã phiếu</div>
            <div>Độc giả</div>
            <div>Ngày mượn</div>
            <div>Ngày trả dự kiến</div>
            <div>Ngày trả thực tế</div>
            <div>Trạng thái</div>
            <div>Tiền phạt</div>
            <div className="hidden">Sách</div>
            <div>Hành động</div>
          </div>
          {borrowSlips.map((slip) => (
            <div
              key={slip.id}
              className="grid grid-cols-9 gap-4 p-4 border-b border-gray-200 hover:bg-gray-50"
            >
              <div className="font-semibold text-gray-900">{slip.id}</div>
              <div className="text-gray-600">{slip.readerName}</div>
              <div className="text-sm text-gray-500">
                {slip.borrowDate ? new Date(slip.borrowDate).toLocaleDateString() : ''}
              </div>
              <div className="text-sm text-gray-500">
                {slip.dueDate ? new Date(slip.dueDate).toLocaleDateString() : ''}
              </div>
              <div className="text-sm text-gray-500">
                {slip.returnDate ? new Date(slip.returnDate).toLocaleDateString() : 'Chưa trả'}
              </div>
              <div className="text-sm text-gray-500">{slip.status}</div>
              <div className="text-sm text-gray-500">
                {slip.fine === true ? 'Đã nộp' : slip.fine === false ? 'Chưa nộp' : 'Không có phiếu phạt'}
              </div>
              <div className="hidden"></div>
              <div className="flex justify-center items-center">
                {slip.status !== 'LOST' && slip.status !== 'RETURNED' && slip.status !== 'DAMAGED' && (
                  <button
                    onClick={() => openStatusModal(slip.id)}
                    className="px-3 py-1 text-sm text-white rounded-lg font-medium transition-colors duration-200 bg-blue-600 hover:bg-blue-700"
                  >
                    Cập nhật trạng thái
                  </button>
                )}
              </div>
            </div>
          ))}
          {borrowSlips.length === 0 && (
            <div className="p-4 text-center text-gray-500">Không có phiếu mượn nào.</div>
          )}
        </div>
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
                {/* Form bên trái (chiếm 2/3) */}
                <div className="space-y-8 col-span-2">
                  {/* Độc giả */}
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

                  {/* Sách */}
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
                    {book && (
                      <div className="mt-3 flex items-center gap-4 bg-green-50 border border-green-200 rounded-xl p-4">
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
                          onClick={handleAddBook}
                          className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 font-semibold transition"
                        >
                          Thêm
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Thông tin phiếu mượn */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-base font-semibold text-gray-700 mb-2">
                        Ngày mượn (dd-MM-yyyy)
                      </label>
                      <input
                        type="text"
                        name="borrowDate"
                        value={form.borrowDate}
                        onChange={handleChange}
                        placeholder="VD: 16-08-2025"
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition"
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
                        onChange={handleChange}
                        placeholder="VD: 23-08-2025"
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition"
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

                {/* List sách đã chọn bên phải */}
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow col-span-1 h-fit">
                  <h3 className="text-xl font-bold text-gray-700 mb-4 text-center">Danh sách sách đã chọn</h3>
                  {selectedBooks.length === 0 ? (
                    <div className="text-gray-400 text-center">Chưa có sách nào được chọn</div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {selectedBooks.map((b) => (
                        <div
                          key={b.isbn}
                          className="flex items-center gap-3 bg-white rounded-xl shadow px-3 py-2"
                        >
                          {b.image && (
                            <img src={b.image} alt="Bìa sách" className="w-10 h-14 object-cover rounded" />
                          )}
                          <div className="flex-1">
                            <div className="font-semibold text-gray-800">{b.title}</div>
                            <div className="text-xs text-gray-500">{b.author}</div>
                            <div className="text-xs text-gray-500">{b.isbn}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveBook(b.isbn)}
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
              <button
                onClick={() => updateBorrowSlipStatus(selectedSlipId, 'RESERVED')}
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
                            {book.publishedDate ? new Date(book.publishedDate).toLocaleDateString() : 'N/A'}
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
                className={`px-4 py-2 rounded-lg text-white font-medium transition-colors duration-200 ${
                  markingLost || lostBooks.length === 0
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