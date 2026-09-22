import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useLanguage, type Language } from '@/context/LanguageContext';
import {
  Heart, Menu, X, LogOut, LayoutDashboard, Siren, ShieldCheck,
  Sparkles, BarChart3, MapPin, Users, Globe
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import EmergencyAccidentModal from './EmergencyAccidentModal';

export default function Navbar() {
  const { session, profile, donor, hospital, signOut } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

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
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Left Corner: Uploaded Logo & Brand Name */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <img
                  src="/aarogyam-logo.jpg"
                  alt="Aarogyam Logo"
                  className="w-12 h-12 object-cover rounded-2xl shadow-md border-2 border-brand-orange/40 group-hover:scale-105 transition-transform"
                />
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-brand-orange rounded-full border-2 border-white animate-pulse" />
              </div>
              <div>
                <span className="font-black text-2xl tracking-tight text-brand-teal flex items-center gap-1">
                  {t('app.name')}
                  <span className="w-2 h-2 rounded-full bg-brand-orange inline-block" />
                </span>
                <p className="text-[11px] font-bold text-slate-500 -mt-1 tracking-wider uppercase">
                  {t('app.tagline')}
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
                      className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all ${
                        location.pathname === '/dashboard'
                          ? 'bg-teal-50 text-brand-teal border border-brand-teal/20'
                          : 'text-slate-600 hover:text-brand-teal hover:bg-slate-100'
                      }`}
                    >
                      {t('nav.dashboard')}
                    </Link>
                    <Link
                      to="/organ-pledge"
                      className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5 ${
                        location.pathname === '/organ-pledge'
                          ? 'bg-orange-50 text-brand-orange border border-brand-orange/20'
                          : 'text-slate-600 hover:text-brand-teal hover:bg-slate-100'
                      }`}
                    >
                      <Heart className="w-4 h-4 text-brand-orange" />
                      {t('nav.pledge_organ')}
                    </Link>
                    <Link
                      to="/recommendations"
                      className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5 ${
                        location.pathname === '/recommendations'
                          ? 'bg-teal-50 text-brand-teal border border-brand-teal/20'
                          : 'text-slate-600 hover:text-brand-teal hover:bg-slate-100'
                      }`}
                    >
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      {t('nav.ai_insights')}
                    </Link>
                    <Link
                      to="/reports"
                      className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5 ${
                        location.pathname === '/reports'
                          ? 'bg-teal-50 text-brand-teal border border-brand-teal/20'
                          : 'text-slate-600 hover:text-brand-teal hover:bg-slate-100'
                      }`}
                    >
                      <BarChart3 className="w-4 h-4 text-brand-teal" />
                      {t('nav.my_report')}
                    </Link>
                  </>
                )}

                {isHospital && (
                  <>
                    <Link
                      to="/hospital-dashboard"
                      className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all ${
                        location.pathname === '/hospital-dashboard'
                          ? 'bg-teal-50 text-brand-teal border border-brand-teal/20'
                          : 'text-slate-600 hover:text-brand-teal hover:bg-slate-100'
                      }`}
                    >
                      {t('nav.dashboard')}
                    </Link>
                    <Link
                      to="/donor-directory"
                      className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5 ${
                        location.pathname === '/donor-directory'
                          ? 'bg-teal-50 text-brand-teal border border-brand-teal/20'
                          : 'text-slate-600 hover:text-brand-teal hover:bg-slate-100'
                      }`}
                    >
                      <Users className="w-4 h-4 text-brand-teal" />
                      {t('nav.donor_directory')}
                    </Link>
                    <Link
                      to="/nearby-hospitals"
                      className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5 ${
                        location.pathname === '/nearby-hospitals'
                          ? 'bg-teal-50 text-brand-teal border border-brand-teal/20'
                          : 'text-slate-600 hover:text-brand-teal hover:bg-slate-100'
                      }`}
                    >
                      <MapPin className="w-4 h-4 text-brand-teal" />
                      {t('nav.nearby_hospitals')}
                    </Link>
                    <Link
                      to="/transparency"
                      className={`px-3.5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5 ${
                        location.pathname === '/transparency'
                          ? 'bg-teal-50 text-brand-teal border border-brand-teal/20'
                          : 'text-slate-600 hover:text-brand-teal hover:bg-slate-100'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      {t('nav.transparency_log')}
                    </Link>
                  </>
                )}
              </nav>
            )}

            {/* Right Corner: Emergency Red Button + Language Selector + Auth Actions */}
            <div className="hidden md:flex items-center gap-2.5">
              {/* High-priority EMERGENCY Button with Beep Animation */}
              <button
                type="button"
                onClick={() => setShowEmergencyModal(true)}
                className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black text-white bg-red-600 hover:bg-red-700 animate-beep-pulse shadow-lg shadow-red-600/30 transition-all uppercase tracking-wider"
              >
                <Siren className="w-4 h-4 text-white animate-bounce" />
                <span>{t('emergency.btn')}</span>
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              </button>

              {/* Language Switcher Dropdown */}
              <div className="relative flex items-center bg-slate-100 rounded-xl px-2 py-1.5 border border-slate-200">
                <Globe className="w-4 h-4 text-brand-teal mr-1.5" />
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer pr-1"
                  aria-label={t('common.language')}
                >
                  <option value="en">English</option>
                  <option value="hi">हिन्दी</option>
                  <option value="mr">मराठी</option>
                </select>
              </div>

              {!session ? (
                <>
                  <Link
                    to="/auth?mode=signup&role=individual"
                    className="px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm text-slate-700 hover:text-brand-teal hover:bg-teal-50 transition-colors"
                  >
                    {t('nav.register_donor')}
                  </Link>

                  <Link
                    to="/auth?mode=signup&role=hospital"
                    className="px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm text-slate-700 hover:text-brand-teal hover:bg-teal-50 transition-colors"
                  >
                    {t('nav.hospital_access')}
                  </Link>

                  <Link
                    to="/auth?mode=login"
                    className="px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm text-white bg-brand-teal hover:bg-brand-teal/90 shadow-md shadow-brand-teal/20 transition-all transform hover:-translate-y-0.5"
                  >
                    {t('nav.login_signup')}
                  </Link>
                </>
              ) : (
                <>
                  {/* Hospital Emergency Pulse Button */}
                  {isHospital && (
                    <Link
                      to="/create-request"
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black text-white bg-brand-teal hover:bg-brand-teal/90 shadow-md transition-all"
                    >
                      <Siren className="w-3.5 h-3.5 text-brand-orange" />
                      {t('nav.emergency_request')}
                    </Link>
                  )}

                  {/* Profile Pill */}
                  <Link
                    to={getDashboardLink()}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-brand-teal/40 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-brand-teal flex items-center justify-center text-white text-xs font-bold">
                      {donor ? donor.full_name[0] : hospital ? hospital.hospital_name[0] : 'U'}
                    </div>
                    <div className="text-left hidden xl:block">
                      <p className="text-xs font-bold text-slate-800 leading-tight">
                        {donor ? donor.full_name.split(' ')[0] : hospital ? hospital.hospital_name.split(' ')[0] : 'User'}
                      </p>
                      <p className="text-[10px] text-brand-teal font-semibold capitalize">
                        {profile?.role || 'Member'}
                      </p>
                    </div>
                  </Link>

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    title={t('nav.sign_out')}
                    className="p-2.5 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle & Emergency Button */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                type="button"
                onClick={() => setShowEmergencyModal(true)}
                className="p-2 bg-red-600 text-white rounded-xl animate-beep-pulse text-xs font-black flex items-center gap-1"
                title="Emergency"
              >
                <Siren className="w-4 h-4 animate-bounce" />
                <span className="hidden xs:inline">SOS</span>
              </button>

              <div className="relative flex items-center bg-slate-100 rounded-lg px-1.5 py-1">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className="bg-transparent text-[11px] font-bold text-slate-800 focus:outline-none"
                  aria-label={t('common.language')}
                >
                  <option value="en">EN</option>
                  <option value="hi">HI</option>
                  <option value="mr">MR</option>
                </select>
              </div>

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
                    <button
                      type="button"
                      onClick={() => {
                        setShowEmergencyModal(true);
                        setIsOpen(false);
                      }}
                      className="w-full py-3 px-4 rounded-xl font-black text-sm text-white bg-red-600 flex items-center justify-center gap-2 shadow-md animate-beep-pulse"
                    >
                      <Siren className="w-4 h-4" />
                      {t('emergency.btn')} - {t('emergency.subtitle')}
                    </button>
                    <Link
                      to="/auth?mode=signup&role=individual"
                      onClick={() => setIsOpen(false)}
                      className="block w-full py-3 px-4 rounded-xl font-bold text-sm text-slate-800 hover:bg-slate-50 text-center border border-slate-200"
                    >
                      {t('nav.register_donor')}
                    </Link>
                    <Link
                      to="/auth?mode=signup&role=hospital"
                      onClick={() => setIsOpen(false)}
                      className="block w-full py-3 px-4 rounded-xl font-bold text-sm text-slate-800 hover:bg-slate-50 text-center border border-slate-200"
                    >
                      {t('nav.hospital_access')}
                    </Link>
                    <Link
                      to="/auth?mode=login"
                      onClick={() => setIsOpen(false)}
                      className="block w-full py-3 px-4 rounded-xl font-black text-sm text-white bg-brand-teal hover:bg-brand-teal/90 text-center shadow-md shadow-brand-teal/20"
                    >
                      {t('nav.login_signup')}
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="px-3 py-2 bg-slate-50 rounded-xl mb-2 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-brand-teal text-white flex items-center justify-center font-bold text-sm">
                        {donor ? donor.full_name[0] : hospital ? hospital.hospital_name[0] : 'U'}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">
                          {donor ? donor.full_name : hospital ? hospital.hospital_name : 'User'}
                        </p>
                        <p className="text-[10px] text-brand-teal font-semibold capitalize">{profile?.role}</p>
                      </div>
                    </div>

                    <Link
                      to={getDashboardLink()}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-slate-800 hover:bg-slate-100"
                    >
                      <LayoutDashboard className="w-4 h-4 text-brand-teal" />
                      {t('nav.dashboard')}
                    </Link>

                    {isIndividual && (
                      <>
                        <Link
                          to="/organ-pledge"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-slate-800 hover:bg-slate-100"
                        >
                          <Heart className="w-4 h-4 text-brand-orange" />
                          {t('nav.pledge_organ')}
                        </Link>
                        <Link
                          to="/recommendations"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-slate-800 hover:bg-slate-100"
                        >
                          <Sparkles className="w-4 h-4 text-amber-500" />
                          {t('nav.ai_insights')}
                        </Link>
                        <Link
                          to="/reports"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-slate-800 hover:bg-slate-100"
                        >
                          <BarChart3 className="w-4 h-4 text-brand-teal" />
                          {t('nav.my_report')}
                        </Link>
                      </>
                    )}

                    {isHospital && (
                      <>
                        <Link
                          to="/create-request"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-brand-teal bg-teal-50"
                        >
                          <Siren className="w-4 h-4" />
                          {t('nav.emergency_request')}
                        </Link>
                        <Link
                          to="/donor-directory"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-slate-800 hover:bg-slate-100"
                        >
                          <Users className="w-4 h-4 text-brand-teal" />
                          {t('nav.donor_directory')}
                        </Link>
                        <Link
                          to="/nearby-hospitals"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-slate-800 hover:bg-slate-100"
                        >
                          <MapPin className="w-4 h-4 text-brand-teal" />
                          {t('nav.nearby_hospitals')}
                        </Link>
                        <Link
                          to="/transparency"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-slate-800 hover:bg-slate-100"
                        >
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          {t('nav.transparency_log')}
                        </Link>
                      </>
                    )}

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl mt-3 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      {t('nav.sign_out')}
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Emergency Accident Modal */}
      <EmergencyAccidentModal
        isOpen={showEmergencyModal}
        onClose={() => setShowEmergencyModal(false)}
      />
    </>
  );
}
