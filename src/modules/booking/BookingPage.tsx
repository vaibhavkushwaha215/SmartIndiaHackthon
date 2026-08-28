import React, { useState, useEffect } from 'react';
import { ServiceItem, ServiceProblemOption, calculateServiceRequestPrice } from '../../shared/config/services.config';
import { ServiceRequest, SavedAddress, GenderPreference } from '../../shared/types';
import { db } from '../../shared/services/database';
import { logger } from '../../shared/services/logger';
import { useAuth } from '../auth';
import { useToast } from '../../shared/components/Toast';
import { useI18n } from '../i18n';
import { useFeature } from '../../shared/config/features.config';
import { ERROR_CODES } from '../../shared/constants/error-codes';
import { AddressFormModal } from '../../shared/components/AddressFormModal';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  ShieldCheck,
  Sparkles,
  Calendar,
  MapPin,
  User,
  Zap,
  AlertTriangle,
  Lock,
  Plus,
  Pencil,
  Home,
  Building2,
  Briefcase,
  MoreHorizontal,
  Wrench,
  CheckCircle2,
  Info,
} from 'lucide-react';

interface BookingPageProps {
  service: ServiceItem;
  onBackToServices: () => void;
  onBookingSuccess: (createdRequest: ServiceRequest) => void;
}

const AVAILABLE_SLOTS = [
  '09:00 AM - 11:00 AM',
  '11:00 AM - 01:00 PM',
  '02:00 PM - 04:00 PM',
  '04:00 PM - 06:00 PM',
  '06:00 PM - 08:00 PM',
];

