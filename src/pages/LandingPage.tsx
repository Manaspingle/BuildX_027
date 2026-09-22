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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-brand-teal selection:text-white transition-colors duration-200">
      {/* Top Bar / Header */}
      <Navbar />

      {/* Hero Section with Large Decorative Spheres in #F48552 and Brand Teal Accents */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-orange-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pt-8 pb-20 lg:pt-16 lg:pb-28 border-b border-slate-200/60 dark:border-slate-800">
        {/* Large Decorative Spheres in Orange #F48552 */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#F48552]/15 dark:bg-[#F48552]/10 blur-3xl pointer-events-none animate-pulse-slow" />
        <div className="absolute top-1/2 -left-20 w-80 h-80 rounded-full bg-[#F48552]/10 dark:bg-[#F48552]/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-5 right-1/3 w-72 h-72 rounded-full bg-[#00605F]/10 dark:bg-[#00605F]/15 blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Top Announcement & Language Quick Select Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-teal-50 dark:bg-teal-950/60 border border-brand-teal/20 text-brand-teal dark:text-teal-300 rounded-full text-xs sm:text-sm font-bold shadow-sm">
              <span className="w-2.5 h-2.5 bg-brand-teal rounded-full animate-ping" />
              <span>{t('app.hero_badge')}</span>
            </div>

            {/* Language Selector Dropdown on Landing Page as explicitly requested */}
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3.5 py-1.5 rounded-2xl border-2 border-brand-orange/30 shadow-sm">
              <Globe className="w-4 h-4 text-brand-orange" />
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{t('common.language')}:</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="bg-transparent text-xs font-black text-brand-teal dark:text-teal-400 focus:outline-none cursor-pointer pr-1"
              >
                <option value="en" className="dark:bg-slate-800 text-slate-900 dark:text-white">English</option>
                <option value="hi" className="dark:bg-slate-800 text-slate-900 dark:text-white">हिन्दी (Hindi)</option>
                <option value="mr" className="dark:bg-slate-800 text-slate-900 dark:text-white">मराठी (Marathi)</option>
              </select>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content Column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-6 space-y-6"
            >
              {/* Main Headline with Hindi/Marathi friendly line height */}
              <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-black text-brand-teal dark:text-teal-400 ${
                language !== 'en' ? 'leading-normal sm:leading-snug tracking-normal' : 'tracking-tight leading-[1.15]'
              }`}>
                {t('app.hero_title_1')}{' '}
                <span className="bg-gradient-to-r from-brand-orange via-orange-500 to-amber-600 bg-clip-text text-transparent">
                  {t('app.hero_title_2')}
                </span>
              </h1>

              <p className={`text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 max-w-2xl font-medium ${
                language !== 'en' ? 'leading-relaxed' : 'leading-relaxed'
              }`}>
                {t('app.hero_desc')}
              </p>

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
                  className="flex items-center justify-center gap-2.5 px-8 py-4 bg-white dark:bg-slate-800 hover:bg-orange-50/50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold rounded-2xl border-2 border-brand-orange/30 shadow-sm transition-all transform hover:-translate-y-0.5 text-base"
                >
                  <Building2 className="w-5 h-5 text-brand-orange" />
                  {t('landing.cta_btn_hospital')}
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-6 border-t border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-brand-teal dark:text-teal-400 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">SHA-256 Ledger</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-brand-orange flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">&lt; 3 Min Dispatch</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">MH Certified</span>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Inspiring Photographic Showcase of Doctors & Donors Helping */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="lg:col-span-6"
            >
              <div className="relative">
                {/* Large decorative circular backdrop in #F48552 */}
                <div className="absolute -top-6 -right-6 w-60 h-60 rounded-full bg-[#F48552]/20 dark:bg-[#F48552]/10 blur-2xl pointer-events-none" />

                {/* Hero Showcase Card with Doctor & Donation Photography */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 shadow-2xl border-2 border-brand-orange/20 dark:border-slate-800 relative overflow-hidden">
                  
                  {/* Top Header inside card */}
                  <div className="flex items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <img
                        src="/aarogyam-logo.jpg"
                        alt="Aarogyam Emblem"
                        className="w-12 h-12 sm:w-14 sm:h-14 object-cover rounded-2xl shadow-md border-2 border-brand-orange"
                      />
                      <div>
                        <span className="text-[11px] font-black uppercase text-brand-orange tracking-widest block">
                          Lifesaving Mission
                        </span>
                        <h2 className="text-xl sm:text-2xl font-black text-brand-teal dark:text-teal-400">
                          Aarogyam Maharashtra
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                          Mumbai • Pune • Nagpur
                        </p>
                      </div>
                    </div>

                    <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-bold border border-emerald-200 dark:border-emerald-800/50">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      <span>24/7 Active Care</span>
                    </div>
                  </div>

                  {/* Inspiring Imagery Grid */}
                  <div className="grid grid-cols-2 gap-3.5 mb-5">
                    {/* Image 1: Dedicated Critical Care Doctors */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                      className="relative rounded-2xl overflow-hidden shadow-md group h-40 sm:h-44"
                    >
                      <img
                        src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=700&q=80"
                        alt="Dedicated Medical Doctors and Trauma Care Team"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent p-3 flex flex-col justify-end">
                        <div className="flex items-center gap-1.5 text-white text-xs font-black">
                          <Stethoscope className="w-3.5 h-3.5 text-brand-orange" />
                          <span>Specialist Doctors</span>
                        </div>
                        <p className="text-[10px] text-slate-200 line-clamp-1">Expert Emergency ICU & Trauma Teams</p>
                      </div>
                    </motion.div>

                    {/* Image 2: Blood Donation & Volunteer Care */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                      className="relative rounded-2xl overflow-hidden shadow-md group h-40 sm:h-44"
                    >
                      <img
                        src="https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&w=700&q=80"
                        alt="Blood Donation and Lifesaving Volunteer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent p-3 flex flex-col justify-end">
                        <div className="flex items-center gap-1.5 text-white text-xs font-black">
                          <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                          <span>Blood & Organ Gifts</span>
                        </div>
                        <p className="text-[10px] text-slate-200 line-clamp-1">Volunteer Donors Saving Lives Daily</p>
                      </div>
                    </motion.div>

                    {/* Image 3: Compassionate Care & Patient Support */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                      className="relative rounded-2xl overflow-hidden shadow-md group h-36 sm:h-40"
                    >
                      <img
                        src="https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=700&q=80"
                        alt="Compassionate Medical Support and Bystander Care"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent p-3 flex flex-col justify-end">
                        <div className="flex items-center gap-1.5 text-white text-xs font-black">
                          <HandHeart className="w-3.5 h-3.5 text-brand-teal" />
                          <span>Compassionate Helpers</span>
                        </div>
                        <p className="text-[10px] text-slate-200 line-clamp-1">Good Samaritan Protected Aid</p>
                      </div>
                    </motion.div>

                    {/* Image 4: Rapid Ambulance & Trauma Response */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                      className="relative rounded-2xl overflow-hidden shadow-md group h-36 sm:h-40"
                    >
                      <img
                        src="https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=700&q=80"
                        alt="Emergency Hospital Response Equipment"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent p-3 flex flex-col justify-end">
                        <div className="flex items-center gap-1.5 text-white text-xs font-black">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Green Corridors</span>
                        </div>
                        <p className="text-[10px] text-slate-200 line-clamp-1">Instant Multi-Hospital Bed Allocation</p>
                      </div>
                    </motion.div>
                  </div>

                  {/* Motivational Quote & Assurance Banner */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-teal-50/80 via-orange-50/60 to-teal-50/80 dark:from-slate-800/80 dark:to-slate-800/80 border border-brand-teal/15 dark:border-slate-700 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-brand-orange animate-pulse" />
                      Every donor pledge gives someone another tomorrow.
                    </span>
                    <span className="text-brand-teal dark:text-teal-400 font-black font-mono tracking-wider hidden sm:inline">MAHARASHTRA</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Animated Stats Section */}
      <section className="py-16 sm:py-20 bg-white dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-brand-teal dark:text-teal-400 tracking-tight">
              Real Impact, Measured in Lives
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-2 text-base sm:text-lg font-medium">
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
                  className="relative group p-7 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 hover:border-brand-teal/30 hover:shadow-xl hover:bg-white dark:hover:bg-slate-800 transition-all duration-300"
                >
                  <div className={`w-14 h-14 rounded-2xl ${stat.lightColor} flex items-center justify-center mb-6`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  <p className="text-slate-600 dark:text-slate-300 font-black mt-2 text-base">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works 3-Step Section */}
      <section className="py-20 lg:py-28 bg-slate-50 dark:bg-slate-950 border-b border-slate-200/60 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-teal bg-teal-50 dark:bg-teal-950/50 px-3.5 py-1.5 rounded-full border border-brand-teal/20">
              {t('landing.how_it_works')}
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-brand-teal dark:text-teal-400 tracking-tight mt-4">
              Rapid Triage & Instant Allocation
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-3 text-base sm:text-lg font-medium">
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
                  className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-lg relative group hover:border-brand-orange/40 hover:shadow-2xl transition-all"
                >
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-4xl font-black text-brand-orange opacity-40">
                      {step.num}
                    </span>
                    <span className="text-xs font-bold px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full">
                      {step.badge}
                    </span>
                  </div>

                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center text-white mb-6 shadow-md`}>
                    <Icon className="w-7 h-7" />
                  </div>

                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3">{step.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 lg:py-24 bg-white dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-orange bg-orange-50 dark:bg-orange-950/50 px-3 py-1 rounded-full border border-brand-orange/20">
              Verified Stories
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-brand-teal dark:text-teal-400 tracking-tight mt-3">
              {t('landing.testimonials_title')}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((tItem, idx) => (
              <div
                key={idx}
                className="bg-slate-50 dark:bg-slate-800/70 rounded-3xl p-7 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col justify-between"
              >
                <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 italic leading-relaxed mb-6">
                  "{tItem.message}"
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-3xl">{tItem.image}</span>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{tItem.name}</h4>
                    <p className="text-xs text-brand-teal dark:text-teal-400 font-semibold">
                      {tItem.role} • {tItem.city}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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
