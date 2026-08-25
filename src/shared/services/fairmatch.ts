import { Worker } from '../types';

export interface FairMatchFactorBreakdown {
  skillScore: number;
  verificationScore: number;
  availabilityScore: number;
  fairnessOpportunityScore: number;
  proximityAndRatingScore: number;
  totalScore: number;
  reason: string;
}

export interface FairMatchResult {
  worker: Worker;
  score: number;
  factors: FairMatchFactorBreakdown;
  cooperativeBadge: string;
}

/**
 * SahyogSeva - FairMatch™ Cooperative Dispatch Engine
 * 
 * Prevents popularity bias and monopolies by combining skill verification,
 * live availability, location, and an opportunity rotation fairness factor.
 */
export function calculateFairMatchScore(
  worker: Worker,
  requestedCategory?: string,
  _customerArea?: string
): FairMatchFactorBreakdown {
  // 1. Availability check (Mandatory gate)
  const isAvailable = worker.isAvailable !== false;
  const availabilityScore = isAvailable ? 15 : 0;

  // 2. Skill Relevance (Max: 35)
  let skillScore = 20;
  if (requestedCategory && worker.category) {
    if (worker.category.toUpperCase() === requestedCategory.toUpperCase()) {
      skillScore = 35;
    } else if (worker.skill.toLowerCase().includes(requestedCategory.toLowerCase())) {
      skillScore = 30;
    }
  }

  // 3. Cooperative Verification (Max: 20)
  const isVerified = worker.verified || worker.verificationStatus === 'Verified';
  const verificationScore = isVerified ? 20 : 5;

  // 4. Opportunity Rotation / Fairness Factor (Max: 20)
  // Workers with fewer recent jobs receive higher fairness boost
  const recentJobs = worker.recentJobCount || Math.min(worker.completed_jobs_count || 0, 30);
  // Invert job load into a 0-20 boost: less loaded = higher opportunity score
  const fairnessOpportunityScore = Math.max(5, Math.round(20 - (recentJobs / 35) * 15));

  // 5. Proximity & Rating Quality (Max: 10)
  const ratingNorm = Math.min(5, Math.max(1, worker.rating_avg || 4.5));
  const proximityAndRatingScore = Math.round((ratingNorm / 5) * 10);

  const totalScore = isAvailable
    ? skillScore + verificationScore + availabilityScore + fairnessOpportunityScore + proximityAndRatingScore
    : 0;

  const reason = isAvailable
    ? `Skill: ${skillScore}pt | Verification: ${verificationScore}pt | Fairness Boost: ${fairnessOpportunityScore}pt`
    : 'Worker is currently marked as Unavailable';

  return {
    skillScore,
    verificationScore,
    availabilityScore,
    fairnessOpportunityScore,
    proximityAndRatingScore,
    totalScore,
    reason,
  };
}

/**
 * Deterministically ranks workers for a dispatch inquiry using FairMatch
 */
export function getFairMatchedWorkers(
  workers: Worker[],
  requestedCategory?: string,
  customerArea?: string,
  limit: number = 6
): FairMatchResult[] {
  const scored = workers
    .filter((w) => w.isAvailable !== false && w.verificationStatus !== 'Suspended')
    .map((w) => {
      const factors = calculateFairMatchScore(w, requestedCategory, customerArea);
      return {
        worker: w,
        score: factors.totalScore,
        factors,
        cooperativeBadge: 'Cooperative FairMatch™ Certified',
      };
    })
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit);
}
