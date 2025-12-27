import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  PlayCircleIcon,
  BookOpenIcon,
  StarIcon,
  CheckCircleIcon,
  LockClosedIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/solid';
import { Disclosure } from '@headlessui/react';
import toast from 'react-hot-toast';
import { courseApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Course, Review } from '../types';

export default function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, hasRole } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    if (slug) {
      loadCourse();
    }
  }, [slug]);

  const loadCourse = async () => {
    try {
      const [courseRes, reviewsRes] = await Promise.all([
        courseApi.getBySlug(slug!),
        courseApi.getReviews(slug!, { limit: 5 }),
      ]);
      setCourse(courseRes.data.data);
      setReviews(reviewsRes.data.data);
    } catch (error) {
      console.error('Error loading course:', error);
      navigate('/courses');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!hasRole(['STUDENT'])) {
      toast.error('เฉพาะนักเรียนเท่านั้นที่สามารถลงทะเบียนได้');
      return;
    }

    setEnrolling(true);
    try {
      await courseApi.enroll(course!.id);
      toast.success('ลงทะเบียนสำเร็จ');
      navigate(`/learn/${course!.slug}`);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'เกิดข้อผิดพลาด');
    } finally {
      setEnrolling(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours} ชม. ${minutes} นาที`;
    }
    return `${minutes} นาที`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="lg:flex lg:gap-12">
            <div className="lg:flex-1">
              <div className="text-primary-400 text-sm font-medium mb-2">
                {course.category.name}
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-gray-300 mb-6">{course.shortDescription || course.description.slice(0, 200)}</p>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                {course.statistics && (
                  <>
                    <div className="flex items-center">
                      <StarIcon className="h-5 w-5 text-yellow-400" />
                      <span className="ml-1 font-semibold">
                        {Number(course.statistics.averageRating).toFixed(1)}
                      </span>
                      <span className="ml-1 text-gray-400">
                        ({course.statistics.totalReviews} รีวิว)
                      </span>
                    </div>
                    <span className="text-gray-400">
                      {course.statistics.totalEnrollments} คนลงทะเบียน
                    </span>
                  </>
                )}
              </div>

              {/* Instructor */}
              <div className="flex items-center">
                <div className="h-10 w-10 bg-gray-700 rounded-full flex items-center justify-center">
                  {course.instructor.avatarUrl ? (
                    <img
                      src={course.instructor.avatarUrl}
                      alt={course.instructor.firstName}
                      className="h-10 w-10 rounded-full"
                    />
                  ) : (
                    <span className="text-lg font-semibold">
                      {course.instructor.firstName[0]}
                    </span>
                  )}
                </div>
                <div className="ml-3">
                  <p className="font-medium">
                    {course.instructor.firstName} {course.instructor.lastName}
                  </p>
                  <p className="text-sm text-gray-400">ผู้สอน</p>
                </div>
              </div>
            </div>

            {/* Sidebar Card */}
            <div className="lg:w-96 mt-8 lg:mt-0">
              <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                {course.thumbnailUrl && (
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="w-full aspect-video object-cover"
                  />
                )}
                <div className="p-6">
                  {/* Price */}
                  <div className="mb-4">
                    {course.discountPrice ? (
                      <div className="flex items-center gap-2">
                        <span className="text-3xl font-bold text-gray-900">
                          ฿{course.discountPrice.toLocaleString()}
                        </span>
                        <span className="text-lg text-gray-400 line-through">
                          ฿{course.price.toLocaleString()}
                        </span>
                      </div>
                    ) : course.price > 0 ? (
                      <span className="text-3xl font-bold text-gray-900">
                        ฿{course.price.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-3xl font-bold text-green-600">ฟรี</span>
                    )}
                  </div>

                  {/* CTA Button */}
                  {course.isEnrolled ? (
                    <button
                      onClick={() => navigate(`/learn/${course.slug}`)}
                      className="w-full btn btn-primary py-3 text-lg"
                    >
                      เข้าเรียน
                    </button>
                  ) : (
                    <button
                      onClick={handleEnroll}
                      disabled={enrolling}
                      className="w-full btn btn-primary py-3 text-lg disabled:opacity-50"
                    >
                      {enrolling ? 'กำลังลงทะเบียน...' : 'ลงทะเบียนเรียน'}
                    </button>
                  )}

                  {/* Course Info */}
                  <div className="mt-6 space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">ระยะเวลา</span>
                      <span className="font-medium">{formatDuration(course.totalDuration)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">บทเรียน</span>
                      <span className="font-medium">{course.totalLessons} บท</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">ระดับ</span>
                      <span className="font-medium">
                        {course.level === 'BEGINNER'
                          ? 'เริ่มต้น'
                          : course.level === 'INTERMEDIATE'
                          ? 'ปานกลาง'
                          : 'ขั้นสูง'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">ภาษา</span>
                      <span className="font-medium">ไทย</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:flex lg:gap-12">
          <div className="lg:flex-1">
            {/* What you'll learn */}
            {course.whatYouLearn && course.whatYouLearn.length > 0 && (
              <div className="bg-white rounded-xl shadow p-6 mb-8">
                <h2 className="text-xl font-bold mb-4">สิ่งที่คุณจะได้เรียนรู้</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {course.whatYouLearn.map((item, index) => (
                    <div key={index} className="flex items-start">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Curriculum */}
            {course.sections && course.sections.length > 0 && (
              <div className="bg-white rounded-xl shadow p-6 mb-8">
                <h2 className="text-xl font-bold mb-4">เนื้อหาคอร์ส</h2>
                <div className="space-y-2">
                  {course.sections.map((section) => (
                    <Disclosure key={section.id}>
                      {({ open }) => (
                        <>
                          <Disclosure.Button className="flex justify-between w-full px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                            <span className="font-medium">{section.title}</span>
                            <div className="flex items-center">
                              <span className="text-sm text-gray-500 mr-2">
                                {section.lessons.length} บทเรียน
                              </span>
                              <ChevronDownIcon
                                className={`h-5 w-5 text-gray-500 transition-transform ${
                                  open ? 'rotate-180' : ''
                                }`}
                              />
                            </div>
                          </Disclosure.Button>
                          <Disclosure.Panel className="px-4 pt-2 pb-4">
                            <ul className="space-y-2">
                              {section.lessons.map((lesson) => (
                                <li key={lesson.id} className="flex items-center justify-between py-2 border-b last:border-0">
                                  <div className="flex items-center">
                                    {lesson.type === 'VIDEO' ? (
                                      <PlayCircleIcon className="h-5 w-5 text-gray-400 mr-3" />
                                    ) : lesson.type === 'QUIZ' ? (
                                      <BookOpenIcon className="h-5 w-5 text-gray-400 mr-3" />
                                    ) : (
                                      <BookOpenIcon className="h-5 w-5 text-gray-400 mr-3" />
                                    )}
                                    <span className="text-gray-700">{lesson.title}</span>
                                    {lesson.isFree && (
                                      <span className="ml-2 text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded">
                                        ฟรี
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center text-sm text-gray-500">
                                    {lesson.videoDuration && (
                                      <span>{Math.floor(lesson.videoDuration / 60)} นาที</span>
                                    )}
                                    {!course.isEnrolled && !lesson.isFree && (
                                      <LockClosedIcon className="h-4 w-4 ml-2" />
                                    )}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </Disclosure.Panel>
                        </>
                      )}
                    </Disclosure>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="bg-white rounded-xl shadow p-6 mb-8">
              <h2 className="text-xl font-bold mb-4">รายละเอียดคอร์ส</h2>
              <div className="prose max-w-none text-gray-700">
                <p className="whitespace-pre-line">{course.description}</p>
              </div>
            </div>

            {/* Requirements */}
            {course.requirements && course.requirements.length > 0 && (
              <div className="bg-white rounded-xl shadow p-6 mb-8">
                <h2 className="text-xl font-bold mb-4">ความต้องการเบื้องต้น</h2>
                <ul className="space-y-2">
                  {course.requirements.map((req, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-gray-400 mr-2">•</span>
                      <span className="text-gray-700">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Reviews */}
            {reviews.length > 0 && (
              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-xl font-bold mb-4">รีวิวจากผู้เรียน</h2>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b pb-4 last:border-0">
                      <div className="flex items-start">
                        <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                          {review.user.avatarUrl ? (
                            <img
                              src={review.user.avatarUrl}
                              alt={review.user.firstName}
                              className="h-10 w-10 rounded-full"
                            />
                          ) : (
                            <span className="font-medium">
                              {review.user.firstName[0]}
                            </span>
                          )}
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">
                              {review.user.firstName} {review.user.lastName}
                            </p>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <StarIcon
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating ? 'text-yellow-400' : 'text-gray-200'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          {review.comment && (
                            <p className="text-gray-600 mt-1">{review.comment}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
