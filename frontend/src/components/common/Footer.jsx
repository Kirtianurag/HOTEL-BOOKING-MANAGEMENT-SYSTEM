import React from 'react';
import { Link } from 'react-router-dom';
import { Hotel, Mail, Phone, MapPin, Heart, Shield, Award, Clock } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Brand & Description */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-sm">
                <Hotel className="w-5 h-5" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">
                Stay<span className="text-purple-400">Ease</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Experience unparalleled hospitality and seamless luxury accommodations. Built with architectural integrity and modern booking perfection.
            </p>
            <div className="flex gap-4 pt-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-purple-400 bg-purple-950/60 px-2.5 py-1 rounded-full border border-purple-800/40">
                <Award className="w-3.5 h-3.5" /> 5-Star Rated
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-purple-400 bg-purple-950/60 px-2.5 py-1 rounded-full border border-purple-800/40">
                <Shield className="w-3.5 h-3.5" /> Verified Stay
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Explore
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/rooms" className="text-slate-400 hover:text-white transition-colors">
                  Standard Rooms
                </Link>
              </li>
              <li>
                <Link to="/rooms" className="text-slate-400 hover:text-white transition-colors">
                  Deluxe City Suites
                </Link>
              </li>
              <li>
                <Link to="/rooms" className="text-slate-400 hover:text-white transition-colors">
                  Executive Penthouse
                </Link>
              </li>
              <li>
                <Link to="/rooms" className="text-slate-400 hover:text-white transition-colors">
                  Family Garden Villa
                </Link>
              </li>
              <li>
                <a href="#amenities" className="text-slate-400 hover:text-white transition-colors">
                  Resort Amenities
                </a>
              </li>
            </ul>
          </div>

          {/* Guest Services */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Guest Services
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/my-bookings" className="text-slate-400 hover:text-white transition-colors">
                  Manage Reservations
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-slate-400 hover:text-white transition-colors">
                  Guest Sign In
                </Link>
              </li>
              <li>
                <span className="text-slate-400">Flexible 24-hr Cancellation</span>
              </li>
              <li>
                <span className="text-slate-400">Guaranteed Best Rates</span>
              </li>
              <li>
                <span className="text-slate-400">Direct Check-In Concierge</span>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div id="contact">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Contact Us
            </h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <span>100 Luxury Avenue, Suite 500, Waterfront Promenade, CA 90210</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-purple-400 shrink-0" />
                <span>+1 (800) 555-EASE / +1 (555) 0199</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-purple-400 shrink-0" />
                <span>reservations@stayease.demo</span>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-purple-400 shrink-0" />
                <span>24/7 Front Desk & Concierge</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} StayEase Hotel Booking Management System. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Engineered with <Heart className="w-3.5 h-3.5 text-purple-500 fill-purple-500 inline" /> for Algions AI Labs Internship Assessment
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

