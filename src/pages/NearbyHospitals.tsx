import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Building2, ArrowRight, Search, Truck, CheckCircle2, Clock, Check, Send } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getHospitals, getTransfers, createTransfer } from '@/lib/firebaseDb';
import { haversineDistance } from '@/lib/compatibility';
import { BLOOD_GROUPS, ORGAN_TYPES } from '@/lib/constants';
import type { Hospital, Transfer } from '@/types';

interface NearbyHospital extends Hospital {
  distance: number;
  estTime: number;
}

export default function NearbyHospitals() {
  const { hospital } = useAuth();
  const [hospitals, setHospitals] = useState<NearbyHospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [transferTarget, setTransferTarget] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!hospital) return;

    getHospitals().then((allHosp) => {
      const otherHospitals = allHosp
        .filter((h) => h.id !== hospital.id)
        .map((h) => {
          const distance = haversineDistance(hospital.lat, hospital.lng, h.lat, h.lng);
          return {
            ...h,
            distance: Math.max(1.2, Math.round(distance * 10) / 10),
            estTime: Math.max(5, Math.round(distance * 2.5)),
          };
        })
        .sort((a, b) => a.distance - b.distance);

      setHospitals(otherHospitals);
      setLoading(false);
    });

    getTransfers(hospital.id).then(setTransfers);
  }, [hospital]);

  async function requestTransfer(targetHospital: NearbyHospital, type: string) {
    if (!hospital) return;
    setTransferTarget(targetHospital.id);
    const isBlood = BLOOD_GROUPS.includes(type);

    await createTransfer({
      from_hospital_id: hospital.id,
      to_hospital_id: targetHospital.id,
      blood_type: isBlood ? type : null,
      organ_type: !isBlood ? type : null,
      status: 'Approved',
      delivery_time: new Date(Date.now() + targetHospital.estTime * 60 * 1000).toISOString(),
    });

    const updated = await getTransfers(hospital.id);
    setTransfers(updated);
    setTransferTarget(null);
    setSuccessNotice(`Transfer requested successfully from ${targetHospital.hospital_name}!`);
    setTimeout(() => setSuccessNotice(null), 4000);
  }

  if (!hospital) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <p className="text-slate-500">Please log in as a hospital to access nearby stock and transfer logistics.</p>
      </div>
    );
  }

  const filtered = hospitals.filter((h) => {
    if (filterType === 'all') return true;
    return (h.inventory?.[filterType] || 0) > 0;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
          Cross-Hospital Logistics
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-2">
          Nearby Hospital Search & Inventory Transfers
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          When your local donor pool is insufficient, request instant cold-chain transfers from nearby accredited medical centers.
        </p>
      </div>

      {successNotice && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-teal-50 text-teal-900 border border-teal-200 rounded-2xl flex items-center gap-3 font-bold text-sm"
        >
          <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0" />
          {successNotice}
        </motion.div>
      )}

      {/* Map View */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-6 sm:p-7 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">City Hospital Network Map — {hospital.city}</h3>
              <p className="text-xs text-slate-500">Live GPS proximity relative to {hospital.hospital_name}</p>
            </div>
          </div>
        </div>

        <div className="relative h-72 sm:h-80 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-inner">
          <svg className="w-full h-full" viewBox="0 0 600 300">
            {/* Map grid lines */}
            {[0, 60, 120, 180, 240, 300, 360, 420, 480, 540, 600].map((x) => (
              <line key={`v${x}`} x1={x} y1="0" x2={x} y2="300" stroke="#334155" strokeWidth="0.5" strokeDasharray="3 3" />
            ))}
            {[0, 50, 100, 150, 200, 250, 300].map((y) => (
              <line key={`h${y}`} x1="0" y1={y} x2="600" y2={y} stroke="#334155" strokeWidth="0.5" strokeDasharray="3 3" />
            ))}

            {/* Radius rings */}
            <circle cx="300" cy="150" r="60" fill="none" stroke="#475569" strokeWidth="1" strokeDasharray="2 4" />
            <circle cx="300" cy="150" r="110" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="2 4" />

            {/* Current Hospital (Center) */}
            <circle cx="300" cy="150" r="12" fill="#dc2626" />
            <circle cx="300" cy="150" r="22" fill="#dc2626" opacity="0.2" className="animate-ping" />
            <text x="300" y="180" fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle">
              {hospital.hospital_name} (You)
            </text>

            {/* Nearby Hospital Nodes */}
            {filtered.map((h, i) => {
              const angle = (i / Math.max(1, filtered.length)) * 2 * Math.PI + 0.5;
              const radius = 65 + (i * 28);
              const x = 300 + Math.cos(angle) * radius;
              const y = 150 + Math.sin(angle) * radius;
              return (
                <g key={h.id}>
                  <line x1="300" y1="150" x2={x} y2={y} stroke="#64748b" strokeWidth="1.5" strokeDasharray="4 4" />
                  <circle cx={x} cy={y} r="9" fill="#0d9488" />
                  <circle cx={x} cy={y} r="14" fill="#0d9488" opacity="0.2" className="animate-pulse" />
                  <text x={x} y={y - 12} fill="#e2e8f0" fontSize="11" fontWeight="bold" textAnchor="middle">
                    {h.hospital_name.split(' ').slice(0, 2).join(' ')}
                  </text>
                  <text x={x} y={y + 20} fill="#94a3b8" fontSize="9" textAnchor="middle">
                    {h.distance} km (~{h.estTime}m)
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 sm:p-5 mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
          >
            <option value="all">Filter by Stock Availability: All Items</option>
            <optgroup label="Blood Groups">
              {BLOOD_GROUPS.map((bg) => (
                <option key={bg} value={bg}>{bg} Blood In Stock</option>
              ))}
            </optgroup>
            <optgroup label="Organs">
              {ORGAN_TYPES.map((o) => (
                <option key={o} value={o}>{o} In Stock</option>
              ))}
            </optgroup>
          </select>
        </div>

        <span className="text-xs font-bold text-slate-500">
          {filtered.length} Hospitals with Available Stock
        </span>
      </div>

      {/* Hospital Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {filtered.map((h, i) => (
          <motion.div
            key={h.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white rounded-3xl border border-slate-100 shadow-md p-6 flex flex-col justify-between hover:shadow-lg transition-all"
          >
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-teal-50 text-teal-700 rounded-2xl flex items-center justify-center font-bold">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-base">{h.hospital_name}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />{h.city} · {h.address}
                    </p>
                  </div>
                </div>
                {h.verified && (
                  <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0" />
                )}
              </div>

              <div className="flex items-center gap-4 text-xs font-bold text-slate-600 mb-4 bg-slate-50 p-2.5 rounded-xl">
                <span className="flex items-center gap-1.5 text-primary-700">
                  <MapPin className="w-3.5 h-3.5" />
                  {h.distance} km away
                </span>
                <span className="flex items-center gap-1.5 text-teal-700">
                  <Clock className="w-3.5 h-3.5" />
                  ~{h.estTime} min transit
                </span>
              </div>

              {/* Available inventory tags */}
              <div className="mb-5">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Verified Inventory Units:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(h.inventory || {}).filter(([, qty]) => qty > 0).map(([type, qty]) => (
                    <span
                      key={type}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        filterType === type
                          ? 'bg-primary-600 text-white'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {type}: {qty}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => requestTransfer(h, filterType !== 'all' ? filterType : 'O-')}
              disabled={transferTarget === h.id}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white text-xs font-bold rounded-2xl shadow-md shadow-primary-600/20 transition-all disabled:opacity-60"
            >
              <Send className="w-3.5 h-3.5" />
              {transferTarget === h.id ? 'Dispatching Transfer...' : 'Request Emergency Transfer'}
            </button>
          </motion.div>
        ))}
      </div>

      {/* Transfer History Table */}
      {transfers.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-md overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-black text-slate-900 text-lg flex items-center gap-2">
              <Truck className="w-5 h-5 text-primary-600" />
              Active Transfer Dispatches
            </h3>
          </div>
          <div className="divide-y divide-slate-100">
            {transfers.map((t) => (
              <div key={t.id} className="p-5 flex items-center justify-between hover:bg-slate-50/70 transition-colors">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      Transfer Requested: {t.blood_type || t.organ_type}
                    </p>
                    <p className="text-xs text-slate-400">
                      Destination ID: {t.to_hospital_id} · Timestamp: {new Date(t.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-teal-100 text-teal-800 text-xs font-bold rounded-xl border border-teal-200">
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
