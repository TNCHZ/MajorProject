import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApis, endpoints } from '../configs/Apis';
import useOnlinePayment from '../hook/UseOnlinePayment';

const FinePage = () => {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [payingFineId, setPayingFineId] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [amount, setAmount] = useState('');
  const navigate = useNavigate();

  const { initiateOnlinePayment, loading: paymentLoading, error: paymentError } = useOnlinePayment();

  useEffect(() => {
    fetchFines();
  }, []);

  const fetchFines = async () => {
    setLoading(true);
    try {
      const res = await authApis().get(`${endpoints['fines']}?page=0&size=20&sortBy=id`);
      setFines(res.data.content || []);
    } catch (err) {
      console.error('Lỗi khi lấy phiếu phạt từ API:', err);
      alert('Không thể lấy danh sách phiếu phạt');
    }
    setLoading(false);
  };

  const handlePayFine = (fineId, fineAmount) => {
    setPayingFineId(fineId);
    setAmount(fineAmount.toString());
    setShowPaymentModal(true);
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
        endpoints["update-fine"](payingFineId),
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      alert(response.data || 'Thanh toán phiếu phạt thành công');
      setShowPaymentModal(false);
      setPaymentMethod(null);
      setAmount('');
      setPayingFineId(null);
      fetchFines();
    } catch (err) {
      console.error(`Lỗi khi thanh toán phiếu phạt ${payingFineId}:`, err);
      alert(`Có lỗi xảy ra khi thanh toán phiếu phạt: ${err.response?.data || err.message}`);
    }
  };

  const handleOnlinePayment = async () => {
    const updateEndpoint = endpoints["update-fine"](payingFineId);

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
      fetchFines();
    } else {
      alert(paymentError || 'Không thể tạo thanh toán online. Vui lòng thử lại.');
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Quản lý Phiếu phạt</h2>
        <button
          onClick={() => navigate('/main/fines/add-fine')}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow transition-colors duration-200 font-medium"
        >
          Thêm phiếu phạt
        </button>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow-md">
          <table className="min-w-full text-sm text-left text-gray-600">
            <thead className="bg-gray-100 text-gray-800 text-xs uppercase font-semibold">
              <tr>
                <th className="px-4 py-3 text-center">Mã phạt</th>
                <th className="px-4 py-3">Lý do</th>
                <th className="px-4 py-3 text-center">Ngày phát hành</th>
                <th className="px-4 py-3 text-center">Trạng thái</th>
                <th className="px-4 py-3 text-center">Số tiền</th>
                <th className="px-4 py-3 text-center">Mã độc giả</th>
                <th className="px-4 py-3">Tên độc giả</th>
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
                  <td className="px-4 py-2 text-center">{fine.borrowSlipId}</td>
                  <td className="px-4 py-2 text-center">
                    {!fine.isPaid && (
                      <button
                        onClick={() => handlePayFine(fine.id, fine.amount)}
                        disabled={payingFineId === fine.id}
                        className={`px-3 py-1 text-xs text-white rounded-lg font-medium transition-colors duration-200 ${payingFineId === fine.id
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800'
                          }`}
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
                  </td>
                </tr>
              ))}
              {fines.length === 0 && (
                <tr>
                  <td colSpan="9" className="p-4 text-center text-gray-500 text-sm">
                    Không có phiếu phạt nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
                />
              </div>
              <button
                onClick={() => handlePaymentMethodSelect('direct')}
                className="px-5 py-3 bg-blue-600 text-white rounded-2xl shadow hover:bg-blue-700 font-semibold transition"
                disabled={paymentLoading}
              >
                {paymentLoading && paymentMethod === 'direct' ? 'Đang xử lý...' : 'Thanh toán trực tiếp'}
              </button>
              <button
                onClick={() => handlePaymentMethodSelect('online')}
                className="px-5 py-3 bg-blue-600 text-white rounded-2xl shadow hover:bg-blue-700 font-semibold transition"
                disabled={paymentLoading}
              >
                {paymentLoading && paymentMethod === 'online' ? 'Đang xử lý...' : 'Thanh toán online'}
              </button>
              {paymentError && <div className="text-red-500 mt-2">{paymentError}</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinePage;