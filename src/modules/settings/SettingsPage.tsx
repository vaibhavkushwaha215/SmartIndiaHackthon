import React, { useState } from 'react';
import { useAuth } from '../auth';
import { useToast } from '../../shared/components/Toast';
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
  ShieldCheck,
  Phone,
  Mail,
  Palette,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SavedAddress {
  id: string;
  tag: string; // e.g. "My Home", "Mom's Place", "Office"
  recipientName: string;
  recipientPhone: string;
  fullAddress: string;
  isDefault?: boolean;
}

export const SettingsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { currentUser, updateLanguage } = useAuth();
  const { showSuccess, showError } = useToast();

  const isHindi = i18n.language === 'hi';
  const [activeTab, setActiveTab] = useState<'language' | 'profile' | 'addresses' | 'support'>('language');

  // 1. User Profile State
  const [userName, setUserName] = useState(currentUser?.name || 'Ramesh Kumar');
  const [userPhone, setUserPhone] = useState(currentUser?.phone || '9876543210');
  const [userEmail, setUserEmail] = useState('ramesh.kumar@example.com');
  const [passwordVerification, setPasswordVerification] = useState('');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // 2. Saved Addresses State
  const [addresses, setAddresses] = useState<SavedAddress[]>([
    {
      id: 'addr-1',
      tag: 'My Home',
      recipientName: 'Ramesh Kumar',
      recipientPhone: '9876543210',
      fullAddress: 'Flat 402, Block B, Green Park Apartments, Lajpat Nagar, Delhi',
      isDefault: true,
    },
    {
      id: 'addr-2',
      tag: "Mom's House",
      recipientName: 'Shanti Devi (Mother)',
      recipientPhone: '9811223344',
      fullAddress: 'House 14, Sector 7, Dwarka, New Delhi',
      isDefault: false,
    },
  ]);

  const [newAddrTag, setNewAddrTag] = useState('');
  const [newRecipientName, setNewRecipientName] = useState('');
  const [newRecipientPhone, setNewRecipientPhone] = useState('');
  const [newFullAddress, setNewFullAddress] = useState('');
  const [isAddingAddress, setIsAddingAddress] = useState(false);

  // 3. Technical Support Ticket State
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketPhone, setTicketPhone] = useState(currentUser?.phone || '');
  const [ticketEmail, setTicketEmail] = useState('ramesh.kumar@example.com');
  const [ticketDetails, setTicketDetails] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordVerification) {
      showError(401, 'Please enter your account password to confirm sensitive changes.');
      return;
    }
    showSuccess('User settings updated successfully!');
    setPasswordVerification('');
    setIsPasswordModalOpen(false);
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrTag || !newFullAddress) return;

    const newAddr: SavedAddress = {
      id: `addr-${Date.now()}`,
      tag: newAddrTag.trim(),
      recipientName: newRecipientName.trim() || userName,
      recipientPhone: newRecipientPhone.trim() || userPhone,
      fullAddress: newFullAddress.trim(),
      isDefault: addresses.length === 0,
    };

    setAddresses([...addresses, newAddr]);
    setNewAddrTag('');
    setNewRecipientName('');
    setNewRecipientPhone('');
    setNewFullAddress('');
    setIsAddingAddress(false);
    showSuccess('Address added to your address book!');
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses(addresses.filter((a) => a.id !== id));
    showSuccess('Address removed.');
  };

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const ticketId = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
    showSuccess(`Support Ticket #${ticketId} created! Our technical engineer will call you within 30 minutes.`);
    setTicketSubject('');
    setTicketDetails('');
    setUploadedFileName(null);
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => updateLanguage('en')}
                  className={`p-4 rounded-2xl border text-left transition flex items-center justify-between cursor-pointer ${
                    !isHindi ? 'border-emerald-600 bg-emerald-50/50 shadow-xs' : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="font-bold text-sm text-slate-900">English (EN)</div>
                    <div className="text-xs text-slate-500">Standard English Interface</div>
                  </div>
                  {!isHindi && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                </button>

                <button
                  onClick={() => updateLanguage('hi')}
                  className={`p-4 rounded-2xl border text-left transition flex items-center justify-between cursor-pointer ${
                    isHindi ? 'border-emerald-600 bg-emerald-50/50 shadow-xs' : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <div className="font-bold text-sm text-slate-900">हिंदी (HI)</div>
                    <div className="text-xs text-slate-500">सहयोग सेवा हिंदी इंटरफ़ेस</div>
                  </div>
                  {isHindi && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                </button>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-indigo-600" />
                  Visual Theme
                </h4>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 flex items-center justify-between">
                  <span>Cooperative Forest Emerald (Default Accessible)</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">Active</span>
                </div>
              </div>
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm"
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm"
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
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-700/20"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: Address Management (Custom Recipient & Phone per Address) */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Saved Address Book</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Save addresses with unique phone numbers and recipient tags (e.g. for Mom's house).
                  </p>
                </div>

                <button
                  onClick={() => setIsAddingAddress(!isAddingAddress)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Address</span>
                </button>
              </div>

              {/* Add Address Form */}
              {isAddingAddress && (
                <form onSubmit={handleAddAddress} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="font-bold text-xs text-slate-900 uppercase">New Address Details</div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Address Name Tag</label>
                      <input
                        type="text"
                        required
                        value={newAddrTag}
                        onChange={(e) => setNewAddrTag(e.target.value)}
                        placeholder="e.g. Mom's House / Office"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Recipient Name</label>
                      <input
                        type="text"
                        value={newRecipientName}
                        onChange={(e) => setNewRecipientName(e.target.value)}
                        placeholder="e.g. Shanti Devi (Mother)"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Contact Phone</label>
                      <input
                        type="tel"
                        maxLength={10}
                        value={newRecipientPhone}
                        onChange={(e) => setNewRecipientPhone(e.target.value)}
                        placeholder="e.g. 9811223344"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Complete Street Address</label>
                    <textarea
                      required
                      rows={2}
                      value={newFullAddress}
                      onChange={(e) => setNewFullAddress(e.target.value)}
                      placeholder="Flat no, building, street, sector, landmark..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingAddress(false)}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                    >
                      Save Address
                    </button>
                  </div>
                </form>
              )}

              {/* Address Cards List */}
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <div key={addr.id} className="p-4 rounded-2xl border border-slate-200 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{addr.tag}</span>
                        {addr.isDefault && (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.2 rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 font-medium">
                        Recipient: <strong>{addr.recipientName}</strong> • Phone: <span className="font-mono">{addr.recipientPhone}</span>
                      </div>
                      <p className="text-xs text-slate-700">{addr.fullAddress}</p>
                    </div>

                    <button
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition"
                      title="Delete Address"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Technical Issues & Support Ticket */}
          {activeTab === 'support' && (
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
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={ticketEmail}
                      onChange={(e) => setTicketEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm"
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
                          setUploadedFileName(e.target.files[0].name);
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
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-700/20 flex items-center gap-2"
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