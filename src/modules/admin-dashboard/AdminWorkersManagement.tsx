import React, { useState, useEffect } from 'react';
import { Worker, WorkerApplication } from '../../shared/types';
import { db } from '../../shared/services/database';
import { useToast } from '../../shared/components/Toast';
import { StarRating } from '../../shared/components/StarRating';
import { StatusBadge, VerifiedBadge } from '../../shared/components/Badge';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  Building2,
  FileCheck,
  MapPin,
  Phone,
  Calendar,
  Wrench,
  Clock,
  UserX,
  UserCheck,
} from 'lucide-react';

export const AdminWorkersManagement: React.FC = () => {
  const { showSuccess, showError } = useToast();

  const [workers, setWorkers] = useState<Worker[]>([]);
  const [applications, setApplications] = useState<WorkerApplication[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'workers' | 'applications'>('workers');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedApp, setSelectedApp] = useState<WorkerApplication | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  const loadData = async () => {
    try {
      const [wList, appList] = await Promise.all([
        db.getWorkers(),
        db.getWorkerApplications(),
      ]);
      setWorkers(wList);
      setApplications(appList);
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApproveApplication = async (app: WorkerApplication) => {
    try {
      await db.approveWorkerApplication(app.id, 'Admin');
      showSuccess(`Approved application for ${app.fullName}. Worker account is now verified & active.`);
      loadData();
    } catch {
      showError(500, 'Failed to approve application.');
    }
  };

  const handleRejectApplication = async () => {
    if (!selectedApp) return;
    try {
      await db.rejectWorkerApplication(selectedApp.id, 'Admin', rejectionReason || 'Verification criteria not satisfied.');
      showSuccess(`Rejected application for ${selectedApp.fullName}.`);
      setIsRejectModalOpen(false);
      setSelectedApp(null);
      setRejectionReason('');
      loadData();
    } catch {
      showError(500, 'Failed to reject application.');
    }
  };

  const handleToggleWorkerSuspension = async (worker: Worker) => {
    const isSuspended = worker.verificationStatus === 'Suspended';
    const newStatus = isSuspended ? 'Verified' : 'Suspended';
    try {
      const all = await db.getWorkers();
      const target = all.find((w) => w.id === worker.id);
      if (target) {
        target.verificationStatus = newStatus;
        target.isAvailable = !isSuspended ? false : true;
        localStorage.setItem('sahyog_workers', JSON.stringify(all));
      }
      showSuccess(`Worker ${worker.name} is now ${newStatus.toUpperCase()}`);
      loadData();
    } catch {
      showError(500, 'Failed to update worker status.');
    }
  };

  const pendingAppsCount = applications.filter((a) => a.status === 'Pending' || a.status === 'Under Review').length;

  const filteredWorkers = workers.filter((w) => {
    const matchesSearch =
      (w.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.skill.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.cooperative_id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL'
        ? true
        : statusFilter === 'VERIFIED'
        ? w.verified || w.verificationStatus === 'Verified'
        : statusFilter === 'SUSPENDED'
        ? w.verificationStatus === 'Suspended'
        : true;

    const matchesCategory =
      categoryFilter === 'ALL' ? true : w.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const filteredApps = applications.filter((a) => {
    return (
      a.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.phone.includes(searchQuery) ||
      a.primarySkill.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.cooperativeSociety.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-700" />
            <span>Worker Management & Artisan Intake</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit verified cooperative members, review pending artisan intake applications, and manage service eligibility.
          </p>
        </div>

        {/* Sub Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('workers')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'workers'
                ? 'bg-purple-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Active Directory ({workers.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('applications')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'applications'
                ? 'bg-purple-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Intake Queue</span>
            {pendingAppsCount > 0 && (
              <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-1.5 py-0.2 rounded-full">
                {pendingAppsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by artisan name, skill, phone, or society..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50 focus:ring-2 focus:ring-purple-600"
          />
        </div>

        {activeSubTab === 'workers' && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50 text-slate-700"
            >
              <option value="ALL">All Statuses</option>
              <option value="VERIFIED">Verified Members</option>
              <option value="SUSPENDED">Suspended Members</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50 text-slate-700"
            >
              <option value="ALL">All Trade Categories</option>
              <option value="ELECTRICAL">Electrical</option>
              <option value="PLUMBING">Plumbing</option>
              <option value="APPLIANCE">Appliance Repair</option>
              <option value="CARPENTRY">Carpentry</option>
              <option value="PAINTING">Painting</option>
              <option value="CLEANING">Cleaning</option>
            </select>
          </div>
        )}
      </div>

      {/* SUBVIEW 1: ACTIVE WORKERS DIRECTORY */}
      {activeSubTab === 'workers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWorkers.map((worker) => {
            const isSuspended = worker.verificationStatus === 'Suspended';

            return (
              <div
                key={worker.id}
                className={`bg-white rounded-3xl p-5 border ${
                  isSuspended ? 'border-rose-200 bg-rose-50/30' : 'border-slate-200'
                } shadow-xs space-y-4 hover:border-purple-200 transition`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={worker.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=75'}
                      alt={worker.name}
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shadow-xs shrink-0"
                    />
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">{worker.name}</h4>
                      <p className="text-[11px] text-slate-500 font-semibold">{worker.phone}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      isSuspended
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {isSuspended ? 'Suspended' : 'Verified'}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="font-bold text-slate-800 line-clamp-1">{worker.skill}</div>
                  <div className="flex items-center gap-1 text-slate-500 text-[11px]">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="line-clamp-1">{worker.cooperative_id}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-500 text-[11px]">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{worker.area}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 text-center text-xs">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Rating</div>
                    <div className="font-extrabold text-slate-900">{worker.rating_avg || 4.9} ★</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Jobs</div>
                    <div className="font-extrabold text-slate-900">{worker.completed_jobs_count || 42}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Rate</div>
                    <div className="font-extrabold text-emerald-700">₹{worker.hourly_rate || 299}</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex gap-2">
                  <button
                    onClick={() => handleToggleWorkerSuspension(worker)}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                      isSuspended
                        ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                        : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {isSuspended ? (
                      <>
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Reactivate Membership</span>
                      </>
                    ) : (
                      <>
                        <UserX className="w-3.5 h-3.5" />
                        <span>Suspend Worker</span>
                      </>
                    )}
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* SUBVIEW 2: INTAKE QUEUE & APPLICATIONS */}
      {activeSubTab === 'applications' && (
        <div className="space-y-4">
          {filteredApps.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-xs text-slate-400">
              No worker onboarding applications found.
            </div>
          ) : (
            filteredApps.map((app) => (
              <div
                key={app.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-sm">
                      {app.fullName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-sm text-slate-900">{app.fullName}</h4>
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                            app.status === 'Approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : app.status === 'Rejected'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {app.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{app.primarySkill} • {app.experienceYears} yrs experience</p>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400">
                    Submitted: {new Date(app.submittedAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 uppercase text-[10px] font-bold">Contact & Location</span>
                    <div className="font-semibold text-slate-800">{app.phone}</div>
                    <div className="text-slate-500 text-[11px]">{app.address}, {app.city}</div>
                  </div>

                  <div>
                    <span className="text-slate-400 uppercase text-[10px] font-bold">Cooperative Society</span>
                    <div className="font-semibold text-slate-800">{app.cooperativeSociety}</div>
                    <div className="text-slate-500 text-[11px]">Tariff: ₹{app.hourlyRate}/hr</div>
                  </div>

                  <div>
                    <span className="text-slate-400 uppercase text-[10px] font-bold">Verification Document</span>
                    <div className="font-semibold text-slate-800">{app.documentType}</div>
                    <div className="font-mono text-slate-500 text-[11px]">{app.documentNumberMasked}</div>
                  </div>
                </div>

                {app.status === 'Pending' && (
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleApproveApplication(app)}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve & Activate Artisan</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedApp(app);
                        setIsRejectModalOpen(true);
                      }}
                      className="py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition cursor-pointer flex items-center gap-1"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject Application</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Reject Modal */}
      {isRejectModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 shadow-2xl border border-rose-200 space-y-4">
            <h4 className="font-extrabold text-base text-slate-900">
              Reject Worker Application: {selectedApp.fullName}
            </h4>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Reason for Rejection
              </label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Identity document unreadable or trade verification unverified..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 bg-slate-50 focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectApplication}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
