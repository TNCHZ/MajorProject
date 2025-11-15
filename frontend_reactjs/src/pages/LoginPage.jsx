import React, { useContext, useState } from "react";
import { MyDispatchContext } from "../configs/Context";
import APIs, { authApis, endpoints } from "../configs/Apis";
import cookie from "react-cookies";
import { MdOutlineMailOutline, MdOutlineLock } from "react-icons/md"; // Import icons

const LoginPage = () => {
    const [user, setUser] = useState({ username: '', password: '' });
    const [fieldErrors, setFieldErrors] = useState({});
    const [msg, setMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const dispatch = useContext(MyDispatchContext);

    const validate = () => {
        let errors = {};
        if (!user.username) errors.username = 'Tên đăng nhập không được để trống';
        if (!user.password) errors.password = 'Mật khẩu không được để trống';

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChange = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMsg('');
        if (!validate()) return;

        try {
            setLoading(true);
            const res = await APIs.post(endpoints.login, user);
            const token = res?.data?.token;
            if (!token) throw new Error('Không nhận được token từ server');

            cookie.save('token', res.data.token);
            const userRes = await authApis().get(endpoints.profile);

            dispatch({
                type: 'login',
                payload: userRes.data,
            });
        } catch (err) {
            setMsg('Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản/mật khẩu.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 p-4">
            <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-300 ease-in-out">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-gray-800">
                        Chào mừng trở lại!
                    </h2>
                    <p className="mt-2 text-gray-500">Đăng nhập để tiếp tục</p>
                </div>

                {msg && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4">
                        <span className="block sm:inline">{msg}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-gray-700 mb-2 font-medium">
                            Tên đăng nhập
                        </label>
                        <div className="relative">
                            <MdOutlineMailOutline className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                name="username"
                                value={user.username}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                                placeholder="Nhập tên đăng nhập"
                                required
                            />
                        </div>
                        {fieldErrors.username && <div className="text-red-500 text-sm mt-1">{fieldErrors.username}</div>}
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-2 font-medium">
                            Mật khẩu
                        </label>
                        <div className="relative">
                            <MdOutlineLock className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="password"
                                name="password"
                                value={user.password}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                                placeholder="Nhập mật khẩu"
                                required
                            />
                        </div>
                        {fieldErrors.password && <div className="text-red-500 text-sm mt-1">{fieldErrors.password}</div>}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                        disabled={loading}
                    >
                        {loading ? "Đang xử lý..." : "Đăng nhập"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;