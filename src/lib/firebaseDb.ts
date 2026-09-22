import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import { mockDonors, mockHospitals } from './mockData';
import type { Donor, Hospital, Request, Allocation, Donation, Notification, Transfer, Profile } from '@/types';

// In-memory fallback storage so the application runs immediately without errors even when offline or before initial seed
let memoryDonors: Donor[] = [...mockDonors];
let memoryHospitals: Hospital[] = [...mockHospitals];
let memoryRequests: Request[] = [
  {
    id: 'req_1',
    hospital_id: 'hospital_1',
    request_type: 'blood',
    specific_type: 'O-',
    urgency: 'Critical',
    patient_age: 42,
    patient_city: 'Mumbai',
    required_by: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
    status: 'Pending',
    matched_donor_id: null,
    match_score: null,
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    delivery_time: null,
  },
  {
    id: 'req_2',
    hospital_id: 'hospital_1',
    request_type: 'organ',
    specific_type: 'Kidney',
    urgency: 'High',
    patient_age: 55,
    patient_city: 'Mumbai',
    required_by: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    status: 'Completed',
    matched_donor_id: 'donor_1',
    match_score: 94.5,
    created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    delivery_time: new Date(Date.now() - 2 * 24 * 3600 * 1000 + 4.5 * 3600 * 1000).toISOString(),
  },
  {
    id: 'req_3',
    hospital_id: 'hospital_1',
    request_type: 'organ',
    specific_type: 'Liver',
    urgency: 'Critical',
    patient_age: 38,
    patient_city: 'Mumbai',
    required_by: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    status: 'Completed',
    matched_donor_id: 'donor_2',
    match_score: 88.0,
    created_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
    delivery_time: new Date(Date.now() - 10 * 24 * 3600 * 1000 + 6 * 3600 * 1000).toISOString(),
  },
];

let memoryAllocations: Allocation[] = [
  {
    id: 'alloc_1',
    request_id: 'req_2',
    donor_id: 'donor_1',
    score: 94.5,
    verification_hash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
  },
];

let memoryDonations: Donation[] = [
  {
    id: 'don_1',
    donor_id: 'donor_1',
    donation_type: 'blood',
    donation_date: '2024-02-10',
    points_earned: 30,
    created_at: '2024-02-10T10:00:00.000Z',
  },
  {
    id: 'don_2',
    donor_id: 'donor_1',
    donation_type: 'organ_pledge',
    donation_date: '2024-01-15',
    points_earned: 60,
    created_at: '2024-01-15T09:00:00.000Z',
  },
  {
    id: 'don_3',
    donor_id: 'donor_2',
    donation_type: 'blood',
    donation_date: new Date().toISOString().split('T')[0],
    points_earned: 30,
    created_at: new Date().toISOString(),
  },
  {
    id: 'don_4',
    donor_id: 'donor_3',
    donation_type: 'blood',
    donation_date: new Date(Date.now() - 40 * 24 * 3600 * 1000).toISOString().split('T')[0],
    points_earned: 30,
    created_at: new Date(Date.now() - 40 * 24 * 3600 * 1000).toISOString(),
  },
];

let memoryNotifications: Notification[] = [
  {
    id: 'notif_1',
    donor_id: 'donor_1',
    message: '🚨 Emergency match alert from Apollo Hospital Mumbai for O+ blood.',
    type: 'match',
    read: false,
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 'notif_2',
    donor_id: 'donor_1',
    message: '🏆 You unlocked the "Silver Tier" badge! Keep saving lives.',
    type: 'badge',
    read: true,
    created_at: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'notif_3',
    donor_id: 'donor_1',
    message: 'Apollo Hospital Mumbai reviewed your Kidney, Liver and Cornea pledge this month.',
    type: 'hospital_interest',
    read: false,
    created_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
  },
];

let memoryTransfers: Transfer[] = [
  {
    id: 'trans_1',
    from_hospital_id: 'hospital_1',
    to_hospital_id: 'hospital_2',
    blood_type: 'O-',
    organ_type: null,
    status: 'Approved',
    created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    delivery_time: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
  },
  {
    id: 'trans_2',
    from_hospital_id: 'hospital_2',
    to_hospital_id: 'hospital_1',
    blood_type: null,
    organ_type: 'Kidney',
    status: 'Approved',
    created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    delivery_time: new Date(Date.now() - 5 * 24 * 3600 * 1000 + 3 * 3600 * 1000).toISOString(),
  },
  {
    id: 'trans_3',
    from_hospital_id: 'hospital_3',
    to_hospital_id: 'hospital_1',
    blood_type: 'A+',
    organ_type: null,
    status: 'Pending',
    created_at: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    delivery_time: null,
  },
];

