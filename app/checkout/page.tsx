'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShoppingBag,
  ShieldCheck,
  Truck,
  ArrowLeft,
  CheckCircle2,
  Phone,
  MapPin,
  User,
  Mail,
  FileText,
  CreditCard,
  Banknote,
  Clock,
  Sparkles,
  AlertCircle
} from 'lucide-react';

interface CartItem {
  id: number;
  name: string;
  slug?: string;
  price: number;
  quantity: number;
  image: string;
  category_name?: string;
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const productIdParam = searchParams.get('product') || searchParams.get('productId');
  const qtyParam = searchParams.get('qty') || '1';

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState<number>(Math.max(1, parseInt(qtyParam) || 1));

  // Form inputs
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [city, setCity] = useState('Dhaka');
  const [deliveryZone, setDeliveryZone] = useState<'inside_dhaka' | 'outside_dhaka'>('inside_dhaka');
  const [orderNotes, setOrderNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash'>('cod');

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [orderSuccess, setOrderSuccess] = useState<any>(null);

  // Delivery Charges (Configured from admin)
  const [shippingRates, setShippingRates] = useState({
    inside_dhaka: 70,
    outside_dhaka: 130
  });

  useEffect(() => {
    fetch('/api/public/config')
      .then(res => res.ok ? res.json() : null)
      .then(cfg => {
        if (cfg) {
          setShippingRates({
            inside_dhaka: cfg.delivery_inside_dhaka !== undefined ? Number(cfg.delivery_inside_dhaka) : 70,
            outside_dhaka: cfg.delivery_outside_dhaka !== undefined ? Number(cfg.delivery_outside_dhaka) : 130
          });
        }
      })
      .catch(() => {});
  }, []);

  // Pre-fill user session if logged in
  useEffect(() => {
    fetch('/api/user/me')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          if (data.name) setCustomerName(data.name);
          if (data.email) setCustomerEmail(data.email);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch product if productIdParam is present
  useEffect(() => {
    if (!productIdParam) {
      setLoading(false);
      return;
    }

    fetch(`/api/public/products/${productIdParam}`)
      .then(res => {
        if (!res.ok) throw new Error('Product not found');
        return res.json();
      })
      .then(data => {
        setProduct(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setErrorMessage('Could not load selected product. Please select a product from store.');
        setLoading(false);
      });
  }, [productIdParam]);

  // Format image helper
  const formatImg = (url?: string) => {
    if (!url) return 'https://via.placeholder.com/300';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    if (url.startsWith('/uploads/')) return url;
    if (url.startsWith('/')) return '/uploads' + url;
    return '/uploads/' + url;
  };

  // Extract first image from product
  const getProductImage = () => {
    if (!product || !product.image) return 'https://via.placeholder.com/300';
    let img = product.image;
    try {
      if (img.startsWith('[')) {
        const arr = JSON.parse(img);
        img = arr[0] || '';
      }
    } catch (e) {}
    return formatImg(img);
  };

  // Calculations
  const unitPrice = product?.price ? Number(product.price) : 0;
  const subtotal = unitPrice * quantity;
  const shippingFee = deliveryZone === 'outside_dhaka' ? shippingRates.outside_dhaka : shippingRates.inside_dhaka;
  const totalAmount = subtotal + shippingFee;

  // Handle Form Submit
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customerName.trim()) {
      setErrorMessage('Please enter your full name');
      return;
    }
    if (!customerPhone.trim() || customerPhone.trim().length < 10) {
      setErrorMessage('Please enter a valid mobile number (e.g. 01XXXXXXXXX)');
      return;
    }
    if (!shippingAddress.trim()) {
      setErrorMessage('Please enter your complete delivery address');
      return;
    }

    if (!product || !product.id) {
      setErrorMessage('No valid product found in cart');
      return;
    }

    setSubmitting(true);

    const orderPayload = {
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_email: customerEmail || null,
      shipping_address: shippingAddress,
      city,
      delivery_zone: deliveryZone,
      order_notes: orderNotes || null,
      payment_method: paymentMethod,
      items: [
        {
          product_id: product.id,
          name: product.name,
          slug: product.slug,
          price: unitPrice,
          quantity: quantity,
          image: getProductImage()
        }
      ]
    };

    try {
      const response = await fetch('/api/public/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to place order. Please try again.');
      }

      setOrderSuccess({
        orderNumber: data.orderNumber,
        totalAmount: data.totalAmount,
        customerName,
        customerPhone,
        shippingAddress,
        deliveryZone,
        paymentMethod,
        items: orderPayload.items
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while placing your order.');
    } finally {
      setSubmitting(false);
    }
  };

  // WhatsApp Support trigger
  const handleWhatsAppHelp = (orderNum?: string) => {
    const phone = '8801919760626';
    const text = orderNum
      ? `Hello Color Hut Studio, I just placed order ${orderNum}. Can you please confirm the delivery schedule?`
      : `Hello Color Hut Studio, I have a question about checkout.`;
    window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(text)}`, '_blank');
  };

  // SUCCESS VIEW
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-100 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500" />
            
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-8 ring-emerald-50">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <span className="text-xs font-black tracking-widest text-emerald-600 uppercase bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
              Order Confirmed
            </span>

            <h1 className="text-3xl font-black text-slate-900 mt-4 tracking-tight">
              Thank You for Your Order!
            </h1>
            <p className="text-slate-600 text-sm mt-2 max-w-md mx-auto">
              We received your order and will contact you shortly to confirm the shipment details.
            </p>

            <div className="mt-8 bg-slate-50 rounded-2xl p-6 border border-slate-100 text-left space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Order Number</span>
                <span className="font-mono font-black text-slate-900 text-base">{orderSuccess.orderNumber}</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Recipient</span>
                <span className="font-bold text-slate-800 text-sm">{orderSuccess.customerName} ({orderSuccess.customerPhone})</span>
              </div>
              <div className="flex items-start justify-between pb-3 border-b border-slate-200">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Delivery Address</span>
                <span className="font-medium text-slate-700 text-sm text-right max-w-[260px]">{orderSuccess.shippingAddress}</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Payment</span>
                <span className="font-bold text-slate-800 text-sm uppercase">
                  {orderSuccess.paymentMethod === 'cod' ? 'Cash on Delivery' : 'bKash / Online'}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-sm font-black text-slate-900 uppercase">Total Amount</span>
                <span className="text-2xl font-black text-orange-600">৳{Number(orderSuccess.totalAmount).toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => handleWhatsAppHelp(orderSuccess.orderNumber)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
              >
                <Phone className="w-4 h-4" />
                <span>Confirm on WhatsApp</span>
              </button>
              <Link
                href="/all/"
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-3.5 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <span>Continue Shopping</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // LOADING STATE
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 text-center max-w-sm w-full">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h3 className="font-bold text-slate-900">Preparing Direct Checkout...</h3>
          <p className="text-xs text-slate-400 mt-1">Please wait a moment</p>
        </div>
      </div>
    );
  }

  // EMPTY / ERROR STATE
  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">No Product Selected</h2>
          <p className="text-sm text-slate-500 mt-2 mb-6">
            Please browse our collections and click "Buy Now" on any product to checkout directly.
          </p>
          <Link
            href="/all/"
            className="inline-flex items-center gap-2 bg-orange-600 text-white font-bold py-3.5 px-8 rounded-2xl hover:bg-orange-700 transition-all shadow-lg shadow-orange-500/20"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Browse Products</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-16">
      {/* Top Professional Header */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <img 
              src="/logo.png" 
              alt="Color Hut" 
              width={140} 
              height={44} 
              className="h-9 sm:h-10 w-auto object-contain transition-transform group-hover:scale-105" 
            />
            <span className="hidden sm:inline-block h-5 w-px bg-slate-200"></span>

          </Link>


        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Complete Your Order</h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Fill in your delivery address below to place your order directly.
            </p>
          </div>
          <Link
            href={`/p/${product.id}/${product.slug || 'view'}`}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-orange-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Product</span>
          </Link>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-sm font-semibold">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Checkout Inputs (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Customer Information */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <h3 className="font-bold text-slate-900 text-base">Customer Information</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Tanmoy Roy"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-orange-500 focus:bg-white text-slate-900 font-medium text-sm transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="017XXXXXXXX"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-orange-500 focus:bg-white text-slate-900 font-medium text-sm transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Email Address <span className="text-slate-400 text-[10px] lowercase font-normal">(optional)</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-orange-500 focus:bg-white text-slate-900 font-medium text-sm transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Delivery Address */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <h3 className="font-bold text-slate-900 text-base">Delivery Address</h3>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Detailed Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <textarea
                    required
                    rows={3}
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="House/Holding no, Road no/name, Thana, District"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:border-orange-500 focus:bg-white text-slate-900 font-medium text-sm transition-all resize-none"
                  />
                </div>
              </div>

              {/* Delivery Zone Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Select Delivery Zone
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    onClick={() => { setDeliveryZone('inside_dhaka'); setCity('Dhaka'); }}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                      deliveryZone === 'inside_dhaka'
                        ? 'border-orange-500 bg-orange-50/40 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="delivery_zone"
                        checked={deliveryZone === 'inside_dhaka'}
                        onChange={() => { setDeliveryZone('inside_dhaka'); setCity('Dhaka'); }}
                        className="text-orange-600 focus:ring-orange-500 h-4 w-4"
                      />
                      <div>
                        <div className="font-bold text-slate-900 text-sm">Inside Dhaka</div>
                        <div className="text-[11px] text-slate-500">24 - 48 Hours Delivery</div>
                      </div>
                    </div>
                    <span className="font-extrabold text-slate-900 text-sm">৳{shippingRates.inside_dhaka}</span>
                  </label>

                  <label
                    onClick={() => { setDeliveryZone('outside_dhaka'); setCity('Outside Dhaka'); }}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                      deliveryZone === 'outside_dhaka'
                        ? 'border-orange-500 bg-orange-50/40 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="delivery_zone"
                        checked={deliveryZone === 'outside_dhaka'}
                        onChange={() => { setDeliveryZone('outside_dhaka'); setCity('Outside Dhaka'); }}
                        className="text-orange-600 focus:ring-orange-500 h-4 w-4"
                      />
                      <div>
                        <div className="font-bold text-slate-900 text-sm">Outside Dhaka</div>
                        <div className="text-[11px] text-slate-500">2 - 3 Days Delivery</div>
                      </div>
                    </div>
                    <span className="font-extrabold text-slate-900 text-sm">৳{shippingRates.outside_dhaka}</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Order Note <span className="text-slate-400 text-[10px] lowercase font-normal">(optional instructions)</span>
                </label>
                <input
                  type="text"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="e.g. Call before delivery or deliver in afternoon"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-orange-500 focus:bg-white text-slate-900 font-medium text-sm transition-all"
                />
              </div>
            </div>

            {/* 3. Payment Method */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <h3 className="font-bold text-slate-900 text-base">Payment Method</h3>
              </div>

              <div className="space-y-3">
                <label
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                    paymentMethod === 'cod'
                      ? 'border-orange-500 bg-orange-50/40 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment_method"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="text-orange-600 focus:ring-orange-500 h-4 w-4"
                    />
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <Banknote className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">Cash on Delivery (COD)</div>
                      <div className="text-[11px] text-slate-500">Pay cash in hand when your parcel arrives</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    Recommended
                  </span>
                </label>

                <label
                  onClick={() => setPaymentMethod('bkash')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                    paymentMethod === 'bkash'
                      ? 'border-orange-500 bg-orange-50/40 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment_method"
                      checked={paymentMethod === 'bkash'}
                      onChange={() => setPaymentMethod('bkash')}
                      className="text-orange-600 focus:ring-orange-500 h-4 w-4"
                    />
                    <div className="w-9 h-9 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center font-black text-xs">
                      bK
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">bKash / Nagad / Online</div>
                      <div className="text-[11px] text-slate-500">Send money or pay via merchant number upon confirmation</div>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Place Order (5 cols) */}
          <div className="lg:col-span-5 sticky top-24 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-6">
              <h3 className="font-bold text-slate-900 text-base pb-3 border-b border-slate-100 flex items-center justify-between">
                <span>Order Summary</span>
                <span className="text-xs font-bold text-slate-400">1 Item</span>
              </h3>

              {/* Product item card */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 shrink-0">
                  <img
                    src={getProductImage()}
                    alt={product.name}
                    className="w-full h-full object-contain p-1"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 text-sm leading-snug truncate">
                    {product.name}
                  </h4>
                  <div className="text-orange-600 font-extrabold text-sm mt-0.5">
                    ৳{unitPrice.toLocaleString()}
                  </div>

                  {/* Quantity selector */}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-slate-400 font-medium">Qty:</span>
                    <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                      <button
                        type="button"
                        onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                        className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-200 font-bold active:scale-90 transition-all"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-xs font-black text-slate-900">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity(prev => prev + 1)}
                        className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-200 font-bold active:scale-90 transition-all"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="pt-4 border-t border-slate-100 space-y-2.5">
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>Subtotal ({quantity} {quantity > 1 ? 'items' : 'item'})</span>
                  <span className="font-bold text-slate-900">৳{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>Delivery Charge</span>
                  <span className="font-bold text-slate-900">৳{shippingFee}</span>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-base font-black text-slate-900 uppercase">Total Payable</span>
                  <div className="text-right">
                    <span className="text-2xl font-black text-orange-600">
                      ৳{totalAmount.toLocaleString()}
                    </span>
                    <div className="text-[10px] text-slate-400 font-semibold">VAT Included</div>
                  </div>
                </div>
              </div>

              {/* Place Order CTA */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white py-4 px-6 rounded-2xl font-extrabold text-base shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-300 active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Placing Order...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Confirm Order • ৳{totalAmount.toLocaleString()}</span>
                  </>
                )}
              </button>

              {/* Security badges */}
              <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-3 text-[11px] text-slate-500 font-medium">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-orange-500 shrink-0" />
                  <span>Fast Express Shipping</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Authentic Studio Quality</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
