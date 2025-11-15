import React, { useCallback, useEffect, useState } from 'react';
import { authApis, endpoints } from '../configs/Apis';
import { PlusIcon, PencilIcon } from '@heroicons/react/24/outline';
import useOnlinePayment from '../hook/UseOnlinePayment';

const ReaderPage = () => {
  const [readers, setReaders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedReader, setSelectedReader] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    gender: false,
    file: null,
    role: 'READER',
    active: true,
    password: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [preview, setPreview] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedReaderId, setSelectedReaderId] = useState(null);
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
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 5;

  const { initiateOnlinePayment, loading: paymentLoading, error: paymentError } = useOnlinePayment();

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

  const fetchReaders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authApis().get(
        `${endpoints.readers}?page=${currentPage}&size=${pageSize}&sortBy=id`,
        { headers: { 'Cache-Control': 'no-cache' } }
      );
      setReaders(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
    } catch (err) {
      console.error('Lỗi khi lấy độc giả từ API:', err);
      setSearchError('Lỗi khi lấy danh sách độc giả. Vui lòng thử lại.');
    }
    setLoading(false);
  }, [currentPage, pageSize]);

  const fetchMembershipTypes = useCallback(async () => {
    try {
      const res = await authApis().get(endpoints['type-memberships']);
      setMembershipTypes(res.data || []);
    } catch (err) {
      console.error('Lỗi khi lấy loại membership:', err);
    }
  }, []);

  useEffect(() => {
    fetchReaders();
    fetchMembershipTypes();
  }, [fetchReaders, fetchMembershipTypes]);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleRenewMember = (readerId) => {
    setSelectedReaderId(readerId);
    setShowPaymentModal(true);
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
      alert(`Gia hạn thất bại: ${err.response?.data?.message || err.message}`);
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
        setSearchError('Không tìm thấy độc giả với số điện thoại này!');
      }
    } catch (err) {
      console.error('Lỗi khi tìm kiếm độc giả:', err);
      setSearchError('Không tìm thấy độc giả với số điện thoại này!');
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

    setFormErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleAddReader = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      const dataToSend = {
        ...formData,
        username: formData.phone,
        password: formData.phone,
      };
      Object.keys(dataToSend).forEach((key) => {
        if (key !== 'file') {
          formDataToSend.append(key, dataToSend[key]);
        }
      });
      if (formData.file) {
        formDataToSend.append('file', formData.file);
      }

      const res = await authApis().post(endpoints['add-reader'], formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.status === 200) {
        setShowAddModal(false);
        resetForm();
        setCurrentPage(0);
        fetchReaders();
        alert('Đăng ký độc giả thành công!');
      }
    } catch (err) {
      setFormErrors((prev) => ({
        ...prev,
        submit: `Đăng ký thất bại: ${err.response?.data || err.message}`,
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateReader = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      const dataToSend = {
        ...formData,
        username: formData.phone,
        password: formData.password || undefined, // Only include password if provided
      };
      Object.keys(dataToSend).forEach((key) => {
        if (key !== 'file' && dataToSend[key] !== undefined) {
          formDataToSend.append(key, dataToSend[key]);
        }
      });
      if (formData.file) {
        formDataToSend.append('file', formData.file);
      }

      const res = await authApis().patch(endpoints['user-update'](selectedReader.id), formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.status === 200) {
        setShowUpdateModal(false);
        resetForm();
        fetchReaders();
        alert('Cập nhật độc giả thành công!');
      }
    } catch (err) {
      console.error('Lỗi khi cập nhật độc giả:', err);
      setFormErrors((prev) => ({
        ...prev,
        submit: `Cập nhật thất bại: ${err.response?.data?.message || err.message}`,
      }));
    } finally {
      setLoading(false);
    }
  };

  const openUpdateModal = (reader) => {
    setSelectedReader(reader);
    setFormData({
      firstName: reader.firstName || reader.name?.split(' ').slice(0, -1).join(' ') || '',
      lastName: reader.lastName || reader.name?.split(' ').pop() || '',
      phone: reader.phone || '',
      email: reader.email || '',
      gender: reader.gender !== undefined ? reader.gender : false,
      file: null,
      role: reader.role || 'READER',
      active: reader.active !== undefined ? reader.active : true,
      password: '',
    });
    setPreview(reader.avatar || null);
    setShowUpdateModal(true);
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
      password: '',
    });
    setPreview(null);
    setFormErrors({});
    setShowAddModal(false);
    setShowUpdateModal(false);
    setSelectedReader(null);
  };

  return (
    <div className="p-6">
      <div className="flex items-center mb-8 gap-4">
        <div className="flex-1 flex items-center gap-2">
          <input
            type="text"
            value={searchPhone}
            onChange={(e) => setSearchPhone(e.target.value)}
            placeholder="Nhập số điện thoại (10 số)"
            className="p-3 border border-gray-300 rounded-2xl shadow focus:ring-2 focus:ring-blue-400 transition w-full"
            aria-label="Tìm kiếm độc giả theo số điện thoại"
          />
          <button
            type="button"
            onClick={handleSearch}
            className="px-5 py-3 bg-blue-600 text-white rounded-2xl shadow hover:bg-blue-700 font-semibold transition"
            aria-label="Tìm kiếm"
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
              aria-label="Hủy tìm kiếm"
            >
              Hủy tìm kiếm
            </button>
          )}
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-5 py-3 bg-blue-600 text-white rounded-2xl shadow hover:bg-blue-700 font-semibold transition"
          aria-label="Thêm độc giả mới"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Thêm độc giả mới
        </button>
      </div>

      {searchError && (
        <div className="text-red-500 mb-4" role="alert">
          {searchError}
        </div>
      )}

      {(showAddModal || showUpdateModal) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-6 border w-[500px] shadow-xl rounded-3xl bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">{showAddModal ? 'Thêm độc giả mới' : 'Cập nhật độc giả'}</h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-500 transition-colors"
                aria-label="Đóng modal"
              >
                &times;
              </button>
            </div>
            <form onSubmit={showAddModal ? handleAddReader : handleUpdateReader} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Họ</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-2xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    aria-label="Họ"
                  />
                  {formErrors.firstName && (
                    <p className="mt-1 text-sm text-red-500" role="alert">
                      {formErrors.firstName}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tên</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-2xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    aria-label="Tên"
                  />
                  {formErrors.lastName && (
                    <p className="mt-1 text-sm text-red-500" role="alert">
                      {formErrors.lastName}
                    </p>
                  )}
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
                    className="mt-1 block w-full rounded-2xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    aria-label="Số điện thoại"
                  />
                  {formErrors.phone && (
                    <p className="mt-1 text-sm text-red-500" role="alert">
                      {formErrors.phone}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-2xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    aria-label="Email"
                  />
                  {formErrors.email && (
                    <p className="mt-1 text-sm text-red-500" role="alert">
                      {formErrors.email}
                    </p>
                  )}
                </div>
              </div>

              {showUpdateModal && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mật khẩu (để trống nếu không đổi)</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-2xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    aria-label="Mật khẩu"
                  />
                  {formErrors.password && (
                    <p className="mt-1 text-sm text-red-500" role="alert">
                      {formErrors.password}
                    </p>
                  )}
                </div>
              )}

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
                        aria-label="Nam"
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
                        aria-label="Nữ"
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
                    aria-label="Ảnh đại diện"
                  />
                  {preview && (
                    <div className="mt-2">
                      <img src={preview} alt="Preview" className="h-20 w-20 object-cover rounded-full" />
                    </div>
                  )}
                </div>
              </div>

              {formErrors.submit && (
                <div className="text-red-500 text-center" role="alert">
                  {formErrors.submit}
                </div>
              )}

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-2xl hover:bg-gray-300 transition"
                  aria-label="Hủy"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-2xl
                    hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                    disabled:opacity-50 disabled:cursor-not-allowed transition"
                  aria-label={showAddModal ? 'Thêm độc giả' : 'Cập nhật độc giả'}
                >
                  {loading ? 'Đang xử lý...' : showAddModal ? 'Thêm' : 'Cập nhật'}
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
                <img
                  src={searchResult.avatar}
                  alt={searchResult.name}
                  className="w-16 h-16 object-cover rounded-full shadow"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-gray-400 text-xs">No avatar</span>
                </div>
              )}
              <div>
                <h3 className="font-semibold text-lg text-gray-900">
                  {searchResult.name || `${searchResult.firstName} ${searchResult.lastName}`}
                </h3>
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
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition"
                onClick={() => openUpdateModal(searchResult)}
                aria-label={`Cập nhật độc giả ${searchResult.id}`}
              >
                <PencilIcon className="h-5 w-5 inline mr-1" />
                Cập nhật
              </button>
              {!searchResult.isMember && (
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold transition"
                  onClick={() => handleRenewMember(searchResult.id)}
                  aria-label={`Gia hạn thành viên cho độc giả ${searchResult.id}`}
                >
                  Gia hạn thành viên
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" aria-label="Đang tải"></div>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-6">
              {readers.map((reader) => (
                <div
                  key={reader.id}
                  className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow p-6 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    {reader.avatar ? (
                      <img
                        src={reader.avatar}
                        alt={reader.name}
                        className="w-16 h-16 object-cover rounded-full shadow"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No avatar</span>
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">
                        {reader.name || `${reader.firstName} ${reader.lastName}`}
                      </h3>
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
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition"
                      onClick={() => openUpdateModal(reader)}
                      aria-label={`Cập nhật độc giả ${reader.id}`}
                    >
                      <PencilIcon className="h-5 w-5 inline mr-1" />
                      Cập nhật
                    </button>
                    {!reader.isMember && (
                      <button
                        className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold transition"
                        onClick={() => handleRenewMember(reader.id)}
                        aria-label={`Gia hạn thành viên cho độc giả ${reader.id}`}
                      >
                        Gia hạn thành viên
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-6 space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="px-4 py-2 bg-gray-200 text-gray-600 rounded-2xl disabled:opacity-50 hover:bg-gray-300"
                aria-label="Trang trước"
              >
                Trang trước
              </button>
              <span className="px-4 py-2 text-gray-600">
                Trang {currentPage + 1} / {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
                className="px-4 py-2 bg-gray-200 text-gray-600 rounded-2xl disabled:opacity-50 hover:bg-gray-300"
                aria-label="Trang sau"
              >
                Trang sau
              </button>
            </div>
          </>
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
                aria-label="Đóng modal thanh toán"
              >
                &times;
              </button>
            </div>
            {!paymentMethod ? (
              <div className="flex flex-col gap-4">
                <button
                  onClick={() => handlePaymentMethodSelect('direct')}
                  className="px-5 py-3 bg-blue-600 text-white rounded-2xl shadow hover:bg-blue-700 font-semibold transition"
                  aria-label="Thanh toán trực tiếp"
                >
                  Thanh toán trực tiếp
                </button>
                <button
                  onClick={() => handlePaymentMethodSelect('online')}
                  className="px-5 py-3 bg-blue-600 text-white rounded-2xl shadow hover:bg-blue-700 font-semibold transition"
                  aria-label="Thanh toán online"
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
                    aria-label="Tiêu đề thanh toán"
                  />
                </div>
                <div>
                  <label className="block text-gray-700">Chọn gói thành viên</label>
                  <select
                    value={selectedMembershipId || ''}
                    onChange={(e) => setSelectedMembershipId(e.target.value)}
                    className="p-3 border border-gray-300 rounded-2xl shadow focus:ring-2 focus:ring-blue-400 transition w-full"
                    aria-label="Chọn gói thành viên"
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
                    aria-label="Ngày thanh toán"
                  />
                </div>
                <div>
                  <label className="block text-gray-700">Số tiền</label>
                  <input
                    type="number"
                    value={amount}
                    readOnly
                    className="p-3 border border-gray-300 rounded-2xl shadow bg-gray-100 w-full"
                    aria-label="Số tiền"
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
                    aria-label="Ghi chú"
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={paymentMethod === 'direct' ? handleDirectPayment : handleOnlinePayment}
                    className="px-5 py-3 bg-green-600 text-white rounded-2xl shadow hover:bg-green-700 font-semibold transition"
                    disabled={paymentLoading}
                    aria-label={paymentMethod === 'direct' ? 'Xác nhận thanh toán' : 'Tiến hành thanh toán'}
                  >
                    {paymentMethod === 'direct' ? 'Xác nhận' : paymentLoading ? 'Đang xử lý...' : 'Tiến hành thanh toán'}
                  </button>
                  <button
                    onClick={() => setPaymentMethod(null)}
                    className="px-5 py-3 bg-gray-200 text-gray-700 rounded-2xl shadow hover:bg-gray-300 font-semibold transition"
                    aria-label="Quay lại"
                  >
                    Quay lại
                  </button>
                </div>
                {paymentError && (
                  <div className="text-red-500 mt-2" role="alert">
                    {paymentError}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReaderPage;