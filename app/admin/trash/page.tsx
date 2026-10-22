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
  X,
  Video
} from 'lucide-react';

interface TrashItem {
  id: number;
  name: string;
  type: 'Product' | 'Category';
  image?: string;
  deleted_at: string;
}

export default function TrashPage() {
  const [items, setItems] = useState<TrashItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: ''
  });

  // Sidebar collapsibility
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Modal target states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [deleteTargetType, setDeleteTargetType] = useState<'Product' | 'Category' | null>(null);
  const [isEmptyTrashMode, setIsEmptyTrashMode] = useState(false);

  // Sidebar local storage loading
  useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed') === 'true';
    setIsSidebarCollapsed(saved);
  }, []);

  const toggleSidebar = () => {
    const nextState = !isSidebarCollapsed;
    setIsSidebarCollapsed(nextState);
    localStorage.setItem('sidebarCollapsed', String(nextState));
  };

  // Fetch trash items from API
  const fetchTrash = async () => {
    try {
      const response = await fetch('/api/trash');
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      } else {
        setSaveStatus({ type: 'error', message: 'Failed to fetch trash items.' });
      }
    } catch (err) {
      console.error('Error fetching trash:', err);
      setSaveStatus({ type: 'error', message: 'Network error loading trash.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrash();
  }, []);

  // RESTORE ITEM
  const handleRestoreItem = async (id: number, type: 'Product' | 'Category') => {
    const endpoint = type === 'Product' ? `/api/products/${id}/restore` : `/api/categories/${id}/restore`;
    try {
      const response = await fetch(endpoint, { method: 'POST' });
      if (response.ok) {
        setSaveStatus({ type: 'success', message: `${type} restored successfully!` });
        fetchTrash();
        setTimeout(() => setSaveStatus({ type: null, message: '' }), 5000);
      } else {
        setSaveStatus({ type: 'error', message: 'Failed to restore item.' });
      }
    } catch (err) {
      console.error('Error restoring item:', err);
      setSaveStatus({ type: 'error', message: 'Network error restoring item.' });
    }
  };

  // OPEN DELETE MODAL FOR SINGLE ITEM
  const openDeleteModal = (id: number, type: 'Product' | 'Category') => {
    setDeleteTargetId(id);
    setDeleteTargetType(type);
    setIsEmptyTrashMode(false);
    setIsModalOpen(true);
  };

  // OPEN DELETE MODAL FOR EMPTYING TRASH
  const openEmptyTrashModal = () => {
    setIsEmptyTrashMode(true);
    setIsModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteTargetId(null);
    setDeleteTargetType(null);
    setIsEmptyTrashMode(false);
    setIsModalOpen(false);
  };

  // CONFIRM PERMANENT DELETE
  const confirmDelete = async () => {
    try {
      if (isEmptyTrashMode) {
        const response = await fetch('/api/trash/empty', { method: 'DELETE' });
        if (response.ok) {
          setSaveStatus({ type: 'success', message: 'Trash emptied successfully!' });
          fetchTrash();
          setTimeout(() => setSaveStatus({ type: null, message: '' }), 5000);
        } else {
          setSaveStatus({ type: 'error', message: 'Failed to empty trash.' });
        }
      } else if (deleteTargetId && deleteTargetType) {
        const endpoint = deleteTargetType === 'Product' 
          ? `/api/products/${deleteTargetId}/permanent` 
          : `/api/categories/${deleteTargetId}/permanent`;
        const response = await fetch(endpoint, { method: 'DELETE' });
        if (response.ok) {
          setSaveStatus({ type: 'success', message: 'Item deleted permanently!' });
          fetchTrash();
          setTimeout(() => setSaveStatus({ type: null, message: '' }), 5000);
        } else {
          setSaveStatus({ type: 'error', message: 'Failed to permanently delete item.' });
        }
      }
    } catch (err) {
      console.error('Error executing delete action:', err);
      setSaveStatus({ type: 'error', message: 'Network error executing delete.' });
    } finally {
      closeDeleteModal();
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
      { name: 'Demo Video', href: '/admin/demo', icon: Video },
    ],
    management: [
      { name: 'Pixel & Traffic', href: '/admin/pixel-traffic', icon: BarChart3 },
      { name: 'Meeting Requests', href: '/admin/meeting-requests', icon: Users },
      { name: 'SEO Settings', href: '/admin/seo', icon: Settings },
      { name: 'Trash', href: '/admin/trash', icon: Trash2, active: true },
    ]
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans antialiased text-slate-800">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden h-16 bg-white border-b border-slate-200/80 flex items-center justify-center relative px-6 z-30">
          <img src="/logo.png" alt="Color Hut" className="h-7 object-contain" />
          <div className="absolute right-6 w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-sm">
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
            
            {/* Action Buttons Block */}
            {!isLoading && items.length > 0 && (
              <div className="flex justify-end mb-4">
                <button 
                  onClick={openEmptyTrashModal}
                  className="bg-red-50 text-red-600 border border-red-100 px-5 py-2.5 rounded-xl font-bold hover:bg-red-100 transition-all flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Empty Trash
                </button>
              </div>
            )}

            {isLoading ? (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 p-6 md:p-8 space-y-6 animate-pulse">
                {/* Table Headers Skeleton */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="h-4 bg-slate-200 rounded w-1/4" />
                  <div className="h-4 bg-slate-100 rounded w-1/12" />
                  <div className="h-4 bg-slate-100 rounded w-1/6" />
                  <div className="h-4 bg-slate-100 rounded w-1/12" />
                </div>
                {/* Rows Skeleton */}
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between py-4 border-b border-slate-50 last:border-0">
                    <div className="flex items-center gap-4 w-1/3">
                      <div className="w-12 h-12 bg-slate-100 rounded-xl" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-slate-200 rounded w-3/4" />
                        <div className="h-3 bg-slate-100 rounded w-1/2" />
                      </div>
                    </div>
                    <div className="h-4 bg-slate-100 rounded w-1/12" />
                    <div className="h-4 bg-slate-100 rounded w-1/6" />
                    <div className="flex items-center gap-3 w-1/12 justify-end">
                      <div className="h-4 bg-slate-200 rounded w-10" />
                      <div className="h-4 bg-slate-200 rounded w-10" />
                    </div>
                  </div>
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 p-12 md:p-20 text-center flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center mb-6">
                  <Trash2 className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 mb-2">Trash is empty</h3>
                <p className="text-xs text-slate-400 font-medium">Deleted items will appear here.</p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-xs font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                        <th className="py-6 pl-8">Item</th>
                        <th className="py-6">Type</th>
                        <th className="py-6">Deleted Date</th>
                        <th className="py-6 pr-8 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {items.map((item) => {
                        let mainImage = '';
                        if (item.type === 'Product' && item.image) {
                            try {
                                const images = item.image.startsWith('[') ? JSON.parse(item.image) : [item.image];
                                mainImage = images[0] || '';
                            } catch(e) {
                                mainImage = item.image;
                            }
                            if (mainImage && !mainImage.startsWith('http') && !mainImage.startsWith('data:')) {
                                mainImage = mainImage.startsWith('/') ? (mainImage.startsWith('/uploads/') ? mainImage : '/uploads' + mainImage) : '/uploads/' + mainImage;
                            }
                        }

                        return (
                          <tr key={`${item.type}-${item.id}`} className="group hover:bg-slate-50/50 transition-colors">
                            <td className="py-4 pl-8">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-50 border border-slate-200/30 overflow-hidden flex items-center justify-center text-slate-400 rounded-xl">
                                  {mainImage ? (
                                    <img src={mainImage} alt={item.name} className="w-full h-full object-cover" />
                                  ) : item.type === 'Product' ? (
                                    <Package className="w-5 h-5 text-slate-300" />
                                  ) : (
                                    <FolderOpen className="w-5 h-5 text-slate-300" />
                                  )}
                                </div>
                                <div>
                                  <div className="font-extrabold text-slate-900 text-sm">{item.name}</div>
                                  <div className="text-[10px] font-bold text-slate-400">#{item.id}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 font-black text-xs text-slate-600">{item.type}</td>
                            <td className="py-4 font-bold text-xs text-slate-500">
                              {new Date(item.deleted_at).toLocaleDateString(undefined, { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric' 
                              })}
                            </td>
                            <td className="py-4 pr-8 text-right">
                              <div className="flex items-center justify-end gap-6">
                                <button 
                                  onClick={() => handleRestoreItem(item.id, item.type)} 
                                  className="text-emerald-600 hover:text-orange-500 font-bold text-sm transition-all"
                                >
                                  Restore
                                </button>
                                <button 
                                  onClick={() => openDeleteModal(item.id, item.type)} 
                                  className="text-rose-500 hover:text-rose-600 font-bold text-sm transition-all"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Delete / Empty Trash Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-8 text-left shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-black text-slate-900 mb-4">
              {isEmptyTrashMode ? 'Empty Trash?' : 'Delete Permanently?'}
            </h2>
            <p className="text-slate-600 mb-6 font-medium">
              {isEmptyTrashMode 
                ? 'This action cannot be undone. All deleted items will be removed forever.' 
                : 'This action cannot be undone. The item will be removed forever.'
              }
            </p>
            <div className="flex gap-3">
              <button 
                onClick={closeDeleteModal}
                className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}