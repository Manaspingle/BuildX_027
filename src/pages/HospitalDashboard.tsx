import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, CheckCircle2, Clock, Users, Siren, MapPin, ArrowRight,
  Building2, AlertCircle, FileText, Zap, Truck, Eye, Check, ShieldAlert
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { subscribeToRequests, getDonors, getEmergencyIncidents, updateEmergencyIncidentStatus } from '@/lib/firebaseDb';
import type { Request, Donor, EmergencyIncident } from '@/types';

export default function HospitalDashboard() {
  const { hospital } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<Request[]>([]);
  const [donorPool, setDonorPool] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [incidents, setIncidents] = useState<EmergencyIncident[]>([]);

  useEffect(() => {
    if (!hospital) return;

    // Real-time Firestore subscription to hospital requests
    const unsubscribe = subscribeToRequests((data) => {
      setRequests(data);
      setLoading(false);
    }, hospital.id);

    // Get city donor pool
    getDonors(hospital.city).then(setDonorPool);

    // Initial load of emergency incidents
    const loadIncidents = () => {
      const incList = getEmergencyIncidents(hospital.id, hospital.hospital_name);
      setIncidents(incList);
    };
    loadIncidents();

    // Listen for incoming live casualty broadcasts
    const handleAlert = () => loadIncidents();
    window.addEventListener('aarogyam_emergency_alert', handleAlert);
    window.addEventListener('aarogyam_emergency_updated', handleAlert);

    return () => {
      unsubscribe();
      window.removeEventListener('aarogyam_emergency_alert', handleAlert);
      window.removeEventListener('aarogyam_emergency_updated', handleAlert);
    };
  }, [hospital]);

  if (!hospital) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="text-center bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm max-w-md">
          <Building2 className="w-12 h-12 text-primary-600 dark:text-primary-400 mx-auto mb-3 animate-pulse" />
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{t('hospital.portal')}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{t('hospital.login_prompt')}</p>
        </div>
      </div>
    );
  }

  const activeRequests = requests.filter((r) => r.status === 'Pending' || r.status === 'Matched' || r.status === 'Dispatched');
  const fulfilledThisMonth = requests.filter((r) => {
    const d = new Date(r.created_at);
    const now = new Date();
    return r.status === 'Completed' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const avgMatchTime = '2.3 min';

  const statusColors: Record<string, { badge: string; text: string }> = {
    Pending: { badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800', text: 'Pending Matching' },
    Matched: { badge: 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800', text: 'Matched' },
    Dispatched: { badge: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800', text: 'In Transit' },
    Completed: { badge: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700', text: 'Completed' },
    Cancelled: { badge: 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 border-red-200 dark:border-red-800', text: 'Cancelled' },
  };

  const cards = [
    { label: t('hospital.stat_active'), value: activeRequests.length, icon: Activity, color: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-50 dark:bg-primary-950/40' },
    { label: t('hospital.stat_fulfilled'), value: fulfilledThisMonth, icon: CheckCircle2, color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-950/40' },
    { label: t('hospital.stat_avg_time'), value: avgMatchTime, icon: Clock, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/40' },
    { label: t('hospital.stat_donor_pool'), value: donorPool.length, icon: Users, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/40' },
  ];

  // Active unacknowledged or acknowledged casualty incidents
  const activeIncidents = incidents.filter(i => i.status === 'Prepped & Awaiting Patient' || i.status === 'Acknowledged' || i.status === 'Dispatched');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-200">
      
      {/* REAL-TIME CASUALTY ALERT BANNER */}
      <AnimatePresence>
        {activeIncidents.map((incident) => {
          const isPrimary = incident.primary_hospital_id === hospital.id || incident.primary_hospital_name.toLowerCase().includes(hospital.hospital_name.toLowerCase());
          const allocatedPatients = isPrimary ? incident.patients_primary : incident.patients_secondary;
          if (!allocatedPatients || allocatedPatients <= 0) return null;

          return (
            <motion.div
              key={incident.id}
              initial={{ opacity: 0, y: -20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              className="mb-8 p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white shadow-2xl shadow-red-600/30 border-2 border-red-300 relative overflow-hidden"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                <div className="flex items-start gap-4">
                  <div className="w-13 h-13 p-3 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0 animate-beep-pulse">
                    <ShieldAlert className="w-8 h-8 text-yellow-300" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded-full bg-yellow-400 text-red-950 font-black text-xs uppercase tracking-wider animate-pulse">
                        {t('hospital.emergency_alert_title')}
                      </span>
                      <span className="font-mono text-xs text-red-100 bg-black/20 px-2 py-0.5 rounded-md">
                        TOKEN: {incident.token}
                      </span>
                      <span className="text-xs text-red-200 font-semibold">
                        • City: {incident.city}
                      </span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black text-white">
                      {allocatedPatients} {t('hospital.patients_allocated')} • ~{incident.reach_time_minutes} min ETA
                    </h2>
                    <p className="text-xs sm:text-sm text-red-100 max-w-2xl mt-1">
                      {t('hospital.emergency_alert_sub')}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {incident.status === 'Prepped & Awaiting Patient' && (
                    <button
                      onClick={() => {
                        updateEmergencyIncidentStatus(incident.id, 'Acknowledged');
                        setIncidents(getEmergencyIncidents(hospital.id, hospital.hospital_name));
                      }}
                      className="px-5 py-3 rounded-2xl bg-white hover:bg-yellow-300 text-red-700 font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg transition-all transform active:scale-95 flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      {t('hospital.acknowledge')}
                    </button>
                  )}

                  <button
                    onClick={() => {
                      updateEmergencyIncidentStatus(incident.id, 'Received');
                      setIncidents(getEmergencyIncidents(hospital.id, hospital.hospital_name));
                    }}
                    className="px-5 py-3 rounded-2xl bg-black/30 hover:bg-black/40 text-white font-black text-xs sm:text-sm uppercase tracking-wider border border-white/30 transition-all flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    {t('hospital.mark_arrived')}
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary-600/20">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{hospital.hospital_name}</h1>
              {hospital.verified && (
                <span className="px-2.5 py-0.5 bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 text-xs font-bold rounded-md flex items-center gap-1 border border-teal-200 dark:border-teal-800">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {t('hospital.verified')}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              {hospital.address || hospital.city} · {t('hospital.license')}: {hospital.registration_id}
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/create-request')}
          className="flex items-center justify-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold rounded-2xl shadow-xl shadow-primary-600/25 transition-all transform hover:-translate-y-0.5 text-sm"
        >
          <Siren className="w-5 h-5 animate-pulse" />
          {t('hospital.create_request_btn')}
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-md p-5 sm:p-6"
            >
              <div className={`w-11 h-11 ${card.bg} ${card.color} rounded-2xl flex items-center justify-center mb-3`}>
                <Icon className="w-6 h-6" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{card.value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">{card.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Access Tiles */}
      <div className="grid md:grid-cols-3 gap-4 sm:gap-6 mb-8">
        <button
          onClick={() => navigate('/create-request')}
          className="flex items-center justify-between p-6 bg-gradient-to-r from-primary-50 via-white to-red-50/30 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800/80 rounded-3xl border border-primary-200/80 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-primary-400 transition-all text-left group"
        >
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 p-3.5 bg-primary-600 text-white rounded-2xl shadow-lg shadow-primary-600/25 group-hover:scale-105 transition-transform">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <p className="font-black text-slate-900 dark:text-white text-base sm:text-lg">{t('hospital.quick_matching')}</p>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{t('hospital.quick_matching_sub')}</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-primary-600 dark:text-primary-400 group-hover:translate-x-1 transition-transform" />
        </button>

        <button
          onClick={() => navigate('/donor-directory')}
          className="flex items-center justify-between p-6 bg-gradient-to-r from-rose-50 via-white to-primary-50/30 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800/80 rounded-3xl border border-primary-200/80 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-primary-400 transition-all text-left group"
        >
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 p-3.5 bg-primary-700 text-white rounded-2xl shadow-lg shadow-primary-600/25 group-hover:scale-105 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="font-black text-slate-900 dark:text-white text-base sm:text-lg">{t('hospital.quick_donors')}</p>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{t('hospital.quick_donors_sub')}</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-primary-600 dark:text-primary-400 group-hover:translate-x-1 transition-transform" />
        </button>

        <button
          onClick={() => navigate('/nearby-hospitals')}
          className="flex items-center justify-between p-6 bg-gradient-to-r from-teal-50 via-white to-emerald-50/30 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800/80 rounded-3xl border border-teal-200/80 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-teal-400 transition-all text-left group"
        >
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 p-3.5 bg-teal-600 text-white rounded-2xl shadow-lg shadow-teal-600/25 group-hover:scale-105 transition-transform">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <p className="font-black text-slate-900 dark:text-white text-base sm:text-lg">{t('hospital.quick_nearby')}</p>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{t('hospital.quick_nearby_sub')}</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-teal-600 dark:text-teal-400 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Requests Management Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-md overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-black text-slate-900 dark:text-white text-lg sm:text-xl">{t('hospital.requests_title')}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t('hospital.requests_sub')}</p>
          </div>
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
            {requests.length} Logs
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 font-medium">Syncing live requests...</div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-600 dark:text-slate-300 font-bold">{t('hospital.no_requests')}</p>
            <p className="text-xs text-slate-400 mt-1 mb-4">{t('hospital.no_requests_sub')}</p>
            <button
              onClick={() => navigate('/create-request')}
              className="px-5 py-2.5 bg-primary-600 text-white rounded-xl text-xs font-bold"
            >
              {t('hospital.create_request_btn')}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left px-6 py-3.5 font-bold">{t('hospital.th_type')}</th>
                  <th className="text-left px-6 py-3.5 font-bold">{t('hospital.th_item')}</th>
                  <th className="text-left px-6 py-3.5 font-bold">{t('hospital.th_urgency')}</th>
                  <th className="text-left px-6 py-3.5 font-bold">{t('hospital.th_city')}</th>
                  <th className="text-left px-6 py-3.5 font-bold">{t('hospital.match_score')}</th>
                  <th className="text-left px-6 py-3.5 font-bold">{t('hospital.status')}</th>
                  <th className="text-right px-6 py-3.5 font-bold">{t('hospital.action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {requests.map((req) => {
                  const statusInfo = statusColors[req.status] || { badge: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300', text: req.status };
                  return (
                    <tr key={req.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${req.request_type === 'blood' ? 'bg-primary-600' : 'bg-teal-600'}`} />
                          <span className="font-bold capitalize text-slate-900 dark:text-white">{req.request_type}</span>
                        </span>
                      </td>

                      <td className="px-6 py-4 font-black text-slate-900 dark:text-white">{req.specific_type}</td>

                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                          req.urgency === 'Critical' ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300' :
                          req.urgency === 'High' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300' :
                          'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {req.urgency}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-medium">{req.patient_city}</td>

                      <td className="px-6 py-4 font-extrabold text-slate-800 dark:text-slate-200">
                        {req.match_score ? `${req.match_score}%` : '—'}
                      </td>

                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${statusInfo.badge}`}>
                          {statusInfo.text}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        {req.status === 'Pending' && (
                          <button
                            onClick={() => navigate(`/matching-engine?requestId=${req.id}`)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-50 hover:bg-primary-100 dark:bg-primary-950/50 dark:hover:bg-primary-900/60 text-primary-700 dark:text-primary-300 rounded-xl text-xs font-bold transition-all"
                          >
                            <Zap className="w-3.5 h-3.5" /> {t('hospital.match_now')}
                          </button>
                        )}
                        {(req.status === 'Matched' || req.status === 'Dispatched') && (
                          <button
                            onClick={() => navigate(`/dispatch?requestId=${req.id}&donorId=${req.matched_donor_id || 'donor_1'}`)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/50 dark:hover:bg-teal-900/60 text-teal-700 dark:text-teal-300 rounded-xl text-xs font-bold transition-all"
                          >
                            <Truck className="w-3.5 h-3.5" /> {t('hospital.track_dispatch')}
                          </button>
                        )}
                        {req.status === 'Completed' && (
                          <Link
                            to="/transparency"
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all"
                          >
                            <Eye className="w-3.5 h-3.5" /> {t('hospital.hash_log')}
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
