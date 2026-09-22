export const BLOOD_GROUPS = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

export const ORGAN_TYPES = ['Kidney', 'Liver', 'Heart', 'Cornea', 'Lungs', 'Bone Marrow'];

export const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai'];

export const DONOR_LEVELS = ['Bronze', 'Silver', 'Gold', 'Platinum Lifesaver'];

export const LEVEL_THRESHOLDS: Record<string, number> = {
  Bronze: 0,
  Silver: 50,
  Gold: 150,
  'Platinum Lifesaver': 300,
};

export const LEVEL_COLORS: Record<string, string> = {
  Bronze: '#b87333',
  Silver: '#94a3b8',
  Gold: '#f59e0b',
  'Platinum Lifesaver': '#0891b2',
};

export const BADGES = [
  { id: 'first_pledge', name: 'First Pledge', description: 'Pledged your first organ', icon: 'Heart' },
  { id: 'blood_hero_3', name: 'Blood Hero x3', description: 'Completed 3 blood donations', icon: 'Droplet' },
  { id: 'universal_donor', name: 'Universal Donor', description: 'O- blood group donor', icon: 'Globe' },
  { id: 'lifesaver', name: 'Lifesaver', description: 'Matched for an emergency request', icon: 'Shield' },
  { id: 'gold_tier', name: 'Gold Tier', description: 'Reached Gold donor level', icon: 'Award' },
  { id: 'platinum', name: 'Platinum Lifesaver', description: 'Reached Platinum level', icon: 'Crown' },
  { id: 'city_champion', name: 'City Champion', description: 'Top 3 donor in your city', icon: 'Trophy' },
  { id: 'committed', name: 'Committed', description: 'Pledged 3 or more organs', icon: 'Star' },
];

export const URGENCY_LEVELS = ['Critical', 'High', 'Moderate'] as const;

// Blood group compatibility: which donor groups can donate to which recipient groups
export const BLOOD_COMPATIBILITY: Record<string, string[]> = {
  'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
  'O+': ['O+', 'A+', 'B+', 'AB+'],
  'A-': ['A-', 'A+', 'AB-', 'AB+'],
  'A+': ['A+', 'AB+'],
  'B-': ['B-', 'B+', 'AB-', 'AB+'],
  'B+': ['B+', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB+'],
};

// City coordinates for distance calculations
export const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  Mumbai: { lat: 19.0760, lng: 72.8777 },
  Delhi: { lat: 28.6139, lng: 77.2090 },
  Bangalore: { lat: 12.9716, lng: 77.5946 },
  Hyderabad: { lat: 17.3850, lng: 78.4867 },
  Chennai: { lat: 13.0827, lng: 80.2707 },
};
