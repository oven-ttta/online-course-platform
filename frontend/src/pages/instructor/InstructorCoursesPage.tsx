import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline";
import { instructorApi, courseApi } from "../../services/api";
import toast from "react-hot-toast";

export default function InstructorCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadCourses();
  }, [filter]);

  const loadCourses = async () => {
    try {
      const params: any = {};
      if (filter !== "all") params.status = filter;

      const response = await instructorApi.getCourses(params);
      setCourses(response.data.data);
    } catch (error) {
      console.error("Error loading courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (courseId: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบคอร์สนี้?")) return;

    try {
      await courseApi.delete(courseId);
      toast.success("ลบคอร์สสำเร็จ");
      loadCourses();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || "เกิดข้อผิดพลาด");
    }
  };

  const handlePublish = async (courseId: string) => {
    try {
      await courseApi.publish(courseId);
      toast.success("ส่งคอร์สเพื่อตรวจสอบสำเร็จ");
      loadCourses();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || "เกิดข้อผิดพลาด");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">คอร์สของฉัน</h1>
        <Link to="/instructor/courses/create" className="btn btn-primary">
          <PlusIcon className="h-5 w-5 mr-2" />
          สร้างคอร์สใหม่
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {[
          { value: "all", label: "ทั้งหมด" },
          { value: "DRAFT", label: "แบบร่าง" },
          { value: "PENDING", label: "รอตรวจสอบ" },
          { value: "PUBLISHED", label: "เผยแพร่แล้ว" },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f.value
                ? "bg-primary-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow p-6 animate-pulse"
            >
              <div className="flex gap-4">
                <div className="w-40 h-24 bg-gray-200 rounded" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <p className="text-gray-500 mb-4">ยังไม่มีคอร์ส</p>
          <Link to="/instructor/courses/create" className="btn btn-primary">
            สร้างคอร์สแรกของคุณ
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-xl shadow p-6">
              <div className="flex gap-6">
                <div className="w-40 h-24 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                  {course.thumbnailUrl && (
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {course.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {course.category?.name}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        course.status === "PUBLISHED"
                          ? "bg-green-100 text-green-700"
                          : course.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-700"
                            : course.status === "REJECTED"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {course.status === "PUBLISHED"
                        ? "เผยแพร่"
                        : course.status === "PENDING"
                          ? "รอตรวจสอบ"
                          : course.status === "REJECTED"
                            ? "ถูกปฏิเสธ"
                            : "แบบร่าง"}
                    </span>
                  </div>

                  <div className="flex items-center gap-6 mt-3 text-sm text-gray-500">
                    <span>{course._count?.lessons || 0} บทเรียน</span>
                    <span>{course._count?.enrollments || 0} นักเรียน</span>
                    <span>฿{Number(course.price).toLocaleString()}</span>
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    {course.status === "DRAFT" && (
                      <button
                        onClick={() => handlePublish(course.id)}
                        className="btn btn-primary text-sm py-1"
                      >
                        ส่งตรวจสอบ
                      </button>
                    )}
                    <Link
                      to={`/courses/${course.slug}`}
                      className="btn btn-secondary text-sm py-1"
                    >
                      <EyeIcon className="h-4 w-4 mr-1" />
                      ดูตัวอย่าง
                    </Link>
                    <Link
                      to={`/instructor/courses/curriculum/${course.id}`}
                      className="btn btn-secondary text-sm py-1"
                    >
                      <VideoCameraIcon className="h-4 w-4 mr-1" />
                      เนื้อหาวิดีโอ/บทเรียน
                    </Link>
                    <Link
                      to={`/instructor/courses/edit/${course.id}`}
                      className="btn btn-secondary text-sm py-1"
                    >
                      <PencilIcon className="h-4 w-4 mr-1" />
                      แก้ไขข้อมูล
                    </Link>
                    {course.status === "DRAFT" && (
                      <button
                        onClick={() => handleDelete(course.id)}
                        className="btn text-sm py-1 text-red-600 hover:bg-red-50"
                      >
                        <TrashIcon className="h-4 w-4 mr-1" />
                        ลบ
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