export const BookingPage: React.FC<BookingPageProps> = ({
  service,
  onBackToServices,
  onBookingSuccess,
}) => {
  const { t } = useI18n();
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useToast();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);

  // Form State
  const [selectedProblems, setSelectedProblems] = useState<string[]>([]);
  const [otherProblemDetails, setOtherProblemDetails] = useState<string>('');
  
  // Helper to check if a slot has already started/passed
  const isSlotInPast = (dateStr: string, slotStr: string): boolean => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (dateStr < todayStr) return true;
    if (dateStr > todayStr) return false;

    const [startPart] = slotStr.split(' - ');
    const [timeStr, period] = (startPart || '').split(' ');
    const [hStr, mStr] = (timeStr || '9:00').split(':');
    let h = parseInt(hStr || '9', 10);
    const m = parseInt(mStr || '0', 10);
    if (period === 'PM' && h < 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;

    const slotTime = new Date();
    slotTime.setHours(h, m, 0, 0);

    return slotTime.getTime() <= Date.now();
  };

  // Determine initial date and slot
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const firstAvailableTodaySlot = AVAILABLE_SLOTS.find((s) => !isSlotInPast(todayStr, s));
  const initialDate = firstAvailableTodaySlot ? todayStr : tomorrowStr;
  const initialSlot = firstAvailableTodaySlot || AVAILABLE_SLOTS[0];

  // Date & Slot
  const [date, setDate] = useState<string>(initialDate);
  const [timeSlot, setTimeSlot] = useState<string>(initialSlot);
  const [isLateBookingConfirmed, setIsLateBookingConfirmed] = useState<boolean>(false);
  const [lateConfirmedTimestamp, setLateConfirmedTimestamp] = useState<number | null>(null);

  // Address
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [isAddressModalOpen, setIsAddressModalOpen] = useState<boolean>(false);
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);
  const [loadingAddresses, setLoadingAddresses] = useState<boolean>(true);

  // Preferences & Details
  const [genderPreference, setGenderPreference] = useState<GenderPreference>('no_preference');
  const [additionalDetails, setAdditionalDetails] = useState<string>('');

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Load saved addresses on mount
  useEffect(() => {
    loadAddresses();
  }, [currentUser]);

  const loadAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const addrs = await db.getSavedAddresses(currentUser?.id);
      setSavedAddresses(addrs);
      if (addrs.length > 0 && !selectedAddressId) {
        const defaultAddr = addrs.find((a) => a.isDefault) || addrs[0];
        setSelectedAddressId(defaultAddr.id);
      }
    } catch (e) {
      console.error('Failed to load saved addresses:', e);
    } finally {
      setLoadingAddresses(false);
    }
  };

  // Pricing calculation (single source of truth)
  const currentTotalAmount = calculateServiceRequestPrice(service, selectedProblems);

  // Late booking check (< 1 hr away)
  const isLateBookingSlot = (): boolean => {
    if (date !== todayStr) return false;
    const [startPart] = timeSlot.split(' - ');
    const [timeStr, period] = (startPart || '').split(' ');
    const [hStr, mStr] = (timeStr || '9:00').split(':');
    let h = parseInt(hStr || '9', 10);
    const m = parseInt(mStr || '0', 10);
    if (period === 'PM' && h < 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;

    const slotTime = new Date();
    slotTime.setHours(h, m, 0, 0);

    const diffMinutes = (slotTime.getTime() - Date.now()) / (1000 * 60);
    return diffMinutes > 0 && diffMinutes < 60;
  };

  const isLate = isLateBookingSlot();

  // Problem toggle handler
  const handleToggleProblem = (probId: string) => {
    setSelectedProblems((prev) =>
      prev.includes(probId) ? prev.filter((p) => p !== probId) : [...prev, probId]
    );
  };

  // Exit with confirmation if user modified form
  const hasUnsavedProgress = currentStep > 1 || selectedProblems.length > 0 || additionalDetails.trim().length > 0;

  const handleBackClick = () => {
    if (hasUnsavedProgress) {
      setShowExitConfirm(true);
    } else {
      onBackToServices();
    }
  };

  // Step Validation & Navigation
  const handleNextStep = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (currentStep === 2) {
      if (selectedProblems.length === 0) {
        showError(ERROR_CODES.BAD_REQUEST, 'Please select at least one problem / task.');
        return;
      }
      if (selectedProblems.includes('other') && !otherProblemDetails.trim()) {
        showError(ERROR_CODES.BAD_REQUEST, 'Please provide details for the "Other" problem.');
        return;
      }
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (currentStep === 4) {
      if (!selectedAddressId) {
        showError(ERROR_CODES.BAD_REQUEST, 'Please select or add a service address.');
        return;
      }
      const chosenAddr = savedAddresses.find((a) => a.id === selectedAddressId);
      if (!chosenAddr || !chosenAddr.pincode || chosenAddr.pincode.length !== 6) {
        showError(ERROR_CODES.INVALID_PINCODE, 'Selected address must have a valid 6-digit pincode.');
        return;
      }
      setCurrentStep(5);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (currentStep === 5) {
      setCurrentStep(6);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Submit Request & Lock in Escrow
  const handleSubmitRequest = async () => {
    if (!currentUser) {
      showError(ERROR_CODES.UNAUTHORIZED, 'Please sign in or create an account to book service.');
      return;
    }

    const chosenAddr = savedAddresses.find((a) => a.id === selectedAddressId);
    if (!chosenAddr) {
      showError(ERROR_CODES.BAD_REQUEST, 'Please select a valid service address.');
      setCurrentStep(4);
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
      const fullAddressStr = `${chosenAddr.flat}, ${chosenAddr.area}${chosenAddr.landmark ? ` (Near ${chosenAddr.landmark})` : ''}, ${chosenAddr.city}, ${chosenAddr.state} - ${chosenAddr.pincode}`;

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
        address: fullAddressStr,
        pincode: chosenAddr.pincode,
        locality: chosenAddr.area || chosenAddr.city,
        additionalDetails: additionalDetails.trim(),
        ...(isGenderPrefEnabled && genderPreference ? { genderPreference } : {}),
        priority: 'normal',
        amount: currentTotalAmount,
        isLateBooking: isLate,
      });

      await logger.log({
        action: 'SERVICE_REQUEST_CREATED',
        userId: currentUser.id,
        route: `/book/${service.id}`,
        resultCode: 201,
        details: `Created request #${newReq.id} for ${service.nameEn} (Total: ₹${currentTotalAmount})`,
      });

      showSuccess('Service request submitted! Finding local professionals...');
      onBookingSuccess(newReq);
    } catch (err: any) {
      showError(err.code || ERROR_CODES.SERVER_ERROR, err.message || 'Failed to submit service request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Feature Flag: Gender Preference (Controlled by SuperAdmin)
  const isGenderPrefEnabled = useFeature('genderPreference');

  // Gender Preference Restrictions (Opposite gender disabled based on authenticated user profile)
  const userGender = currentUser?.gender?.toLowerCase();
  const isFemaleCustomer = userGender === 'female';
  const isMaleCustomer = userGender === 'male';

  const STEP_NAMES = [
    { num: 1, label: t('booking.steps.overview', 'Overview') },
    { num: 2, label: t('booking.steps.problem', 'Problems') },
    { num: 3, label: t('booking.steps.schedule', 'Schedule') },
    { num: 4, label: t('booking.steps.address', 'Address') },
    { num: 5, label: isGenderPrefEnabled ? t('booking.steps.preferences', 'Preferences') : t('booking.steps.details', 'Details') },
    { num: 6, label: t('booking.steps.escrow', 'Escrow') },
  ];

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-8 space-y-6 animate-in fade-in duration-300">
      
      {/* Top Bar: Back to Services & Service Summary Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          type="button"
          onClick={handleBackClick}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-extrabold shadow-2xs transition cursor-pointer self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('booking.backToServices', 'Back to Services')}</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            {service.category}
          </span>
          <span className="text-xs text-slate-500 font-semibold">
            {service.durationEst}
          </span>
        </div>
      </div>

      {/* Service Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-900/20">
            <Wrench className="w-7 h-7" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold uppercase mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>0% Cooperative Commission</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">{service.nameEn}</h1>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">{service.descriptionEn}</p>
          </div>
        </div>

        <div className="text-right sm:border-l sm:border-slate-100 sm:pl-6 shrink-0">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Estimated Task Total</span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-700">₹{currentTotalAmount}</span>
          <span className="text-[11px] text-slate-400 block mt-0.5">Held in Cooperative Escrow</span>
        </div>
      </div>

      {/* Stepper Bar */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-xs overflow-x-auto scrollbar-none">
        <div className="flex items-center justify-between min-w-[540px]">
          {STEP_NAMES.map((s) => {
            const isDone = s.num < currentStep;
            const isCurrent = s.num === currentStep;
            return (
              <button
                key={s.num}
                type="button"
                disabled={s.num > currentStep}
                onClick={() => {
                  if (s.num < currentStep) setCurrentStep(s.num);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer disabled:cursor-not-allowed ${
                  isCurrent
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : isDone
                    ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100/70'
                    : 'text-slate-400 bg-slate-50'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                    isCurrent
                      ? 'bg-white text-emerald-800'
                      : isDone
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isDone ? <Check className="w-3 h-3 stroke-[3]" /> : s.num}
                </div>
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Step Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">

        {/* STEP 1: OVERVIEW */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in">
            <div>
              <h2 className="text-lg font-black text-slate-900">{t('wizard.step1Title', 'Service Scope & Guarantees')}</h2>
              <p className="text-xs text-slate-500 mt-1">Review standard cooperative pricing and service coverage before configuring your task.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>100% Background Verified</span>
                </div>
                <p className="text-xs text-slate-500">All assigned artisans are verified with Aadhaar and police checks in your neighborhood.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Transparent Task Pricing</span>
                </div>
                <p className="text-xs text-slate-500">Pick exactly what needs repair. Every task has a fixed standard price with zero hidden markups.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>30-Day Work Warranty</span>
                </div>
                <p className="text-xs text-slate-500">Free revisit and warranty protection on all certified cooperative service bookings.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  <span>100% Escrow Protection</span>
                </div>
                <p className="text-xs text-slate-500">Payment remains safely locked in cooperative escrow until you inspect and approve the completed job.</p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: PROBLEM SELECTION WITH INDIVIDUAL TASK PRICING */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-black text-slate-900">{t('wizard.step2Title', 'Select Issues & Tasks')}</h2>
                <p className="text-xs text-slate-500 mt-0.5">{t('wizard.step2Subtitle', 'Choose all applicable issues. Each task has individual transparent pricing.')}</p>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-extrabold self-start">
                Selected: {selectedProblems.length} tasks • Total: ₹{currentTotalAmount}
              </div>
            </div>

            {/* Problem Options Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {service.problemOptions.map((opt) => {
                const isSelected = selectedProblems.includes(opt.id);
                return (
                  <label
                    key={opt.id}
                    onClick={() => handleToggleProblem(opt.id)}
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer select-none ${
                      isSelected
                        ? 'bg-emerald-50/80 border-emerald-600 text-emerald-950 shadow-xs'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-lg flex items-center justify-center border transition ${
                          isSelected ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <span className="text-xs font-bold leading-snug">{t(opt.labelKey, opt.id)}</span>
                    </div>

                    <span className={`text-xs font-black shrink-0 ${isSelected ? 'text-emerald-800' : 'text-slate-600'}`}>
                      ₹{opt.price}
                    </span>
                  </label>
                );
              })}
            </div>

            {/* Conditional "Other" Details (Mandatory if other is selected) */}
            {selectedProblems.includes('other') && (
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2 animate-in fade-in">
                <label className="block text-xs font-bold text-amber-950">
                  {t('wizard.otherDetailsLabel', 'Please describe the custom issue')} <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows={3}
                  value={otherProblemDetails}
                  onChange={(e) => setOtherProblemDetails(e.target.value)}
                  placeholder={t('wizard.otherDetailsPlaceholder', 'Provide specifics about what is broken or needs installation...')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            )}
          </div>
        )}

        {/* STEP 3: SCHEDULE & LATE BOOKING WARNING */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in">
            <div>
              <h2 className="text-lg font-black text-slate-900">{t('wizard.step3Title', 'Select Appointment Slot')}</h2>
              <p className="text-xs text-slate-500 mt-0.5">Pick the date and arrival window for your cooperative artisan.</p>
            </div>

            {/* Date Selector */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-2">Service Date</label>
              <input
                type="date"
                min={todayStr}
                value={date}
                onChange={(e) => {
                  const newDate = e.target.value;
                  setDate(newDate);
                  setIsLateBookingConfirmed(false);
                  setLateConfirmedTimestamp(null);
                  if (isSlotInPast(newDate, timeSlot)) {
                    const firstValid = AVAILABLE_SLOTS.find((s) => !isSlotInPast(newDate, s));
                    if (firstValid) setTimeSlot(firstValid);
                  }
                }}
                className="w-full sm:w-64 px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            {/* Time Slot Selector */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-2">Arrival Window</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {AVAILABLE_SLOTS.map((slot) => {
                  const isSelected = timeSlot === slot;
                  const isPast = isSlotInPast(date, slot);
                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={isPast}
                      onClick={() => {
                        if (isPast) return;
                        setTimeSlot(slot);
                        setIsLateBookingConfirmed(false);
                        setLateConfirmedTimestamp(null);
                      }}
                      className={`flex items-center justify-between p-3.5 rounded-2xl text-xs font-bold border transition ${
                        isPast
                          ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200 line-through'
                          : isSelected
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-950 shadow-xs cursor-pointer'
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 cursor-pointer'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <span>{slot}</span>
                        {isPast && <span className="text-[10px] no-underline font-normal text-slate-400">(Passed)</span>}
                      </span>
                      {isSelected && !isPast && <Check className="w-4 h-4 text-emerald-600" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Late Booking Warning (< 1 hr) */}
            {isLate && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 space-y-3 animate-in fade-in">
                <div className="flex items-start gap-2.5 text-xs text-amber-900">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Late Booking Notice: </span>
                    {t('wizard.lateBookingWarning', 'This appointment is less than 1 hour away. If no professional is assigned in time, this request will be automatically refunded.')}
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

        {/* STEP 4: SERVICE ADDRESS (REUSING SAVED ADDRESS BOOK) */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900">{t('wizard.step4Title', 'Service Address')}</h2>
                <p className="text-xs text-slate-500 mt-0.5">Select a saved address or add a new one for verified doorstep dispatch.</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingAddress(null);
                  setIsAddressModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add New Address</span>
              </button>
            </div>

            {/* Saved Addresses List */}
            {savedAddresses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {savedAddresses.map((addr) => {
                  const isSelected = selectedAddressId === addr.id;
                  const Icon = addr.tag === 'Office' ? Briefcase : addr.tag === 'Apartment' ? Building2 : Home;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                        isSelected
                          ? 'bg-emerald-50/80 border-emerald-600 shadow-xs'
                          : 'bg-white hover:bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase bg-slate-100 text-slate-700">
                            <Icon className="w-3 h-3 text-emerald-600" />
                            <span>{addr.tag}</span>
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingAddress(addr);
                              setIsAddressModalOpen(true);
                            }}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="font-bold text-xs text-slate-900">{addr.fullName} • {addr.mobileNumber}</div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {addr.flat}, {addr.area}
                          {addr.landmark ? `, Near ${addr.landmark}` : ''}
                        </p>
                        <div className="text-[11px] font-mono text-slate-500">
                          {addr.city}, {addr.state} - <span className="font-bold text-slate-800">{addr.pincode}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] font-bold text-emerald-800">
                          {isSelected ? '✓ Selected Address' : 'Click to select'}
                        </span>
                        {addr.isDefault && (
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Default</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-300 p-6 space-y-3">
                <MapPin className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="text-xs font-bold text-slate-800">No saved addresses found</h4>
                <p className="text-xs text-slate-500">Add your service address to continue booking.</p>
                <button
                  type="button"
                  onClick={() => {
                    setEditingAddress(null);
                    setIsAddressModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  + Add Address
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 5: PREFERENCES & DETAILS (Gender preference controlled by SuperAdmin feature flag) */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-in fade-in">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                {isGenderPrefEnabled
                  ? t('wizard.step5Title', 'Worker Preferences & Additional Notes')
                  : t('wizard.step5DetailsOnlyTitle', 'Additional Instructions & Notes')}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isGenderPrefEnabled
                  ? 'Customize worker safety preferences and provide arrival instructions.'
                  : 'Provide instructions, landmarks, or details for the visiting artisan.'}
              </p>
            </div>

            {/* Gender Preference Radio Group (Visible ONLY when genderPreference flag is enabled by SuperAdmin) */}
            {isGenderPrefEnabled && (
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-2">
                  {t('wizard.genderPrefLabel', 'Worker Gender Preference')}
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  
                  {/* 1. No Preference */}
                  <button
                    type="button"
                    onClick={() => setGenderPreference('no_preference')}
                    className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                      genderPreference === 'no_preference'
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-950 shadow-xs'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="font-bold text-xs">{t('wizard.noPref', 'No Preference')}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Dispatches nearest verified professional</div>
                  </button>

                  {/* 2. Female Professional */}
                  {(() => {
                    const isFemaleDisabled = isMaleCustomer;
                    return (
                      <button
                        type="button"
                        disabled={isFemaleDisabled}
                        onClick={() => !isFemaleDisabled && setGenderPreference('female')}
                        className={`p-3.5 rounded-2xl border text-left transition ${
                          isFemaleDisabled
                            ? 'bg-slate-100 border-slate-200 text-slate-400 opacity-60 cursor-not-allowed'
                            : genderPreference === 'female'
                            ? 'bg-emerald-50 border-emerald-600 text-emerald-950 shadow-xs cursor-pointer'
                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 cursor-pointer'
                        }`}
                      >
                        <div className="font-bold text-xs flex items-center justify-between">
                          <span>{t('wizard.femalePref', 'Female Professional')}</span>
                          {isFemaleDisabled && <span className="text-[10px] font-bold text-rose-500">Unavailable</span>}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {isFemaleDisabled
                            ? 'Based on your account preference, this option is unavailable.'
                            : 'Dispatches verified female artisan'}
                        </div>
                      </button>
                    );
                  })()}

                  {/* 3. Male Professional */}
                  {(() => {
                    const isMaleDisabled = isFemaleCustomer;
                    return (
                      <button
                        type="button"
                        disabled={isMaleDisabled}
                        onClick={() => !isMaleDisabled && setGenderPreference('male')}
                        className={`p-3.5 rounded-2xl border text-left transition ${
                          isMaleDisabled
                            ? 'bg-slate-100 border-slate-200 text-slate-400 opacity-60 cursor-not-allowed'
                            : genderPreference === 'male'
                            ? 'bg-emerald-50 border-emerald-600 text-emerald-950 shadow-xs cursor-pointer'
                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 cursor-pointer'
                        }`}
                      >
                        <div className="font-bold text-xs flex items-center justify-between">
                          <span>{t('wizard.malePref', 'Male Professional')}</span>
                          {isMaleDisabled && <span className="text-[10px] font-bold text-rose-500">Unavailable</span>}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {isMaleDisabled
                            ? 'Based on your account preference, this option is unavailable.'
                            : 'Dispatches verified male artisan'}
                        </div>
                      </button>
                    );
                  })()}

                </div>
              </div>
            )}

            {/* Additional Notes */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                {t('wizard.notesLabel', 'Special Instructions / Access Details (Optional)')}
              </label>
              <textarea
                rows={3}
                value={additionalDetails}
                onChange={(e) => setAdditionalDetails(e.target.value)}
                placeholder={t('wizard.notesPlaceholder', 'e.g. Ring doorbell twice, lift available, dog at home...')}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* STEP 6: ESCROW / PAYMENT CONFIRMATION */}
        {currentStep === 6 && (
          <div className="space-y-6 animate-in fade-in">
            <div>
              <h2 className="text-lg font-black text-slate-900">{t('wizard.step6Title', 'Escrow Payment & Review')}</h2>
              <p className="text-xs text-slate-500 mt-0.5">Review your configured tasks and lock payment securely in cooperative escrow.</p>
            </div>

            {/* Task Itemization Breakdown */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">Selected Tasks & Pricing Breakdown</div>
              
              <div className="space-y-2 border-y border-slate-200 py-3">
                {selectedProblems.map((probId) => {
                  const opt = service.problemOptions.find((p) => p.id === probId);
                  const price = opt?.price || service.baseRate;
                  return (
                    <div key={probId} className="flex items-center justify-between text-xs">
                      <span className="text-slate-700 font-semibold">{t(opt?.labelKey || probId, probId)}</span>
                      <span className="text-slate-900 font-black">₹{price}</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-sm font-extrabold text-slate-900">Total Task Price</span>
                <span className="text-xl font-black text-emerald-700">₹{currentTotalAmount}</span>
              </div>
            </div>

            {/* Escrow Guarantee Banner */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="text-xs font-extrabold text-emerald-950">100% Escrow Protection Guarantee</div>
                <p className="text-xs text-emerald-800">
                  {t('wizard.escrowProtected', 'Your ₹' + currentTotalAmount + ' payment is held safely in escrow. It will only be transferred to the artisan once the service is completed to your satisfaction.')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Actions Footer */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrevStep}
              className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition cursor-pointer"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {currentStep < 6 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold shadow-md shadow-emerald-900/10 transition flex items-center gap-2 cursor-pointer hover:scale-101"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmitRequest}
              className="px-8 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black shadow-lg shadow-emerald-900/20 transition flex items-center gap-2 cursor-pointer hover:scale-101 disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>{isSubmitting ? 'Creating Request...' : `Confirm & Lock ₹${currentTotalAmount} in Escrow`}</span>
            </button>
          )}
        </div>

      </div>

      {/* Reusable Add/Edit Address Form Modal */}
      <AddressFormModal
        isOpen={isAddressModalOpen}
        onClose={() => {
          setIsAddressModalOpen(false);
          setEditingAddress(null);
        }}
        editingAddress={editingAddress}
        userId={currentUser?.id}
        defaultFullName={currentUser?.name}
        defaultPhone={currentUser?.phone}
        onAddressSaved={async (saved) => {
          await loadAddresses();
          setSelectedAddressId(saved.id);
        }}
      />

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl max-w-sm w-full space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Leave Booking?</h3>
              <p className="text-xs text-slate-500 mt-1">You have entered details for this booking that will be discarded if you leave now.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                Stay Here
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowExitConfirm(false);
                  onBackToServices();
                }}
                className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer shadow-sm"
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
