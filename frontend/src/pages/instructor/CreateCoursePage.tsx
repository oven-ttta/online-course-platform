import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { courseApi, categoryApi, uploadApi } from '../../services/api';
import { Category } from '../../types';
import toast from 'react-hot-toast';

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

export default function CreateCoursePage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CourseForm>();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await categoryApi.getAll();
      setCategories(response.data.data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('กรุณาเลือกไฟล์รูปภาพ');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('ไฟล์ต้องมีขนาดไม่เกิน 5MB');
        return;
      }
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const removeThumbnail = () => {
    setThumbnail(null);
    setThumbnailPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data: CourseForm) => {
    setIsSubmitting(true);
    try {
      let thumbnailUrl = '';

      // Upload thumbnail first if exists
      if (thumbnail) {
        setUploadingThumbnail(true);
        try {
          const uploadResponse = await uploadApi.uploadThumbnail(thumbnail);
          thumbnailUrl = uploadResponse.data.data.url;
        } catch (uploadError) {
          toast.error('อัปโหลดรูปภาพล้มเหลว');
          setUploadingThumbnail(false);
          setIsSubmitting(false);
          return;
        }
        setUploadingThumbnail(false);
      }

      const courseData = {
        ...data,
        categoryId: Number(data.categoryId),
        price: Number(data.price),
        discountPrice: data.discountPrice ? Number(data.discountPrice) : undefined,
        requirements: data.requirements ? data.requirements.split('\n').filter((r) => r.trim()) : [],
        whatYouLearn: data.whatYouLearn ? data.whatYouLearn.split('\n').filter((w) => w.trim()) : [],
        thumbnailUrl,
      };

      await courseApi.create(courseData);
      toast.success('สร้างคอร์สสำเร็จ');
      navigate('/instructor/courses');
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'เกิดข้อผิดพลาด');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">สร้างคอร์สใหม่</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-xl shadow p-6 space-y-6">
          <h2 className="text-lg font-semibold border-b pb-4">ข้อมูลพื้นฐาน</h2>

          {/* Thumbnail Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              รูปปกคอร์ส
            </label>
            <div className="flex items-start gap-4">
              <div
                className={`relative w-48 h-28 border-2 border-dashed rounded-lg overflow-hidden flex items-center justify-center cursor-pointer hover:border-primary-500 transition-colors ${
                  thumbnailPreview ? 'border-transparent' : 'border-gray-300'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                {thumbnailPreview ? (
                  <>
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeThumbnail();
                      }}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <PhotoIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">คลิกเพื่อเลือกรูป</p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                className="hidden"
              />
              <div className="text-sm text-gray-500">
                <p>รูปแบบ: JPG, PNG, GIF, WebP</p>
                <p>ขนาดแนะนำ: 1280x720 px</p>
                <p>ขนาดไฟล์สูงสุด: 5MB</p>
              </div>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ชื่อคอร์ส *
            </label>
            <input
              type="text"
              {...register('title', { required: 'กรุณากรอกชื่อคอร์ส' })}
              className="input"
              placeholder="เช่น React Complete Guide 2024"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Short Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              คำอธิบายสั้น
            </label>
            <input
              type="text"
              {...register('shortDescription')}
              className="input"
              placeholder="คำอธิบายสั้นๆ เกี่ยวกับคอร์ส"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              รายละเอียดคอร์ส *
            </label>
            <textarea
              {...register('description', { required: 'กรุณากรอกรายละเอียด' })}
              rows={6}
              className="input"
              placeholder="อธิบายรายละเอียดของคอร์ส..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              หมวดหมู่ *
            </label>
            <select
              {...register('categoryId', { required: 'กรุณาเลือกหมวดหมู่' })}
              className="input"
            >
              <option value="">เลือกหมวดหมู่</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>
            )}
          </div>

          {/* Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ระดับ
            </label>
            <select {...register('level')} className="input">
              <option value="BEGINNER">เริ่มต้น</option>
              <option value="INTERMEDIATE">ปานกลาง</option>
              <option value="ADVANCED">ขั้นสูง</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 space-y-6">
          <h2 className="text-lg font-semibold border-b pb-4">ราคา</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ราคา (บาท) *
              </label>
              <input
                type="number"
                {...register('price', {
                  required: 'กรุณากรอกราคา',
                  min: { value: 0, message: 'ราคาต้องไม่ติดลบ' },
                })}
                className="input"
                placeholder="0"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ราคาลด (บาท)
              </label>
              <input
                type="number"
                {...register('discountPrice', {
                  min: { value: 0, message: 'ราคาต้องไม่ติดลบ' },
                })}
                className="input"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 space-y-6">
          <h2 className="text-lg font-semibold border-b pb-4">ข้อมูลเพิ่มเติม</h2>

          {/* Requirements */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ความต้องการเบื้องต้น (บรรทัดละข้อ)
            </label>
            <textarea
              {...register('requirements')}
              rows={4}
              className="input"
              placeholder="พื้นฐาน HTML, CSS&#10;ความรู้ JavaScript เบื้องต้น"
            />
          </div>

          {/* What you'll learn */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              สิ่งที่จะได้เรียนรู้ (บรรทัดละข้อ)
            </label>
            <textarea
              {...register('whatYouLearn')}
              rows={4}
              className="input"
              placeholder="เข้าใจ React.js ตั้งแต่พื้นฐาน&#10;สร้าง Single Page Application"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/instructor/courses')}
            className="btn btn-secondary"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary disabled:opacity-50"
          >
            {uploadingThumbnail
              ? 'กำลังอัปโหลดรูป...'
              : isSubmitting
              ? 'กำลังสร้าง...'
              : 'สร้างคอร์ส'}
          </button>
        </div>
      </form>
    </div>
  );
}
