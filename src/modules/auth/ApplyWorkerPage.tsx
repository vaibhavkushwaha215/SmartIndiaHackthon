import React, { useState } from 'react';
import { db } from '../../shared/services/database';
import { useToast } from '../../shared/components/Toast';
import { ApplicationStatusCard } from './ApplicationStatusCard';
import {
  Wrench,
  ShieldCheck,
  User,
  Phone,
  Mail,
  MapPin,
  Building2,
  FileCheck,
  CheckCircle2,
  ArrowRight,
  Briefcase,
  Clock,
  IndianRupee,
} from 'lucide-react';

interface ApplyWorkerPageProps {
  onNavigateToLogin: () => void;
  onApplicationSubmitted?: (appId: string) => void;
}

export const ApplyWorkerPage: React.FC<ApplyWorkerPageProps> = ({
  onNavigateToLogin,
  onApplicationSubmitted = () => {},
}) => {
  const { showError, showSuccess } = useToast();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: 'New Delhi',
    pincode: '',
    primarySkill: 'Master Electrician',
    additionalSkills: 'Inverter Diagnostics, Earthing Setup',
    experienceYears: 5,
    serviceArea: 'South Delhi & Noida',
    availability: 'Full-Time' as 'Full-Time' | 'Part-Time' | 'On-Demand',
    hourlyRate: 299,
    documentType: 'Aadhaar' as 'Aadhaar' | 'Voter ID' | 'Trade Certificate' | 'Other',
    documentNumber: '',
    cooperativeSociety: 'Delhi Vidyut Sahyog (COOP-DL-804)',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedAppId, setSubmittedAppId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) {
      showError(400, 'Please provide your full legal name');
      return;
    }
    if (formData.phone.trim().length !== 10) {
      showError(102, 'Please provide a valid 10-digit mobile number');
      return;
    }
    if (!formData.documentNumber.trim()) {
      showError(400, 'Please provide an identity/document number for cooperative verification');
      return;
    }

    setIsSubmitting(true);
    try {
      const maskedDoc = formData.documentNumber.length > 4
        ? `•••• •••• ${formData.documentNumber.slice(-4)}`
        : formData.documentNumber;

      const app = await db.submitWorkerApplication({
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        address: formData.address.trim(),
        city: formData.city.trim(),
        pincode: formData.pincode.trim(),
        primarySkill: formData.primarySkill,
        additionalSkills: formData.additionalSkills.split(',').map((s) => s.trim()).filter(Boolean),
        experienceYears: Number(formData.experienceYears) || 1,
        serviceArea: formData.serviceArea.trim(),
        availability: formData.availability,
        hourlyRate: Number(formData.hourlyRate) || 299,
        documentType: formData.documentType,
        documentNumberMasked: maskedDoc,
        cooperativeSociety: formData.cooperativeSociety,
      });

      setSubmittedAppId(app.id);
      showSuccess('Application submitted successfully! Your application is now Pending Verification.');
      onApplicationSubmitted(app.id);
    } catch (err: any) {
      showError(500, err.message || 'Failed to submit worker application');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      
      {/* Top Banner */}
      <div className="rounded-3xl bg-linear-to-r from-emerald-900 via-teal-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Cooperative Artisan Onboarding
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Join the SahyogSeva Worker Network
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200/80 max-w-2xl leading-relaxed">
            Direct customer connections, 0% platform commission, prompt escrow settlements, and fair opportunity distribution.
          </p>
        </div>

        <button
          onClick={onNavigateToLogin}
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition cursor-pointer shrink-0 border border-white/15"
        >
          Already Approved? Sign In →
        </button>
      </div>

      {/* If Submitted: Show Confirmation Screen */}
      {submittedAppId ? (
        <div className="bg-white rounded-3xl p-8 border border-emerald-200 shadow-xl text-center space-y-6 animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs font-extrabold px-3 py-1 rounded-full uppercase">
              <Clock className="w-3.5 h-3.5" /> Status: Pending Verification
            </span>
            <h2 className="text-xl font-extrabold text-slate-900">
              Application Submitted Successfully!
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your application reference is <strong className="font-mono text-slate-900">{submittedAppId}</strong>. A cooperative federation administrator will verify your credentials within 24 hours.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 max-w-md mx-auto text-left text-xs space-y-1.5">
            <div className="flex justify-between text-slate-600">
              <span>Primary Skill:</span>
              <span className="font-bold text-slate-900">{formData.primarySkill}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Registered Phone:</span>
              <span className="font-bold text-slate-900">{formData.phone}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Cooperative Federation:</span>
              <span className="font-bold text-slate-900">{formData.cooperativeSociety}</span>
            </div>
          </div>

          <button
            onClick={() => setSubmittedAppId(null)}
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
          >
            Submit Another Application / Check Other
          </button>
        </div>
      ) : (
        /* Application Form Grid */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Form (2 cols) */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            
            {/* Section 1: Personal Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <User className="w-4 h-4 text-emerald-700" />
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                  1. Personal Information
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Manoj Kumar Verma"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold bg-slate-50 focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    10-Digit Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                    placeholder="e.g. 9811099881"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold bg-slate-50 focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. manoj.verma@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50 focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    City / Base Town *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. New Delhi"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50 focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Residential Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g. B-142, Mayur Vihar Phase 1, Pincode 110091"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50 focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Professional Information */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <Briefcase className="w-4 h-4 text-emerald-700" />
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                  2. Trade & Professional Information
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Primary Trade / Skill *
                  </label>
                  <select
                    value={formData.primarySkill}
                    onChange={(e) => setFormData({ ...formData, primarySkill: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold bg-slate-50 focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="Master Electrician">Master Electrician (Short circuits, Inverters, MCBs)</option>
                    <option value="Plumbing & Sanitation">Plumbing & Pipe Specialist</option>
                    <option value="AC & Appliance Repair">AC & Home Appliance Technician</option>
                    <option value="Carpentry & Woodwork">Carpentry & Modular Furniture</option>
                    <option value="House Painting & Wall Care">House Painting & Wall Finishing</option>
                    <option value="Deep Home Cleaning">Deep Home & Tank Cleaning</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Years of Field Experience *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={40}
                    value={formData.experienceYears}
                    onChange={(e) => setFormData({ ...formData, experienceYears: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50 focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Work Availability *
                  </label>
                  <select
                    value={formData.availability}
                    onChange={(e) => setFormData({ ...formData, availability: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50 focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="Full-Time">Full-Time (Daily 9 AM - 6 PM)</option>
                    <option value="On-Demand">On-Demand / Flexible Hours</option>
                    <option value="Part-Time">Part-Time (Evenings / Weekends)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Standard Tariff (₹ / Hour)
                  </label>
                  <input
                    type="number"
                    min={149}
                    max={1500}
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({ ...formData, hourlyRate: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50 focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Preferred Service Locality / Radius
                  </label>
                  <input
                    type="text"
                    value={formData.serviceArea}
                    onChange={(e) => setFormData({ ...formData, serviceArea: e.target.value })}
                    placeholder="e.g. South Delhi, Lajpat Nagar, Noida Sector 18"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50 focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>
            </div>

            {/* Section 3 & 4: Identity & Cooperative Information */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <FileCheck className="w-4 h-4 text-emerald-700" />
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                  3. Identity Verification & Cooperative Society
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Verification ID Document Type *
                  </label>
                  <select
                    value={formData.documentType}
                    onChange={(e) => setFormData({ ...formData, documentType: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50 focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="Aadhaar">Aadhaar Card (UIDAI)</option>
                    <option value="Trade Certificate">Trade / ITI / Skill Certificate</option>
                    <option value="Voter ID">Voter Identity Card</option>
                    <option value="Other">Government Trade License</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Document / Registration Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.documentNumber}
                    onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                    placeholder="e.g. 1234-5678-9012"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50 focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Affiliated Cooperative Society / Federation *
                  </label>
                  <select
                    value={formData.cooperativeSociety}
                    onChange={(e) => setFormData({ ...formData, cooperativeSociety: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50 focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="Delhi Vidyut Sahyog (COOP-DL-804)">Delhi Vidyut Sahyog (COOP-DL-804)</option>
                    <option value="East Delhi Shramik Sahakari Samiti">East Delhi Shramik Sahakari Samiti</option>
                    <option value="Shramik Shakti Sangathan (COOP-GJ-102)">Shramik Shakti Sangathan (COOP-GJ-102)</option>
                    <option value="Noida Shramik Ekta Manch (COOP-UP-551)">Noida Shramik Ekta Manch (COOP-UP-551)</option>
                    <option value="Maharashtra Shramik Karigar Federation">Maharashtra Shramik Karigar Federation</option>
                    <option value="Independent Cooperative Applicant">Independent / Non-Affiliated (Request Assigned Coop)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-2xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-black text-sm shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Submitting Application...' : 'Submit Cooperative Onboarding Application'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </form>

          {/* Right Sidebar: Status Lookup & Charter Info */}
          <div className="space-y-6">
            <ApplicationStatusCard />

            <div className="bg-[var(--color-primary-light)] rounded-3xl p-6 border border-[var(--color-border)] text-[var(--color-text)] space-y-3">
              <h4 className="font-extrabold text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[var(--color-primary)]" />
                <span>The Cooperative Advantage</span>
              </h4>
              <ul className="text-xs space-y-2 text-emerald-900/90 leading-relaxed list-disc list-inside">
                <li><strong>0% Platform Commission:</strong> Keep 100% of your listed hourly rate.</li>
                <li><strong>FairMatch™ Rotation:</strong> Every verified member gets an equal opportunity for bookings.</li>
                <li><strong>Protected Escrow:</strong> Guaranteed payout once the customer marks completion.</li>
                <li><strong>Police & ID Verification:</strong> Higher trust and repeat booking rates from verified residents.</li>
              </ul>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
