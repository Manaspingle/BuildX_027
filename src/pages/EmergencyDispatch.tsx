import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle, Check, X, Truck, Thermometer, Clock, MapPin,
  CheckCircle2, Package, ArrowRight, AlertTriangle, ShieldCheck, Shield
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  getRequestById,
  getDonorById,
  getDonors,
  getHospitalById,
  updateRequest,
  createAllocation,
  createNotification
} from '@/lib/firebaseDb';
import { generateVerificationHash } from '@/lib/hash';
import { scoreDonors } from '@/lib/compatibility';
import type { Request, Donor, Hospital, ScoredDonor } from '@/types';

export default function EmergencyDispatch() {
  const { hospital } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const requestId = searchParams.get('requestId');
  const donorId = searchParams.get('donorId');

  const [request, setRequest] = useState<Request | null>(null);
  const [donor, setDonor] = useState<Donor | null>(null);
  const [hospitalData, setHospitalData] = useState<Hospital | null>(hospital);
  const [loading, setLoading] = useState(true);
  const [donorResponse, setDonorResponse] = useState<'pending' | 'accepted' | 'declined'>('pending');
  const [fallbackDonors, setFallbackDonors] = useState<ScoredDonor[]>([]);
  const [currentFallbackIdx, setCurrentFallbackIdx] = useState(-1);

  // Logistics state
  const [transitProgress, setTransitProgress] = useState(0);
  const [temperature, setTemperature] = useState(3.8);
  const [eta, setEta] = useState(18);
  const [status, setStatus] = useState<'collected' | 'in_transit' | 'arrived'>('collected');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tempRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!requestId) return;

    getRequestById(requestId).then((req) => {
      if (req) {
        setRequest(req);
        if (!hospitalData && req.hospital_id) {
          getHospitalById(req.hospital_id).then(setHospitalData);
        }
      }
      setLoading(false);
    });
  }, [requestId]);

  useEffect(() => {
    if (!donorId) return;
    getDonorById(donorId).then((d) => {
      if (d) setDonor(d);
    });
  }, [donorId]);

  useEffect(() => {
    if (!request) return;
    const hospLat = hospitalData?.lat || 19.0596;
    const hospLng = hospitalData?.lng || 72.8295;

    getDonors(request.patient_city).then((allDonors) => {
      const scored = scoreDonors(allDonors, request.request_type, request.specific_type, hospLat, hospLng);
      setFallbackDonors(scored.filter((d) => d.id !== donorId));
    });
  }, [request, hospitalData, donorId]);

  function handleAccept() {
    setDonorResponse('accepted');
    startLogistics();
  }

  async function handleDecline() {
    setDonorResponse('declined');
    const nextIdx = currentFallbackIdx + 1;
    if (nextIdx < fallbackDonors.length) {
      const next = fallbackDonors[nextIdx];
      setCurrentFallbackIdx(nextIdx);
      setDonor(next);

      if (request) {
        await updateRequest(request.id, {
          matched_donor_id: next.id,
          match_score: next.finalScore,
        });
      }

      setTimeout(() => {
        setDonorResponse('pending');
      }, 2200);
    }
  }

  function startLogistics() {
    setStatus('in_transit');
    setTransitProgress(0);
    setEta(18);

    intervalRef.current = setInterval(() => {
      setTransitProgress((prev) => {
        const next = prev + 3;
        if (next >= 100) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          if (tempRef.current) clearInterval(tempRef.current);
          setStatus('arrived');
          setEta(0);
          completeRequest();
          return 100;
        }
        setEta(Math.max(1, Math.round((100 - next) / 100 * 18)));
        return next;
      });
    }, 400);

    tempRef.current = setInterval(() => {
      // Fluctuate temperature within safe organ transport window 2.0 - 5.5 °C
      setTemperature(Math.round((2.4 + Math.random() * 2.8) * 10) / 10);
    }, 800);
  }

  async function completeRequest() {
    if (!request || !donor) return;

    await updateRequest(request.id, { status: 'Completed' });

    const timestamp = new Date().toISOString();
    const scoreVal = request.match_score || 94.5;
    const hash = await generateVerificationHash(request.id, donor.id, scoreVal, timestamp);

    await createAllocation({
      request_id: request.id,
      donor_id: donor.id,
      score: scoreVal,
      verification_hash: hash,
      created_at: timestamp,
    });

    await createNotification({
      donor_id: donor.id,
      message: `❤️ Delivery Completed! Your ${request.specific_type} donation safely arrived at ${hospitalData?.hospital_name || 'Hospital'}. You saved a life!`,
      type: 'match',
      read: false,
    });
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (tempRef.current) clearInterval(tempRef.current);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-600 font-bold">Setting up Dispatch Channel...</p>
        </div>
      </div>
    );
  }

  if (!request || !donor) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <p className="text-slate-500">Request or candidate donor not found.</p>
      </div>
    );
  }

  const alertMessage = `🚨 CRITICAL AAROGYAM EMERGENCY ALERT\n\nHospital: ${hospitalData?.hospital_name || 'Apollo Hospital'}\nItem: ${request.request_type === 'blood' ? 'Blood Unit' : 'Organ'} (${request.specific_type})\nUrgency: ${request.urgency}\nLocation: ${request.patient_city}\n\nYou've been matched as the #1 candidate. Please confirm availability immediately for rapid collection.\n\nReply [ACCEPT] or [DECLINE]`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <span className="text-xs font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-3 py-1 rounded-full border border-primary-200">
          Step 3: Alert & Cold-Chain Logistics
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-2">
          Emergency Dispatch & Live Route Telemetry
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Simulate real-time messaging, donor confirmation, route progress, and certified temperature monitoring.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: WhatsApp Alert Preview & Simulation Controls */}
        <div className="lg:col-span-6 space-y-6">
          {/* WhatsApp Alert Card */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-6 sm:p-7">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-md shadow-emerald-500/20">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">WhatsApp / SMS Alert</h3>
                  <p className="text-xs text-slate-400">Recipient: {donor.full_name} (+{donor.phone})</p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200">
                SENT LIVE
              </span>
            </div>

            {/* WhatsApp Chat Preview Bubble */}
            <div className="bg-[#e5ddd5] rounded-2xl p-4 sm:p-5 min-h-[220px] relative shadow-inner">
              <div className="bg-[#dcf8c6] rounded-2xl p-4 max-w-[90%] ml-auto shadow-sm border border-[#cbe4b5]">
                <pre className="text-xs sm:text-sm text-slate-800 whitespace-pre-wrap font-sans leading-relaxed">
                  {alertMessage}
                </pre>
                <p className="text-[10px] text-slate-400 text-right mt-2 font-medium">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ✓✓
                </p>
              </div>

              {donorResponse !== 'pending' && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`mt-3 p-3.5 rounded-2xl max-w-[70%] shadow-md font-bold text-xs sm:text-sm flex items-center gap-2 ${
                    donorResponse === 'accepted'
                      ? 'bg-teal-600 text-white'
                      : 'bg-primary-600 text-white'
                  }`}
                >
                  {donorResponse === 'accepted' ? (
                    <>
                      <Check className="w-4 h-4" /> ACCEPTED: Ready for collection
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4" /> DECLINED: Unavailable right now
                    </>
                  )}
                </motion.div>
              )}
            </div>
          </div>

          {/* Response Simulation Toggle */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-6 sm:p-7">
            <h3 className="font-black text-slate-900 text-base sm:text-lg mb-1">Donor Response Simulator</h3>
            <p className="text-xs text-slate-500 mb-5">
              Simulate candidate accepting the request to unlock live logistics, or simulate decline to test automated cascading fallback.
            </p>

            {donorResponse === 'pending' ? (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleAccept}
                  className="flex items-center justify-center gap-2 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl transition-all shadow-md shadow-teal-600/20 text-sm"
                >
                  <Check className="w-4 h-4" />
                  Simulate Accept
                </button>
                <button
                  onClick={handleDecline}
                  className="flex items-center justify-center gap-2 py-3.5 bg-slate-100 hover:bg-primary-50 hover:text-primary-700 text-slate-700 font-bold rounded-2xl transition-all text-sm"
                >
                  <X className="w-4 h-4" />
                  Simulate Decline
                </button>
              </div>
            ) : donorResponse === 'accepted' ? (
              <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-teal-600 flex-shrink-0" />
                <div>
                  <p className="text-xs sm:text-sm font-bold text-teal-900">
                    Donor Confirmed Acceptance
                  </p>
                  <p className="text-xs text-teal-700">
                    Cold-chain transport vehicle dispatched to collection point.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-primary-700 font-bold text-xs sm:text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  Donor Declined — Cascading to next highest match in queue...
                </div>
                {currentFallbackIdx >= 0 && currentFallbackIdx < fallbackDonors.length && (
                  <p className="text-xs text-slate-600">
                    Switching alert to: <span className="font-bold">{fallbackDonors[currentFallbackIdx].full_name}</span> (Score: {fallbackDonors[currentFallbackIdx].finalScore}%)
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Map & Logistics Telemetry */}
        <div className="lg:col-span-6 space-y-6">
          {/* Interactive Route Map with Vehicle Simulation */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-6 sm:p-7">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">GPS Route & Dispatch Simulation</h3>
                  <p className="text-[11px] text-slate-500">Collection Point ➔ {hospitalData?.hospital_name || 'Hospital'}</p>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-400">
                {donorResponse === 'accepted' ? `${transitProgress}% complete` : 'Standby'}
              </span>
            </div>

            <div className="relative h-64 sm:h-72 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-inner">
              <svg className="w-full h-full" viewBox="0 0 400 256">
                {/* City grid lines */}
                {[40, 80, 120, 160, 200, 240, 280, 320, 360].map((x) => (
                  <line key={`x${x}`} x1={x} y1="0" x2={x} y2="256" stroke="#334155" strokeWidth="0.5" strokeDasharray="2 4" />
                ))}
                {[30, 60, 90, 120, 150, 180, 210, 240].map((y) => (
                  <line key={`y${y}`} x1="0" y1={y} x2="400" y2={y} stroke="#334155" strokeWidth="0.5" strokeDasharray="2 4" />
                ))}

                {/* Animated Route Path */}
                <path
                  d="M 60 200 Q 180 80 340 60"
                  fill="none"
                  stroke="#475569"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <motion.path
                  d="M 60 200 Q 180 80 340 60"
                  fill="none"
                  stroke="#dc2626"
                  strokeWidth="4"
                  strokeDasharray="8 4"
                  strokeLinecap="round"
                />

                {/* Donor Node */}
                <circle cx="60" cy="200" r="10" fill="#0d9488" />
                <circle cx="60" cy="200" r="16" fill="#0d9488" opacity="0.2" className="animate-ping" />
                <text x="60" y="225" fill="#e2e8f0" fontSize="11" fontWeight="bold" textAnchor="middle">
                  Donor ({donor.city})
                </text>

                {/* Hospital Node */}
                <circle cx="340" cy="60" r="10" fill="#dc2626" />
                <circle cx="340" cy="60" r="18" fill="#dc2626" opacity="0.2" className="animate-ping" />
                <text x="340" y="42" fill="#e2e8f0" fontSize="11" fontWeight="bold" textAnchor="middle">
                  {hospitalData?.hospital_name.split(' ')[0] || 'Hospital'}
                </text>

                {/* Simulated Vehicle moving along route */}
                {donorResponse === 'accepted' && (
                  <g>
                    {/* Calculate position along quadratic curve based on transitProgress (0 to 1) */}
                    {(() => {
                      const t = transitProgress / 100;
                      const x = (1 - t) * (1 - t) * 60 + 2 * (1 - t) * t * 180 + t * t * 340;
                      const y = (1 - t) * (1 - t) * 200 + 2 * (1 - t) * t * 80 + t * t * 60;
                      return (
                        <g transform={`translate(${x}, ${y})`}>
                          <circle r="14" fill="#3b82f6" opacity="0.3" className="animate-pulse" />
                          <circle r="8" fill="#2563eb" />
                          <text y="3" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">
                            🚑
                          </text>
                        </g>
                      );
                    })()}
                  </g>
                )}
              </svg>

              <div className="absolute bottom-3 left-3 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-semibold text-white border border-slate-700">
                {donorResponse === 'accepted'
                  ? `⚡ Active Transit: ${Math.max(1, Math.round((100 - transitProgress) / 100 * 12))} km remaining`
                  : 'Awaiting Donor Confirmation'}
              </div>
            </div>
          </div>

          {/* Live Telemetry Panel */}
          {donorResponse === 'accepted' ? (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-6 sm:p-7 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
                  <Truck className="w-5 h-5 text-primary-600" />
                  Live Cold-Chain Telemetry
                </h3>
                <span className="px-2.5 py-0.5 bg-teal-50 text-teal-700 text-xs font-bold rounded-lg border border-teal-200">
                  REAL-TIME SENSORS
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                  <Thermometer className="w-6 h-6 text-blue-500 mx-auto mb-1.5" />
                  <p className="text-xl sm:text-2xl font-black text-slate-900">{temperature}°C</p>
                  <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Organ Temp (2-6°C)</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                  <Clock className="w-6 h-6 text-primary-600 mx-auto mb-1.5" />
                  <p className="text-xl sm:text-2xl font-black text-slate-900">{eta} min</p>
                  <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Est. Arrival</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                  <MapPin className="w-6 h-6 text-teal-600 mx-auto mb-1.5" />
                  <p className="text-xl sm:text-2xl font-black text-slate-900">
                    {Math.max(0, Math.round((100 - transitProgress) / 100 * 12))} km
                  </p>
                  <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Distance</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
                  <motion.div
                    animate={{ width: `${transitProgress}%` }}
                    className="h-full bg-gradient-to-r from-primary-600 to-teal-500 rounded-full"
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 mt-1.5 font-bold">
                  <span>Collected at donor site</span>
                  <span>{transitProgress}% En Route</span>
                  <span>Arrived at Hospital</span>
                </div>
              </div>

              {/* Timeline status */}
              <div className="space-y-3 pt-2">
                {[
                  { label: 'Sample / Organ Collected', done: true, sub: 'Packaged in certified preservation box' },
                  { label: 'In Transit along Green Corridor', done: transitProgress > 10, active: transitProgress > 10 && transitProgress < 100, sub: 'Telemetry transmitting every 1s' },
                  { label: 'Handover & Surgical Delivery', done: status === 'arrived', active: status === 'arrived', sub: 'Ready for transplant / transfusion' },
                ].map((st) => (
                  <div key={st.label} className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50/70 border border-slate-100">
                    <div className={`p-1.5 rounded-xl ${st.done ? 'bg-teal-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                      <Check className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className={`text-xs sm:text-sm font-bold ${st.done ? 'text-slate-900' : 'text-slate-400'}`}>
                        {st.label}
                      </p>
                      <p className="text-[11px] text-slate-500">{st.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              {status === 'arrived' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 bg-gradient-to-br from-teal-500 to-teal-700 text-white rounded-3xl shadow-xl text-center space-y-3"
                >
                  <CheckCircle2 className="w-12 h-12 mx-auto" />
                  <h4 className="text-xl font-black">Delivery Completed & Verified!</h4>
                  <p className="text-xs sm:text-sm text-teal-100">
                    The {request.specific_type} was successfully delivered to {hospitalData?.hospital_name}. An immutable cryptographic hash has been appended to the transparency ledger.
                  </p>
                  <div className="pt-2">
                    <Link
                      to="/transparency"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-white text-teal-800 font-black rounded-2xl shadow-md hover:bg-teal-50 transition-all text-xs sm:text-sm"
                    >
                      View in Transparency Ledger <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-12 text-center">
              <Truck className="w-14 h-14 text-slate-300 mx-auto mb-3" />
              <h4 className="font-bold text-slate-700 text-base">Logistics Channel Standby</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Awaiting candidate acceptance to initiate ambulance dispatch, cold-chain telemetry, and route tracking.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
