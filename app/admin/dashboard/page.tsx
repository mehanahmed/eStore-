'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminSidebar from '../AdminSidebar';
import { 
  CreditCard,
  Package,
  TrendingUp,
  ArrowRight,
  ExternalLink,
  Plus,
  ShoppingBag,
  CheckCircle2,
  Clock,
  FolderTree,
  Users,
  Settings,
  ShieldCheck,
  AlertCircle,
  Truck,
  RotateCw
} from 'lucide-react';

interface RecentOrder {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone?: string;
  city: string;
  delivery_zone?: string;
  total_amount: number | string;
  order_status: string;
  payment_status: string;
  payment_method: string;
  created_at: string;
}

interface TrendingCategory {
  name: string;
  product_count: number;
}

interface OrderStatusCounts {
  pending: number;
  confirmed: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}

interface DashboardStats {
  totalRevenue: number;
  paystationRevenue: number;
  totalOrders: number;
  totalCategories: number;
  totalProducts: number;
  publishedProducts: number;
  unpublishedProducts: number;
  totalCustomers: number;
  orderStatusCounts: OrderStatusCounts;
  recentOrders: RecentOrder[];
  trendingCategories: TrendingCategory[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState('24th Oct 2026');

  useEffect(() => {
    const now = new Date();
    const day = now.getDate();
    const month = now.toLocaleDateString('en-US', { month: 'short' });
    const year = now.getFullYear();

    const getOrdinal = (n: number) => {
      const s = ['th', 'st', 'nd', 'rd'];
      const v = n % 100;
      return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };

    setCurrentDate(`${getOrdinal(day)} ${month} ${year}`);
  }, []);

  const loadDashboardStats = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/dashboard-stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardStats();
  }, []);

  // Category progress colors
  const categoryColors = ['bg-orange-500', 'bg-blue-500', 'bg-emerald-500', 'bg-purple-500'];

  // Days of week for activity chart
  const weeklyDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="flex h-screen overflow-hidden bg-[#F3F5F9] font-sans antialiased text-slate-800">
      {/* Sidebar Navigation */}
      <AdminSidebar />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Sticky Top Bar Navbar */}
        <header className="h-[72px] border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-6 sm:px-9 flex items-center justify-between shrink-0 sticky top-0 z-30 shadow-xs">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Dashboard
            </h1>
            <p className="text-xs font-semibold text-slate-500">
              {currentDate} • Welcome back to Color Hut Admin Hub
            </p>
          </div>

          {/* Real Store Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={loadDashboardStats}
              className="p-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors shadow-xs cursor-pointer"
              title="Refresh stats"
            >
              <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-orange-600' : ''}`} />
            </button>

            <Link
              href="/"
              target="_blank"
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <span>View Store</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <Link
              href="/admin/products"
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition-colors shadow-xs shadow-orange-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>New Product</span>
            </Link>
          </div>
        </header>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-7 md:p-8">
          <div className="max-w-[1400px] w-full mx-auto space-y-7 pb-8">

          {/* Row 1: Four Real Store Stat Cards (Redundant icons removed as marked) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            
            {/* 1. Total Revenue Card (Only Successful Payments Counted) */}
            <div className="bg-white border border-orange-200/70 rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="bg-orange-50 text-orange-700 border border-orange-200 px-3 py-1 rounded-full text-xs font-bold">
                  Total Revenue
                </span>
              </div>

              <div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  ৳{stats?.totalRevenue ? Number(stats.totalRevenue).toLocaleString() : '0.00'}
                </div>
                <div className="text-xs font-medium text-slate-500 mt-1">
                  Successful payments collected
                </div>
              </div>
            </div>

            {/* 2. Total Orders Card */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="bg-sky-50 text-sky-700 border border-sky-200 px-3 py-1 rounded-full text-xs font-bold">
                  Total Orders
                </span>
                <Link href="/admin/orders" className="text-xs font-semibold text-sky-600 hover:underline">
                  View
                </Link>
              </div>

              <div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {stats?.totalOrders ?? 0}
                </div>
                <div className="text-xs font-medium text-slate-500 mt-1">
                  Active orders placed
                </div>
              </div>
            </div>

            {/* 3. Products in Store */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold">
                  Products in Store
                </span>
                <Link href="/admin/products" className="text-xs font-semibold text-emerald-600 hover:underline">
                  Manage
                </Link>
              </div>

              <div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {stats?.totalProducts ?? 0}
                </div>
                <div className="text-xs font-medium text-slate-500 mt-1">
                  {stats?.publishedProducts ?? 0} Published • {stats?.totalCategories ?? 0} Categories
                </div>
              </div>
            </div>

            {/* 4. PayStation Online Gateway */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1 rounded-full text-xs font-bold">
                  PayStation Online
                </span>
                <Link href="/admin/payments" className="text-xs font-semibold text-purple-600 hover:underline">
                  Logs
                </Link>
              </div>

              <div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  ৳{stats?.paystationRevenue ? Number(stats.paystationRevenue).toLocaleString() : '0.00'}
                </div>
                <div className="text-xs font-medium text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Online Payments Verified</span>
                </div>
              </div>
            </div>

          </div>

          {/* Row 2: Sales Activity Chart (8 cols) & Categories Share + Quick Management (4 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Left: Weekly Sales Activity (8 cols) */}
            <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                    Weekly Sales & Orders Activity
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    Overview of store order flow this week
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                    <span className="w-3 h-3 rounded-full bg-orange-500" />
                    <span>Orders</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 ml-2">
                    <span className="w-3 h-3 rounded-full bg-indigo-400" />
                    <span>Revenue</span>
                  </span>
                </div>
              </div>

              {/* Bar Chart Visualization */}
              <div className="space-y-4 pt-2">
                <div className="relative h-44 flex items-end justify-between px-3 sm:px-6 border-b border-slate-100">
                  {/* Benchmarks */}
                  <div className="absolute left-0 right-0 top-0 border-t border-dashed border-slate-200/80 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                    <span className="-mt-3">৳50,000</span>
                  </div>
                  <div className="absolute left-0 right-0 top-1/4 border-t border-dashed border-slate-200/80 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                    <span className="-mt-3">৳35,000</span>
                  </div>
                  <div className="absolute left-0 right-0 top-2/4 border-t border-dashed border-slate-200/80 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                    <span className="-mt-3">৳20,000</span>
                  </div>
                  <div className="absolute left-0 right-0 top-3/4 border-t border-dashed border-slate-200/80 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                    <span className="-mt-3">৳5,000</span>
                  </div>

                  {/* Dual Bars for Each Day */}
                  {weeklyDays.map((day, idx) => {
                    const heights = [45, 65, 85, 50, 75, 40, 90];
                    const revenueHeights = [35, 55, 70, 42, 60, 30, 80];
                    const h1 = heights[idx];
                    const h2 = revenueHeights[idx];

                    return (
                      <div key={day} className="flex flex-col items-center gap-2 z-10 group relative">
                        <div className="flex items-end gap-1.5 h-36">
                          <div
                            style={{ height: `${h1}%` }}
                            className="w-3 sm:w-3.5 bg-orange-500 hover:bg-orange-600 rounded-t-lg transition-all"
                            title={`${day}: Active Orders`}
                          />
                          <div
                            style={{ height: `${h2}%` }}
                            className="w-3 sm:w-3.5 bg-indigo-400 hover:bg-indigo-500 rounded-t-lg transition-all"
                            title={`${day}: Revenue`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between px-3 sm:px-6 text-xs font-bold text-slate-400">
                  {weeklyDays.map((d) => (
                    <span key={d} className="w-8 text-center">{d}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Categories Share & Quick Actions (4 cols) - Moved here to replace unwanted pipeline box */}
            <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                    Categories Share
                  </h3>
                  <Link href="/admin/categories" className="text-xs font-bold text-orange-600 hover:underline">
                    Manage
                  </Link>
                </div>

                <div className="space-y-4">
                  {!stats || stats.trendingCategories.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6">No categories added yet.</p>
                  ) : (
                    stats.trendingCategories.map((cat, idx) => {
                      const totalProd = stats.totalProducts || 1;
                      const pct = Math.round((cat.product_count / totalProd) * 100);

                      return (
                        <div key={cat.name} className="space-y-1.5">
                          <div className="flex justify-between text-xs font-bold text-slate-700">
                            <span>{cat.name}</span>
                            <span className="text-slate-400">{cat.product_count} items ({pct}%)</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2">
                            <div
                              className={`${categoryColors[idx % categoryColors.length]} h-2 rounded-full transition-all`}
                              style={{ width: `${Math.max(8, pct)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Quick Settings Shortcut */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Quick Management
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                  <Link
                    href="/admin/products"
                    className="p-2.5 rounded-xl border border-slate-200/80 hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-between"
                  >
                    <span>Products</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>
                  <Link
                    href="/admin/payments"
                    className="p-2.5 rounded-xl border border-slate-200/80 hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-between"
                  >
                    <span>Payments</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>
                </div>
              </div>

            </div>

          </div>

          {/* Row 3: Real Recent Orders Table (Full Width, No Awkward Wrapping) */}
          <div className="w-full bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                  Recent Customer Orders
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  Live orders placed through storefront checkout
                </p>
              </div>

              <Link
                href="/admin/orders"
                className="bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-xs px-3.5 py-1.5 rounded-full transition-colors cursor-pointer border border-orange-200"
              >
                View All
              </Link>
            </div>

            {/* Table */}
            <div className="overflow-x-auto w-full pt-1">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <th className="pb-3.5 pl-2">Order ID</th>
                    <th className="pb-3.5">Customer</th>
                    <th className="pb-3.5">Location</th>
                    <th className="pb-3.5">Payment</th>
                    <th className="pb-3.5">Status</th>
                    <th className="pb-3.5">Date</th>
                    <th className="pb-3.5 pr-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
                  {!stats || stats.recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-slate-400 font-semibold">
                        No orders placed yet.
                      </td>
                    </tr>
                  ) : (
                    stats.recentOrders.map((order) => {
                      const isFailed = order.payment_status === 'failed' || order.order_status === 'failed';
                      return (
                        <tr key={order.id} className="hover:bg-slate-50/70 transition-colors group">
                          <td className="py-4 pl-2 font-mono font-bold text-slate-900 whitespace-nowrap">
                            <Link href={`/admin/orders`} className="hover:text-orange-600 underline">
                              {order.order_number}
                            </Link>
                          </td>
                          <td className="py-4 font-bold text-slate-900 whitespace-nowrap">
                            <div>{order.customer_name}</div>
                            {order.customer_phone && (
                              <div className="text-[11px] font-mono text-slate-400 font-normal">{order.customer_phone}</div>
                            )}
                          </td>
                          <td className="py-4 text-slate-500 font-medium whitespace-nowrap">
                            {order.city || 'Dhaka'}
                          </td>
                          <td className="py-4 whitespace-nowrap">
                            {order.payment_method === 'paystation' ? (
                              order.payment_status === 'paid' ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                                  PayStation (Paid)
                                </span>
                              ) : isFailed ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full">
                                  PayStation (Failed)
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                                  PayStation (Pending)
                                </span>
                              )
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full">
                                Cash on Delivery
                              </span>
                            )}
                          </td>
                          <td className="py-4 whitespace-nowrap">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                              isFailed
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : order.order_status === 'delivered'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : order.order_status === 'confirmed'
                                ? 'bg-orange-50 text-orange-700 border-orange-200'
                                : order.order_status === 'processing'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {isFailed ? 'FAILED' : order.order_status}
                            </span>
                          </td>
                          <td className="py-4 text-slate-400 text-[11px] whitespace-nowrap">
                            {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </td>
                          <td className="py-4 pr-2 text-right font-black text-slate-900 text-sm whitespace-nowrap">
                            ৳{Number(order.total_amount).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          </div>
        </div>
      </div>
    </div>
  );
}