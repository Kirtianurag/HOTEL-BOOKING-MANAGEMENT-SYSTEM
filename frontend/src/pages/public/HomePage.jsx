import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Wifi,
  Tv,
  Coffee,
  Hotel,
  ShieldCheck,
  Clock,
  Award,
  Users,
  ChevronRight,
  Star,
  Quote,
  CheckCircle2,
  Bed,
  Bath,
  ArrowRight
} from 'lucide-react';
import BookingSearchBar from '../../components/booking/BookingSearchBar';
import api from '../../services/api';

const HomePage = () => {
  const [featuredTypes, setFeaturedTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        const res = await api.get('/room-types?activeOnly=true');
        if (res.success && res.data) {
          setFeaturedTypes(res.data);
        }
      } catch (err) {
        console.error('Failed to load featured rooms:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoomTypes();
  }, []);

  // Room photographs (high quality Unsplash hotel images with fallbacks)
  const roomImages = {
    Standard: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80',
    Deluxe: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80',
    Suite: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    Family: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80',
  };

  const defaultHeroBg = 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1920&q=85';

  return (
    <div className="min-h-screen bg-white">
      {/* ─────────────────────────────────────────────────────────────
          1. HERO SECTION WITH KEN BURNS ANIMATION
      ───────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-slate-900">
        {/* Animated Background Image with CSS Gradient Fallback */}
        <div className="absolute inset-0 z-0 overflow-hidden bg-linear-to-br from-purple-950 via-slate-900 to-slate-950">
          <img
            src={defaultHeroBg}
            alt="Luxury Hotel Interior"
            className="w-full h-full object-cover object-center animate-ken-burns opacity-70"
            onError={(e) => {
              // Fallback if image fails to load
              e.currentTarget.style.display = 'none';
            }}
          />
          {/* Elegant Dark & Purple Overlay for Readability */}
          <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-900/60 to-purple-950/40" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.15)_0%,transparent_70%)]" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center text-center">
          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl leading-tight"
          >
            Find Your <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-300 via-purple-200 to-indigo-200">Perfect Stay</span>
          </motion.h1>

          {/* Supporting Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-6 text-base sm:text-lg lg:text-xl text-slate-300 max-w-2xl font-light leading-relaxed"
          >
            Immerse yourself in world-class comfort. Seamless live availability, guaranteed instant reservations, and personalized hospitality at StayEase.
          </motion.p>

          {/* Booking Search Component */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="w-full mt-12"
          >
            <BookingSearchBar />
          </motion.div>

          {/* Trust Highlights */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mt-12 flex flex-wrap justify-center items-center gap-8 text-xs font-medium text-slate-300/80"
          >
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-purple-400" /> Best Price Guarantee
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-purple-400" /> Zero Hidden Booking Fees
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-purple-400" /> Real-time Inventory Locks
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-purple-400" /> 24/7 Customer Support
            </span>
          </motion.div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. FEATURED ROOMS SECTION
      ───────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
                Curated Accommodations
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mt-2">
                Featured Rooms & Suites
              </h2>
              <p className="text-sm sm:text-base text-slate-500 mt-2 max-w-xl">
                Each room is thoughtfully designed with premium bedding, modern amenities, and artisanal architectural finishes.
              </p>
            </div>
            <Link
              to="/rooms"
              className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-sm font-semibold text-purple-600 hover:text-purple-700 transition-colors group"
            >
              <span>Explore All Rooms</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="bg-slate-50 rounded-2xl p-4 animate-pulse h-96" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7">
              {featuredTypes.map((rt) => {
                const img = roomImages[rt.name] || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80';
                return (
                  <motion.div
                    key={rt._id}
                    whileHover={{ y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-md hover:shadow-xl transition-all flex flex-col group"
                  >
                    {/* Room Image */}
                    <div className="relative h-56 overflow-hidden bg-slate-100">
                      <img
                        src={img}
                        alt={rt.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-slate-900 shadow-xs">
                        ₹{rt.baseRate} <span className="text-[10px] font-normal text-slate-500">/ night</span>
                      </div>
                      <div className="absolute bottom-3 left-3 bg-slate-900/70 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-medium text-white flex items-center gap-1">
                        <Users className="w-3 h-3 text-purple-300" />
                        <span>Up to {rt.maxOccupancy} Guests</span>
                      </div>
                    </div>

                    {/* Room Details */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                          {rt.name} Room
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
                          {rt.description}
                        </p>

                        {/* Amenities Preview */}
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {rt.amenities?.slice(0, 3).map((a, idx) => (
                            <span
                              key={idx}
                              className="inline-block text-[11px] bg-slate-50 text-slate-600 px-2 py-0.5 rounded-md border border-slate-100"
                            >
                              {a}
                            </span>
                          ))}
                          {rt.amenities?.length > 3 && (
                            <span className="inline-block text-[11px] text-purple-600 px-1 py-0.5 font-medium">
                              +{rt.amenities.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="pt-5 mt-4 border-t border-slate-100">
                        <button
                          onClick={() => navigate(`/rooms?roomTypeId=${rt._id}`)}
                          className="w-full py-2.5 px-4 bg-purple-50 hover:bg-purple-600 text-purple-700 hover:text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 group/btn"
                        >
                          <span>Check Availability</span>
                          <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. WHY CHOOSE US SECTION
      ───────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
              The StayEase Advantage
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mt-2">
              Why Discerning Guests Choose Us
            </h2>
            <p className="text-sm sm:text-base text-slate-500 mt-2">
              Engineered with reliability and elevated with hospitality excellence at every touchpoint.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Guaranteed Room-Night Locks
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Our backend concurrency engine eliminates double bookings. When you hold a room, your reservation inventory is safely secured.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-6">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Instant Express Check-In
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Front desk staff validates your booking with real-time operational status, getting you settled into your pristine room in minutes.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-6">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Transparent Itemized Rates
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Full snapshot pricing clarity with itemized room nights, standard 12% statutory taxes, and zero surprise checkout charges.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. HOTEL AMENITIES SECTION
      ───────────────────────────────────────────────────────────── */}
      <section id="amenities" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
              Resort Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mt-2">
              World-Class Hotel Amenities
            </h2>
            <p className="text-sm sm:text-base text-slate-500 mt-2">
              Indulge in amenities curated to rejuvenate, relax, and inspire your stay.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 text-center">
            {[
              { icon: Wifi, title: 'Ultra-Fast WiFi', desc: '1 Gbps Fibre' },
              { icon: Tv, title: 'Smart Entertainment', desc: '4K Ultra HD' },
              { icon: Coffee, title: 'Artisanal Coffee', desc: 'In-Room Barista' },
              { icon: Bed, title: 'Egyptian Cotton', desc: '800 Thread Count' },
              { icon: Bath, title: 'Jacuzzi & Spa', desc: 'Luxury Toiletries' },
              { icon: Clock, title: '24/7 Room Service', desc: 'Gourmet Menu' },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-slate-50/70 border border-slate-100/80 hover:bg-purple-50/40 hover:border-purple-200 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-white text-purple-600 flex items-center justify-center mx-auto mb-4 shadow-xs group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">{item.title}</h4>
                  <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. CUSTOMER TESTIMONIALS (DEMO CONTENT)
      ───────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
              Guest Experiences
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mt-2">
              Loved by Travelers Worldwide
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Eleanor Vance',
                role: 'Frequent Business Traveler',
                comment: 'The booking process was effortless. The temporary hold feature gave me peace of mind to verify dates with my team before confirming. Clean, modern, and reliable.',
                rating: 5,
              },
              {
                name: 'Marcus Sterling',
                role: 'Family Vacationer',
                comment: 'We booked the Family Room for 5 guests and the check-in experience was seamless. Staff had everything prepared and the room amenities were unmatched.',
                rating: 5,
              },
              {
                name: 'Sophia Laurent',
                role: 'Architectural Designer',
                comment: 'Minimalist white aesthetics, elegant typography, and zero clutter. StayEase sets a gold standard in hospitality interface design and database reliability.',
                rating: 5,
              },
            ].map((t, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-7 border border-slate-100 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex gap-1 text-amber-400 mb-4">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <Quote className="w-8 h-8 text-purple-200 mb-2" />
                  <p className="text-sm text-slate-600 leading-relaxed italic">
                    "{t.comment}"
                  </p>
                </div>
                <div className="pt-6 mt-6 border-t border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-sm">
                    {t.name[0]}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{t.name}</h4>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. ABOUT SECTION
      ───────────────────────────────────────────────────────────── */}
      <section id="about" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
                About StayEase
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mt-2 leading-tight">
                Crafted for Seamless Stays and Rock-Solid Operations
              </h2>
              <p className="text-sm sm:text-base text-slate-500 mt-4 leading-relaxed">
                StayEase was developed to solve the complex distributed challenges of the hospitality industry: preventing overbooking, enforcing strict capacity constraints, automating inventory locks, and giving staff and guests a delightful experience.
              </p>
              <div className="mt-8 space-y-3">
                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span>Compound unique index prevents double booking per room-night</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span>Automatic garbage collection for abandoned temporary holds</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span>Real-time operations reporting with MongoDB aggregation pipelines</span>
                </div>
              </div>
              <div className="mt-10">
                <Link
                  to="/rooms"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 text-white font-semibold text-sm hover:bg-purple-700 shadow-md shadow-purple-200 transition-all"
                >
                  <span>Book Your Stay Today</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="relative rounded-3xl overflow-hidden border border-slate-100 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1000&q=80"
                alt="Hotel Resort Pool"
                className="w-full h-full object-cover min-h-[380px]"
              />

              {/* Floating Stat Card Directly On The Image */}
              <motion.div
                initial={{ y: 0 }}
                animate={{ y: [-5, 5, -5] }}
                transition={{
                  duration: 4.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute bottom-6 left-6 z-10 bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 shadow-2xl border border-white/80 max-w-[280px] sm:max-w-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-600 text-white grid place-items-center font-black text-lg leading-none tracking-tight shadow-md shadow-purple-300/60 shrink-0 select-none text-center">
                    <span className="leading-none text-center block">99%</span>
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-900 leading-tight">Guest Satisfaction</h5>
                    <p className="text-xs text-slate-500 mt-0.5">Based on 2,500+ verified stays</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