/* ----------------------------------------------------
   DONORS
---------------------------------------------------- */
export async function getDonors(city?: string): Promise<Donor[]> {
  try {
    const donorsRef = collection(db, 'donors');
    const q = city ? query(donorsRef, where('city', '==', city)) : donorsRef;
    const snap = await getDocs(q);
    if (!snap.empty) {
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Donor));
      // sync to memory
      docs.forEach((d) => {
        const idx = memoryDonors.findIndex((m) => m.id === d.id);
        if (idx >= 0) memoryDonors[idx] = d;
        else memoryDonors.push(d);
      });
      return docs;
    }
  } catch (err) {
    console.warn('Firestore getDonors fallback to memory:', err);
  }
  return city ? memoryDonors.filter((d) => d.city.toLowerCase() === city.toLowerCase()) : [...memoryDonors];
}

export async function getDonorById(donorId: string): Promise<Donor | null> {
  try {
    const donorRef = doc(db, 'donors', donorId);
    const snap = await getDoc(donorRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as Donor;
    }
    const q = query(collection(db, 'donors'), where('user_id', '==', donorId));
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      return { id: querySnap.docs[0].id, ...querySnap.docs[0].data() } as Donor;
    }
  } catch (err) {
    console.warn('Firestore getDonorById fallback:', err);
  }
  return memoryDonors.find((d) => d.id === donorId || d.user_id === donorId) || null;
}

export async function updateDonor(donorId: string, updates: Partial<Donor>): Promise<void> {
  try {
    const donorRef = doc(db, 'donors', donorId);
    await updateDoc(donorRef, updates);
  } catch (err) {
    console.warn('Firestore updateDonor fallback:', err);
  }
  const idx = memoryDonors.findIndex((d) => d.id === donorId || d.user_id === donorId);
  if (idx >= 0) {
    memoryDonors[idx] = { ...memoryDonors[idx], ...updates };
  }
}

/* ----------------------------------------------------
   HOSPITALS
---------------------------------------------------- */
export async function getHospitals(): Promise<Hospital[]> {
  try {
    const snap = await getDocs(collection(db, 'hospitals'));
    if (!snap.empty) {
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Hospital));
      docs.forEach((h) => {
        const idx = memoryHospitals.findIndex((m) => m.id === h.id);
        if (idx >= 0) memoryHospitals[idx] = h;
        else memoryHospitals.push(h);
      });
      return docs;
    }
  } catch (err) {
    console.warn('Firestore getHospitals fallback:', err);
  }
  return [...memoryHospitals];
}

export async function getHospitalById(hospitalId: string): Promise<Hospital | null> {
  try {
    const docRef = doc(db, 'hospitals', hospitalId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as Hospital;
    }
    const q = query(collection(db, 'hospitals'), where('user_id', '==', hospitalId));
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      return { id: querySnap.docs[0].id, ...querySnap.docs[0].data() } as Hospital;
    }
  } catch (err) {
    console.warn('Firestore getHospitalById fallback:', err);
  }
  return memoryHospitals.find((h) => h.id === hospitalId || h.user_id === hospitalId) || null;
}

/* ----------------------------------------------------
   REQUESTS
---------------------------------------------------- */
export async function getRequests(hospitalId?: string): Promise<Request[]> {
  try {
    const reqRef = collection(db, 'requests');
    const q = hospitalId ? query(reqRef, where('hospital_id', '==', hospitalId)) : reqRef;
    const snap = await getDocs(q);
    if (!snap.empty) {
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Request));
      return docs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  } catch (err) {
    console.warn('Firestore getRequests fallback:', err);
  }
  const list = hospitalId ? memoryRequests.filter((r) => r.hospital_id === hospitalId) : [...memoryRequests];
  return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function getRequestById(requestId: string): Promise<Request | null> {
  try {
    const docRef = doc(db, 'requests', requestId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as Request;
    }
  } catch (err) {
    console.warn('Firestore getRequestById fallback:', err);
  }
  return memoryRequests.find((r) => r.id === requestId) || null;
}

export async function createRequest(requestData: Omit<Request, 'id' | 'created_at'>): Promise<Request> {
  const newReq: Request = {
    ...requestData,
    id: `req_${Date.now()}`,
    created_at: new Date().toISOString(),
    delivery_time: requestData.delivery_time ?? null,
  };

  try {
    const docRef = await addDoc(collection(db, 'requests'), newReq);
    newReq.id = docRef.id;
  } catch (err) {
    console.warn('Firestore createRequest fallback to memory:', err);
  }

  memoryRequests.unshift(newReq);
  return newReq;
}

export async function updateRequest(requestId: string, updates: Partial<Request>): Promise<void> {
  try {
    const docRef = doc(db, 'requests', requestId);
    await updateDoc(docRef, updates);
  } catch (err) {
    console.warn('Firestore updateRequest fallback:', err);
  }
  const idx = memoryRequests.findIndex((r) => r.id === requestId);
  if (idx >= 0) {
    memoryRequests[idx] = { ...memoryRequests[idx], ...updates };
  }
}

