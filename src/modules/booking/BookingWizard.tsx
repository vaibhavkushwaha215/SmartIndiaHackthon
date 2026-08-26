import React, { useState, useEffect } from 'react';
import { ServiceItem, ServiceProblemOption } from '../../shared/config/services.config';
import { ServiceRequest, SavedAddress, GenderPreference } from '../../shared/types';
import { useAuth } from '../auth';
import { useToast } from '../../shared/components/Toast';
import { Modal } from '../../shared/components/Modal';
import { db } from '../../shared/services/database';
import { logger } from '../../shared/services/logger';
import { useFeature } from '../../shared/config/features.config';
import { ERROR_CODES } from '../../shared/constants/error-codes';
import {
  Calendar,
  Clock,
  MapPin,
  Wrench,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Lock,
  User,
  Users,
  Sparkles,
  Info,
  Check,
} from 'lucide-react';
import { useI18n } from '../i18n';

interface BookingWizardProps {
  service: ServiceItem | null;
  isOpen: boolean;
  onClose: () => void;
  onBookingSuccess: (request: ServiceRequest) => void;
}

const AVAILABLE_SLOTS = [
  '09:00 AM - 11:00 AM',
  '11:00 AM - 01:00 PM',
  '02:00 PM - 04:00 PM',
  '04:00 PM - 06:00 PM',
  '06:00 PM - 08:00 PM',
];

