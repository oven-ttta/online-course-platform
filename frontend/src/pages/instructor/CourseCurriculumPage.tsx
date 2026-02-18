import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import { courseApi, lessonApi } from "../../services/api";
import toast from "react-hot-toast";

export default function CourseCurriculumPage() {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<any>(null);
  const [sectionTitle, setSectionTitle] = useState("");

  useEffect(() => {
    loadCourseData();
  }, [id]);

  const loadCourseData = async () => {
    try {
      // We need a specific endpoint to get full course detail with sections/lessons for owner
      // For now, use a generic getBySlug or find a way to get by ID
      const response = await courseApi.getAll({ search: id }); // Placeholder/Hack
      // Real implementation would use courseApi.getById(id)
      setCourse(response.data.data[0]);
    } catch (error) {
      console.error("Error loading course:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSection = async () => {
    try {
      await lessonApi.createSection(id!, { title: sectionTitle });
      toast.success("เพิ่มหมวดหมู่สำเร็จ");
      setIsSectionModalOpen(false);
      loadCourseData();
    } catch (error) {
      toast.error("เกิดข้อผิดพลาด");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">เนื้อหาคอร์ส</h1>
          <p className="text-gray-500">{course?.title}</p>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/instructor/courses/edit/${id}`}
            className="btn btn-secondary"
          >
            แก้ไขข้อมูลหลัก
          </Link>
          <button
            onClick={() => setIsSectionModalOpen(true)}
            className="btn btn-primary"
          >
            <PlusIcon className="h-5 w-5 mr-1" /> เพิ่มส่วนใหม่
          </button>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {course?.sections?.map((section: any) => (
            <div
              key={section.id}
              className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden"
            >
              <div className="p-4 bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-gray-900">{section.title}</h3>
                </div>
                <div className="flex gap-2">
                  <button className="p-1 hover:text-primary-600">
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button className="p-1 hover:text-red-600">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                {/* Lessons List would go here */}
                <button className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center">
                  <PlusIcon className="h-4 w-4 mr-1" /> เพิ่มบทเรียน
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Section Modal placeholder */}
      {isSectionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">เพิ่มส่วนใหม่</h3>
            <input
              className="input mb-4"
              placeholder="ชื่อส่วน (เช่น พื้นฐานการเขียนโปรแกรม)"
              value={sectionTitle}
              onChange={(e) => setSectionTitle(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsSectionModalOpen(false)}
                className="btn btn-secondary"
              >
                ยกเลิก
              </button>
              <button onClick={handleAddSection} className="btn btn-primary">
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
