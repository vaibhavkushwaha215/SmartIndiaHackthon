import React, { useState } from 'react';
import { FeatureKey, FeatureCategory, FeatureDefinition } from '../../shared/types';
import { useFeatureDefinitions } from '../../shared/config/features.config';
import { db } from '../../shared/services/database';
import { useAuth } from '../auth';
import { useToast } from '../../shared/components/Toast';
import {
  ToggleLeft,
  ToggleRight,
  Sparkles,
  Search,
  RotateCcw,
  Layers,
  Cpu,
  ShieldAlert,
  Wallet,
  MessageSquare,
  Filter,
  CheckCircle2,
  AlertCircle,
  Wrench,
} from 'lucide-react';

const CATEGORY_META: Record<
  FeatureCategory | 'all',
  { label: string; icon: React.FC<{ className?: string }> }
> = {
  all: { label: 'All Modules', icon: Layers },
  core: { label: 'Core System', icon: Layers },
  operations: { label: 'Operations & Dispatch', icon: Wrench },
  ai: { label: 'AI & Intelligence', icon: Cpu },
  finance: { label: 'Finance & Escrow', icon: Wallet },
  communication: { label: 'Communication & Alerts', icon: MessageSquare },
};

export const FeatureFlagsPanel: React.FC = () => {
  const { features, toggleFeature, resetToDefaults } = useFeatureDefinitions();
  const { currentUser } = useAuth();
  const { showSuccess, showWarning } = useToast();

  const [selectedCategory, setSelectedCategory] = useState<FeatureCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const enabledCount = features.filter((f) => f.enabled).length;

  const filteredFeatures = features.filter((f) => {
    const matchesCategory = selectedCategory === 'all' || f.category === selectedCategory;
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleToggle = async (key: FeatureKey, nextState: boolean) => {
    if (currentUser) {
      await toggleFeature(key, nextState, { id: currentUser.id, name: currentUser.name });
    } else {
      await toggleFeature(key, nextState);
    }

    if (nextState) {
      showSuccess(`Feature "${key}" is now ENABLED across the platform.`);
    } else {
      showWarning(`Feature "${key}" has been DISABLED. Active modules have adapted.`);
    }
  };

  const handleReset = async () => {
    if (currentUser) {
      await resetToDefaults({ id: currentUser.id, name: currentUser.name });
    } else {
      await resetToDefaults();
    }
    setIsResetConfirmOpen(false);
    showSuccess('All feature flags have been reset to factory charter defaults.');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Control Header & Stats Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-extrabold text-slate-900">
              Centralized Feature Flags Registry
            </h3>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
              Live Hot-Reload Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Toggle platform modules in real-time. Unrelated components adapt automatically with zero crashes.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
            <span className="text-emerald-700 font-extrabold">{enabledCount}</span> of{' '}
            <span className="font-extrabold">{features.length}</span> Active
          </div>

          <button
            onClick={() => setIsResetConfirmOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer border border-slate-200"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
          
          {/* Search Input */}
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by flag key, name, or description..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-slate-50/50"
            />
          </div>

          {/* Quick Category Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            {(Object.keys(CATEGORY_META) as (FeatureCategory | 'all')[]).map((cat) => {
              const meta = CATEGORY_META[cat];
              const Icon = meta.icon;
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-purple-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{meta.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Feature Flags Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFeatures.map((feature) => {
          const isEnabled = feature.enabled;
          return (
            <div
              key={feature.key}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                isEnabled
                  ? 'bg-white border-slate-200/90 shadow-xs hover:border-purple-300'
                  : 'bg-slate-50/70 border-slate-200/60 opacity-80'
              }`}
            >
              <div className="space-y-2">
                {/* Header Line */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-extrabold text-sm text-slate-900">
                        {feature.name}
                      </h4>
                      {feature.isExperimental && (
                        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                          <Sparkles className="w-3 h-3" /> Experimental
                        </span>
                      )}
                    </div>
                    <code className="text-[11px] font-mono text-purple-700 font-bold block mt-0.5">
                      {feature.key}
                    </code>
                  </div>

                  {/* Toggle Button */}
                  <button
                    type="button"
                    onClick={() => handleToggle(feature.key, !isEnabled)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 ${
                      isEnabled ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                    role="switch"
                    aria-checked={isEnabled}
                    title={isEnabled ? 'Click to disable' : 'Click to enable'}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        isEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Footer Meta line */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-500">
                <span className="capitalize bg-slate-100 px-2 py-0.5 rounded-md text-slate-700">
                  {feature.category}
                </span>

                <div className="flex items-center gap-1">
                  {isEnabled ? (
                    <span className="text-emerald-700 flex items-center gap-1 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Enabled
                    </span>
                  ) : (
                    <span className="text-slate-400 flex items-center gap-1 font-bold">
                      <AlertCircle className="w-3.5 h-3.5" /> Disabled
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reset Confirmation Dialog */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="max-w-sm w-full bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="font-extrabold text-base text-slate-900">Reset All Feature Flags?</h4>
              <p className="text-xs text-slate-500">
                This will restore all feature toggles to their default charter configuration.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
