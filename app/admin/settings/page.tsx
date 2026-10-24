'use client';

import AdminSidebar from '../AdminSidebar';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Tag, 
  Check, 
  Loader2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Send,
  ShieldCheck, 
  Zap, 
  Globe, 
  RotateCw, 
  ShoppingBag, 
  CreditCard,
  Truck,
  ExternalLink,
  Lock,
  Settings
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [showToken, setShowToken] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | null }>({
    message: '',
    type: null
  });

  // Google Tag Manager Form State
  const [gtmEnabled, setGtmEnabled] = useState(false);
  const [gtmContainerId, setGtmContainerId] = useState('');
  const [isSavingGtm, setIsSavingGtm] = useState(false);

  // Meta Pixel & Conversions API Form State
  const [metaEnabled, setMetaEnabled] = useState(false);
  const [pixelId, setPixelId] = useState('');
  const [testEventCode, setTestEventCode] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [isSavingMeta, setIsSavingMeta] = useState(false);

  // PayStation Payment Gateway Form State
  const [paystationEnabled, setPaystationEnabled] = useState(true);
  const [paystationEnv, setPaystationEnv] = useState<'sandbox' | 'live'>('sandbox');
  const [paystationMerchantId, setPaystationMerchantId] = useState('');
  const [paystationPassword, setPaystationPassword] = useState('');
  const [showPaystationPassword, setShowPaystationPassword] = useState(false);
  const [isSavingPaystation, setIsSavingPaystation] = useState(false);
  const [isTestingPaystation, setIsTestingPaystation] = useState(false);
  const [paystationTestResult, setPaystationTestResult] = useState<{ success?: boolean; message?: string; url?: string } | null>(null);

  // Delivery & Shipping Rates State
  const [deliveryInsideDhaka, setDeliveryInsideDhaka] = useState('70');
  const [deliveryOutsideDhaka, setDeliveryOutsideDhaka] = useState('130');
  const [isSavingDelivery, setIsSavingDelivery] = useState(false);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: null }), 4500);
  };

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        setGtmEnabled(data.gtm_enabled === 'true');
        setGtmContainerId(data.gtm_container_id || '');
        
        setMetaEnabled(data.meta_pixel_enabled === 'true');
        setPixelId(data.meta_pixel_id || '');
        setTestEventCode(data.meta_test_event_code || '');
        setAccessToken(data.meta_capi_token || '');

        setPaystationEnabled(data.paystation_enabled !== 'false');
        setPaystationEnv(data.paystation_env === 'live' ? 'live' : 'sandbox');
        setPaystationMerchantId(data.paystation_merchant_id || '');
        setPaystationPassword(data.paystation_password || '');

        setDeliveryInsideDhaka(data.delivery_inside_dhaka || '70');
        setDeliveryOutsideDhaka(data.delivery_outside_dhaka || '130');
      } else if (res.status === 401) {
        showNotification('Admin session not detected. Please log in to view and save settings.', 'error');
      } else {
        showNotification('Failed to load settings from server.', 'error');
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Save GTM Settings
  const handleSaveGtm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingGtm(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gtm_enabled: gtmEnabled ? 'true' : 'false',
          gtm_container_id: gtmContainerId.trim()
        })
      });

      if (res.ok) {
        showNotification('Google Tag Manager settings saved successfully!');
      } else {
        const contentType = res.headers.get('content-type') || '';
        let errorMsg = 'Failed to save GTM settings.';
        if (contentType.includes('application/json')) {
          const data = await res.json().catch(() => ({}));
          if (data.error) errorMsg = data.error;
        }
        showNotification(errorMsg, 'error');
      }
    } catch (err: any) {
      showNotification(err.message || 'Network error while saving GTM settings.', 'error');
    } finally {
      setIsSavingGtm(false);
    }
  };

  // Save Meta Settings
  const handleSaveMeta = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingMeta(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meta_pixel_enabled: metaEnabled ? 'true' : 'false',
          meta_pixel_id: pixelId.trim(),
          meta_test_event_code: testEventCode.trim(),
          meta_capi_token: accessToken.trim()
        })
      });

      if (res.ok) {
        showNotification('Meta Pixel & Conversions API settings saved successfully!');
      } else {
        const contentType = res.headers.get('content-type') || '';
        let errorMsg = 'Failed to save Meta settings.';
        if (contentType.includes('application/json')) {
          const data = await res.json().catch(() => ({}));
          if (data.error) errorMsg = data.error;
        }
        showNotification(errorMsg, 'error');
      }
    } catch (err: any) {
      showNotification(err.message || 'Network error while saving Meta settings.', 'error');
    } finally {
      setIsSavingMeta(false);
    }
  };

  // Save PayStation Settings
  const handleSavePaystation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPaystation(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paystation_enabled: paystationEnabled ? 'true' : 'false',
          paystation_env: paystationEnv,
          paystation_merchant_id: paystationMerchantId.trim(),
          paystation_password: paystationPassword.trim()
        })
      });

      if (res.ok) {
        showNotification('PayStation settings saved successfully!');
      } else {
        showNotification('Failed to save PayStation settings.', 'error');
      }
    } catch (err: any) {
      showNotification('Network error while saving PayStation settings.', 'error');
    } finally {
      setIsSavingPaystation(false);
    }
  };

  // Save Delivery Rates
  const handleSaveDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingDelivery(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          delivery_inside_dhaka: deliveryInsideDhaka.trim(),
          delivery_outside_dhaka: deliveryOutsideDhaka.trim()
        })
      });

      if (res.ok) {
        showNotification('Delivery charges updated successfully!');
      } else {
        showNotification('Failed to save delivery charges.', 'error');
      }
    } catch (err: any) {
      showNotification(err.message || 'Network error while saving delivery charges.', 'error');
    } finally {
      setIsSavingDelivery(false);
    }
  };

  // Test PayStation Gateway Connection
  const handleTestPaystation = async () => {
    setIsTestingPaystation(true);
    setPaystationTestResult(null);
    try {
      const res = await fetch('/api/admin/tracking/test-paystation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPaystationTestResult({
          success: true,
          message: data.message || 'Connected to PayStation successfully!',
          url: data.paymentUrl
        });
        showNotification(`PayStation (${data.environment?.toUpperCase()}) test link created successfully!`);
      } else {
        setPaystationTestResult({
          success: false,
          message: data.error || 'Failed to connect to PayStation'
        });
        showNotification(data.error || 'PayStation connection failed', 'error');
      }
    } catch (err: any) {
      setPaystationTestResult({
        success: false,
        message: err.message || 'Network error connecting to PayStation'
      });
    } finally {
      setIsTestingPaystation(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F3F5F9] font-sans antialiased text-slate-800">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Sticky Top Navbar */}
        <header className="h-[72px] border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-6 sm:px-9 flex items-center justify-between shrink-0 sticky top-0 z-30 shadow-xs">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <Settings className="w-5 h-5 text-orange-600" />
              <span>Store Settings & Integrations</span>
            </h1>
            <p className="text-xs font-semibold text-slate-500">
              Payment gateways, Meta CAPI, Google Tag Manager & Shipping Fees
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={fetchSettings}
              className="p-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors shadow-xs cursor-pointer"
              title="Refresh settings"
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
          </div>
        </header>

        {/* Toast Notification */}
        {toast.message && (
          <div className={`fixed top-20 right-8 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border transition-all duration-300 ${
            toast.type === 'success' 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900 shadow-emerald-500/10' 
              : 'bg-rose-50 border-rose-200 text-rose-900 shadow-rose-500/10'
          }`}>
            {toast.type === 'success' ? (
              <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0">
                <AlertCircle className="w-3.5 h-3.5" />
              </div>
            )}
            <p className="text-xs sm:text-sm font-bold">{toast.message}</p>
          </div>
        )}

        {/* Scrollable Page Body with Balanced 2-Column Responsive Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-7 md:p-8">
          <div className="max-w-[1400px] w-full mx-auto pb-12">
            
            {isLoading ? (
              <div className="py-24 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-orange-600 mb-3" />
                <p className="text-xs font-bold uppercase tracking-wider">Loading settings...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* ================= LEFT COLUMN: PAYMENTS & SHIPPING (7 COLS) ================= */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {/* CARD 1: PAYSTATION PAYMENT GATEWAY */}
                  <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-7 transition-all hover:border-slate-300">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                              PayStation Payment Gateway
                            </h3>
                            <span className="text-[10px] font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                              Bangladesh Bank PSO
                            </span>
                          </div>
                          <p className="text-xs font-medium text-slate-400 mt-0.5">
                            Accept bKash, Nagad, Rocket, Visa, Mastercard & Internet Banking directly.
                          </p>
                        </div>
                      </div>

                      {/* Enable / Disable Switch */}
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input 
                          type="checkbox" 
                          checked={paystationEnabled}
                          onChange={(e) => setPaystationEnabled(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500" />
                        <span className="ml-2.5 text-xs font-bold text-slate-700">
                          {paystationEnabled ? 'Active' : 'Disabled'}
                        </span>
                      </label>
                    </div>

                    <form onSubmit={handleSavePaystation} className="pt-5 space-y-4">
                      {/* Environment Selector: Sandbox vs Live */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Gateway Environment
                        </label>
                        <div className="grid grid-cols-2 gap-3 max-w-sm">
                          <button
                            type="button"
                            onClick={() => setPaystationEnv('sandbox')}
                            className={`py-2 px-3.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                              paystationEnv === 'sandbox'
                                ? 'bg-amber-50 border-amber-300 text-amber-800 ring-2 ring-amber-400/20'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white'
                            }`}
                          >
                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                            <span>Sandbox (Testing)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setPaystationEnv('live')}
                            className={`py-2 px-3.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                              paystationEnv === 'live'
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 ring-2 ring-emerald-400/20'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white'
                            }`}
                          >
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span>Live (Production)</span>
                          </button>
                        </div>
                        <p className="text-[11px] font-medium text-slate-400 mt-1.5">
                          {paystationEnv === 'sandbox'
                            ? 'Sandbox uses test endpoint (https://sandbox.paystation.com.bd) with test bKash/Cards.'
                            : 'Live uses production endpoint (https://api.paystation.com.bd) for real customer payments.'}
                        </p>
                      </div>

                      {/* Merchant ID Input */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Merchant ID
                        </label>
                        <input 
                          type="text" 
                          value={paystationMerchantId}
                          onChange={(e) => setPaystationMerchantId(e.target.value)}
                          placeholder={paystationEnv === 'sandbox' ? '104-1653730183 (Default Sandbox ID)' : 'Enter your Production Merchant ID'}
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                        />
                        <p className="text-[11px] font-medium text-slate-400 mt-1">
                          Can also be set in <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono text-[10px]">.env</code> as <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono text-[10px]">PAYSTATION_MERCHANT_ID</code>
                        </p>
                      </div>

                      {/* Password / Secret Key Input */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-bold text-slate-700">
                            Password / Secret Key
                          </label>
                          <button
                            type="button"
                            onClick={() => setShowPaystationPassword(!showPaystationPassword)}
                            className="text-[11px] font-bold text-slate-400 hover:text-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            {showPaystationPassword ? (
                              <>
                                <EyeOff className="w-3.5 h-3.5" />
                                <span>Hide</span>
                              </>
                            ) : (
                              <>
                                <Eye className="w-3.5 h-3.5" />
                                <span>Show</span>
                              </>
                            )}
                          </button>
                        </div>
                        <input 
                          type={showPaystationPassword ? 'text' : 'password'} 
                          value={paystationPassword}
                          onChange={(e) => setPaystationPassword(e.target.value)}
                          placeholder={paystationEnv === 'sandbox' ? 'gamecoderstorepass (Default Sandbox Password)' : 'Enter your Production Password'}
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                        />
                        <p className="text-[11px] font-medium text-slate-400 mt-1">
                          Can also be set in <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono text-[10px]">.env</code> as <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono text-[10px]">PAYSTATION_PASSWORD</code>
                        </p>
                      </div>

                      {/* Test Connection Banner if run */}
                      {paystationTestResult && (
                        <div className={`p-3.5 rounded-2xl border text-xs font-medium ${
                          paystationTestResult.success
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : 'bg-red-50 border-red-200 text-red-800'
                        }`}>
                          <div className="flex items-center gap-2 font-bold mb-1">
                            {paystationTestResult.success ? (
                              <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-red-600" />
                            )}
                            <span>{paystationTestResult.message}</span>
                          </div>
                          {paystationTestResult.url && (
                            <div className="mt-2 pt-2 border-t border-emerald-200 flex items-center justify-between gap-3">
                              <span className="truncate text-[11px] font-mono text-emerald-700">
                                {paystationTestResult.url}
                              </span>
                              <a
                                href={paystationTestResult.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1 bg-emerald-600 text-white rounded-lg font-bold text-[11px] shrink-0 hover:bg-emerald-700 transition-colors"
                              >
                                Open Test Link
                              </a>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Action Buttons: Save & Test Connection */}
                      <div className="pt-2 flex flex-col sm:flex-row gap-3">
                        <button
                          type="submit"
                          disabled={isSavingPaystation}
                          className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-xs shadow-orange-500/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                        >
                          {isSavingPaystation ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Saving...</span>
                            </>
                          ) : (
                            <span>Save PayStation Settings</span>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={handleTestPaystation}
                          disabled={isTestingPaystation}
                          className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 shrink-0 cursor-pointer"
                        >
                          {isTestingPaystation ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Testing...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" />
                              <span>Test Gateway</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* CARD 2: DELIVERY & SHIPPING CHARGES */}
                  <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-7 transition-all hover:border-slate-300">
                    <div className="flex items-center gap-3 pb-5 border-b border-slate-100">
                      <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shrink-0">
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                          Delivery & Shipping Charges
                        </h3>
                        <p className="text-xs font-medium text-slate-400 mt-0.5">
                          Standard flat delivery fees calculated at checkout
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleSaveDelivery} className="pt-5 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Inside Dhaka (৳)
                          </label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">৳</span>
                            <input 
                              type="number" 
                              min="0"
                              value={deliveryInsideDhaka}
                              onChange={(e) => setDeliveryInsideDhaka(e.target.value)}
                              placeholder="70"
                              className="w-full pl-8 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                            />
                          </div>
                          <p className="text-[11px] font-medium text-slate-400 mt-1">
                            Applied when customer selects Inside Dhaka
                          </p>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5">
                            Outside Dhaka (৳)
                          </label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">৳</span>
                            <input 
                              type="number" 
                              min="0"
                              value={deliveryOutsideDhaka}
                              onChange={(e) => setDeliveryOutsideDhaka(e.target.value)}
                              placeholder="130"
                              className="w-full pl-8 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
                            />
                          </div>
                          <p className="text-[11px] font-medium text-slate-400 mt-1">
                            Applied for all destinations outside Dhaka
                          </p>
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={isSavingDelivery}
                          className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                        >
                          {isSavingDelivery ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Saving...</span>
                            </>
                          ) : (
                            <span>Save Delivery Rates</span>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>

                </div>

                {/* ================= RIGHT COLUMN: META, GTM & OVERVIEW (5 COLS) ================= */}
                <div className="lg:col-span-5 space-y-6">
                  
                  {/* CARD 3: META PIXEL & CONVERSIONS API */}
                  <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-7 transition-all hover:border-slate-300">
                    <div className="flex items-center justify-between gap-4 pb-5 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 font-black text-lg">
                          f
                        </div>
                        <div>
                          <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                            Meta Pixel & CAPI
                          </h3>
                          <p className="text-xs font-medium text-slate-400 mt-0.5">
                            Facebook Pixel & Server Conversions API
                          </p>
                        </div>
                      </div>

                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input 
                          type="checkbox" 
                          checked={metaEnabled}
                          onChange={(e) => setMetaEnabled(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                        <span className="ml-2.5 text-xs font-bold text-slate-700">
                          {metaEnabled ? 'Active' : 'Off'}
                        </span>
                      </label>
                    </div>

                    <form onSubmit={handleSaveMeta} className="pt-5 space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Pixel ID
                        </label>
                        <input 
                          type="text" 
                          value={pixelId}
                          onChange={(e) => setPixelId(e.target.value)}
                          placeholder="e.g. 1612211706630628"
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Test Event Code (Optional)
                        </label>
                        <input 
                          type="text" 
                          value={testEventCode}
                          onChange={(e) => setTestEventCode(e.target.value)}
                          placeholder="e.g. TEST54520"
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-bold text-slate-700">
                            CAPI Access Token
                          </label>
                          <button
                            type="button"
                            onClick={() => setShowToken(!showToken)}
                            className="text-[11px] font-bold text-slate-400 hover:text-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            {showToken ? (
                              <>
                                <EyeOff className="w-3.5 h-3.5" />
                                <span>Hide</span>
                              </>
                            ) : (
                              <>
                                <Eye className="w-3.5 h-3.5" />
                                <span>Show</span>
                              </>
                            )}
                          </button>
                        </div>
                        <input 
                          type={showToken ? 'text' : 'password'} 
                          value={accessToken}
                          onChange={(e) => setAccessToken(e.target.value)}
                          placeholder="Paste EAAG... Meta token"
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        />
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={isSavingMeta}
                          className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                        >
                          {isSavingMeta ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Saving...</span>
                            </>
                          ) : (
                            <span>Save Meta Settings</span>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* CARD 4: GOOGLE TAG MANAGER */}
                  <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-7 transition-all hover:border-slate-300">
                    <div className="flex items-center justify-between gap-4 pb-5 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                          <Tag className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-extrabold text-slate-900 leading-tight">
                            Google Tag Manager
                          </h3>
                          <p className="text-xs font-medium text-slate-400 mt-0.5">
                            Global tracking scripts & tags
                          </p>
                        </div>
                      </div>

                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input 
                          type="checkbox" 
                          checked={gtmEnabled}
                          onChange={(e) => setGtmEnabled(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500" />
                        <span className="ml-2.5 text-xs font-bold text-slate-700">
                          {gtmEnabled ? 'Active' : 'Off'}
                        </span>
                      </label>
                    </div>

                    <form onSubmit={handleSaveGtm} className="pt-5 space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Container ID
                        </label>
                        <input 
                          type="text" 
                          value={gtmContainerId}
                          onChange={(e) => setGtmContainerId(e.target.value)}
                          placeholder="GTM-XXXXXXX"
                          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                        />
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={isSavingGtm}
                          className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                        >
                          {isSavingGtm ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Saving...</span>
                            </>
                          ) : (
                            <span>Save GTM Settings</span>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* CARD 5: INTEGRATION HEALTH STATUS SUMMARY */}
                  <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-7 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                          Active System Status
                        </h4>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>

                    <div className="space-y-2.5 text-xs">
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 font-semibold">
                        <span className="text-slate-600">PayStation Gateway:</span>
                        <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] uppercase ${
                          paystationEnabled 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-slate-200 text-slate-700'
                        }`}>
                          {paystationEnabled ? (paystationEnv === 'live' ? 'Live Mode' : 'Sandbox Mode') : 'Disabled'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 font-semibold">
                        <span className="text-slate-600">Meta Conversions API:</span>
                        <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] uppercase ${
                          metaEnabled 
                            ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                            : 'bg-slate-200 text-slate-700'
                        }`}>
                          {metaEnabled ? 'Active' : 'Off'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 font-semibold">
                        <span className="text-slate-600">Google Tag Manager:</span>
                        <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] uppercase ${
                          gtmEnabled 
                            ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                            : 'bg-slate-200 text-slate-700'
                        }`}>
                          {gtmEnabled ? 'Active' : 'Off'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 font-semibold">
                        <span className="text-slate-600">Delivery Rates:</span>
                        <span className="font-mono font-bold text-slate-900">
                          ৳{deliveryInsideDhaka} / ৳{deliveryOutsideDhaka}
                        </span>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}