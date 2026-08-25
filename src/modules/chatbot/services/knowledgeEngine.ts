import { ChatbotContext } from '../types';

export const SUGGESTED_PROMPTS = [
  { id: 'p1', label: 'How do I book a service?', query: 'How do I book a service on SahyogSeva?' },
  { id: 'p2', label: 'How are workers verified?', query: 'How are workers background and police verified?' },
  { id: 'p3', label: 'How do I apply as a worker?', query: 'How do I apply as a cooperative artisan/worker?' },
  { id: 'p4', label: 'Where can I see my bookings?', query: 'Where can I view my scheduled bookings and status?' },
];

/**
 * SahyogSeva Domain Knowledge Engine
 * Provides instant, zero-latency cooperative assistance with guardrails.
 */
export function queryKnowledgeEngine(query: string, context?: ChatbotContext): string {
  const q = query.toLowerCase().trim();

  // 1. Guardrail: Checking if user assumes the chatbot can perform state mutation
  if (
    (q.includes('book a') || q.includes('book me') || q.includes('schedule a') || q.includes('hire a')) &&
    (q.includes('plumber') || q.includes('electrician') || q.includes('carpenter') || q.includes('cleaner'))
  ) {
    return (
      `To book a service, please browse our verified catalog in the **"All Services"** tab. ` +
      `You can select your preferred trade artisan (Electrician, Plumber, Appliance Repair, Carpentry, Painting, Cleaning), ` +
      `choose your convenient date and time slot, and enter your address.\n\n` +
      `⚠️ *Note: I am an informational assistant and cannot directly confirm orders on your behalf. Please tap the service card to finalize your booking.*`
    );
  }

  // 2. Booking Process
  if (q.includes('how do i book') || q.includes('how to book') || q.includes('booking process') || q.includes('book a service')) {
    return (
      `**Booking a service on SahyogSeva takes just 4 easy steps:**\n\n` +
      `1. **Browse Services**: Navigate to the **"All Services"** tab to view verified local trade professionals.\n` +
      `2. **Choose Technician**: Filter by skill, rating, or cooperative society, and click **"Book Service"**.\n` +
      `3. **Select Slot & Address**: Pick your preferred appointment date and time slot, and confirm your service location.\n` +
      `4. **Zero Advance & Escrow**: Pay **₹0 in advance**. When the technician completes the work, pay seamlessly via Cash or UPI into protected cooperative escrow.`
    );
  }

  // 3. Worker Verification & Safety
  if (q.includes('verify') || q.includes('verification') || q.includes('safe') || q.includes('police') || q.includes('background')) {
    return (
      `**100% Trust & Verification Guarantee:**\n\n` +
      `• **Police Background Clearance**: Every registered artisan undergoes strict law enforcement background vetting.\n` +
      `• **Government Identity Validation**: Aadhaar, PAN, and address credentials are systematically verified.\n` +
      `• **Trade Skill Audit**: Trade capabilities and certifications are validated by registered state cooperative federations.\n` +
      `• Look for the **"100% Police Verified"** badge next to verified professionals on their profile card.`
    );
  }

  // 4. Worker Onboarding & Application
  if (q.includes('apply') || q.includes('join as worker') || q.includes('become a worker') || q.includes('onboard') || q.includes('artisan application')) {
    return (
      `**Join the SahyogSeva Worker Cooperative:**\n\n` +
      `1. Visit the **"Apply as Cooperative Artisan"** page (or click Apply in the navigation menu).\n` +
      `2. Fill in your **Personal Details**, **Trade Skills & Experience**, and upload your **Identity Verification Document** (Aadhaar / Voter ID).\n` +
      `3. Select your local **Cooperative Society** affiliation.\n` +
      `4. Our compliance desk will review your intake within 24 hours. Once approved, you gain full access to the Worker Dashboard and start receiving dispatch requests.`
    );
  }

  // 5. Viewing Bookings & Tracking Status
  if (q.includes('where') && (q.includes('booking') || q.includes('my booking') || q.includes('status') || q.includes('track'))) {
    const roleInfo = context?.currentRole === 'Worker'
      ? `As a worker, you can manage assigned service dispatches in the **"Worker Dashboard"** or **"Jobs"** center.`
      : `Click on **"My Bookings"** in the top navigation bar (or the Bookings tab in the bottom bar on mobile). Here you can track scheduled time slots, assigned artisan details, and receipt history.`;

    return roleInfo;
  }

  // 6. Zero Commission & Cooperative Model
  if (q.includes('commission') || q.includes('fee') || q.includes('pricing') || q.includes('cooperative') || q.includes('how much')) {
    return (
      `**SahyogSeva Cooperative Charter (0% Brokerage):**\n\n` +
      `• **0% Platform Fees**: Unlike corporate aggregators that deduct 20–30%, SahyogSeva charges **₹0 platform fee** from workers.\n` +
      `• **100% Take-Home**: Artisans retain 100% of their listed hourly rates (e.g. ₹299, ₹349, ₹399).\n` +
      `• **Transparent Escrow**: Funds are held safely until the homeowner is satisfied with the doorstep work.`
    );
  }

  // 7. Emergency SOS Dispatch
  if (q.includes('emergency') || q.includes('urgent') || q.includes('30 min') || q.includes('sos') || q.includes('helpline')) {
    return (
      `**Emergency 24x7 Assistance:**\n\n` +
      `• For urgent short circuits, water line bursts, or critical repairs, use the **Emergency 30-Min SOS** filter in the services catalog.\n` +
      `• You can also call our toll-free cooperative hotline: **1800-SAHYOG** (1800-724-964).`
    );
  }

  // 8. Role-specific guidance
  if (context?.currentRole === 'Worker' && (q.includes('dashboard') || q.includes('earnings') || q.includes('availability'))) {
    return (
      `**Worker Hub Guidance:**\n\n` +
      `• **Availability Switch**: Toggle your status between *Available* and *Unavailable* on your dashboard to pause or resume dispatch requests.\n` +
      `• **Job Operations**: Review pending requests, accept appointments, and mark services in progress.\n` +
      `• **Earnings Ledger**: View settled UPI balances and escrow payouts with complete 0% fee breakdown.`
    );
  }

  if (context?.currentRole === 'Admin' && (q.includes('admin') || q.includes('analytics') || q.includes('fairmatch') || q.includes('intake'))) {
    return (
      `**Cooperative Admin Guidance:**\n\n` +
      `• **Worker Management**: Audit active members and approve/reject pending artisan intake applications.\n` +
      `• **FairMatch™ Analytics**: Inspect the Worker Opportunity Distribution chart ensuring equitable work rotation across all trade members.\n` +
      `• **Platform Governance**: Monitor system-wide compliance, demand forecasts, and escrow volume.`
    );
  }

  // 9. General helpful fallback
  return (
    `Hello! I am the **SahyogSeva Assistant**. I can help you with:\n\n` +
    `• Finding & booking verified electricians, plumbers, carpenters, cleaning, and appliance technicians.\n` +
    `• Explaining our 100% police background check and verification protocol.\n` +
    `• Cooperative artisan intake applications & 0% platform commission policy.\n` +
    `• Tracking active bookings and payment escrow protection.\n\n` +
    `How may I assist your community service needs today?`
  );
}
