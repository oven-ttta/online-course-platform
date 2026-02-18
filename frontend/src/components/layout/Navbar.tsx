import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  AcademicCapIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../contexts/AuthContext";
import { walletApi } from "../../services/api";
import { useEffect, useState as useReactState } from "react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [balance, setBalance] = useReactState<number | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadBalance();
    }
  }, [isAuthenticated, location.pathname]); // Update balance on navigation

  const loadBalance = async () => {
    try {
      const res = await walletApi.getBalance();
      setBalance(Number(res.data.data.balance));
    } catch (e) {
      console.error("Error fetching balance");
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <AcademicCapIcon className="h-8 w-8 text-primary-600" />
              <span className="font-bold text-xl text-gray-900">CourseHub</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              <Link
                to="/courses"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
              >
                คอร์สเรียน
              </Link>
              {hasRole("INSTRUCTOR") && (
                <Link
                  to="/instructor"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                >
                  ผู้สอน
                </Link>
              )}
              {hasRole("ADMIN") && (
                <Link
                  to="/admin"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                >
                  จัดการระบบ
                </Link>
              )}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && (
              <Link
                to="/dashboard/wallet"
                className="hidden sm:flex items-center px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full text-sm font-bold border border-primary-100 hover:bg-primary-100 transition-colors"
              >
                <span className="mr-1">฿</span>
                {balance !== null ? balance.toLocaleString() : "..."}
              </Link>
            )}
            {isAuthenticated ? (
              <Menu as="div" className="relative ml-3">
                <Menu.Button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.firstName}
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <UserCircleIcon className="h-8 w-8" />
                  )}
                  <span className="hidden md:block text-sm font-medium">
                    {user?.firstName}
                  </span>
                </Menu.Button>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/dashboard"
                            className={`${
                              active ? "bg-gray-100" : ""
                            } flex items-center px-4 py-2 text-sm text-gray-700`}
                          >
                            <BookOpenIcon className="h-5 w-5 mr-2" />
                            แดชบอร์ด
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/dashboard/my-courses"
                            className={`${
                              active ? "bg-gray-100" : ""
                            } flex items-center px-4 py-2 text-sm text-gray-700`}
                          >
                            <AcademicCapIcon className="h-5 w-5 mr-2" />
                            คอร์สของฉัน
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to="/settings"
                            className={`${
                              active ? "bg-gray-100" : ""
                            } flex items-center px-4 py-2 text-sm text-gray-700`}
                          >
                            <Cog6ToothIcon className="h-5 w-5 mr-2" />
                            ตั้งค่า
                          </Link>
                        )}
                      </Menu.Item>
                      <hr className="my-1" />
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={handleLogout}
                            className={`${
                              active ? "bg-gray-100" : ""
                            } flex items-center w-full px-4 py-2 text-sm text-red-600`}
                          >
                            <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                            ออกจากระบบ
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                >
                  เข้าสู่ระบบ
                </Link>
                <Link to="/register" className="btn btn-primary text-sm">
                  สมัครสมาชิก
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden ml-4 p-2 text-gray-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t">
          <div className="px-4 py-3 space-y-1">
            <Link
              to="/courses"
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              คอร์สเรียน
            </Link>
            {isAuthenticated && (
              <Link
                to="/dashboard"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                แดชบอร์ด
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
