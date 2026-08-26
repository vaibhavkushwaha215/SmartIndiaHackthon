import { Worker, ServiceRequest, Booking } from '../types';

export interface RankedRequest {
  request: ServiceRequest;
  tier: 1 | 2 | 3 | 4; // 1: Emergency, 2: Normal Eligible, 3: Conflicting Slot, 4: Ignored
  hasConflict: boolean;
  conflictReason?: string;
  isIgnored: boolean;
  canAccept: boolean;
}

export const matchingService = {
  /**
   * Check if worker is eligible to view/pick up the service request based on trade, specific service, pincode and gender.
   */
  isWorkerEligible(worker: Worker, request: ServiceRequest): boolean {
    // 1. Availability check
    if (worker.isAvailable === false) return false;

    // 2. Category match
    if (worker.category && worker.category !== 'ALL' && worker.category !== request.serviceCategoryId) {
      return false;
    }

    // 3. Specific service capabilities match
    if (worker.services && worker.services.length > 0) {
      if (!worker.services.includes(request.serviceId)) {
        return false;
      }
    }

    // 4. Pincode / Area match
    if (worker.pincodes && worker.pincodes.length > 0 && request.pincode) {
      const cleanReqPincode = request.pincode.trim();
      const hasMatchingPincode = worker.pincodes.some((p) => p.trim() === cleanReqPincode);
      if (!hasMatchingPincode) {
        // Fallback: If area text has overlap
        if (!worker.area || !request.locality || !worker.area.toLowerCase().includes(request.locality.toLowerCase())) {
          return false;
        }
      }
    }

    // 5. Gender preference filter
    if (request.genderPreference && request.genderPreference !== 'no_preference') {
      if (!worker.gender || worker.gender !== request.genderPreference) {
        return false;
      }
    }

    // 6. Hard Rejection check: Worker previously explicitly rejected this request
    if (request.rejectedByWorkerIds && request.rejectedByWorkerIds.includes(worker.id)) {
      return false;
    }

    return true;
  },

  /**
   * Check if worker has an active booking during the same date & time slot.
   */
  hasTimeConflict(workerId: string, request: ServiceRequest, activeBookings: Booking[], activeRequests: ServiceRequest[]): boolean {
    // Check against active assigned requests
    const overlappingRequest = activeRequests.find(
      (r) =>
        r.id !== request.id &&
        r.assignedWorkerId === workerId &&
        r.date === request.date &&
        (r.timeSlotDisplay === request.timeSlotDisplay || r.slotStart === request.slotStart) &&
        !['COMPLETED', 'CANCELLED', 'EXPIRED', 'REFUNDED'].includes(r.requestStatus)
    );
    if (overlappingRequest) return true;

    // Check against legacy active bookings
    const overlappingBooking = activeBookings.find(
      (b) =>
        b.worker_id === workerId &&
        b.date === request.date &&
        b.time_slot === request.timeSlotDisplay &&
        !['completed', 'cancelled'].includes(b.status)
    );
    if (overlappingBooking) return true;

    return false;
  },

  /**
   * Filter and Rank requests specifically for the target worker.
   * Priority Rules:
   * 1. Emergency requests (TOP priority)
   * 2. Normal eligible requests (Sorted by date & creation)
   * 3. Existing-booking conflicts (2nd lowest, Accept disabled)
   * 4. Ignored requests (Lowest)
   */
  getRankedRequestsForWorker(
    worker: Worker,
    requests: ServiceRequest[],
    activeBookings: Booking[] = []
  ): RankedRequest[] {
    const unassignedRequests = requests.filter(
      (r) => r.requestStatus === 'OPEN' || r.requestStatus === 'MATCHING'
    );

    const ranked: RankedRequest[] = [];

    for (const req of unassignedRequests) {
      if (!this.isWorkerEligible(worker, req)) {
        continue;
      }

      const isIgnored = Boolean(req.ignoredByWorkerIds?.includes(worker.id));
      const hasConflict = this.hasTimeConflict(worker.id, req, activeBookings, requests);

      let tier: 1 | 2 | 3 | 4 = 2; // Default Normal
      let conflictReason: string | undefined;

      if (isIgnored) {
        tier = 4; // Lowest
      } else if (hasConflict) {
        tier = 3; // Conflicting slot
        conflictReason = "You already have a booking during this time and cannot apply.";
      } else if (req.priority === 'emergency') {
        tier = 1; // Top priority
      } else {
        tier = 2;
      }

      ranked.push({
        request: req,
        tier,
        hasConflict,
        conflictReason,
        isIgnored,
        canAccept: !hasConflict && !isIgnored && (req.requestStatus === 'OPEN' || req.requestStatus === 'MATCHING'),
      });
    }

    // Sort ranked requests by tier (1 to 4), then by urgency (date & createdAt)
    ranked.sort((a, b) => {
      if (a.tier !== b.tier) {
        return a.tier - b.tier;
      }
      // Within same tier: Emergency / earliest date first
      if (a.request.date !== b.request.date) {
        return a.request.date.localeCompare(b.request.date);
      }
      return new Date(b.request.createdAt).getTime() - new Date(a.request.createdAt).getTime();
    });

    return ranked;
  },
};
