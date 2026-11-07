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
  Sparkles,
  Check,
  Star,
  ArrowLeft,
  Loader2
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

  // Luxury hotel imagery - Resort courtyard with pool and classical architecture
  const luxuryHotelImage =
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2000&q=85';

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#FFFFFF] text-slate-800 font-sans selection:bg-purple-100 selection:text-purple-900">
      {/* ─────────────────────────────────────────────────────────────
          LEFT COLUMN: LUXURY HOSPITALITY VISUAL (52% Desktop Width)
      ───────────────────────────────────────────────────────────── */}
      <div className="relative w-full lg:w-[52%] xl:w-[54%] min-h-[360px] sm:min-h-[440px] lg:min-h-screen overflow-hidden flex flex-col justify-between p-8 sm:p-12 lg:p-16 bg-[#17122A] text-white shrink-0">
        {/* Animated Background Hotel Image with Ken Burns Effect */}
        <div className="absolute inset-0 z-0 overflow-hidden bg-linear-to-br from-purple-950 via-[#17122A] to-slate-950">
          <img
            src={luxuryHotelImage}
            alt="StayEase Luxury Hotel Architecture"
            className="w-full h-full object-cover object-center animate-ken-burns opacity-75 scale-105"
            onError={(e) => {
              // Graceful fallback to rich dark luxury gradient if image fails to load
              e.currentTarget.style.display = 'none';
            }}
          />
          {/* Subtle Deep Luxury Overlays for High Legibility */}
          <div className="absolute inset-0 bg-linear-to-t from-[#17122A] via-[#17122A]/50 to-[#17122A]/35" />
          <div className="absolute inset-0 bg-radial-[circle_at_top_left] from-purple-900/30 via-transparent to-transparent" />
        </div>

        {/* Top Brand Mark */}
        <div className="relative z-10 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-3 group focus:outline-hidden"
          >
            <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform duration-300">
              <Hotel className="w-5 h-5 text-purple-300" />
            </div>
            <div>
              <span className="text-2xl font-bold tracking-tight text-white flex items-center gap-0.5">
                Stay<span className="text-purple-400">Ease</span>
              </span>
              <span className="block text-[10px] tracking-widest uppercase font-semibold text-purple-200/80 -mt-0.5">
                Luxury Hospitality Platform
              </span>
            </div>
          </Link>

          {/* Mobile Back Link */}
          <Link
            to="/"
            className="lg:hidden text-xs text-purple-200 hover:text-white inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-white/10 backdrop-blur-xs border border-white/15"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
        </div>

        {/* Hero Narrative & Architectural Typography */}
        <div className="relative z-10 max-w-xl my-auto py-12 lg:py-0">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase bg-purple-500/20 text-purple-200 border border-purple-400/30 backdrop-blur-md mb-5">
              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              <span>World-Class Living</span>
            </span>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Every stay <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-200 via-purple-300 to-indigo-200">
                tells a story.
              </span>
            </h1>

            {/* Small decorative accent line */}
            <div className="w-16 h-1 bg-linear-to-r from-purple-500 to-purple-300 rounded-full my-5" />

            <p className="text-sm sm:text-base text-slate-300/90 font-light leading-relaxed max-w-lg">
              Experience exceptional hospitality with effortless booking and seamless hotel management.
            </p>
          </motion.div>
        </div>

        {/* Bottom Social Proof & Trust Badges */}
        <div className="relative z-10 hidden sm:flex items-center justify-between pt-6 border-t border-white/10 text-xs text-slate-300/80">
          <div className="flex items-center gap-1.5">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
              ))}
            </div>
            <span className="font-medium text-white ml-1">5-Star Standards</span>
          </div>
          <span className="text-slate-400 text-[11px]">
            Real-time Inventory • Concurrency Protected
          </span>
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
            className="text-xs font-semibold text-slate-500 hover:text-purple-600 transition-colors inline-flex items-center gap-1.5 py-1.5 px-3 rounded-full hover:bg-slate-50"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to website</span>
          </Link>
        </div>

        {/* Centered Form Area (Max width ~430px) */}
        <div className="w-full max-w-[430px] mx-auto my-auto py-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            {/* Header */}
            <div className="mb-8">
              {/* Luxury Hospitality Brand Header */}
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
                  <Hotel className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold tracking-tight text-[#17122A]">
                    Stay<span className="text-purple-600">Ease</span>
                  </span>
                  <span className="block text-[9px] tracking-widest uppercase font-semibold text-slate-400 -mt-0.5">
                    Hotels & Resorts
                  </span>
                </div>
              </div>

              <h2 className="text-3xl font-extrabold tracking-tight text-[#17122A] flex items-center gap-2">
                <span>Welcome Back</span>
                <span className="text-2xl select-none" role="img" aria-label="waving hand">👋</span>
              </h2>
              <p className="text-sm text-slate-500 mt-2">
                Please enter your credentials to manage your StayEase experience.
              </p>
            </div>

            {/* Server Error Alert */}
            {serverError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 shadow-2xs"
              >
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{serverError}</span>
              </motion.div>
            )}

            {/* Main Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                    className="w-full pl-10 pr-4 py-3 bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-purple-600 focus:ring-4 focus:ring-purple-500/10 transition-all shadow-2xs"
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
                      alert('To reset your password in this demo environment, please sign in with an active demo account or contact administrator at admin@stayease.demo');
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
                    className="w-full pl-10 pr-11 py-3 bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-purple-600 focus:ring-4 focus:ring-purple-500/10 transition-all shadow-2xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg focus:outline-hidden"
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
              <div className="flex items-center">
                <label className="flex items-center gap-2.5 text-xs text-slate-600 font-medium cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded-md border-slate-300 text-purple-600 focus:ring-purple-500 cursor-pointer accent-purple-600"
                  />
                  <span>Remember Me</span>
                </label>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-purple-300/40 hover:shadow-lg hover:shadow-purple-400/40 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Signing in to StayEase...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Or sign in with Divider */}
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E5E7EB]" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-[#FFFFFF] px-3 text-slate-400 font-medium">
                  Or sign in with
                </span>
              </div>
            </div>

            {/* Social Sign-In Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                type="button"
                onClick={() => fillDemo('guest', 'guest@stayease.demo', 'Guest@123')}
                className="flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border border-[#E5E7EB] hover:border-slate-300 hover:bg-slate-50/70 text-xs font-semibold text-slate-700 transition-all shadow-2xs group cursor-pointer"
                title="Instant Demo Sign In as Guest"
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
                className="flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border border-[#E5E7EB] hover:border-slate-300 hover:bg-slate-50/70 text-xs font-semibold text-slate-700 transition-all shadow-2xs group cursor-pointer"
                title="Instant Demo Sign In as Guest"
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
                COMPACT EXPANDABLE DEMO ACCOUNTS SECTION
            ───────────────────────────────────────────────────────────── */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowDemoAccounts(!showDemoAccounts)}
                className="w-full flex items-center justify-between py-2 px-3.5 rounded-xl bg-[#F8F7FC] hover:bg-purple-50/60 border border-slate-200/80 transition-colors text-left group"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-semibold text-slate-700 group-hover:text-purple-700">
                    Explore demo accounts
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-100/70 px-2 py-0.5 rounded-full">
                    Demo Mode
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
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="pt-3 pb-1 space-y-2">
                      <p className="text-[11px] text-slate-400 px-1">
                        Select a role to instantly autofill test credentials from the seed database:
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                        {/* Admin */}
                        <button
                          type="button"
                          onClick={() => fillDemo('admin', 'admin@stayease.demo', 'Admin@123')}
                          className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                            demoSelected === 'admin'
                              ? 'border-purple-600 bg-purple-50 text-purple-900 ring-2 ring-purple-500/20'
                              : 'border-slate-200 bg-white hover:border-purple-300 hover:bg-purple-50/30'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                              <Shield className="w-3.5 h-3.5 text-purple-600" />
                              Admin
                            </span>
                            {demoSelected === 'admin' && (
                              <Check className="w-3 h-3 text-purple-600" />
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono truncate">
                            admin@stayease.demo
                          </span>
                        </button>

                        {/* Staff */}
                        <button
                          type="button"
                          onClick={() => fillDemo('staff', 'staff@stayease.demo', 'Staff@123')}
                          className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                            demoSelected === 'staff'
                              ? 'border-purple-600 bg-purple-50 text-purple-900 ring-2 ring-purple-500/20'
                              : 'border-slate-200 bg-white hover:border-purple-300 hover:bg-purple-50/30'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                              <Briefcase className="w-3.5 h-3.5 text-purple-600" />
                              Staff
                            </span>
                            {demoSelected === 'staff' && (
                              <Check className="w-3 h-3 text-purple-600" />
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono truncate">
                            staff@stayease.demo
                          </span>
                        </button>

                        {/* Guest */}
                        <button
                          type="button"
                          onClick={() => fillDemo('guest', 'guest@stayease.demo', 'Guest@123')}
                          className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                            demoSelected === 'guest'
                              ? 'border-purple-600 bg-purple-50 text-purple-900 ring-2 ring-purple-500/20'
                              : 'border-slate-200 bg-white hover:border-purple-300 hover:bg-purple-50/30'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-purple-600" />
                              Guest
                            </span>
                            {demoSelected === 'guest' && (
                              <Check className="w-3 h-3 text-purple-600" />
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono truncate">
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
          <span>© {new Date().getFullYear()} StayEase Platform</span>
          <span>Privacy & Terms</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