export function subscribeToRequests(callback: (requests: Request[]) => void, hospitalId?: string): Unsubscribe {
  try {
    const reqRef = collection(db, 'requests');
    const q = hospitalId ? query(reqRef, where('hospital_id', '==', hospitalId)) : reqRef;
    return onSnapshot(
      q,
      (snap) => {
        if (!snap.empty) {
          const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Request));
          callback(docs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
        } else {
          callback(hospitalId ? memoryRequests.filter((r) => r.hospital_id === hospitalId) : [...memoryRequests]);
        }
      },
      (err) => {
        console.warn('Firestore onSnapshot error, using memory:', err);
        callback(hospitalId ? memoryRequests.filter((r) => r.hospital_id === hospitalId) : [...memoryRequests]);
      }
    );
  } catch {
    callback(hospitalId ? memoryRequests.filter((r) => r.hospital_id === hospitalId) : [...memoryRequests]);
    return () => {};
  }
}

/* ----------------------------------------------------
   ALLOCATIONS & TRANSPARENCY LOG
---------------------------------------------------- */
export async function getAllocations(): Promise<Allocation[]> {
  try {
    const snap = await getDocs(collection(db, 'allocations'));
    if (!snap.empty) {
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Allocation));
      return docs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  } catch (err) {
    console.warn('Firestore getAllocations fallback:', err);
  }
  return [...memoryAllocations].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function createAllocation(allocData: Omit<Allocation, 'id'>): Promise<Allocation> {
  const newAlloc: Allocation = {
    ...allocData,
    id: `alloc_${Date.now()}`,
  };

  try {
    const docRef = await addDoc(collection(db, 'allocations'), newAlloc);
    newAlloc.id = docRef.id;
  } catch (err) {
    console.warn('Firestore createAllocation fallback:', err);
  }

  memoryAllocations.unshift(newAlloc);
  return newAlloc;
}

/* ----------------------------------------------------
   DONATIONS
---------------------------------------------------- */
export async function getDonations(donorId?: string): Promise<Donation[]> {
  try {
    const donRef = collection(db, 'donations');
    const q = donorId ? query(donRef, where('donor_id', '==', donorId)) : donRef;
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Donation));
    }
  } catch (err) {
    console.warn('Firestore getDonations fallback:', err);
  }
  return donorId ? memoryDonations.filter((d) => d.donor_id === donorId) : [...memoryDonations];
}

export async function createDonation(donData: Omit<Donation, 'id' | 'created_at'>): Promise<Donation> {
  const newDon: Donation = {
    ...donData,
    id: `don_${Date.now()}`,
    created_at: new Date().toISOString(),
  };

  try {
    const docRef = await addDoc(collection(db, 'donations'), newDon);
    newDon.id = docRef.id;
  } catch (err) {
    console.warn('Firestore createDonation fallback:', err);
  }

  memoryDonations.unshift(newDon);
  return newDon;
}

/* ----------------------------------------------------
   NOTIFICATIONS
---------------------------------------------------- */
export async function getNotifications(donorId: string): Promise<Notification[]> {
  try {
    const notifRef = collection(db, 'notifications');
    const q = query(notifRef, where('donor_id', '==', donorId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs
        .map((d) => ({ id: d.id, ...d.data() } as Notification))
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  } catch (err) {
    console.warn('Firestore getNotifications fallback:', err);
  }
  return memoryNotifications
    .filter((n) => n.donor_id === donorId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function createNotification(notifData: Omit<Notification, 'id' | 'created_at'>): Promise<Notification> {
  const newNotif: Notification = {
    ...notifData,
    id: `notif_${Date.now()}`,
    created_at: new Date().toISOString(),
  };

  try {
    const docRef = await addDoc(collection(db, 'notifications'), newNotif);
    newNotif.id = docRef.id;
  } catch (err) {
    console.warn('Firestore createNotification fallback:', err);
  }

  memoryNotifications.unshift(newNotif);
  return newNotif;
}

/* ----------------------------------------------------
   TRANSFERS
---------------------------------------------------- */
export async function getTransfers(hospitalId?: string): Promise<Transfer[]> {
  try {
    const transRef = collection(db, 'transfers');
    const q = hospitalId ? query(transRef, where('from_hospital_id', '==', hospitalId)) : transRef;
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs
        .map((d) => ({ id: d.id, ...d.data() } as Transfer))
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  } catch (err) {
    console.warn('Firestore getTransfers fallback:', err);
  }
  const list = hospitalId
    ? memoryTransfers.filter((t) => t.from_hospital_id === hospitalId || t.to_hospital_id === hospitalId)
    : [...memoryTransfers];
  return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function createTransfer(transferData: Omit<Transfer, 'id' | 'created_at'>): Promise<Transfer> {
  const newTrans: Transfer = {
    ...transferData,
    id: `trans_${Date.now()}`,
    created_at: new Date().toISOString(),
    delivery_time: transferData.delivery_time ?? null,
  };

  try {
    const docRef = await addDoc(collection(db, 'transfers'), newTrans);
    newTrans.id = docRef.id;
  } catch (err) {
    console.warn('Firestore createTransfer fallback:', err);
  }

  memoryTransfers.unshift(newTrans);
  return newTrans;
}
