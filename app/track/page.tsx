'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  CreditCard,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Copy,
  Check,
  RotateCcw,
  ShieldCheck
} from 'lucide-react';

interface OrderItem {
  id?: number;
  product_id?: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface TrackedOrder {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  shipping_address: string;
  city: string;
  delivery_zone: string;
  payment_method: string;
  payment_status: 'pending' | 'paid' | 'failed';
  order_status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  transaction_id?: string;
  subtotal: number;
  shipping_fee: number;
  total_amount: number;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialQuery = 
    searchParams.get('phone') || 
    searchParams.get('order') || 
    searchParams.get('orderNumber') || 
    searchParams.get('q') || 
    '';

  const [searchInput, setSearchInput] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState<TrackedOrder[]>([]);
  const [selectedOrderIndex, setSelectedOrderIndex] = useState(0);
  const [searched, setSearched] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const fetchTracking = async (term: string) => {
    const cleanTerm = term.trim();
    if (!cleanTerm) return;

    setLoading(true);
    setError('');
    setSearched(true);

    try {
      const isOrderNum = cleanTerm.toUpperCase().startsWith('ORD-') || (cleanTerm.includes('-') && !cleanTerm.startsWith('+'));
      const queryParam = isOrderNum 
        ? `orderNumber=${encodeURIComponent(cleanTerm)}` 
        : `phone=${encodeURIComponent(cleanTerm)}`;

      const res = await fetch(`/api/public/orders-track?${queryParam}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'No order found with this information. Please check and try again.');
        setOrders([]);
      } else {
        const found = data.orders || [];
        setOrders(found);
        setSelectedOrderIndex(0);
        if (found.length === 0) {
          setError('No order found with this phone number or order number.');
        }
      }
    } catch (e: any) {
      setError(e.message || 'Something went wrong. Please check your connection and try again.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      setSearchInput(initialQuery);
      fetchTracking(initialQuery);
    }
  }, [initialQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTracking(searchInput);
  };

  const handleCopyOrderId = (idText: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(idText);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const formatImg = (url?: string) => {
    if (!url) return 'https://via.placeholder.com/100';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    if (url.startsWith('/uploads/')) return url;
    if (url.startsWith('/')) return '/uploads' + url;
    return '/uploads/' + url;
  };

  const getStepProgress = (orderStatus: string) => {
    const statusMap: Record<string, number> = {
      pending: 1,
      confirmed: 2,
      processing: 3,
      shipped: 4,
      delivered: 5,
      cancelled: 0
    };
    return statusMap[orderStatus] || 1;
  };

  const currentOrder = orders[selectedOrderIndex] || null;
  const currentStep = currentOrder ? getStepProgress(currentOrder.order_status) : 1;

  const steps = [
    {
      num: 1,
      title: 'Order Placed',
      desc: currentOrder ? new Date(currentOrder.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Pending review'
    },
    {
      num: 2,
      title: 'Confirmed',
      desc: currentOrder?.payment_status === 'paid' ? 'Paid via PayStation' : 'Cash on Delivery'
    },
    {
      num: 3,
      title: 'Packaging',
      desc: 'Preparing your items'
    },
    {
      num: 4,
      title: 'Shipped',
      desc: currentOrder?.delivery_zone === 'outside_dhaka' ? 'Courier Handover' : 'Out for Delivery'
    },
    {
      num: 5,
      title: 'Delivered',
      desc: 'Completed'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans py-8 sm:py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Simple, Friendly Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center space-y-2.5"
        >
          <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200/80 px-3.5 py-1 rounded-full text-orange-700 text-xs font-semibold">
            <Truck className="w-3.5 h-3.5" />
            <span>Order Tracking</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Track Your Delivery
          </h1>

          <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">
            Enter your mobile number or order number below. You don&apos;t need an account or password to check your order status.
          </p>
        </motion.div>

        {/* Clean, Unified Search Card (No Tabs Needed) */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-3.5 sm:p-5"
        >
          <form onSubmit={handleSearch}>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Enter Phone Number (01XXXXXXXXX) or Order ID (ORD-XXXX)..."
                  className="w-full pl-11 pr-10 py-3.5 sm:py-4 rounded-xl bg-slate-50/80 border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/10 transition-all font-medium"
                  required
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => setSearchInput('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-7 py-3.5 sm:py-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-60 cursor-pointer shadow-xs active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <span>Track Order</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="bg-red-50 border border-red-200/80 rounded-2xl p-4 text-red-800 text-xs sm:text-sm flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Order Not Found</span>
                <p className="text-red-700 mt-0.5">{error}</p>
                <p className="text-slate-500 text-xs mt-1">
                  Make sure you typed the exact 11 digits of your phone number (e.g. <code>01967363785</code>) or your Order ID (e.g. <code>ORD-261024-3499</code>).
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Multiple Orders Selector (when tracking by phone) */}
        {orders.length > 1 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2.5"
          >
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Found {orders.length} orders for this number:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {orders.map((ord, idx) => {
                const isSelected = idx === selectedOrderIndex;
                return (
                  <button
                    key={ord.id}
                    type="button"
                    onClick={() => setSelectedOrderIndex(idx)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white border-orange-500 ring-2 ring-orange-500/10 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                      <span>{ord.order_number}</span>
                      <span className={`text-[11px] capitalize px-2 py-0.5 rounded-full font-medium ${
                        ord.order_status === 'delivered'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-orange-50 text-orange-700'
                      }`}>
                        {ord.order_status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 mt-1.5">
                      <span>{new Date(ord.created_at).toLocaleDateString()}</span>
                      <span className="font-bold text-slate-800">৳{Number(ord.total_amount).toLocaleString()}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Order Details Result */}
        {currentOrder && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden"
          >
            {/* Order Top Bar */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                  Order Reference
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-lg sm:text-xl font-extrabold text-slate-900 font-mono">
                    {currentOrder.order_number}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyOrderId(currentOrder.order_number)}
                    className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer transition-colors"
                    title="Copy Order ID"
                  >
                    {copiedId ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Placed on {new Date(currentOrder.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Payment Badge */}
                <div className="text-xs font-medium px-3 py-1.5 rounded-full border flex items-center gap-1.5 bg-white border-slate-200 text-slate-700">
                  {currentOrder.payment_status === 'paid' ? (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Paid via PayStation
                    </span>
                  ) : (
                    <span className="text-amber-700 font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      Cash on Delivery
                    </span>
                  )}
                </div>

                {/* Status Badge */}
                <div className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border ${
                  currentOrder.order_status === 'delivered'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : currentOrder.order_status === 'cancelled'
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : 'bg-orange-50 text-orange-700 border-orange-200'
                }`}>
                  {currentOrder.order_status}
                </div>
              </div>
            </div>

            {/* Clean Timeline Stepper */}
            {currentOrder.order_status === 'cancelled' ? (
              <div className="p-6 bg-red-50 text-center text-xs sm:text-sm text-red-700 border-b border-red-100">
                This order was cancelled. If you have any questions, please reach out to our team below.
              </div>
            ) : (
              <div className="p-6 sm:p-8 border-b border-slate-100 bg-white">
                <div className="relative">
                  {/* Desktop connecting line */}
                  <div className="hidden sm:block absolute top-5 left-6 right-6 h-0.5 bg-slate-200 -z-0" />
                  <motion.div 
                    initial={{ width: '0%' }}
                    animate={{ width: `${Math.max(0, ((Math.min(currentStep, 5) - 1) / 4) * 100)}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="hidden sm:block absolute top-5 left-6 h-0.5 bg-orange-500 -z-0"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-5 sm:gap-2 relative z-10">
                    {steps.map((st) => {
                      const isCompleted = currentStep > st.num || currentOrder.order_status === 'delivered';
                      const isCurrent = currentStep === st.num && currentOrder.order_status !== 'delivered';

                      return (
                        <div key={st.num} className="flex sm:flex-col items-center sm:text-center gap-3 group">
                          {/* Dot / Check circle */}
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                            isCompleted
                              ? 'bg-emerald-600 text-white'
                              : isCurrent
                              ? 'bg-orange-600 text-white ring-4 ring-orange-100'
                              : 'bg-slate-100 border border-slate-200 text-slate-400'
                          }`}>
                            {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : st.num}
                          </div>

                          <div className="space-y-0.5 flex-1 sm:flex-initial">
                            <div className={`text-xs font-bold ${
                              isCompleted || isCurrent ? 'text-slate-900' : 'text-slate-400'
                            }`}>
                              {st.title}
                            </div>
                            <div className="text-[11px] text-slate-500 leading-tight">
                              {st.desc}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Content Body: Items & Delivery Details */}
            <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 bg-white">
              
              {/* Left: Ordered Items */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-slate-500" />
                  <span>Items in this order ({currentOrder.items?.length || 0})</span>
                </h3>

                <div className="space-y-3">
                  {(currentOrder.items || []).map((item, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100"
                    >
                      <img
                        src={formatImg(item.image)}
                        alt={item.name}
                        className="w-12 h-12 object-contain rounded-lg bg-white border border-slate-200 p-1 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-900 text-xs sm:text-sm truncate">{item.name}</h4>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Qty: <span className="font-semibold text-slate-700">{item.quantity}</span> × ৳{Number(item.price).toLocaleString()}
                        </div>
                      </div>
                      <div className="font-bold text-slate-900 text-xs sm:text-sm">
                        ৳{(Number(item.price) * (item.quantity || 1)).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Amount Summary */}
                <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-medium text-slate-800">৳{Number(currentOrder.subtotal).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery ({currentOrder.delivery_zone === 'outside_dhaka' ? 'Outside Dhaka' : 'Inside Dhaka'})</span>
                    <span className="font-medium text-slate-800">৳{Number(currentOrder.shipping_fee).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                    <span>Total Amount</span>
                    <span className="text-orange-600 text-base">
                      ৳{Number(currentOrder.total_amount).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Shipping Address & WhatsApp Contact */}
              <div className="space-y-5">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-3">
                    <MapPin className="w-4 h-4 text-slate-500" />
                    <span>Shipping Address</span>
                  </h3>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs space-y-2">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{currentOrder.customer_name}</div>
                      <div className="text-slate-600 mt-0.5">{currentOrder.customer_phone}</div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/70 text-slate-700 leading-relaxed">
                      {currentOrder.shipping_address}, {currentOrder.city}
                    </div>

                    {currentOrder.transaction_id && (
                      <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-medium">Transaction ID</span>
                        <span className="font-mono font-semibold text-slate-700">{currentOrder.transaction_id}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* WhatsApp Help Box */}
                <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-emerald-950 text-xs">Need Help With This Order?</div>
                      <div className="text-[11px] text-emerald-700">Chat with our customer service team on WhatsApp</div>
                    </div>
                  </div>

                  <a
                    href={`https://api.whatsapp.com/send?phone=8801919760626&text=${encodeURIComponent(
                      `Hello Color Hut, I would like to inquire about my order ${currentOrder.order_number} (Phone: ${currentOrder.customer_phone}).`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Contact Us on WhatsApp</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

              </div>

            </div>
          </motion.div>
        )}

        {/* Initial Clean Guide (when nothing searched yet) */}
        {!searched && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2 text-center">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-2 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto font-bold text-sm">
                1
              </div>
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Place an Order</h3>
              <p className="text-xs text-slate-500">Pay online via PayStation or Cash on Delivery at checkout.</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-2 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto font-bold text-sm">
                2
              </div>
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Enter Details Above</h3>
              <p className="text-xs text-slate-500">No account or password needed. Simply enter your mobile number or order ID.</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-2 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto font-bold text-sm">
                3
              </div>
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">Doorstep Delivery</h3>
              <p className="text-xs text-slate-500">Track packaging, courier dispatch, and delivery progress live.</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <TrackOrderContent />
    </Suspense>
  );
}
