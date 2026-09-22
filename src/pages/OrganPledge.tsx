import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Heart, Check, Download, AlertCircle, Award, Sparkles, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { updateDonor, createDonation } from '@/lib/firebaseDb';
import { ORGAN_TYPES } from '@/lib/constants';
import { getDonorLevel } from '@/lib/compatibility';

const organPositions: Record<string, { cx: number; cy: number; label: string }> = {
  Heart: { cx: 100, cy: 95, label: 'Heart' },
  Lungs: { cx: 100, cy: 125, label: 'Lungs' },
  Liver: { cx: 105, cy: 160, label: 'Liver' },
  Kidney: { cx: 80, cy: 190, label: 'Kidney' },
  Cornea: { cx: 100, cy: 40, label: 'Cornea' },
  'Bone Marrow': { cx: 100, cy: 235, label: 'Bone Marrow' },
};

export default function OrganPledge() {
  const { donor, refreshProfile } = useAuth();
  const [selectedOrgans, setSelectedOrgans] = useState<string[]>(donor?.organs || ['Kidney', 'Liver']);
  const [allergies, setAllergies] = useState(donor?.medical_allergies || '');
  const [conditions, setConditions] = useState(donor?.medical_conditions || '');
  const [submitting, setSubmitting] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const donorCode = donor ? `LL-${donor.id.replace('donor_', '').slice(0, 6).toUpperCase()}-${donor.blood_group}` : 'LL-DONOR-01';

  function toggleOrgan(organ: string) {
    setSelectedOrgans((prev) =>
      prev.includes(organ) ? prev.filter((o) => o !== organ) : [...prev, organ]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!donor) return;
    if (selectedOrgans.length === 0) {
      setError('Please select at least one organ to pledge.');
      return;
    }
    setError(null);
    setSubmitting(true);

    const isNewPledge = selectedOrgans.length > donor.organs.length;
    const newPoints = donor.donor_points + (isNewPledge ? 60 : 0);
    const newLevel = getDonorLevel(newPoints);

    await updateDonor(donor.id, {
      organs: selectedOrgans,
      medical_allergies: allergies,
      medical_conditions: conditions,
      consent: true,
      donor_points: newPoints,
      donor_level: newLevel,
    });

    if (isNewPledge) {
      await createDonation({
        donor_id: donor.id,
        donation_type: 'organ_pledge',
        donation_date: new Date().toISOString().split('T')[0],
        points_earned: 60,
      });
    }

    await refreshProfile();
    setShowCertificate(true);
    setSubmitting(false);
  }

  function downloadCertificate() {
    window.print();
  }

  if (!donor) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-slate-500">No donor profile found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <span className="text-xs font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-3 py-1 rounded-full border border-primary-200">
          Official Registry
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-2">
          Posthumous Organ Donation Pledge
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Pledge your organs to save up to 8 lives. Select organs on the interactive anatomical diagram.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Anatomical Body Diagram */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-100 shadow-md p-6 sm:p-7">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-slate-900 text-lg">Interactive Body Diagram</h3>
            <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2.5 py-1 rounded-lg">
              {selectedOrgans.length} Selected
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-6">Click on any organ node to pledge or remove it.</p>

          <div className="flex justify-center bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <svg viewBox="0 0 200 280" className="w-64 h-80 drop-shadow-sm select-none">
              {/* Stylized Body Silhouette */}
              <ellipse cx="100" cy="35" rx="16" ry="20" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.5" />
              <path
                d="M 80 58 Q 75 55 82 55 L 118 55 Q 125 55 120 58 L 126 100 L 122 150 L 126 210 L 110 265 L 90 265 L 74 210 L 78 150 L 74 100 Z"
                fill="#f8fafc"
                stroke="#cbd5e1"
                strokeWidth="1.5"
              />
              <path d="M 75 60 L 52 130 L 48 140" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M 125 60 L 148 130 L 152 140" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" />

              {/* Organ Nodes */}
              {ORGAN_TYPES.map((organ) => {
                const pos = organPositions[organ];
                if (!pos) return null;
                const isSelected = selectedOrgans.includes(organ);
                return (
                  <g
                    key={organ}
                    onClick={() => toggleOrgan(organ)}
                    className="cursor-pointer group"
                  >
                    <circle
                      cx={pos.cx}
                      cy={pos.cy}
                      r={isSelected ? 11 : 7}
                      fill={isSelected ? '#dc2626' : '#94a3b8'}
                      stroke={isSelected ? '#ffffff' : '#cbd5e1'}
                      strokeWidth={isSelected ? 2 : 1}
                      className="transition-all duration-300"
                    />
                    {isSelected && (
                      <circle
                        cx={pos.cx}
                        cy={pos.cy}
                        r={16}
                        fill="none"
                        stroke="#dc2626"
                        strokeWidth="1.5"
                        opacity="0.4"
                        className="animate-pulse"
                      />
                    )}
                    <text
                      x={pos.cx}
                      y={pos.cy + 3.5}
                      textAnchor="middle"
                      fill="white"
                      fontSize="9"
                      fontWeight="bold"
                    >
                      {isSelected ? '✓' : ''}
                    </text>
                    <text
                      x={pos.cx + (pos.cx > 90 ? 16 : -16)}
                      y={pos.cy + 3.5}
                      textAnchor={pos.cx > 90 ? 'start' : 'end'}
                      fill={isSelected ? '#dc2626' : '#64748b'}
                      fontSize="10"
                      fontWeight={isSelected ? 'bold' : 'normal'}
                    >
                      {organ}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="mt-5 flex flex-wrap gap-2 justify-center">
            {ORGAN_TYPES.map((organ) => {
              const active = selectedOrgans.includes(organ);
              return (
                <button
                  key={organ}
                  type="button"
                  onClick={() => toggleOrgan(organ)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    active
                      ? 'bg-primary-600 text-white shadow-md shadow-primary-600/20'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {active && <Check className="w-3.5 h-3.5" />}
                  {organ}
                </button>
              );
            })}
          </div>
        </div>

        {/* Medical Form & Action */}
        <div className="lg:col-span-6 space-y-6">
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-100 shadow-md p-6 sm:p-7 space-y-5">
            <h3 className="font-black text-slate-900 text-lg">Medical Quick-Form (Optional)</h3>
            <p className="text-xs text-slate-500">Helps transplant coordinators quickly evaluate compatibility during allocation.</p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Known Drug / Environmental Allergies
              </label>
              <input
                type="text"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="e.g. Penicillin, Sulfa, None"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/40"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Pre-existing Medical Conditions
              </label>
              <input
                type="text"
                value={conditions}
                onChange={(e) => setConditions(e.target.value)}
                placeholder="e.g. Hypertension (controlled), None"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/40"
              />
            </div>

            <div className="p-4 bg-primary-50/60 rounded-2xl border border-primary-100">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  By submitting this pledge, your digital donor pledge certificate will be generated with a unique Donor ID and verifiable QR code registered in your city zone.
                </p>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-xs font-semibold text-primary-700 bg-primary-50 p-3 rounded-xl">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold rounded-2xl shadow-xl shadow-primary-600/25 transition-all disabled:opacity-60 text-base"
            >
              <Heart className="w-5 h-5 fill-white" />
              {submitting ? 'Registering Pledge...' : 'Submit & Generate Certificate'}
            </button>
          </form>
        </div>
      </div>

      {/* Digital Pledge Certificate Modal */}
      <AnimatePresence>
        {showCertificate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setShowCertificate(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 p-6 text-center text-white relative">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Check className="w-8 h-8 text-white stroke-[3]" />
                </div>
                <h2 className="text-2xl font-black">Pledge Registered!</h2>
                <p className="text-primary-100 text-xs sm:text-sm mt-1">
                  Thank you, you've registered as an official lifesaver 💓
                </p>
              </div>

              {/* Printable Certificate Frame */}
              <div className="p-6 sm:p-7">
                <div className="border-2 border-primary-200 rounded-3xl p-6 bg-gradient-to-b from-red-50/30 to-white text-center shadow-inner">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Award className="w-6 h-6 text-primary-600" />
                    <span className="font-extrabold text-sm tracking-wider text-primary-700 uppercase">
                      Aarogyam National Donor Registry
                    </span>
                  </div>
                  <h3 className="font-black text-xl text-slate-900 mb-1">Pledge Certificate</h3>
                  <p className="text-xs text-slate-500 mb-3">This certifies that</p>
                  
                  <p className="text-2xl font-black text-slate-900 mb-1">{donor.full_name}</p>
                  <p className="text-xs font-bold text-primary-600 mb-4">Blood Group: {donor.blood_group} · {donor.city}</p>

                  <p className="text-xs text-slate-600 mb-3">has officially pledged to donate:</p>
                  <div className="flex flex-wrap gap-1.5 justify-center mb-5">
                    {selectedOrgans.map((organ) => (
                      <span key={organ} className="px-2.5 py-1 bg-primary-100 text-primary-800 rounded-lg text-xs font-bold">
                        {organ}
                      </span>
                    ))}
                  </div>

                  <div className="flex justify-center mb-3">
                    <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-sm">
                      <QRCodeSVG value={`https://aarogyam.health/donor/${donorCode}`} size={110} />
                    </div>
                  </div>

                  <p className="font-mono text-xs font-bold text-slate-700">Donor ID: {donorCode}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Timestamp: {new Date().toLocaleDateString()}</p>
                </div>

                <div className="flex gap-3 mt-5">
                  <button
                    onClick={downloadCertificate}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-slate-900 hover:bg-black text-white font-bold rounded-2xl text-sm transition-all shadow-md"
                  >
                    <Download className="w-4 h-4" />
                    Download / Print
                  </button>
                  <button
                    onClick={() => setShowCertificate(false)}
                    className="px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-sm transition-all"
                  >
                    Done
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
