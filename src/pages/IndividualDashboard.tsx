import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Droplet, Heart, Trophy, Award, Star, Crown, Globe, Shield, Zap,
  Bell, Activity, MapPin, Phone, Plus, Medal, CheckCircle2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getDonors, updateDonor, createDonation, getNotifications } from '@/lib/firebaseDb';
import { getProgressToNextLevel, getDonorLevel } from '@/lib/compatibility';
import { BADGES, LEVEL_COLORS } from '@/lib/constants';
import type { Donor, Notification } from '@/types';

const iconMap: Record<string, typeof Heart> = {
  Heart, Droplet, Globe, Shield, Award, Crown, Trophy, Star,
};

export default function IndividualDashboard() {
  const { donor, refreshProfile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [leaderboard, setLeaderboard] = useState<Donor[]>([]);
  const [tab, setTab] = useState<'overview' | 'leaderboard' | 'notifications'>('overview');
  const [updating, setUpdating] = useState(false);
  const [justEarnedPoints, setJustEarnedPoints] = useState(false);

  useEffect(() => {
    if (!donor) return;

    // Fetch notifications
    getNotifications(donor.id).then(setNotifications);

    // Fetch city leaderboard
    getDonors(donor.city).then((data) => {
      const sorted = [...data].sort((a, b) => b.donor_points - a.donor_points).slice(0, 10);
      setLeaderboard(sorted);
    });
  }, [donor]);

  if (!donor) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-3xl border border-slate-100 shadow-sm max-w-md">
          <Heart className="w-12 h-12 text-primary-600 mx-auto mb-3 animate-pulse" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Loading Donor Profile...</h2>
          <p className="text-sm text-slate-500 mb-4">Setting up your profile and synchronizing with Aarogyam.</p>
        </div>
      </div>
    );
  }

  const { current, next, progress } = getProgressToNextLevel(donor.donor_points);

  // Determine earned badges
  const earnedBadges = new Set<string>();
  if (donor.organs.length > 0) earnedBadges.add('first_pledge');
  if (donor.blood_donations >= 3) earnedBadges.add('blood_hero_3');
  if (donor.blood_group === 'O-') earnedBadges.add('universal_donor');
  if (notifications.some((n) => n.type === 'match')) earnedBadges.add('lifesaver');
  if (donor.donor_level === 'Gold' || donor.donor_level === 'Platinum Lifesaver') earnedBadges.add('gold_tier');
  if (donor.donor_level === 'Platinum Lifesaver') earnedBadges.add('platinum');
  if (donor.organs.length >= 3) earnedBadges.add('committed');
  const rank = leaderboard.findIndex((d) => d.id === donor.id);
  if (rank >= 0 && rank < 3) earnedBadges.add('city_champion');

  async function toggleAvailability() {
    if (!donor) return;
    setUpdating(true);
    await updateDonor(donor.id, { available: !donor.available });
    await refreshProfile();
    setUpdating(false);
  }

  async function logBloodDonation() {
    if (!donor) return;
    setUpdating(true);
    const newPoints = donor.donor_points + 30;
    const newLevel = getDonorLevel(newPoints);
    await updateDonor(donor.id, {
      donor_points: newPoints,
      blood_donations: donor.blood_donations + 1,
      donor_level: newLevel,
    });
    await createDonation({
      donor_id: donor.id,
      donation_type: 'blood',
      donation_date: new Date().toISOString().split('T')[0],
      points_earned: 30,
    });
    await refreshProfile();
    setJustEarnedPoints(true);
    setTimeout(() => setJustEarnedPoints(false), 3000);
    setUpdating(false);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" />
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">Active Donor Portal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Welcome back, {donor.full_name.split(' ')[0]}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Track your life-saving impact, donor rank in {donor.city}, and readiness for emergencies.
          </p>
        </div>

        {justEarnedPoints && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-2xl font-bold text-sm"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            +30 Points Awarded!
          </motion.div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 p-1.5 bg-white rounded-2xl border border-slate-200 shadow-sm w-fit">
        {[
          { key: 'overview', label: 'Impact Overview', icon: Activity },
          { key: 'leaderboard', label: `${donor.city} Leaderboard`, icon: Trophy },
          { key: 'notifications', label: 'Match Feed', icon: Bell },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key as typeof tab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                tab === t.key
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'overview' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid lg:grid-cols-3 gap-6"
        >
          {/* Profile Card */}
          <div className="lg:col-span-1 space-y-5">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-primary-600/20">
                  {donor.full_name[0]}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg leading-snug">{donor.full_name}</h3>
                  <p className="text-xs text-slate-400">{donor.email}</p>
                  <span className="inline-block mt-1 px-2.5 py-0.5 bg-primary-50 text-primary-700 text-xs font-bold rounded-md">
                    {donor.donor_level}
                  </span>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Blood Group</span>
                  <span className="font-extrabold text-slate-900 bg-red-50 text-primary-700 px-3 py-1 rounded-xl">
                    {donor.blood_group}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">City Zone</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-primary-600" />{donor.city}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Pledged Organs</span>
                  <span className="font-semibold text-slate-800 text-right max-w-[180px] truncate">
                    {donor.organs.length > 0 ? donor.organs.join(', ') : 'None yet'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Blood Donations</span>
                  <span className="font-bold text-teal-600">{donor.blood_donations} logged</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Phone</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />{donor.phone}
                  </span>
                </div>
              </div>

              {/* Availability Toggle */}
              <div className="mt-5 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-800">Emergency Availability</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {donor.available ? 'Ready for emergency alerts' : 'Temporarily paused'}
                    </p>
                  </div>
                  <button
                    onClick={toggleAvailability}
                    disabled={updating}
                    className={`relative w-14 h-7 rounded-full transition-colors ${
                      donor.available ? 'bg-teal-500' : 'bg-slate-300'
                    }`}
                  >
                    <motion.span
                      animate={{ x: donor.available ? 28 : 2 }}
                      className="absolute top-1 w-5 h-5 bg-white rounded-full shadow"
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <Link
                to="/organ-pledge"
                className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:border-primary-300 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Heart className="w-5 h-5 fill-primary-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">Pledge Organs</p>
                    <p className="text-xs text-slate-500">Update organs willing to donate (+60 pts)</p>
                  </div>
                </div>
                <Plus className="w-5 h-5 text-slate-400 group-hover:text-primary-600 transition-colors" />
              </Link>

              <button
                onClick={logBloodDonation}
                disabled={updating}
                className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:border-teal-300 hover:shadow-md transition-all text-left group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Droplet className="w-5 h-5 fill-teal-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">Log Blood Donation</p>
                    <p className="text-xs text-slate-500">Record a donation event (+30 pts)</p>
                  </div>
                </div>
                <Plus className="w-5 h-5 text-slate-400 group-hover:text-teal-600 transition-colors" />
              </button>
            </div>
          </div>

          {/* Gamification & Impact Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gamification Level Widget */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-6 sm:p-7">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    Donor Level System
                  </span>
                  <h3 className="text-xl font-black text-slate-900">Lifesaver Progression</h3>
                </div>
                <span
                  className="px-3.5 py-1.5 rounded-xl text-xs font-black text-white self-start sm:self-auto shadow-sm"
                  style={{ backgroundColor: LEVEL_COLORS[donor.donor_level] || '#DC2626' }}
                >
                  {donor.donor_level} Tier
                </span>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg flex-shrink-0"
                  style={{ backgroundColor: LEVEL_COLORS[donor.donor_level] || '#DC2626' }}
                >
                  <Medal className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm font-bold mb-1.5">
                    <span className="text-slate-800">{donor.donor_points} Lifetime Points</span>
                    <span className="text-slate-500 text-xs font-semibold">
                      {next ? `Next: ${next}` : 'Max Tier Reached 👑'}
                    </span>
                  </div>
                  <div className="h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full rounded-full shadow-sm"
                      style={{ backgroundColor: LEVEL_COLORS[donor.donor_level] || '#DC2626' }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5 font-medium">
                    {next
                      ? `${Math.round(progress)}% progress towards ${next}`
                      : "You've unlocked the highest honor in the Aarogyam network!"}
                  </p>
                </div>
              </div>
            </div>

            {/* Badges Section */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-6 sm:p-7">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-black text-slate-900 text-lg">Earned & Unlockable Badges</h3>
                  <p className="text-xs text-slate-500">Collect milestone badges by pledging and donating regularly</p>
                </div>
                <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2.5 py-1 rounded-lg">
                  {earnedBadges.size} / {BADGES.length} Unlocked
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                {BADGES.map((badge) => {
                  const Icon = iconMap[badge.icon] || Award;
                  const earned = earnedBadges.has(badge.id);
                  return (
                    <div
                      key={badge.id}
                      className={`text-center p-4 rounded-2xl border transition-all ${
                        earned
                          ? 'bg-gradient-to-b from-amber-50/60 to-white border-amber-200 shadow-sm'
                          : 'bg-slate-50/50 border-slate-100 opacity-45 grayscale'
                      }`}
                    >
                      <div className={`w-12 h-12 mx-auto rounded-2xl flex items-center justify-center mb-2.5 ${
                        earned ? 'bg-amber-100 text-amber-600 shadow-sm' : 'bg-slate-200 text-slate-400'
                      }`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <p className={`text-xs font-bold ${earned ? 'text-slate-900' : 'text-slate-500'}`}>
                        {badge.name}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-tight">
                        {badge.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 text-center">
                <div className="w-10 h-10 mx-auto mb-2 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center font-bold">
                  <Zap className="w-5 h-5" />
                </div>
                <p className="text-2xl font-black text-slate-900">{donor.donor_points}</p>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">Total Points</p>
              </div>

              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 text-center">
                <div className="w-10 h-10 mx-auto mb-2 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                  <Droplet className="w-5 h-5" />
                </div>
                <p className="text-2xl font-black text-slate-900">{donor.blood_donations}</p>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">Donations</p>
              </div>

              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 text-center">
                <div className="w-10 h-10 mx-auto mb-2 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
                  <Heart className="w-5 h-5" />
                </div>
                <p className="text-2xl font-black text-slate-900">{donor.organs.length}</p>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">Organs Pledged</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {tab === 'leaderboard' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Top Donors in {donor.city}</h3>
                  <p className="text-xs text-slate-500">Live rankings based on donation frequency and organ pledges</p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {leaderboard.map((d, i) => {
                const isYou = d.id === donor.id;
                return (
                  <div
                    key={d.id}
                    className={`flex items-center gap-4 p-4 sm:p-5 transition-colors ${
                      isYou ? 'bg-primary-50/80' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm ${
                      i === 0 ? 'bg-amber-100 text-amber-700 shadow-sm' :
                      i === 1 ? 'bg-slate-200 text-slate-700' :
                      i === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      #{i + 1}
                    </div>

                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center font-bold text-sm">
                      {d.full_name[0]}
                    </div>

                    <div className="flex-1">
                      <p className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        {d.full_name}
                        {isYou && (
                          <span className="px-2 py-0.5 bg-primary-600 text-white text-[10px] font-black rounded-md">
                            YOU
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-slate-500">
                        {d.blood_group} Blood · {d.blood_donations} blood donations · {d.organs.length} organs pledged
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-black text-slate-900 text-base">{d.donor_points} pts</p>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md text-white"
                        style={{ backgroundColor: LEVEL_COLORS[d.donor_level] || '#DC2626' }}
                      >
                        {d.donor_level}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {tab === 'notifications' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center">
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Alerts & Match History</h3>
                <p className="text-xs text-slate-500">Live notifications when your blood or organs match a hospital request</p>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {notifications.length === 0 ? (
                <div className="p-12 text-center">
                  <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-bold">No notifications yet</p>
                  <p className="text-xs text-slate-400 mt-1">
                    When a hospital in {donor.city} triggers an emergency match, you'll receive immediate alerts here.
                  </p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className="p-4 sm:p-5 flex items-start gap-4 hover:bg-slate-50 transition-colors">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                      n.type === 'match' ? 'bg-red-100 text-primary-600' : 'bg-amber-100 text-amber-600'
                    }`}>
                      {n.type === 'match' ? <Shield className="w-5 h-5" /> : <Award className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-800">{n.message}</p>
                      <p className="text-xs text-slate-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
