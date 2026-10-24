'use client';

import AdminSidebar from '../AdminSidebar';
import React, { useState, useEffect } from 'react';
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
  ShoppingCart,
  CreditCard
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

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: null }), 4500);
  };

  // Load settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
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
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans antialiased text-slate-800">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Toast Notification */}
        {toast.message && (
          <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border transition-all duration-300 ${
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

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto px-6 py-8 md:px-12 md:py-10 max-w-5xl w-full">
          {/* Header Title Block */}
          <div className="mb-8">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Settings</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">
              Manage integrations, consultation availability, and security preferences.
            </p>
          </div>

          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500 mb-3" />
              <p className="text-xs font-bold uppercase tracking-wider">Loading settings...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* CARD 1: Google Tag Manager */}
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 transition-all hover:border-slate-300">
                {/* Card Header & Switch */}
                <div className="flex items-center justify-between gap-4 pb-6 border-b border-slate-100">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-slate-100/90 flex items-center justify-center text-slate-700 shrink-0">
                      <Tag className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 leading-tight">Google Tag Manager</h3>
                      <p className="text-xs font-medium text-slate-400 mt-0.5">Global script & tracking code</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={gtmEnabled}
                        onChange={(e) => setGtmEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900"></div>
                    </label>
                    <span className="text-xs font-bold text-slate-600 min-w-[48px]">
                      {gtmEnabled ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Form Inputs */}
                <form onSubmit={handleSaveGtm} className="pt-6 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Container ID
                    </label>
                    <input 
                      type="text" 
                      value={gtmContainerId}
                      onChange={(e) => setGtmContainerId(e.target.value)}
                      placeholder="GTM-XXXXXXX"
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all font-mono"
                    />
                    <p className="text-[11px] font-medium text-slate-400 mt-1.5">
                      Format: GTM-XXXXXXX
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSavingGtm}
                    className="w-full bg-[#0D1527] hover:bg-[#1E293B] text-white py-3.5 rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSavingGtm ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save GTM Settings'
                    )}
                  </button>
                </form>
              </div>

              {/* CARD 2: Meta Pixel & Conversions API */}
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 transition-all hover:border-slate-300">
                {/* Card Header & Switch */}
                <div className="flex items-center justify-between gap-4 pb-6 border-b border-slate-100">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-slate-100/90 flex items-center justify-center text-slate-700 shrink-0 font-black text-lg">
                      f
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 leading-tight">Meta Pixel & Conversions</h3>
                      <p className="text-xs font-medium text-slate-400 mt-0.5">Facebook Pixel & API integration</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={metaEnabled}
                        onChange={(e) => setMetaEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-12 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900"></div>
                    </label>
                    <span className="text-xs font-bold text-slate-600 min-w-[48px]">
                      {metaEnabled ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Form Inputs */}
                <form onSubmit={handleSaveMeta} className="pt-6 space-y-4">
                  {/* Two-Column: Pixel ID & Test Event Code */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Pixel ID
                      </label>
                      <input 
                        type="text" 
                        value={pixelId}
                        onChange={(e) => setPixelId(e.target.value)}
                        placeholder="e.g. 1859059352203255"
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Test Event Code
                      </label>
                      <input 
                        type="text" 
                        value={testEventCode}
                        onChange={(e) => setTestEventCode(e.target.value)}
                        placeholder="e.g. TEST79664"
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all font-mono"
                      />
                    </div>
                  </div>

                  {/* Access Token Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        Access Token
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowToken(!showToken)}
                        className="text-[11px] font-bold text-slate-400 hover:text-slate-700 flex items-center gap-1 transition-colors"
                      >
                        {showToken ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            Hide Token
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            Show Token
                          </>
                        )}
                      </button>
                    </div>

                    <div className="relative">
                      <input 
                        type={showToken ? 'text' : 'password'} 
                        value={accessToken}
                        onChange={(e) => setAccessToken(e.target.value)}
                        placeholder="Paste EAAG... access token from Meta Events Manager"
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all pr-10"
                      />
                    </div>
                    <p className="text-[11px] font-medium text-slate-400 mt-1.5">
                      Encrypted for secure API calls
                    </p>
                  </div>

                  {/* Save Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSavingMeta}
                      className="w-full bg-[#0D1527] hover:bg-[#1E293B] text-white py-3.5 rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSavingMeta ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Meta Settings'
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* CARD: PAYSTATION PAYMENT GATEWAY */}
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900 leading-tight">
                          PayStation Payment Gateway
                        </h3>
                        <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                          Bangladesh Bank PSO
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-500 mt-0.5">
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
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
                    <span className="ml-3 text-xs font-bold text-slate-700">
                      {paystationEnabled ? 'Active' : 'Disabled'}
                    </span>
                  </label>
                </div>

                <form onSubmit={handleSavePaystation} className="pt-6 space-y-5">
                  {/* Environment Selector: Sandbox vs Live */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Gateway Environment
                    </label>
                    <div className="grid grid-cols-2 gap-3 max-w-md">
                      <button
                        type="button"
                        onClick={() => setPaystationEnv('sandbox')}
                        className={`py-2.5 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
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
                        className={`py-2.5 px-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
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
                        ? 'Sandbox uses test endpoint (https://sandbox.paystation.com.bd) with dummy bKash/Cards.'
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
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all"
                    />
                    <p className="text-[11px] font-medium text-slate-400 mt-1">
                      Can also be set in <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">.env</code> as <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">PAYSTATION_MERCHANT_ID</code>
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
                        className="text-[11px] font-bold text-slate-400 hover:text-slate-700 flex items-center gap-1 transition-colors"
                      >
                        {showPaystationPassword ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5" />
                            Hide
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5" />
                            Show
                          </>
                        )}
                      </button>
                    </div>
                    <input 
                      type={showPaystationPassword ? 'text' : 'password'} 
                      value={paystationPassword}
                      onChange={(e) => setPaystationPassword(e.target.value)}
                      placeholder={paystationEnv === 'sandbox' ? 'gamecoderstorepass (Default Sandbox Password)' : 'Enter your Production Password'}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all"
                    />
                    <p className="text-[11px] font-medium text-slate-400 mt-1">
                      Can also be set in <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">.env</code> as <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">PAYSTATION_PASSWORD</code>
                    </p>
                  </div>

                  {/* Test Connection Banner if run */}
                  {paystationTestResult && (
                    <div className={`p-4 rounded-2xl border text-xs font-medium ${
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
                            className="px-3 py-1 bg-emerald-600 text-white rounded-lg font-bold text-[11px] shrink-0 hover:bg-emerald-700"
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
                      className="flex-1 bg-[#0D1527] hover:bg-[#1E293B] text-white py-3.5 rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isSavingPaystation ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save PayStation Settings'
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleTestPaystation}
                      disabled={isTestingPaystation}
                      className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 disabled:opacity-50 shrink-0"
                    >
                      {isTestingPaystation ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Test Connection
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
