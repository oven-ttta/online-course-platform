import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { EyeIcon, EyeSlashIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
}

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register: registerUser, isAuthenticated } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    defaultValues: {
      role: 'STUDENT',
    },
  });

  const password = watch('password');

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (data: RegisterForm) => {
    setIsSubmitting(true);
    try {
      await registerUser({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
      });
    } catch (error) {
      // Error handled in AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2">
            <AcademicCapIcon className="h-10 w-10 text-primary-600" />
            <span className="text-2xl font-bold text-gray-900">CourseHub</span>
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">สมัครสมาชิก</h2>
          <p className="mt-2 text-gray-600">
            มีบัญชีแล้ว?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              เข้าสู่ระบบ
            </Link>
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  ชื่อ
                </label>
                <input
                  id="firstName"
                  type="text"
                  {...register('firstName', { required: 'กรุณากรอกชื่อ' })}
                  className="input"
                  placeholder="ชื่อ"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  นามสกุล
                </label>
                <input
                  id="lastName"
                  type="text"
                  {...register('lastName', { required: 'กรุณากรอกนามสกุล' })}
                  className="input"
                  placeholder="นามสกุล"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                อีเมล
              </label>
              <input
                id="email"
                type="email"
                {...register('email', {
                  required: 'กรุณากรอกอีเมล',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'รูปแบบอีเมลไม่ถูกต้อง',
                  },
                })}
                className="input"
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                รหัสผ่าน
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', {
                    required: 'กรุณากรอกรหัสผ่าน',
                    minLength: {
                      value: 8,
                      message: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร',
                    },
                    pattern: {
                      value: /\d/,
                      message: 'รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว',
                    },
                  })}
                  className="input pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                ยืนยันรหัสผ่าน
              </label>
              <input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword', {
                  required: 'กรุณายืนยันรหัสผ่าน',
                  validate: (value) => value === password || 'รหัสผ่านไม่ตรงกัน',
                })}
                className="input"
                placeholder="••••••••"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                คุณต้องการ
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="relative flex cursor-pointer">
                  <input
                    type="radio"
                    value="STUDENT"
                    {...register('role')}
                    className="peer sr-only"
                  />
                  <div className="w-full p-4 border-2 rounded-lg peer-checked:border-primary-600 peer-checked:bg-primary-50 transition-colors">
                    <p className="font-medium text-gray-900">เรียน</p>
                    <p className="text-sm text-gray-500">เป็นนักเรียน</p>
                  </div>
                </label>
                <label className="relative flex cursor-pointer">
                  <input
                    type="radio"
                    value="INSTRUCTOR"
                    {...register('role')}
                    className="peer sr-only"
                  />
                  <div className="w-full p-4 border-2 rounded-lg peer-checked:border-primary-600 peer-checked:bg-primary-50 transition-colors">
                    <p className="font-medium text-gray-900">สอน</p>
                    <p className="text-sm text-gray-500">เป็นผู้สอน</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start">
              <input
                type="checkbox"
                required
                className="h-4 w-4 text-primary-600 rounded border-gray-300 mt-1"
              />
              <span className="ml-2 text-sm text-gray-600">
                ฉันยอมรับ{' '}
                <Link to="/terms" className="text-primary-600 hover:underline">
                  ข้อกำหนดการใช้งาน
                </Link>{' '}
                และ{' '}
                <Link to="/privacy" className="text-primary-600 hover:underline">
                  นโยบายความเป็นส่วนตัว
                </Link>
              </span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn btn-primary py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  กำลังสมัครสมาชิก...
                </span>
              ) : (
                'สมัครสมาชิก'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
