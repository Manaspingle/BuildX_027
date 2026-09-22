import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity, CheckCircle2, Clock, Users, Siren, MapPin, ArrowRight,
  Building2, AlertCircle, FileText, Zap, Truck, Eye
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { subscribeToRequests, getDonors } from '@/lib/firebaseDb';
import type { Request, Donor } from '@/types';

export default function HospitalDashboard() {
  const { hospital } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<Request[]>([]);
  const [donorPool, setDonorPool] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hospital) return;

    // Real-time Firestore subscription to hospital requests
    const unsubscribe = subscribeToRequests((data) => {
      setRequests(data);
      setLoading(false);
    }, hospital.id);

    // Get city donor pool
    getDonors(hospital.city).then(setDonorPool);

    return () => unsubscribe();
  }, [hospital]);

  if (!hospital) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-3xl border border-slate-100 shadow-sm max-w-md">
          <Building2 className="w-12 h-12 text-primary-600 mx-auto mb-3 animate-pulse" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Hospital Portal</h2>
          <p className="text-sm text-slate-500 mb-4">Please log in with a registered medical center account to access emergency requests.</p>
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
    Pending: { badge: 'bg-amber-100 text-amber-800 border-amber-200', text: 'Pending Matching' },
    Matched: { badge: 'bg-teal-100 text-teal-800 border-teal-200', text: 'Matched' },
    Dispatched: { badge: 'bg-blue-100 text-blue-800 border-blue-200', text: 'In Transit' },
    Completed: { badge: 'bg-slate-100 text-slate-700 border-slate-200', text: 'Completed' },
    Cancelled: { badge: 'bg-red-100 text-red-700 border-red-200', text: 'Cancelled' },
  };

  const cards = [
    { label: 'Active Requests', value: activeRequests.length, icon: Activity, color: 'text-primary-600', bg: 'bg-primary-50' },
    { label: 'Fulfilled This Month', value: fulfilledThisMonth, icon: CheckCircle2, color: 'text-teal-600', bg: 'bg-teal-50' },
    { label: 'Average Match Time', value: avgMatchTime, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'City Donor Pool Size', value: donorPool.length, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary-600/20">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{hospital.hospital_name}</h1>
              {hospital.verified && (
                <span className="px-2.5 py-0.5 bg-teal-100 text-teal-800 text-xs font-bold rounded-md flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-4 h-4 text-primary-600" />
              {hospital.address || hospital.city} · License: {hospital.registration_id}
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/create-request')}
          className="flex items-center justify-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold rounded-2xl shadow-xl shadow-primary-600/25 transition-all transform hover:-translate-y-0.5 text-sm"
        >
          <Siren className="w-5 h-5 animate-pulse" />
          Create Emergency Request
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
              className="bg-white rounded-3xl border border-slate-100 shadow-md p-5 sm:p-6"
            >
              <div className={`w-11 h-11 ${card.bg} ${card.color} rounded-2xl flex items-center justify-center mb-3`}>
                <Icon className="w-6 h-6" />
              </div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900">{card.value}</p>
              <p className="text-xs text-slate-500 font-semibold mt-1">{card.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Access Tiles */}
      <div className="grid md:grid-cols-3 gap-4 sm:gap-6 mb-8">
        <button
          onClick={() => navigate('/create-request')}
          className="flex items-center justify-between p-6 bg-gradient-to-r from-primary-50 via-white to-red-50/30 rounded-3xl border border-primary-200/80 shadow-sm hover:shadow-md hover:border-primary-400 transition-all text-left group"
        >
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 p-3.5 bg-primary-600 text-white rounded-2xl shadow-lg shadow-primary-600/25 group-hover:scale-105 transition-transform">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <p className="font-black text-slate-900 text-base sm:text-lg">Trigger Matching Engine</p>
              <p className="text-xs sm:text-sm text-slate-500">Initiate emergency donor compatibility search</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-primary-600 group-hover:translate-x-1 transition-transform" />
        </button>

        <button
          onClick={() => navigate('/donor-directory')}
          className="flex items-center justify-between p-6 bg-gradient-to-r from-rose-50 via-white to-primary-50/30 rounded-3xl border border-primary-200/80 shadow-sm hover:shadow-md hover:border-primary-400 transition-all text-left group"
        >
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 p-3.5 bg-primary-700 text-white rounded-2xl shadow-lg shadow-primary-600/25 group-hover:scale-105 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="font-black text-slate-900 text-base sm:text-lg">Connect with Donors</p>
              <p className="text-xs sm:text-sm text-slate-500">See available blood and posthumous organ pledges</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-primary-600 group-hover:translate-x-1 transition-transform" />
        </button>

        <button
          onClick={() => navigate('/nearby-hospitals')}
          className="flex items-center justify-between p-6 bg-gradient-to-r from-teal-50 via-white to-emerald-50/30 rounded-3xl border border-teal-200/80 shadow-sm hover:shadow-md hover:border-teal-400 transition-all text-left group"
        >
          <div className="flex items-center gap-4">
            <div className="w-13 h-13 p-3.5 bg-teal-600 text-white rounded-2xl shadow-lg shadow-teal-600/25 group-hover:scale-105 transition-transform">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <p className="font-black text-slate-900 text-base sm:text-lg">Search Nearby Hospital Stock</p>
              <p className="text-xs sm:text-sm text-slate-500">Request cross-center organ or blood transfers</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-teal-600 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Requests Management Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-md overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-black text-slate-900 text-lg sm:text-xl">Active & Past Emergency Requests</h3>
            <p className="text-xs text-slate-500">Real-time status tracking with direct matching engine and dispatch access</p>
          </div>
          <span className="text-xs font-bold text-slate-400">
            {requests.length} Total Logs
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 font-medium">Syncing live requests...</div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-bold">No requests submitted yet</p>
            <p className="text-xs text-slate-400 mt-1 mb-4">Create your first emergency request to activate the matching engine.</p>
            <button
              onClick={() => navigate('/create-request')}
              className="px-5 py-2.5 bg-primary-600 text-white rounded-xl text-xs font-bold"
            >
              Create Request
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left px-6 py-3.5 font-bold">Type</th>
                  <th className="text-left px-6 py-3.5 font-bold">Required Item</th>
                  <th className="text-left px-6 py-3.5 font-bold">Urgency</th>
                  <th className="text-left px-6 py-3.5 font-bold">City</th>
                  <th className="text-left px-6 py-3.5 font-bold">Match Score</th>
                  <th className="text-left px-6 py-3.5 font-bold">Status</th>
                  <th className="text-right px-6 py-3.5 font-bold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((req) => {
                  const statusInfo = statusColors[req.status] || { badge: 'bg-slate-100 text-slate-700', text: req.status };
                  return (
                    <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${req.request_type === 'blood' ? 'bg-primary-600' : 'bg-teal-600'}`} />
                          <span className="font-bold capitalize text-slate-900">{req.request_type}</span>
                        </span>
                      </td>

                      <td className="px-6 py-4 font-black text-slate-900">{req.specific_type}</td>

                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                          req.urgency === 'Critical' ? 'bg-red-100 text-red-700' :
                          req.urgency === 'High' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {req.urgency}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-slate-600 font-medium">{req.patient_city}</td>

                      <td className="px-6 py-4 font-extrabold text-slate-800">
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
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-xl text-xs font-bold transition-all"
                          >
                            <Zap className="w-3.5 h-3.5" /> Match Now
                          </button>
                        )}
                        {(req.status === 'Matched' || req.status === 'Dispatched') && (
                          <button
                            onClick={() => navigate(`/dispatch?requestId=${req.id}&donorId=${req.matched_donor_id || 'donor_1'}`)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-xl text-xs font-bold transition-all"
                          >
                            <Truck className="w-3.5 h-3.5" /> Track Dispatch
                          </button>
                        )}
                        {req.status === 'Completed' && (
                          <Link
                            to="/transparency"
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
                          >
                            <Eye className="w-3.5 h-3.5" /> Hash Log
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
