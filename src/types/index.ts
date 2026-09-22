export type UserRole = 'individual' | 'hospital';

export interface Profile {
  id: string;
  user_id: string;
  role: UserRole;
  email: string;
  created_at: string;
}

export interface Donor {
  id: string;
  user_id: string | null;
  email: string;
  full_name: string;
  age: number;
  blood_group: string;
  city: string;
  phone: string;
  organs: string[];
  emergency_contact: string;
  consent: boolean;
  available: boolean;
  donor_level: string;
  donor_points: number;
  blood_donations: number;
  medical_allergies: string;
  medical_conditions: string;
  lat: number;
  lng: number;
  created_at: string;
}

export interface Hospital {
  id: string;
  user_id: string | null;
  email: string;
  hospital_name: string;
  registration_id: string;
  city: string;
  address: string;
  contact_person: string;
  phone: string;
  verified: boolean;
  lat: number;
  lng: number;
  inventory: Record<string, number>;
  created_at: string;
}

export interface Request {
  id: string;
  hospital_id: string;
  request_type: 'blood' | 'organ';
  specific_type: string;
  urgency: 'Critical' | 'High' | 'Moderate';
  patient_age: number;
  patient_city: string;
  required_by: string;
  status: 'Pending' | 'Matched' | 'Dispatched' | 'Completed' | 'Cancelled';
  matched_donor_id: string | null;
  match_score: number | null;
  created_at: string;
  delivery_time: string | null;
}

export interface Allocation {
  id: string;
  request_id: string;
  donor_id: string;
  score: number;
  verification_hash: string;
  created_at: string;
}

export interface Donation {
  id: string;
  donor_id: string;
  donation_type: 'blood' | 'organ_pledge';
  donation_date: string;
  points_earned: number;
  created_at: string;
}

export interface Notification {
  id: string;
  donor_id: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}

export interface Transfer {
  id: string;
  from_hospital_id: string;
  to_hospital_id: string;
  organ_type: string | null;
  blood_type: string | null;
  status: 'Pending' | 'Approved' | 'Rejected';
  created_at: string;
  delivery_time: string | null;
}

export interface ScoredDonor extends Donor {
  compatibilityScore: number;
  proximityScore: number;
  reliabilityScore: number;
  finalScore: number;
  distance: number;
  rank: number;
}
