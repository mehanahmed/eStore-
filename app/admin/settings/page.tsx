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
  Play,
  RotateCw,
  ShoppingBag,
  ShoppingCart,
  CreditCard,
  FileCheck2,
  Layers
} from 'lucide-react';

interface EventTestStatus {
  status: 'idle' | 'sending' | 'success' | 'error';
  eventId?: string;
  traceId?: string;
  error?: string;
  timestamp?: string;
}

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

  // Event Testing Console States
  const [isTestingAll, setIsTestingAll] = useState(false);
  const [eventStatuses, setEventStatuses] = useState<Record<string, EventTestStatus>>({
    PageView: { status: 'idle' },
    ViewContent: { status: 'idle' },
    AddToCart: { status: 'idle' },
    InitiateCheckout: { status: 'idle' },
    Purchase: { status: 'idle' }
  });

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

  // Dispatch a single test event (both Browser Pixel and Server CAPI with identical event_id)
  const fireSingleEvent = async (eventName: string): Promise<boolean> => {
    if (!pixelId || !accessToken) {
      showNotification('Please enter Pixel ID and Access Token first.', 'error');
      return false;
    }

    const eventId = `test_${eventName.toLowerCase()}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const nowStr = new Date().toLocaleTimeString();

    // 1. Build realistic sample payload
    let customData: Record<string, any> = {};
    if (eventName === 'PageView') {
      customData = { page_title: 'Color Hut EStore Test Console' };
    } else if (eventName === 'ViewContent') {
      customData = {
        content_name: 'NeoFlex 500৳',
        content_ids: ['17'],
        content_type: 'product',
        value: 500,
        currency: 'BDT'
      };
    } else if (eventName === 'AddToCart') {
      customData = {
        content_name: 'NeoFlex 500৳',
        content_ids: ['17'],
        content_type: 'product',
        value: 500,
        currency: 'BDT',
        num_items: 1
      };
    } else if (eventName === 'InitiateCheckout') {
      customData = {
        content_ids: ['17'],
        content_type: 'product',
        num_items: 1,
        value: 570,
        currency: 'BDT'
      };
    } else if (eventName === 'Purchase') {
      customData = {
        content_ids: ['17'],
        content_type: 'product',
        num_items: 1,
        value: 570,
        currency: 'BDT',
        order_id: `ORD-TEST-${Math.floor(1000 + Math.random() * 9000)}`
      };
    }

    // 2. Fire Browser Pixel if available (so Meta Events Manager marks it as Deduplicated!)
    if (typeof (window as any).fbq === 'function') {
      try {
        (window as any).fbq('track', eventName, customData, { eventID: eventId });
      } catch (e) {}
    }

    // Set sending state
    setEventStatuses(prev => ({
      ...prev,
      [eventName]: { status: 'sending', eventId, timestamp: nowStr }
    }));

    // 3. Fire Server-Side CAPI
    try {
      const res = await fetch('/api/admin/tracking/test-meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pixel_id: pixelId.trim(),
          access_token: accessToken.trim(),
          test_event_code: testEventCode.trim(),
          event_name: eventName,
          event_id: eventId,
          custom_data: customData,
          user_data: {
            email: 'test@colorhutbd.xyz',
            phone: '8801919760626',
            firstName: 'ColorHut',
            city: 'Dhaka'
          }
        })
      });

      const contentType = res.headers.get('content-type') || '';
      let data: any = {};
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(`Server returned non-JSON (${res.status}). Server might need restart.`);
      }

      if (res.ok && data.success) {
        const traceId = data.response?.fbtrace_id || 'OK';
        setEventStatuses(prev => ({
          ...prev,
          [eventName]: { status: 'success', eventId, traceId, timestamp: nowStr }
        }));
        return true;
      } else {
        const errMsg = data.error?.message || data.error || 'Meta returned error';
        setEventStatuses(prev => ({
          ...prev,
          [eventName]: { status: 'error', eventId, error: String(errMsg), timestamp: nowStr }
        }));
        return false;
      }
    } catch (err: any) {
      setEventStatuses(prev => ({
        ...prev,
        [eventName]: { status: 'error', eventId, error: err.message || 'Network error', timestamp: nowStr }
      }));
      return false;
    }
  };

  // Run all 5 events in sequence
  const handleTestAllEvents = async () => {
    if (!pixelId || !accessToken) {
      showNotification('Please enter Pixel ID and Access Token first.', 'error');
      return;
    }

    setIsTestingAll(true);
    const eventsToRun = ['PageView', 'ViewContent', 'AddToCart', 'InitiateCheckout', 'Purchase'];
    
    for (const evt of eventsToRun) {
      await fireSingleEvent(evt);
      // Brief 600ms pause between events so Meta receives them in clean chronological sequence
      await new Promise(r => setTimeout(r, 600));
    }
    
    setIsTestingAll(false);
    showNotification('All 5 test events dispatched! Check your Meta Events Manager "Test events" tab.');
  };

  const eventMetadata: Record<string, { label: string; desc: string; icon: any; color: string }> = {
    PageView: {
      label: 'Page View',
      desc: 'All products & page visits',
      icon: Layers,
      color: 'text-blue-500 bg-blue-50 border-blue-200'
    },
    ViewContent: {
      label: 'View Content',
      desc: 'Viewing product detail page',
      icon: Eye,
      color: 'text-indigo-500 bg-indigo-50 border-indigo-200'
    },
    AddToCart: {
      label: 'Add to Cart',
      desc: 'Customer clicks Buy / Cart',
      icon: ShoppingCart,
      color: 'text-amber-500 bg-amber-50 border-amber-200'
    },
    InitiateCheckout: {
      label: 'Initiate Checkout',
      desc: 'Checkout page / form opened',
      icon: CreditCard,
      color: 'text-purple-500 bg-purple-50 border-purple-200'
    },
    Purchase: {
      label: 'Purchase (Order Confirmed)',
      desc: 'Order placed & confirmed in DB',
      icon: FileCheck2,
      color: 'text-emerald-500 bg-emerald-50 border-emerald-200'
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

              {/* CARD 3: LIVE EVENT TESTING CONSOLE (ALL 5 EVENTS) */}
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-orange-500 fill-orange-500" />
                      <h3 className="text-base font-bold text-slate-900 leading-tight">
                        Meta Events Testing Console
                      </h3>
                    </div>
                    <p className="text-xs font-medium text-slate-500 mt-1">
                      Test each of your 5 events live. Events appear immediately in your Meta Events Manager <strong>Test events</strong> tab with your test code ({testEventCode || 'TEST'}).
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleTestAllEvents}
                    disabled={isTestingAll || !pixelId || !accessToken}
                    className="px-5 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs tracking-wider uppercase transition-all shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 disabled:opacity-50 shrink-0"
                  >
                    {isTestingAll ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending All Events...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-white" />
                        <span>Test All 5 Events</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Individual Event Triggers Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-6">
                  {Object.entries(eventMetadata).map(([key, meta]) => {
                    const status = eventStatuses[key] || { status: 'idle' };
                    const Icon = meta.icon;

                    return (
                      <div 
                        key={key}
                        className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${meta.color} shrink-0`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-slate-900">{meta.label}</h4>
                                <span className="font-mono text-[10px] text-slate-400 font-semibold">{key}</span>
                              </div>
                            </div>

                            {status.status === 'success' && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                <Check className="w-3 h-3 stroke-[3]" />
                                Sent
                              </span>
                            )}
                            {status.status === 'error' && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                                Failed
                              </span>
                            )}
                            {status.status === 'sending' && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Sending
                              </span>
                            )}
                          </div>
                          
                          <p className="text-[11px] text-slate-500 font-medium mb-3">
                            {meta.desc}
                          </p>
                        </div>

                        <div>
                          {status.traceId && (
                            <div className="text-[10px] font-mono text-slate-400 truncate mb-2">
                              trace: {status.traceId}
                            </div>
                          )}
                          {status.error && (
                            <div className="text-[10px] text-rose-600 truncate mb-2" title={status.error}>
                              {status.error}
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => fireSingleEvent(key)}
                            disabled={status.status === 'sending' || isTestingAll || !pixelId || !accessToken}
                            className="w-full py-2 px-3 rounded-lg bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-2xs disabled:opacity-50"
                          >
                            <Send className="w-3 h-3 text-slate-500" />
                            <span>Send {key}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Deduplication & Tracking Quality Info Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-orange-50/70 to-amber-50/50 border border-orange-200/70 flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl bg-orange-500/15 text-orange-600 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <p className="font-bold text-slate-900">
                    Dual Frontend + Server-Side CAPI Deduplication Active
                  </p>
                  <p className="leading-relaxed">
                    Browser Pixel events and Server-Side CAPI payloads share the exact same <code className="bg-white/80 px-1 py-0.5 rounded border border-orange-200/80 font-mono text-[11px] text-orange-800">event_id</code> (e.g. <code className="bg-white/80 px-1 py-0.5 rounded border border-orange-200/80 font-mono text-[11px] text-orange-800">purchase_ORD-...</code>). Meta automatically deduplicates twin events so your Ads Manager never double-counts sales or ad spend.
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
