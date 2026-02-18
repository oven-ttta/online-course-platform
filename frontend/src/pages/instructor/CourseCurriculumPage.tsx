import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  QuestionMarkCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { courseApi, lessonApi } from "../../services/api";
import toast from "react-hot-toast";

export default function CourseCurriculumPage() {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Section states
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<any>(null);
  const [sectionTitle, setSectionTitle] = useState("");

  // Lesson states
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<any>(null);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [lessonFormData, setLessonFormData] = useState({
    title: "",
    type: "VIDEO",
    content: "",
    videoUrl: "",
    videoDuration: 0,
    isFree: false,
  });

  useEffect(() => {
    loadCourseData();
  }, [id]);

  const loadCourseData = async () => {
    try {
      let response;
      try {
        response = await courseApi.getBySlug(id!);
      } catch (e) {
        response = await courseApi.getById(id!);
      }
      setCourse(response.data.data);
    } catch (error) {
      console.error("Error loading course:", error);
      toast.error("ไม่สามารถโหลดข้อมูลคอร์สได้");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSectionModal = (section: any = null) => {
    setEditingSection(section);
    setSectionTitle(section ? section.title : "");
    setIsSectionModalOpen(true);
  };

  const handleSaveSection = async () => {
    try {
      if (editingSection) {
        await lessonApi.updateSection(editingSection.id, {
          title: sectionTitle,
        });
        toast.success("อัปเดตส่วนสำเร็จ");
      } else {
        await lessonApi.createSection(course.id, { title: sectionTitle });
        toast.success("เพิ่มส่วนใหม่สำเร็จ");
      }
      setIsSectionModalOpen(false);
      loadCourseData();
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการบันทึกส่วน");
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm("คุณแน่ใจว่าต้องการลบส่วนนี้และบทเรียนทั้งหมดภายใน?")) return;
    try {
      await lessonApi.deleteSection(sectionId);
      toast.success("ลบส่วนสำเร็จ");
      loadCourseData();
    } catch (error) {
      toast.error("ไม่สามารถลบส่วนได้");
    }
  };

  const handleOpenLessonModal = (sectionId: string, lesson: any = null) => {
    setActiveSectionId(sectionId);
    setEditingLesson(lesson);
    if (lesson) {
      setLessonFormData({
        title: lesson.title,
        type: lesson.type,
        content: lesson.content || "",
        videoUrl: lesson.videoUrl || "",
        videoDuration: lesson.videoDuration || 0,
        isFree: lesson.isFree || false,
      });
    } else {
      setLessonFormData({
        title: "",
        type: "VIDEO",
        content: "",
        videoUrl: "",
        videoDuration: 0,
        isFree: false,
      });
    }
    setIsLessonModalOpen(true);
  };

  const handleSaveLesson = async () => {
    try {
      const payload = {
        ...lessonFormData,
        courseId: course.id,
      };

      if (editingLesson) {
        await lessonApi.updateLesson(editingLesson.id, payload);
        toast.success("อัปเดตบทเรียนสำเร็จ");
      } else if (activeSectionId) {
        await lessonApi.createLesson(activeSectionId, payload);
        toast.success("เพิ่มบทเรียนใหม่สำเร็จ");
      }
      setIsLessonModalOpen(false);
      loadCourseData();
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการบันทึกบทเรียน");
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("คุณแน่ใจว่าต้องการลบบทเรียนนี้?")) return;
    try {
      await lessonApi.deleteLesson(lessonId);
      toast.success("ลบบทเรียนสำเร็จ");
      loadCourseData();
    } catch (error) {
      toast.error("ไม่สามารถลบบทเรียนได้");
    }
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case "VIDEO":
        return <VideoCameraIcon className="h-4 w-4 text-blue-500" />;
      case "TEXT":
        return <DocumentTextIcon className="h-4 w-4 text-green-500" />;
      case "QUIZ":
        return <QuestionMarkCircleIcon className="h-4 w-4 text-purple-500" />;
      default:
        return <DocumentTextIcon className="h-4 w-4" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <nav className="flex mb-2" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-sm text-gray-500">
              <li>
                <Link
                  to="/instructor/courses"
                  className="hover:text-primary-600"
                >
                  คอร์สของฉัน
                </Link>
              </li>
              <li>
                <span className="mx-2">/</span>
              </li>
              <li className="font-medium text-gray-900 truncate max-w-[200px]">
                {course?.title}
              </li>
            </ol>
          </nav>
          <h1 className="text-2xl font-bold text-gray-900">
            จัดการเนื้อหาคอร์ส
          </h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => handleOpenSectionModal()}
            className="btn btn-primary"
          >
            <PlusIcon className="h-5 w-5 mr-1" /> เพิ่มส่วนใหม่
          </button>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl" />
          ))}
        </div>
      ) : course?.sections?.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center border-2 border-dashed border-gray-200">
          <p className="text-gray-500 mb-4">ยังไม่ได้เริ่มสร้างเนื้อหา</p>
          <button
            onClick={() => handleOpenSectionModal()}
            className="btn btn-primary"
          >
            เริ่มสร้างส่วนแรกของคุณ
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {course?.sections?.map((section: any) => (
            <div
              key={section.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="px-5 py-4 bg-gray-50 flex items-center justify-between border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <h3 className="font-bold text-gray-900">{section.title}</h3>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenSectionModal(section)}
                    className="p-1.5 text-gray-500 hover:text-primary-600 transition-colors"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteSection(section.id)}
                    className="p-1.5 text-gray-500 hover:text-red-600 transition-colors"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                {section.lessons?.map((lesson: any) => (
                  <div
                    key={lesson.id}
                    className="px-5 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {getLessonIcon(lesson.type)}
                      <span className="text-sm font-medium text-gray-700">
                        {lesson.title}
                      </span>
                      {lesson.isFree && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full font-bold">
                          FREE
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity">
                      <button
                        onClick={() =>
                          handleOpenLessonModal(section.id, lesson)
                        }
                        className="p-1 text-gray-400 hover:text-primary-600"
                      >
                        <PencilIcon className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteLesson(lesson.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-5 py-3 border-t border-gray-50">
                <button
                  onClick={() => handleOpenLessonModal(section.id)}
                  className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1.5"
                >
                  <PlusIcon className="h-4 w-4" /> เพิ่มบทเรียนในส่วนนี้
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Section Modal */}
      {isSectionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">
                {editingSection ? "แก้ไขชื่อส่วนคอร์ส" : "เพิ่มส่วนคอร์สใหม่"}
              </h3>
              <button onClick={() => setIsSectionModalOpen(false)}>
                <XMarkIcon className="h-6 w-6 text-gray-400" />
              </button>
            </div>
            <div className="p-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">
                ชื่อส่วนเนื้อหา
              </label>
              <input
                className="input focus:ring-primary-500"
                placeholder="เช่น พื้นฐานการใช้งาน, บทที่ 1..."
                value={sectionTitle}
                onChange={(e) => setSectionTitle(e.target.value)}
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-3 p-6 bg-gray-50 rounded-b-2xl">
              <button
                onClick={() => setIsSectionModalOpen(false)}
                className="btn btn-secondary"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSaveSection}
                className="btn btn-primary px-8"
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lesson Modal */}
      {isLessonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">
                {editingLesson ? "แก้ไขบทเรียน" : "เพิ่มบทเรียนใหม่"}
              </h3>
              <button onClick={() => setIsLessonModalOpen(false)}>
                <XMarkIcon className="h-6 w-6 text-gray-400" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    ชื่อบทเรียน
                  </label>
                  <input
                    className="input"
                    value={lessonFormData.title}
                    onChange={(e) =>
                      setLessonFormData({
                        ...lessonFormData,
                        title: e.target.value,
                      })
                    }
                    placeholder="ระบุชื่อบทเรียนของคุณ"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    ประเภทเนื้อหา
                  </label>
                  <select
                    className="input"
                    value={lessonFormData.type}
                    onChange={(e) =>
                      setLessonFormData({
                        ...lessonFormData,
                        type: e.target.value,
                      })
                    }
                  >
                    <option value="VIDEO">วิดีโอ (Video)</option>
                    <option value="TEXT">บทความ (Text)</option>
                    <option value="QUIZ">แบบฝึกหัด (Quiz)</option>
                  </select>
                </div>
                {lessonFormData.type === "VIDEO" && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      ความยาว (วินาที)
                    </label>
                    <input
                      type="number"
                      className="input"
                      value={lessonFormData.videoDuration}
                      onChange={(e) =>
                        setLessonFormData({
                          ...lessonFormData,
                          videoDuration: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                )}
              </div>

              {lessonFormData.type === "VIDEO" ? (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    URL วิดีโอ
                  </label>
                  <input
                    className="input"
                    value={lessonFormData.videoUrl}
                    onChange={(e) =>
                      setLessonFormData({
                        ...lessonFormData,
                        videoUrl: e.target.value,
                      })
                    }
                    placeholder="Vimeo, YouTube or direct URL"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    เนื้อหา
                  </label>
                  <textarea
                    rows={6}
                    className="input"
                    value={lessonFormData.content}
                    onChange={(e) =>
                      setLessonFormData({
                        ...lessonFormData,
                        content: e.target.value,
                      })
                    }
                    placeholder="พิมพ์เนื้อหาบทเรียนที่นี่..."
                  />
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isFree"
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  checked={lessonFormData.isFree}
                  onChange={(e) =>
                    setLessonFormData({
                      ...lessonFormData,
                      isFree: e.target.checked,
                    })
                  }
                />
                <label
                  htmlFor="isFree"
                  className="text-sm font-medium text-gray-700"
                >
                  เปิดให้ดูฟรี (Preview)
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 bg-gray-50 rounded-b-2xl">
              <button
                onClick={() => setIsLessonModalOpen(false)}
                className="btn btn-secondary"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSaveLesson}
                className="btn btn-primary px-8"
              >
                บันทึกบทเรียน
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
