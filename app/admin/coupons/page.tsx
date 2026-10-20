'use client';

import React, { useState } from 'react';
import AdminSidebar from '../AdminSidebar';
import { Ticket, Plus, Tag, Percent, Calendar, Sparkles } from 'lucide-react';

export default function CouponsAdminPage() {
  const [coupons] = useState([
    { id: 1, code: 'COLORHUT10', discount: '10% OFF', minSpend: '৳1000', status: 'Active', expiry: 'Dec 31, 2026' },
    { id: 2, code: 'RAMADAN25', discount: '25% OFF', minSpend: '৳2500', status: 'Active', expiry: 'Nov 15, 2026' },
    { id: 3, code: 'MENUSNAP', discount: '৳500 OFF', minSpend: '৳3000', status: 'Active', expiry: 'Dec 31, 2026' },
  ]);

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">
      <AdminSidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-[68px] border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-30">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <Ticket className="w-5 h-5 text-orange-500" />
              Promotional Coupons & Vouchers
            </h1>
            <p className="text-xs text-slate-500 font-medium">Create and manage campaign discount codes</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white hover:bg-black rounded-xl text-sm font-semibold transition-all shadow-sm">
            <Plus className="w-4 h-4" />
            New Coupon
          </button>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {coupons.map(c => (
              <div key={c.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm relative overflow-hidden group hover:border-orange-500/40 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono font-black text-lg text-slate-900 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                    {c.code}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    {c.status}
                  </span>
                </div>
                <div className="space-y-1 mb-4">
                  <p className="text-2xl font-black text-orange-600">{c.discount}</p>
                  <p className="text-xs text-slate-500">Min. order: <span className="font-semibold text-slate-700">{c.minSpend}</span></p>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-400">
                  <span>Expires {c.expiry}</span>
                  <span className="text-orange-600 font-semibold cursor-pointer hover:underline">Edit</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
