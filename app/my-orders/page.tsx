'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, Clock, CheckCircle2, ChevronRight, ShoppingBag, Truck, ExternalLink, ArrowRight } from 'lucide-react';

export default function MyOrdersPage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch('/api/user/me')
      .then(res => res.ok ? res.json() : null)
      .then(userData => {
        if (userData) {
          setUser(userData);
          return fetch('/api/user/my-orders').then(r => r.ok ? r.json() : null);
        }
        return null;
      })
      .then(orderData => {
        if (orderData && orderData.orders) {
          setOrders(orderData.orders);
        }
      })
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-slate-200 text-center max-w-md w-full space-y-4">
          <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Customer Account</h2>
          <p className="text-slate-500 text-xs">
            Sign in to view your orders, or use our quick order tracker with your phone number without logging in.
          </p>
          <div className="pt-2 space-y-2.5">
            <Link
              href="/track"
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 px-6 rounded-2xl text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all shadow-md shadow-orange-500/20"
            >
              <span>Track with Phone / Order ID</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3.5 px-6 rounded-2xl text-xs tracking-wider uppercase flex items-center justify-center transition-all"
            >
              Sign In to Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2.5 py-1 rounded-md border border-orange-200">
              Customer Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              My Orders & Shipments
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Logged in as <strong className="text-slate-700">{user.name}</strong> ({user.email})
            </p>
          </div>

          <Link
            href="/track"
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-3 rounded-2xl transition-all shrink-0"
          >
            <Truck className="w-4 h-4 text-orange-400" />
            <span>Track Any Order</span>
          </Link>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">No Orders Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You haven't placed any orders with this account yet. Discover our collection in the store.
            </p>
            <Link
              href="/all/"
              className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-6 py-3 rounded-2xl transition-all"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div 
                key={order.id} 
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Order ID</span>
                    <div className="font-mono font-black text-slate-900 text-base">{order.order_number}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                      order.payment_status === 'paid' 
                        ? 'text-emerald-700 bg-emerald-50 border-emerald-200' 
                        : 'text-amber-700 bg-amber-50 border-amber-200'
                    }`}>
                      {order.payment_status === 'paid' ? 'Paid (PayStation)' : 'COD Pending'}
                    </span>

                    <span className="text-[11px] font-black uppercase tracking-wider text-orange-700 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
                      {order.order_status}
                    </span>
                  </div>
                </div>

                {/* Items preview */}
                <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div className="text-slate-600 space-y-0.5">
                    <div>Items: <strong className="text-slate-900">{(order.items || []).map((i: any) => `${i.name} (×${i.quantity || 1})`).join(', ')}</strong></div>
                    <div className="text-slate-400 text-[11px]">{new Date(order.created_at).toLocaleDateString()}</div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Total</span>
                      <span className="font-black text-slate-900 text-base">৳{Number(order.total_amount).toLocaleString()}</span>
                    </div>

                    <Link
                      href={`/track?order=${encodeURIComponent(order.order_number)}`}
                      className="bg-orange-50 hover:bg-orange-100 text-orange-700 font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors border border-orange-200/80"
                    >
                      <span>Track Live</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
