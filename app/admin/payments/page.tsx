'use client';

import React, { useState } from 'react';
import AdminSidebar from '../AdminSidebar';
import { CreditCard, DollarSign, ArrowUpRight, CheckCircle2, ShieldCheck, Wallet } from 'lucide-react';

export default function PaymentsAdminPage() {
  const [transactions] = useState([
    { id: 'TXN-9021', method: 'bKash Merchant', ref: 'BKH9823412', amount: '৳94,500', status: 'Completed', date: 'Today, 2:30 PM' },
    { id: 'TXN-9020', method: 'Nagad Gateway', ref: 'NGD4910293', amount: '৳45,000', status: 'Completed', date: 'Yesterday' },
    { id: 'TXN-9019', method: 'Bank Transfer (City Bank)', ref: 'CB-994012', amount: '৳28,000', status: 'Settled', date: 'Oct 17, 2026' },
    { id: 'TXN-9018', method: 'bKash Merchant', ref: 'BKH8812930', amount: '৳35,700', status: 'Completed', date: 'Oct 16, 2026' },
  ]);

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">
      <AdminSidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-[68px] border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-30">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <CreditCard className="w-5 h-5 text-orange-500" />
              Payments & Settlement Hub
            </h1>
            <p className="text-xs text-slate-500 font-medium">Payment gateways, mobile banking logs and payout status</p>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Settled Funds</span>
                <Wallet className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-3xl font-black text-slate-900 mt-2">৳4,82,400</p>
              <p className="text-xs text-emerald-600 font-semibold mt-1">Available for automatic payout</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gateway Status</span>
                <ShieldCheck className="w-4 h-4 text-orange-600" />
              </div>
              <p className="text-xl font-black text-slate-900 mt-2">bKash & Nagad Active</p>
              <p className="text-xs text-slate-400 font-medium mt-1">SSLCommerz 100% operational</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Success Rate</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-3xl font-black text-emerald-600 mt-2">99.4%</p>
              <p className="text-xs text-slate-400 font-medium mt-1">Across 438 total transactions</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-900 text-sm">Recent Transactions</h2>
            </div>
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3.5 px-6">Transaction ID</th>
                  <th className="py-3.5 px-6">Gateway Method</th>
                  <th className="py-3.5 px-6">Reference / TrxID</th>
                  <th className="py-3.5 px-6">Amount</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {transactions.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-slate-900">{t.id}</td>
                    <td className="py-4 px-6 text-slate-800 font-semibold">{t.method}</td>
                    <td className="py-4 px-6 font-mono text-slate-500 text-xs">{t.ref}</td>
                    <td className="py-4 px-6 font-bold text-slate-900">{t.amount}</td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        {t.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-400 text-xs">{t.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
