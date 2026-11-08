import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Hotel,
  Calendar,
  User,
  LogOut,
  LayoutDashboard,
  Shield,
  Briefcase,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin, isStaff } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setProfileDropdownOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-sm shadow-purple-200 group-hover:scale-105 transition-transform">
              <Hotel className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-purple-600 transition-colors">
                Stay<span className="text-purple-600">Ease</span>
              </span>
              <span className="hidden sm:block text-[10px] tracking-widest uppercase font-semibold text-slate-600 -mt-1">
                Luxury Hospitality
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-7">
            <Link
              to="/"
              className={`text-xs font-semibold tracking-wider uppercase transition-colors ${
                isActive('/') ? 'text-purple-600 font-bold' : 'text-slate-600 hover:text-purple-600'
              }`}
            >
              HOME
            </Link>
            <Link
              to="/rooms"
              className={`text-xs font-semibold tracking-wider uppercase transition-colors ${
                isActive('/rooms') ? 'text-purple-600 font-bold' : 'text-slate-600 hover:text-purple-600'
              }`}
            >
              EXPLORE ROOMS
            </Link>
            {isAuthenticated && !isAdmin && !isStaff && (
              <Link
                to="/my-bookings"
                className={`text-xs font-semibold tracking-wider uppercase transition-colors ${
                  isActive('/my-bookings') ? 'text-purple-600 font-bold' : 'text-slate-600 hover:text-purple-600'
                }`}
              >
                MY BOOKINGS
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                className={`text-xs font-semibold tracking-wider uppercase transition-colors ${
                  isActive('/admin') ? 'text-purple-600 font-bold' : 'text-slate-600 hover:text-purple-600'
                }`}
              >
                ADMIN DASHBOARD
              </Link>
            )}
            {isStaff && (
              <Link
                to="/staff"
                className={`text-xs font-semibold tracking-wider uppercase transition-colors ${
                  isActive('/staff') ? 'text-purple-600 font-bold' : 'text-slate-600 hover:text-purple-600'
                }`}
              >
                STAFF DESK
              </Link>
            )}
            <a
              href="#about"
              className="text-xs font-semibold tracking-wider uppercase text-slate-600 hover:text-purple-600 transition-colors"
            >
              ABOUT
            </a>
            <a
              href="#amenities"
              className="text-xs font-semibold tracking-wider uppercase text-slate-600 hover:text-purple-600 transition-colors"
            >
              AMENITIES
            </a>
            <a
              href="#contact"
              className="text-xs font-semibold tracking-wider uppercase text-slate-600 hover:text-purple-600 transition-colors"
            >
              CONTACT
            </a>
          </div>

          {/* User Profile / Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all text-slate-700"
                >
                  <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-semibold text-xs">
                    {user?.firstName?.[0] || 'U'}
                  </div>
                  <span className="text-sm font-medium text-slate-800">
                    {user?.firstName}
                  </span>
                  <span className="text-[11px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {user?.role}
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-600" />
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-600">Signed in as</p>
                      <p className="text-sm font-medium text-slate-900 truncate">{user?.email}</p>
                    </div>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-purple-600" />
                        Admin Dashboard
                      </Link>
                    )}

                    {isStaff && (
                      <Link
                        to="/staff"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                      >
                        <Briefcase className="w-4 h-4 text-purple-600" />
                        Staff Dashboard
                      </Link>
                    )}

                    {!isAdmin && !isStaff && (
                      <Link
                        to="/my-bookings"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                      >
                        <Calendar className="w-4 h-4 text-slate-500" />
                        My Bookings
                      </Link>
                    )}

                    <Link
                      to="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                    >
                      <User className="w-4 h-4 text-slate-500" />
                      Account Settings
                    </Link>

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-purple-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 shadow-sm shadow-purple-200 transition-all hover:shadow-md"
                >
                  Book Now
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold tracking-wider uppercase text-slate-800 hover:bg-purple-50 hover:text-purple-600"
          >
            HOME
          </Link>
          <Link
            to="/rooms"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold tracking-wider uppercase text-slate-800 hover:bg-purple-50 hover:text-purple-600"
          >
            EXPLORE ROOMS
          </Link>
          {isAuthenticated && !isAdmin && !isStaff && (
            <Link
              to="/my-bookings"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-semibold tracking-wider uppercase text-slate-800 hover:bg-purple-50 hover:text-purple-600"
            >
              MY BOOKINGS
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-base font-medium text-purple-700 bg-purple-50"
            >
              <LayoutDashboard className="w-5 h-5 text-purple-600" />
              <span>Admin Dashboard</span>
            </Link>
          )}
          {isStaff && (
            <Link
              to="/staff"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-purple-700 bg-purple-50"
            >
              Staff Dashboard
            </Link>
          )}

          <div className="border-t border-slate-100 pt-3">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 rounded-lg"
              >
                Sign Out ({user?.firstName})
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 px-4 border border-slate-200 rounded-xl text-slate-700 font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 px-4 bg-purple-600 text-white rounded-xl font-medium shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

