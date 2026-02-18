import { useState, useEffect } from "react";
import { adminApi } from "../../services/api";
import { CurrencyDollarIcon, UsersIcon } from "@heroicons/react/24/outline";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

export default function AdminReportsPage() {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("year");

  useEffect(() => {
    loadReports();
  }, [dateRange]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const revenueRes = await adminApi.getRevenueReport();
      setReportData(revenueRes.data.data);
    } catch (error) {
      console.error("Error loading reports:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">รายงานและสถิติ</h1>
        <div className="flex gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="input text-sm"
          >
            <option value="month">30 วันล่าสุด</option>
            <option value="year">1 ปีล่าสุด</option>
            <option value="all">ทั้งหมด</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-50 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-500">รายได้รวม</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-gray-900">
              ฿{reportData?.totalRevenue?.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <UsersIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-500">จำนวนการซื้อ</p>
          <p className="text-2xl font-bold text-gray-900">
            {reportData?.totalTransactions?.toLocaleString()} รายการ
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">
            รายได้รายเดือน
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={reportData?.revenueByMonth?.reverse()}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E5E7EB"
                />
                <XAxis
                  dataKey="month"
                  tickFormatter={(val) =>
                    new Date(val).toLocaleDateString("th-TH", {
                      month: "short",
                    })
                  }
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(val: any) => `฿${Number(val).toLocaleString()}`}
                  labelFormatter={(val) =>
                    new Date(val).toLocaleDateString("th-TH", {
                      month: "long",
                      year: "numeric",
                    })
                  }
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#4F46E5"
                  fillOpacity={1}
                  fill="url(#colorRev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Courses */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">
            คอร์สยอดนิยม (รายได้สูงสุด)
          </h3>
          <div className="space-y-4">
            {reportData?.topCourses?.map((course: any, index: number) => (
              <div
                key={course.id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-400 w-4">
                    {index + 1}
                  </span>
                  <div className="h-10 w-16 bg-gray-100 rounded overflow-hidden">
                    {course.thumbnailUrl && (
                      <img
                        src={course.thumbnailUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                      {course.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      {course.instructor?.firstName}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">
                    ฿{Number(course.statistics?.totalRevenue).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {course.statistics?.totalEnrollments} นักเรียน
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
