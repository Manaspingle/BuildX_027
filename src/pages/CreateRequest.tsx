import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Droplet, Heart, Siren, ArrowRight, AlertCircle, Clock, MapPin, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { createRequest } from '@/lib/firebaseDb';
import { BLOOD_GROUPS, ORGAN_TYPES, URGENCY_LEVELS, CITIES } from '@/lib/constants';

export default function CreateRequest() {
  const { hospital } = useAuth();
  const navigate = useNavigate();
  const [requestType, setRequestType] = useState<'blood' | 'organ'>('blood');
  const [specificType, setSpecificType] = useState('O-');
  const [urgency, setUrgency] = useState<'Critical' | 'High' | 'Moderate'>('Critical');
  const [patientAge, setPatientAge] = useState('42');
  const [patientCity, setPatientCity] = useState(hospital?.city || 'Mumbai');
  const [requiredBy, setRequiredBy] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const typeOptions = requestType === 'blood' ? BLOOD_GROUPS : ORGAN_TYPES;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!hospital) return;
    setError(null);
    setSubmitting(true);

    try {
      const requiredByDate = requiredBy
        ? new Date(requiredBy).toISOString()
        : new Date(Date.now() + 6 * 3600 * 1000).toISOString();

      const created = await createRequest({
        hospital_id: hospital.id,
        request_type: requestType,
        specific_type: specificType,
        urgency,
        patient_age: parseInt(patientAge) || 30,
        patient_city: patientCity,
        required_by: requiredByDate,
        status: 'Pending',
        matched_donor_id: null,
        match_score: null,
        delivery_time: null,
      });

      navigate(`/matching-engine?requestId=${created.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to submit request');
      setSubmitting(false);
    }
  }

  if (!hospital) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <p className="text-slate-500">Please log in as a hospital center to create an emergency request.</p>
      </div>
    );
  }

  const inputClass = 'w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-400 transition-all';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <span className="text-xs font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-3 py-1 rounded-full border border-primary-200">
          Emergency Allocation
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-2">
          Create Emergency Request
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Submit immediate patient requirements to initiate live scoring across eligible city donors.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Request Category Selector */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-6 sm:p-7">
          <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
            Allocation Category
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => {
                setRequestType('blood');
                setSpecificType('O-');
              }}
              className={`flex items-center gap-3.5 p-4 rounded-2xl border-2 transition-all ${
                requestType === 'blood'
                  ? 'border-primary-600 bg-primary-50 text-primary-800 shadow-sm'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <div className={`p-2.5 rounded-xl ${requestType === 'blood' ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                <Droplet className="w-5 h-5 fill-current" />
              </div>
              <div className="text-left">
                <p className="font-extrabold text-sm sm:text-base">Blood Units</p>
                <p className="text-[11px] text-slate-500">RBC / Whole blood match</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setRequestType('organ');
                setSpecificType('Kidney');
              }}
              className={`flex items-center gap-3.5 p-4 rounded-2xl border-2 transition-all ${
                requestType === 'organ'
                  ? 'border-teal-600 bg-teal-50 text-teal-800 shadow-sm'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <div className={`p-2.5 rounded-xl ${requestType === 'organ' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                <Heart className="w-5 h-5 fill-current" />
              </div>
              <div className="text-left">
                <p className="font-extrabold text-sm sm:text-base">Organ Transplant</p>
                <p className="text-[11px] text-slate-500">Kidney, Liver, Cornea, etc.</p>
              </div>
            </button>
          </div>
        </div>

        {/* Details Card */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-6 sm:p-7 space-y-5">
          <h3 className="font-black text-slate-900 text-lg">Patient & Urgency Details</h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {requestType === 'blood' ? 'Specific Blood Group' : 'Organ Type Required'}
              </label>
              <select
                value={specificType}
                onChange={(e) => setSpecificType(e.target.value)}
                className={inputClass}
              >
                {typeOptions.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Clinical Urgency Level
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as typeof urgency)}
                className={inputClass}
              >
                {URGENCY_LEVELS.map((u) => (
                  <option key={u} value={u}>{u} Urgency</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Patient Age (Demo safe)
              </label>
              <input
                type="number"
                value={patientAge}
                onChange={(e) => setPatientAge(e.target.value)}
                min="1"
                max="110"
                placeholder="45"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Patient City Location
              </label>
              <select
                value={patientCity}
                onChange={(e) => setPatientCity(e.target.value)}
                className={inputClass}
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Required By (Time Window)
              </label>
              <input
                type="datetime-local"
                value={requiredBy}
                onChange={(e) => setRequiredBy(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2.5 text-xs font-semibold text-primary-700 bg-primary-50 p-3.5 rounded-2xl border border-primary-200">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2.5 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold rounded-2xl shadow-xl shadow-primary-600/25 transition-all transform hover:-translate-y-0.5 disabled:opacity-60 text-base"
        >
          <Siren className="w-5 h-5 animate-pulse" />
          {submitting ? 'Submitting & Initializing...' : 'Submit Request & Open Matching Engine'}
          <ArrowRight className="w-5 h-5 ml-1" />
        </button>
      </form>
    </div>
  );
}
