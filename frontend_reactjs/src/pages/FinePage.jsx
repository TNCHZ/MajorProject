import React, { useCallback, useEffect, useState } from 'react';
import { authApis, endpoints } from '../configs/Apis';
import useOnlinePayment from '../hook/UseOnlinePayment';

const FinePage = () => {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [payingFineId, setPayingFineId] = useState(null);
  const [deletingFineId, setDeletingFineId] = useState(null); // Track delete loading state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [amount, setAmount] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize] = useState(10); // Fixed pageSize to match BorrowSlipPage
  const [filterPhone, setFilterPhone] = useState(''); // State for filter phone number
  const [filterError, setFilterError] = useState(''); // State for filter error
  const [userRole, setUserRole] = useState(null); // State for user role

  const { initiateOnlinePayment, loading: paymentLoading, error: paymentError } = useOnlinePayment();

  // Fetch user role
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await authApis().get(endpoints.profile);
        setUserRole(response.data.role);
      } catch (err) {
        console.error('Lỗi khi lấy thông tin người dùng:', err);
        setUserRole(null); // Default to null if error occurs
      }
    };
    fetchUserRole();
  }, []);

  const fetchFines = useCallback(async () => {
    setLoading(true);
    setFilterError('');
    try {
      const params = {
        page: currentPage,
        size: pageSize, // Set to 10 to override backend default of 5
        sortBy: 'id',
      };
      const endpoint = filterPhone ? endpoints['fines-reader'] : endpoints['fines'];
      if (filterPhone) {
        params.phone = filterPhone;
      }
      const res = await authApis().get(endpoint, {
        params,
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      setFines(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
    } catch (err) {
      console.error('Lỗi khi lấy phiếu phạt từ API:', err);
      if (err.response?.status === 404) {
        setFilterError('Không tìm thấy độc giả với số điện thoại này!');
        setFines([]);
        setTotalPages(0);
      } else if (err.response?.status === 403) {
        setFilterError('Bạn không có quyền xem phiếu phạt của người khác!');
      } else {
        setFilterError(`Lỗi khi lấy danh sách phiếu phạt: ${err.response?.data?.message || err.message}`);
      }
    }
    setLoading(false);
  }, [currentPage, pageSize, filterPhone]);

  useEffect(() => {
    fetchFines();
  }, [fetchFines]);

  const handlePayFine = (fineId, fineAmount) => {
    setPayingFineId(fineId);
    setAmount(fineAmount.toString());
    setShowPaymentModal(true);
  };

  const deleteFine = async (fineId) => {
    if (!window.confirm('Bạn có chắc muốn xóa phiếu phạt này?')) {
      return;
    }
    setDeletingFineId(fineId); // Set loading state for specific fine
    try {
      const response = await authApis().delete(endpoints['fine-delete'](fineId));
      alert(response.data || 'Xóa phiếu phạt thành công');
      setCurrentPage(0); // Reset to first page after deletion
      fetchFines();
    } catch (err) {
      console.error('Lỗi khi xóa phiếu phạt:', err);
      alert(`Có lỗi xảy ra khi xóa phiếu phạt: ${err.response?.data?.message || err.message}`);
    } finally {
      setDeletingFineId(null); // Clear loading state
    }
  };

  const handlePaymentMethodSelect = async (method) => {
    if (!window.confirm(`Bạn có chắc muốn thanh toán phiếu phạt này bằng phương thức ${method === 'direct' ? 'trực tiếp' : 'online'}?`)) {
      return;
    }

    setPaymentMethod(method);
    if (method === 'direct') {
      await handleDirectPayment();
    } else {
      await handleOnlinePayment();
    }
  };

  const handleDirectPayment = async () => {
    try {
      const formData = new FormData();
      formData.append('fine', 'IN_PERSON');

      const response = await authApis().patch(
        endpoints['update-fine'](payingFineId),
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      alert(response.data || 'Thanh toán phiếu phạt thành công');
      setShowPaymentModal(false);
      setPaymentMethod(null);
      setAmount('');
      setPayingFineId(null);
      setCurrentPage(0); // Reset to first page after payment
      fetchFines();
    } catch (err) {
      console.error(`Lỗi khi thanh toán phiếu phạt ${payingFineId}:`, err);
      alert(`Có lỗi xảy ra khi thanh toán phiếu phạt: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleOnlinePayment = async () => {
    const updateEndpoint = endpoints['update-fine'](payingFineId);

    const success = await initiateOnlinePayment(
      'fine',
      '',
      updateEndpoint,
      amount,
      'pendingPayment'
    );

    if (success) {
      setShowPaymentModal(false);
      setPaymentMethod(null);
      setAmount('');
      setPayingFineId(null);
      setCurrentPage(0); // Reset to first page after payment
      fetchFines();
    } else {
      alert(paymentError || 'Không thể tạo thanh toán online. Vui lòng thử lại.');
    }
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
    <div className="p-4 sm:p-6">
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
            aria-label="Lọc theo số điện thoại độc giả"
          />
          <button
            onClick={clearFilter}
            className="px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors duration-200 font-medium"
            aria-label="Xóa bộ lọc"
          >
            Xóa bộ lọc
          </button>
        </div>
        {filterError && <div className="text-red-500 mt-2" role="alert">{filterError}</div>}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" aria-label="Đang tải"></div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-gray-600">
              Trang {currentPage + 1} / {totalPages}
            </div>
          </div>
          <div className="overflow-x-auto bg-white rounded-xl shadow-md">
            <table className="min-w-full text-sm text-left text-gray-600">
              <thead className="bg-gray-100 text-gray-800 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3 text-center">Mã phạt</th>
                  <th className="px-4 py-3">Lý do</th>
                  <th className="px-4 py-3 text-center">Ngày ghi nhận</th>
                  <th className="px-4 py-3 text-center">Trạng thái</th>
                  <th className="px-4 py-3 text-center">Số tiền</th>
                  <th className="px-4 py-3 text-center">Mã độc giả</th>
                  <th className="px-4 py-3">Tên độc giả</th>
                  <th className="px-4 py-3 text-center">SĐT độc giả</th>
                  <th className="px-4 py-3 text-center">Mã phiếu mượn</th>
                  <th className="px-4 py-3 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {fines.map((fine, idx) => (
                  <tr
                    key={fine.id}
                    className={`border-b hover:bg-gray-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <td className="px-4 py-2 text-center font-semibold text-gray-900">{fine.id}</td>
                    <td className="px-4 py-2 truncate max-w-[200px]" title={fine.reason}>
                      {fine.reason}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {fine.issuedAt ? new Date(fine.issuedAt).toLocaleDateString('vi-VN') : 'N/A'}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {fine.isPaid ? (
                        <span className="px-2 py-1 rounded-lg text-xs bg-green-100 text-green-700">
                          Đã thanh toán
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-lg text-xs bg-red-100 text-red-700">
                          Chưa thanh toán
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {fine.amount
                        ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(fine.amount)
                        : 'N/A'}
                    </td>
                    <td className="px-4 py-2 text-center">{fine.readerId}</td>
                    <td className="px-4 py-2 truncate max-w-[150px]" title={fine.readerName}>
                      {fine.readerName}
                    </td>
                    <td className="px-4 py-2 text-center">{fine.readerPhone || 'N/A'}</td>
                    <td className="px-4 py-2 text-center">{fine.borrowSlipId}</td>
                    <td className="px-4 py-2 text-center flex justify-center items-center space-x-2">
                      {!fine.isPaid && (
                        <button
                          onClick={() => handlePayFine(fine.id, fine.amount)}
                          disabled={payingFineId === fine.id}
                          className={`px-3 py-1 text-xs text-white rounded-lg font-medium transition-colors duration-200 ${
                            payingFineId === fine.id
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800'
                          }`}
                          aria-label={`Thanh toán phiếu phạt ${fine.id}`}
                        >
                          {payingFineId === fine.id ? (
                            <div className="flex items-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Đang xử lý...
                            </div>
                          ) : (
                            'Đóng phạt'
                          )}
                        </button>
                      )}
                      {userRole === 'ADMIN' && (
                        <button
                          onClick={() => deleteFine(fine.id)}
                          disabled={deletingFineId === fine.id}
                          className={`px-3 py-1 text-xs text-white rounded-lg font-medium transition-colors duration-200 ${
                            deletingFineId === fine.id
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800'
                          }`}
                          aria-label={`Xóa phiếu phạt ${fine.id}`}
                        >
                          {deletingFineId === fine.id ? (
                            <div className="flex items-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Đang xóa...
                            </div>
                          ) : (
                            'Xóa'
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {fines.length === 0 && (
                  <tr>
                    <td colSpan="10" className="p-4 text-center text-gray-500 text-sm">
                      Không có phiếu phạt nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl disabled:opacity-50 hover:bg-blue-700 transition"
              aria-label="Trang trước"
            >
              Trang trước
            </button>
            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => handlePageChange(i)}
                  className={`px-3 py-1 rounded-lg ${
                    currentPage === i ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  aria-label={`Trang ${i + 1}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl disabled:opacity-50 hover:bg-blue-700 transition"
              aria-label="Trang sau"
            >
              Trang sau
            </button>
          </div>
        </>
      )}

      {/* Payment method selection modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-6 border w-[400px] shadow-xl rounded-3xl bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Chọn phương thức thanh toán</h3>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setPaymentMethod(null);
                  setAmount('');
                  setPayingFineId(null);
                }}
                className="text-gray-400 hover:text-gray-500 transition-colors"
                aria-label="Đóng modal thanh toán"
              >
                &times;
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-gray-700">Số tiền</label>
                <input
                  type="number"
                  value={amount}
                  readOnly
                  className="p-3 border border-gray-300 rounded-2xl shadow bg-gray-100 w-full"
                  aria-label="Số tiền thanh toán"
                />
              </div>
              <button
                onClick={() => handlePaymentMethodSelect('direct')}
                className="px-5 py-3 bg-blue-600 text-white rounded-2xl shadow hover:bg-blue-700 font-semibold transition"
                disabled={paymentLoading}
                aria-label="Thanh toán trực tiếp"
              >
                {paymentLoading && paymentMethod === 'direct' ? 'Đang xử lý...' : 'Thanh toán trực tiếp'}
              </button>
              <button
                onClick={() => handlePaymentMethodSelect('online')}
                className="px-5 py-3 bg-blue-600 text-white rounded-2xl shadow hover:bg-blue-700 font-semibold transition"
                disabled={paymentLoading}
                aria-label="Thanh toán online"
              >
                {paymentLoading && paymentMethod === 'online' ? 'Đang xử lý...' : 'Thanh toán online'}
              </button>
              {paymentError && <div className="text-red-500 mt-2" role="alert">{paymentError}</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinePage;