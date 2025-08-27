import React, { useEffect, useState, useCallback } from 'react';
import { authApis, endpoints } from '../configs/Apis';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const UserPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchPhone, setSearchPhone] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: true,
    role: 'USER', // Default role
  });
  const [formError, setFormError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 20;
  const roles = ['ADMIN', 'LIBRARIAN', 'USER'];

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authApis().get(`${endpoints['users']}?page=${page}&size=${pageSize}&sortBy=id`);
      setUsers(res.data.content || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error('Lỗi khi lấy danh sách người dùng:', err);
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
      const res = await authApis().get(endpoints['find-user-by-phone'], { params: { phone: searchPhone } });
      if (res.data && res.data.id) {
        setSearchResult(res.data);
      } else {
        setSearchError('Không tìm thấy người dùng với số điện thoại này!');
      }
    } catch {
      setSearchError('Không tìm thấy người dùng với số điện thoại này!');
    }
  };

  const handleAddUser = async () => {
    if (!formData.name || !formData.email || !formData.phone || formData.phone.length !== 10 || !formData.role) {
      setFormError('Vui lòng nhập đầy đủ thông tin: Tên, Email, Số điện thoại (10 số), Vai trò');
      return;
    }
    try {
      await authApis().post(endpoints['users'], {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        gender: formData.gender,
        role: formData.role,
      });
      setShowAddModal(false);
      setFormData({ name: '', email: '', phone: '', gender: true, role: 'USER' });
      setFormError('');
      setPage(0); // Reset to first page
      fetchUsers();
      alert('Thêm người dùng thành công!');
    } catch (err) {
      console.error('Lỗi khi thêm người dùng:', err);
      setFormError('Thêm người dùng thất bại. Vui lòng thử lại.');
    }
  };

  const handleUpdateUser = async () => {
    if (!formData.name || !formData.email || !formData.phone || formData.phone.length !== 10 || !formData.role) {
      setFormError('Vui lòng nhập đầy đủ thông tin: Tên, Email, Số điện thoại (10 số), Vai trò');
      return;
    }
    try {
      await authApis().put(`${endpoints['users']}/${selectedUser.id}`, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        gender: formData.gender,
        role: formData.role,
      });
      setShowUpdateModal(false);
      setFormData({ name: '', email: '', phone: '', gender: true, role: 'USER' });
      setSelectedUser(null);
      setFormError('');
      fetchUsers();
      alert('Cập nhật người dùng thành công!');
    } catch (err) {
      console.error('Lỗi khi cập nhật người dùng:', err);
      setFormError('Cập nhật người dùng thất bại. Vui lòng thử lại.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Bạn có chắc muốn xóa người dùng này?')) return;
    try {
      await authApis().delete(`${endpoints['users']}/${userId}`);
      fetchUsers();
      alert('Xóa người dùng thành công!');
    } catch (err) {
      console.error('Lỗi khi xóa người dùng:', err);
      alert('Xóa người dùng thất bại. Vui lòng thử lại.');
    }
  };

  const openUpdateModal = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name || user.fullName || '',
      email: user.email || '',
      phone: user.phone || '',
      gender: user.gender !== undefined ? user.gender : true,
      role: user.role || 'USER',
    });
    setShowUpdateModal(true);
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', gender: true, role: 'USER' });
    setFormError('');
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
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-5 py-3 bg-blue-600 text-white rounded-2xl shadow hover:bg-blue-700 font-semibold transition ml-auto"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Thêm người dùng mới
        </button>
      </div>

      {/* Search error */}
      {searchError && <div className="text-red-500 mb-4">{searchError}</div>}

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
                <h3 className="font-semibold text-lg text-gray-900">{searchResult.name || searchResult.fullName}</h3>
                <p className="text-gray-700">Email: {searchResult.email}</p>
                <p className="text-gray-700">SĐT: {searchResult.phone}</p>
                <p className="text-sm text-gray-500">
                  Giới tính: {searchResult.gender ? 'Nam' : 'Nữ'}
                </p>
                <p className="text-sm text-gray-500">
                  Vai trò: {searchResult.role || 'Không xác định'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition"
                onClick={() => openUpdateModal(searchResult)}
              >
                <PencilIcon className="h-5 w-5 inline mr-1" />
                Cập nhật
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 font-semibold transition"
                onClick={() => handleDeleteUser(searchResult.id)}
              >
                <TrashIcon className="h-5 w-5 inline mr-1" />
                Xóa
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
                    <h3 className="font-semibold text-lg text-gray-900">{user.name || user.fullName}</h3>
                    <p className="text-gray-700">Email: {user.email}</p>
                    <p className="text-gray-700">SĐT: {user.phone}</p>
                    <p className="text-sm text-gray-500">
                      Giới tính: {user.gender ? 'Nam' : 'Nữ'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Vai trò: {user.role || 'Không xác định'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition"
                    onClick={() => openUpdateModal(user)}
                  >
                    <PencilIcon className="h-5 w-5 inline mr-1" />
                    Cập nhật
                  </button>
                  <button
                    className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 font-semibold transition"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    <TrashIcon className="h-5 w-5 inline mr-1" />
                    Xóa
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
              >
                Trang sau
              </button>
            </div>
          </div>
        )
      )}

      {/* Modal for adding new user */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-6 border w-[500px] shadow-xl rounded-3xl bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Thêm người dùng mới</h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                &times;
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-gray-700">Họ và tên</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nhập họ và tên"
                  className="p-3 border border-gray-300 rounded-2xl shadow focus:ring-2 focus:ring-blue-400 transition w-full"
                />
              </div>
              <div>
                <label className="block text-gray-700">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Nhập email"
                  className="p-3 border border-gray-300 rounded-2xl shadow focus:ring-2 focus:ring-blue-400 transition w-full"
                />
              </div>
              <div>
                <label className="block text-gray-700">Số điện thoại</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Nhập số điện thoại"
                  className="p-3 border border-gray-300 rounded-2xl shadow focus:ring-2 focus:ring-blue-400 transition w-full"
                />
              </div>
              <div>
                <label className="block text-gray-700">Giới tính</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value === 'true' })}
                  className="p-3 border border-gray-300 rounded-2xl shadow focus:ring-2 focus:ring-blue-400 transition w-full"
                >
                  <option value={true}>Nam</option>
                  <option value={false}>Nữ</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700">Vai trò</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="p-3 border border-gray-300 rounded-2xl shadow focus:ring-2 focus:ring-blue-400 transition w-full"
                >
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
              {formError && <div className="text-red-500">{formError}</div>}
              <div className="flex gap-4">
                <button
                  onClick={handleAddUser}
                  className="px-5 py-3 bg-green-600 text-white rounded-2xl shadow hover:bg-green-700 font-semibold transition"
                >
                  Thêm
                </button>
                <button
                  onClick={resetForm}
                  className="px-5 py-3 bg-gray-200 text-gray-700 rounded-2xl shadow hover:bg-gray-300 font-semibold transition"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for updating user */}
      {showUpdateModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-6 border w-[500px] shadow-xl rounded-3xl bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Cập nhật người dùng</h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                &times;
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-gray-700">Họ và tên</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nhập họ và tên"
                  className="p-3 border border-gray-300 rounded-2xl shadow focus:ring-2 focus:ring-blue-400 transition w-full"
                />
              </div>
              <div>
                <label className="block text-gray-700">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Nhập email"
                  className="p-3 border border-gray-300 rounded-2xl shadow focus:ring-2 focus:ring-blue-400 transition w-full"
                />
              </div>
              <div>
                <label className="block text-gray-700">Số điện thoại</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Nhập số điện thoại"
                  className="p-3 border border-gray-300 rounded-2xl shadow focus:ring-2 focus:ring-blue-400 transition w-full"
                />
              </div>
              <div>
                <label className="block text-gray-700">Giới tính</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value === 'true' })}
                  className="p-3 border border-gray-300 rounded-2xl shadow focus:ring-2 focus:ring-blue-400 transition w-full"
                >
                  <option value={true}>Nam</option>
                  <option value={false}>Nữ</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700">Vai trò</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="p-3 border border-gray-300 rounded-2xl shadow focus:ring-2 focus:ring-blue-400 transition w-full"
                >
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
              {formError && <div className="text-red-500">{formError}</div>}
              <div className="flex gap-4">
                <button
                  onClick={handleUpdateUser}
                  className="px-5 py-3 bg-green-600 text-white rounded-2xl shadow hover:bg-green-700 font-semibold transition"
                >
                  Cập nhật
                </button>
                <button
                  onClick={resetForm}
                  className="px-5 py-3 bg-gray-200 text-gray-700 rounded-2xl shadow hover:bg-gray-300 font-semibold transition"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPage;