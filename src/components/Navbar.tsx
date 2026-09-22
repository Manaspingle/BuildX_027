import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  Heart, Menu, X, LogOut, LayoutDashboard, Siren, ShieldCheck,
  User, Building2, Droplet, Sparkles, BarChart3, MapPin, Users
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { session, profile, donor, hospital, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
    setIsOpen(false);
  };

  const getDashboardLink = () => {
    if (profile?.role === 'hospital') return '/hospital-dashboard';
    return '/dashboard';
  };

  const isIndividual = profile?.role === 'individual';
  const isHospital = profile?.role === 'hospital';

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Left Corner: Logo & Name */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-11 h-11 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 rounded-xl flex items-center justify-center shadow-md shadow-primary-600/30 group-hover:scale-105 transition-transform">
                <Heart className="w-6 h-6 text-white" fill="white" />
              </div>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-teal-500 rounded-full border-2 border-white animate-pulse" />
            </div>
            <div>
              <span className="font-extrabold text-2xl tracking-tight text-slate-900 flex items-center gap-0.5">
                Aarog<span className="text-primary-600">yam</span>
              </span>
              <p className="text-[11px] font-medium text-slate-500 -mt-1 tracking-wider uppercase">
                City Blood & Organ Network
              </p>
            </div>
          </Link>

          {/* Center Navigation for Logged-in Role */}
          {session && (
            <nav className="hidden lg:flex items-center gap-1">
              {isIndividual && (
                <>
                  <Link
                    to="/dashboard"
                    className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                      location.pathname === '/dashboard'
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/organ-pledge"
                    className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                      location.pathname === '/organ-pledge'
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Heart className="w-4 h-4 text-primary-600" />
                    Pledge Organ
                  </Link>
                  <Link
                    to="/recommendations"
                    className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                      location.pathname === '/recommendations'
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    AI Insights & Blogs
                  </Link>
                  <Link
                    to="/reports"
                    className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                      location.pathname === '/reports'
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4 text-teal-600" />
                    My Contribution Report
                  </Link>
                </>
              )}

              {isHospital && (
                <>
                  <Link
                    to="/hospital-dashboard"
                    className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                      location.pathname === '/hospital-dashboard'
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/donor-directory"
                    className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                      location.pathname === '/donor-directory'
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Users className="w-4 h-4 text-primary-600" />
                    Donor Directory
                  </Link>
                  <Link
                    to="/nearby-hospitals"
                    className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                      location.pathname === '/nearby-hospitals'
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <MapPin className="w-4 h-4 text-teal-600" />
                    Nearby Hospitals
                  </Link>
                  <Link
                    to="/transparency"
                    className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                      location.pathname === '/transparency'
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                    Transparency Log
                  </Link>
                  <Link
                    to="/reports"
                    className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                      location.pathname === '/reports'
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4 text-blue-600" />
                    Hospital Reports
                  </Link>
                </>
              )}
            </nav>
          )}

          {/* Right Corner: Navigation / Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
            {!session ? (
              <>
                <Link
                  to="/auth?mode=signup&role=individual"
                  className="px-4 py-2.5 rounded-xl font-semibold text-sm text-slate-700 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                >
                  Register Donor
                </Link>

                <Link
                  to="/auth?mode=signup&role=hospital"
                  className="px-4 py-2.5 rounded-xl font-semibold text-sm text-slate-700 hover:text-primary-600 hover:bg-slate-100 transition-colors"
                >
                  Hospital Access
                </Link>

                <Link
                  to="/auth?mode=login"
                  className="px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 shadow-md shadow-primary-600/20 transition-all transform hover:-translate-y-0.5"
                >
                  Login / Sign Up
                </Link>
              </>
            ) : (
              <>
                {/* Hospital Emergency Pulse Button */}
                {isHospital && (
                  <Link
                    to="/create-request"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-primary-600 to-red-700 shadow-lg shadow-primary-600/30 hover:scale-105 transition-all animate-pulse"
                  >
                    <Siren className="w-4 h-4" />
                    EMERGENCY REQUEST
                  </Link>
                )}

                {/* Profile Pill */}
                <Link
                  to={getDashboardLink()}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-xs font-bold">
                    {donor ? donor.full_name[0] : hospital ? hospital.hospital_name[0] : 'U'}
                  </div>
                  <div className="text-left hidden xl:block">
                    <p className="text-xs font-bold text-slate-800 leading-tight">
                      {donor ? donor.full_name.split(' ')[0] : hospital ? hospital.hospital_name.split(' ')[0] : 'User'}
                    </p>
                    <p className="text-[10px] text-slate-500 capitalize">
                      {profile?.role || 'Member'}
                    </p>
                  </div>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-2.5 rounded-xl text-slate-500 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-2 md:hidden">
            {isHospital && (
              <Link
                to="/create-request"
                className="p-2 bg-primary-600 text-white rounded-lg animate-pulse"
                title="Emergency"
              >
                <Siren className="w-5 h-5" />
              </Link>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2.5 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-slate-200 bg-white py-4 space-y-3"
            >
              {!session ? (
                <div className="space-y-2">
                  <Link
                    to="/auth?mode=signup&role=individual"
                    onClick={() => setIsOpen(false)}
                    className="block w-full py-3 px-4 rounded-xl font-semibold text-sm text-slate-800 hover:bg-slate-50 text-center border border-slate-200"
                  >
                    Register as Donor
                  </Link>
                  <Link
                    to="/auth?mode=signup&role=hospital"
                    onClick={() => setIsOpen(false)}
                    className="block w-full py-3 px-4 rounded-xl font-semibold text-sm text-slate-800 hover:bg-slate-50 text-center border border-slate-200"
                  >
                    Hospital Sign Up
                  </Link>
                  <Link
                    to="/auth?mode=login"
                    onClick={() => setIsOpen(false)}
                    className="block w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-primary-600 hover:bg-primary-700 text-center shadow-md shadow-primary-600/20"
                  >
                    Login / Sign In
                  </Link>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="px-3 py-2 bg-slate-50 rounded-xl mb-2 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary-600 text-white flex items-center justify-center font-bold text-sm">
                      {donor ? donor.full_name[0] : hospital ? hospital.hospital_name[0] : 'U'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        {donor ? donor.full_name : hospital ? hospital.hospital_name : 'User'}
                      </p>
                      <p className="text-[10px] text-slate-500 capitalize">{profile?.role}</p>
                    </div>
                  </div>

                  <Link
                    to={getDashboardLink()}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-medium text-slate-800 hover:bg-slate-100"
                  >
                    <LayoutDashboard className="w-4 h-4 text-primary-600" />
                    Dashboard
                  </Link>

                  {isIndividual && (
                    <>
                      <Link
                        to="/organ-pledge"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-medium text-slate-800 hover:bg-slate-100"
                      >
                        <Heart className="w-4 h-4 text-primary-600" />
                        Pledge Organs
                      </Link>
                      <Link
                        to="/recommendations"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-medium text-slate-800 hover:bg-slate-100"
                      >
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        AI Insights & Blogs
                      </Link>
                      <Link
                        to="/reports"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-medium text-slate-800 hover:bg-slate-100"
                      >
                        <BarChart3 className="w-4 h-4 text-teal-600" />
                        My Contribution Report
                      </Link>
                    </>
                  )}

                  {isHospital && (
                    <>
                      <Link
                        to="/create-request"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-primary-600 bg-primary-50"
                      >
                        <Siren className="w-4 h-4" />
                        Create Emergency Request
                      </Link>
                      <Link
                        to="/donor-directory"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-medium text-slate-800 hover:bg-slate-100"
                      >
                        <Users className="w-4 h-4 text-primary-600" />
                        Donor Directory
                      </Link>
                      <Link
                        to="/nearby-hospitals"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-medium text-slate-800 hover:bg-slate-100"
                      >
                        <MapPin className="w-4 h-4 text-teal-600" />
                        Nearby Hospitals
                      </Link>
                      <Link
                        to="/transparency"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-medium text-slate-800 hover:bg-slate-100"
                      >
                        <ShieldCheck className="w-4 h-4 text-teal-600" />
                        Transparency Log
                      </Link>
                      <Link
                        to="/reports"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-medium text-slate-800 hover:bg-slate-100"
                      >
                        <BarChart3 className="w-4 h-4 text-blue-600" />
                        Hospital Reports
                      </Link>
                    </>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-xl mt-3 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
