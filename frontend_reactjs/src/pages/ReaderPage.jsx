import React, { useEffect, useState } from 'react';
import { authApis, endpoints } from '../configs/Apis';
import { PlusIcon } from '@heroicons/react/24/outline';
import useOnlinePayment from '../hook/UseOnlinePayment';
import ChatBox from './ChatBox';

const ReaderPage = () => {
  const [readers, setReaders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    gender: false,
    file: null,
    role: 'READER',
    active: true,
    username: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [preview, setPreview] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedReaderId, setSelectedReaderId] = useState(null);
  const [selectedChatReader, setSelectedChatReader] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [title, setTitle] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [membershipTypes, setMembershipTypes] = useState([]);
  const [selectedMembershipId, setSelectedMembershipId] = useState(null);

  const { initiateOnlinePayment, loading: paymentLoading, error: paymentError } = useOnlinePayment();

  useEffect(() => {
    fetchReaders();
    fetchMembershipTypes();
  }, []);

  useEffect(() => {
    if (selectedMembershipId) {
      const selectedMembership = membershipTypes.find((type) => type.id === parseInt(selectedMembershipId));
      if (selectedMembership) {
        setAmount(selectedMembership.price.toString());
      } else {
        setAmount('');
      }
    } else {
      setAmount('');
    }
  }, [selectedMembershipId, membershipTypes]);

  const fetchMembershipTypes = async () => {
    try {
      const res = await authApis().get(endpoints['type-memberships']);
      setMembershipTypes(res.data || []);
    } catch (err) {
      console.error('Lỗi khi lấy loại membership:', err);
    }
  };

  const fetchReaders = async () => {
    setLoading(true);
    try {
      const res = await authApis().get(`${endpoints.readers}?page=0&size=20&sortBy=id`, {
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      setReaders(res.data.content || []);
    } catch (err) {
      console.error('Lỗi khi lấy độc giả từ API:', err);
    }
    setLoading(false);
  };

  const handleRenewMember = (readerId) => {
    setSelectedReaderId(readerId);
    setShowPaymentModal(true);
  };

  const handleChat = (reader) => {
    setSelectedChatReader(reader);
    setShowChatModal(true);
  };

  const handlePaymentMethodSelect = (method) => {
    setPaymentMethod(method);
  };

  const handleDirectPayment = async () => {
    if (!title || !paymentDate || !amount || !note || !selectedMembershipId) {
      alert('Vui lòng nhập đầy đủ thông tin: Tiêu đề, Ngày thanh toán, Gói thành viên, Ghi chú');
      return;
    }

    try {
      const formData = new FormData();
      formData.append(
        'membership',
        new Blob(
          [
            JSON.stringify({
              title,
              readerId: selectedReaderId,
              paymentDate,
              amount,
              method: 'IN_PERSON',
              note,
              typeId: selectedMembershipId,
            }),
          ],
          { type: 'application/json' }
        )
      );

      await authApis().post(endpoints['membership-add'], formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setShowPaymentModal(false);
      setTitle('');
      setPaymentDate('');
      setAmount('');
      setNote('');
      setPaymentMethod(null);
      setSelectedMembershipId(null);
      fetchReaders();
      alert('Gia hạn thành viên thành công!');
    } catch (err) {
      console.error('Lỗi khi gia hạn thành viên trực tiếp:', err);
      alert('Gia hạn thất bại. Vui lòng thử lại.');
    }
  };

  const handleOnlinePayment = async () => {
    if (!title || !paymentDate || !amount || !note || !selectedMembershipId) {
      alert('Vui lòng nhập đầy đủ thông tin: Tiêu đề, Ngày thanh toán, Gói thành viên, Ghi chú');
      return;
    }

    const paymentData = {
      title,
      readerId: selectedReaderId,
      paymentDate,
      note,
      typeId: selectedMembershipId,
    };

    const success = await initiateOnlinePayment('membership', paymentData, endpoints['membership-add'], amount, 'pendingPayment');

    if (!success) {
      alert(paymentError || 'Không thể tạo thanh toán online. Vui lòng thử lại.');
    }
  };

  const handleSearch = async () => {
    setSearchError('');
    setSearchResult(null);
    if (!searchPhone || searchPhone.length !== 10) {
      setSearchError('Vui lòng nhập đúng số điện thoại (10 số)');
      return;
    }
    try {
      const res = await authApis().get(endpoints['find-reader-by-phone'], { params: { phone: searchPhone } });
      if (res.data && res.data.id) {
        setSearchResult(res.data);
      } else {
        setSearchError('Không tìm thấy thành viên với số điện thoại này!');
      }
    } catch {
      setSearchError('Không tìm thấy thành viên với số điện thoại này!');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      setFormData((prev) => ({
        ...prev,
        file: files[0],
      }));
      setPreview(files[0] ? URL.createObjectURL(files[0]) : null);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key !== 'file') {
          formDataToSend.append(key, formData[key]);
        }
      });
      if (formData.file) {
        formDataToSend.append('file', formData.file);
      }

      const res = await authApis().post(endpoints['add-reader'], formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log(res.status);
      if (res.status === 200) {
        setShowModal(false);
        resetForm();
        fetchReaders(); // Fetch updated reader list
        alert('Đăng ký độc giả thành công!');
      }
    } catch (err) {
      setFormErrors((prev) => ({
        ...prev,
        submit: 'Đăng ký thất bại. Vui lòng thử lại.',
      }));
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    let tempErrors = {};
    if (!formData.firstName.trim()) tempErrors.firstName = 'Họ không được để trống';
    if (!formData.lastName.trim()) tempErrors.lastName = 'Tên không được để trống';
    if (!formData.phone.trim()) tempErrors.phone = 'Số điện thoại không được để trống';
    if (!/^\d{10}$/.test(formData.phone)) tempErrors.phone = 'Số điện thoại không hợp lệ';
    if (!formData.email.trim()) tempErrors.email = 'Email không được để trống';
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      tempErrors.email = 'Email không hợp lệ';
    }
    if (!formData.username.trim()) tempErrors.username = 'Tên đăng nhập không được để trống';
    if (!formData.password) tempErrors.password = 'Mật khẩu không được để trống';
    if (formData.password.length < 6) tempErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';

    setFormErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      gender: false,
      file: null,
      role: 'READER',
      active: true,
      username: '',
      password: '',
    });
    setPreview(null);
    setFormErrors({});
  };

  return (
    <div className="p-6">
      <div className="flex items-center mb-8 gap-4">
        <div className="flex-1 flex items-center gap-2">
          <input
            type="text"
            value={searchPhone}
            onChange={(e) => setSearchPhone(e.target.value)}
            placeholder="Nhập số điện thoại"
            className="p-3 border border-gray-300 rounded-2xl shadow focus:ring-2 focus:ring-blue-400 transition"
            style={{ minWidth: 950 }}
          />
          <button
            type="button"
            onClick={handleSearch}
            className="px-5 py-3 bg-blue-600 text-white rounded-2xl shadow hover:bg-blue-700 font-semibold transition"
          >
            Tìm kiếm
          </button>
          {searchResult && (
            <button
              type="button"
              onClick={() => {
                setSearchResult(null);
                setSearchPhone('');
                setSearchError('');
              }}
              className="px-5 py-3 bg-gray-200 text-gray-700 rounded-2xl shadow hover:bg-gray-300 font-semibold transition"
            >
              Hủy tìm kiếm
            </button>
          )}
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center px-5 py-3 bg-blue-600 text-white rounded-2xl shadow hover:bg-blue-700 font-semibold transition ml-auto"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Thêm độc giả mới
        </button>
      </div>

      {searchError && <div className="text-red-500 mb-4">{searchError}</div>}

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-6 border w-[500px] shadow-xl rounded-3xl bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Thêm độc giả mới</h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Họ</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {formErrors.firstName && <p className="mt-1 text-sm text-red-500">{formErrors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tên</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {formErrors.lastName && <p className="mt-1 text-sm text-red-500">{formErrors.lastName}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {formErrors.phone && <p className="mt-1 text-sm text-red-500">{formErrors.phone}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {formErrors.email && <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tên đăng nhập</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {formErrors.username && <p className="mt-1 text-sm text-red-500">{formErrors.username}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {formErrors.password && <p className="mt-1 text-sm text-red-500">{formErrors.password}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center">
                  <label className="block text-sm font-medium text-gray-700 mr-4">Giới tính</label>
                  <div className="flex gap-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value="true"
                        checked={formData.gender === true}
                        onChange={() => setFormData((prev) => ({ ...prev, gender: true }))}
                        className="form-radio text-blue-600"
                      />
                      <span className="ml-2">Nam</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value="false"
                        checked={formData.gender === false}
                        onChange={() => setFormData((prev) => ({ ...prev, gender: false }))}
                        className="form-radio text-blue-600"
                      />
                      <span className="ml-2">Nữ</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ảnh đại diện</label>
                  <input
                    type="file"
                    name="file"
                    onChange={handleChange}
                    accept="image/*"
                    className="mt-1 block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                  />
                  {preview && (
                    <div className="mt-2">
                      <img src={preview} alt="Preview" className="h-20 w-20 object-cover rounded-full" />
                    </div>
                  )}
                </div>
              </div>

              {formErrors.submit && <div className="text-red-500 text-center">{formErrors.submit}</div>}

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-300 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl
                    hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                    disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {loading ? 'Đang xử lý...' : 'Đăng ký'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {searchResult ? (
        <div className="flex flex-col gap-6">
          <div
            key={searchResult.id}
            className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow p-6 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              {searchResult.avatar ? (
                <img src={searchResult.avatar} alt={searchResult.name} className="w-16 h-16 object-cover rounded-full shadow" />
              ) : (
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-gray-400 text-xs">No avatar</span>
                </div>
              )}
              <div>
                <h3 className="font-semibold text-lg text-gray-900">{searchResult.name || searchResult.fullName}</h3>
                <p className="text-gray-700">Email: {searchResult.email}</p>
                <p className="text-gray-700">SĐT: {searchResult.phone}</p>
                <p className="text-sm text-gray-500">Giới tính: {searchResult.gender ? 'Nam' : 'Nữ'}</p>
                <div className="mt-1">
                  Thành viên:{' '}
                  <span className={searchResult.isMember ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                    {searchResult.isMember ? 'Đã là thành viên' : 'Chưa là thành viên'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {!searchResult.isMember && (
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold transition"
                  onClick={() => handleRenewMember(searchResult.id)}
                >
                  Gia hạn thành viên
                </button>
              )}
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition"
                onClick={() => handleChat(searchResult)}
              >
                Chat
              </button>
            </div>
          </div>
        </div>
      ) : (
        loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {readers.map((reader) => (
              <div
                key={reader.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow p-6 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  {reader.avatar ? (
                    <img src={reader.avatar} alt={reader.name} className="w-16 h-16 object-cover rounded-full shadow" />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-400 text-xs">No avatar</span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{reader.name || reader.fullName}</h3>
                    <p className="text-gray-700">Email: {reader.email}</p>
                    <p className="text-gray-700">SĐT: {reader.phone}</p>
                    <p className="text-sm text-gray-500">Giới tính: {reader.gender ? 'Nam' : 'Nữ'}</p>
                    <div className="mt-1">
                      Thành viên:{' '}
                      <span className={reader.isMember ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                        {reader.isMember ? 'Đã là thành viên' : 'Chưa là thành viên'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!reader.isMember && (
                    <button
                      className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold transition"
                      onClick={() => handleRenewMember(reader.id)}
                    >
                      Gia hạn thành viên
                    </button>
                  )}
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition"
                    onClick={() => handleChat(reader)}
                  >
                    Chat
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {showPaymentModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-6 border w-[500px] shadow-xl rounded-3xl bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Chọn phương thức thanh toán</h3>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setPaymentMethod(null);
                  setTitle('');
                  setPaymentDate('');
                  setAmount('');
                  setNote('');
                  setSelectedMembershipId(null);
                }}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                &times;
              </button>
            </div>
            {!paymentMethod ? (
              <div className="flex flex-col gap-4">
                <button
                  onClick={() => handlePaymentMethodSelect('direct')}
                  className="px-5 py-3 bg-blue-600 text-white rounded-2xl shadow hover:bg-blue-700 font-semibold transition"
                >
                  Thanh toán trực tiếp
                </button>
                <button
                  onClick={() => handlePaymentMethodSelect('online')}
                  className="px-5 py-3 bg-blue-600 text-white rounded-2xl shadow hover:bg-blue-700 font-semibold transition"
                >
                  Thanh toán online
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <h4 className="text-lg font-semibold">{paymentMethod === 'direct' ? 'Thanh toán trực tiếp' : 'Thanh toán online'}</h4>
                <div>
                  <label className="block text-gray-700">Tiêu đề</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Nhập tiêu đề"
                    className="p-3 border border-gray-300 rounded-2xl shadow focus:ring-2 focus:ring-blue-400 transition w-full"
                  />
                </div>
                <div>
                  <label className="block text-gray-700">Chọn gói thành viên</label>
                  <select
                    value={selectedMembershipId || ''}
                    onChange={(e) => setSelectedMembershipId(e.target.value)}
                    className="p-3 border border-gray-300 rounded-2xl shadow focus:ring-2 focus:ring-blue-400 transition w-full"
                  >
                    <option value="" disabled>
                      -- Chọn gói --
                    </option>
                    {membershipTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.title} - {type.price.toLocaleString()} VNĐ ({type.duration} tháng)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700">Ngày thanh toán</label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="p-3 border border-gray-300 rounded-2xl shadow focus:ring-2 focus:ring-blue-400 transition w-full"
                  />
                </div>
                <div>
                  <label className="block text-gray-700">Số tiền</label>
                  <input
                    type="number"
                    value={amount}
                    readOnly
                    className="p-3 border border-gray-300 rounded-2xl shadow bg-gray-100 w-full"
                  />
                </div>
                <div>
                  <label className="block text-gray-700">Ghi chú</label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Nhập ghi chú"
                    className="p-3 border border-gray-300 rounded-2xl shadow focus:ring-2 focus:ring-blue-400 transition w-full"
                    rows={4}
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={paymentMethod === 'direct' ? handleDirectPayment : handleOnlinePayment}
                    className="px-5 py-3 bg-green-600 text-white rounded-2xl shadow hover:bg-green-700 font-semibold transition"
                    disabled={paymentLoading}
                  >
                    {paymentMethod === 'direct' ? 'Xác nhận' : paymentLoading ? 'Đang xử lý...' : 'Tiến hành thanh toán'}
                  </button>
                  <button
                    onClick={() => setPaymentMethod(null)}
                    className="px-5 py-3 bg-gray-200 text-gray-700 rounded-2xl shadow hover:bg-gray-300 font-semibold transition"
                  >
                    Quay lại
                  </button>
                </div>
                {paymentError && <div className="text-red-500 mt-2">{paymentError}</div>}
              </div>
            )}
          </div>
        </div>
      )}

      {showChatModal && selectedChatReader && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-6 border w-[500px] shadow-xl rounded-3xl bg-white">
            <ChatBox reader={selectedChatReader} onClose={() => setShowChatModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReaderPage;