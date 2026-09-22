import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { 
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { collection, query, where, getDocs, setDoc, doc, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { getDonors, getHospitals, saveCustomHospital } from '@/lib/firebaseDb';
import type { Profile, Donor, Hospital } from '@/types';

interface AuthContextType {
  session: User | { uid: string; email: string } | null;
  profile: Profile | null;
  donor: Donor | null;
  hospital: Hospital | null;
  loading: boolean;
  signUp: (email: string, password: string, role: 'individual' | 'hospital', data: any) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const DEMO_SESSION_KEY = 'aarogyam_demo_session';
const LEGACY_DEMO_SESSION_KEY = 'lifelink_demo_session';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<User | { uid: string; email: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [donor, setDonor] = useState<Donor | null>(null);
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadUserData(user: { uid: string; email: string | null }) {
    try {
      const email = (user.email || '').toLowerCase();

      // Check registered donors
      const allDonors = await getDonors();
      const matchedDonor = allDonors.find(d => d.email.toLowerCase() === email || d.user_id === user.uid || d.id === user.uid);
      if (matchedDonor) {
        setDonor(matchedDonor);
        setHospital(null);
        setProfile({
          id: matchedDonor.id,
          user_id: user.uid,
          role: 'individual',
          email: matchedDonor.email,
          created_at: matchedDonor.created_at,
        });
        return;
      }

      // Check mock hospitals
      const allHospitals = await getHospitals();
      const matchedHospital = allHospitals.find(h => h.email.toLowerCase() === email || h.user_id === user.uid || h.id === user.uid);
      if (matchedHospital) {
        setHospital(matchedHospital);
        setDonor(null);
        setProfile({
          id: matchedHospital.id,
          user_id: user.uid,
          role: 'hospital',
          email: matchedHospital.email,
          created_at: matchedHospital.created_at,
        });
        return;
      }

      // Query Firestore
      try {
        const profilesRef = collection(db, 'profiles');
        const q = query(profilesRef, where('user_id', '==', user.uid));
        const profileSnap = await getDocs(q);

        if (!profileSnap.empty) {
          const profileData = profileSnap.docs[0].data() as Profile;
          setProfile(profileData);

          if (profileData.role === 'individual') {
            const donorsRef = collection(db, 'donors');
            const donorQuery = query(donorsRef, where('user_id', '==', user.uid));
            const donorSnap = await getDocs(donorQuery);
            if (!donorSnap.empty) {
              setDonor({ id: donorSnap.docs[0].id, ...donorSnap.docs[0].data() } as Donor);
            }
          } else if (profileData.role === 'hospital') {
            const hospitalsRef = collection(db, 'hospitals');
            const hospitalQuery = query(hospitalsRef, where('user_id', '==', user.uid));
            const hospitalSnap = await getDocs(hospitalQuery);
            if (!hospitalSnap.empty) {
              setHospital({ id: hospitalSnap.docs[0].id, ...hospitalSnap.docs[0].data() } as Hospital);
            }
          }
        }
      } catch (fErr) {
        console.warn('Firestore user fetch:', fErr);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }

  useEffect(() => {
    // Restore a local session created when Firebase Auth is unavailable
    const savedDemo = localStorage.getItem(DEMO_SESSION_KEY) || localStorage.getItem(LEGACY_DEMO_SESSION_KEY);
    if (savedDemo) {
      try {
        const parsed = JSON.parse(savedDemo);
        setSession(parsed.user);
        setProfile(parsed.profile);
        setDonor(parsed.donor || null);
        setHospital(parsed.hospital || null);
        setLoading(false);
        return;
      } catch {}
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setSession(user);
      if (user) {
        await loadUserData(user);
      } else {
        // Only clear if not in demo mode
        if (!localStorage.getItem(DEMO_SESSION_KEY) && !localStorage.getItem(LEGACY_DEMO_SESSION_KEY)) {
          setProfile(null);
          setDonor(null);
          setHospital(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  async function signUp(email: string, password: string, role: 'individual' | 'hospital', data: any) {
    try {
      let uid = `user_${Date.now()}`;
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        uid = userCredential.user.uid;
        setSession(userCredential.user);
      } catch (authErr: any) {
        console.warn('Firebase Auth signup:', authErr.message);
        setSession({ uid, email });
      }

      const newProfile: Profile = {
        id: uid,
        user_id: uid,
        email,
        role,
        created_at: new Date().toISOString(),
      };
      setProfile(newProfile);

      if (role === 'individual') {
        const newDonor: Donor = {
          id: `donor_${Date.now()}`,
          user_id: uid,
          email,
          ...data,
          created_at: new Date().toISOString(),
        };
        setDonor(newDonor);
        setHospital(null);

        // Save to Firestore
        try {
          await setDoc(doc(db, 'profiles', uid), newProfile);
          await setDoc(doc(db, 'donors', newDonor.id), newDonor);
        } catch (err) {
          console.warn('Firestore signup save fallback:', err);
        }

        localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify({
          user: { uid, email },
          profile: newProfile,
          donor: newDonor,
        }));
      } else {
        const newHospital: Hospital = {
          id: `hospital_${Date.now()}`,
          user_id: uid,
          email,
          ...data,
          created_at: new Date().toISOString(),
        };
        setHospital(newHospital);
        setDonor(null);

        saveCustomHospital(newHospital);

        // Save to Firestore
        try {
          await setDoc(doc(db, 'profiles', uid), newProfile);
          await setDoc(doc(db, 'hospitals', newHospital.id), newHospital);
        } catch (err) {
          console.warn('Firestore signup save fallback:', err);
        }

        localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify({
          user: { uid, email },
          profile: newProfile,
          hospital: newHospital,
        }));
      }

      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  async function signIn(email: string, password: string) {
    const cleanEmail = email.trim().toLowerCase();

    // Try Firebase Authentication first
    try {
      const res = await signInWithEmailAndPassword(auth, cleanEmail, password);
      setSession(res.user);
      await loadUserData(res.user);
      localStorage.removeItem(DEMO_SESSION_KEY);
      localStorage.removeItem(LEGACY_DEMO_SESSION_KEY);
      return { error: null };
    } catch (authErr: any) {
      console.warn('Firebase Auth sign in failed, checking registered mock data:', authErr.message);

      // Check registered / mock hospitals
      const allHospitals = await getHospitals();
      const matchedHospital = allHospitals.find(
        (h) => h.email.toLowerCase() === cleanEmail || h.id.toLowerCase() === cleanEmail
      );
      if (matchedHospital) {
        const demoUser = { uid: matchedHospital.id, email: matchedHospital.email };
        const demoProfile: Profile = {
          id: matchedHospital.id,
          user_id: matchedHospital.id,
          role: 'hospital',
          email: matchedHospital.email,
          created_at: matchedHospital.created_at,
        };
        setSession(demoUser);
        setProfile(demoProfile);
        setHospital(matchedHospital);
        setDonor(null);
        localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify({
          user: demoUser,
          profile: demoProfile,
          hospital: matchedHospital,
        }));
        return { error: null };
      }

      // Check registered / mock donors
      const allDonors = await getDonors();
      const matchedDonor = allDonors.find(
        (d) => d.email.toLowerCase() === cleanEmail || d.id.toLowerCase() === cleanEmail
      );
      if (matchedDonor) {
        const demoUser = { uid: matchedDonor.id, email: matchedDonor.email };
        const demoProfile: Profile = {
          id: matchedDonor.id,
          user_id: matchedDonor.id,
          role: 'individual',
          email: matchedDonor.email,
          created_at: matchedDonor.created_at,
        };
        setSession(demoUser);
        setProfile(demoProfile);
        setDonor(matchedDonor);
        setHospital(null);
        localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify({
          user: demoUser,
          profile: demoProfile,
          donor: matchedDonor,
        }));
        return { error: null };
      }

      return { error: authErr.message || 'Invalid email or password' };
    }
  }

  async function signOut() {
    try {
      localStorage.removeItem(DEMO_SESSION_KEY);
      localStorage.removeItem(LEGACY_DEMO_SESSION_KEY);
      await firebaseSignOut(auth).catch(() => {});
      setSession(null);
      setProfile(null);
      setDonor(null);
      setHospital(null);
    } catch (error: any) {
      console.error('Sign out error:', error);
    }
  }

  async function refreshProfile() {
    if (session) {
      await loadUserData(session);
    }
  }

  return (
    <AuthContext.Provider value={{ session, profile, donor, hospital, loading, signUp, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
