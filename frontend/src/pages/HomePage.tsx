import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AcademicCapIcon,
  PlayCircleIcon,
  UserGroupIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { courseApi, categoryApi } from '../services/api';
import { Course, Category } from '../types';
import CourseCard from '../components/features/CourseCard';

export default function HomePage() {
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [coursesRes, categoriesRes] = await Promise.all([
        courseApi.getFeatured(6),
        categoryApi.getAll(),
      ]);
      setFeaturedCourses(coursesRes.data.data);
      setCategories(categoriesRes.data.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { icon: AcademicCapIcon, value: '1,000+', label: 'คอร์สเรียน' },
    { icon: UserGroupIcon, value: '50,000+', label: 'นักเรียน' },
    { icon: PlayCircleIcon, value: '10,000+', label: 'บทเรียน' },
    { icon: StarIcon, value: '4.8', label: 'คะแนนเฉลี่ย' },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-3xl">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              เรียนรู้ทักษะใหม่ๆ
              <br />
              จากผู้เชี่ยวชาญ
            </h1>
            <p className="text-lg text-primary-100 mb-8">
              แพลตฟอร์มเรียนออนไลน์ที่รวบรวมคอร์สคุณภาพจากผู้สอนมืออาชีพ
              เรียนได้ทุกที่ทุกเวลา พร้อมใบประกาศนียบัตรเมื่อเรียนจบ
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/courses" className="btn bg-white text-primary-600 hover:bg-gray-100 px-6 py-3">
                เริ่มเรียนเลย
              </Link>
              <Link to="/register" className="btn border-2 border-white text-white hover:bg-white hover:text-primary-600 px-6 py-3">
                สมัครฟรี
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-12 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <stat.icon className="h-10 w-10 mx-auto text-primary-600 mb-3" />
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              หมวดหมู่ยอดนิยม
            </h2>
            <p className="text-gray-600">
              เลือกเรียนในสาขาที่คุณสนใจ
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.slice(0, 5).map((category) => (
              <Link
                key={category.id}
                to={`/courses?category=${category.slug}`}
                className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-shadow"
              >
                <div className="h-12 w-12 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
                  <AcademicCapIcon className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-900">{category.name}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {category._count?.courses || 0} คอร์ส
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">คอร์สแนะนำ</h2>
              <p className="text-gray-600 mt-2">คอร์สยอดนิยมที่คัดสรรมาเพื่อคุณ</p>
            </div>
            <Link
              to="/courses"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              ดูทั้งหมด &rarr;
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-xl" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            พร้อมที่จะเริ่มเรียนหรือยัง?
          </h2>
          <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
            เข้าร่วมกับนักเรียนกว่า 50,000 คนที่เลือกเรียนกับเรา
            สมัครวันนี้และเริ่มต้นเส้นทางการเรียนรู้ของคุณ
          </p>
          <Link
            to="/register"
            className="btn bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 text-lg"
          >
            เริ่มต้นเรียนฟรี
          </Link>
        </div>
      </section>
    </div>
  );
}
