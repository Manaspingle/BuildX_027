import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Zap, MapPin, Shield, Info, ArrowRight, CheckCircle2, Sparkles, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getRequestById, getDonors, updateRequest } from '@/lib/firebaseDb';
import { scoreDonors } from '@/lib/compatibility';
import type { Donor, Request, ScoredDonor } from '@/types';

export default function MatchingEngine() {
  const { hospital } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const requestId = searchParams.get('requestId');

  const [request, setRequest] = useState<Request | null>(null);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [scoredDonors, setScoredDonors] = useState<ScoredDonor[]>([]);
  const [displayScores, setDisplayScores] = useState<Record<string, number>>({});
  const [scoring, setScoring] = useState(true);
  const [selectedDonor, setSelectedDonor] = useState<ScoredDonor | null>(null);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!requestId) return;

    Promise.all([
      getRequestById(requestId),
      getDonors(),
    ]).then(([reqData, allDonors]) => {
      if (reqData) setRequest(reqData);
      setDonors(allDonors);
      setLoading(false);
    });
  }, [requestId]);

  useEffect(() => {
    if (!request || donors.length === 0) return;

    const hospitalLat = hospital?.lat || 19.0596;
    const hospitalLng = hospital?.lng || 72.8295;

    const scored = scoreDonors(
      donors,
      request.request_type,
      request.specific_type,
      hospitalLat,
      hospitalLng
    );

    setScoredDonors(scored);
    if (scored.length > 0) {
      setSelectedDonor(scored[0]);
    }
    setScoring(true);

    // Live count-up animation for scores
    const targets: Record<string, number> = {};
    scored.forEach((d) => { targets[d.id] = d.finalScore; });
    setDisplayScores({});

    let frame = 0;
    const totalFrames = 40;
    intervalRef.current = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const newScores: Record<string, number> = {};
      scored.forEach((d) => {
        newScores[d.id] = Math.round(d.finalScore * progress * 10) / 10;
      });
      setDisplayScores(newScores);

      if (frame >= totalFrames) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setDisplayScores(targets);
        setScoring(false);
      }
    }, 30);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [request, hospital, donors]);

  async function handleSelectDonor(donor: ScoredDonor) {
    if (!request) return;
    setSelectedDonor(donor);

    await updateRequest(request.id, {
      status: 'Matched',
      matched_donor_id: donor.id,
      match_score: donor.finalScore,
    });
  }

  function proceedToDispatch() {
    if (!selectedDonor || !request) return;
    navigate(`/dispatch?requestId=${request.id}&donorId=${selectedDonor.id}`);
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-600 font-bold">Scanning Donor Network...</p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <p className="text-slate-500">Request not found. Please create a request from the hospital portal.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Banner */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <motion.span
            animate={{ scale: [1, 1.4, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="w-3 h-3 bg-primary-600 rounded-full"
          />
          <span className="text-xs font-black text-primary-600 uppercase tracking-wider">
            {scoring ? 'Live Donor Matching Algorithm In Progress...' : 'Optimal Donor Match Identified'}
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Explainable AI Matching Engine
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Evaluating candidates for <span className="font-extrabold text-slate-800">{request.specific_type}</span> ({request.request_type}) in {request.patient_city} · Urgency: <span className="text-primary-600 font-bold">{request.urgency}</span>
        </p>
      </div>

      {/* Live Scoring Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-md overflow-hidden mb-6">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-lg">Eligible Candidate Leaderboard</h3>
              <p className="text-xs text-slate-500">Ranked dynamically by weighted multi-variable priority formula</p>
            </div>
          </div>
          <span className="text-xs font-black text-teal-800 bg-teal-50 px-3 py-1 rounded-xl border border-teal-200">
            {scoredDonors.length} Matches in Zone
          </span>
        </div>

        {scoredDonors.length === 0 ? (
          <div className="p-12 text-center">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
            <p className="text-slate-700 font-bold">No exact matches in current city zone</p>
            <p className="text-xs text-slate-400 mt-1 mb-4">You can request a cross-hospital inventory transfer.</p>
            <button
              onClick={() => navigate('/nearby-hospitals')}
              className="px-5 py-2.5 bg-primary-600 text-white text-xs font-bold rounded-xl"
            >
              Search Nearby Hospitals
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left px-5 py-3.5 font-bold">Rank</th>
                  <th className="text-left px-5 py-3.5 font-bold">Candidate</th>
                  <th className="text-center px-4 py-3.5 font-bold">Blood Group</th>
                  <th className="text-center px-4 py-3.5 font-bold">Compat (50%)</th>
                  <th className="text-center px-4 py-3.5 font-bold">Proximity (30%)</th>
                  <th className="text-center px-4 py-3.5 font-bold">Reliability (20%)</th>
                  <th className="text-center px-4 py-3.5 font-bold">Final Score</th>
                  <th className="text-center px-4 py-3.5 font-bold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <AnimatePresence>
                  {scoredDonors.map((donor, i) => {
                    const isTop = i === 0 && !scoring;
                    const isSelected = selectedDonor?.id === donor.id;
                    return (
                      <motion.tr
                        key={donor.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.04 }}
                        className={`transition-colors ${
                          isTop
                            ? 'bg-red-50/60 font-semibold'
                            : isSelected
                            ? 'bg-teal-50/60 font-semibold'
                            : 'hover:bg-slate-50/70'
                        }`}
                      >
                        <td className="px-5 py-4">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                            i === 0 ? 'bg-amber-100 text-amber-800 shadow-sm' :
                            i === 1 ? 'bg-slate-200 text-slate-700' :
                            i === 2 ? 'bg-orange-100 text-orange-700' :
                            'bg-slate-100 text-slate-500'
                          }`}>
                            #{i + 1}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                              {donor.full_name[0]}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-slate-900 text-sm">{donor.full_name}</p>
                                {isTop && (
                                  <motion.span
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                    className="px-2 py-0.5 bg-primary-600 text-white text-[10px] font-black rounded-md shadow-sm"
                                  >
                                    TOP MATCH
                                  </motion.span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 font-normal">
                                {donor.donor_level} · {donor.city} ({donor.distance} km)
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4 text-center">
                          <span className="px-2.5 py-1 bg-red-100 text-primary-800 font-extrabold text-xs rounded-lg">
                            {donor.blood_group}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-center text-slate-700 font-bold">
                          {donor.compatibilityScore}
                        </td>

                        <td className="px-4 py-4 text-center text-slate-700 font-bold">
                          {donor.proximityScore} <span className="text-xs text-slate-400 font-normal">({donor.distance}km)</span>
                        </td>

                        <td className="px-4 py-4 text-center text-slate-700 font-bold">
                          {donor.reliabilityScore}
                        </td>

                        <td className="px-4 py-4 text-center">
                          <motion.span
                            key={displayScores[donor.id] || 0}
                            initial={{ scale: 1.15 }}
                            animate={{ scale: 1 }}
                            className="text-lg font-black text-slate-900"
                          >
                            {displayScores[donor.id] || 0}%
                          </motion.span>
                        </td>

                        <td className="px-4 py-4 text-center">
                          <button
                            onClick={() => handleSelectDonor(donor)}
                            disabled={scoring}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                              isSelected
                                ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            } disabled:opacity-50`}
                          >
                            {isSelected ? '✓ Selected' : 'Select'}
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Explainable AI Formula Transparency Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center flex-shrink-0 text-teal-400">
            <Info className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-black text-base sm:text-lg">Explainable Priority Formula</h4>
              <span className="px-2 py-0.5 bg-teal-500/20 text-teal-300 text-[10px] font-bold rounded-md border border-teal-500/30">
                FAIR ALLOCATION
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mb-3">
              Organs and blood units are never allocated arbitrarily. Every score is mathematically grounded in medical compatibility, transit time window, and donor reliability:
            </p>

            <div className="bg-black/40 rounded-2xl p-4 font-mono text-xs sm:text-sm text-primary-300 border border-white/10 mb-4">
              Priority Score = (0.50 × Compatibility) + (0.30 × Proximity) + (0.20 × Reliability)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <p className="font-bold text-slate-200">1. Compatibility (50%)</p>
                <p className="text-slate-400 text-[11px] mt-0.5">Strict blood antigens & organ cross-match matrix</p>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <p className="font-bold text-slate-200">2. Proximity (30%)</p>
                <p className="text-slate-400 text-[11px] mt-0.5">Haversine GPS transit distance from hospital</p>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <p className="font-bold text-slate-200">3. Reliability (20%)</p>
                <p className="text-slate-400 text-[11px] mt-0.5">Verified donation streak and responsiveness</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Action CTA */}
      {selectedDonor && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-teal-200 p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-teal-700 uppercase tracking-wider">Candidate Ready For Dispatch</p>
              <h4 className="font-black text-slate-900 text-lg sm:text-xl">
                {selectedDonor.full_name} ({selectedDonor.blood_group}) — Score: {selectedDonor.finalScore}%
              </h4>
              <p className="text-xs text-slate-500">
                {selectedDonor.distance} km from hospital · Phone: +{selectedDonor.phone}
              </p>
            </div>
          </div>

          <button
            onClick={proceedToDispatch}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-bold rounded-2xl shadow-xl shadow-teal-600/25 transition-all transform hover:-translate-y-0.5 text-base"
          >
            Trigger Emergency Dispatch
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      )}
    </div>
  );
}
