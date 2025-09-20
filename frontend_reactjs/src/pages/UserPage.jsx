import React, { useCallback, useEffect, useState } from 'react';
import { authApis, endpoints } from '../configs/Apis';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const UserPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deletingUserId, setDeletingUserId] = useState(null); // Track delete loading
  const [searchPhone, setSearchPhone] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState('');
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
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 5;
  const roles = ['READER', 'LIBRARIAN', 'ADMIN'];

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authApis().get(
        `${endpoints['users']}?page=${page}&size=${pageSize}&sortBy=id`,
        { headers: { 'Cache-Control': 'no-cache' } }
      );
      setUsers(res.data.content || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error('Lỗi khi lấy danh sách người dùng:', err);
      setSearchError('Lỗi khi lấy danh sách người dùng. Vui lòng thử lại.');
    }
    setLoading(false);
  }, [page, pageSize]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = async () => {
    setSearchError('');
    setSearchResult(null);
    if (!searchPhone || searchPhone.length !== 10) {
      setSearchError('Vui lòng nhập đúng số điện thoại (10 số)');
      return;
    }
    try {
      const res = await authApis().get(endpoints['find-reader-by-phone'], {
        params: { phone: searchPhone },
      });
      if (res.data && res.data.id) {
        setSearchResult(res.data);
      } else {
        setSearchError('Không tìm thấy người dùng với số điện thoại này!');
      }
    } catch (err) {
      console.error('Lỗi khi tìm kiếm người dùng:', err);
      setSearchError('Không tìm thấy người dùng với số điện thoại này!');
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
    if (showUpdateModal && formData.password && formData.password.length < 6) {
      tempErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    setFormErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleAddUser = async (e) => {
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
        if ((key !== 'file' && key !== 'password') || (key === 'password' && dataToSend[key])) {
          formDataToSend.append(key, dataToSend[key]);
        }
      });
      if (formData.file) {
        formDataToSend.append('file', formData.file);
      }

      const res = await authApis().post(endpoints['add-user'], formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.status === 200) {
        setShowAddModal(false);
        resetForm();
        setPage(0);
        fetchUsers();
        alert('Thêm người dùng thành công!');
      }
    } catch (err) {
      console.error('Lỗi khi thêm người dùng:', err);
      setFormErrors((prev) => ({
        ...prev,
        submit: `Thêm người dùng thất bại: ${err.response?.data?.message || err.message}`,
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      const dataToSend = {
        ...formData,
        username: formData.phone,
      };
      Object.keys(dataToSend).forEach((key) => {
        if (key !== 'file' && key !== 'password') {
          formDataToSend.append(key, dataToSend[key]);
        }
      });
      if (formData.file) {
        formDataToSend.append('file', formData.file);
      }
      if (formData.password) {
        formDataToSend.append('password', formData.password);
      }

      const res = await authApis().patch(endpoints['user-update'](selectedUser.id), formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.status === 200) {
        setShowUpdateModal(false);
        resetForm();
        fetchUsers();
        alert('Cập nhật người dùng thành công!');
      }
    } catch (err) {
      console.error('Lỗi khi cập nhật người dùng:', err);
      setFormErrors((prev) => ({
        ...prev,
        submit: `Cập nhật người dùng thất bại: ${err.response?.data?.message || err.message}`,
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Bạn có chắc muốn xóa người dùng này?')) return;
    setDeletingUserId(userId);
    try {
      await authApis().delete(endpoints['user-delete'](userId));
      setPage(0);
      setSearchResult(null);
      fetchUsers();
      alert('Xóa người dùng thành công!');
    } catch (err) {
      console.error('Lỗi khi xóa người dùng:', err);
      alert(`Xóa người dùng thất bại: ${err.response?.data?.message || err.message}`);
    } finally {
      setDeletingUserId(null);
    }
  };

  const openUpdateModal = (user) => {
    setSelectedUser(user);
    setFormData({
      firstName: user.firstName || user.name?.split(' ').slice(0, -1).join(' ') || '',
      lastName: user.lastName || user.name?.split(' ').pop() || '',
      phone: user.phone || '',
      email: user.email || '',
      gender: user.gender !== undefined ? user.gender : false,
      file: null,
      role: user.role || 'READER',
      active: user.active !== undefined ? user.active : true,
      password: '',
    });
    setPreview(user.avatar || null);
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
    setFormErrors({});
    setPreview(null);
    setShowAddModal(false);
    setShowUpdateModal(false);
    setSelectedUser(null);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="p-6">
      {/* Search bar and add user button */}
      <div className="flex items-center mb-8 gap-4">
        <div className="flex-1 flex items-center gap-2">
          <input
            type="text"
            value={searchPhone}
            onChange={(e) => setSearchPhone(e.target.value)}
            placeholder="Nhập số điện thoại (10 số)"
            className="p-3 border border-gray-300 rounded-2xl shadow focus:ring-2 focus:ring-blue-400 transition w-full"
            aria-label="Tìm kiếm người dùng theo số điện thoại"
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
          aria-label="Thêm người dùng mới"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Thêm người dùng mới
        </button>
      </div>

      {/* Search error */}
      {searchError && (
        <div className="text-red-500 mb-4" role="alert">
          {searchError}
        </div>
      )}

      {/* Search result or user list */}
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
                <p className="text-sm text-gray-500">Vai trò: {searchResult.role || 'Không xác định'}</p>
                <p className="text-sm text-gray-500">
                  Trạng thái: {searchResult.active ? 'Hoạt động' : 'Không hoạt động'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition"
                onClick={() => openUpdateModal(searchResult)}
                aria-label={`Cập nhật người dùng ${searchResult.id}`}
              >
                <PencilIcon className="h-5 w-5 inline mr-1" />
                Cập nhật
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 font-semibold transition"
                onClick={() => handleDeleteUser(searchResult.id)}
                disabled={deletingUserId === searchResult.id}
                aria-label={`Xóa người dùng ${searchResult.id}`}
              >
                {deletingUserId === searchResult.id ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Đang xóa...
                  </div>
                ) : (
                  <>
                    <TrashIcon className="h-5 w-5 inline mr-1" />
                    Xóa
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" aria-label="Đang tải"></div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {users.map((user) => (
              <div
                key={user.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow p-6 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-16 h-16 object-cover rounded-full shadow"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-400 text-xs">No avatar</span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">
                      {user.name || `${user.firstName} ${user.lastName}`}
                    </h3>
                    <p className="text-gray-700">Email: {user.email}</p>
                    <p className="text-gray-700">SĐT: {user.phone}</p>
                    <p className="text-sm text-gray-500">Giới tính: {user.gender ? 'Nam' : 'Nữ'}</p>
                    <p className="text-sm text-gray-500">Vai trò: {user.role || 'Không xác định'}</p>
                    <p className="text-sm text-gray-500">
                      Trạng thái: {user.active ? 'Hoạt động' : 'Không hoạt động'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition"
                    onClick={() => openUpdateModal(user)}
                    aria-label={`Cập nhật người dùng ${user.id}`}
                  >
                    <PencilIcon className="h-5 w-5 inline mr-1" />
                    Cập nhật
                  </button>
                  <button
                    className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 font-semibold transition"
                    onClick={() => handleDeleteUser(user.id)}
                    disabled={deletingUserId === user.id}
                    aria-label={`Xóa người dùng ${user.id}`}
                  >
                    {deletingUserId === user.id ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Đang xóa...
                      </div>
                    ) : (
                      <>
                        <TrashIcon className="h-5 w-5 inline mr-1" />
                        Xóa
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
            {/* Pagination controls */}
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 0}
                className={`px-4 py-2 rounded-2xl shadow font-semibold transition ${
                  page === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
                aria-label="Trang trước"
              >
                Trang trước
              </button>
              <span className="text-gray-700 font-medium">
                Trang {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages - 1}
                className={`px-4 py-2 rounded-2xl shadow font-semibold transition ${
                  page >= totalPages - 1 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
                aria-label="Trang sau"
              >
                Trang sau
              </button>
            </div>
          </div>
        )
      )}

      {/* Modal for adding or updating user */}
      {(showAddModal || showUpdateModal) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-6 border w-[500px] shadow-xl rounded-3xl bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {showAddModal ? 'Thêm người dùng mới' : 'Cập nhật người dùng'}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-500 transition-colors"
                aria-label="Đóng modal"
              >
                &times;
              </button>
            </div>
            <form onSubmit={showAddModal ? handleAddUser : handleUpdateUser} className="space-y-6">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700">Giới tính</label>
                  <div className="flex gap-4 mt-1">
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
                  <label className="block text-sm font-medium text-gray-700">Vai trò</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-2xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    aria-label="Vai trò"
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
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

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={handleChange}
                  className="form-checkbox h-5 w-5 text-blue-600"
                  aria-label="Trạng thái hoạt động"
                />
                <label className="ml-2 text-sm font-medium text-gray-700">Hoạt động</label>
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
                  aria-label={showAddModal ? 'Thêm người dùng' : 'Cập nhật người dùng'}
                >
                  {loading ? 'Đang xử lý...' : showAddModal ? 'Thêm' : 'Cập nhật'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPage;