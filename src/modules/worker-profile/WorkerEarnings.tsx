import React, { useState, useEffect } from 'react';
import { WorkerEarningTransaction } from '../../shared/types';
import { db } from '../../shared/services/database';
import { useAuth } from '../auth';
import {
  IndianRupee,
  TrendingUp,
  Wallet,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Download,
  ArrowUpRight,
  Receipt,
  Percent,
} from 'lucide-react';

export const WorkerEarnings: React.FC = () => {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState<WorkerEarningTransaction[]>([]);

  useEffect(() => {
    if (currentUser?.id) {
      db.getWorkerEarnings(currentUser.id).then(setTransactions);
    } else {
      setTransactions([]);
    }
  }, [currentUser]);

  const totalGross = transactions.reduce((sum, tx) => sum + tx.gross_amount, 0);
  const totalNet = transactions.reduce((sum, tx) => sum + tx.net_earnings, 0);
  const inEscrow = transactions
    .filter((tx) => tx.status === 'In Escrow')
    .reduce((sum, tx) => sum + tx.net_earnings, 0);
  const settledBalance = totalNet - inEscrow;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner */}
      <div className="rounded-3xl bg-linear-to-r from-emerald-900 via-teal-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> 0% Cooperative Commission Charter
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white mt-1">
            Artisan Earnings & Escrow Ledger
          </h2>
          <p className="text-xs text-emerald-200/80 max-w-xl">
            You retain 100% of your listed hourly rate. Payments are held in protected cooperative escrow and settled upon job completion.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-xs text-right shrink-0">
          <div className="text-emerald-200 uppercase text-[10px] font-bold">Settled Available Balance</div>
          <div className="text-2xl font-black text-white flex items-center justify-end">
            <IndianRupee className="w-5 h-5" />
            <span>{settledBalance}</span>
          </div>
          <span className="text-[10px] text-emerald-300 font-semibold">Direct UPI / Bank Ready</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
            Total Earnings
          </span>
          <div className="text-2xl font-black text-slate-900 flex items-center">
            <IndianRupee className="w-5 h-5 text-slate-500" />
            <span>{totalNet}</span>
          </div>
          <p className="text-[11px] text-emerald-700 font-semibold">100% Net Take-Home</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Held in Escrow
          </span>
          <div className="text-2xl font-black text-slate-900 flex items-center">
            <IndianRupee className="w-5 h-5 text-slate-500" />
            <span>{inEscrow}</span>
          </div>
          <p className="text-[11px] text-amber-700 font-semibold">Pending customer completion</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
            <Percent className="w-3.5 h-3.5 text-emerald-700" />
            Platform Fee
          </span>
          <div className="text-2xl font-black text-emerald-700">₹0 (0%)</div>
          <p className="text-[11px] text-emerald-700 font-semibold">Cooperative Charter</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-700" />
            Settled Payouts
          </span>
          <div className="text-2xl font-black text-slate-900">
            {transactions.filter((tx) => tx.status === 'Settled').length}
          </div>
          <p className="text-[11px] text-slate-500">Disbursed transactions</p>
        </div>
      </div>

      {/* Sustainable Model Demonstration Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
        <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
          <Receipt className="w-4 h-4 text-emerald-700" />
          <span>Cooperative Payout Transparency Formula</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
          <div>
            <span className="text-slate-500">Gross Service Amount:</span>
            <div className="font-bold text-slate-900 text-sm">₹500 / job</div>
          </div>
          <div>
            <span className="text-slate-500">Cooperative Platform Fee:</span>
            <div className="font-bold text-emerald-700 text-sm">- ₹0 (0.0%)</div>
          </div>
          <div>
            <span className="text-slate-500">Net Worker Take-Home:</span>
            <div className="font-bold text-slate-900 text-sm">= ₹500 (100%)</div>
          </div>
        </div>
      </div>

      {/* Transaction History Ledger */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
            <Wallet className="w-4 h-4 text-emerald-700" />
            <span>Service Transaction History</span>
          </h3>
          <span className="text-xs text-slate-400 font-semibold">{transactions.length} records</span>
        </div>

        {transactions.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No transaction records found yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="p-4 sm:p-5 hover:bg-slate-50/70 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{tx.service_name}</span>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                        tx.status === 'Settled'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {tx.status}
                    </span>
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    Customer: <strong>{tx.customer_name}</strong> • Booking: <code>{tx.booking_id}</code>
                  </div>
                </div>

                <div className="sm:text-right shrink-0 space-y-0.5">
                  <div className="font-black text-sm text-emerald-700 flex items-center sm:justify-end">
                    <IndianRupee className="w-3.5 h-3.5" />
                    <span>+{tx.net_earnings}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {new Date(tx.date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
