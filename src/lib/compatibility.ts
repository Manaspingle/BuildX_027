import { BLOOD_COMPATIBILITY, LEVEL_THRESHOLDS } from './constants';
import type { Donor, ScoredDonor } from '@/types';

export function isBloodCompatible(donorBlood: string, recipientBlood: string): boolean {
  const compatible = BLOOD_COMPATIBILITY[donorBlood] || [];
  return compatible.includes(recipientBlood);
}

export function isOrganCompatible(donorBlood: string, recipientBlood: string): boolean {
  // For organs, exact blood group match or O- donor (universal) is preferred
  // AB+ recipient can receive from anyone
  if (recipientBlood === 'AB+') return true;
  if (donorBlood === 'O-') return true;
  return donorBlood === recipientBlood;
}

export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function getReliabilityScore(donor: Donor): number {
  const level = donor.donor_level;
  const threshold = LEVEL_THRESHOLDS[level] || 0;
  const nextThreshold =
    level === 'Bronze'
      ? LEVEL_THRESHOLDS['Silver']
      : level === 'Silver'
        ? LEVEL_THRESHOLDS['Gold']
        : level === 'Gold'
          ? LEVEL_THRESHOLDS['Platinum Lifesaver']
          : LEVEL_THRESHOLDS['Platinum Lifesaver'];
  const range = nextThreshold - threshold;
  const progress = range > 0 ? (donor.donor_points - threshold) / range : 1;
  const baseScore =
    level === 'Bronze'
      ? 40
      : level === 'Silver'
        ? 60
        : level === 'Gold'
          ? 80
          : 100;
  return Math.min(100, baseScore + progress * 15);
}

export function scoreDonors(
  donors: Donor[],
  requestType: 'blood' | 'organ',
  specificType: string,
  hospitalLat: number,
  hospitalLng: number
): ScoredDonor[] {
  const scored = donors
    .filter((d) => d.available)
    .filter((d) => {
      if (requestType === 'blood') {
        return isBloodCompatible(d.blood_group, specificType);
      }
      return d.organs.includes(specificType);
    })
    .map((d) => {
      const compatibility =
        requestType === 'blood'
          ? isBloodCompatible(d.blood_group, specificType)
            ? 100
            : 0
          : isOrganCompatible(d.blood_group, specificType)
            ? 100
            : 50;

      const distance = haversineDistance(d.lat, d.lng, hospitalLat, hospitalLng);
      const maxDist = 50;
      const proximity = Math.max(0, 100 - (distance / maxDist) * 100);

      const reliability = getReliabilityScore(d);

      const finalScore =
        0.5 * compatibility + 0.3 * proximity + 0.2 * reliability;

      return {
        ...d,
        compatibilityScore: Math.round(compatibility),
        proximityScore: Math.round(proximity),
        reliabilityScore: Math.round(reliability),
        finalScore: Math.round(finalScore * 10) / 10,
        distance: Math.round(distance * 10) / 10,
        rank: 0,
      };
    })
    .sort((a, b) => b.finalScore - a.finalScore)
    .map((d, i) => ({ ...d, rank: i + 1 }));

  return scored;
}

export function getDonorLevel(points: number): string {
  if (points >= LEVEL_THRESHOLDS['Platinum Lifesaver']) return 'Platinum Lifesaver';
  if (points >= LEVEL_THRESHOLDS['Gold']) return 'Gold';
  if (points >= LEVEL_THRESHOLDS['Silver']) return 'Silver';
  return 'Bronze';
}

export function getProgressToNextLevel(points: number): { current: string; next: string | null; progress: number } {
  const current = getDonorLevel(points);
  const levels = ['Bronze', 'Silver', 'Gold', 'Platinum Lifesaver'];
  const currentIdx = levels.indexOf(current);
  const next = currentIdx < levels.length - 1 ? levels[currentIdx + 1] : null;

  if (!next) return { current, next: null, progress: 100 };

  const currentThreshold = LEVEL_THRESHOLDS[current];
  const nextThreshold = LEVEL_THRESHOLDS[next];
  const progress = ((points - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
  return { current, next, progress: Math.min(100, Math.max(0, progress)) };
}
