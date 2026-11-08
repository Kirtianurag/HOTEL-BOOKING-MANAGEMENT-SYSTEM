import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Hotel,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Shield,
  Briefcase,
  User,
  ArrowRight,
  ChevronDown,
  Check,
  ArrowLeft,
  Loader2,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);
  const [demoSelected, setDemoSelected] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setServerError('');
    setSubmitting(true);
    try {
      const user = await login(data.email, data.password);
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'staff') {
        navigate('/staff');
      } else {
        navigate(from === '/login' ? '/' : from);
      }
    } catch (err) {
      setServerError(err.message || 'Invalid credentials. Please verify your email and password.');
    } finally {
      setSubmitting(false);
    }
  };

  // Quick-fill demo credentials
  const fillDemo = (role, email, pass) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', pass, { shouldValidate: true });
    setServerError('');
    setDemoSelected(role);
    setTimeout(() => setDemoSelected(''), 2500);
  };

  // High-resolution luxury hotel courtyard image with pool and classical architecture
  const luxuryHotelImage =
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2000&q=85';

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#FFFFFF] text-slate-800 font-sans selection:bg-purple-100 selection:text-purple-900">
      {/* ─────────────────────────────────────────────────────────────
          LEFT COLUMN: LUXURY HOTEL PHOTOGRAPH (Clean & Uncluttered)
      ───────────────────────────────────────────────────────────── */}
      <div className="relative w-full lg:w-[52%] xl:w-[54%] min-h-[420px] sm:min-h-[500px] lg:min-h-screen overflow-hidden flex flex-col justify-end p-8 sm:p-12 lg:p-16 pb-28 sm:pb-36 lg:pb-40 bg-slate-950 text-white shrink-0">
        {/* Animated Background Hotel Image with Slow Ken Burns Movement */}
        <div className="absolute inset-0 z-0 overflow-hidden bg-slate-950">
          <img
            src={luxuryHotelImage}
            alt="Luxury Hotel Architecture"
            className="w-full h-full object-cover object-center animate-ken-burns opacity-85 scale-105"
            onError={(e) => {
              // Graceful fallback to dark neutral background if offline
              e.currentTarget.style.display = 'none';
            }}
          />
          {/* Subtle Dark Overlay for High Legibility */}
          <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/40 to-black/20" />
        </div>

        {/* Narrative Typography - Lifted & Balanced */}
        <div className="relative z-10 max-w-lg mb-10 sm:mb-16 lg:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-white leading-tight">
              Every stay <br />
              <span className="text-purple-200">tells a story.</span>
            </h1>

            <p className="mt-4 text-sm sm:text-base text-slate-200/90 font-normal leading-relaxed">
              Experience exceptional hospitality with effortless booking and seamless hotel management.
            </p>
          </motion.div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          RIGHT COLUMN: MINIMALIST LOGIN FORM (48% Desktop Width)
      ───────────────────────────────────────────────────────────── */}
      <div className="w-full lg:w-[48%] xl:w-[46%] flex flex-col justify-between bg-[#FFFFFF] px-6 py-10 sm:px-12 lg:px-16 overflow-y-auto">
        {/* Top Header Navigation Link */}
        <div className="hidden lg:flex justify-end items-center">
          <Link
            to="/"
            className="text-xs font-medium text-slate-500 hover:text-purple-600 transition-colors inline-flex items-center gap-1.5 py-1 px-3 rounded-full hover:bg-slate-50"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to website</span>
          </Link>
        </div>

        {/* Centered Form Area (Max width 430px) */}
        <div className="w-full max-w-[430px] mx-auto my-auto py-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          >
            {/* StayEase Brand Header (On Form Panel Only) */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-sm shadow-purple-600/20">
                  <Hotel className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold tracking-tight text-[#17122A]">
                    Stay<span className="text-purple-600">Ease</span>
                  </span>
                  <span className="block text-[9px] tracking-widest uppercase font-semibold text-slate-400">
                    Hotels & Resorts
                  </span>
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#17122A]">
                Welcome Back
              </h2>
              <p className="text-sm text-slate-500 mt-1.5">
                Please enter your credentials to access your account.
              </p>
            </div>

            {/* Server Error Alert */}
            {serverError && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5"
              >
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{serverError}</span>
              </motion.div>
            )}

            {/* Main Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="w-4 h-4 text-slate-400 group-focus-within:text-purple-600 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors" />
                  <input
                    type="email"
                    {...register('email')}
                    placeholder="john.watson@example.com"
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-purple-600 focus:ring-3 focus:ring-purple-500/10 transition-all shadow-2xs"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-rose-600 mt-1.5 font-medium">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Password
                  </label>
                  <a
                    href="#forgot"
                    onClick={(e) => {
                      e.preventDefault();
                      alert('Password recovery: please sign in using one of the demo accounts below or contact admin@stayease.demo.');
                    }}
                    className="text-xs font-medium text-slate-500 hover:text-purple-600 transition-colors"
                  >
                    Forgot Password?
                  </a>
                </div>
                <div className="relative group">
                  <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-purple-600 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    className="w-full pl-10 pr-11 py-2.5 bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-purple-600 focus:ring-3 focus:ring-purple-500/10 transition-all shadow-2xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-lg focus:outline-hidden cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-rose-600 mt-1.5 font-medium">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center pt-0.5">
                <label className="flex items-center gap-2 text-xs text-slate-600 font-medium cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded-md border-[#E5E7EB] text-purple-600 focus:ring-purple-500 cursor-pointer accent-purple-600"
                  />
                  <span>Remember Me</span>
                </label>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.005 }}
                whileTap={{ scale: 0.995 }}
                type="submit"
                disabled={submitting}
                className="w-full mt-2 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E5E7EB]" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-[#FFFFFF] px-3 text-slate-400 font-normal">
                  Or sign in with
                </span>
              </div>
            </div>

            {/* Social Sign-In Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                type="button"
                onClick={() => fillDemo('guest', 'guest@stayease.demo', 'Guest@123')}
                className="flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border border-[#E5E7EB] hover:border-slate-300 hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors shadow-2xs cursor-pointer"
                title="Quick Demo Sign In as Guest"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={() => fillDemo('guest', 'guest@stayease.demo', 'Guest@123')}
                className="flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border border-[#E5E7EB] hover:border-slate-300 hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors shadow-2xs cursor-pointer"
                title="Quick Demo Sign In as Guest"
              >
                <svg className="w-4 h-4 shrink-0 fill-current text-slate-900" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.16c.66-.82 1.11-1.96.99-3.1-.96.04-2.13.65-2.82 1.46-.61.71-1.14 1.87-1 2.98 1.08.08 2.18-.54 2.83-1.34z" />
                </svg>
                <span>Apple</span>
              </button>
            </div>

            {/* Below Button Link */}
            <div className="text-center text-xs text-slate-500">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-semibold text-purple-600 hover:text-purple-700 transition-colors"
              >
                Sign Up
              </Link>
            </div>

            {/* ─────────────────────────────────────────────────────────────
                CLEAN EXPANDABLE DEMO ACCOUNTS SECTION
            ───────────────────────────────────────────────────────────── */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowDemoAccounts(!showDemoAccounts)}
                className="w-full flex items-center justify-between py-2.5 px-3.5 rounded-xl bg-slate-50 hover:bg-purple-50/50 border border-slate-200 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-medium text-slate-700 group-hover:text-purple-700">
                    Explore demo accounts
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 group-hover:text-purple-600 transition-transform duration-200 ${
                    showDemoAccounts ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Expandable Accordion Body */}
              <AnimatePresence>
                {showDemoAccounts && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="pt-3 pb-1 space-y-2">
                      <p className="text-[11px] text-slate-500 px-1">
                        Select a role to autofill test credentials:
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {/* Admin */}
                        <button
                          type="button"
                          onClick={() => fillDemo('admin', 'admin@stayease.demo', 'Admin@123')}
                          className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                            demoSelected === 'admin'
                              ? 'border-purple-600 bg-purple-50 text-purple-900 ring-2 ring-purple-500/20'
                              : 'border-slate-200 bg-white hover:border-purple-300 hover:bg-purple-50/30'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                              <Shield className="w-3.5 h-3.5 text-purple-600" />
                              Admin
                            </span>
                            {demoSelected === 'admin' && (
                              <Check className="w-3 h-3 text-purple-600" />
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono truncate">
                            admin@stayease.demo
                          </span>
                        </button>

                        {/* Staff */}
                        <button
                          type="button"
                          onClick={() => fillDemo('staff', 'staff@stayease.demo', 'Staff@123')}
                          className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                            demoSelected === 'staff'
                              ? 'border-purple-600 bg-purple-50 text-purple-900 ring-2 ring-purple-500/20'
                              : 'border-slate-200 bg-white hover:border-purple-300 hover:bg-purple-50/30'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                              <Briefcase className="w-3.5 h-3.5 text-purple-600" />
                              Staff
                            </span>
                            {demoSelected === 'staff' && (
                              <Check className="w-3 h-3 text-purple-600" />
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono truncate">
                            staff@stayease.demo
                          </span>
                        </button>

                        {/* Guest */}
                        <button
                          type="button"
                          onClick={() => fillDemo('guest', 'guest@stayease.demo', 'Guest@123')}
                          className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                            demoSelected === 'guest'
                              ? 'border-purple-600 bg-purple-50 text-purple-900 ring-2 ring-purple-500/20'
                              : 'border-slate-200 bg-white hover:border-purple-300 hover:bg-purple-50/30'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-purple-600" />
                              Guest
                            </span>
                            {demoSelected === 'guest' && (
                              <Check className="w-3 h-3 text-purple-600" />
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono truncate">
                            guest@stayease.demo
                          </span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Bottom Micro Footer */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>© {new Date().getFullYear()} StayEase</span>
          <span>Privacy Policy • Terms of Service</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
