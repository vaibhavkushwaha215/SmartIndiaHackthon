import React, { useState } from 'react';
import { Worker } from '../../shared/types';
import { db } from '../../shared/services/database';
import { logger } from '../../shared/services/logger';
import { useToast } from '../../shared/components/Toast';
import { ERROR_CODES } from '../../shared/constants/error-codes';
import { User, ShieldCheck, MapPin, Wrench, Save, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface WorkerProfileFormProps {
  worker: Worker;
  onProfileUpdated: (updated: Worker) => void;
}

export const WorkerProfileForm: React.FC<WorkerProfileFormProps> = ({ worker, onProfileUpdated }) => {
  const { t } = useTranslation();
  const { showSuccess, showError } = useToast();

  const [name, setName] = useState(worker.name || '');
  const [cooperativeId, setCooperativeId] = useState(worker.cooperative_id || '');
  const [skill, setSkill] = useState(worker.skill || '');
  const [area, setArea] = useState(worker.area || '');
  const [hourlyRate, setHourlyRate] = useState(worker.hourly_rate || 299);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);

    // Validation (Code 400)
    if (!name.trim() || !cooperativeId.trim() || !skill.trim() || !area.trim()) {
      showError(ERROR_CODES.BAD_REQUEST, 'Please fill all required profile fields');
      setIsSaving(false);
      return;
    }

    // Tariff bounds check (Code 405)
    const rateNum = Number(hourlyRate);
    if (isNaN(rateNum) || rateNum < 100 || rateNum > 2000) {
      showError(ERROR_CODES.INVALID_TARIFF_AMOUNT, 'Cooperative tariff must be between ₹100 and ₹2,000 / hour');
      setIsSaving(false);
      return;
    }

    try {
      const updated = await db.updateWorker(worker.id, {
        name: name.trim(),
        cooperative_id: cooperativeId.trim(),
        skill: skill.trim(),
        area: area.trim(),
        hourly_rate: rateNum,
      });

      await logger.log({
        action: 'WORKER_PROFILE_UPDATED',
        userId: worker.user_id,
        resultCode: 200,
        details: `Worker ${worker.name} updated profile details (Area: ${area}, Skill: ${skill})`,
      });

      showSuccess(t('worker.save_profile', 'Cooperative profile updated successfully!'));
      setSavedSuccess(true);
      onProfileUpdated(updated);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      showError(err.code || ERROR_CODES.SERVER_ERROR, err.message);
      await logger.logError('WORKER_PROFILE_UPDATE_FAILED', err, worker.user_id);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-600" />
            <span>{t('worker.profile_section', 'Cooperative Profile & Credentials')}</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Keep your operational zone, skills, and cooperative ID updated for client allocation.
          </p>
        </div>

        {savedSuccess && (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            <Check className="w-3.5 h-3.5" /> Saved
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Worker Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
            Worker Full Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        {/* Cooperative ID */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            {t('worker.cooperative_id', 'Cooperative Affiliation ID')}
          </label>
          <input
            type="text"
            required
            value={cooperativeId}
            onChange={(e) => setCooperativeId(e.target.value)}
            placeholder="e.g. COOP-DL-804 (Delhi Vidyut Sahyog)"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        {/* Operational Area */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-indigo-600" />
            {t('worker.area_coverage', 'Operational Area')}
          </label>
          <input
            type="text"
            required
            value={area}
            onChange={(e) => setArea(e.target.value)}
            placeholder="e.g. Lajpat Nagar & South Delhi"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        {/* Standard Hourly Tariff */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
            Standard Cooperative Tariff (₹ / hr)
          </label>
          <input
            type="number"
            required
            min={150}
            max={999}
            value={hourlyRate}
            onChange={(e) => setHourlyRate(Number(e.target.value))}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Skills & Specialties */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1 flex items-center gap-1">
          <Wrench className="w-3.5 h-3.5 text-emerald-600" />
          {t('worker.skill_title', 'Primary Skills & Specialties')}
        </label>
        <textarea
          required
          rows={2}
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
          placeholder="e.g. Master Electrician • MCB, Short Circuit, Inverter & Earthing Specialist"
          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isSaving}
          className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : t('worker.save_profile', 'Save Changes')}</span>
        </button>
      </div>
    </form>
  );
};
