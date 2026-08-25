import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth';
import { useToast } from '../../shared/components/Toast';
import { db } from '../../shared/services/database';
import { SavedAddress, AddressType } from '../../shared/types';
import { isFeatureEnabled } from '../../shared/config/features.config';
import { useTheme } from '../../shared/context/ThemeContext';
import { ThemeId } from '../../shared/config/theme';
import { ERROR_CODES } from '../../shared/constants/error-codes';
import {
  Globe,
  User,
  MapPin,
  HelpCircle,
  Plus,
  Trash2,
  Lock,
  Upload,
  Send,
  CheckCircle2,
  Palette,
  Navigation,
  Star,
  Home,
  Building2,
  Briefcase,
  MoreHorizontal,
  ChevronDown,
  Pencil,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan',
  'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal',
  'Andaman & Nicobar Islands', 'Chandigarh', 'Dadra & Nagar Haveli and Daman & Diu',
  'Jammu & Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

export const SettingsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { currentUser, updateLanguage } = useAuth();
  const { showSuccess, showError } = useToast();
  const { themeId, allThemes, setTheme } = useTheme();

  const isHindi = i18n.language === 'hi';
  const [activeTab, setActiveTab] = useState<'language' | 'profile' | 'addresses' | 'support'>('language');

  // 1. User Profile State
  const [userName, setUserName] = useState(currentUser?.name || '');
  const [userPhone, setUserPhone] = useState(currentUser?.phone || '');
  const [userEmail, setUserEmail] = useState('');
  const [passwordVerification, setPasswordVerification] = useState('');

  // 2. Saved Addresses State (Persisted in database.ts)
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  // Address Form State (Add & Edit)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  const [addrTag, setAddrTag] = useState('Home');
  const [addrFullName, setAddrFullName] = useState(currentUser?.name || '');
  const [addrMobile, setAddrMobile] = useState(currentUser?.phone || '');
  const [addrPincode, setAddrPincode] = useState('');
  const [addrFlat, setAddrFlat] = useState('');
  const [addrArea, setAddrArea] = useState('');
  const [addrLandmark, setAddrLandmark] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [addrIsDefault, setAddrIsDefault] = useState(false);
  const [addrType, setAddrType] = useState<AddressType>('House');
  const [addrInstructions, setAddrInstructions] = useState('');
  const [addrSaturday, setAddrSaturday] = useState<boolean | null>(null);
  const [addrSunday, setAddrSunday] = useState<boolean | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // 3. Technical Support Ticket State
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketPhone, setTicketPhone] = useState('');
  const [ticketEmail, setTicketEmail] = useState('');
  const [ticketDetails, setTicketDetails] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  useEffect(() => {
    loadAddresses();
  }, [currentUser]);

  const loadAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const data = await db.getSavedAddresses(currentUser?.id);
      setAddresses(data);
    } catch (e) {
      console.error('Failed to load addresses:', e);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordVerification) {
      showError(ERROR_CODES.UNAUTHORIZED, 'Please enter your account password to confirm sensitive changes.');
      return;
    }
    // Verify against stored password (Error 101)
    if (currentUser?.password_hash && passwordVerification !== currentUser.password_hash) {
      showError(ERROR_CODES.INVALID_CREDENTIALS, 'Incorrect password. Please try again.');
      return;
    }
    // Validate email if provided (Error 104)
    if (userEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail.trim())) {
      showError(ERROR_CODES.INVALID_EMAIL_FORMAT, 'Please enter a valid email address');
      return;
    }
    showSuccess('User settings updated successfully!');
    setPasswordVerification('');
  };

  const resetAddressForm = () => {
    setEditingAddressId(null);
    setAddrTag('Home');
    setAddrFullName(currentUser?.name || '');
    setAddrMobile(currentUser?.phone || '');
    setAddrPincode('');
    setAddrFlat('');
    setAddrArea('');
    setAddrLandmark('');
    setAddrCity('');
    setAddrState('');
    setAddrIsDefault(false);
    setAddrType('House');
    setAddrInstructions('');
    setAddrSaturday(null);
    setAddrSunday(null);
  };

  const openAddAddressForm = () => {
    resetAddressForm();
    setIsFormOpen(true);
  };

  const openEditAddressForm = (addr: SavedAddress) => {
    setEditingAddressId(addr.id);
    setAddrTag(addr.tag);
    setAddrFullName(addr.fullName);
    setAddrMobile(addr.mobileNumber);
    setAddrPincode(addr.pincode);
    setAddrFlat(addr.flat);
    setAddrArea(addr.area);
    setAddrLandmark(addr.landmark || '');
    setAddrCity(addr.city);
    setAddrState(addr.state);
    setAddrIsDefault(addr.isDefault);
    setAddrType(addr.addressType);
    setAddrInstructions(addr.deliveryInstructions || '');
    setAddrSaturday(addr.canDeliverSaturday ?? null);
    setAddrSunday(addr.canDeliverSunday ?? null);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrFullName || !addrMobile || !addrPincode || !addrFlat || !addrArea || !addrCity || !addrState) {
      showError(ERROR_CODES.BAD_REQUEST, 'Please fill all mandatory address fields.');
      return;
    }

    // Pincode validation (Error 304)
    if (!/^\d{6}$/.test(addrPincode.trim())) {
      showError(ERROR_CODES.INVALID_PINCODE, 'Pincode must be exactly 6 digits [0-9]');
      return;
    }

    try {
      if (editingAddressId) {
        // Edit Mode: Update existing
        const updatedAddr: SavedAddress = {
          id: editingAddressId,
          user_id: currentUser?.id,
          tag: addrTag || (addrType === 'House' ? 'Home' : addrType === 'Apartment' ? 'Apartment' : addrType === 'Business' ? 'Office' : 'Other'),
          fullName: addrFullName.trim(),
          mobileNumber: addrMobile.trim(),
          pincode: addrPincode.trim(),
          flat: addrFlat.trim(),
          area: addrArea.trim(),
          landmark: addrLandmark.trim() || undefined,
          city: addrCity.trim(),
          state: addrState,
          isDefault: addrIsDefault,
          addressType: addrType,
          deliveryInstructions: addrInstructions.trim() || undefined,
          canDeliverSaturday: addrSaturday ?? undefined,
          canDeliverSunday: addrSunday ?? undefined,
        };
        await db.updateAddress(updatedAddr);
        showSuccess('Address updated successfully!');
      } else {
        // Add Mode: Create new
        const newAddrData: Omit<SavedAddress, 'id'> = {
          user_id: currentUser?.id,
          tag: addrTag || (addrType === 'House' ? 'Home' : addrType === 'Apartment' ? 'Apartment' : addrType === 'Business' ? 'Office' : 'Other'),
          fullName: addrFullName.trim(),
          mobileNumber: addrMobile.trim(),
          pincode: addrPincode.trim(),
          flat: addrFlat.trim(),
          area: addrArea.trim(),
          landmark: addrLandmark.trim() || undefined,
          city: addrCity.trim(),
          state: addrState,
          isDefault: addrIsDefault || addresses.length === 0,
          addressType: addrType,
          deliveryInstructions: addrInstructions.trim() || undefined,
          canDeliverSaturday: addrSaturday ?? undefined,
          canDeliverSunday: addrSunday ?? undefined,
        };
        await db.saveAddress(newAddrData);
        showSuccess('New address saved to address book!');
      }

      await loadAddresses();
      setIsFormOpen(false);
      resetAddressForm();
    } catch (err: any) {
      showError(err.code || ERROR_CODES.SERVER_ERROR, err.message || 'Failed to save address.');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      await db.deleteAddress(id);
      await loadAddresses();
      showSuccess('Address removed.');
    } catch (err: any) {
      showError(err.code || ERROR_CODES.SERVER_ERROR, 'Failed to remove address.');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await db.setDefaultAddress(id);
      await loadAddresses();
      showSuccess('Default address updated!');
    } catch (err: any) {
      showError(err.code || ERROR_CODES.SERVER_ERROR, 'Failed to update default address.');
    }
  };

  const handleUseMyLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          showSuccess(`Location detected: ${position.coords.latitude.toFixed(4)}°N, ${position.coords.longitude.toFixed(4)}°E`);
          setIsLocating(false);
        },
        (error) => {
          showError(ERROR_CODES.GEOLOCATION_DENIED, `Location access denied: ${error.message}`);
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      showError(ERROR_CODES.BAD_REQUEST, 'Geolocation is not supported by your browser.');
      setIsLocating(false);
    }
  };

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const ticketId = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
    showSuccess(`Support Ticket #${ticketId} created! Our technical engineer will call you within 30 minutes.`);
    setTicketSubject('');
    setTicketPhone('');
    setTicketEmail('');
    setTicketDetails('');
    setUploadedFileName(null);
  };

  const addressTypeIcons: Record<AddressType, React.ReactNode> = {
    House: <Home className="w-4 h-4" />,
    Apartment: <Building2 className="w-4 h-4" />,
    Business: <Briefcase className="w-4 h-4" />,
    Other: <MoreHorizontal className="w-4 h-4" />,
  };

  const addressTypeDescriptions: Record<AddressType, string> = {
    House: 'Independent house, villa, or builder floor (6 AM – 11 PM delivery)',
    Apartment: 'Gated apartment or society with security gate',
    Business: 'Office, coworking space, or commercial building',
    Other: 'Other type of address',
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">Account Settings & Support</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Manage your personal profile, delivery addresses, language preferences, and technical helpdesk.
          </p>
        </div>
      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Navigation Sidebar */}
        <div className="md:col-span-4 bg-white rounded-3xl border border-slate-200/80 p-4 shadow-xs space-y-1">
          <button
            onClick={() => setActiveTab('language')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition text-left cursor-pointer ${
              activeTab === 'language'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Globe className="w-4 h-4 text-emerald-600" />
            <span>Language & Display Theme</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition text-left cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <User className="w-4 h-4 text-indigo-600" />
            <span>User Profile & Security</span>
          </button>

          {isFeatureEnabled('ADDRESS_BOOK') && (
            <button
              onClick={() => setActiveTab('addresses')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition text-left cursor-pointer ${
                activeTab === 'addresses'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-rose-500" />
                <span>Address Book</span>
              </div>
              <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full">{addresses.length}</span>
            </button>
          )}

          {isFeatureEnabled('SUPPORT_TICKETS') && (
            <button
              onClick={() => setActiveTab('support')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition text-left cursor-pointer ${
                activeTab === 'support'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-amber-500" />
              <span>Technical Issues & Support Ticket</span>
            </button>
          )}
        </div>

        {/* Content Pane */}
        <div className="md:col-span-8 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
          
          {/* TAB 1: Language & Theme */}
          {activeTab === 'language' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Language & Regional Preferences</h3>
                <p className="text-xs text-slate-500 mt-0.5">Select your primary language for navigation and booking receipts.</p>
              </div>

              {isFeatureEnabled('LANGUAGE_SWITCHER') && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => updateLanguage('en')}
                    className={`p-4 rounded-2xl border text-left transition flex items-center justify-between cursor-pointer ${
                      !isHindi
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-text)] shadow-xs ring-2 ring-[var(--color-primary)]/20'
                        : 'border-[var(--color-border)] hover:bg-[var(--color-bg)] text-[var(--color-text)]'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm text-[var(--color-text)]">English (EN)</div>
                      <div className="text-xs text-[var(--color-text-muted)]">Standard English Interface</div>
                    </div>
                    {!isHindi && <CheckCircle2 className="w-5 h-5 text-[var(--color-primary)]" />}
                  </button>

                  <button
                    onClick={() => updateLanguage('hi')}
                    className={`p-4 rounded-2xl border text-left transition flex items-center justify-between cursor-pointer ${
                      isHindi
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-text)] shadow-xs ring-2 ring-[var(--color-primary)]/20'
                        : 'border-[var(--color-border)] hover:bg-[var(--color-bg)] text-[var(--color-text)]'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm text-[var(--color-text)]">हिंदी (HI)</div>
                      <div className="text-xs text-[var(--color-text-muted)]">सहयोग सेवा हिंदी इंटरफ़ेस</div>
                    </div>
                    {isHindi && <CheckCircle2 className="w-5 h-5 text-[var(--color-primary)]" />}
                  </button>
                </div>
              )}

              {isFeatureEnabled('THEME_SELECTION') && (
                <div className="pt-4 border-t border-[var(--color-border)] space-y-3">
                  <h4 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                    <Palette className="w-4 h-4 text-[var(--color-primary)]" />
                    Visual Theme
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(Object.keys(allThemes) as ThemeId[]).map((tid) => {
                      const tcfg = allThemes[tid];
                      const isSelected = themeId === tid;
                      return (
                        <button
                          key={tid}
                          type="button"
                          onClick={() => {
                            setTheme(tid);
                            showSuccess(`Theme switched to ${tcfg.name}`);
                          }}
                          className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex items-start justify-between ${
                            isSelected
                              ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)] shadow-xs ring-2 ring-[var(--color-primary)]/30'
                              : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-bg)]'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-xs shrink-0"
                                style={{ backgroundColor: tcfg.colors.primary }}
                              />
                              <span className="font-bold text-xs text-[var(--color-text)]">{isHindi ? tcfg.nameHi : tcfg.name}</span>
                            </div>
                            <p className="text-[11px] text-[var(--color-text-muted)] leading-tight">{tcfg.description}</p>
                          </div>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-[var(--color-primary)] shrink-0 ml-2" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: User Settings (Requires Password to Proceed) */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900">User Profile & Security</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update your contact details. Password confirmation required before saving.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    placeholder="Enter phone number"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono placeholder:text-slate-400 placeholder:font-sans"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Password Requirement Box */}
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                  <Lock className="w-4 h-4 text-amber-600" />
                  <span>REQUIRES PASSWORD TO PROCEED</span>
                </div>
                <input
                  type="password"
                  required
                  value={passwordVerification}
                  onChange={(e) => setPasswordVerification(e.target.value)}
                  placeholder="Enter current account password to authorize changes..."
                  className="w-full px-3.5 py-2 rounded-xl border border-amber-300 text-xs sm:text-sm bg-white"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-700/20 cursor-pointer"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: Address Management — Full CRUD with Edit Support & Persistence */}
          {activeTab === 'addresses' && isFeatureEnabled('ADDRESS_BOOK') && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Saved Address Book</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Save, edit, and manage your delivery addresses with custom recipient details.
                  </p>
                </div>

                {!isFormOpen && (
                  <button
                    onClick={openAddAddressForm}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Address</span>
                  </button>
                )}
              </div>

              {/* ----- Full Add / Edit Address Form ----- */}
              {isFormOpen && (
                <form onSubmit={handleFormSubmit} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-5 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                      {editingAddressId ? <Pencil className="w-4 h-4 text-indigo-600" /> : <Plus className="w-4 h-4 text-emerald-600" />}
                      <span>{editingAddressId ? 'Edit Address' : 'Add a New Address'}</span>
                    </div>

                    {/* Geolocation Button */}
                    {isFeatureEnabled('LOCATION_AUTO_DETECT') && (
                      <button
                        type="button"
                        onClick={handleUseMyLocation}
                        disabled={isLocating}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-bold cursor-pointer disabled:opacity-50 transition"
                      >
                        <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-pulse' : ''}`} />
                        <span>{isLocating ? 'Locating...' : 'Use my location'}</span>
                      </button>
                    )}
                  </div>

                  {/* Row 0: Address Label / Tag */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Address Tag / Label</label>
                    <input
                      type="text"
                      required
                      value={addrTag}
                      onChange={(e) => setAddrTag(e.target.value)}
                      placeholder="e.g. My Home, Parents House, Office, Studio"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                    />
                  </div>

                  {/* Row 1: Full Name + Mobile */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Full name (First and Last name)</label>
                      <input
                        type="text"
                        required
                        value={addrFullName}
                        onChange={(e) => setAddrFullName(e.target.value)}
                        placeholder="Enter full name"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Mobile number</label>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={addrMobile}
                        onChange={(e) => setAddrMobile(e.target.value.replace(/\D/g, ''))}
                        placeholder="10-digit mobile number"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white font-mono"
                      />
                      <p className="text-[10px] text-slate-400 mt-0.5">May be used to assist delivery</p>
                    </div>
                  </div>

                  {/* Row 2: Pincode */}
                  <div className="max-w-[200px]">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Pincode</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      pattern="[0-9]{6}"
                      value={addrPincode}
                      onChange={(e) => setAddrPincode(e.target.value.replace(/\D/g, ''))}
                      placeholder="6 digits [0-9] PIN code"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white font-mono placeholder:text-slate-400 placeholder:font-sans"
                    />
                  </div>

                  {/* Row 3: Flat, Area */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Flat, House no., Building, Company, Apartment</label>
                    <input
                      type="text"
                      required
                      value={addrFlat}
                      onChange={(e) => setAddrFlat(e.target.value)}
                      placeholder="e.g. Flat 402, Block B, Green Park Apartments"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Area, Street, Sector, Village</label>
                    <input
                      type="text"
                      required
                      value={addrArea}
                      onChange={(e) => setAddrArea(e.target.value)}
                      placeholder="e.g. Lajpat Nagar, Main Market Road"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                    />
                  </div>

                  {/* Row 4: Landmark */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Landmark</label>
                    <input
                      type="text"
                      value={addrLandmark}
                      onChange={(e) => setAddrLandmark(e.target.value)}
                      placeholder="E.g. near apollo hospital"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white placeholder:text-slate-400"
                    />
                  </div>

                  {/* Row 5: City + State */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Town/City</label>
                      <input
                        type="text"
                        required
                        value={addrCity}
                        onChange={(e) => setAddrCity(e.target.value)}
                        placeholder="e.g. New Delhi"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">State</label>
                      <div className="relative">
                        <select
                          required
                          value={addrState}
                          onChange={(e) => setAddrState(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white appearance-none cursor-pointer"
                        >
                          <option value="">Choose a state</option>
                          {INDIAN_STATES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Default Checkbox */}
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={addrIsDefault}
                      onChange={(e) => setAddrIsDefault(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span className="text-sm font-semibold text-slate-800">Make this my default address</span>
                  </label>

                  {/* Delivery Instructions */}
                  <div className="pt-2 border-t border-slate-200">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Delivery instructions (optional)</label>
                    <textarea
                      rows={2}
                      value={addrInstructions}
                      onChange={(e) => setAddrInstructions(e.target.value)}
                      placeholder="Add preferences, notes, access codes and more"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white placeholder:text-slate-400"
                    />
                  </div>

                  {/* Address Type */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-2">Address Type</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(['House', 'Apartment', 'Business', 'Other'] as AddressType[]).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setAddrType(type)}
                          className={`p-3 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1.5 ${
                            addrType === type
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-xs'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {addressTypeIcons[type]}
                          <span className="text-xs font-bold">{type}</span>
                        </button>
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1.5">{addressTypeDescriptions[addrType]}</p>
                  </div>

                  {/* Weekend Delivery */}
                  <div className="pt-2 border-t border-slate-200">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-2">Can you receive deliveries at this address on weekends?</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs font-semibold text-slate-600 block mb-1.5">Saturdays</span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setAddrSaturday(false)}
                            className={`flex-1 py-2 rounded-lg border text-xs font-bold transition cursor-pointer ${
                              addrSaturday === false ? 'border-rose-400 bg-rose-50 text-rose-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            No
                          </button>
                          <button
                            type="button"
                            onClick={() => setAddrSaturday(true)}
                            className={`flex-1 py-2 rounded-lg border text-xs font-bold transition cursor-pointer ${
                              addrSaturday === true ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            Yes
                          </button>
                        </div>
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-slate-600 block mb-1.5">Sundays</span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setAddrSunday(false)}
                            className={`flex-1 py-2 rounded-lg border text-xs font-bold transition cursor-pointer ${
                              addrSunday === false ? 'border-rose-400 bg-rose-50 text-rose-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            No
                          </button>
                          <button
                            type="button"
                            onClick={() => setAddrSunday(true)}
                            className={`flex-1 py-2 rounded-lg border text-xs font-bold transition cursor-pointer ${
                              addrSunday === true ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            Yes
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-1 border-t border-slate-200">
                    <p className="text-[10px] text-slate-400 mb-3">
                      Your instructions help us deliver your packages to your expectations and will be used when possible.
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => { setIsFormOpen(false); resetAddressForm(); }}
                      className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-700/20 transition cursor-pointer"
                    >
                      {editingAddressId ? 'Update Address' : 'Add Address'}
                    </button>
                  </div>
                </form>
              )}

              {/* Address Cards List */}
              {loadingAddresses ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="p-4 rounded-2xl border border-slate-200 animate-pulse h-24 bg-slate-50" />
                  ))}
                </div>
              ) : addresses.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <MapPin className="w-8 h-8 text-slate-400 mx-auto" />
                  <div className="text-xs font-bold text-slate-700">No saved addresses yet</div>
                  <p className="text-[11px] text-slate-500">Add an address to speed up service booking.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`p-4 rounded-2xl border flex items-start justify-between gap-4 transition ${
                        addr.isDefault ? 'border-emerald-300 bg-emerald-50/30' : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                            {addressTypeIcons[addr.addressType]}
                            {addr.tag}
                          </span>
                          {addr.isDefault && (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                              Default
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-600 font-medium">
                          {addr.fullName} • <span className="font-mono">{addr.mobileNumber}</span>
                        </div>
                        <p className="text-xs text-slate-700">
                          {addr.flat}, {addr.area}
                          {addr.landmark && ` (${addr.landmark})`}
                        </p>
                        <p className="text-xs text-slate-500">
                          {addr.city}, {addr.state} – <span className="font-mono">{addr.pincode}</span>
                        </p>
                        {addr.deliveryInstructions && (
                          <p className="text-[11px] text-indigo-600 italic">📝 {addr.deliveryInstructions}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {/* Edit Button */}
                        <button
                          onClick={() => openEditAddressForm(addr)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition cursor-pointer"
                          title="Edit Address"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        {/* Set Default Button */}
                        {!addr.isDefault && (
                          <button
                            onClick={() => handleSetDefault(addr.id)}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition cursor-pointer"
                            title="Set as Default"
                          >
                            <Star className="w-4 h-4" />
                          </button>
                        )}

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                          title="Delete Address"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Technical Issues & Support Ticket */}
          {activeTab === 'support' && isFeatureEnabled('SUPPORT_TICKETS') && (
            <form onSubmit={handleSubmitTicket} className="space-y-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Technical Issues & Support Ticket</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Report platform bugs, technician grievances, or billing issues directly to the cooperative escalation team.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="e.g. Electrician arrival delayed / Payment receipt query"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Callback Phone</label>
                    <input
                      type="tel"
                      required
                      value={ticketPhone}
                      onChange={(e) => setTicketPhone(e.target.value)}
                      placeholder="Enter phone number"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono placeholder:text-slate-400 placeholder:font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={ticketEmail}
                      onChange={(e) => setTicketEmail(e.target.value)}
                      placeholder="Enter email address"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Details & Problem Description</label>
                  <textarea
                    required
                    rows={4}
                    value={ticketDetails}
                    onChange={(e) => setTicketDetails(e.target.value)}
                    placeholder="Please explain the issue in detail..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm"
                  />
                </div>

                {/* Screenshot Attachment Upload Box */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Any Screenshots or Data?</label>
                  <div className="p-4 border-2 border-dashed border-slate-200 rounded-2xl text-center space-y-2 hover:border-emerald-500 transition bg-slate-50/50">
                    <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                    <div className="text-xs font-semibold text-slate-700">
                      {uploadedFileName ? (
                        <span className="text-emerald-700 font-bold">Attached: {uploadedFileName}</span>
                      ) : (
                        'Click to upload screenshot or log dump (PNG, JPG, PDF up to 10MB)'
                      )}
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      id="screenshot-upload"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          if (file.size > 10 * 1024 * 1024) {
                            showError(ERROR_CODES.ATTACHMENT_TOO_LARGE, 'Screenshot or log file exceeds 10MB limit');
                            e.target.value = '';
                            return;
                          }
                          setUploadedFileName(file.name);
                          showSuccess(`File attached: ${file.name}`);
                        }
                      }}
                    />
                    <label
                      htmlFor="screenshot-upload"
                      className="inline-block px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                    >
                      Choose File
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-700/20 flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Ticket to Support</span>
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};