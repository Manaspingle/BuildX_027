import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Siren, Phone, MapPin, Building2, ShieldAlert, Clock,
  CheckCircle2, AlertTriangle, X, Radio, ArrowRight, BedDouble,
  Stethoscope, Navigation, ExternalLink, Activity, Info, Users, Plus, Minus
} from 'lucide-react';
import { AMBULANCE_SERVICES, EMERGENCY_HOSPITALS } from '@/lib/mockData';
import { useLanguage } from '@/context/LanguageContext';
import { createEmergencyIncident } from '@/lib/firebaseDb';
import type { AmbulanceDriver, EmergencyHospital, EmergencyIncident } from '@/types';

interface EmergencyAccidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCity?: 'Mumbai' | 'Pune' | 'Nagpur';
}

type EmergencyTab = 'ambulance' | 'private_hospitals' | 'government_hospitals';

export default function EmergencyAccidentModal({
  isOpen,
  onClose,
  defaultCity = 'Mumbai',
}: EmergencyAccidentModalProps) {
  const { t } = useLanguage();
  const [selectedCity, setSelectedCity] = useState<'Mumbai' | 'Pune' | 'Nagpur'>(defaultCity);
  const [activeTab, setActiveTab] = useState<EmergencyTab>('ambulance');
  const [patientCount, setPatientCount] = useState<number>(1);
  const [callingAmbulance, setCallingAmbulance] = useState<AmbulanceDriver | null>(null);
  const [callInitiated, setCallInitiated] = useState(false);
  
  // Real-time triggered hospital state
  const [selectedHospital, setSelectedHospital] = useState<EmergencyHospital | null>(null);
  const [secondaryHospital, setSecondaryHospital] = useState<EmergencyHospital | null>(null);
  const [splitAllocation, setSplitAllocation] = useState<{ primaryPatients: number; secondaryPatients: number } | null>(null);
  const [triggerDispatched, setTriggerDispatched] = useState(false);
  const [emergencyToken, setEmergencyToken] = useState<string>('');
  const [countdownMinutes, setCountdownMinutes] = useState<number>(0);

  // Strictly filter ambulances by selected city ONLY
  const cityAmbulances = AMBULANCE_SERVICES.filter(
    (a) => a.city.toLowerCase() === selectedCity.toLowerCase()
  );

  // Strictly filter hospitals by selected city and type ONLY
  const privateHospitals = EMERGENCY_HOSPITALS.filter(
    (h) => h.city.toLowerCase() === selectedCity.toLowerCase() && h.type === 'Private'
  );

  const govHospitals = EMERGENCY_HOSPITALS.filter(
    (h) => h.city.toLowerCase() === selectedCity.toLowerCase() && h.type === 'Government'
  );

  const handleAmbulanceCall = (amb: AmbulanceDriver) => {
    setCallingAmbulance(amb);
    setCallInitiated(true);
    // Direct tel: dialing link
    window.location.href = `tel:${amb.phone.replace(/[^0-9+]/g, '')}`;
  };

  const handleHospitalTrigger = (hospital: EmergencyHospital) => {
    setSelectedHospital(hospital);
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const token = `EMG-${selectedCity.substring(0, 3).toUpperCase()}-${randomNum}`;
    setEmergencyToken(token);
    setCountdownMinutes(hospital.reach_time_minutes);

    // Multi-Patient simultaneous bed allocation logic
    const primaryBeds = Math.max(1, hospital.beds.trauma_available);
    let primaryPatients = patientCount;
    let secondaryPatients = 0;
    let secHosp: EmergencyHospital | null = null;

    if (patientCount > primaryBeds) {
      primaryPatients = primaryBeds;
      secondaryPatients = patientCount - primaryBeds;
      // Automatically route remaining patients to closest other hospital in the SAME city
      const otherHospitalsInCity = EMERGENCY_HOSPITALS.filter(
        (h) => h.id !== hospital.id && h.city.toLowerCase() === selectedCity.toLowerCase()
      );
      secHosp = otherHospitalsInCity[0] || null;
      setSecondaryHospital(secHosp);
    } else {
      setSecondaryHospital(null);
    }

    setSplitAllocation({ primaryPatients, secondaryPatients });

    // Persist real-time casualty incident to database & notify hospital dashboard
    const incident: EmergencyIncident = {
      id: `incident_${Date.now()}`,
      token,
      city: selectedCity,
      primary_hospital_id: hospital.id,
      primary_hospital_name: hospital.name,
      secondary_hospital_id: secHosp?.id,
      secondary_hospital_name: secHosp?.name,
      patients_total: patientCount,
      patients_primary: primaryPatients,
      patients_secondary: secondaryPatients,
      reach_time_minutes: hospital.reach_time_minutes,
      timestamp: new Date().toISOString(),
      status: 'Prepped & Awaiting Patient',
      caller_note: `Emergency triage for ${patientCount} patient(s). Primary bay reserved ${primaryPatients} beds.${secondaryPatients > 0 ? ` ${secondaryPatients} re-routed to ${secHosp?.name}.` : ''}`,
    };
    createEmergencyIncident(incident);

    setTriggerDispatched(true);
  };

  const handleResetWorkflow = () => {
    setTriggerDispatched(false);
    setSelectedHospital(null);
    setSecondaryHospital(null);
    setSplitAllocation(null);
    setCallingAmbulance(null);
    setCallInitiated(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/85 backdrop-blur-md flex justify-center items-start p-3 sm:p-6 py-6 sm:py-10 min-h-screen">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border-2 border-red-500/40 overflow-hidden my-auto"
        >
          {/* Top Emergency Red Header Banner with pulsating beacon */}
          <div className="bg-gradient-to-r from-red-600 via-red-700 to-rose-700 text-white px-6 py-5 flex items-center justify-between relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center gap-3.5 z-10">
              <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-white/20 border border-white/30 animate-pulse">
                <Siren className="w-7 h-7 text-white animate-bounce" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-300 opacity-75" />
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-yellow-400 border border-white" />
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-white/25 text-[11px] font-black uppercase tracking-wider">
                    Immediate Bystander Aid
                  </span>
                  <span className="text-red-200 text-xs font-semibold">• Zero Login Required</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
                  {t('emergency.modal_title')}
                </h2>
                <p className="text-xs sm:text-sm text-red-100 font-medium">
                  {t('emergency.modal_desc')}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="z-10 p-2.5 rounded-xl bg-white/15 hover:bg-white/30 text-white transition-colors"
              title={t('emergency.close')}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Quick Helpline Hotline Bar */}
          <div className="bg-red-50 border-b border-red-100 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-red-800 font-bold">
              <Phone className="w-4 h-4 text-red-600 animate-pulse" />
              <span>National Emergency Medical Helpline:</span>
              <a
                href="tel:108"
                className="px-2.5 py-0.5 rounded-lg bg-red-600 text-white font-black hover:bg-red-700 transition-colors shadow-sm"
              >
                Call 108 (Toll Free)
              </a>
              <a
                href="tel:112"
                className="px-2.5 py-0.5 rounded-lg bg-slate-800 text-white font-black hover:bg-slate-900 transition-colors"
              >
                Call 112
              </a>
            </div>

            {/* City Selector */}
            <div className="flex items-center gap-2">
              <span className="text-slate-600 font-semibold text-xs">
                {t('emergency.filter_city')}
              </span>
              <div className="flex bg-white rounded-xl p-1 border border-slate-200 shadow-sm">
                {(['Mumbai', 'Pune', 'Nagpur'] as const).map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => {
                      setSelectedCity(city);
                      handleResetWorkflow();
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      selectedCity === city
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Real-time Hospital Dispatched View */}
          {triggerDispatched && selectedHospital ? (
            <div className="p-6 sm:p-8 bg-gradient-to-b from-white to-red-50/40 space-y-6">
              <div className="p-6 rounded-3xl bg-white border-2 border-red-500 shadow-xl space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
                      <Radio className="w-6 h-6 animate-spin text-red-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-red-600 text-white text-[10px] font-black uppercase">
                          Live Emergency Beacon Dispatched
                        </span>
                        <span className="text-slate-500 text-xs font-semibold">
                          City: {selectedHospital.city}
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-slate-900 mt-0.5">
                        {selectedHospital.name}
                      </h3>
                      <p className="text-xs text-slate-500">{selectedHospital.address}</p>
                    </div>
                  </div>

                  <div className="text-right sm:text-right bg-red-50 px-4 py-2.5 rounded-2xl border border-red-200">
                    <p className="text-[11px] text-red-600 font-bold uppercase tracking-wider">
                      {t('emergency.token')}
                    </p>
                    <p className="text-xl font-black text-red-700 tracking-wider font-mono">
                      {emergencyToken}
                    </p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-2 text-slate-600 text-xs font-bold mb-1">
                      <Clock className="w-4 h-4 text-red-600" />
                      <span>{t('emergency.eta')}</span>
                    </div>
                    <p className="text-2xl font-black text-slate-900">
                      ~{countdownMinutes} {t('common.minutes')}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Distance: {selectedHospital.distance_km} {t('common.km')}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-2 text-slate-600 text-xs font-bold mb-1">
                      <BedDouble className="w-4 h-4 text-brand-teal" />
                      <span>Reserved ICU / Trauma Beds</span>
                    </div>
                    <p className="text-2xl font-black text-brand-teal">
                      {selectedHospital.beds.trauma_available} Trauma / {selectedHospital.beds.icu_available} ICU
                    </p>
                    <p className="text-[11px] text-emerald-600 font-semibold">
                      ✓ Emergency bay prepped on standby
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-2 text-slate-600 text-xs font-bold mb-1">
                      <Stethoscope className="w-4 h-4 text-blue-600" />
                      <span>Duty Emergency Physician</span>
                    </div>
                    <p className="text-sm font-black text-slate-900">
                      {selectedHospital.doctors[0]?.name || 'Dr. Trauma Specialist'}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {selectedHospital.doctors[0]?.role} (Ready at Casualty)
                    </p>
                  </div>
                </div>

                {/* Multi-Patient Split Allocation Banner if Trauma Beds Were Re-routed */}
                {splitAllocation && splitAllocation.secondaryPatients > 0 && secondaryHospital && (
                  <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-400 text-amber-950 space-y-3 shadow-md">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-600 animate-bounce" />
                      <p className="text-xs sm:text-sm font-black text-amber-900">
                        {t('emergency.reroute_notice')}
                      </p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3 text-xs">
                      {/* Primary Hospital */}
                      <div className="p-3.5 bg-white rounded-xl border border-amber-300 shadow-sm space-y-1">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">
                          {t('emergency.primary_hosp')}
                        </span>
                        <p className="font-black text-slate-900 text-sm">{selectedHospital.name}</p>
                        <p className="text-emerald-700 font-extrabold text-sm">
                          ✓ {splitAllocation.primaryPatients} {t('emergency.patients_count')} Assigned (Full Bay Reserved)
                        </p>
                        <p className="text-[11px] text-slate-500">ETA: ~{countdownMinutes} mins · {selectedHospital.distance_km} km</p>
                      </div>

                      {/* Secondary Auto-routed Hospital */}
                      <div className="p-3.5 bg-white rounded-xl border border-red-300 shadow-sm space-y-1">
                        <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-black uppercase">
                          {t('emergency.secondary_hosp')}
                        </span>
                        <p className="font-black text-slate-900 text-sm">{secondaryHospital.name}</p>
                        <p className="text-red-700 font-extrabold text-sm">
                          ⚡ {splitAllocation.secondaryPatients} {t('emergency.patients_count')} Auto-Rerouted (Trauma Bay Prepped)
                        </p>
                        <p className="text-[11px] text-slate-500">ETA: ~{secondaryHospital.reach_time_minutes} mins · {secondaryHospital.distance_km} km</p>
                        <div className="pt-1 flex items-center gap-2">
                          <a
                            href={secondaryHospital.google_maps_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] transition-colors"
                          >
                            Route Maps ↗
                          </a>
                          <a
                            href={`tel:${secondaryHospital.phone.replace(/[^0-9+]/g, '')}`}
                            className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-bold text-[11px] transition-colors"
                          >
                            Call Casualty
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Live Checklist */}
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
                  <p className="text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Real-Time Actions Initiated by Hospital Casualty Department:</span>
                  </p>
                  <ul className="text-xs space-y-1 text-emerald-800 list-disc list-inside pl-2">
                    <li>Emergency resuscitation bay and crash cart reserved for {patientCount} incoming accident victim(s).</li>
                    <li>Blood bank notified for rapid universal O- / O+ matching standby.</li>
                    <li>Casualty triage team and trauma surgeon assigned to Token {emergencyToken}.</li>
                  </ul>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    onClick={handleResetWorkflow}
                    className="px-5 py-2.5 rounded-xl border border-slate-300 font-bold text-xs sm:text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    ← {t('emergency.back')}
                  </button>

                  <div className="flex items-center gap-3">
                    <a
                      href={selectedHospital.google_maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-600/30 transition-all"
                    >
                      <Navigation className="w-4 h-4" />
                      {t('emergency.maps_directions')}
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href={`tel:${selectedHospital.phone.replace(/[^0-9+]/g, '')}`}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-red-600/30 transition-all animate-pulse"
                    >
                      <Phone className="w-4 h-4" />
                      Call Casualty Directly: {selectedHospital.emergency_helpline.split('/')[0]}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 sm:p-6 space-y-5">
              {/* Patient Count Selector with Simultaneous Allocation Notice */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-red-50 via-slate-50 to-orange-50/50 border-2 border-red-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-red-600" />
                      {t('emergency.num_patients')}:
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white font-black text-xs">
                      {patientCount} {patientCount === 1 ? 'Victim' : 'Victims'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    {t('emergency.num_patients_hint')}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 self-start md:self-auto bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                  {[1, 2, 3, 4, 5, 8].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setPatientCount(num)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                        patientCount === num
                          ? 'bg-red-600 text-white shadow-md'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                  <div className="flex items-center pl-1 border-l border-slate-200">
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={patientCount}
                      onChange={(e) => setPatientCount(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-12 text-center text-xs font-black text-red-600 bg-slate-50 py-1 rounded-md focus:outline-none"
                      title="Custom Patient Count"
                    />
                  </div>
                </div>
              </div>

              {/* 3 Main Workflow Options as requested */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Option 1: Direct Ambulance Call */}
                <button
                  type="button"
                  onClick={() => setActiveTab('ambulance')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                    activeTab === 'ambulance'
                      ? 'border-red-600 bg-red-50/50 shadow-md ring-2 ring-red-500/20'
                      : 'border-slate-200 hover:border-red-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      activeTab === 'ambulance' ? 'bg-red-600 text-white' : 'bg-red-100 text-red-600'
                    }`}>
                      <Phone className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-black uppercase">
                      Option 1
                    </span>
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-base">
                      {t('emergency.tab_ambulance')}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Fleet of {cityAmbulances.length} registered ambulance drivers with live ETA & price
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-xs font-bold text-red-600">
                    <span>Call Driver Directly</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>

                {/* Option 2: Nearby Private Hospital Service */}
                <button
                  type="button"
                  onClick={() => setActiveTab('private_hospitals')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                    activeTab === 'private_hospitals'
                      ? 'border-brand-teal bg-teal-50/50 shadow-md ring-2 ring-brand-teal/20'
                      : 'border-slate-200 hover:border-teal-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      activeTab === 'private_hospitals' ? 'bg-brand-teal text-white' : 'bg-teal-100 text-brand-teal'
                    }`}>
                      <Building2 className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-teal-100 text-brand-teal text-[10px] font-black uppercase">
                      Option 2
                    </span>
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-base">
                      {t('emergency.tab_private')}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Multi-specialty emergency centers with live doctor & bed counts
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-xs font-bold text-brand-teal">
                    <span>Check Beds & Trigger</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>

                {/* Option 3: Nearby Government Hospital Service */}
                <button
                  type="button"
                  onClick={() => setActiveTab('government_hospitals')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                    activeTab === 'government_hospitals'
                      ? 'border-brand-orange bg-orange-50/50 shadow-md ring-2 ring-brand-orange/20'
                      : 'border-slate-200 hover:border-orange-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      activeTab === 'government_hospitals' ? 'bg-brand-orange text-white' : 'bg-orange-100 text-brand-orange'
                    }`}>
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-orange-100 text-brand-orange text-[10px] font-black uppercase">
                      Option 3
                    </span>
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-base">
                      {t('emergency.tab_government')}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Civic / Govt medical colleges with free trauma triage & emergency OT
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-xs font-bold text-brand-orange">
                    <span>Free Triage & Route</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              </div>

              {/* Call Confirmation Alert Banner */}
              {callInitiated && callingAmbulance && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                      <Phone className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-emerald-800">
                        Ambulance Call Triggered for {callingAmbulance.driver_name} ({callingAmbulance.vehicle_no})
                      </p>
                      <p className="text-xs text-emerald-700">
                        Direct phone: <strong className="font-mono">{callingAmbulance.phone}</strong> • Reaching in ~{callingAmbulance.reach_time_minutes} mins
                      </p>
                    </div>
                  </div>
                  <a
                    href={`tel:${callingAmbulance.phone.replace(/[^0-9+]/g, '')}`}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors shadow-sm"
                  >
                    Redial Now
                  </a>
                </motion.div>
              )}

              {/* TAB 1: Ambulance Service Fleet */}
              {activeTab === 'ambulance' && (
                <div className="space-y-4">
                  {/* Nagpur Dedicated Ambulance Hotline Banner */}
                  {selectedCity === 'Nagpur' && (
                    <div className="p-4 rounded-2xl bg-red-50 border-2 border-red-300 text-red-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md animate-fade-in">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-red-600 text-white flex items-center justify-center flex-shrink-0 animate-beep-pulse shadow-sm">
                          <Phone className="w-5 h-5 animate-pulse" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black uppercase">
                              Nagpur Priority Fleet
                            </span>
                            <span className="text-xs text-red-700 font-bold">• 24/7 Roadside Response</span>
                          </div>
                          <p className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">
                            Call official Nagpur emergency drivers directly:
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <a
                          href="tel:9067375860"
                          className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-red-600/30 transition-all transform active:scale-95"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call 9067375860</span>
                        </a>
                        <a
                          href="tel:8530779934"
                          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition-all transform active:scale-95"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call 8530779934</span>
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-black text-slate-900">
                        Registered Ambulance Fleet in {selectedCity}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {cityAmbulances.length} certified emergency responders available for immediate roadside accident dispatch
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                      All GPS Active
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[380px] overflow-y-auto pr-1">
                    {cityAmbulances.map((amb) => (
                      <div
                        key={amb.id}
                        className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-red-400 hover:shadow-md transition-all space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-slate-900 text-sm">
                                {amb.driver_name}
                              </span>
                              <span className="text-xs text-amber-500 font-bold flex items-center gap-0.5">
                                ★ {amb.rating}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 font-mono">
                              Vehicle: {amb.vehicle_no}
                            </p>
                          </div>

                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${
                            amb.capacity_type.includes('Large')
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {amb.capacity_type.includes('Large') ? 'Large (ICU / Vent)' : 'Small (Basic BLS)'}
                          </span>
                        </div>

                        {/* Equipment tags */}
                        <div className="flex flex-wrap gap-1">
                          {amb.equipment.map((eq, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-medium"
                            >
                              {eq}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                          <div>
                            <span className="text-slate-500 text-[10px] block">Estimated Fare:</span>
                            <span className="font-black text-slate-900 text-sm">
                              ₹{amb.price_inr}
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="text-slate-500 text-[10px] block">Reach Time:</span>
                            <span className="font-black text-red-600 text-sm flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {amb.reach_time_minutes} mins ({amb.distance_km} km)
                            </span>
                          </div>
                        </div>

                        <a
                          href={`tel:${amb.phone.replace(/[^0-9+]/g, '')}`}
                          onClick={() => handleAmbulanceCall(amb)}
                          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-red-600/20 transition-all transform active:scale-95"
                        >
                          <Phone className="w-4 h-4 animate-bounce" />
                          <span>{t('emergency.call_now')}: {amb.phone}</span>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2 & 3: Private or Government Hospitals List */}
              {(activeTab === 'private_hospitals' || activeTab === 'government_hospitals') && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-black text-slate-900">
                        {activeTab === 'private_hospitals'
                          ? `Nearby Private Emergency Hospitals in ${selectedCity}`
                          : `Nearby Government / Civic Hospitals in ${selectedCity}`}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Real-time bed availability, on-duty doctors, and instant trauma alert dispatch
                      </p>
                    </div>

                    <span className="text-xs text-slate-500 font-semibold">
                      Location tracking active
                    </span>
                  </div>

                  <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                    {(activeTab === 'private_hospitals' ? privateHospitals : govHospitals).map((hosp) => (
                      <div
                        key={hosp.id}
                        className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-400 hover:shadow-lg transition-all space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-slate-900 text-base">
                                {hosp.name}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                hosp.type === 'Government'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-teal-100 text-teal-800'
                              }`}>
                                {hosp.type} • {hosp.cost_tier}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              {hosp.address}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 sm:text-right">
                            <div className="px-3 py-1.5 rounded-xl bg-red-50 text-red-700 border border-red-200 text-right">
                              <span className="text-[10px] uppercase font-bold block">Reach Time</span>
                              <span className="text-sm font-black flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                ~{hosp.reach_time_minutes} mins
                              </span>
                            </div>
                            <div className="px-3 py-1.5 rounded-xl bg-slate-50 text-slate-700 border border-slate-200 text-right">
                              <span className="text-[10px] uppercase font-bold block">Distance</span>
                              <span className="text-sm font-black">
                                {hosp.distance_km} km
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Bed Availability & Doctor Information */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Beds Counter */}
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                            <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-2">
                              <BedDouble className="w-4 h-4 text-brand-teal" />
                              <span>{t('emergency.beds_available')}:</span>
                            </p>
                            <div className="flex items-center justify-between text-xs">
                              <div className="text-center p-1.5 rounded-lg bg-white border border-slate-100">
                                <span className="text-[10px] text-slate-500 block">Trauma</span>
                                <span className="font-black text-red-600 text-sm">
                                  {hosp.beds.trauma_available} / {hosp.beds.trauma_total}
                                </span>
                              </div>
                              <div className="text-center p-1.5 rounded-lg bg-white border border-slate-100">
                                <span className="text-[10px] text-slate-500 block">ICU</span>
                                <span className="font-black text-amber-600 text-sm">
                                  {hosp.beds.icu_available} / {hosp.beds.icu_total}
                                </span>
                              </div>
                              <div className="text-center p-1.5 rounded-lg bg-white border border-slate-100">
                                <span className="text-[10px] text-slate-500 block">Emergency</span>
                                <span className="font-black text-emerald-600 text-sm">
                                  {hosp.beds.general_emergency_available} / {hosp.beds.general_emergency_total}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Doctors on Duty */}
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                            <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-2">
                              <Stethoscope className="w-4 h-4 text-blue-600" />
                              <span>{t('emergency.doctors_on_duty')}:</span>
                            </p>
                            <div className="space-y-1">
                              {hosp.doctors.slice(0, 2).map((doc, i) => (
                                <div key={i} className="flex items-center justify-between text-xs">
                                  <span className="font-semibold text-slate-800">
                                    {doc.name}
                                  </span>
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                                    {doc.specialization}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Interactive Buttons: Google Maps & Real-time Trigger */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                          <a
                            href={hosp.google_maps_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-colors"
                          >
                            <Navigation className="w-3.5 h-3.5" />
                            <span>{t('emergency.maps_directions')}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>

                          <div className="flex items-center gap-2">
                            <a
                              href={`tel:${hosp.phone.replace(/[^0-9+]/g, '')}`}
                              className="px-3 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs transition-colors"
                            >
                              Call: {hosp.emergency_helpline.split('/')[0]}
                            </a>

                            <div className="flex flex-col items-end gap-1">
                              {patientCount > hosp.beds.trauma_available && (
                                <span className="text-[10px] text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                  ⚡ {hosp.beds.trauma_available} here, {patientCount - hosp.beds.trauma_available} auto-routed
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => handleHospitalTrigger(hosp)}
                                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-red-600/25 transition-all transform active:scale-95"
                              >
                                <Siren className="w-4 h-4 animate-pulse" />
                                <span>
                                  {t('emergency.trigger_hospital')} ({patientCount} {patientCount === 1 ? 'Victim' : 'Victims'})
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Footer note for accident bystander */}
          <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-slate-500 text-xs">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-slate-400" />
              <span>
                Good Samaritan Law Protection: Helper has zero legal liability for reporting roadside trauma in India.
              </span>
            </div>
            <button
              onClick={onClose}
              className="font-bold text-slate-600 hover:text-slate-900 transition-colors"
            >
              {t('emergency.close')}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
