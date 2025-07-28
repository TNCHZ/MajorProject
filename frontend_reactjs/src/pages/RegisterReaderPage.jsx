import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import APIs, { endpoints } from '../configs/Apis';

const RegisterReaderPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState(null);
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

    const [errors, setErrors] = useState({});
    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        if (type === 'file') {
            setFormData(prev => ({
                ...prev,
                file: files[0]
            }));
            // Set preview directly from file
            setPreview(files[0] ? URL.createObjectURL(files[0]) : null);
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            const formDataToSend = new FormData();
            // Append all form data except file
            Object.keys(formData).forEach(key => {
                if (key !== 'file') {
                    formDataToSend.append(key, formData[key]);
                }
            });
            // Append file directly
            if (formData.file) {
                formDataToSend.append('file', formData.file);
            }

            const res = await APIs.post(endpoints['add-user'], formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (res.status === 201) {
                navigate('/login');
            }
        } catch (err) {
            console.error('Registration error:', err);
            setErrors(prev => ({
                ...prev,
                submit: 'Đăng ký thất bại. Vui lòng thử lại.'
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

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-blue-200 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl">
                <div className="p-8">
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
                        Đăng ký tài khoản
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information */}
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
                                {errors.firstName && <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>}
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
                                {errors.lastName && <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>}
                            </div>
                        </div>

                        {/* Contact Information */}
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
                                {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
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
                                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                            </div>
                        </div>

                        {/* Account Information */}
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
                                {errors.username && <p className="mt-1 text-sm text-red-500">{errors.username}</p>}
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
                                {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
                            </div>
                        </div>

                        {/* Additional Information */}
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
                                            onChange={() => setFormData(prev => ({ ...prev, gender: true }))}
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
                                            onChange={() => setFormData(prev => ({ ...prev, gender: false }))}
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

                        {errors.submit && (
                            <div className="text-red-500 text-center">{errors.submit}</div>
                        )}

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white font-medium rounded-xl
                  hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                  disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                            >
                                {loading ? 'Đang xử lý...' : 'Đăng ký'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegisterReaderPage;