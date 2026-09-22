import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import EmergencyAccidentModal from '@/components/EmergencyAccidentModal';
import { useLanguage, type Language } from '@/context/LanguageContext';
import {
  Heart, Users, Building2, MapPin, ArrowRight, ShieldCheck, Zap,
  Award, Phone, Mail, HandHeart, Siren, Radio, Globe, Navigation,
  Clock, BedDouble, Stethoscope, CheckCircle2, ChevronDown
} from 'lucide-react';
import { LANDING_STATS, TESTIMONIALS } from '@/lib/mockData';

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (inView) {
      const duration = 2000;
      const steps = 50;
      const increment = value / steps;
      let current = 0;
      const interval = setInterval(() => {
        current += increment;
        if (current >= value) {
          setCount(value);
          clearInterval(interval);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);
      return () => clearInterval(interval);
    }
  }, [inView, value]);

  return (
    <span ref={ref} className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

export default function LandingPage() {
  const { language, setLanguage, t } = useLanguage();
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);

  const statsList = [
    { label: t('landing.stats_lives'), value: LANDING_STATS.lives_saved, suffix: '+', icon: Heart, color: 'from-brand-teal to-teal-700', lightColor: 'bg-teal-50 text-brand-teal' },
    { label: t('landing.stats_donors'), value: LANDING_STATS.active_donors, suffix: '+', icon: Users, color: 'from-brand-orange to-orange-700', lightColor: 'bg-orange-50 text-brand-orange' },
    { label: t('landing.stats_hospitals'), value: LANDING_STATS.hospitals_connected, suffix: '+', icon: Building2, color: 'from-brand-teal to-teal-800', lightColor: 'bg-teal-50 text-brand-teal' },
    { label: t('landing.stats_cities'), value: LANDING_STATS.cities_covered, suffix: ' (MH)', icon: MapPin, color: 'from-purple-500 to-purple-700', lightColor: 'bg-purple-50 text-purple-600' },
  ];

  const stepsList = [
    {
      num: '01',
      title: t('landing.step1_title'),
      desc: t('landing.step1_desc'),
      icon: Users,
      gradient: 'from-brand-teal to-teal-800',
      badge: 'Step 1',
    },
    {
      num: '02',
      title: t('landing.step2_title'),
      desc: t('landing.step2_desc'),
      icon: Zap,
      gradient: 'from-brand-orange to-orange-600',
      badge: 'Step 2',
    },
    {
      num: '03',
      title: t('landing.step3_title'),
      desc: t('landing.step3_desc'),
      icon: Heart,
      gradient: 'from-red-600 to-rose-700',
      badge: 'Step 3',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-brand-teal selection:text-white">
      {/* Top Bar / Header */}
      <Navbar />

      {/* Hero Section with Large Decorative Spheres in #F48552 and Brand Teal Accents */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-orange-50/20 pt-8 pb-20 lg:pt-16 lg:pb-28 border-b border-slate-200/60">
        {/* Large Decorative Spheres in Orange #F48552 */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#F48552]/15 blur-3xl pointer-events-none animate-pulse-slow" />
        <div className="absolute top-1/2 -left-20 w-80 h-80 rounded-full bg-[#F48552]/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-5 right-1/3 w-72 h-72 rounded-full bg-[#00605F]/10 blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Top Announcement & Language Quick Select Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-teal-50 border border-brand-teal/20 text-brand-teal rounded-full text-xs sm:text-sm font-bold shadow-sm">
              <span className="w-2.5 h-2.5 bg-brand-teal rounded-full animate-ping" />
              <span>{t('app.hero_badge')}</span>
            </div>

            {/* Language Selector Dropdown on Landing Page as explicitly requested */}
            <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-2xl border-2 border-brand-orange/30 shadow-sm">
              <Globe className="w-4 h-4 text-brand-orange" />
              <span className="text-xs font-bold text-slate-600">{t('common.language')}:</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="bg-transparent text-xs font-black text-brand-teal focus:outline-none cursor-pointer pr-1"
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="mr">मराठी (Marathi)</option>
              </select>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content Column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 space-y-6"
            >
              {/* Main Headline */}
              <h1 className="text-4xl sm:text-6xl lg:text-6xl font-black text-brand-teal tracking-tight leading-[1.1]">
                {t('app.hero_title_1')}{' '}
                <span className="bg-gradient-to-r from-brand-orange via-orange-500 to-amber-600 bg-clip-text text-transparent">
                  {t('app.hero_title_2')}
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl font-medium">
                {t('app.hero_desc')}
              </p>

              {/* HIGH-PRIORITY EMERGENCY ACCIDENT BUTTON (Red with Beep Animation) */}
              <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white shadow-2xl shadow-red-600/30 border-2 border-red-400/50 space-y-3 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center relative">
                      <Siren className="w-7 h-7 text-white animate-bounce" />
                      <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-300 opacity-80" />
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-yellow-400" />
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-white/25 text-[10px] font-black uppercase tracking-wider">
                          Accident SOS Trigger
                        </span>
                        <span className="text-red-100 text-xs font-semibold">• Bystanders & Helpers</span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-black text-white">
                        {t('landing.emergency_callout_title')}
                      </h3>
                    </div>
                  </div>

                  {/* Red Animated EMERGENCY Beeping Button */}
                  <button
                    type="button"
                    onClick={() => setIsEmergencyOpen(true)}
                    className="flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl bg-white hover:bg-yellow-300 text-red-700 font-black text-sm uppercase tracking-wider shadow-lg animate-beep-pulse transition-all transform active:scale-95"
                  >
                    <Siren className="w-5 h-5 text-red-600 animate-pulse" />
                    <span>{t('emergency.btn')}</span>
                    <ArrowRight className="w-4 h-4 text-red-600" />
                  </button>
                </div>

                <p className="text-xs text-red-100 font-medium">
                  {t('landing.emergency_callout_desc')}
                </p>
              </div>

              {/* Two Standard CTAs: Donor & Hospital */}
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Link
                  to="/auth?mode=signup&role=individual"
                  className="flex items-center justify-center gap-2.5 px-8 py-4 bg-brand-teal hover:bg-brand-teal/90 text-white font-black rounded-2xl shadow-xl shadow-brand-teal/25 transition-all transform hover:-translate-y-0.5 text-base"
                >
                  <Heart className="w-5 h-5 fill-brand-orange text-brand-orange" />
                  {t('landing.cta_btn_donor')}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>

                <Link
                  to="/auth?mode=signup&role=hospital"
                  className="flex items-center justify-center gap-2.5 px-8 py-4 bg-white hover:bg-orange-50/50 text-slate-800 font-bold rounded-2xl border-2 border-brand-orange/30 shadow-sm transition-all transform hover:-translate-y-0.5 text-base"
                >
                  <Building2 className="w-5 h-5 text-brand-orange" />
                  {t('landing.cta_btn_hospital')}
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200/80">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-brand-teal flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-bold text-slate-700">SHA-256 Ledger</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-brand-orange flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-bold text-slate-700">&lt; 3 Min Dispatch</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-bold text-slate-700">MH Certified</span>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Hero Visual with Brand Logo & Photography */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-5"
            >
              <div className="relative">
                {/* Large decorative circular backdrop in #F48552 */}
                <div className="absolute -top-6 -right-6 w-48 h-48 rounded-full bg-[#F48552]/20 blur-xl pointer-events-none" />

                {/* Hero Showcase Card with Uploaded Logo */}
                <div className="bg-white rounded-3xl p-6 shadow-2xl border-2 border-brand-orange/20 relative overflow-hidden">
                  <div className="flex items-center gap-4 mb-5 pb-4 border-b border-slate-100">
                    <img
                      src="/aarogyam-logo.jpg"
                      alt="Aarogyam Emblem"
                      className="w-16 h-16 object-cover rounded-2xl shadow-md border-2 border-brand-orange"
                    />
                    <div>
                      <span className="text-xs font-black uppercase text-brand-orange tracking-widest block">
                        Official Network
                      </span>
                      <h2 className="text-2xl font-black text-brand-teal">
                        Aarogyam Maharashtra
                      </h2>
                      <p className="text-xs text-slate-500 font-semibold">
                        Mumbai • Pune • Nagpur
                      </p>
                    </div>
                  </div>

                  {/* 3 Quick Action Tiles */}
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => setIsEmergencyOpen(true)}
                      className="w-full p-3.5 rounded-2xl bg-red-50 border border-red-200 hover:border-red-400 text-left flex items-center justify-between transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center animate-pulse">
                          <Phone className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-red-700">1. Direct Ambulance Call</p>
                          <p className="text-[11px] text-slate-500">8 registered fleets with live ETA</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-red-600 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsEmergencyOpen(true)}
                      className="w-full p-3.5 rounded-2xl bg-teal-50 border border-teal-200 hover:border-teal-400 text-left flex items-center justify-between transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-brand-teal text-white flex items-center justify-center">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-brand-teal">2. Private Emergency Hospital</p>
                          <p className="text-[11px] text-slate-500">Check ICU beds & trigger casualty alert</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-brand-teal group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsEmergencyOpen(true)}
                      className="w-full p-3.5 rounded-2xl bg-orange-50 border border-orange-200 hover:border-orange-400 text-left flex items-center justify-between transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-brand-orange text-white flex items-center justify-center">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-brand-orange">3. Government / Civic Hospital</p>
                          <p className="text-[11px] text-slate-500">Free trauma care & on-call doctors</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-brand-orange group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>

                  <div className="mt-5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      Live Central Casualty Link
                    </span>
                    <span className="text-brand-teal font-black font-mono">100% SECURE</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Animated Stats Section */}
      <section className="py-16 sm:py-20 bg-white border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-brand-teal tracking-tight">
              Real Impact, Measured in Lives
            </h2>
            <p className="text-slate-600 mt-2 text-base sm:text-lg font-medium">
              Every count represents a real lifesaving connection made across Mumbai, Pune, and Nagpur.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsList.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="relative group p-7 rounded-3xl bg-slate-50 border border-slate-100 hover:border-brand-teal/30 hover:shadow-xl hover:bg-white transition-all duration-300"
                >
                  <div className={`w-14 h-14 rounded-2xl ${stat.lightColor} flex items-center justify-center mb-6`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  <p className="text-slate-600 font-black mt-2 text-base">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works 3-Step Section */}
      <section className="py-20 lg:py-28 bg-slate-50 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-teal bg-teal-50 px-3.5 py-1.5 rounded-full border border-brand-teal/20">
              {t('landing.how_it_works')}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-brand-teal tracking-tight mt-4">
              Rapid Triage & Instant Allocation
            </h2>
            <p className="text-slate-600 mt-3 text-base sm:text-lg font-medium">
              From roadside accidents to critical organ donations, every step is automated and transparent.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {stepsList.map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.15 }}
                  className="bg-white rounded-3xl p-8 border border-slate-200 shadow-lg relative group hover:border-brand-orange/40 hover:shadow-2xl transition-all"
                >
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-4xl font-black text-brand-orange opacity-40">
                      {step.num}
                    </span>
                    <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-700 rounded-full">
                      {step.badge}
                    </span>
                  </div>

                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center text-white mb-6 shadow-md`}>
                    <Icon className="w-7 h-7" />
                  </div>

                  <h3 className="text-xl font-black text-slate-900 mb-3">{step.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{step.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 lg:py-24 bg-white border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-orange bg-orange-50 px-3 py-1 rounded-full border border-brand-orange/20">
              Verified Stories
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-brand-teal tracking-tight mt-3">
              {t('landing.testimonials_title')}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((tItem, idx) => (
              <div
                key={idx}
                className="bg-slate-50 rounded-3xl p-7 border border-slate-200/80 shadow-sm flex flex-col justify-between"
              >
                <p className="text-sm sm:text-base text-slate-700 italic leading-relaxed mb-6">
                  "{tItem.message}"
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                  <span className="text-3xl">{tItem.image}</span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{tItem.name}</h4>
                    <p className="text-xs text-brand-teal font-semibold">
                      {tItem.role} • {tItem.city}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Floating Bottom SOS Bar for Instant Access */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-lg">
        <div className="bg-slate-900/95 backdrop-blur-md text-white p-3 sm:p-4 rounded-3xl shadow-2xl border-2 border-red-500/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center animate-beep-pulse">
              <Siren className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black uppercase text-red-400">Roadside Accident?</p>
              <p className="text-[11px] text-slate-300">Instant Ambulance & Hospital Bed Alert</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsEmergencyOpen(true)}
            className="px-5 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider shadow-lg animate-pulse"
          >
            {t('emergency.btn')}
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-16 pb-24 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img
                  src="/aarogyam-logo.jpg"
                  alt="Aarogyam Logo"
                  className="w-11 h-11 object-cover rounded-xl border border-brand-orange"
                />
                <span className="text-2xl font-black text-white">Aarogyam</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Next-generation emergency accident response and ethical organ & blood allocation network across Maharashtra.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-4">24/7 Emergency Helpline</h4>
              <div className="space-y-2.5 text-sm text-slate-400">
                <p className="flex items-center gap-2 text-white font-bold text-base">
                  <Phone className="w-4 h-4 text-brand-orange" />
                  108 / 1800-AAROGYAM (Toll Free)
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-brand-orange" />
                  emergency@aarogyam.health
                </p>
                <p className="text-xs text-slate-500">Immediate response within 60 seconds</p>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-4">Active Coverage Zones</h4>
              <div className="grid grid-cols-1 gap-2 text-sm text-slate-400">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <strong>Mumbai</strong> (South, Western, Central)
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <strong>Pune</strong> (Station, Kothrud, Hadapsar)
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <strong>Nagpur</strong> (Medical Square, Wardha Rd)
                </span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link to="/auth?mode=signup&role=individual" className="hover:text-white transition-colors">{t('nav.register_donor')}</Link></li>
                <li><Link to="/auth?mode=signup&role=hospital" className="hover:text-white transition-colors">{t('nav.hospital_access')}</Link></li>
                <li><Link to="/transparency" className="hover:text-white transition-colors">{t('nav.transparency_log')}</Link></li>
                <li><Link to="/reports" className="hover:text-white transition-colors">Allocation Analytics</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>© 2026 Aarogyam Network. Dedicated to Saving Lives in Maharashtra.</p>
            <p className="text-slate-400">Good Samaritan Protected · Instant Accident Triage · SHA-256 Verified</p>
          </div>
        </div>
      </footer>

      {/* Emergency Modal */}
      <EmergencyAccidentModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
      />
    </div>
  );
}
