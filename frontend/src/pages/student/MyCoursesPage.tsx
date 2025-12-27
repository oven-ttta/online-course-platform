import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { enrollmentApi } from '../../services/api';
import { Enrollment } from '../../types';

export default function MyCoursesPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'inProgress' | 'completed'>('all');

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

  const filteredEnrollments = enrollments.filter((e) => {
    if (filter === 'inProgress') return Number(e.progressPercent) < 100;
    if (filter === 'completed') return Number(e.progressPercent) >= 100;
    return true;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">คอร์สของฉัน</h1>
        <div className="flex gap-2">
          {(['all', 'inProgress', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f === 'all' ? 'ทั้งหมด' : f === 'inProgress' ? 'กำลังเรียน' : 'เรียนจบ'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow animate-pulse">
              <div className="h-40 bg-gray-200 rounded-t-xl" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredEnrollments.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <p className="text-gray-500">ไม่พบคอร์สที่ค้นหา</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEnrollments.map((enrollment) => (
            <Link
              key={enrollment.id}
              to={`/learn/${enrollment.course.slug}`}
              className="bg-white rounded-xl shadow hover:shadow-lg transition-shadow overflow-hidden"
            >
              <div className="aspect-video">
                <img
                  src={enrollment.course.thumbnailUrl || 'https://placehold.co/400x225/e2e8f0/64748b?text=Course'}
                  alt={enrollment.course.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
                  {enrollment.course.title}
                </h3>
                <p className="text-sm text-gray-500 mb-3">
                  {enrollment.course.instructor.firstName} {enrollment.course.instructor.lastName}
                </p>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-500">ความคืบหน้า</span>
                    <span className="font-medium">
                      {Number(enrollment.progressPercent).toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        Number(enrollment.progressPercent) >= 100
                          ? 'bg-green-500'
                          : 'bg-primary-600'
                      }`}
                      style={{ width: `${enrollment.progressPercent}%` }}
                    />
                  </div>
                </div>
                {Number(enrollment.progressPercent) >= 100 && (
                  <div className="mt-3 text-center">
                    <span className="text-sm text-green-600 font-medium">
                      เรียนจบแล้ว
                    </span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
