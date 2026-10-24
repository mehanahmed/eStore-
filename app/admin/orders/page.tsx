'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '../AdminSidebar';
import {
  ArrowLeftRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  Eye,
  DollarSign,
  Search,
  Phone,
  MapPin,
  Calendar,
  X,
  ChevronDown,
  RefreshCw,
  Truck,
  Check,
  User
} from 'lucide-react';

interface OrderItem {
  product_id: number;
  name: string;
  slug?: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  shipping_address: string;
  city: string;
  delivery_zone: string;
  order_notes?: string;
  payment_method: string;
  payment_status: 'pending' | 'paid' | 'failed';
  order_status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  shipping_fee: number;
  total_amount: number;
  items: OrderItem[];
  created_at: string;
}

export default function OrdersAdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const [stats, setStats] = useState({
    total_count: 0,
    total_sales: 0,
    pending_count: 0,
    delivered_count: 0
  });

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleUpdateStatus = async (orderId: number, nextStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_status: nextStatus })
      });
      if (res.ok) {
        setOrders(prev =>
          prev.map(o => (o.id === orderId ? { ...o, order_status: nextStatus as any } : o))
        );
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(prev => prev ? { ...prev, order_status: nextStatus as any } : null);
        }
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'shipped':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'processing':
        return 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20';
      case 'confirmed':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'cancelled':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      default:
        return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">
      <AdminSidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-[68px] border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-30">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <ArrowLeftRight className="w-5 h-5 text-orange-500" />
              Live Orders & Direct Sales
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Manage website checkout orders, customer shipments, and payment status
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchOrders}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Sales</p>
              <p className="text-2xl font-black text-slate-900 mt-1">
                ৳{Number(stats.total_sales || 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Orders</p>
              <p className="text-2xl font-black text-slate-900 mt-1">
                {stats.total_count || orders.length}
              </p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending Orders</p>
              <p className="text-2xl font-black text-orange-600 mt-1">
                {stats.pending_count || 0}
              </p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Delivered</p>
              <p className="text-2xl font-black text-emerald-600 mt-1">
                {stats.delivered_count || 0}
              </p>
            </div>
          </div>

          {/* Filters & Search Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Status Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-hide">
              {['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap ${
                    statusFilter === st
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search order, name, phone..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-slate-900 outline-none focus:border-orange-500 focus:bg-white transition-all"
              />
            </form>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3.5 px-6">Order ID</th>
                  <th className="py-3.5 px-6">Customer</th>
                  <th className="py-3.5 px-6">Items Ordered</th>
                  <th className="py-3.5 px-6">Amount</th>
                  <th className="py-3.5 px-6">Payment</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Date</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 text-sm">
                      {loading ? 'Loading orders...' : 'No orders found.'}
                    </td>
                  </tr>
                ) : (
                  orders.map(o => (
                    <tr key={o.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-slate-900">
                        {o.order_number}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-slate-900">{o.customer_name}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3" />
                          <span>{o.customer_phone}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-600">
                        {o.items && o.items.length > 0 ? (
                          <div className="flex items-center gap-2">
                            {o.items[0].image && (
                              <img
                                src={o.items[0].image}
                                alt="thumb"
                                className="w-8 h-8 rounded-lg object-contain bg-slate-100 border border-slate-200/80 p-0.5 shrink-0"
                              />
                            )}
                            <div className="truncate max-w-[180px]">
                              <span className="font-bold text-slate-800 text-xs">{o.items[0].name}</span>
                              <span className="text-[10px] text-slate-400 block">Qty: {o.items[0].quantity}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">Direct Order</span>
                        )}
                      </td>
                      <td className="py-4 px-6 font-black text-slate-900">
                        ৳{Number(o.total_amount).toLocaleString()}
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-xs uppercase font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                          {o.payment_method}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <select
                          value={o.order_status}
                          disabled={updatingId === o.id}
                          onChange={e => handleUpdateStatus(o.id, e.target.value)}
                          className={`text-xs font-bold py-1 px-2.5 rounded-full border cursor-pointer outline-none capitalize ${getStatusBadge(
                            o.order_status
                          )}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="py-4 px-6 text-slate-400 text-xs whitespace-nowrap">
                        {new Date(o.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Order Details</span>
                  <h3 className="text-xl font-black text-slate-900 font-mono mt-0.5">{selectedOrder.order_number}</h3>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Customer summary */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-bold uppercase tracking-wider">Customer Name</span>
                  <span className="font-bold text-slate-900">{selectedOrder.customer_name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-bold uppercase tracking-wider">Phone</span>
                  <a href={`tel:${selectedOrder.customer_phone}`} className="font-bold text-orange-600 hover:underline">
                    {selectedOrder.customer_phone}
                  </a>
                </div>
                {selectedOrder.customer_email && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-bold uppercase tracking-wider">Email</span>
                    <span className="font-medium text-slate-700">{selectedOrder.customer_email}</span>
                  </div>
                )}
                <div className="flex items-start justify-between pt-1 border-t border-slate-200/60">
                  <span className="text-slate-400 font-bold uppercase tracking-wider">Delivery Address</span>
                  <span className="font-medium text-slate-800 text-right max-w-[280px]">
                    {selectedOrder.shipping_address} ({selectedOrder.delivery_zone === 'outside_dhaka' ? 'Outside Dhaka' : 'Inside Dhaka'})
                  </span>
                </div>
                {selectedOrder.order_notes && (
                  <div className="flex items-start justify-between pt-1 border-t border-slate-200/60">
                    <span className="text-slate-400 font-bold uppercase tracking-wider">Notes</span>
                    <span className="font-medium text-slate-600 text-right max-w-[280px] italic">
                      "{selectedOrder.order_notes}"
                    </span>
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Items Ordered</h4>
                <div className="space-y-2">
                  {selectedOrder.items && selectedOrder.items.map((it, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white">
                      <div className="flex items-center gap-3">
                        {it.image && (
                          <img src={it.image} alt={it.name} className="w-10 h-10 rounded-lg object-contain bg-slate-50 p-1 border border-slate-200/60" />
                        )}
                        <div>
                          <div className="font-bold text-slate-900 text-xs">{it.name}</div>
                          <div className="text-[11px] text-slate-400">Qty: {it.quantity} × ৳{Number(it.price).toLocaleString()}</div>
                        </div>
                      </div>
                      <span className="font-black text-slate-900 text-sm">৳{(it.price * it.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cost summary */}
              <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900">৳{Number(selectedOrder.subtotal).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery Fee</span>
                  <span className="font-bold text-slate-900">৳{Number(selectedOrder.shipping_fee).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Payable</span>
                  <span className="text-orange-600 text-lg">৳{Number(selectedOrder.total_amount).toLocaleString()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex gap-3">
                <a
                  href={`https://api.whatsapp.com/send?phone=88${selectedOrder.customer_phone.replace(/[^0-9]/g, '')}&text=${encodeURIComponent(
                    `Hello ${selectedOrder.customer_name}, this is Color Hut Studio regarding your order ${selectedOrder.order_number}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>WhatsApp Customer</span>
                </a>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-bold text-xs transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
