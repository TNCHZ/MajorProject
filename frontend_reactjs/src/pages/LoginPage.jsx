import React, { useContext, useState } from "react";
import { MyDispatchContext } from "../configs/Context";
import APIs, { authApis, endpoints } from "../configs/Apis";
import cookie from "react-cookies";
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [user, setUser] = useState({ username: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useContext(MyDispatchContext);
  const nav = useNavigate();

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
      console.log(userRes.role);
      nav('/main');
    } catch (err) {
      setMsg('Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản/mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-700">
          Đăng nhập
        </h2>
        {msg && <div className="text-red-500 mb-3 text-center">{msg}</div>}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-600 mb-1">Tên đăng nhập</label>
            <input
              type="text"
              name="username"
              value={user.username}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập tên đăng nhập"
              required
            />
            {fieldErrors.username && <div className="text-red-500">{fieldErrors.username}</div>}
          </div>

          <div>
            <label className="block text-gray-600 mb-1">Mật khẩu</label>
            <input
              type="password"
              name="password"
              value={user.password}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập mật khẩu"
              required
            />
            {fieldErrors.password && <div className="text-red-500">{fieldErrors.password}</div>}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition duration-300"
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
