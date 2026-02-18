import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { PhotoIcon } from "@heroicons/react/24/outline";
import { courseApi, categoryApi, uploadApi } from "../../services/api";
import { Category } from "../../types";
import toast from "react-hot-toast";

interface CourseForm {
  title: string;
  description: string;
  shortDescription: string;
  categoryId: number;
  price: number;
  discountPrice?: number;
  level: string;
  requirements: string;
  whatYouLearn: string;
}

export default function EditCoursePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [newThumbnail, setNewThumbnail] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, setValue } = useForm<CourseForm>();

  useEffect(() => {
    loadInitialData();
  }, [id]);

  const loadInitialData = async () => {
    try {
      const [categoriesRes, courseRes] = await Promise.all([
        categoryApi.getAll(),
        courseApi.getBySlug(id!), // Route often accepts ID or Slug as param
      ]);

      setCategories(categoriesRes.data.data);
      const course = courseRes.data.data;

      // Populate form
      setValue("title", course.title);
      setValue("description", course.description);
      setValue("shortDescription", course.shortDescription || "");
      setValue("categoryId", course.categoryId);
      setValue("price", course.price);
      setValue("discountPrice", course.discountPrice);
      setValue("level", course.level);
      setValue("requirements", course.requirements?.join("\n") || "");
      setValue("whatYouLearn", course.whatYouLearn?.join("\n") || "");

      setThumbnailPreview(course.thumbnailUrl);
      setLoading(false);
    } catch (error) {
      console.error("Error loading course data:", error);
      toast.error("ไม่สามารถโหลดข้อมูลคอร์สได้");
      navigate("/instructor/courses");
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("กรุณาเลือกไฟล์รูปภาพ");
        return;
      }
      setNewThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: CourseForm) => {
    setIsSubmitting(true);
    try {
      let thumbnailUrl = thumbnailPreview;

      if (newThumbnail) {
        const uploadResponse = await uploadApi.uploadThumbnail(newThumbnail);
        thumbnailUrl = uploadResponse.data.data.url;
      }

      const courseData = {
        ...data,
        categoryId: Number(data.categoryId),
        price: Number(data.price),
        discountPrice: data.discountPrice ? Number(data.discountPrice) : null,
        requirements:
          data.requirements?.split("\n").filter((r) => r.trim()) || [],
        whatYouLearn:
          data.whatYouLearn?.split("\n").filter((w) => w.trim()) || [],
        thumbnailUrl,
      };

      await courseApi.update(id!, courseData);
      toast.success("อัปเดตคอร์สสำเร็จ");
      navigate("/instructor/courses");
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || "เกิดข้อผิดพลาด");
    } finally {
      setIsSubmitting(false);
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
    <div className="max-w-3xl mx-auto py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">แก้ไขคอร์ส</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-xl shadow p-6 space-y-6">
          <h2 className="text-lg font-semibold border-b pb-4">ข้อมูลพื้นฐาน</h2>

          {/* Thumbnail */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              รูปปกคอร์ส
            </label>
            <div className="flex items-start gap-4">
              <div
                className="relative w-48 h-28 border rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity bg-gray-50 flex items-center justify-center"
                onClick={() => fileInputRef.current?.click()}
              >
                {thumbnailPreview ? (
                  <img
                    src={thumbnailPreview}
                    className="w-full h-full object-cover"
                    alt=""
                  />
                ) : (
                  <PhotoIcon className="h-8 w-8 text-gray-400" />
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
                  <p className="text-xs text-white font-bold">เปลี่ยนรูป</p>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleThumbnailChange}
              />
              <div className="text-xs text-gray-400">
                <p>แนะนำขนาด 1280x720 (16:9)</p>
                <p>ขนาดไฟล์ไม่เกิน 5MB</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ชื่อคอร์ส *
            </label>
            <input
              {...register("title", { required: true })}
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              คำอธิบายสั้น
            </label>
            <input {...register("shortDescription")} className="input" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              รายละเอียดคอร์ส
            </label>
            <textarea {...register("description")} rows={6} className="input" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                หมวดหมู่
              </label>
              <select {...register("categoryId")} className="input">
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ระดับ
              </label>
              <select {...register("level")} className="input">
                <option value="BEGINNER">เริ่มต้น</option>
                <option value="INTERMEDIATE">ปานกลาง</option>
                <option value="ADVANCED">ขั้นสูง</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 space-y-6">
          <h2 className="text-lg font-semibold border-b pb-4">การตั้งราคา</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ราคา (บาท)
              </label>
              <input type="number" {...register("price")} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ราคาลด (ถ้ามี)
              </label>
              <input
                type="number"
                {...register("discountPrice")}
                className="input"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 space-y-6">
          <h2 className="text-lg font-semibold border-b pb-4">
            เป้าหมายและข้อกำหนด
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              สิ่งที่ผู้เรียนจะได้รับ (บรรทัดละข้อ)
            </label>
            <textarea
              {...register("whatYouLearn")}
              rows={4}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ข้อกำหนดพื้นฐาน (บรรทัดละข้อ)
            </label>
            <textarea
              {...register("requirements")}
              rows={4}
              className="input"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/instructor/courses")}
            className="btn btn-secondary"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary px-10"
          >
            {isSubmitting ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
          </button>
        </div>
      </form>
    </div>
  );
}
