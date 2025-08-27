import React, { useMemo, useState, useEffect, useCallback } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { authApis, endpoints } from '../configs/Apis';

const TYPE_LABEL = {
  FINE: "Fine",
  MEMBERSHIP: "Membership",
};

const COLORS = ["#f97316", "#22c55e"]; // orange (Fine), green (Membership)

const fmtVND = (n) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(n);

function exportCSV(rows, filename = "revenue.csv") {
  if (!rows?.length) return;
  const cols = ["id", "date", "user", "type", "desc", "amount"];
  const csv = [
    cols.join(","),
    ...rows.map((r) =>
      cols
        .map((c) => {
          if (c === "type") return JSON.stringify(TYPE_LABEL[r[c]] || r[c]);
          return JSON.stringify(r[c] ?? "");
        })
        .join(",")
    ),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function mapPaymentType(description, type) {
  if (type === "Membership") return "MEMBERSHIP";
  return "FINE";
}

/** ====== PAGE ====== */
export default function RevenueManagementPage() {
  // Filters
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [chartKind, setChartKind] = useState("BAR"); // BAR | LINE
  const [year, setYear] = useState("2025");
  const [month, setMonth] = useState("");
  const [revenueData, setRevenueData] = useState({ MEMBERSHIP: 0, FINE: 0 });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  // Table pagination
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 5;

  // Fetch revenue data
  useEffect(() => {
    const fetchRevenue = async () => {
      setLoading(true);
      try {
        const params = { year };
        if (month) params.month = month;
        const res = await authApis().get(endpoints['payment-revenue'], { params });
        setRevenueData(res.data || { MEMBERSHIP: 0, FINE: 0 });
      } catch (err) {
        console.error('Lỗi khi lấy dữ liệu doanh thu:', err);
      }
      setLoading(false);
    };
    fetchRevenue();
  }, [year, month]);

  // Fetch transactions
  const fetchTransactions = useCallback(async () => {
    setLoadingTransactions(true);
    try {
      const res = await authApis().get(endpoints['payments'], {
        params: { page, size: pageSize, sortBy: "id" },
      });
      const mappedTransactions = (res.data.content || []).map((p) => ({
        id: p.id,
        date: p.date || new Date().toISOString().split("T")[0], // Placeholder date
        user: p.user,
        type: mapPaymentType(p.description.toLowerCase(), p.type),
        desc: p.description,
        amount: p.amount,
      }));
      setTransactions(mappedTransactions);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error('Lỗi khi lấy dữ liệu giao dịch:', err);
      alert('Không thể lấy danh sách giao dịch');
    }
    setLoadingTransactions(false);
  }, [page]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  /** ====== FILTER DATA ====== */
  const filtered = useMemo(() => {
    if (typeFilter === "ALL") return transactions;
    return transactions.filter((t) =>
      typeFilter === "MEMBERSHIP" ? t.type === "MEMBERSHIP" : t.type === "FINE"
    );
  }, [transactions, typeFilter]);

  /** ====== KPIs ====== */
  const totalRevenue = useMemo(
    () => revenueData.MEMBERSHIP + revenueData.FINE,
    [revenueData]
  );

  /** ====== CHART DATA (by month/year) ====== */
  const byMonthYearMap = useMemo(() => {
    const m = new Map();
    filtered.forEach((t) => {
      const date = t.date.split('-'); // yyyy-mm-dd
      const yearVal = date[0];
      const monthVal = date[1];
      const dayVal = date[2];
      if (month) {
        // Aggregate by day for selected year and month
        if (yearVal === year && monthVal === month.padStart(2, '0')) {
          const key = `${year}-${month.padStart(2, '0')}-${dayVal}`;
          if (!m.has(key)) m.set(key, { date: key, amount: 0 });
          m.get(key).amount += t.amount;
        }
      } else {
        // Aggregate by month for selected year
        if (yearVal === year) {
          const key = `${yearVal}-${monthVal}`;
          if (!m.has(key)) m.set(key, { date: key, amount: 0 });
          m.get(key).amount += t.amount;
        }
      }
    });
    return Array.from(m.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [filtered, year, month]);

  /** ====== PIE DATA (by type) ====== */
  const pieData = useMemo(() => {
    return [
      { name: "Membership", value: revenueData.MEMBERSHIP, fill: COLORS[1] },
      { name: "Fines", value: revenueData.FINE, fill: COLORS[0] },
    ].filter((d) => d.value > 0);
  }, [revenueData]);

  /** ====== TABLE & PAGINATION ====== */
  const paginated = useMemo(() => {
    return filtered; // Server-side pagination
  }, [filtered]);

  // Year and month options
  const years = Array.from({ length: 6 }, (_, i) => 2020 + i); // 2020–2025
  const months = [
    { value: "", label: "Cả năm" },
    ...Array.from({ length: 12 }, (_, i) => ({
      value: i + 1,
      label: `Tháng ${i + 1}`,
    })),
  ];

  /** ====== UI ====== */
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">💰 Quản lý doanh thu</h1>
          <p className="text-gray-500 text-sm">Theo dõi và phân tích doanh thu theo loại phí & thời gian</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => exportCSV(filtered, "revenue.csv")}
            className="px-3 py-2 rounded-2xl bg-blue-600 text-white shadow hover:bg-blue-700 font-semibold transition"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <div className="col-span-1">
          <label className="block text-xs text-gray-500 mb-1">Năm</label>
          <select
            value={year}
            onChange={(e) => { setYear(e.target.value); setPage(0); }}
            className="w-full border border-gray-300 rounded-2xl px-3 py-2 bg-white shadow focus:ring-2 focus:ring-blue-400 transition"
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div className="col-span-1">
          <label className="block text-xs text-gray-500 mb-1">Tháng</label>
          <select
            value={month}
            onChange={(e) => { setMonth(e.target.value); setPage(0); }}
            className="w-full border border-gray-300 rounded-2xl px-3 py-2 bg-white shadow focus:ring-2 focus:ring-blue-400 transition"
          >
            {months.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
        <div className="col-span-1">
          <label className="block text-xs text-gray-500 mb-1">Loại phí</label>
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(0); }}
            className="w-full border border-gray-300 rounded-2xl px-3 py-2 bg-white shadow focus:ring-2 focus:ring-blue-400 transition"
          >
            <option value="ALL">Tất cả</option>
            <option value="MEMBERSHIP">{TYPE_LABEL.MEMBERSHIP}</option>
            <option value="FINE">{TYPE_LABEL.FINE}</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow border">
          <p className="text-xs text-gray-500">Phí thành viên</p>
          <p className="text-2xl font-semibold">{loading ? 'Đang tải...' : fmtVND(revenueData.MEMBERSHIP)}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow border">
          <p className="text-xs text-gray-500">Phí phạt</p>
          <p className="text-2xl font-semibold">{loading ? 'Đang tải...' : fmtVND(revenueData.FINE)}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow border">
          <p className="text-xs text-gray-500">Tổng doanh thu</p>
          <p className="text-2xl font-semibold">{loading ? 'Đang tải...' : fmtVND(totalRevenue)}</p>
        </div>
      </div>

      {/* Charts */}
      <div className={`grid grid-cols-1 ${typeFilter === "ALL" ? "lg:grid-cols-3" : "lg:grid-cols-1"} gap-4 mb-6`}>
        <div className={`bg-white rounded-2xl p-4 shadow border ${typeFilter === "ALL" ? "lg:col-span-2" : ""}`}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">{month ? 'Doanh thu theo ngày trong tháng' : 'Doanh thu theo tháng'}</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setChartKind("BAR")}
                className={`px-3 py-1.5 rounded-2xl text-sm border ${chartKind === "BAR" ? "bg-blue-600 text-white" : "bg-white hover:bg-blue-50"} shadow`}
              >
                Bar
              </button>
              <button
                onClick={() => setChartKind("LINE")}
                className={`px-3 py-1.5 rounded-2xl text-sm border ${chartKind === "LINE" ? "bg-blue-600 text-white" : "bg-white hover:bg-blue-50"} shadow`}
              >
                Line
              </button>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              {chartKind === "BAR" ? (
                <BarChart data={byMonthYearMap}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(v) => fmtVND(v)} />
                  <Bar dataKey="amount" radius={[8, 8, 0, 0]} fill="#3b82f6" />
                </BarChart>
              ) : (
                <LineChart data={byMonthYearMap}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(v) => fmtVND(v)} />
                  <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} dot />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {typeFilter === "ALL" && (
          <div className="bg-white rounded-2xl p-4 shadow border">
            <h2 className="font-semibold mb-3">Tỷ trọng theo loại phí</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                    {pieData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip formatter={(v) => fmtVND(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl p-4 shadow border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Giao dịch doanh thu</h2>
          <span className="text-sm text-gray-500">
            {filtered.length} bản ghi
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-2 border">#</th>
                <th className="p-2 border">Ngày</th>
                <th className="p-2 border">User</th>
                <th className="p-2 border">Loại phí</th>
                <th className="p-2 border">Mô tả</th>
                <th className="p-2 border text-right">Số tiền</th>
              </tr>
            </thead>
            <tbody>
              {loadingTransactions ? (
                <tr>
                  <td className="p-6 text-center text-gray-500" colSpan={6}>
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : paginated.length ? (
                paginated.map((t, idx) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="p-2 border">{page * pageSize + idx + 1}</td>
                    <td className="p-2 border">{t.date}</td>
                    <td className="p-2 border">{t.user}</td>
                    <td className="p-2 border">{TYPE_LABEL[t.type]}</td>
                    <td className="p-2 border">{t.desc}</td>
                    <td className="p-2 border text-right">{fmtVND(t.amount)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-6 text-center text-gray-500" colSpan={6}>
                    Không có dữ liệu phù hợp bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-500">
            Trang {page + 1}/{totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className={`px-4 py-2 rounded-2xl shadow font-semibold transition ${
                page === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Trang trước
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className={`px-4 py-2 rounded-2xl shadow font-semibold transition ${
                page >= totalPages - 1 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Trang sau
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-gray-400 mt-8">
        © {new Date().getFullYear()} Library Admin • Revenue module
      </p>
    </div>
  );
}