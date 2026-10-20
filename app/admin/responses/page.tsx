'use client';

import React, { useState } from 'react';
import AdminSidebar from '../AdminSidebar';
import { MessageSquare, Mail, Phone, Clock, CheckCircle } from 'lucide-react';

export default function ResponsesAdminPage() {
  const [messages] = useState([
    { id: 1, name: 'Rafiqul Islam', phone: '+880 1712-345678', topic: 'Leather Bound Menu Book Quotation', message: 'Need 40 copies of premium restaurant leather menu books for our Gulshan branch.', date: 'Today, 11:20 AM', read: false },
    { id: 2, name: 'Nasrin Sultana', phone: '+880 1819-987654', topic: 'Beauty Parlor Price Catalog', message: 'Do you provide acrylic stands along with parlor service rate cards?', date: 'Yesterday', read: true },
    { id: 3, name: 'Mahmud Hassan', phone: '+880 1911-555444', topic: 'Custom Restaurant Signage Box', message: 'Looking for neon signage with acrylic front. Please contact with pricing.', date: 'Oct 18, 2026', read: true },
  ]);

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">
      <AdminSidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-[68px] border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-30">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <MessageSquare className="w-5 h-5 text-orange-500" />
              Client Inquiries & Responses
            </h1>
            <p className="text-xs text-slate-500 font-medium">Direct customer messages, WhatsApp leads, and quotation requests</p>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full space-y-4">
          {messages.map(m => (
            <div key={m.id} className={`p-6 rounded-2xl border transition-all ${
              !m.read ? 'bg-white border-orange-500/30 shadow-md ring-1 ring-orange-500/10' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-900 text-base">{m.name}</span>
                  <span className="text-xs text-slate-500 font-mono bg-slate-100 px-2.5 py-0.5 rounded-md">{m.phone}</span>
                  {!m.read && (
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-500 text-white">
                      New
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-400">{m.date}</span>
              </div>
              <p className="text-sm font-semibold text-slate-800 mb-1">{m.topic}</p>
              <p className="text-sm text-slate-600 leading-relaxed">{m.message}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
