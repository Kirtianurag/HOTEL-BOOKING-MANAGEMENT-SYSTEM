import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import {
  Hotel,
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const registerSchema = z
  .object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().min(7, 'Please enter a valid phone number'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

const RegisterPage = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    setServerError('');
    setSubmitting(true);
    try {
      await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        password: data.password,
      });
      navigate('/');
    } catch (err) {
      setServerError(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const luxuryHotelImage =
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2000&q=85';

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#FFFFFF] text-slate-800 font-sans selection:bg-purple-100 selection:text-purple-900">
      {/* ─────────────────────────────────────────────────────────────
          LEFT COLUMN: LUXURY HOTEL PHOTOGRAPH (Clean & Uncluttered)
      ───────────────────────────────────────────────────────────── */}
      <div className="relative w-full lg:w-[52%] xl:w-[54%] min-h-[420px] sm:min-h-[500px] lg:min-h-screen overflow-hidden flex flex-col justify-end p-8 sm:p-12 lg:p-16 pb-16 sm:pb-20 lg:pb-24 bg-slate-950 text-white shrink-0">
        {/* Animated Background Hotel Image with Slow Ken Burns Movement */}
        <div className="absolute inset-0 z-0 overflow-hidden bg-slate-950">
          <img
            src={luxuryHotelImage}
            alt="Luxury Hotel Architecture"
            className="w-full h-full object-cover object-center animate-ken-burns opacity-85 scale-105"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          {/* Subtle Dark Overlay for High Legibility */}
          <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/40 to-black/20" />
        </div>

        {/* Narrative Typography - Lifted & Balanced */}
        <div className="relative z-10 max-w-lg mb-6 sm:mb-10 lg:mb-12">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-white leading-tight">
              Begin your <br />
              <span className="text-purple-200">luxury journey.</span>
            </h1>

            <p className="mt-4 text-sm sm:text-base text-slate-200/90 font-normal leading-relaxed">
              Create your personal account for seamless reservations, tailored guest preferences, and verified room bookings.
            </p>
          </motion.div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          RIGHT COLUMN: REGISTER FORM (48% Desktop Width)
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

        {/* Centered Form Area */}
        <div className="w-full max-w-[430px] mx-auto my-auto py-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          >
            {/* StayEase Brand Header */}
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
                Create an Account
              </h2>
              <p className="text-sm text-slate-500 mt-1.5">
                Join StayEase for seamless luxury room reservations.
              </p>
            </div>

            {/* Server Error Alert */}
            {serverError && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5"
              >
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{serverError}</span>
              </motion.div>
            )}

            {/* Register Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
              {/* First Name & Last Name (Side by Side) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    First Name
                  </label>
                  <div className="relative group">
                    <User className="w-4 h-4 text-slate-400 group-focus-within:text-purple-600 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors" />
                    <input
                      type="text"
                      {...register('firstName')}
                      placeholder="Eleanor"
                      autoComplete="given-name"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-purple-600 focus:ring-3 focus:ring-purple-500/10 transition-all shadow-2xs"
                    />
                  </div>
                  {errors.firstName && (
                    <p className="text-xs text-rose-600 mt-1 font-medium">{errors.firstName.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Last Name
                  </label>
                  <div className="relative group">
                    <User className="w-4 h-4 text-slate-400 group-focus-within:text-purple-600 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors" />
                    <input
                      type="text"
                      {...register('lastName')}
                      placeholder="Vance"
                      autoComplete="family-name"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-purple-600 focus:ring-3 focus:ring-purple-500/10 transition-all shadow-2xs"
                    />
                  </div>
                  {errors.lastName && (
                    <p className="text-xs text-rose-600 mt-1 font-medium">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

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
                    placeholder="eleanor.vance@example.com"
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-purple-600 focus:ring-3 focus:ring-purple-500/10 transition-all shadow-2xs"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-rose-600 mt-1 font-medium">{errors.email.message}</p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Phone Number
                </label>
                <div className="relative group">
                  <Phone className="w-4 h-4 text-slate-400 group-focus-within:text-purple-600 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors" />
                  <input
                    type="tel"
                    {...register('phone')}
                    placeholder="+1 (555) 234-5678"
                    autoComplete="tel"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-purple-600 focus:ring-3 focus:ring-purple-500/10 transition-all shadow-2xs"
                  />
                </div>
                {errors.phone && (
                  <p className="text-xs text-rose-600 mt-1 font-medium">{errors.phone.message}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-purple-600 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
                    className="w-full pl-10 pr-11 py-2.5 bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-purple-600 focus:ring-3 focus:ring-purple-500/10 transition-all shadow-2xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-lg focus:outline-hidden cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-rose-600 mt-1 font-medium">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative group">
                  <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-purple-600 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    {...register('confirmPassword')}
                    placeholder="Repeat your password"
                    autoComplete="new-password"
                    className="w-full pl-10 pr-11 py-2.5 bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-purple-600 focus:ring-3 focus:ring-purple-500/10 transition-all shadow-2xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-lg focus:outline-hidden cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-rose-600 mt-1 font-medium">{errors.confirmPassword.message}</p>
                )}
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
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Below Button Link */}
            <div className="mt-6 text-center text-xs text-slate-500">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-purple-600 hover:text-purple-700 transition-colors"
              >
                Sign In
              </Link>
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

export default RegisterPage;
