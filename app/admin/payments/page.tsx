'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminSidebar from '../AdminSidebar';
import { 
  CreditCard, 
  DollarSign, 
  CheckCircle2, 
  ShieldCheck, 
  Wallet, 
  Clock, 
  ArrowRight,
  ArrowUpRight, 
  AlertCircle,
  ExternalLink,
  Settings,
  RefreshCw
} from 'lucide-react';

interface PaymentTransaction {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  payment_method: string;
  payment_status: 'paid' | 'pending' | 'failed';
  transaction_id?: string;
  total_amount: number;
  order_status: string;
  created_at: string;
}

interface PaymentData {
  gateway: {
    name: string;
    environment: string;
    isSandbox: boolean;
    merchantId?: string;
    status: string;
  };
  metrics: {
    totalSettled: number;
    paystationSettled: number;
    pendingSettlement: number;
    totalOrders: number;
    successRate: string;
  };
  transactions: PaymentTransaction[];
}

export default function PaymentsAdminPage() {
  const [data, setData] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPayments = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/payments-data');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        setError('Failed to load real payment logs');
      }
    } catch (e: any) {
      setError(e.message || 'Network error fetching payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F3F5F9] font-sans antialiased text-slate-800">
      <AdminSidebar />

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <header className="h-[72px] border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-6 sm:px-8 flex items-center justify-between shrink-0 sticky top-0 z-30 shadow-xs">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-orange-600" />
              <span>Payments & Settlements</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Real-time payment logs, PayStation gateway transactions & COD settlement
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchPayments}
              className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-orange-600' : ''}`} />
            </button>
            <Link
              href="/admin/settings"
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Gateway Settings</span>
            </Link>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          <div className="max-w-7xl mx-auto w-full space-y-6 pb-8">
          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* 1. Online Paid / Settled */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Online Paid (PayStation)
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Wallet className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-black text-slate-900">
                ৳{data?.metrics?.paystationSettled?.toLocaleString() || '0'}
              </p>
              <div className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified Online Gateway Collections</span>
              </div>
            </div>

            {/* 2. Cash on Delivery Volume */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Cash on Delivery (Pending)
                </span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-black text-slate-900">
                ৳{data?.metrics?.pendingSettlement?.toLocaleString() || '0'}
              </p>
              <p className="text-xs text-slate-500 font-medium">
                To be collected at customer doorstep
              </p>
            </div>

            {/* 3. Gateway Status */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  PayStation Gateway
                </span>
                <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xl font-black text-slate-900">
                  {data?.gateway?.environment === 'sandbox' ? 'Sandbox Mode' : 'Live Mode'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-300 uppercase">
                  Connected
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Merchant ID: <strong className="font-mono text-slate-700">{data?.gateway?.merchantId || 'Configured'}</strong>
              </p>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="font-extrabold text-slate-900 text-base">Real Order Transactions</h2>
                <p className="text-xs text-slate-400 font-medium">
                  Showing {data?.transactions?.length || 0} orders with payment details
                </p>
              </div>

              <Link
                href="/admin/orders"
                className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
              >
                <span>View All Orders</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-4 px-6">Order Number</th>
                    <th className="py-4 px-6">Customer</th>
                    <th className="py-4 px-6">Method</th>
                    <th className="py-4 px-6">Trx ID</th>
                    <th className="py-4 px-6">Amount</th>
                    <th className="py-4 px-6">Payment Status</th>
                    <th className="py-4 px-6">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-slate-400 font-semibold">
                        Loading live payment records...
                      </td>
                    </tr>
                  ) : !data || data.transactions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-slate-400 font-semibold">
                        No transactions recorded yet.
                      </td>
                    </tr>
                  ) : (
                    data.transactions.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-6 font-mono font-bold text-slate-900">
                          <Link href={`/admin/orders`} className="hover:text-orange-600 underline">
                            {t.order_number}
                          </Link>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-900">{t.customer_name}</div>
                          <div className="text-[11px] text-slate-400">{t.customer_phone}</div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`font-semibold capitalize ${
                            t.payment_method === 'paystation' ? 'text-indigo-600 font-bold' : 'text-slate-600'
                          }`}>
                            {t.payment_method === 'paystation' ? 'Online (PayStation)' : 'Cash on Delivery'}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-mono text-[11px]">
                          {t.transaction_id ? (
                            <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                              {t.transaction_id}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-4 px-6 font-black text-slate-900 text-sm">
                          ৳{Number(t.total_amount).toLocaleString()}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider inline-flex items-center gap-1 border ${
                            t.payment_status === 'paid'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : t.payment_status === 'failed'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {t.payment_status === 'paid' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                            {t.payment_status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-slate-400 text-[11px]">
                          {new Date(t.created_at).toLocaleString(undefined, { 
                            month: 'short', 
                            day: 'numeric', 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          </div>
        </div>
      </main>
    </div>
  );
}
