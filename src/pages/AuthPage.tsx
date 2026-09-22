import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Building2, Mail, Lock, User, Phone, MapPin, BadgeCheck,
  ChevronRight, AlertCircle, Check
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { BLOOD_GROUPS, ORGAN_TYPES, CITIES, CITY_COORDS } from '@/lib/constants';

export default function AuthPage() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialMode = (searchParams.get('mode') as 'login' | 'signup') || 'login';
  const initialRole = (searchParams.get('role') as 'individual' | 'hospital') || 'individual';

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [role, setRole] = useState<'individual' | 'hospital'>(initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Individual signup fields
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('28');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [city, setCity] = useState('Mumbai');
  const [phone, setPhone] = useState('9876543210');
  const [organs, setOrgans] = useState<string[]>(['Kidney', 'Liver', 'Cornea']);
  const [emergencyContact, setEmergencyContact] = useState('9876543211');
  const [consent, setConsent] = useState(true);

  // Hospital signup fields
  const [hospitalName, setHospitalName] = useState('');
  const [registrationId, setRegistrationId] = useState('');
  const [address, setAddress] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [hospitalPhone, setHospitalPhone] = useState('');
  const [verified, setVerified] = useState(true);

  useEffect(() => {
    const urlMode = searchParams.get('mode');
    const urlRole = searchParams.get('role');
    if (urlMode === 'login' || urlMode === 'signup') setMode(urlMode);
    if (urlRole === 'individual' || urlRole === 'hospital') setRole(urlRole);
  }, [searchParams]);

  function toggleOrgan(organ: string) {
    setOrgans((prev) =>
      prev.includes(organ) ? prev.filter((o) => o !== organ) : [...prev, organ]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === 'login') {
      const { error: loginError } = await signIn(email, password);
      if (loginError) {
        setError(loginError);
        setLoading(false);
        return;
      }
      navigate('/dashboard');
    } else {
      const coords = CITY_COORDS[city] || { lat: 19.0760, lng: 72.8777 };

      if (role === 'individual') {
        const { error: signUpError } = await signUp(email, password, role, {
          full_name: fullName || 'New Donor',
          age: parseInt(age) || 25,
          blood_group: bloodGroup,
          city,
          phone,
          organs,
          emergency_contact: emergencyContact,
          consent,
          available: true,
          donor_level: 'Bronze',
          donor_points: organs.length > 0 ? 60 : 0,
          blood_donations: 0,
          medical_allergies: '',
          medical_conditions: '',
          lat: coords.lat + (Math.random() - 0.5) * 0.05,
          lng: coords.lng + (Math.random() - 0.5) * 0.05,
        });
        if (signUpError) {
          setError(signUpError);
          setLoading(false);
          return;
        }
        navigate('/dashboard');
      } else {
        const { error: signUpError } = await signUp(email, password, role, {
          hospital_name: hospitalName || 'New Hospital',
          registration_id: registrationId || 'REG-MH-999',
          city,
          address,
          contact_person: contactPerson,
          phone: hospitalPhone,
          verified,
          lat: coords.lat + (Math.random() - 0.5) * 0.05,
          lng: coords.lng + (Math.random() - 0.5) * 0.05,
          inventory: {
            'O+': 8,
            'O-': 4,
            'A+': 6,
            'B+': 5,
            'Kidney': 2,
            'Liver': 1,
          },
        });
        if (signUpError) {
          setError(signUpError);
          setLoading(false);
          return;
        }
        navigate('/hospital-dashboard');
      }
    }

    setLoading(false);
  }

  const inputClass = 'w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-400 transition-all text-sm font-medium';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-red-50/30 flex items-center justify-center p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 px-8 py-7 text-white">
            <Link to="/" className="inline-flex items-center gap-2.5 text-white mb-3 hover:opacity-90 transition-opacity">
              <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" fill="white" />
              </div>
              <span className="text-xl font-black">Aarogyam</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black">
              {mode === 'login' ? 'Welcome Back' : 'Join the Aarogyam Network'}
            </h1>
            <p className="text-primary-100 text-xs sm:text-sm mt-1">
              {mode === 'login'
                ? 'Sign in to your donor or hospital account to continue'
                : 'Connect with local hospitals, donors, and recipients in emergencies'}
            </p>
          </div>

          <div className="p-6 sm:p-8">
            {/* Mode toggle (Login / Signup) */}
            <div className="flex gap-2 mb-6 p-1.5 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  mode === 'login' ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  mode === 'signup' ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Register
              </button>
            </div>

            {/* Role toggle (Individual / Hospital) */}
            <div className="flex gap-3 mb-6">
              <button
                type="button"
                onClick={() => setRole('individual')}
                className={`flex-1 flex items-center justify-center gap-2.5 py-3 rounded-2xl border-2 transition-all font-bold text-sm ${
                  role === 'individual'
                    ? 'border-primary-600 bg-primary-50/70 text-primary-700 shadow-sm'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <User className="w-4 h-4" />
                Individual / Donor
              </button>
              <button
                type="button"
                onClick={() => setRole('hospital')}
                className={`flex-1 flex items-center justify-center gap-2.5 py-3 rounded-2xl border-2 transition-all font-bold text-sm ${
                  role === 'hospital'
                    ? 'border-primary-600 bg-primary-50/70 text-primary-700 shadow-sm'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <Building2 className="w-4 h-4" />
                Hospital Center
              </button>
            </div>

            {/* Main Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                {mode === 'signup' && role === 'individual' && (
                  <motion.div
                    key="individual-signup"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 overflow-hidden"
                  >
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className={inputClass}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="number"
                          placeholder="Age"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          required
                          min="18"
                          max="80"
                          className={inputClass}
                        />
                      </div>
                      <select
                        value={bloodGroup}
                        onChange={(e) => setBloodGroup(e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500/40"
                      >
                        {BLOOD_GROUPS.map((bg) => (
                          <option key={bg} value={bg}>Blood Group: {bg}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500/40"
                      >
                        {CITIES.map((c) => (
                          <option key={c} value={c}>City: {c}</option>
                        ))}
                      </select>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="tel"
                          placeholder="Phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required
                          className={inputClass}
                        />
                      </div>
                    </div>

                    {/* Organs willing to donate multi-select */}
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <label className="block text-xs font-bold text-slate-700 mb-2">
                        Organs Willing to Donate (Posthumous Pledge)
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {ORGAN_TYPES.map((organ) => {
                          const active = organs.includes(organ);
                          return (
                            <button
                              key={organ}
                              type="button"
                              onClick={() => toggleOrgan(organ)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                active
                                  ? 'bg-primary-600 text-white shadow-sm'
                                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              {active && <Check className="w-3.5 h-3.5" />}
                              {organ}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Emergency Contact Phone"
                        value={emergencyContact}
                        onChange={(e) => setEmergencyContact(e.target.value)}
                        className={inputClass}
                      />
                    </div>

                    <label className="flex items-start gap-3 p-3 bg-primary-50/50 rounded-2xl border border-primary-100 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={consent}
                        onChange={(e) => setConsent(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-xs text-slate-700 leading-relaxed font-medium">
                        I hereby pledge to donate my chosen organs posthumously for transplantation. I understand this helps save lives after brain/cardiac death.
                      </span>
                    </label>
                  </motion.div>
                )}

                {mode === 'signup' && role === 'hospital' && (
                  <motion.div
                    key="hospital-signup"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 overflow-hidden"
                  >
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Hospital Name (e.g. Fortis Healthcare)"
                        value={hospitalName}
                        onChange={(e) => setHospitalName(e.target.value)}
                        required
                        className={inputClass}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <BadgeCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Registration ID"
                          value={registrationId}
                          onChange={(e) => setRegistrationId(e.target.value)}
                          required
                          className={inputClass}
                        />
                      </div>
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500/40"
                      >
                        {CITIES.map((c) => (
                          <option key={c} value={c}>City: {c}</option>
                        ))}
                      </select>
                    </div>

                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Complete Street Address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                        className={inputClass}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Contact Person / Head"
                          value={contactPerson}
                          onChange={(e) => setContactPerson(e.target.value)}
                          required
                          className={inputClass}
                        />
                      </div>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="tel"
                          placeholder="Emergency Phone"
                          value={hospitalPhone}
                          onChange={(e) => setHospitalPhone(e.target.value)}
                          required
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <label className="flex items-center gap-3 p-3 bg-teal-50 rounded-2xl border border-teal-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={verified}
                        onChange={(e) => setVerified(e.target.checked)}
                        className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500"
                      />
                      <span className="text-xs text-teal-900 font-bold">
                        Medical center verification pledge (Clinical license confirmed)
                      </span>
                    </label>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Common Credentials */}
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  placeholder="Official Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={inputClass}
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  placeholder="Password (min 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className={inputClass}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2.5 text-xs font-semibold text-primary-700 bg-primary-50 p-3.5 rounded-2xl border border-primary-200">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold rounded-2xl transition-all shadow-xl shadow-primary-600/25 disabled:opacity-60 text-base"
              >
                {loading ? 'Authenticating...' : mode === 'login' ? 'Sign In' : 'Create Account'}
                <ChevronRight className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
