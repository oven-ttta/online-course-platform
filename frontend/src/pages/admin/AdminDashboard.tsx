import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  UsersIcon,
  AcademicCapIcon,
  CurrencyDollarIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';
import { adminApi } from '../../services/api';

interface DashboardData {
  overview: {
    totalUsers: number;
    totalCourses: number;
    totalEnrollments: number;
    totalRevenue: number;
    pendingCourses: number;
  };
  usersByRole: { role: string; _count: number }[];
  thisMonth: {
    newUsers: number;
    enrollments: number;
    revenue: number;
  };
  recentUsers: any[];
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await adminApi.getDashboard();
      setData(response.data.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">แดชบอร์ดผู้ดูแลระบบ</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <UsersIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">ผู้ใช้ทั้งหมด</p>
              <p className="text-2xl font-bold">{data?.overview.totalUsers || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <AcademicCapIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">คอร์สทั้งหมด</p>
              <p className="text-2xl font-bold">{data?.overview.totalCourses || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">รายได้รวม</p>
              <p className="text-2xl font-bold">
                ฿{(data?.overview.totalRevenue || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <ClipboardDocumentListIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">คอร์สรอตรวจ</p>
              <p className="text-2xl font-bold">{data?.overview.pendingCourses || 0}</p>
            </div>
          </div>
          {data?.overview.pendingCourses && data.overview.pendingCourses > 0 && (
            <Link
              to="/admin/courses"
              className="mt-3 text-sm text-primary-600 hover:underline block"
            >
              ดูคอร์สที่รอตรวจ &rarr;
            </Link>
          )}
        </div>
      </div>

      {/* This Month Stats */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">เดือนนี้</h2>
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">{data?.thisMonth.newUsers || 0}</p>
            <p className="text-gray-500">ผู้ใช้ใหม่</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">{data?.thisMonth.enrollments || 0}</p>
            <p className="text-gray-500">การลงทะเบียน</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">
              ฿{(data?.thisMonth.revenue || 0).toLocaleString()}
            </p>
            <p className="text-gray-500">รายได้</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Users by Role */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">ผู้ใช้ตามบทบาท</h2>
          <div className="space-y-3">
            {data?.usersByRole.map((item) => (
              <div key={item.role} className="flex items-center justify-between">
                <span className="text-gray-700">
                  {item.role === 'ADMIN'
                    ? 'ผู้ดูแลระบบ'
                    : item.role === 'INSTRUCTOR'
                    ? 'ผู้สอน'
                    : 'นักเรียน'}
                </span>
                <span className="font-semibold">{item._count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">ผู้ใช้ล่าสุด</h2>
            <Link to="/admin/users" className="text-primary-600 text-sm hover:underline">
              ดูทั้งหมด
            </Link>
          </div>
          <div className="space-y-3">
            {data?.recentUsers.map((user) => (
              <div key={user.id} className="flex items-center">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="font-medium text-gray-600">{user.firstName[0]}</span>
                </div>
                <div className="ml-3 flex-1">
                  <p className="font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    user.role === 'ADMIN'
                      ? 'bg-purple-100 text-purple-700'
                      : user.role === 'INSTRUCTOR'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {user.role === 'ADMIN'
                    ? 'Admin'
                    : user.role === 'INSTRUCTOR'
                    ? 'Instructor'
                    : 'Student'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
