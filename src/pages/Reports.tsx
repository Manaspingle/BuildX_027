import { useEffect, useMemo, useState } from 'react';
import {
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  BarChart3, Calendar, Heart, Clock, Printer, Droplet, Building2, Truck
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getDonations, getRequests, getHospitals, getTransfers, getNotifications } from '@/lib/firebaseDb';
import type { Donation, Request, Hospital, Transfer, Notification } from '@/types';

function formatWhen(iso?: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString();
}

export default function Reports() {
  const { donor, hospital } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (donor) {
        const [donData, reqData, notifs] = await Promise.all([
          getDonations(donor.id),
          getRequests(),
          getNotifications(donor.id),
        ]);
        setDonations(donData);
        setRequests(reqData);
        setNotifications(notifs);
      } else if (hospital) {
        const [reqData, hospData, transData] = await Promise.all([
          getRequests(hospital.id),
          getHospitals(),
          getTransfers(hospital.id),
        ]);
        setRequests(reqData);
        setHospitals(hospData);
        setTransfers(transData);
      }
      setLoading(false);
    }
    load();
  }, [donor, hospital]);

  const hospitalNameById = useMemo(() => {
    const map: Record<string, string> = {};
    hospitals.forEach((h) => {
      map[h.id] = h.hospital_name;
    });
    if (hospital) map[hospital.id] = hospital.hospital_name;
    return map;
  }, [hospitals, hospital]);

  const now = new Date();

  const individualStats = useMemo(() => {
    if (!donor) return null;
    const myDonations = donations.filter((d) => d.donor_id === donor.id);
    const thisMonth = myDonations.filter((d) => {
      const dt = new Date(d.donation_date || d.created_at);
      return dt.getMonth() === now.getMonth() && dt.getFullYear() === now.getFullYear();
    }).length;
    const thisYear = myDonations.filter((d) => {
      const dt = new Date(d.donation_date || d.created_at);
      return dt.getFullYear() === now.getFullYear();
    }).length;
    const hospitalApproaches = notifications.filter((n) => {
      const dt = new Date(n.created_at);
      return (
        n.type === 'hospital_interest' &&
        dt.getMonth() === now.getMonth() &&
        dt.getFullYear() === now.getFullYear()
      );
    }).length;
    const matches = requests.filter((r) => r.matched_donor_id === donor.id);
    const organMatches = matches.filter((r) => r.request_type === 'organ');
    return { myDonations, thisMonth, thisYear, hospitalApproaches, matches, organMatches };
  }, [donor, donations, notifications, requests, now]);

  const contributionOverTime = useMemo(() => {
    const buckets: Record<string, number> = {};
    (individualStats?.myDonations || []).forEach((d) => {
      const month = new Date(d.donation_date || d.created_at).toLocaleDateString('en-US', {
        month: 'short',
        year: '2-digit',
      });
      buckets[month] = (buckets[month] || 0) + 1;
    });
    if (Object.keys(buckets).length === 0) {
      return [{ month: 'No logs yet', contributions: 0 }];
    }
    return Object.entries(buckets).map(([month, contributions]) => ({ month, contributions }));
  }, [individualStats]);

  const typeSplit = useMemo(() => {
    const blood = individualStats?.myDonations.filter((d) => d.donation_type === 'blood').length || 0;
    const pledge = individualStats?.myDonations.filter((d) => d.donation_type === 'organ_pledge').length || donor?.organs.length || 0;
    return [
      { name: 'Blood donations', value: blood || donor?.blood_donations || 0, color: '#dc2626' },
      { name: 'Organ pledges', value: pledge || donor?.organs.length || 0, color: '#0d9488' },
    ];
  }, [individualStats, donor]);

  const approvedIncoming = useMemo(() => {
    if (!hospital) return [];
    return transfers.filter(
      (t) => t.to_hospital_id === hospital.id && t.status === 'Approved'
    );
  }, [transfers, hospital]);

  const hospitalRows = useMemo(() => {
    if (!hospital) return [];
    return requests.map((r) => {
      const related = transfers.find(
        (t) =>
          (t.from_hospital_id === hospital.id || t.to_hospital_id === hospital.id) &&
          ((t.organ_type && t.organ_type === r.specific_type) || (t.blood_type && t.blood_type === r.specific_type))
      );
      return {
        ...r,
        hospitalName: hospital.hospital_name,
        approvedFrom: approvedIncoming.length,
        delivery: r.delivery_time || related?.delivery_time || null,
      };
    });
  }, [requests, hospital, transfers, approvedIncoming.length]);

  function handleExport() {
    window.print();
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (donor && individualStats) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-3 py-1 rounded-full border border-primary-200">
              Personal impact
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-2">
              {donor.full_name.split(' ')[0]}'s Contribution Report
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Only your donations, pledges, and hospital approaches — not the whole network.
            </p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-black text-white font-bold rounded-2xl shadow-md text-sm"
          >
            <Printer className="w-4 h-4" />
            Print my report
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Blood donations logged', value: donor.blood_donations, icon: Droplet, color: 'text-primary-600 bg-primary-50' },
            { label: 'Organs pledged', value: donor.organs.length, icon: Heart, color: 'text-teal-600 bg-teal-50' },
            { label: 'Hospitals approached you (this month)', value: individualStats.hospitalApproaches, icon: Building2, color: 'text-blue-600 bg-blue-50' },
            { label: 'Times you were matched', value: individualStats.matches.length, icon: Clock, color: 'text-purple-600 bg-purple-50' },
          ].map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.label} className="bg-white rounded-3xl border border-slate-100 shadow-md p-5">
                <div className={`w-10 h-10 rounded-2xl ${c.color} flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-black text-slate-900">{c.value}</p>
                <p className="text-xs text-slate-500 font-semibold mt-1">{c.label}</p>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-6">
            <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary-600" />
              Your contribution timeline
            </h3>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={contributionOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0' }} />
                <Line type="monotone" dataKey="contributions" stroke="#dc2626" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-6">
            <h3 className="font-black text-slate-900 mb-4">Blood vs organ pledge mix</h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={typeSplit} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" paddingAngle={4}>
                  {typeSplit.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-md overflow-hidden mb-8">
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-black text-slate-900">Your logged contributions</h3>
            <p className="text-xs text-slate-500">Blood visits and organ-pledge milestones on this account</p>
          </div>
          <div className="divide-y divide-slate-100">
            {individualStats.myDonations.length === 0 ? (
              <p className="p-8 text-sm text-slate-500">No personal donation logs yet. Use the dashboard to log a blood donation or update your pledge.</p>
            ) : (
              individualStats.myDonations.map((d) => (
                <div key={d.id} className="px-6 py-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-slate-900 text-sm capitalize">{d.donation_type.replace('_', ' ')}</p>
                    <p className="text-xs text-slate-500">{formatWhen(d.donation_date || d.created_at)}</p>
                  </div>
                  <span className="text-xs font-black text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg">+{d.points_earned} pts</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-md overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-black text-slate-900">Hospitals that approached your organ pledge</h3>
            <p className="text-xs text-slate-500">
              This month: {individualStats.hospitalApproaches} · Lifetime organ matches: {individualStats.organMatches.length}
            </p>
          </div>
          <div className="divide-y divide-slate-100">
            {notifications.filter((n) => n.type === 'hospital_interest' || n.type === 'match').length === 0 ? (
              <p className="p-8 text-sm text-slate-500">No hospital has reached out about your pledge yet.</p>
            ) : (
              notifications
                .filter((n) => n.type === 'hospital_interest' || n.type === 'match')
                .map((n) => (
                  <div key={n.id} className="px-6 py-4">
                    <p className="text-sm font-semibold text-slate-800">{n.message}</p>
                    <p className="text-xs text-slate-400 mt-1">{formatWhen(n.created_at)}</p>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    );
  }

  if (hospital) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              Hospital operations
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-2">
              {hospital.hospital_name} — Request Report
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Requests you raised, inbound approvals from other hospitals, request time, and organ delivery time.
            </p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-black text-white font-bold rounded-2xl shadow-md text-sm"
          >
            <Printer className="w-4 h-4" />
            Print hospital report
          </button>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-5">
            <p className="text-xs font-bold text-slate-500 uppercase">Hospital name</p>
            <p className="text-xl font-black text-slate-900 mt-1">{hospital.hospital_name}</p>
          </div>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-5">
            <p className="text-xs font-bold text-slate-500 uppercase">Requests made</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{requests.length}</p>
          </div>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-5">
            <p className="text-xs font-bold text-slate-500 uppercase">Approved from other hospitals</p>
            <p className="text-3xl font-black text-teal-700 mt-1">{approvedIncoming.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-md overflow-hidden mb-8">
          <div className="p-6 border-b border-slate-100 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary-600" />
            <h3 className="font-black text-slate-900">Emergency requests</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="text-left px-5 py-3 font-bold">Hospital name</th>
                  <th className="text-left px-5 py-3 font-bold">Item</th>
                  <th className="text-left px-5 py-3 font-bold">Status</th>
                  <th className="text-left px-5 py-3 font-bold">Time request made</th>
                  <th className="text-left px-5 py-3 font-bold">Organ / unit delivery time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {hospitalRows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-slate-500">No requests yet for this hospital.</td>
                  </tr>
                ) : (
                  hospitalRows.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4 font-bold text-slate-900">{row.hospitalName}</td>
                      <td className="px-5 py-4">{row.request_type} · {row.specific_type}</td>
                      <td className="px-5 py-4 font-semibold">{row.status}</td>
                      <td className="px-5 py-4 text-slate-600">{formatWhen(row.created_at)}</td>
                      <td className="px-5 py-4 text-slate-600">{formatWhen(row.delivery)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-md overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center gap-2">
            <Truck className="w-5 h-5 text-teal-600" />
            <h3 className="font-black text-slate-900">Transfers approved from other hospitals</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="text-left px-5 py-3 font-bold">From hospital</th>
                  <th className="text-left px-5 py-3 font-bold">To hospital</th>
                  <th className="text-left px-5 py-3 font-bold">Item</th>
                  <th className="text-left px-5 py-3 font-bold">Status</th>
                  <th className="text-left px-5 py-3 font-bold">Request time</th>
                  <th className="text-left px-5 py-3 font-bold">Delivery time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transfers.filter((t) => t.to_hospital_id === hospital.id).length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-slate-500">No inbound hospital transfers yet.</td>
                  </tr>
                ) : (
                  transfers
                    .filter((t) => t.to_hospital_id === hospital.id)
                    .map((t) => (
                      <tr key={t.id}>
                        <td className="px-5 py-4 font-bold">{hospitalNameById[t.from_hospital_id] || t.from_hospital_id}</td>
                        <td className="px-5 py-4">{hospitalNameById[t.to_hospital_id] || hospital.hospital_name}</td>
                        <td className="px-5 py-4">{t.organ_type || t.blood_type}</td>
                        <td className="px-5 py-4">{t.status}</td>
                        <td className="px-5 py-4">{formatWhen(t.created_at)}</td>
                        <td className="px-5 py-4">{formatWhen(t.delivery_time)}</td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[50vh] flex items-center justify-center p-8 text-slate-500">
      Sign in as a donor or hospital to view role-specific reports.
    </div>
  );
}
