'use client';

import AdminSidebar from '../AdminSidebar';
import React, { useState, useEffect } from 'react';
import { 
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
  Menu,
  X,
  Settings,
  HelpCircle,
  TrendingUp,
  Globe,
  Info,
  Calendar,
  Layers,
  ChevronRight,
  User,
  Activity,
  ArrowRight,
  Video
} from 'lucide-react';

interface TrafficSource {
  source_category: string;
  source_icon?: string;
  source?: string;
  path: string;
  ip_address: string;
  sessions: number;
  last_visit: string;
}

interface DailyStat {
  date: string;
  sessions: number;
}

interface TrafficResponse {
  sources: TrafficSource[];
  daily: DailyStat[];
}

interface CampaignLink {
  id: number;
  utm: string;
  meeting: string;
  days: number;
  alias?: string;
  icon?: string;
  created_at: string;
}

export default function PixelTrafficPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isConfigSaving, setIsConfigSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: ''
  });

  // Tracking Configuration Settings
  const [pixelId, setPixelId] = useState('');
  const [pixelEnabled, setPixelEnabled] = useState(false);
  const [gtmId, setGtmId] = useState('');
  const [gtmEnabled, setGtmEnabled] = useState(false);

  // Traffic Stats
  const [range, setRange] = useState('30'); // '1' | '7' | '30'
  const [sources, setSources] = useState<TrafficSource[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Sidebar collapsibility
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Hover state for custom SVG line chart tooltip
  const [activePoint, setActivePoint] = useState<{ index: number; x: number; y: number; label: string; value: number } | null>(null);

  // Campaign URL Generator States
  const [generatorUtm, setGeneratorUtm] = useState('');
  const [generatorAlias, setGeneratorAlias] = useState(''); // Optional friendly name
  const [generatorIconType, setGeneratorIconType] = useState(''); // Select brand logo type
  const [customUploadedLogoUrl, setCustomUploadedLogoUrl] = useState(''); // Uploaded logo path
  const [isUploadingLogo, setIsUploadingLogo] = useState(false); // Loading flag
  const [generatorMeeting, setGeneratorMeeting] = useState('hide'); // 'show' or 'hide'
  const [generatorDays, setGeneratorDays] = useState('0'); // Default to No Expiration (Always/Optional)
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [campaignLinks, setCampaignLinks] = useState<CampaignLink[]>([]);

  const fetchCampaignLinks = async () => {
    try {
      const response = await fetch('/api/admin/campaign-urls');
      if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
        const data = await response.json();
        setCampaignLinks(data || []);
      }
    } catch (err) {
      console.error('Failed to fetch campaign links:', err);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingLogo(true);
    const formData = new FormData();
    formData.append('images', files[0]);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
        const data = await response.json();
        if (data.imageUrls && data.imageUrls.length > 0) {
          setCustomUploadedLogoUrl(data.imageUrls[0]);
          setSaveStatus({ type: 'success', message: 'Custom brand logo uploaded and optimized successfully!' });
        }
      } else {
        setSaveStatus({ type: 'error', message: 'Failed to upload custom logo file.' });
      }
    } catch (err) {
      console.error('Error uploading custom logo:', err);
      setSaveStatus({ type: 'error', message: 'Error uploading logo file.' });
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleGenerateUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!generatorUtm.trim()) return;

    const sanitizedUtm = generatorUtm.trim().toLowerCase().replace(/\s+/g, '-');
    
    try {
      const response = await fetch('/api/admin/campaign-urls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          utm: sanitizedUtm,
          meeting: generatorMeeting,
          days: generatorDays,
          alias: generatorAlias.trim(),
          icon: generatorIconType === 'custom' ? customUploadedLogoUrl : generatorIconType
        })
      });

      if (response.ok) {
        // Get current protocol and host
        const origin = typeof window !== 'undefined' ? window.location.origin : 'https://store.colorhutbd.xyz';
        const url = `${origin}/traffic?utm=${encodeURIComponent(sanitizedUtm)}`;
        setGeneratedUrl(url);
        setCopiedUrl(false);
        setGeneratorAlias('');
        setGeneratorIconType('');
        setCustomUploadedLogoUrl('');
        setSaveStatus({ type: 'success', message: 'Campaign URL saved to database and generated successfully!' });
        fetchCampaignLinks(); // Refresh list immediately!
      } else {
        let errorMessage = 'Failed to save campaign URL. Ensure Express server is running and up-to-date.';
        if (response.headers.get('content-type')?.includes('application/json')) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch (e) {}
        }
        setSaveStatus({ type: 'error', message: errorMessage });
      }
    } catch (err) {
      console.error('Failed to save campaign URL:', err);
      setSaveStatus({ type: 'error', message: 'Network error. Failed to save campaign URL.' });
    }
  };

  const handleCopyUrl = () => {
    if (!generatedUrl) return;
    navigator.clipboard.writeText(generatedUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 3000);
  };

  const handleDeleteCampaign = async (id: number) => {
    if (!confirm('Are you sure you want to delete this campaign configuration?')) return;
    try {
      const response = await fetch(`/api/admin/campaign-urls/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setSaveStatus({ type: 'success', message: 'Campaign URL configuration deleted successfully!' });
        fetchCampaignLinks();
      } else {
        let errorMessage = 'Failed to delete campaign URL.';
        if (response.headers.get('content-type')?.includes('application/json')) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch (e) {}
        }
        setSaveStatus({ type: 'error', message: errorMessage });
      }
    } catch (err) {
      console.error('Failed to delete campaign URL:', err);
      setSaveStatus({ type: 'error', message: 'Network error. Failed to delete campaign URL.' });
    }
  };

  // Sync sidebar state with localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed') === 'true';
    setIsSidebarCollapsed(saved);
  }, []);

  const toggleSidebar = () => {
    const nextState = !isSidebarCollapsed;
    setIsSidebarCollapsed(nextState);
    localStorage.setItem('sidebarCollapsed', String(nextState));
  };

  // Fetch Tracking Configuration Settings
  const loadPixelConfig = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const settings = await response.json();
        setPixelId(settings.meta_pixel_id || '');
        setPixelEnabled(settings.meta_pixel_enabled === 'true');
        setGtmId(settings.gtm_container_id || '');
        setGtmEnabled(settings.gtm_enabled === 'true');
      }
    } catch (err) {
      console.error('Failed to load tracking settings:', err);
    }
  };

  // Fetch Traffic Stats
  const fetchTrafficStats = async (selectedRange: string) => {
    try {
      const response = await fetch(`/api/admin/traffic-stats?range=${selectedRange}`);
      if (response.ok) {
        const data: TrafficResponse = await response.json();
        setSources(data.sources || []);
        setDailyStats(data.daily || []);
      }
    } catch (err) {
      console.error('Failed to load traffic stats:', err);
    }
  };

  // Initialize page data
  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      await Promise.all([loadPixelConfig(), fetchTrafficStats(range), fetchCampaignLinks()]);
      setIsLoading(false);
    };
    initData();
  }, [range]);

  // Handle saving tracking configuration settings
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConfigSaving(true);
    setSaveStatus({ type: null, message: '' });

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meta_pixel_id: pixelId,
          meta_pixel_enabled: pixelEnabled ? 'true' : 'false',
          gtm_container_id: gtmId,
          gtm_enabled: gtmEnabled ? 'true' : 'false'
        })
      });

      if (response.ok) {
        setSaveStatus({ type: 'success', message: 'Tracking configurations saved successfully!' });
        setTimeout(() => setSaveStatus({ type: null, message: '' }), 5000);
      } else {
        setSaveStatus({ type: 'error', message: 'Failed to update configuration.' });
      }
    } catch (err) {
      console.error('Save configuration error:', err);
      setSaveStatus({ type: 'error', message: 'Network error saving settings.' });
    } finally {
      setIsConfigSaving(false);
    }
  };

  // Date Formatter
  const formatDateTime = (dateInput: string) => {
    if (!dateInput) return 'N/A';
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return 'Invalid Date';
    return d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // Get matching circular network logo for traffic sources
  const renderSourceIcon = (category: string, customIcon?: string) => {
    const lower = (customIcon || category || '').toLowerCase();
    if (lower.startsWith('/uploads/') || lower.includes('/uploads/')) {
      return (
        <div className="w-8 h-8 rounded-full border border-slate-200/60 overflow-hidden shrink-0 flex items-center justify-center bg-slate-50 animate-in fade-in duration-300" title="Custom Brand Logo">
          <img src={customIcon} alt="Custom Brand Logo" className="w-full h-full object-cover" />
        </div>
      );
    }
    if (lower.includes('google')) {
      return (
        <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500 shrink-0" title="Google">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .533 5.333.533 12S5.867 24 12.48 24c3.44 0 6.013-1.133 8.053-3.24 2.08-2.08 2.72-5.013 2.72-7.427 0-.733-.053-1.44-.147-2.133h-10.63z" />
          </svg>
        </div>
      );
    }
    if (lower.includes('facebook')) {
      return (
        <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 shrink-0" title="Facebook">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </div>
      );
    }
    if (lower.includes('instagram')) {
      return (
        <div className="w-8 h-8 rounded-full bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-500 shrink-0" title="Instagram">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204 0 3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
        </div>
      );
    }
    if (lower.includes('twitter') || lower.includes('t.co')) {
      return (
        <div className="w-8 h-8 rounded-full bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-500 shrink-0" title="Twitter">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
          </svg>
        </div>
      );
    }
    if (lower.includes('youtube')) {
      return (
        <div className="w-8 h-8 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0" title="YouTube">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
        </div>
      );
    }
    if (lower.includes('whatsapp')) {
      return (
        <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 shrink-0" title="WhatsApp">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.731-1.456L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.859-4.407 9.862-9.843.002-2.634-1.02-5.11-2.881-6.974A9.782 9.782 0 0012.008 1.84c-5.442 0-9.863 4.41-9.866 9.852-.001 1.762.478 3.477 1.391 5.011l-.997 3.637 3.737-.978.022.013z" />
          </svg>
        </div>
      );
    }
    if (lower.includes('pinterest')) {
      return (
        <div className="w-8 h-8 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shrink-0" title="Pinterest">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.965 1.406-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.27 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.621 0 11.988-5.366 11.988-11.987C24.005 5.368 18.638 0 12.017 0z" />
          </svg>
        </div>
      );
    }
    if (lower.includes('linkedin')) {
      return (
        <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 shrink-0" title="LinkedIn">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
          </svg>
        </div>
      );
    }
    if (lower.includes('tiktok')) {
      return (
        <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-white shrink-0" title="TikTok">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.28-3.08 1.7-6.07 4.75-6.79.7-.17 1.42-.21 2.14-.14v4.09c-.6-.1-1.22-.05-1.78.19-.88.36-1.56 1.09-1.78 2.03-.4 1.55.57 3.32 2.13 3.63.78.17 1.61-.01 2.25-.51.72-.54 1.14-1.39 1.17-2.3.02-3.83 0-7.65.01-11.48z" />
          </svg>
        </div>
      );
    }
    if (lower.includes('qr')) {
      return (
        <div className="w-8 h-8 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0" title="QR Code">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1v1M18 8h1M6 8h1M9 16H8v-1M16 16h-1v-1M12 12h.01M16 8h.01M8 8h.01M16 12h.01M8 12h.01M12 16h.01M12 8h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
      );
    }
    if (lower.includes('mail') || lower.includes('email')) {
      return (
        <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0" title="Mail / Email">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
      );
    }
    // Default/Direct Source Icon
    return (
      <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200/50 flex items-center justify-center text-slate-500 shrink-0" title="Direct / Link">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      </div>
    );
  };

  // Helper to pad daily statistics so the chart is ALWAYS complete and professional
  const getPaddedDailyStats = () => {
    const daysToGenerate = parseInt(range) || 30;
    const padded = [];
    
    if (range === '1') {
      // Today: Show 2-hour interval segments for the 24-hour day
      const todaySessions = dailyStats.reduce((acc, curr) => acc + curr.sessions, 0);
      const currentHour = new Date().getHours();
      
      for (let h = 0; h <= 24; h += 2) {
        const ampm = h >= 12 ? 'PM' : 'AM';
        const displayHour = h % 12 === 0 ? 12 : h % 12;
        const label = `${displayHour} ${ampm}`;
        
        // Allocate sessions to the current hour bucket
        const isCurrentBucket = currentHour >= h && currentHour < h + 2;
        padded.push({
          label,
          sessions: isCurrentBucket ? todaySessions : 0,
          date: label
        });
      }
      return padded;
    }
    
    // Multi-day ranges (7 days or 30 days)
    for (let i = daysToGenerate - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;
      
      const realStat = dailyStats.find(s => {
        const sDate = new Date(s.date);
        const sYear = sDate.getFullYear();
        const sMonth = String(sDate.getMonth() + 1).padStart(2, '0');
        const sDay = String(sDate.getDate()).padStart(2, '0');
        return `${sYear}-${sMonth}-${sDay}` === dateKey;
      });
      
      const label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      padded.push({
        label,
        sessions: realStat ? realStat.sessions : 0,
        date: dateKey
      });
    }
    
    return padded;
  };

  // High-Fidelity Custom SVG Chart Calculations with sunset gradients and clean gridlines
  const renderSVGChart = () => {
    const statsToUse = getPaddedDailyStats();
    if (statsToUse.length === 0) {
      return (
        <div className="h-full w-full flex items-center justify-center text-xs text-slate-400 font-bold uppercase tracking-wider">
          No traffic sessions recorded in this range.
        </div>
      );
    }

    const maxVal = Math.max(...statsToUse.map(d => d.sessions), 5); // Minimum y-scale of 5 for visually clean graphs
    const width = 1000;
    const height = 280;
    const paddingLeft = 10;
    const paddingRight = 10;
    const paddingTop = 30;
    const paddingBottom = 40;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    // Map data indices and values into graphical grid coordinates
    const points = statsToUse.map((stat, i) => {
      const x = paddingLeft + (i / (statsToUse.length - 1 || 1)) * chartWidth;
      const y = paddingTop + chartHeight - (stat.sessions / maxVal) * chartHeight;
      return { x, y, sessions: stat.sessions, label: stat.label, index: i };
    });

    // Construct curve path
    let dStroke = '';
    let dFill = '';

    if (points.length > 0) {
      dStroke = `M ${points[0].x} ${points[0].y}`;
      // Draw pristine curved line using bezier coordinates
      for (let i = 0; i < points.length - 1; i++) {
        const cpX1 = points[i].x + (points[i+1].x - points[i].x) / 3;
        const cpY1 = points[i].y;
        const cpX2 = points[i].x + 2 * (points[i+1].x - points[i].x) / 3;
        const cpY2 = points[i+1].y;
        dStroke += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${points[i+1].x} ${points[i+1].y}`;
      }
      dFill = `${dStroke} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;
    }

    // Grid calculations
    const horizontalGridLines = [0, 0.25, 0.5, 0.75, 1];

    return (
      <div className="relative w-full h-full">
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="w-full h-full overflow-visible select-none"
        >
          <defs>
            <linearGradient id="gradient-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F1641E" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#F1641E" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="chart-stroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#F1641E" />
              <stop offset="100%" stopColor="#f43f5e" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines */}
          {horizontalGridLines.map((ratio, index) => {
            const y = paddingTop + chartHeight * ratio;
            const gridVal = Math.round(maxVal * (1 - ratio));
            return (
              <g key={index}>
                <line 
                  x1={0} 
                  y1={y} 
                  x2={width} 
                  y2={y} 
                  stroke="#e2e8f0" 
                  strokeWidth="1"
                  strokeOpacity="0.4"
                  strokeDasharray="4 6"
                />
                <text 
                  x={12} 
                  y={y - 8} 
                  fill="#94a3b8" 
                  className="text-[10px] font-black"
                  textAnchor="start"
                >
                  {gridVal}
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          {dFill && (
            <path d={dFill} fill="url(#gradient-fill)" />
          )}

          {/* Stroke line */}
          {dStroke && (
            <path 
              d={dStroke} 
              fill="none" 
              stroke="url(#chart-stroke)" 
              strokeWidth="3.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          )}

          {/* Interactive Plot Points */}
          {points.map((pt, i) => (
            <g key={i}>
              {/* Invisible touch target trigger */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r="18"
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={(e) => setActivePoint({
                  index: pt.index,
                  x: pt.x,
                  y: pt.y,
                  label: pt.label,
                  value: pt.sessions
                })}
                onMouseLeave={() => setActivePoint(null)}
              />

              {/* Visible dot - only show dot if active or if it has non-zero sessions */}
              {(activePoint?.index === pt.index || pt.sessions > 0) && (
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={activePoint?.index === pt.index ? "6.5" : "4.5"}
                  fill="#ffffff"
                  stroke="#F1641E"
                  strokeWidth={activePoint?.index === pt.index ? "4" : "3"}
                  className="transition-all duration-150 pointer-events-none filter drop-shadow-md"
                />
              )}

              {/* X Axis Labels (Pristine, sparse spacing to prevent text collision) */}
              {statsToUse.length > 10 ? (
                // Show labels at start, end, and every 5th item
                (i % 5 === 0 || i === statsToUse.length - 1) && (
                  <text 
                    x={pt.x} 
                    y={height - 12} 
                    fill="#94a3b8" 
                    className="text-[10px] font-bold" 
                    textAnchor={i === 0 ? "start" : i === statsToUse.length - 1 ? "end" : "middle"}
                  >
                    {pt.label}
                  </text>
                )
              ) : (
                <text 
                  x={pt.x} 
                  y={height - 12} 
                  fill="#94a3b8" 
                  className="text-[10px] font-bold" 
                  textAnchor={i === 0 ? "start" : i === statsToUse.length - 1 ? "end" : "middle"}
                >
                  {pt.label}
                </text>
              )}
            </g>
          ))}
        </svg>

        {/* Dynamic Tooltip Element */}
        {activePoint && (
          <div 
            style={{ 
              position: 'absolute', 
              left: `${(activePoint.x / width) * 100}%`, 
              top: `${(activePoint.y / height) * 100 - 15}%`,
              transform: 'translate(-50%, -100%)' 
            }}
            className="z-30 bg-slate-950/95 backdrop-blur-md text-white rounded-xl px-4 py-2.5 shadow-2xl pointer-events-none border border-slate-800/80 text-left animate-in fade-in zoom-in-95 duration-100 min-w-[120px]"
          >
            <div className="text-[9px] font-black uppercase tracking-wider text-slate-400">{activePoint.label}</div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-[#F1641E] animate-pulse" />
              <div className="text-xs font-black text-white">{activePoint.value} <span className="font-medium text-slate-350 text-slate-300">Sessions</span></div>
            </div>
          </div>
        )}
      </div>
    );
  };


  interface SidebarItem {
    name: string;
    href: string;
    icon: React.ComponentType<any>;
    active?: boolean;
  }

  const sidebarLinks: { overview: SidebarItem[]; management: SidebarItem[] } = {
    overview: [
      { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'Products', href: '/admin/products', icon: Package },
      { name: 'Categories', href: '/admin/categories', icon: FolderOpen },
      { name: 'Mobile Hero', href: '/admin/mobile-hero', icon: ImageIcon },
      { name: 'Demo Video', href: '/admin/demo', icon: Video },
    ],
    management: [
      { name: 'Pixel & Traffic', href: '/admin/pixel-traffic', icon: BarChart3, active: true },
      { name: 'Meeting Requests', href: '/admin/meeting-requests', icon: Users },
      { name: 'SEO Settings', href: '/admin/seo', icon: Settings },
      { name: 'Trash', href: '/admin/trash', icon: Trash2 },
    ]
  };

  // Pagination bounds calculation
  const totalItems = sources.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startRangeIndex = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endRangeIndex = Math.min(currentPage * itemsPerPage, totalItems);
  const paginatedSources = sources.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
        <main className="flex-1 overflow-y-auto w-full">
          <div className="p-6 md:p-10 max-w-7xl mx-auto w-full">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
              <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Meta Pixel & Traffic</h1>
                <p className="text-slate-500 font-medium text-lg">Manage tracking pixels and view real-time visitor insights.</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-white/50 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">System Operational</span>
              </div>
            </div>

            {/* Top Stats Configuration Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Tracking Form Panel */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/30 p-8 relative overflow-hidden group h-full transition-all hover:shadow-2xl hover:shadow-slate-200/50 duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-[4rem] -mr-8 -mt-8 z-0 transition-transform group-hover:scale-110 duration-500" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-5 mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-[#F1641E] to-[#f43f5e] shadow-lg shadow-orange-500/20 flex items-center justify-center text-white">
                      <Globe className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-900 tracking-tight">Tracking Configuration</h2>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Meta & Google Integrations</p>
                    </div>
                  </div>

                  <form onSubmit={handleSaveConfig} className="space-y-6">
                    {/* Meta Pixel Config */}
                    <div className="space-y-2.5">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                        Meta Pixel ID
                      </label>
                      <input 
                        type="text" 
                        value={pixelId}
                        onChange={(e) => setPixelId(e.target.value)}
                        placeholder="e.g. 1234567890"
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-[#F1641E] focus:ring-4 focus:ring-[#F1641E]/5 outline-none font-bold text-slate-900 transition-all placeholder-slate-350"
                      />
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-slate-100 mb-4">
                      <span className="text-xs font-bold text-slate-500">Enable Pixel tracking</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={pixelEnabled}
                          onChange={(e) => setPixelEnabled(e.target.checked)}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-slate-250 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-linear-to-br peer-checked:from-[#F1641E] peer-checked:to-[#f43f5e] shadow-inner transition-colors" />
                      </label>
                    </div>

                    {/* Google Tag Manager Config */}
                    <div className="space-y-2.5 pt-2">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                        GTM Container ID
                      </label>
                      <input 
                        type="text" 
                        value={gtmId}
                        onChange={(e) => setGtmId(e.target.value)}
                        placeholder="e.g. GTM-XXXXXX"
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-[#F1641E] focus:ring-4 focus:ring-[#F1641E]/5 outline-none font-bold text-slate-900 transition-all placeholder-slate-350"
                      />
                    </div>

                    <div className="flex items-center justify-between py-3 border-b border-slate-100 mb-4">
                      <span className="text-xs font-bold text-slate-500">Enable Google Tag Manager</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={gtmEnabled}
                          onChange={(e) => setGtmEnabled(e.target.checked)}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-slate-250 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-linear-to-br peer-checked:from-[#F1641E] peer-checked:to-[#f43f5e] shadow-inner transition-colors" />
                      </label>
                    </div>

                    <button 
                      type="submit"
                      disabled={isConfigSaving}
                      className="w-full bg-slate-900 hover:bg-[#F1641E] text-white py-4 rounded-2xl font-black text-sm tracking-wide transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50 active:scale-[0.98] shadow-lg shadow-slate-900/10 hover:shadow-orange-500/20"
                    >
                      {isConfigSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Saving configurations...
                        </>
                      ) : (
                        'Save Configuration'
                      )}
                    </button>
                  </form>
                </div>
              </div>

              {/* Setup Guide Panel */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/30 p-8 flex flex-col justify-between h-full transition-all hover:shadow-2xl hover:shadow-slate-200/50 duration-300">
                <div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2 pb-3 border-b border-slate-100">
                    <Info className="w-4.5 h-4.5 text-[#F1641E]" />
                    Quick Integration Guide
                  </h3>

                  {/* Meta Guide */}
                  <div className="mb-6 pl-4 border-l-2 border-orange-100 hover:border-[#F1641E] transition-colors duration-200">
                    <h4 className="text-[10px] font-black text-[#F1641E] uppercase mb-2 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F1641E]" /> Meta Pixel Setup
                    </h4>
                    <ul className="space-y-2.5 text-xs font-bold text-slate-500 leading-relaxed pl-1">
                      <li className="flex gap-2">
                        <span className="bg-orange-50 text-[#F1641E] border border-orange-100 font-extrabold w-5 h-5 flex items-center justify-center rounded-full text-[10px] shrink-0">1</span>
                        <span>Log in to Facebook Business Manager; go to <strong className="text-slate-800">Events Manager</strong>.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="bg-orange-50 text-[#F1641E] border border-orange-100 font-extrabold w-5 h-5 flex items-center justify-center rounded-full text-[10px] shrink-0">2</span>
                        <span>Create or select your Meta Pixel Data Source; open <strong className="text-slate-800">Settings</strong>.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="bg-orange-50 text-[#F1641E] border border-orange-100 font-extrabold w-5 h-5 flex items-center justify-center rounded-full text-[10px] shrink-0">3</span>
                        <span>Copy and insert the numeric <strong className="text-slate-800">Pixel ID</strong> (e.g. 1234567890).</span>
                      </li>
                    </ul>
                  </div>

                  {/* GTM Guide */}
                  <div className="pl-4 border-l-2 border-orange-100 hover:border-[#F1641E] transition-colors duration-200">
                    <h4 className="text-[10px] font-black text-[#F1641E] uppercase mb-2 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F1641E]" /> Google Tag Manager Setup
                    </h4>
                    <ul className="space-y-2.5 text-xs font-bold text-slate-500 leading-relaxed pl-1">
                      <li className="flex gap-2">
                        <span className="bg-orange-50 text-[#F1641E] border border-orange-100 font-extrabold w-5 h-5 flex items-center justify-center rounded-full text-[10px] shrink-0">1</span>
                        <span>Log in to Google Tag Manager at <strong className="text-slate-800 font-bold">tagmanager.google.com</strong>.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="bg-orange-50 text-[#F1641E] border border-orange-100 font-extrabold w-5 h-5 flex items-center justify-center rounded-full text-[10px] shrink-0">2</span>
                        <span>Select your Web Container.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="bg-orange-50 text-[#F1641E] border border-orange-100 font-extrabold w-5 h-5 flex items-center justify-center rounded-full text-[10px] shrink-0">3</span>
                        <span>Copy and insert the <strong className="text-slate-800">Container ID</strong> (e.g. GTM-XXXXXX).</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* UTM & Traffic Campaign Link Generator */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/30 p-8 mb-8 transition-all hover:shadow-2xl hover:shadow-slate-200/50 duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-[4rem] -mr-8 -mt-8 z-0 transition-transform group-hover:scale-110 duration-500" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-5 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-[#F1641E] to-[#f43f5e] shadow-lg shadow-orange-500/20 flex items-center justify-center text-white">
                    <Activity className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">UTM Campaign Link Generator</h2>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Create custom tracking URLs with specific meeting visibility</p>
                  </div>
                </div>

                <form onSubmit={handleGenerateUrl} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                  {/* Campaign Source Input */}
                  <div className="space-y-2.5">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                      Campaign Source (utm)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. facebook-ads, flyer-qr"
                      value={generatorUtm}
                      onChange={(e) => setGeneratorUtm(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-bold rounded-2xl px-5 py-4 outline-none hover:border-[#F1641E]/40 focus:border-[#F1641E] focus:ring-4 focus:ring-[#F1641E]/5 transition-all shadow-inner placeholder:text-slate-400"
                    />
                  </div>

                  {/* Friendly Alias Name Input */}
                  <div className="space-y-2.5">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                      Friendly Alias Name (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Summer Facebook Campaign"
                      value={generatorAlias}
                      onChange={(e) => setGeneratorAlias(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-bold rounded-2xl px-5 py-4 outline-none hover:border-[#F1641E]/40 focus:border-[#F1641E] focus:ring-4 focus:ring-[#F1641E]/5 transition-all shadow-inner placeholder:text-slate-400"
                    />
                  </div>

                  {/* Brand Logo Select */}
                  <div className="space-y-2.5">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                      Campaign Brand Logo (Optional)
                    </label>
                    <select
                      value={generatorIconType}
                      onChange={(e) => {
                        setGeneratorIconType(e.target.value);
                        if (e.target.value !== 'custom') {
                          setCustomUploadedLogoUrl('');
                        }
                      }}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-bold rounded-2xl px-5 py-4 outline-none hover:border-[#F1641E]/40 focus:border-[#F1641E] focus:ring-4 focus:ring-[#F1641E]/5 transition-all shadow-inner cursor-pointer"
                    >
                      <option value="">Default/Link Icon</option>
                      <option value="facebook">Facebook</option>
                      <option value="instagram">Instagram</option>
                      <option value="twitter">Twitter</option>
                      <option value="google">Google</option>
                      <option value="youtube">YouTube</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="pinterest">Pinterest</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="tiktok">TikTok</option>
                      <option value="qr">QR Code</option>
                      <option value="mail">Mail / Email</option>
                      <option value="custom">📤 Upload Custom Logo...</option>
                    </select>
                  </div>

                  {/* Conditional Upload Custom Logo File Box */}
                  {generatorIconType === 'custom' && (
                    <div className="md:col-span-3 space-y-2.5 animate-in slide-in-from-top duration-300">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                        Upload Custom Campaign Brand Logo
                      </label>
                      <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50/50 border border-dashed border-slate-200 p-5 rounded-3xl">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                          id="campaign-logo-file-input"
                        />
                        <label
                          htmlFor="campaign-logo-file-input"
                          className="flex-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-705 hover:text-[#F1641E] py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-[0.98] w-full"
                        >
                          {isUploadingLogo ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin text-[#F1641E]" />
                              Uploading logo...
                            </>
                          ) : customUploadedLogoUrl ? (
                            <>
                              <Check className="w-4 h-4 text-emerald-500" />
                              Change Brand Logo File
                            </>
                          ) : (
                            <>
                              <ImageIcon className="w-4 h-4 text-[#F1641E]" />
                              Choose Brand Logo Image File
                            </>
                          )}
                        </label>

                        {customUploadedLogoUrl && (
                          <div className="flex items-center gap-3.5 bg-white border border-slate-200 rounded-2xl p-3 pr-5 shrink-0 animate-in zoom-in-95 duration-250">
                            <div className="w-12 h-12 rounded-full border border-slate-100 overflow-hidden shrink-0 bg-slate-50 flex items-center justify-center p-0.5 shadow-inner">
                              <img src={customUploadedLogoUrl} alt="Logo Preview" className="w-full h-full object-cover rounded-full" />
                            </div>
                            <div>
                              <div className="text-[10px] font-black text-slate-800 uppercase tracking-wider">Logo Preview</div>
                              <div className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1 mt-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Uploaded & Ready
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Meeting Override Select */}
                  <div className="space-y-2.5">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                      Meeting Form Popup Option
                    </label>
                    <select
                      value={generatorMeeting}
                      onChange={(e) => setGeneratorMeeting(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-bold rounded-2xl px-5 py-4 outline-none hover:border-[#F1641E]/40 focus:border-[#F1641E] focus:ring-4 focus:ring-[#F1641E]/5 transition-all shadow-inner cursor-pointer"
                    >
                      <option value="hide">Hide Meeting Popup</option>
                      <option value="show">Show Meeting Popup</option>
                    </select>
                  </div>

                  {/* Duration Selection */}
                  <div className="space-y-2.5">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                      Duration of Override Option
                    </label>
                    <select
                      value={generatorDays}
                      onChange={(e) => setGeneratorDays(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-bold rounded-2xl px-5 py-4 outline-none hover:border-[#F1641E]/40 focus:border-[#F1641E] focus:ring-4 focus:ring-[#F1641E]/5 transition-all shadow-inner cursor-pointer"
                    >
                      <option value="0">No Expiration (Always/Optional)</option>
                      <option value="1">1 Day</option>
                      <option value="7">7 Days</option>
                      <option value="30">30 Days</option>
                      <option value="90">90 Days</option>
                    </select>
                  </div>

                  {/* Submit Button */}
                  <div>
                    <button
                      type="submit"
                      className="w-full bg-slate-900 hover:bg-[#F1641E] text-white py-4 rounded-2xl font-black text-sm tracking-wide transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] shadow-lg shadow-slate-900/10 hover:shadow-orange-500/20"
                    >
                      Generate Campaign Link
                    </button>
                  </div>
                </form>

                {/* Generated URL Result Panel */}
                {generatedUrl && (
                  <div className="mt-8 p-6 bg-slate-50 border border-slate-100 rounded-3xl animate-in fade-in duration-350">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="overflow-hidden flex-1">
                        <span className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Generated URL</span>
                        <div className="bg-white border border-slate-200/80 rounded-2xl px-4 py-3 font-mono text-xs text-slate-600 truncate select-all">
                          {generatedUrl}
                        </div>
                      </div>
                      <div className="sm:self-end">
                        <button
                          type="button"
                          onClick={handleCopyUrl}
                          className={`w-full sm:w-auto px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-[0.97] border
                            ${copiedUrl 
                              ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-500 shadow-md' 
                              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm'
                            }`}
                        >
                          {copiedUrl ? (
                            <>
                              <Check className="w-4 h-4" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Activity className="w-4 h-4" />
                              Copy Link
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* List of Campaign Links */}
                <div className="mt-10 border-t border-slate-100 pt-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-sm font-black text-slate-900 tracking-tight">Active Campaign Links</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Stored links with active meeting visibility overrides</p>
                    </div>
                    <span className="text-xs font-black bg-orange-50 text-[#F1641E] px-3.5 py-1 rounded-full border border-orange-100/60 shadow-sm">
                      {campaignLinks.length} Links
                    </span>
                  </div>

                  {campaignLinks.length === 0 ? (
                    <div className="text-center py-10 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No active campaign links created yet.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                      <table className="w-full border-collapse text-left">
                        <thead>
                          <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-200/60">
                            <th className="py-3.5 px-5 font-black">Campaign Name (UTM)</th>
                            <th className="py-3.5 px-5 font-black">Popup Visibility</th>
                            <th className="py-3.5 px-5 font-black">Override Duration</th>
                            <th className="py-3.5 px-5 font-black">Generated URL</th>
                            <th className="py-3.5 px-5 text-right font-black">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs text-slate-600">
                          {campaignLinks.map((link) => {
                            const origin = typeof window !== 'undefined' ? window.location.origin : 'https://store.colorhutbd.xyz';
                            const fullUrl = `${origin}/traffic?utm=${encodeURIComponent(link.utm)}`;
                            return (
                              <tr key={link.id} className="hover:bg-slate-50/50 transition-colors duration-150 group">
                                <td className="py-3.5 px-5">
                                  <div className="flex items-center gap-3">
                                    {renderSourceIcon('', link.icon || 'link')}
                                    <div>
                                      <div className="font-extrabold text-slate-800 text-sm tracking-tight">{link.alias || link.utm}</div>
                                      {link.alias && <div className="text-[9px] text-slate-450 font-bold uppercase tracking-wider">{link.utm}</div>}
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3.5 px-5">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border
                                    ${link.meeting === 'hide' 
                                      ? 'bg-rose-50 text-rose-700 border-rose-100' 
                                      : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                    }`}>
                                    {link.meeting === 'hide' ? 'Hidden' : 'Visible'}
                                  </span>
                                </td>
                                <td className="py-3.5 px-5 font-bold text-slate-500">
                                  {link.days === 0 ? 'Forever' : `${link.days} ${link.days === 1 ? 'Day' : 'Days'}`}
                                </td>
                                <td className="py-3.5 px-5 max-w-[200px] truncate font-mono text-[10px] text-slate-400 select-all" title={fullUrl}>
                                  {fullUrl}
                                </td>
                                <td className="py-3.5 px-5 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        navigator.clipboard.writeText(fullUrl);
                                        setSaveStatus({ type: 'success', message: `Copied "${link.utm}" campaign URL!` });
                                      }}
                                      className="p-2 bg-slate-50 hover:bg-orange-50 text-slate-650 hover:text-[#F1641E] rounded-xl border border-slate-200 hover:border-orange-100 transition-all shadow-sm"
                                      title="Copy URL"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteCampaign(link.id)}
                                      className="p-2 bg-slate-50 hover:bg-rose-50 text-slate-650 hover:text-rose-600 rounded-xl border border-slate-200 hover:border-rose-100 transition-all shadow-sm"
                                      title="Delete Campaign"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Traffic Sources Report Block */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/30 p-8 hover:shadow-2xl transition-all duration-300">
              {/* Header block with Live label and Dropdown filter */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Traffic Analytics</h2>
                  <div className="flex items-center gap-2.5 mt-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 animate-pulse-slow">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-wider">Live System Monitor</span>
                    </div>
                  </div>
                </div>

                <div>
                  <select 
                    value={range}
                    onChange={(e) => {
                      setRange(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-black rounded-xl pl-4 pr-10 py-3 outline-none hover:border-[#F1641E]/40 focus:border-[#F1641E] focus:ring-4 focus:ring-[#F1641E]/5 transition-all cursor-pointer shadow-sm"
                  >
                    <option value="30">Last 30 Days</option>
                    <option value="7">Last 7 Days</option>
                    <option value="1">Today</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Chart Container */}
              <div className="h-72 w-full bg-slate-50/40 rounded-3xl border border-slate-100/60 p-4 mb-8 relative">
                {isLoading ? (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 animate-pulse">
                    <Loader2 className="w-8 h-8 animate-spin text-[#F1641E]" />
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Generating live traffic map...</span>
                  </div>
                ) : (
                  renderSVGChart()
                )}
              </div>

              {/* Traffic Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="text-left text-[11px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100">
                      <th className="pb-4 pl-2 font-black">Source</th>
                      <th className="pb-4 font-black">Target Page</th>
                      <th className="pb-4 font-black">IP Address</th>
                      <th className="pb-4 text-center font-black">Sessions</th>
                      <th className="pb-4 text-right pr-2 font-black">Last Visit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {isLoading ? (
                      [1, 2, 3].map((i) => (
                        <tr key={i} className="animate-pulse">
                          <td className="py-4 pl-2 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100" />
                            <div className="h-4 bg-slate-250 bg-slate-200 rounded w-24" />
                          </td>
                          <td className="py-4"><div className="h-4 bg-slate-150 bg-slate-200 rounded w-28" /></td>
                          <td className="py-4"><div className="h-4 bg-slate-100 bg-slate-200 rounded w-20" /></td>
                          <td className="py-4 text-center"><div className="h-4 bg-slate-150 bg-slate-200 rounded w-8 mx-auto" /></td>
                          <td className="py-4 text-right pr-2"><div className="h-4 bg-slate-100 bg-slate-200 rounded w-24 ml-auto" /></td>
                        </tr>
                      ))
                    ) : paginatedSources.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                          No traffic logs reported in this range.
                        </td>
                      </tr>
                    ) : (
                      paginatedSources.map((source, index) => (
                        <tr key={index} className="group hover:bg-slate-50/70 transition-all duration-200">
                          <td className="py-4 pl-2">
                            <div className="flex items-center gap-3">
                              {renderSourceIcon(source.source_category, source.source_icon)}
                              <div>
                                <div className="font-extrabold text-slate-800 text-sm tracking-tight">{source.source_category}</div>
                                <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Traffic Origin</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 text-xs font-bold text-slate-500 max-w-[240px] truncate" title={source.path}>
                            <span className="font-mono text-[11px] bg-slate-100/70 text-slate-650 px-2.5 py-1.5 rounded-lg border border-slate-200/40 select-all hover:bg-slate-250/50 transition-colors">
                              {source.path || '/'}
                            </span>
                          </td>
                          <td className="py-4 font-bold text-slate-500 font-mono text-xs">
                            {source.ip_address}
                          </td>
                          <td className="py-4 text-center">
                            <span className="inline-flex items-center justify-center font-black text-xs px-3 py-1 bg-orange-50 text-[#F1641E] rounded-full border border-orange-100/50 shadow-sm min-w-[34px]">
                              {source.sessions}
                            </span>
                          </td>
                          <td className="py-4 text-right pr-2">
                            <div className="text-slate-700 font-extrabold text-xs tracking-tight">{formatDateTime(source.last_visit).split(',')[0]}</div>
                            <div className="text-slate-400 font-mono text-[9px] font-bold mt-0.5 uppercase tracking-wider">{formatDateTime(source.last_visit).split(',')[1] || ''}</div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Custom Pagination Footer Controls */}
              {!isLoading && totalItems > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between mt-8 border-t border-slate-100 pt-6 gap-4">
                  <div className="text-xs text-slate-500 font-bold">
                    Showing <span className="text-slate-900 font-extrabold">{startRangeIndex}</span> to <span className="text-slate-900 font-extrabold">{endRangeIndex}</span> of <span className="text-slate-900 font-extrabold">{totalItems}</span> traffic records
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 text-xs font-black text-slate-605 text-slate-600 bg-white border border-slate-205 border-slate-200 hover:bg-slate-50 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 rounded-xl transition-all shadow-sm"
                    >
                      Previous
                    </button>
                    <button 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-5 py-2 text-xs font-black text-white bg-slate-900 hover:bg-slate-800 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 rounded-xl transition-all shadow-md shadow-slate-900/10"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
            
          </div>
        </main>
      </div>
    </div>
  );
}