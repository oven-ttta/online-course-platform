import { useState, useEffect } from "react";
import { instructorApi } from "../../services/api";
import { BanknotesIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

export default function InstructorEarningsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEarnings();
  }, []);

  const loadEarnings = async () => {
    try {
      const response = await instructorApi.getEarnings();
      setData(response.data.data);
    } catch (error) {
      console.error("Error loading earnings:", error);
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
        <h1 className="text-2xl font-bold text-gray-900">รายได้และการขาย</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="p-2 bg-green-50 rounded-lg w-fit mb-4">
            <BanknotesIcon className="h-6 w-6 text-green-600" />
          </div>
          <p className="text-sm font-medium text-gray-500">รวมรายได้ทั้งหมด</p>
          <p className="text-2xl font-bold text-gray-900">
            ฿{data?.totalEarnings?.toLocaleString()}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="p-2 bg-blue-50 rounded-lg w-fit mb-4">
            <UserGroupIcon className="h-6 w-6 text-blue-600" />
          </div>
          <p className="text-sm font-medium text-gray-500">
            ยอดขายรวม (Transactions)
          </p>
          <p className="text-2xl font-bold text-gray-900">
            {data?.totalSales?.toLocaleString()} รายการ
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">
            แนวโน้มรายได้
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.earningsByMonth?.reverse()}>
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
                />
                <YAxis />
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
                  dataKey="earnings"
                  stroke="#10B981"
                  fill="#D1FAE5"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">
            รายได้แยกตามคอร์ส
          </h3>
          <div className="space-y-4">
            {data?.earningsByCourse?.map((course: any) => (
              <div
                key={course.id}
                className="flex justify-between items-center text-sm"
              >
                <span className="truncate max-w-[140px] font-medium">
                  {course.title}
                </span>
                <span className="font-bold text-gray-900">
                  ฿{Number(course.statistics?.totalRevenue).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
