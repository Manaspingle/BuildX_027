import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import {
  Heart, Users, Building2, MapPin, ArrowRight, ShieldCheck, Zap,
  Award, Phone, Mail, HandHeart
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

const statsList = [
  { label: 'Lives Saved', value: LANDING_STATS.lives_saved, suffix: '+', icon: Heart, color: 'from-primary-500 to-primary-700', lightColor: 'bg-primary-50 text-primary-600' },
  { label: 'Active Donors', value: LANDING_STATS.active_donors, suffix: '+', icon: Users, color: 'from-teal-500 to-teal-700', lightColor: 'bg-teal-50 text-teal-600' },
  { label: 'Hospitals Connected', value: LANDING_STATS.hospitals_connected, suffix: '+', icon: Building2, color: 'from-blue-500 to-blue-700', lightColor: 'bg-blue-50 text-blue-600' },
  { label: 'Cities Covered', value: LANDING_STATS.cities_covered, suffix: '', icon: MapPin, color: 'from-purple-500 to-purple-700', lightColor: 'bg-purple-50 text-purple-600' },
];

const stepsList = [
  {
    num: '01',
    title: 'Register Your Pledge',
    desc: 'Individuals sign up to pledge posthumous organs or volunteer for blood donation. Hospitals register with verified credentials.',
    icon: Users,
    gradient: 'from-primary-600 to-primary-700',
    badge: 'Step 1',
  },
  {
    num: '02',
    title: 'Instant AI Matching',
    desc: 'When an emergency occurs, our algorithm matches eligible donors by blood compatibility (50%), proximity (30%), and reliability (20%).',
    icon: Zap,
    gradient: 'from-teal-600 to-teal-700',
    badge: 'Step 2',
  },
  {
    num: '03',
    title: 'Save a Life in Real Time',
    desc: 'Trigger instant alerts, simulate donor response, and monitor live cold-chain logistics telemetry with full hash verification.',
    icon: Heart,
    gradient: 'from-red-600 to-primary-600',
    badge: 'Step 3',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-primary-500 selection:text-white">
      {/* Top Bar / Header */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-red-50/20 pt-12 pb-24 lg:pt-20 lg:pb-32 border-b border-slate-200/60">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary-200/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content Column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 space-y-6"
            >
              <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-primary-50 border border-primary-200/60 text-primary-700 rounded-full text-xs sm:text-sm font-bold shadow-sm">
                <span className="w-2.5 h-2.5 bg-primary-600 rounded-full animate-ping" />
                <span>Next-Gen City-Based Emergency Allocation</span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
                Connecting Life,{' '}
                <span className="bg-gradient-to-r from-primary-600 via-red-600 to-primary-800 bg-clip-text text-transparent">
                  One Match
                </span>{' '}
                at a Time
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl">
                A unified platform connecting individuals, donors, and hospitals within city zones. Fast, explainable AI matching, live cold-chain telemetry, and cryptographic transparency for ethical organ and blood allocation.
              </p>

              {/* Two Clear CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Link
                  to="/auth?mode=signup&role=individual"
                  className="flex items-center justify-center gap-2.5 px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold rounded-2xl shadow-xl shadow-primary-600/25 transition-all transform hover:-translate-y-0.5 text-base"
                >
                  <Heart className="w-5 h-5 fill-white" />
                  Register as Donor
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>

                <Link
                  to="/auth?mode=signup&role=hospital"
                  className="flex items-center justify-center gap-2.5 px-8 py-4 bg-white hover:bg-slate-100 text-slate-800 font-bold rounded-2xl border-2 border-slate-200 shadow-sm transition-all transform hover:-translate-y-0.5 text-base"
                >
                  <Building2 className="w-5 h-5 text-primary-600" />
                  Hospital Access
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200/80">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-teal-600 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-semibold text-slate-700">SHA-256 Verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary-600 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-semibold text-slate-700">&lt; 3 Min Match</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-semibold text-slate-700">Transparent Care</span>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Inspiring donation photography */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-5"
            >
              <div className="relative">
                <div className="grid grid-cols-2 gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1536856136534-bb679c52a9aa?auto=format&fit=crop&w=800&q=80"
                    alt="Volunteer donating blood"
                    className="h-44 sm:h-52 w-full object-cover rounded-3xl shadow-xl"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <img
                    src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80"
                    alt="Care team supporting a patient"
                    className="h-44 sm:h-52 w-full object-cover rounded-3xl shadow-xl mt-8"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=800&q=80"
                    alt="People holding hands in solidarity"
                    className="h-36 sm:h-44 w-full object-cover rounded-3xl shadow-xl -mt-4"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=800&q=80"
                    alt="Hands forming a heart"
                    className="h-36 sm:h-44 w-full object-cover rounded-3xl shadow-xl"
                  />
                </div>
                <div className="mt-4 bg-white rounded-3xl p-5 shadow-xl border border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-3 py-1 bg-red-50 text-primary-700 text-xs font-black rounded-full flex items-center gap-1.5">
                      <HandHeart className="w-3.5 h-3.5" />
                      Give someone another tomorrow
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">1 donor · 8 lives</span>
                  </div>
                  <p className="text-sm text-slate-600 italic leading-relaxed">
                    “To the world you may be one person, but to a patient awaiting a donor, you are the entire world.”
                  </p>
                  <Link
                    to="/auth?mode=signup&role=individual"
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-sm"
                  >
                    Pledge organs or donate blood
                    <ArrowRight className="w-4 h-4" />
                  </Link>
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
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Real Impact, Measured in Lives
            </h2>
            <p className="text-slate-600 mt-2 text-base sm:text-lg">
              Every count represents a real connection made in critical moments across India's top metropolitan hubs.
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
                  className="relative group p-7 rounded-3xl bg-slate-50 border border-slate-100 hover:border-slate-200 hover:shadow-xl hover:bg-white transition-all duration-300"
                >
                  <div className={`w-14 h-14 rounded-2xl ${stat.lightColor} flex items-center justify-center mb-6`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  <p className="text-slate-600 font-bold mt-2 text-base">{stat.label}</p>
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
            <span className="text-xs font-bold uppercase tracking-widest text-primary-600 bg-primary-50 px-3 py-1 rounded-full border border-primary-200/60">
              Simple 3-Step Flow
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mt-3">
              How Aarogyam Works
            </h2>
            <p className="text-slate-600 mt-3 text-base sm:text-lg">
              Designed for extreme speed in life-threatening scenarios without compromising medical safety or ethics.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {stepsList.map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.15 }}
                  className="relative bg-white rounded-3xl p-8 shadow-lg shadow-slate-200/50 border border-slate-200/70 hover:border-primary-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.gradient} text-white flex items-center justify-center shadow-lg shadow-primary-600/20`}>
                        <Icon className="w-7 h-7" />
                      </div>
                      <span className="text-3xl font-black text-slate-200">{step.num}</span>
                    </div>
                    <span className="text-xs font-extrabold text-primary-600 uppercase tracking-wider">
                      {step.badge}
                    </span>
                    <h3 className="text-2xl font-bold text-slate-900 mt-1 mb-3">{step.title}</h3>
                    <p className="text-slate-600 leading-relaxed text-sm sm:text-base">{step.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials / Impact Section */}
      <section className="py-20 bg-white border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-primary-600 bg-primary-50 px-3 py-1 rounded-full border border-primary-200/60">
              Community Voices
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-3">
              Stories of Lives Transformed
            </h2>
            <p className="text-slate-600 mt-2 text-base">
              Real testimonials from donors, hospitals, and recipients connected through Aarogyam.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, idx) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-slate-50 rounded-3xl p-8 shadow-sm border border-slate-200/80 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3.5 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-2xl">
                      {t.image}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{t.name}</h4>
                      <p className="text-xs text-primary-600 font-semibold">{t.role} · {t.city}</p>
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm sm:text-base leading-relaxed italic">
                    "{t.message}"
                  </p>
                </div>
                <div className="mt-6 flex text-amber-400 text-sm">★★★★★</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center text-white">
                  <Heart className="w-5 h-5" fill="white" />
                </div>
                <span className="font-black text-2xl text-white">Aarogyam</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Emergency Blood & Organ Allocation network connecting citizens and medical centers with real-time matching and transparency.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-4">24/7 Emergency Helpline</h4>
              <div className="space-y-2.5 text-sm text-slate-400">
                <p className="flex items-center gap-2 text-white font-bold text-base">
                  <Phone className="w-4 h-4 text-primary-500" />
                  1800-AAROGYAM (Toll Free)
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary-500" />
                  emergency@aarogyam.health
                </p>
                <p className="text-xs text-slate-500">Immediate response within 90 seconds</p>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-4">Coverage Zones</h4>
              <div className="grid grid-cols-2 gap-2 text-sm text-slate-400">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Mumbai</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Delhi NCR</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Bangalore</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Hyderabad</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Chennai</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Pune</span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link to="/auth?mode=signup&role=individual" className="hover:text-white transition-colors">Donor Pledge Registry</Link></li>
                <li><Link to="/auth?mode=signup&role=hospital" className="hover:text-white transition-colors">Hospital Portal</Link></li>
                <li><Link to="/transparency" className="hover:text-white transition-colors">Public Transparency Ledger</Link></li>
                <li><Link to="/reports" className="hover:text-white transition-colors">Allocation Analytics</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>© 2026 Aarogyam Network. All rights reserved.</p>
            <p className="text-slate-400">Ethical AI · Certified Cold-Chain Telemetry · Open Verification</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
