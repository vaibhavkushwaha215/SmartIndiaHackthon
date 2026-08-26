import React, { useState, useEffect } from 'react';
import { SavedAddress, AddressType } from '../types';
import { db } from '../services/database';
import { useToast } from './Toast';
import { ERROR_CODES } from '../constants/error-codes';
import { X, Plus, Pencil, ChevronDown, MapPin, Building2, Home, Briefcase, MoreHorizontal } from 'lucide-react';
import { useI18n } from '../../modules/i18n';

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan',
  'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal',
  'Andaman & Nicobar Islands', 'Chandigarh', 'Dadra & Nagar Haveli and Daman & Diu',
  'Jammu & Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

interface AddressFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddressSaved: (address: SavedAddress) => void;
  editingAddress?: SavedAddress | null;
  userId?: string;
  defaultFullName?: string;
  defaultPhone?: string;
}

export const AddressFormModal: React.FC<AddressFormModalProps> = ({
  isOpen,
  onClose,
  onAddressSaved,
  editingAddress,
  userId,
  defaultFullName = '',
  defaultPhone = '',
}) => {
  const { t } = useI18n();
  const { showSuccess, showError } = useToast();

  const [addrTag, setAddrTag] = useState('Home');
  const [addrFullName, setAddrFullName] = useState(defaultFullName);
  const [addrMobile, setAddrMobile] = useState(defaultPhone);
  const [addrPincode, setAddrPincode] = useState('');
  const [addrFlat, setAddrFlat] = useState('');
  const [addrArea, setAddrArea] = useState('');
  const [addrLandmark, setAddrLandmark] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('Delhi');
  const [addrIsDefault, setAddrIsDefault] = useState(false);
  const [addrType, setAddrType] = useState<AddressType>('House');
  const [addrInstructions, setAddrInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingAddress) {
      setAddrTag(editingAddress.tag || 'Home');
      setAddrFullName(editingAddress.fullName || defaultFullName);
      setAddrMobile(editingAddress.mobileNumber || defaultPhone);
      setAddrPincode(editingAddress.pincode || '');
      setAddrFlat(editingAddress.flat || '');
      setAddrArea(editingAddress.area || '');
      setAddrLandmark(editingAddress.landmark || '');
      setAddrCity(editingAddress.city || '');
      setAddrState(editingAddress.state || 'Delhi');
      setAddrIsDefault(editingAddress.isDefault || false);
      setAddrType(editingAddress.addressType || 'House');
      setAddrInstructions(editingAddress.deliveryInstructions || '');
    } else {
      setAddrTag('Home');
      setAddrFullName(defaultFullName);
      setAddrMobile(defaultPhone);
      setAddrPincode('');
      setAddrFlat('');
      setAddrArea('');
      setAddrLandmark('');
      setAddrCity('');
      setAddrState('Delhi');
      setAddrIsDefault(false);
      setAddrType('House');
      setAddrInstructions('');
    }
  }, [editingAddress, defaultFullName, defaultPhone, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!addrFullName.trim() || !addrMobile.trim() || !addrPincode.trim() || !addrFlat.trim() || !addrArea.trim() || !addrCity.trim() || !addrState.trim()) {
      showError(ERROR_CODES.BAD_REQUEST, 'Please fill in all required address fields.');
      return;
    }

    if (!/^\d{6}$/.test(addrPincode.trim())) {
      showError(ERROR_CODES.INVALID_PINCODE, 'Pincode must be exactly 6 digits.');
      return;
    }

    if (addrMobile.trim().length < 10) {
      showError(ERROR_CODES.BAD_REQUEST, 'Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingAddress) {
        const updated: SavedAddress = {
          ...editingAddress,
          tag: addrTag.trim() || 'Home',
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
        };
        const saved = await db.updateAddress(updated);
        showSuccess('Address updated successfully!');
        onAddressSaved(saved);
        onClose();
      } else {
        const newAddr: Omit<SavedAddress, 'id'> = {
          user_id: userId,
          tag: addrTag.trim() || 'Home',
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
        };
        const saved = await db.saveAddress(newAddr);
        showSuccess('Address added to your address book!');
        onAddressSaved(saved);
        onClose();
      }
    } catch (err: any) {
      showError(err.code || ERROR_CODES.SERVER_ERROR, err.message || 'Failed to save address.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              {editingAddress ? <Pencil className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">
                {editingAddress ? t('address.editTitle', 'Edit Service Address') : t('address.addTitle', 'Add New Service Address')}
              </h3>
              <p className="text-[11px] text-slate-500">Exact address used for doorstep artisan dispatch</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Address Tag Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
              Address Label / Tag
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { tag: 'Home', icon: Home },
                { tag: 'Apartment', icon: Building2 },
                { tag: 'Office', icon: Briefcase },
                { tag: 'Other', icon: MoreHorizontal },
              ].map(({ tag, icon: Icon }) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setAddrTag(tag)}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    addrTag === tag
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-800'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tag}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Full Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={addrFullName}
                onChange={(e) => setAddrFullName(e.target.value)}
                placeholder="Recipient / Customer name"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                10-Digit Mobile <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                maxLength={10}
                value={addrMobile}
                onChange={(e) => setAddrMobile(e.target.value.replace(/\D/g, ''))}
                placeholder="9876543210"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 text-slate-900 font-mono focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Flat / Building */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Flat, House No., Building, Apartment <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={addrFlat}
              onChange={(e) => setAddrFlat(e.target.value)}
              placeholder="e.g. Flat 302, Tower B, Palm Heights"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
          </div>

          {/* Area / Street & Pincode */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Area, Street, Sector <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={addrArea}
                onChange={(e) => setAddrArea(e.target.value)}
                placeholder="e.g. Sector 18 / Indiranagar"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                6-Digit PIN <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={addrPincode}
                onChange={(e) => setAddrPincode(e.target.value.replace(/\D/g, ''))}
                placeholder="110024"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 text-slate-900 font-mono focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Landmark */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Landmark (Optional)
            </label>
            <input
              type="text"
              value={addrLandmark}
              onChange={(e) => setAddrLandmark(e.target.value)}
              placeholder="e.g. Near Metro Station / Behind Central Bank"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
          </div>

          {/* City & State */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                City / Town <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={addrCity}
                onChange={(e) => setAddrCity(e.target.value)}
                placeholder="e.g. Bengaluru / New Delhi"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                State <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  required
                  value={addrState}
                  onChange={(e) => setAddrState(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 text-slate-900 appearance-none focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none cursor-pointer"
                >
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : editingAddress ? 'Update Address' : 'Save Address'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
