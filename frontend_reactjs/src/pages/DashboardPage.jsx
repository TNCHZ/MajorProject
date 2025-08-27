
import React, { useEffect, useMemo, useState } from "react";
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";
import { authApis, endpoints } from "../configs/Apis";

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444"];

export default function DashboardPage() {
  const [query, setQuery] = useState("");
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [loadingReaders, setLoadingReaders] = useState(true);
  const [loadingBorrowing, setLoadingBorrowing] = useState(true);
  const [loadingOverdue, setLoadingOverdue] = useState(true);
  const [loadingMonthlyBorrowings, setLoadingMonthlyBorrowings] = useState(true);
  const [loadingRevenue, setLoadingRevenue] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingTopBooks, setLoadingTopBooks] = useState(true);
  const [errorBooks, setErrorBooks] = useState(null);
  const [errorReaders, setErrorReaders] = useState(null);
  const [errorBorrowing, setErrorBorrowing] = useState(null);
  const [errorOverdue, setErrorOverdue] = useState(null);
  const [errorMonthlyBorrowings, setErrorMonthlyBorrowings] = useState(null);
  const [errorRevenue, setErrorRevenue] = useState(null);
  const [errorCategories, setErrorCategories] = useState(null);
  const [errorTopBooks, setErrorTopBooks] = useState(null);
  const [totalBooks, setTotalBooks] = useState(0);
  const [totalReaders, setTotalReaders] = useState(0);
  const [totalBorrowing, setTotalBorrowing] = useState(0);
  const [totalOverdue, setTotalOverdue] = useState(0);
  const [monthlyBorrowings, setMonthlyBorrowings] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [categoryDistribution, setCategoryDistribution] = useState([]);
  const [topBooks, setTopBooks] = useState([]);

  useEffect(() => {
    const currentYear = new Date().getFullYear(); // e.g., 2025
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const fetchTotalBooks = async () => {
      try {
        setLoadingBooks(true);
        const response = await authApis().get(endpoints['book-count']);
        setTotalBooks(Number(response.data) || 0);
      } catch (err) {
        setErrorBooks('Failed to fetch total books');
        console.error('Book count error:', err);
        setTotalBooks(0);
      } finally {
        setLoadingBooks(false);
      }
    };

    const fetchTotalReaders = async () => {
      try {
        setLoadingReaders(true);
        const response = await authApis().get(endpoints['reader-count']);
        setTotalReaders(Number(response.data) || 0);
      } catch (err) {
        setErrorReaders('Failed to fetch total readers');
        console.error('Reader count error:', err);
        setTotalReaders(0);
      } finally {
        setLoadingReaders(false);
      }
    };

    const fetchTotalBorrowing = async () => {
      try {
        setLoadingBorrowing(true);
        const response = await authApis().get(`${endpoints['borrow-slip-count']}?status=BORROWING`);
        setTotalBorrowing(Number(response.data) || 0);
      } catch (err) {
        setErrorBorrowing('Failed to fetch borrowing count');
        console.error('Borrowing count error:', err);
        setTotalBorrowing(0);
      } finally {
        setLoadingBorrowing(false);
      }
    };

    const fetchTotalOverdue = async () => {
      try {
        setLoadingOverdue(true);
        const response = await authApis().get(`${endpoints['borrow-slip-count']}?status=OVERDUE`);
        setTotalOverdue(Number(response.data) || 0);
      } catch (err) {
        setErrorOverdue('Failed to fetch overdue count');
        console.error('Overdue count error:', err);
        setTotalOverdue(0);
      } finally {
        setLoadingOverdue(false);
      }
    };

    const fetchMonthlyBorrowings = async () => {
      try {
        setLoadingMonthlyBorrowings(true);
        const response = await authApis().get(`${endpoints['borrow-slip-count-monthly']}?year=${currentYear}`);
        setMonthlyBorrowings(response.data || []);
      } catch (err) {
        setErrorMonthlyBorrowings('Failed to fetch monthly borrowings');
        console.error('Monthly borrowings error:', err);
        setMonthlyBorrowings([]);
      } finally {
        setLoadingMonthlyBorrowings(false);
      }
    };

    const fetchRevenue = async () => {
      try {
        setLoadingRevenue(true);
        const response = await authApis().get(`${endpoints['fine-amount-monthly']}?year=${currentYear}`);
        console.log('Revenue response:', response.data);
        const transformedData = (response.data || []).map(item => ({
          month: item.month.includes('-') 
            ? new Date(item.month).toLocaleString('en-US', { month: 'short' }) 
            : monthNames[parseInt(item.month) - 1] || item.month,
          revenue: Number(item.amount || item.revenue || 0)
        }));
        setRevenueData(transformedData);
      } catch (err) {
        setErrorRevenue('Failed to fetch revenue');
        console.error('Revenue error:', err);
        setRevenueData([]);
      } finally {
        setLoadingRevenue(false);
      }
    };

    const fetchCategoryDistribution = async () => {
      try {
        setLoadingCategories(true);
        const response = await authApis().get(endpoints['book-category-count']);
        console.log('Category distribution response:', response.data);
        const transformedData = (response.data || []).map(item => ({
          name: item.categoryName,
          value: Number(item.bookCount) || 0
        }));
        setCategoryDistribution(transformedData);
      } catch (err) {
        setErrorCategories('Failed to fetch category distribution');
        console.error('Category distribution error:', err);
        setCategoryDistribution([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    const fetchTopBooks = async () => {
      try {
        setLoadingTopBooks(true);
        const response = await authApis().get(endpoints['book-borrow-slip-count']);
        console.log('Top books response:', response.data);
        const transformedData = (response.data || []).map(item => ({
          id: item.id || item.bookId || Math.random().toString(36).substr(2, 9),
          title: item.title || item.bookTitle || 'Unknown Title',
          author: item.author || 'Unknown Author',
          borrows: Number(item.borrowCount || item.count || 0)
        }));
        setTopBooks(transformedData);
      } catch (err) {
        setErrorTopBooks('Failed to fetch top books');
        console.error('Top books error:', err);
        setTopBooks([]);
      } finally {
        setLoadingTopBooks(false);
      }
    };

    Promise.all([
      fetchTotalBooks(),
      fetchTotalReaders(),
      fetchTotalBorrowing(),
      fetchTotalOverdue(),
      fetchMonthlyBorrowings(),
      fetchRevenue(),
      fetchCategoryDistribution(),
      fetchTopBooks(),
    ]).catch((err) => console.error('Failed to fetch metrics:', err));
  }, []);

  const filteredTopBooks = useMemo(() => {
    const q = query.toLowerCase();
    return topBooks.filter((b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q));
  }, [query, topBooks]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">📚 Library Admin Dashboard</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700">
          + Thêm mới
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500">Tổng số sách</p>
          {loadingBooks ? (
            <p className="text-2xl font-bold">Loading...</p>
          ) : errorBooks ? (
            <p className="text-2xl font-bold text-red-500">Error</p>
          ) : (
            <p className="text-2xl font-bold">{totalBooks.toLocaleString()}</p>
          )}
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500">Độc giả</p>
          {loadingReaders ? (
            <p className="text-2xl font-bold">Loading...</p>
          ) : errorReaders ? (
            <p className="text-2xl font-bold text-red-500">Error</p>
          ) : (
            <p className="text-2xl font-bold">{totalReaders.toLocaleString()}</p>
          )}
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500">Đang mượn</p>
          {loadingBorrowing ? (
            <p className="text-2xl font-bold">Loading...</p>
          ) : errorBorrowing ? (
            <p className="text-2xl font-bold text-red-500">Error</p>
          ) : (
            <p className="text-2xl font-bold">{totalBorrowing.toLocaleString()}</p>
          )}
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm text-gray-500">Quá hạn</p>
          {loadingOverdue ? (
            <p className="text-2xl font-bold">Loading...</p>
          ) : errorOverdue ? (
            <p className="text-2xl font-bold text-red-500">Error</p>
          ) : (
            <p className="text-2xl font-bold text-red-500">{totalOverdue.toLocaleString()}</p>
          )}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow lg:col-span-2">
          <h2 className="font-semibold mb-3">Lượt mượn theo tháng</h2>
          <div className="h-64">
            {loadingMonthlyBorrowings ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-lg font-semibold text-gray-500">Loading...</p>
              </div>
            ) : errorMonthlyBorrowings ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-lg font-semibold text-red-500">Error</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyBorrowings}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="borrowings" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="font-semibold mb-3">Doanh thu tiền phạt</h2>
          <div className="h-64">
            {loadingRevenue ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-lg font-semibold text-gray-500">Loading...</p>
              </div>
            ) : errorRevenue ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-lg font-semibold text-red-500">Error</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 'auto']} allowDataOverflow={false} />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Top Books + Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="font-semibold mb-3">Tỉ lệ sách theo thể loại</h2>
          <div className="h-64">
            {loadingCategories ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-lg font-semibold text-gray-500">Loading...</p>
              </div>
            ) : errorCategories ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-lg font-semibold text-red-500">Error</p>
              </div>
            ) : (
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={categoryDistribution} dataKey="value" nameKey="name" outerRadius={80}>
                    {categoryDistribution.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, name]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow lg:col-span-2">
          <h2 className="font-semibold mb-3">Top sách được mượn nhiều</h2>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm sách..."
            className="mb-3 w-full border rounded-lg px-3 py-2"
          />
          {loadingTopBooks ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-lg font-semibold text-gray-500">Loading...</p>
            </div>
          ) : errorTopBooks ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-lg font-semibold text-red-500">Error</p>
            </div>
          ) : (
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-2">#</th>
                  <th className="p-2">Tên sách</th>
                  <th className="p-2">Tác giả</th>
                  <th className="p-2 text-right">Lượt mượn</th>
                </tr>
              </thead>
              <tbody>
                {filteredTopBooks.map((b, idx) => (
                  <tr key={b.id} className="border-t hover:bg-gray-50">
                    <td className="p-2">{idx + 1}</td>
                    <td className="p-2">{b.title}</td>
                    <td className="p-2">{b.author}</td>
                    <td className="p-2 text-right">{b.borrows}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
