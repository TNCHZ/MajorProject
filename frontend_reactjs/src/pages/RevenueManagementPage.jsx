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

const exportAllPaymentsToCSV = async () => {
  try {
    const allRows = [];
    let page = 0;
    const size = 50; // có thể thay đổi
    let totalPages = 1;

    do {
      const res = await authApis().get(endpoints["payments"], {
        params: { page, size, sortBy: "id" },
      });

      const data = res.data?.content || [];
      totalPages = res.data?.totalPages || 1;

      const mapped = data.map((p) => ({
        id: p.id,
        date: p.paymentDate
          ? new Date(p.paymentDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        user: p.user,
        type: mapPaymentType(p.description?.toLowerCase(), p.type),
        desc: p.description,
        amount: p.amount,
      }));

      allRows.push(...mapped);
      page++;
    } while (page < totalPages);

    exportCSV(allRows, "all_revenue.csv");
    alert(`✅ Xuất thành công ${allRows.length} bản ghi`);
  } catch (err) {
    console.error("Lỗi khi tải toàn bộ payments:", err);
    alert("❌ Không thể xuất CSV");
  }
};

function exportCSV(rows, filename = "revenue.csv") {
  if (!Array.isArray(rows) || rows.length === 0) return;

  const cols = ["id", "date", "user", "type", "desc", "amount"];
  const headers = cols.join(";"); 

  const csvRows = rows.map((r) =>
    cols
      .map((c) => {
        let value = r[c];

        if (c === "date" && value) {
          try {
            value = new Date(value).toISOString().split("T")[0];
          } catch {}
        }

        if (c === "type" && typeof TYPE_LABEL !== "undefined") {
          value = TYPE_LABEL[r[c]] || r[c];
        }

        if (c === "amount" && typeof value === "number") {
          value = value.toLocaleString("vi-VN");
        }

        if (typeof value === "string") {
          value = value.replace(/"/g, '""').replace(/\n/g, " ");
        }

        return `"${value ?? ""}"`;
      })
      .join(";")
  );

  // ⚡ Thêm BOM UTF-8
  const csvContent = "\uFEFF" + [headers, ...csvRows].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
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
  const [revenueData, setRevenueData] = useState({});
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
        setRevenueData(res.data || {});
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
        date: p.paymentDate
          ? new Date(p.paymentDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
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

  const totalMembership = useMemo(() => {
    return Object.values(revenueData).reduce((sum, r) => sum + (r.MEMBERSHIP || 0), 0);
  }, [revenueData]);

  const totalFine = useMemo(() => {
    return Object.values(revenueData).reduce((sum, r) => sum + (r.FINE || 0), 0);
  }, [revenueData]);

  const totalRevenue = totalMembership + totalFine;

  const chartData = useMemo(() => {
    return Object.entries(revenueData).map(([key, values]) => ({
      date: month ? `Ngày ${key}` : `Tháng ${key}`,
      MEMBERSHIP: values.MEMBERSHIP || 0,
      FINE: values.FINE || 0,
    }));
  }, [revenueData, month]);

  const pieData = useMemo(() => {
    return [
      { name: "Membership", value: totalMembership, fill: COLORS[1] },
      { name: "Fines", value: totalFine, fill: COLORS[0] },
    ].filter((d) => d.value > 0);
  }, [totalMembership, totalFine]);


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
            onClick={exportAllPaymentsToCSV}
            className="px-3 py-2 rounded-2xl bg-blue-600 text-white shadow hover:bg-blue-700 font-semibold transition"
          >
            Export toàn bộ CSV
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow border">
          <p className="text-xs text-gray-500">Phí thành viên</p>
          <p className="text-2xl font-semibold">{loading ? 'Đang tải...' : fmtVND(totalMembership)}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow border">
          <p className="text-xs text-gray-500">Phí phạt</p>
          <p className="text-2xl font-semibold">{loading ? 'Đang tải...' : fmtVND(totalFine)}</p>
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
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(v) => fmtVND(v)} />
                  <Legend />
                  <Bar dataKey="MEMBERSHIP" fill={COLORS[1]} name="Membership" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="FINE" fill={COLORS[0]} name="Fine" radius={[8, 8, 0, 0]} />
                </BarChart>
              ) : (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(v) => fmtVND(v)} />
                  <Legend />
                  <Line type="monotone" dataKey="MEMBERSHIP" stroke={COLORS[1]} name="Membership" strokeWidth={2} dot />
                  <Line type="monotone" dataKey="FINE" stroke={COLORS[0]} name="Fine" strokeWidth={2} dot />
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
              className={`px-4 py-2 rounded-2xl shadow font-semibold transition ${page === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
            >
              Trang trước
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className={`px-4 py-2 rounded-2xl shadow font-semibold transition ${page >= totalPages - 1 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
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