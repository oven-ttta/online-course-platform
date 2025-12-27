import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, CheckIcon, XMarkIcon, EyeIcon } from '@heroicons/react/24/outline';
import { adminApi } from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    loadCourses();
  }, [page, statusFilter]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 20 };
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;

      const response = await adminApi.getCourses(params);
      setCourses(response.data.data);
      setTotal(response.data.meta?.total || 0);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadCourses();
  };

  const handleApprove = async (courseId: string) => {
    try {
      await adminApi.approveCourse(courseId);
      toast.success('อนุมัติคอร์สสำเร็จ');
      loadCourses();
    } catch (error) {
      toast.error('เกิดข้อผิดพลาด');
    }
  };

  const openRejectModal = (course: any) => {
    setSelectedCourse(course);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!selectedCourse) return;

    try {
      await adminApi.rejectCourse(selectedCourse.id, rejectReason);
      toast.success('ปฏิเสธคอร์สสำเร็จ');
      setShowRejectModal(false);
      setSelectedCourse(null);
      loadCourses();
    } catch (error) {
      toast.error('เกิดข้อผิดพลาด');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'เผยแพร่';
      case 'PENDING':
        return 'รอตรวจสอบ';
      case 'REJECTED':
        return 'ถูกปฏิเสธ';
      default:
        return 'แบบร่าง';
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">จัดการคอร์ส</h1>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหาคอร์ส..."
                className="input pl-10"
              />
            </div>
          </form>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="input w-48"
          >
            <option value="">ทุกสถานะ</option>
            <option value="PENDING">รอตรวจสอบ</option>
            <option value="PUBLISHED">เผยแพร่แล้ว</option>
            <option value="REJECTED">ถูกปฏิเสธ</option>
            <option value="DRAFT">แบบร่าง</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                คอร์ส
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ผู้สอน
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                หมวดหมู่
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ราคา
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                สถานะ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                การดำเนินการ
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  กำลังโหลด...
                </td>
              </tr>
            ) : courses.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  ไม่พบคอร์ส
                </td>
              </tr>
            ) : (
              courses.map((course) => (
                <tr key={course.id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-12 w-20 rounded bg-gray-200 flex-shrink-0 overflow-hidden">
                        {course.thumbnailUrl && (
                          <img
                            src={course.thumbnailUrl}
                            alt={course.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 line-clamp-1">
                          {course.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {course._count?.lessons || 0} บทเรียน
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {course.instructor?.firstName} {course.instructor?.lastName}
                    </div>
                    <div className="text-sm text-gray-500">{course.instructor?.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {course.category?.name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ฿{Number(course.price).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(course.status)}`}
                    >
                      {getStatusText(course.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <a
                        href={`/courses/${course.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-gray-800"
                        title="ดูตัวอย่าง"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </a>
                      {course.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleApprove(course.id)}
                            className="text-green-600 hover:text-green-800"
                            title="อนุมัติ"
                          >
                            <CheckIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => openRejectModal(course)}
                            className="text-red-600 hover:text-red-800"
                            title="ปฏิเสธ"
                          >
                            <XMarkIcon className="h-5 w-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {total > 20 && (
          <div className="px-6 py-4 flex items-center justify-between border-t">
            <p className="text-sm text-gray-500">
              แสดง {(page - 1) * 20 + 1} - {Math.min(page * 20, total)} จาก {total}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                ก่อนหน้า
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= Math.ceil(total / 20)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                ถัดไป
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold mb-4">ปฏิเสธคอร์ส</h2>
            <p className="text-gray-600 mb-4">
              คุณกำลังจะปฏิเสธคอร์ส: <strong>{selectedCourse?.title}</strong>
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                เหตุผลในการปฏิเสธ
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                className="input"
                placeholder="กรุณาระบุเหตุผล..."
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="btn btn-secondary"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleReject}
                className="btn bg-red-600 text-white hover:bg-red-700"
              >
                ปฏิเสธ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
