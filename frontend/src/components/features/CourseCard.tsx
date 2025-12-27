import { Link } from 'react-router-dom';
import { StarIcon, ClockIcon, BookOpenIcon } from '@heroicons/react/24/solid';
import { Course } from '../../types';

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours} ชม. ${minutes} นาที`;
    }
    return `${minutes} นาที`;
  };

  const formatPrice = (price: number) => {
    if (price === 0) return 'ฟรี';
    return `฿${price.toLocaleString()}`;
  };

  return (
    <Link to={`/courses/${course.slug}`} className="card card-hover group">
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={course.thumbnailUrl || 'https://placehold.co/400x225/e2e8f0/64748b?text=Course'}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {course.isFeatured && (
          <span className="absolute top-3 left-3 bg-yellow-500 text-white text-xs font-medium px-2 py-1 rounded">
            แนะนำ
          </span>
        )}
        <span className="absolute top-3 right-3 bg-white/90 text-gray-700 text-xs font-medium px-2 py-1 rounded">
          {course.level === 'BEGINNER'
            ? 'เริ่มต้น'
            : course.level === 'INTERMEDIATE'
            ? 'ปานกลาง'
            : 'ขั้นสูง'}
        </span>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Category */}
        <p className="text-xs text-primary-600 font-medium mb-2">
          {course.category.name}
        </p>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {course.title}
        </h3>

        {/* Instructor */}
        <p className="text-sm text-gray-500 mb-3">
          โดย {course.instructor.firstName} {course.instructor.lastName}
        </p>

        {/* Stats */}
        <div className="flex items-center text-sm text-gray-500 mb-3 space-x-4">
          <div className="flex items-center">
            <ClockIcon className="h-4 w-4 mr-1" />
            {formatDuration(course.totalDuration)}
          </div>
          <div className="flex items-center">
            <BookOpenIcon className="h-4 w-4 mr-1" />
            {course.totalLessons} บทเรียน
          </div>
        </div>

        {/* Rating */}
        {course.statistics && (
          <div className="flex items-center mb-3">
            <StarIcon className="h-5 w-5 text-yellow-400" />
            <span className="ml-1 font-medium text-gray-900">
              {Number(course.statistics.averageRating).toFixed(1)}
            </span>
            <span className="ml-1 text-sm text-gray-500">
              ({course.statistics.totalReviews} รีวิว)
            </span>
            <span className="ml-2 text-sm text-gray-400">
              {course.statistics.totalEnrollments} คนเรียน
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div>
            {course.discountPrice ? (
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-primary-600">
                  {formatPrice(course.discountPrice)}
                </span>
                <span className="text-sm text-gray-400 line-through">
                  {formatPrice(course.price)}
                </span>
              </div>
            ) : (
              <span className="text-lg font-bold text-primary-600">
                {formatPrice(course.price)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
