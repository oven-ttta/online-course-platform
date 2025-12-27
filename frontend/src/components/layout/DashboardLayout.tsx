import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  BookOpenIcon,
  AcademicCapIcon,
  ChartBarIcon,
  UsersIcon,
  CurrencyDollarIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
  PlusIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from './Navbar';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const studentNavigation: NavItem[] = [
  { name: 'แดชบอร์ด', href: '/dashboard', icon: HomeIcon },
  { name: 'คอร์สของฉัน', href: '/dashboard/my-courses', icon: BookOpenIcon },
];

const instructorNavigation: NavItem[] = [
  { name: 'แดชบอร์ด', href: '/instructor', icon: HomeIcon },
  { name: 'คอร์สของฉัน', href: '/instructor/courses', icon: AcademicCapIcon },
  { name: 'สร้างคอร์ส', href: '/instructor/courses/create', icon: PlusIcon },
  { name: 'รายได้', href: '/instructor/earnings', icon: CurrencyDollarIcon },
];

const adminNavigation: NavItem[] = [
  { name: 'แดชบอร์ด', href: '/admin', icon: HomeIcon },
  { name: 'จัดการผู้ใช้', href: '/admin/users', icon: UsersIcon },
  { name: 'จัดการคอร์ส', href: '/admin/courses', icon: ClipboardDocumentListIcon },
  { name: 'รายงาน', href: '/admin/reports', icon: ChartBarIcon },
  { name: 'ตั้งค่า', href: '/admin/settings', icon: Cog6ToothIcon },
];

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  // Determine navigation based on current path
  let navigation: NavItem[] = studentNavigation;
  if (location.pathname.startsWith('/instructor')) {
    navigation = instructorNavigation;
  } else if (location.pathname.startsWith('/admin')) {
    navigation = adminNavigation;
  }

  const isActive = (href: string) => {
    if (href === '/dashboard' || href === '/instructor' || href === '/admin') {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="flex">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-50
            w-64 bg-white shadow-lg transform transition-transform duration-200
            lg:transform-none lg:translate-x-0
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          <div className="h-full flex flex-col pt-20 lg:pt-5">
            {/* Mobile close button */}
            <div className="lg:hidden absolute top-4 right-4">
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* User info */}
            <div className="px-4 py-4 border-b">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-primary-600 font-semibold">
                    {user?.firstName?.[0]}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.role === 'ADMIN'
                      ? 'ผู้ดูแลระบบ'
                      : user?.role === 'INSTRUCTOR'
                      ? 'ผู้สอน'
                      : 'นักเรียน'}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center px-3 py-2 rounded-lg text-sm font-medium
                    transition-colors duration-200
                    ${
                      isActive(item.href)
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-4 lg:p-8">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden mb-4 p-2 text-gray-600 hover:text-gray-900"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          <Outlet />
        </main>
      </div>
    </div>
  );
}
