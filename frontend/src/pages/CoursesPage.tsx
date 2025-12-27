import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { courseApi, categoryApi } from '../services/api';
import { Course, Category } from '../types';
import CourseCard from '../components/features/CourseCard';

export default function CoursesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    level: searchParams.get('level') || '',
    sortBy: searchParams.get('sortBy') || 'newest',
    page: parseInt(searchParams.get('page') || '1'),
  });

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadCourses();
  }, [filters]);

  const loadCategories = async () => {
    try {
      const response = await categoryApi.getAll();
      setCategories(response.data.data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadCourses = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: filters.page,
        limit: 12,
        sortBy: filters.sortBy,
      };
      if (filters.search) params.search = filters.search;
      if (filters.category) {
        const category = categories.find((c) => c.slug === filters.category);
        if (category) params.categoryId = category.id;
      }
      if (filters.level) params.level = filters.level;

      const response = await courseApi.getAll(params);
      setCourses(response.data.data);
      setTotal(response.data.meta?.total || 0);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);

    const params = new URLSearchParams();
    if (newFilters.search) params.set('search', newFilters.search);
    if (newFilters.category) params.set('category', newFilters.category);
    if (newFilters.level) params.set('level', newFilters.level);
    if (newFilters.sortBy !== 'newest') params.set('sortBy', newFilters.sortBy);
    setSearchParams(params);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    handleFilterChange('search', filters.search);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">คอร์สเรียนทั้งหมด</h1>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="ค้นหาคอร์ส..."
              className="input pl-10"
            />
          </div>
          <button type="submit" className="btn btn-primary">
            ค้นหา
          </button>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-secondary flex items-center lg:hidden"
          >
            <FunnelIcon className="h-5 w-5 mr-2" />
            ตัวกรอง
          </button>
        </form>

        {/* Filters */}
        <div className={`lg:flex gap-4 ${showFilters ? 'block' : 'hidden lg:flex'}`}>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="input w-full lg:w-48"
          >
            <option value="">หมวดหมู่ทั้งหมด</option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>

          <select
            value={filters.level}
            onChange={(e) => handleFilterChange('level', e.target.value)}
            className="input w-full lg:w-48 mt-2 lg:mt-0"
          >
            <option value="">ทุกระดับ</option>
            <option value="BEGINNER">เริ่มต้น</option>
            <option value="INTERMEDIATE">ปานกลาง</option>
            <option value="ADVANCED">ขั้นสูง</option>
          </select>

          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="input w-full lg:w-48 mt-2 lg:mt-0"
          >
            <option value="newest">ใหม่ล่าสุด</option>
            <option value="popular">ยอดนิยม</option>
            <option value="rating">คะแนนสูง</option>
            <option value="price">ราคาต่ำ-สูง</option>
          </select>
        </div>
      </div>

      {/* Results */}
      <div className="mb-4 text-gray-600">
        พบ {total} คอร์ส
      </div>

      {/* Course Grid */}
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
      ) : courses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">ไม่พบคอร์สที่ค้นหา</p>
          <button
            onClick={() => {
              setFilters({ search: '', category: '', level: '', sortBy: 'newest', page: 1 });
              setSearchParams({});
            }}
            className="mt-4 text-primary-600 hover:text-primary-700"
          >
            ล้างตัวกรอง
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > 12 && (
        <div className="mt-8 flex justify-center">
          <nav className="flex items-center gap-2">
            <button
              onClick={() => handleFilterChange('page', String(filters.page - 1))}
              disabled={filters.page === 1}
              className="px-4 py-2 border rounded-lg disabled:opacity-50"
            >
              ก่อนหน้า
            </button>
            <span className="px-4 py-2">
              หน้า {filters.page} จาก {Math.ceil(total / 12)}
            </span>
            <button
              onClick={() => handleFilterChange('page', String(filters.page + 1))}
              disabled={filters.page >= Math.ceil(total / 12)}
              className="px-4 py-2 border rounded-lg disabled:opacity-50"
            >
              ถัดไป
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
