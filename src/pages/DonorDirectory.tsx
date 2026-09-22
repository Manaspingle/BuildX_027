import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Heart, Droplet, Phone, MapPin, Search, CheckCircle2, Send, Shield
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getDonors, createNotification } from '@/lib/firebaseDb';
import { ORGAN_TYPES, BLOOD_GROUPS } from '@/lib/constants';
import type { Donor } from '@/types';

export default function DonorDirectory() {
  const { hospital } = useAuth();
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [queryText, setQueryText] = useState('');
  const [organFilter, setOrganFilter] = useState('all');
  const [bloodFilter, setBloodFilter] = useState('all');
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    getDonors(hospital?.city).then((data) => {
      setDonors(data);
      setLoading(false);
    });
  }, [hospital]);

  const filtered = useMemo(() => {
    return donors.filter((d) => {
      const hay = `${d.full_name} ${d.blood_group} ${d.organs.join(' ')}`.toLowerCase();
      if (queryText && !hay.includes(queryText.toLowerCase())) return false;
      if (organFilter !== 'all' && !d.organs.includes(organFilter)) return false;
      if (bloodFilter !== 'all' && d.blood_group !== bloodFilter) return false;
      return true;
    });
  }, [donors, queryText, organFilter, bloodFilter]);

  async function connectWithDonor(d: Donor) {
    if (!hospital) return;
    setConnectingId(d.id);
    await createNotification({
      donor_id: d.id,
      message: `${hospital.hospital_name} reviewed your posthumous organ pledge (${d.organs.join(', ') || 'none listed'}) and may contact you for ${d.blood_group} blood or transplant coordination.`,
      type: 'hospital_interest',
      read: false,
    });
    setNotice(`Connection recorded with ${d.full_name}. They will see this in their match feed.`);
    setConnectingId(null);
    setTimeout(() => setNotice(null), 4000);
  }

  if (!hospital) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <p className="text-slate-500">Please log in as a hospital to view pledged donors.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <span className="text-xs font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-3 py-1 rounded-full border border-primary-200">
          Hospital ↔ Donor Network
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-2">
          Donor Directory — {hospital.city}
        </h1>
        <p className="text-slate-500 text-sm mt-1 max-w-3xl">
          See who is available for blood now, and which organs each person has pledged to donate after death.
          Connecting a donor notifies them without exposing unnecessary medical files.
        </p>
      </div>

      {notice && (
        <div className="mb-6 flex items-center gap-2 px-4 py-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-sm font-semibold">
          <CheckCircle2 className="w-5 h-5" />
          {notice}
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 sm:p-5 mb-6 grid sm:grid-cols-3 gap-3">
        <div className="relative sm:col-span-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            placeholder="Search name or organ"
            className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium"
          />
        </div>
        <select
          value={organFilter}
          onChange={(e) => setOrganFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-bold"
        >
          <option value="all">All pledged organs</option>
          {ORGAN_TYPES.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
        <select
          value={bloodFilter}
          onChange={(e) => setBloodFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-bold"
        >
          <option value="all">All blood groups</option>
          {BLOOD_GROUPS.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="p-16 text-center text-slate-400">Loading donor registry…</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {filtered.map((d, idx) => (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="bg-white rounded-3xl border border-slate-100 shadow-md p-6 flex flex-col gap-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 text-white flex items-center justify-center font-black">
                    {d.full_name[0]}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900">{d.full_name}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {d.city} · Age {d.age}
                    </p>
                  </div>
                </div>
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg ${
                  d.available ? 'bg-teal-50 text-teal-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {d.available ? 'Available now' : 'Paused'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-red-50 border border-red-100">
                  <p className="text-[10px] font-bold uppercase text-primary-700 flex items-center gap-1">
                    <Droplet className="w-3.5 h-3.5" /> Blood now
                  </p>
                  <p className="text-lg font-black text-slate-900 mt-1">{d.blood_group}</p>
                  <p className="text-[11px] text-slate-500">{d.blood_donations} logged donations</p>
                </div>
                <div className="p-3 rounded-2xl bg-teal-50 border border-teal-100">
                  <p className="text-[10px] font-bold uppercase text-teal-800 flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5" /> After death
                  </p>
                  <p className="text-sm font-black text-slate-900 mt-1">
                    {d.organs.length} organ{d.organs.length === 1 ? '' : 's'}
                  </p>
                  <p className="text-[11px] text-slate-500">{d.consent ? 'Consent on file' : 'Consent pending'}</p>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wide">Pledged organs</p>
                <div className="flex flex-wrap gap-1.5">
                  {d.organs.length === 0 ? (
                    <span className="text-xs text-slate-400">No posthumous pledge yet</span>
                  ) : (
                    d.organs.map((o) => (
                      <span key={o} className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-bold">
                        {o}
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> {d.phone}
                </p>
                <button
                  onClick={() => connectWithDonor(d)}
                  disabled={connectingId === d.id}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold disabled:opacity-60"
                >
                  <Send className="w-3.5 h-3.5" />
                  {connectingId === d.id ? 'Connecting…' : 'Connect with donor'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="font-bold text-slate-600">No donors match these filters</p>
        </div>
      )}

      <div className="mt-8 flex items-start gap-3 p-4 bg-slate-100 rounded-2xl text-xs text-slate-500">
        <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
        Posthumous pledges become actionable only after legal death certification. Blood availability is for living donation when the donor is marked available.
      </div>
    </div>
  );
}
