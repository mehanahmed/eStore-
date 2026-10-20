'use client';

import React, { useState } from 'react';
import AdminSidebar from '../AdminSidebar';
import { HeartHandshake, Star, Plus, Quote } from 'lucide-react';

export default function TestimonialsAdminPage() {
  const [reviews] = useState([
    { id: 1, name: 'Sultan Dine', owner: 'Managing Director', comment: 'Color Hut created the most durable and luxurious menu books for our 12 branches across Dhaka.', rating: 5, date: 'Oct 2026' },
    { id: 2, name: 'Gloria Jeans Cafe', owner: 'Branch Manager', comment: 'Exceptional print precision and fast turnaround for all our seasonal promo boards and table tents.', rating: 5, date: 'Sep 2026' },
    { id: 3, name: 'Luxe Parlour & Spa', owner: 'Studio Head', comment: 'The service booklet and rate card design exceeded our expectations. Our clients love the tactile feel.', rating: 5, date: 'Sep 2026' },
  ]);

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">
      <AdminSidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-[68px] border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-30">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <HeartHandshake className="w-5 h-5 text-orange-500" />
              Client Testimonials & Reviews
            </h1>
            <p className="text-xs text-slate-500 font-medium">Verified restaurant and salon partner reviews displayed on the storefront</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white hover:bg-black rounded-xl text-sm font-semibold transition-all shadow-sm">
            <Plus className="w-4 h-4" />
            Add Review
          </button>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map(r => (
              <div key={r.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between group hover:border-orange-500/40 transition-all">
                <div>
                  <div className="flex items-center gap-1 text-amber-400 mb-3">
                    {[...Array(r.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-700 text-sm italic leading-relaxed mb-4">
                    "{r.comment}"
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{r.name}</h3>
                    <p className="text-xs text-slate-400">{r.owner}</p>
                  </div>
                  <span className="text-xs text-slate-400">{r.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
