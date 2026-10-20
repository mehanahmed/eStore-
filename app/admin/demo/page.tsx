'use client';

import AdminSidebar from '../AdminSidebar';
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard,
  Package,
  FolderOpen,
  Image as ImageIcon,
  BarChart3,
  Users,
  Settings,
  Trash2,
  ChevronLeft,
  Menu,
  X,
  LogOut,
  Loader2,
  Check,
  AlertTriangle,
  Video,
  Trash,
  Edit2,
  Plus
} from 'lucide-react';

interface DemoVideo {
  id: string;
  title: string;
  description: string;
  video_url: string;
}

export default function AdminDemoPage() {
  const [demoVideos, setDemoVideos] = useState<DemoVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: ''
  });

  // Upload Form Fields
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Edit Form Fields
  const [editingVideo, setEditingVideo] = useState<DemoVideo | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editVideoUrl, setEditVideoUrl] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Deletion state
  const [deleteVideoId, setDeleteVideoId] = useState<string | null>(null);

  // Collapsible Sidebar State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Load sidebar collapse preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed') === 'true';
    setIsSidebarCollapsed(saved);
  }, []);

  const toggleSidebar = () => {
    const nextState = !isSidebarCollapsed;
    setIsSidebarCollapsed(nextState);
    localStorage.setItem('sidebarCollapsed', String(nextState));
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setSaveStatus({ type, message });
    setTimeout(() => {
      setSaveStatus({ type: null, message: '' });
    }, 4000);
  };

  // Fetch current config & demo videos
  const loadConfig = async () => {
    try {
      const response = await fetch('/api/public/config');
      if (response.ok) {
        const data = await response.json();
        if (data.demo_videos) {
          try {
            const parsed = JSON.parse(data.demo_videos);
            if (Array.isArray(parsed)) {
              setDemoVideos(parsed);
            }
          } catch (e) {
            console.error('Error parsing demo videos JSON:', e);
          }
        }
      } else {
        showToast('Failed to fetch site config.', 'error');
      }
    } catch (err) {
      console.error('Error loading config:', err);
      showToast('Network error occurred while loading settings.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTitle.trim()) {
      showToast('Title is required.', 'error');
      return;
    }

    if (!videoUrlInput.trim()) {
      showToast('Video URL is required.', 'error');
      return;
    }

    setIsUploading(true);

    try {
      const finalVideoUrl = videoUrlInput.trim();

      // 1. Prepare new video object
      const newVideo: DemoVideo = {
        id: Date.now().toString(),
        title: videoTitle.trim(),
        description: videoDescription.trim(),
        video_url: finalVideoUrl
      };

      const updatedVideos = [...demoVideos, newVideo];

      // 2. Save settings to DB
      const saveRes = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          demo_videos: JSON.stringify(updatedVideos),
        }),
      });

      if (!saveRes.ok) {
        throw new Error('Failed to save demo video settings.');
      }

      setDemoVideos(updatedVideos);
      setVideoTitle('');
      setVideoDescription('');
      setVideoUrlInput('');
      setIsAddModalOpen(false);
      showToast('Video added successfully!', 'success');
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'An error occurred during save.';
      console.error(err);
      showToast(errMsg, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditClick = (video: DemoVideo) => {
    setEditingVideo(video);
    setEditTitle(video.title);
    setEditDescription(video.description);
    setEditVideoUrl(video.video_url);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideo || !editTitle.trim()) return;

    setIsSavingEdit(true);

    try {
      const updatedVideos = demoVideos.map(v => {
        if (v.id === editingVideo.id) {
          return {
            ...v,
            title: editTitle.trim(),
            description: editDescription.trim(),
            video_url: editVideoUrl.trim()
          };
        }
        return v;
      });

      const saveRes = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          demo_videos: JSON.stringify(updatedVideos),
        }),
      });

      if (!saveRes.ok) {
        throw new Error('Failed to save edited video details.');
      }

      setDemoVideos(updatedVideos);
      setEditingVideo(null);
      showToast('Video details updated!', 'success');
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Failed to edit video settings.';
      console.error(err);
      showToast(errMsg, 'error');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteVideoId) return;

    try {
      const updatedVideos = demoVideos.filter(v => v.id !== deleteVideoId);

      const saveRes = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          demo_videos: JSON.stringify(updatedVideos),
        }),
      });

      if (!saveRes.ok) {
        throw new Error('Failed to remove demo video settings.');
      }

      setDemoVideos(updatedVideos);
      setDeleteVideoId(null);
      showToast('Video removed successfully!', 'success');
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Failed to delete video.';
      console.error(err);
      showToast(errMsg, 'error');
    }
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
      { name: 'Demo Video', href: '/admin/demo', icon: Video, active: true },
    ],
    management: [
      { name: 'Pixel & Traffic', href: '/admin/pixel-traffic', icon: BarChart3 },
      { name: 'Meeting Requests', href: '/admin/meeting-requests', icon: Users },
      { name: 'SEO Settings', href: '/admin/seo', icon: Settings },
      { name: 'Trash', href: '/admin/trash', icon: Trash2 },
    ]
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans antialiased text-slate-800">
      {/* Sidebar Overlay (Mobile) */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-45 md:hidden transition-opacity"
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
            
            {/* Header Block */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Demo Video Settings</h1>
                <p className="text-slate-500 font-medium">Manage and upload the demo videos displayed on the public site.</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="py-3 px-5 bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-2xl text-sm transition-all shadow-lg shadow-orange-500/20 active:scale-[0.98] flex items-center justify-center gap-2 self-start md:self-auto"
              >
                <Plus className="w-4 h-4" />
                Add New Video
              </button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
              </div>
            ) : (
              <div className="w-full">
                
                {/* Video Grid List */}
                <div className="space-y-6">
                  <h3 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-2">
                    <Video className="w-5 h-5 text-orange-500" />
                    Uploaded Demo Videos ({demoVideos.length})
                  </h3>

                  {demoVideos.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {demoVideos.map(video => (
                        <div key={video.id} className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm bg-white flex flex-col justify-between">
                          <div className="bg-black aspect-video relative">
                            <video src={video.video_url} controls controlsList="nodownload" className="w-full h-full object-cover" onContextMenu={(e)=>e.preventDefault()} />
                          </div>
                          <div className="p-5 flex-1 flex flex-col justify-between">
                            <div>
                              <h4 className="font-extrabold text-slate-800 text-base mb-1 truncate">{video.title}</h4>
                              <p className="text-xs text-slate-400 font-medium line-clamp-3 mb-4">{video.description || 'No description provided.'}</p>
                            </div>
                            <div className="flex gap-2 border-t border-slate-50 pt-4">
                              <button
                                onClick={() => handleEditClick(video)}
                                className="flex-1 py-2 px-3 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                Edit Info
                              </button>
                              <button
                                onClick={() => setDeleteVideoId(video.id)}
                                className="flex-1 py-2 px-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                              >
                                <Trash className="w-3.5 h-3.5" />
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border border-dashed border-slate-200 rounded-2xl p-16 text-center text-slate-400 bg-white">
                      <Video className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-base font-bold text-slate-600 mb-1">No active demo videos</p>
                      <p className="text-xs text-slate-400">Click "Add New Video" at the top to display them publicly.</p>
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        </main>
      </div>

      {/* Edit Details Modal */}
      {editingVideo && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setEditingVideo(null)} />
          <form onSubmit={handleEditSubmit} className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-orange-500" />
              Edit Video Details
            </h3>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Video Title</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Video Description</label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Video URL</label>
              <input
                type="url"
                value={editVideoUrl}
                onChange={(e) => setEditVideoUrl(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditingVideo(null)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSavingEdit || !editTitle.trim()}
                className="flex-1 py-3 bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-orange-500/15 flex items-center justify-center gap-1.5"
              >
                {isSavingEdit && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteVideoId && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setDeleteVideoId(null)} />
          <div className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 mb-2">Delete Demo Video?</h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Are you sure you want to remove this demo video? Public visitors will no longer see it. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteVideoId(null)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-red-500/15"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Add New Video Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />
          <form onSubmit={handleUploadSubmit} className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Plus className="w-5 h-5 text-orange-500" />
              Add New Video
            </h3>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Video Title</label>
              <input
                type="text"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                placeholder="e.g., Brand Identity Showcase"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Video Description</label>
              <textarea
                value={videoDescription}
                onChange={(e) => setVideoDescription(e.target.value)}
                placeholder="Provide a brief summary of this showcase video..."
                rows={3}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Video URL</label>
              <input
                type="url"
                value={videoUrlInput}
                onChange={(e) => setVideoUrlInput(e.target.value)}
                placeholder="e.g., https://yourdomain.com/video.mp4"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading || !videoTitle.trim() || !videoUrlInput.trim()}
                className="flex-1 py-3 bg-linear-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-orange-500/15 flex items-center justify-center gap-1.5"
              >
                {isUploading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Save Settings
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}