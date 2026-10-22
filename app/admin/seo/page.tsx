'use client';

import AdminSidebar from '../AdminSidebar';
import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Search, 
  Settings, 
  Info, 
  FileText, 
  ExternalLink, 
  Check, 
  Loader2,
  LayoutDashboard,
  Package,
  FolderOpen,
  Image as ImageIcon,
  BarChart3,
  Users,
  Trash2,
  ChevronLeft,
  LogOut,
  Sparkles,
  Menu,
  X,
  Save,
  Share2,
  Facebook,
  Instagram,
  Youtube,
  Video,
  Truck
} from 'lucide-react';

export default function SeoSettingsPage() {
  const [activeTab, setActiveTab] = useState<'seo' | 'social' | 'robots' | 'shipping'>('seo');

  // Settings Form State
  const [formData, setFormData] = useState({
    home_title: '',
    site_title_suffix: '',
    home_description: '',
    site_keywords: '',
    social_facebook: '',
    social_instagram: '',
    social_youtube: '',
    social_pinterest: '',
    delivery_inside_dhaka: '70',
    delivery_outside_dhaka: '130'
  });
  const [robotsContent, setRobotsContent] = useState('');
  
  // UI and Status States
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: ''
  });
  
  // Collapsible Sidebar State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed') === 'true';
    setIsSidebarCollapsed(saved);
  }, []);

  // Toggle Sidebar collapsing
  const toggleSidebar = () => {
    const nextState = !isSidebarCollapsed;
    setIsSidebarCollapsed(nextState);
    localStorage.setItem('sidebarCollapsed', String(nextState));
  };

  // Fetch settings from API
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [settingsResp, robotsResp] = await Promise.all([
          fetch('/api/admin/settings'),
          fetch('/api/admin/robots')
        ]);

        if (settingsResp.ok && robotsResp.ok) {
          const settings = await settingsResp.json();
          const robots = await robotsResp.json();

          setFormData({
            home_title: settings.home_title || '',
            site_title_suffix: settings.site_title_suffix || '',
            home_description: settings.home_description || '',
            site_keywords: settings.site_keywords || '',
            social_facebook: settings.social_facebook || '',
            social_instagram: settings.social_instagram || '',
            social_youtube: settings.social_youtube || '',
            social_pinterest: settings.social_pinterest || '',
            delivery_inside_dhaka: settings.delivery_inside_dhaka || '70',
            delivery_outside_dhaka: settings.delivery_outside_dhaka || '130'
          });
          setRobotsContent(robots.content || '');
        } else {
          setSaveStatus({ type: 'error', message: 'Failed to load some configurations.' });
        }
      } catch (err) {
        console.error('Error fetching SEO configuration:', err);
        setSaveStatus({ type: 'error', message: 'Network error occurred while loading settings.' });
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Handle Input Changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Save Settings
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveStatus({ type: null, message: '' });

    try {
      const [settingsResp, robotsResp] = await Promise.all([
        fetch('/api/admin/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        }),
        fetch('/api/admin/robots', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: robotsContent })
        })
      ]);

      if (settingsResp.ok && robotsResp.ok) {
        setSaveStatus({ type: 'success', message: 'SEO Settings and robots.txt saved successfully!' });
        setTimeout(() => setSaveStatus({ type: null, message: '' }), 5000);
      } else {
        setSaveStatus({ type: 'error', message: 'Failed to save settings. Please try again.' });
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      setSaveStatus({ type: 'error', message: 'An unexpected network error occurred.' });
    } finally {
      setIsSaving(false);
    }
  };

  interface SidebarItem {
    name: string;
    href: string;
    icon: React.ComponentType<any>;
    active?: boolean;
  }

  // Static items for Sidebar
  const sidebarLinks: { overview: SidebarItem[]; management: SidebarItem[] } = {
    overview: [
      { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'Products', href: '/admin/products', icon: Package },
      { name: 'Categories', href: '/admin/categories', icon: FolderOpen },
      { name: 'Mobile Hero', href: '/admin/mobile-hero', icon: ImageIcon },
      { name: 'Demo Video', href: '/admin/demo', icon: Video },
    ],
    management: [
      { name: 'Pixel & Traffic', href: '/admin/pixel-traffic', icon: BarChart3 },
      { name: 'Meeting Requests', href: '/admin/meeting-requests', icon: Users },
      { name: 'SEO Settings', href: '/admin/seo', icon: Settings, active: true },
      { name: 'Trash', href: '/admin/trash', icon: Trash2 },
    ]
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans antialiased text-slate-800">
      {/* Sidebar Overlay (Mobile) */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-6 z-30">
          <button 
            onClick={() => setIsMobileOpen(true)}
            className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50"
          >
            <Menu className="w-5 h-5" />
          </button>
          <img src="/logo.png" alt="Color Hut" className="h-7 object-contain" />
          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-sm">
            A
          </div>
        </header>

        {/* Dynamic Status Toast Banner */}
        {saveStatus.message && (
          <div className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-6 py-4 rounded-2xl shadow-xl shadow-slate-900/10 border transition-all duration-300 transform translate-y-0
            ${saveStatus.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'}
          `}>
            {saveStatus.type === 'success' ? (
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0 font-bold text-xs">
                !
              </div>
            )}
            <p className="text-sm font-semibold">{saveStatus.message}</p>
          </div>
        )}

        {/* Scrollable Layout Context */}
        <main className="flex-1 overflow-y-auto w-full bg-slate-50/50">
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(4px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .animate-fadeIn {
              animation: fadeIn 0.2s ease-out forwards;
            }
          `}</style>
          <div className="p-6 md:p-10 w-full">
            {isLoading ? (
              <div className="space-y-6">
                <div className="h-10 w-1/3 bg-slate-200 animate-pulse rounded-md"></div>
                <div className="h-6 w-1/2 bg-slate-100 animate-pulse rounded-md"></div>
                <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 p-8 space-y-6">
                  <div className="h-12 bg-slate-100 animate-pulse rounded-2xl w-full"></div>
                  <div className="h-32 bg-slate-50 animate-pulse rounded-2xl w-full"></div>
                  <div className="h-12 bg-slate-100 animate-pulse rounded-2xl w-full"></div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-1.5">Search Engine Optimization</h1>
                    <p className="text-slate-500 text-sm font-medium">Manage global search metadata, page indexing configurations, sitemaps, and social links.</p>
                  </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-slate-200 gap-6 mt-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab('seo')}
                    className={`pb-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                      activeTab === 'seo' ? 'border-orange-600 text-orange-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <Globe className="w-4.5 h-4.5" />
                    Global Metadata
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('social')}
                    className={`pb-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                      activeTab === 'social' ? 'border-orange-600 text-orange-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <Share2 className="w-4.5 h-4.5" />
                    Social Profiles
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('robots')}
                    className={`pb-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                      activeTab === 'robots' ? 'border-orange-600 text-orange-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <Search className="w-4.5 h-4.5" />
                    Sitemap & robots.txt
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('shipping')}
                    className={`pb-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                      activeTab === 'shipping' ? 'border-orange-600 text-orange-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <Truck className="w-4.5 h-4.5" />
                    Delivery Charges
                  </button>
                </div>

                {/* Tab Contents */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 p-8">
                  {activeTab === 'seo' && (
                    <div className="space-y-8 animate-fadeIn">
                      {/* Section Info */}
                      <div>
                        <h3 className="text-lg font-extrabold text-slate-900 mb-1">Global Metadata Settings</h3>
                        <p className="text-xs text-slate-400 font-medium">Define metadata details for the homepage search result listing.</p>
                      </div>

                      {/* Google Search Snippet Preview Card */}
                      <div className="bg-slate-50/80 rounded-xl border border-slate-200/60 p-6 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Live Search Engine Preview</span>
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">Mobile & Desktop Friendly</span>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs select-none">
                              C
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs text-slate-800 font-semibold leading-none">Color Hut</span>
                              <span className="text-[10px] text-slate-400 leading-none">https://store.colorhutbd.xyz</span>
                            </div>
                          </div>
                          <h3 className="text-base md:text-lg text-[#1a0dab] hover:underline cursor-pointer font-medium leading-tight select-none">
                            {formData.home_title || 'Color Hut - Your Trusted Partner for Branding'} {formData.site_title_suffix}
                          </h3>
                          <p className="text-xs md:text-sm text-[#4d5156] leading-relaxed break-all select-none">
                            {formData.home_description || 'Shop for unique gifts, restaurant packaging, and custom branding solutions. Color Hut is your dedicated partner for logo design, menu printing, and premium creative work in Bangladesh.'}
                          </p>
                        </div>
                      </div>

                      {/* Inputs Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Home Title Template */}
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                            Home Title Template
                            <span title="The primary title shown for the home page" className="cursor-help inline-flex items-center">
                              <Info className="w-3.5 h-3.5 text-slate-300" />
                            </span>
                          </label>
                          <input 
                            type="text" 
                            name="home_title"
                            value={formData.home_title}
                            onChange={handleInputChange}
                            placeholder="Color Hut Studio | Premium Digital Assets"
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 outline-none font-bold text-slate-900 transition-all placeholder:text-slate-400"
                            required
                          />
                        </div>

                        {/* Global Title Suffix */}
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                            Global Title Suffix
                            <span title="Suffix automatically appended to individual product titles" className="cursor-help inline-flex items-center">
                              <Info className="w-3.5 h-3.5 text-slate-300" />
                            </span>
                          </label>
                          <input 
                            type="text" 
                            name="site_title_suffix"
                            value={formData.site_title_suffix}
                            onChange={handleInputChange}
                            placeholder="| Color Hut Studio"
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 outline-none font-bold text-slate-900 transition-all placeholder:text-slate-400"
                            required
                          />
                        </div>

                        {/* Home Meta Description */}
                        <div className="md:col-span-2 space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-slate-400">
                            Home Meta Description
                          </label>
                          <textarea 
                            name="home_description"
                            value={formData.home_description}
                            onChange={handleInputChange}
                            rows={4}
                            placeholder="Color Hut Studio offers premium digital assets, branding stationery, and luxury corporate identity solutions in Bangladesh."
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 outline-none font-bold text-slate-900 transition-all resize-none placeholder:text-slate-400"
                            required
                          />
                        </div>

                        {/* Default Meta Keywords */}
                        <div className="md:col-span-2 space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-slate-400">
                            Default Meta Keywords (Comma separated)
                          </label>
                          <input 
                            type="text" 
                            name="site_keywords"
                            value={formData.site_keywords}
                            onChange={handleInputChange}
                            placeholder="Branding, Stationery, Digital Assets, Luxury Corporate Gifts"
                            className="w-full px-5 py-4 bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 outline-none font-bold text-slate-900 transition-all placeholder:text-slate-400"
                            required
                          />
                        </div>
                      </div>
                      
                      {/* Save Button */}
                      <div className="flex justify-end pt-6 border-t border-slate-100">
                        <button
                          type="submit"
                          disabled={isSaving}
                          className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-slate-900 hover:bg-orange-600 text-white rounded-lg font-bold transition-all duration-200 disabled:bg-slate-400 disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-orange-500/10 active:scale-[0.98] text-sm w-full sm:w-auto text-center"
                        >
                          {isSaving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                          Save Metadata
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTab === 'social' && (
                    <div className="space-y-8 animate-fadeIn">
                      {/* Section Info */}
                      <div>
                        <h3 className="text-lg font-extrabold text-slate-900 mb-1">Social Media Profiles</h3>
                        <p className="text-xs text-slate-400 font-medium">Define the social media profile links for the store footer and contacts.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Facebook Page URL */}
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-slate-400">
                            Facebook Page URL
                          </label>
                          <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600 pointer-events-none">
                              <Facebook className="w-5 h-5" />
                            </div>
                            <input 
                              type="url" 
                              name="social_facebook"
                              value={formData.social_facebook}
                              onChange={handleInputChange}
                              placeholder="https://facebook.com/yourpage"
                              className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 outline-none font-bold text-slate-900 transition-all placeholder:text-slate-400"
                            />
                          </div>
                        </div>

                        {/* Instagram Profile URL */}
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-slate-400">
                            Instagram Profile URL
                          </label>
                          <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-600 pointer-events-none">
                              <Instagram className="w-5 h-5" />
                            </div>
                            <input 
                              type="url" 
                              name="social_instagram"
                              value={formData.social_instagram}
                              onChange={handleInputChange}
                              placeholder="https://instagram.com/yourprofile"
                              className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 outline-none font-bold text-slate-900 transition-all placeholder:text-slate-400"
                            />
                          </div>
                        </div>

                        {/* YouTube Channel URL */}
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-slate-400">
                            YouTube Channel URL
                          </label>
                          <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-600 pointer-events-none">
                              <Youtube className="w-5 h-5" />
                            </div>
                            <input 
                              type="url" 
                              name="social_youtube"
                              value={formData.social_youtube}
                              onChange={handleInputChange}
                              placeholder="https://youtube.com/@yourchannel"
                              className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 outline-none font-bold text-slate-900 transition-all placeholder:text-slate-400"
                            />
                          </div>
                        </div>

                        {/* Pinterest Profile URL */}
                        <div className="space-y-2">
                          <label className="text-xs font-black uppercase tracking-widest text-slate-400">
                            Pinterest Profile URL
                          </label>
                          <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-red-600 pointer-events-none">
                              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.2 0 1.033.394 2.137.884 2.738.097.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.252 7.929-7.252 4.163 0 7.398 2.967 7.398 6.92 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592 0 11.985 0" />
                              </svg>
                            </div>
                            <input 
                              type="url" 
                              name="social_pinterest"
                              value={formData.social_pinterest}
                              onChange={handleInputChange}
                              placeholder="https://pinterest.com/yourprofile"
                              className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200/80 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 outline-none font-bold text-slate-900 transition-all placeholder:text-slate-400"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Save Button */}
                      <div className="flex justify-end pt-6 border-t border-slate-100">
                        <button
                          type="submit"
                          disabled={isSaving}
                          className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-slate-900 hover:bg-orange-600 text-white rounded-lg font-bold transition-all duration-200 disabled:bg-slate-400 disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-orange-500/10 active:scale-[0.98] text-sm w-full sm:w-auto text-center"
                        >
                          {isSaving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                          Save Social Links
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTab === 'robots' && (
                    <div className="space-y-8 animate-fadeIn">
                      {/* Section Info */}
                      <div>
                        <h3 className="text-lg font-extrabold text-slate-900 mb-1">Indexing & Crawling Configurations</h3>
                        <p className="text-xs text-slate-400 font-medium">Control sitemap and direct bot accessibility instructions.</p>
                      </div>

                      {/* Active Sitemap Helper */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-50 border border-slate-200/60 rounded-xl">
                        <div className="flex items-center gap-3.5">
                          <span className="w-9 h-9 bg-white border border-slate-200/80 rounded-lg flex items-center justify-center text-slate-500">
                            <FileText className="w-5 h-5" />
                          </span>
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-sm">Active Sitemap</h4>
                            <p className="text-xs text-slate-500 font-medium">Dynamic catalog map automatically refreshed.</p>
                          </div>
                        </div>
                        <a 
                          href="/mysitemap.xml" 
                          target="_blank"
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-xs font-black text-slate-600 transition-all hover:text-orange-500 shadow-sm w-full sm:w-auto text-center"
                        >
                          /mysitemap.xml
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>

                      {/* Robots.txt Content Editor */}
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                          Robots.txt Content
                          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md italic lowercase select-none">
                            * Edit with caution
                          </span>
                        </label>
                        <textarea 
                          value={robotsContent}
                          onChange={(e) => setRobotsContent(e.target.value)}
                          rows={8}
                          placeholder="User-agent: *&#10;Allow: /"
                          className="w-full px-5 py-4 bg-slate-950 border border-slate-800/40 rounded-xl focus:ring-2 focus:ring-white/5 focus:outline-none outline-none font-mono text-sm text-slate-300 transition-all resize-none shadow-inner"
                          required
                        />
                      </div>
                      {/* Save Button */}
                      <div className="flex justify-end pt-6 border-t border-slate-100">
                        <button
                          type="submit"
                          disabled={isSaving}
                          className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-slate-900 hover:bg-orange-600 text-white rounded-lg font-bold transition-all duration-200 disabled:bg-slate-400 disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-orange-500/10 active:scale-[0.98] text-sm w-full sm:w-auto text-center"
                        >
                          {isSaving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                          Save Robots Config
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTab === 'shipping' && (
                    <div className="space-y-8 animate-fadeIn">
                      {/* Section Info */}
                      <div>
                        <h3 className="text-lg font-extrabold text-slate-900 mb-1">Checkout Delivery Charges</h3>
                        <p className="text-xs text-slate-400 font-medium">Set delivery fees automatically added to the customer's total at checkout.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Inside Dhaka */}
                        <div className="p-6 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-4">
                          <div className="flex items-center gap-3">
                            <span className="w-10 h-10 bg-orange-500/10 text-orange-600 rounded-xl flex items-center justify-center font-bold">
                              ৳
                            </span>
                            <div>
                              <h4 className="font-extrabold text-slate-900 text-sm">Inside Dhaka Delivery</h4>
                              <p className="text-xs text-slate-500 font-medium">24 - 48 Hours Express Delivery</p>
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-2">
                              Charge Amount (৳)
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={formData.delivery_inside_dhaka}
                              onChange={(e) => setFormData({ ...formData, delivery_inside_dhaka: e.target.value })}
                              placeholder="70"
                              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-slate-900 font-bold text-sm"
                              required
                            />
                          </div>
                        </div>

                        {/* Outside Dhaka */}
                        <div className="p-6 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-4">
                          <div className="flex items-center gap-3">
                            <span className="w-10 h-10 bg-blue-500/10 text-blue-600 rounded-xl flex items-center justify-center font-bold">
                              ৳
                            </span>
                            <div>
                              <h4 className="font-extrabold text-slate-900 text-sm">Outside Dhaka Delivery</h4>
                              <p className="text-xs text-slate-500 font-medium">2 - 3 Days Nationwide Delivery</p>
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-2">
                              Charge Amount (৳)
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={formData.delivery_outside_dhaka}
                              onChange={(e) => setFormData({ ...formData, delivery_outside_dhaka: e.target.value })}
                              placeholder="130"
                              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none text-slate-900 font-bold text-sm"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {/* Save Button */}
                      <div className="flex justify-end pt-6 border-t border-slate-100">
                        <button
                          type="submit"
                          disabled={isSaving}
                          className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-slate-900 hover:bg-orange-600 text-white rounded-lg font-bold transition-all duration-200 disabled:bg-slate-400 disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-orange-500/10 active:scale-[0.98] text-sm w-full sm:w-auto text-center"
                        >
                          {isSaving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                          Save Delivery Charges
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </form>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}