import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AcademicCapIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { instructorApi } from '../../services/api';

interface DashboardData {
  overview: {
    totalCourses: number;
    publishedCourses: number;
    draftCourses: number;
    totalEnrollments: number;
    totalRevenue: number;
    averageRating: string;
  };
  courses: any[];
  recentEnrollments: any[];
}

export default function InstructorDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await instructorApi.getDashboard();
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">แดชบอร์ดผู้สอน</h1>
        <Link to="/instructor/courses/create" className="btn btn-primary">
          สร้างคอร์สใหม่
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <AcademicCapIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">คอร์สทั้งหมด</p>
              <p className="text-2xl font-bold">{data?.overview.totalCourses || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">นักเรียนทั้งหมด</p>
              <p className="text-2xl font-bold">{data?.overview.totalEnrollments || 0}</p>
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
            <div className="p-3 bg-purple-100 rounded-lg">
              <StarIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">คะแนนเฉลี่ย</p>
              <p className="text-2xl font-bold">{data?.overview.averageRating || '0.00'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* My Courses */}
        <div className="bg-white rounded-xl shadow">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold">คอร์สของฉัน</h2>
            <Link to="/instructor/courses" className="text-primary-600 text-sm hover:underline">
              ดูทั้งหมด
            </Link>
          </div>
          <div className="p-6">
            {data?.courses && data.courses.length > 0 ? (
              <div className="space-y-4">
                {data.courses.slice(0, 5).map((course: any) => (
                  <div key={course.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-16 h-10 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                        {course.thumbnailUrl && (
                          <img
                            src={course.thumbnailUrl}
                            alt={course.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900 line-clamp-1">{course.title}</p>
                        <p className="text-sm text-gray-500">
                          {course._count?.enrollments || 0} นักเรียน
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        course.status === 'PUBLISHED'
                          ? 'bg-green-100 text-green-700'
                          : course.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {course.status === 'PUBLISHED'
                        ? 'เผยแพร่'
                        : course.status === 'PENDING'
                        ? 'รอตรวจ'
                        : 'แบบร่าง'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">ยังไม่มีคอร์ส</p>
            )}
          </div>
        </div>

        {/* Recent Enrollments */}
        <div className="bg-white rounded-xl shadow">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">การลงทะเบียนล่าสุด</h2>
          </div>
          <div className="p-6">
            {data?.recentEnrollments && data.recentEnrollments.length > 0 ? (
              <div className="space-y-4">
                {data.recentEnrollments.map((enrollment: any) => (
                  <div key={enrollment.id} className="flex items-center">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="font-medium text-gray-600">
                        {enrollment.user.firstName[0]}
                      </span>
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="font-medium text-gray-900">
                        {enrollment.user.firstName} {enrollment.user.lastName}
                      </p>
                      <p className="text-sm text-gray-500 line-clamp-1">
                        {enrollment.course.title}
                      </p>
                    </div>
                    <span className="text-sm text-gray-400">
                      {new Date(enrollment.enrolledAt).toLocaleDateString('th-TH')}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">ยังไม่มีการลงทะเบียน</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