export const BookingWizard: React.FC<BookingWizardProps> = ({
  service,
  isOpen,
  onClose,
  onBookingSuccess,
}) => {
  const { t } = useI18n();
  const { currentUser } = useAuth();
  const { showError, showSuccess } = useToast();
  const isGenderPrefEnabled = useFeature('genderPreference');

  const [currentStep, setCurrentStep] = useState<number>(1);

  // Tomorrow as default date string YYYY-MM-DD
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  // Wizard state
  const [selectedProblems, setSelectedProblems] = useState<string[]>([]);
  const [otherProblemDetails, setOtherProblemDetails] = useState<string>('');
  const [date, setDate] = useState<string>(defaultDateStr);
  const [timeSlot, setTimeSlot] = useState<string>(AVAILABLE_SLOTS[0]);
  const [isLateBookingConfirmed, setIsLateBookingConfirmed] = useState<boolean>(false);
  const [lateConfirmedTimestamp, setLateConfirmedTimestamp] = useState<number | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('custom');
  const [address, setAddress] = useState<string>('');
  const [pincode, setPincode] = useState<string>('110024');
  const [locality, setLocality] = useState<string>('Lajpat Nagar');
  const [additionalDetails, setAdditionalDetails] = useState<string>('');
  const [genderPreference, setGenderPreference] = useState<GenderPreference>('no_preference');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [createdRequest, setCreatedRequest] = useState<ServiceRequest | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setCreatedRequest(null);
      setSelectedProblems([]);
      setOtherProblemDetails('');
      setIsLateBookingConfirmed(false);
      setLateConfirmedTimestamp(null);
      loadSavedAddresses();
    }
  }, [isOpen, service]);

  const loadSavedAddresses = async () => {
    try {
      const addrs = await db.getSavedAddresses(currentUser?.id);
      setSavedAddresses(addrs);
      const defaultAddr = addrs.find((a) => a.isDefault) || addrs[0];
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
        setAddress(`${defaultAddr.flat}, ${defaultAddr.area}, ${defaultAddr.city}, ${defaultAddr.state}`);
        setPincode(defaultAddr.pincode || '110024');
        setLocality(defaultAddr.area || 'Lajpat Nagar');
      } else {
        setSelectedAddressId('custom');
        setAddress('Flat 402, Block B, Green Park Apartments, Lajpat Nagar, Delhi');
        setPincode('110024');
        setLocality('Lajpat Nagar');
      }
    } catch {
      setSelectedAddressId('custom');
    }
  };

  const handleSelectSavedAddress = (addr: SavedAddress) => {
    setSelectedAddressId(addr.id);
    setAddress(`${addr.flat}, ${addr.area}, ${addr.city}, ${addr.state}`);
    setPincode(addr.pincode || '110024');
    setLocality(addr.area || 'Lajpat Nagar');
  };

  if (!service) return null;

  // Problem toggle handler
  const handleToggleProblem = (problemId: string) => {
    setSelectedProblems((prev) => {
      if (prev.includes(problemId)) {
        return prev.filter((id) => id !== problemId);
      }
      return [...prev, problemId];
    });
  };

  const isOtherSelected = selectedProblems.includes('other');

  // Check if chosen slot is late booking (< 1 hour away)
  const isLateBookingSlot = (): boolean => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (date !== todayStr) return false;

    const [startHourStr, startPeriod] = timeSlot.split(' - ')[0].split(' ');
    const [hStr, mStr] = startHourStr.split(':');
    let h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);
    if (startPeriod === 'PM' && h < 12) h += 12;
    if (startPeriod === 'AM' && h === 12) h = 0;

    const slotTime = new Date();
    slotTime.setHours(h, m, 0, 0);

    const diffMinutes = (slotTime.getTime() - Date.now()) / (1000 * 60);
    return diffMinutes > 0 && diffMinutes < 60;
  };

  const isLate = isLateBookingSlot();

  // Validate step navigation
  const handleNextStep = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
      return;
    }

    if (currentStep === 2) {
      if (selectedProblems.length === 0) {
        showError(ERROR_CODES.BAD_REQUEST, 'Please select at least one problem issue.');
        return;
      }
      if (isOtherSelected && !otherProblemDetails.trim()) {
        showError(ERROR_CODES.BAD_REQUEST, 'Please provide details for "Other" problem.');
        return;
      }
      setCurrentStep(3);
      return;
    }

    if (currentStep === 3) {
      if (isLate) {
        if (!isLateBookingConfirmed || !lateConfirmedTimestamp) {
          showError(ERROR_CODES.BAD_REQUEST, 'Please confirm the late booking acknowledgement checkbox.');
          return;
        }
        const elapsedMins = (Date.now() - lateConfirmedTimestamp) / (1000 * 60);
        if (elapsedMins > 10) {
          setIsLateBookingConfirmed(false);
          setLateConfirmedTimestamp(null);
          showError(ERROR_CODES.BAD_REQUEST, 'Your 10-minute late booking confirmation window has expired. Please re-confirm.');
          return;
        }
      }
      setCurrentStep(4);
      return;
    }

    if (currentStep === 4) {
      if (!address.trim()) {
        showError(ERROR_CODES.BAD_REQUEST, 'Please enter a valid service address.');
        return;
      }
      if (!pincode || pincode.trim().length !== 6) {
        showError(ERROR_CODES.INVALID_PINCODE, 'Please enter a valid 6-digit postal pincode.');
        return;
      }
      setCurrentStep(5);
      return;
    }

    if (currentStep === 5) {
      setCurrentStep(6);
      return;
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Final submit request & payment
  const handleSubmitRequest = async () => {
    if (!currentUser) {
      showError(ERROR_CODES.UNAUTHORIZED, 'Please sign in or create an account to book service.');
      return;
    }

    if (isLate) {
      if (!isLateBookingConfirmed || !lateConfirmedTimestamp) {
        showError(ERROR_CODES.BAD_REQUEST, 'Please confirm the late booking acknowledgement checkbox.');
        setCurrentStep(3);
        return;
      }
      const elapsedMins = (Date.now() - lateConfirmedTimestamp) / (1000 * 60);
      if (elapsedMins > 10) {
        setIsLateBookingConfirmed(false);
        setLateConfirmedTimestamp(null);
        showError(ERROR_CODES.BAD_REQUEST, 'Your 10-minute late booking confirmation window has expired. Please re-confirm.');
        setCurrentStep(3);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const [startPart, endPart] = timeSlot.split(' - ');
      const newReq = await db.createServiceRequest({
        customerId: currentUser.id,
        serviceCategoryId: service.category,
        serviceId: service.id,
        serviceName: service.nameEn,
        selectedProblems,
        otherProblemDetails: otherProblemDetails.trim(),
        date,
        slotStart: startPart,
        slotEnd: endPart,
        timeSlotDisplay: timeSlot,
        address: `${address.trim()} - ${pincode.trim()}`,
        pincode: pincode.trim(),
        locality: locality.trim(),
        additionalDetails: additionalDetails.trim(),
        ...(isGenderPrefEnabled && genderPreference ? { genderPreference } : {}),
        priority: 'normal',
        amount: service.baseRate,
        isLateBooking: isLate,
      });

      await logger.log({
        action: 'SERVICE_REQUEST_CREATED',
        userId: currentUser.id,
        route: `/services/${service.id}`,
        resultCode: 201,
        details: `Created request #${newReq.id} for ${service.nameEn}`,
      });

      showSuccess('Service request submitted to cooperative network!');
      setCreatedRequest(newReq);
      setCurrentStep(7);
      onBookingSuccess(newReq);
    } catch (err: any) {
      showError(err?.code || 500, err?.message || 'Failed to submit service request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="3xl"
      title={
        <div className="flex items-center gap-2 text-slate-900">
          <Wrench className="w-5 h-5 text-emerald-600" />
          <span>{service.nameEn}</span>
        </div>
      }
      subtitle={`₹${service.baseRate} • ${service.durationEst} • 0% Cooperative Commission`}
    >
      <div className="space-y-6">
        
        {/* Progress Stepper (Steps 1 to 6) */}
        {currentStep <= 6 && (
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            {[1, 2, 3, 4, 5, 6].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                    currentStep === s
                      ? 'bg-emerald-700 text-white shadow-md'
                      : currentStep > s
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {currentStep > s ? <Check className="w-3.5 h-3.5" /> : s}
                </div>
                <span className="text-xs font-semibold text-slate-600 hidden md:inline">
                  {s === 1
                    ? 'Overview'
                    : s === 2
                    ? 'Problem'
                    : s === 3
                    ? 'Schedule'
                    : s === 4
                    ? 'Address'
                    : s === 5
                    ? 'Preferences'
                    : 'Escrow'}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* STEP 1: SERVICE OVERVIEW */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  {service.category}
                </span>
                <span className="text-lg font-black text-emerald-900">₹{service.baseRate}</span>
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">{service.nameEn}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{service.descriptionEn}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-emerald-600" />
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Estimated Time</div>
                  <div className="text-xs font-bold text-slate-900">{service.durationEst}</div>
                </div>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Verified Artisan</div>
                  <div className="text-xs font-bold text-slate-900">100% Background Checked</div>
                </div>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">0% Commission</div>
                  <div className="text-xs font-bold text-slate-900">Direct Cooperative Rates</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: WHAT IS YOUR PROBLEM? */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-in fade-in">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                {t('wizard.step2Title', 'What is your problem?')}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {t('wizard.step2Subtitle', 'Select one or more issues to help the artisan bring the right diagnostic tools.')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {service.problemOptions.map((prob) => {
                const isChecked = selectedProblems.includes(prob.id);
                return (
                  <label
                    key={prob.id}
                    className={`flex items-start gap-3 p-3 rounded-2xl border transition cursor-pointer ${
                      isChecked
                        ? 'bg-emerald-50/80 border-emerald-500 text-emerald-950 font-bold shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleProblem(prob.id)}
                      className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span className="text-xs leading-snug">{t(prob.labelKey, prob.id)}</span>
                  </label>
                );
              })}
            </div>

            {/* If 'Other' selected -> required text input */}
            {isOtherSelected && (
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-2 animate-in fade-in">
                <label className="block text-xs font-bold text-amber-950 uppercase tracking-wider">
                  {t('wizard.otherDetailsLabel', 'Please describe your specific problem (Required)')} *
                </label>
                <textarea
                  rows={3}
                  value={otherProblemDetails}
                  onChange={(e) => setOtherProblemDetails(e.target.value)}
                  placeholder={t('wizard.otherDetailsPlaceholder', 'e.g. Unusual humming noise in switchboard when AC is turned on...')}
                  className="w-full p-3 rounded-xl border border-amber-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            )}
          </div>
        )}

        {/* STEP 3: DATE & TIME SLOT */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-in fade-in">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                {t('wizard.step3Title', 'Choose Date & Time Slot')}
              </h3>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Service Date
              </label>
              <input
                type="date"
                value={date}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Available Time Slot
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {AVAILABLE_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setTimeSlot(slot)}
                    className={`p-3 rounded-xl border text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                      timeSlot === slot
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-md'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span>{slot}</span>
                    {timeSlot === slot && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Late Booking Warning & Confirmation Check */}
            {isLate && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 space-y-3 animate-in fade-in">
                <div className="flex items-start gap-2.5 text-xs text-amber-900">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Late Booking Notice: </span>
                    {t('wizard.lateBookingWarning', 'This appointment is less than 1 hour away. If no professional is assigned in time, this request may be cancelled.')}
                  </div>
                </div>
                <label className="flex items-center gap-2.5 pt-1 text-xs font-bold text-amber-950 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isLateBookingConfirmed}
                    onChange={(e) => {
                      setIsLateBookingConfirmed(e.target.checked);
                      setLateConfirmedTimestamp(e.target.checked ? Date.now() : null);
                    }}
                    className="rounded border-amber-400 text-amber-600 focus:ring-amber-500 cursor-pointer"
                  />
                  <span>{t('wizard.lateBookingConfirm', 'I understand and confirm this late booking')}</span>
                </label>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: ADDRESS & PINCODE */}
        {currentStep === 4 && (
          <div className="space-y-4 animate-in fade-in">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                {t('wizard.step4Title', 'Service Address & Pincode')}
              </h3>
            </div>

            {savedAddresses.length > 0 && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Saved Addresses
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {savedAddresses.map((addr) => (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => handleSelectSavedAddress(addr)}
                      className={`p-3 rounded-xl border text-left text-xs transition cursor-pointer ${
                        selectedAddressId === addr.id
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-bold">{addr.tag}</div>
                      <div className="text-[11px] text-slate-500 truncate">{addr.flat}, {addr.area}</div>
                      <div className="text-[10px] text-emerald-700 font-mono mt-0.5">PIN: {addr.pincode}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Street Address *
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Flat 402, Block B, Green Park Apartments"
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Locality / Sector
                  </label>
                  <input
                    type="text"
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    placeholder="e.g. Lajpat Nagar"
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    6-Digit Pincode *
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 110024"
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs font-mono font-bold bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: PREFERENCES & NOTES */}
        {currentStep === 5 && (
          <div className="space-y-4 animate-in fade-in">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                {isGenderPrefEnabled
                  ? t('wizard.step5Title', 'Additional Details & Gender Preference')
                  : t('wizard.step5DetailsOnlyTitle', 'Additional Instructions & Notes')}
              </h3>
            </div>

            {isGenderPrefEnabled && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {t('wizard.genderPrefLabel', 'Artisan Gender Preference')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'no_preference', label: t('wizard.noPref', 'No preference') },
                    { key: 'male', label: t('wizard.malePref', 'Male professional') },
                    { key: 'female', label: t('wizard.femalePref', 'Female professional') },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setGenderPreference(opt.key as GenderPreference)}
                      className={`p-3 rounded-xl border text-xs font-bold transition text-center cursor-pointer ${
                        genderPreference === opt.key
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-900 font-extrabold shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                {t('wizard.notesLabel', 'Additional instructions for the artisan (Optional)')}
              </label>
              <textarea
                rows={3}
                value={additionalDetails}
                onChange={(e) => setAdditionalDetails(e.target.value)}
                placeholder={t('wizard.notesPlaceholder', 'e.g. Call before arrival, main panel is in basement...')}
                className="w-full p-3 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>
        )}

        {/* STEP 6: ESCROW PAYMENT SUMMARY */}
        {currentStep === 6 && (
          <div className="space-y-4 animate-in fade-in">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                {t('wizard.step6Title', 'Payment & Escrow Summary')}
              </h3>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Base Diagnostic & Service Rate</span>
                <span className="font-bold text-slate-900">₹{service.baseRate}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Cooperative Platform Fee (0% Charter)</span>
                <span className="font-bold text-emerald-700">₹0</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Taxes & GST</span>
                <span className="font-bold text-slate-900">₹0</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-sm font-extrabold text-slate-900">
                <span>Total Amount in Escrow</span>
                <span className="text-base font-black text-emerald-700">₹{service.baseRate}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-xs text-emerald-900">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">100% Escrow Protection: </span>
                {t('wizard.escrowProtected', 'Held safely in 100% Cooperative Escrow until job is completed to your satisfaction.')}
              </div>
            </div>
          </div>
        )}

        {/* STEP 7: REQUEST SUBMITTED & BROADCAST MATCHING */}
        {currentStep === 7 && createdRequest && (
          <div className="py-6 text-center space-y-4 animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto animate-pulse">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full uppercase tracking-wider">
                Broadcast Status: {createdRequest.requestStatus}
              </span>
              <h3 className="text-xl font-extrabold text-slate-900">
                {t('wizard.findingPro', 'Finding a verified cooperative professional...')}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Your request has been broadcasted to verified artisans in pincode <b>{createdRequest.pincode}</b>. As soon as an artisan accepts, their profile will appear in your bookings.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs max-w-md mx-auto space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Request ID:</span>
                <span className="font-mono font-bold text-slate-900">{createdRequest.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Service:</span>
                <span className="font-bold text-slate-900">{createdRequest.serviceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Scheduled:</span>
                <span className="font-bold text-slate-900">{createdRequest.date} ({createdRequest.timeSlotDisplay})</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md cursor-pointer transition"
            >
              {t('common.close', 'Done & View Bookings')}
            </button>
          </div>
        )}

        {/* Footer Navigation Controls */}
        {currentStep <= 6 && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t('common.back', 'Back')}</span>
              </button>
            ) : (
              <div />
            )}

            {currentStep < 6 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5 transition"
              >
                <span>{t('common.continue', 'Continue')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmitRequest}
                className="px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold shadow-md cursor-pointer flex items-center gap-2 transition disabled:opacity-50"
              >
                <Lock className="w-4 h-4" />
                <span>{isSubmitting ? t('common.loading', 'Processing...') : t('wizard.submitRequest', 'Confirm & Pay via Escrow')}</span>
              </button>
            )}
          </div>
        )}

      </div>
    </Modal>
  );
};
