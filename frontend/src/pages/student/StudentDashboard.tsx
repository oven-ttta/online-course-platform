import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpenIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { enrollmentApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Enrollment } from '../../types';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEnrollments();
  }, []);

  const loadEnrollments = async () => {
    try {
      const response = await enrollmentApi.getMyEnrollments();
      setEnrollments(response.data.data);
    } catch (error) {
      console.error('Error loading enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  const inProgressCourses = enrollments.filter(
    (e) => e.status === 'ACTIVE' && Number(e.progressPercent) < 100
  );
  const completedCourses = enrollments.filter(
    (e) => Number(e.progressPercent) >= 100
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          สวัสดี, {user?.firstName}!
        </h1>
        <p className="text-gray-600 mt-1">ยินดีต้อนรับกลับมา มาเรียนต่อกันเถอะ</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <BookOpenIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">คอร์สทั้งหมด</p>
              <p className="text-2xl font-bold">{enrollments.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">กำลังเรียน</p>
              <p className="text-2xl font-bold">{inProgressCourses.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">เรียนจบแล้ว</p>
              <p className="text-2xl font-bold">{completedCourses.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Continue Learning */}
      {inProgressCourses.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">เรียนต่อ</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inProgressCourses.slice(0, 4).map((enrollment) => (
              <Link
                key={enrollment.id}
                to={`/learn/${enrollment.course.slug}`}
                className="bg-white rounded-xl shadow hover:shadow-lg transition-shadow overflow-hidden flex"
              >
                <div className="w-32 h-24 flex-shrink-0">
                  <img
                    src={enrollment.course.thumbnailUrl || 'https://placehold.co/128x96/e2e8f0/64748b?text=Course'}
                    alt={enrollment.course.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 flex-1">
                  <h3 className="font-medium text-gray-900 line-clamp-1">
                    {enrollment.course.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {enrollment.course.instructor.firstName} {enrollment.course.instructor.lastName}
                  </p>
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">ความคืบหน้า</span>
                      <span className="font-medium">{Number(enrollment.progressPercent).toFixed(0)}%</span>
                    </div>
                    <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-600 rounded-full"
                        style={{ width: `${enrollment.progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {inProgressCourses.length > 4 && (
            <Link
              to="/dashboard/my-courses"
              className="block text-center mt-4 text-primary-600 hover:text-primary-700"
            >
              ดูทั้งหมด &rarr;
            </Link>
          )}
        </div>
      )}

      {/* Empty State */}
      {enrollments.length === 0 && !loading && (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <BookOpenIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            ยังไม่มีคอร์สที่ลงทะเบียน
          </h3>
          <p className="text-gray-500 mb-6">
            เริ่มต้นเส้นทางการเรียนรู้ของคุณด้วยการเลือกคอร์สที่สนใจ
          </p>
          <Link to="/courses" className="btn btn-primary">
            ค้นหาคอร์ส
          </Link>
        </div>
      )}
    </div>
  );
}
