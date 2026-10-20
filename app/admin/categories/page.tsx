'use client';

import AdminSidebar from '../AdminSidebar';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Sortable from 'sortablejs';
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
  Plus,
  Trash,
  Check,
  AlertTriangle,
  UploadCloud,
  FileImage,
  Edit2,
  Search,
  Grid,
  Video
} from 'lucide-react';

interface Category {
  id: number;
  parent_id?: number | null;
  name: string;
  slug: string;
  icon?: string | null;
  position: number;
  parent_ids?: string | null;
  parent_names?: string | null;
  created_at?: string;
  updated_at?: string;
  is_deleted?: boolean;
}

export default function CategoriesPage() {
  // All category listings from the server
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: ''
  });

  // Selection states
  const [selectedMainCategoryId, setSelectedMainCategoryId] = useState<number | null>(null);
  const [showActionsId, setShowActionsId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);

  // Form Fields State
  const [categoryName, setCategoryName] = useState('');
  const [categoryIcon, setCategoryIcon] = useState<string | null>(null);
  const [selectedParents, setSelectedParents] = useState<number[]>([]);
  const [isUploadingIcon, setIsUploadingIcon] = useState(false);
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  // Deletion Modal state
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; categoryId: number | null; name: string }>({
    isOpen: false,
    categoryId: null,
    name: ''
  });

  // Collapsible Sidebar State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed') === 'true';
    setIsSidebarCollapsed(saved);
  }, []);

  // Handle clicking outside to close actions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.category-action-area')) {
        setShowActionsId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleSidebar = () => {
    const nextState = !isSidebarCollapsed;
    setIsSidebarCollapsed(nextState);
    localStorage.setItem('sidebarCollapsed', String(nextState));
  };

  // Load all categories from API
  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        setSaveStatus({ type: 'error', message: 'Failed to fetch categories list.' });
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setSaveStatus({ type: 'error', message: 'Network error occurred while fetching categories.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Filter Categories: Main Categories (categories that have no parents mapped)
  const mainCategories = categories.filter(c => !c.parent_ids);

  // Filter Categories: Sub-categories currently rendered
  const getFilteredSubCategories = () => {
    let list = categories;

    if (selectedMainCategoryId !== null) {
      // Filter by selected main category
      list = list.filter(cat => {
        const parentIds = String(cat.parent_ids || '').split(',').map(id => id.trim());
        return parentIds.includes(String(selectedMainCategoryId));
      });
    } else {
      // "All Categories" view: only show sub-categories (those that have parent mapping)
      list = list.filter(cat => cat.parent_ids);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(cat => cat.name.toLowerCase().includes(q));
    }

    return list;
  };

  // Reorder API call helper — wrapped in useCallback to be stable across renders
  const saveReorderedPositions = useCallback(async (reorderedList: { id: number; position: number }[]) => {
    try {
      const response = await fetch('/api/categories/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orders: reorderedList })
      });
      if (response.ok) {
        setSaveStatus({ type: 'success', message: 'Category order updated successfully!' });
        setTimeout(() => setSaveStatus({ type: null, message: '' }), 4000);
        loadCategories(); // Reload clean state
      } else {
        setSaveStatus({ type: 'error', message: 'Failed to save reorder position.' });
      }
    } catch (err) {
      console.error('Error reordering categories:', err);
      setSaveStatus({ type: 'error', message: 'Network error during reordering.' });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const handleIconUpload = async (file: File) => {
    setIsUploadingIcon(true);
    setSaveStatus({ type: null, message: '' });

    const formData = new FormData();
    formData.append('images', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        if (data.imageUrls && data.imageUrls[0]) {
          setCategoryIcon(data.imageUrls[0]);
          setSaveStatus({ type: 'success', message: 'Category icon uploaded successfully!' });
          setTimeout(() => setSaveStatus({ type: null, message: '' }), 4000);
        }
      } else {
        setSaveStatus({ type: 'error', message: 'Icon upload failed.' });
      }
    } catch (err) {
      console.error('Error uploading icon:', err);
      setSaveStatus({ type: 'error', message: 'Network error occurred during icon upload.' });
    } finally {
      setIsUploadingIcon(false);
    }
  };

  // Modal open handlers
  const handleOpenCreateModal = () => {
    setModalMode('create');
    setCategoryName('');
    setCategoryIcon(null);
    setSelectedParents([]);
    setEditingCategoryId(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (category: Category) => {
    setModalMode('edit');
    setEditingCategoryId(category.id);
    setCategoryName(category.name);
    setCategoryIcon(category.icon || null);
    
    const parentIds = category.parent_ids ? category.parent_ids.split(',').map(Number) : [];
    setSelectedParents(parentIds);
    setIsModalOpen(true);
  };

  // Toggle checklist parents selection
  const handleParentCheckboxChange = (id: number) => {
    if (selectedParents.includes(id)) {
      setSelectedParents(prev => prev.filter(p => p !== id));
    } else {
      setSelectedParents(prev => [...prev, id]);
    }
  };

  // Save Category Submit
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    setIsSavingCategory(true);
    setSaveStatus({ type: null, message: '' });

    const payload = {
      name: categoryName,
      parent_ids: selectedParents,
      icon: categoryIcon || null
    };

    try {
      const url = modalMode === 'edit' ? `/api/categories/${editingCategoryId}` : '/api/categories';
      const method = modalMode === 'edit' ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setIsModalOpen(false);
        setSaveStatus({
          type: 'success',
          message: modalMode === 'edit' ? 'Category updated successfully!' : 'New category created successfully!'
        });
        loadCategories();
        setTimeout(() => setSaveStatus({ type: null, message: '' }), 5000);
      } else {
        const error = await response.json();
        setSaveStatus({ type: 'error', message: error.error || 'Failed to save category.' });
      }
    } catch (err) {
      console.error('Error saving category:', err);
      setSaveStatus({ type: 'error', message: 'A network error occurred while saving.' });
    } finally {
      setIsSavingCategory(false);
    }
  };

  // Deletion modals
  const handleOpenDeleteModal = (id: number, name: string) => {
    setDeleteModal({ isOpen: true, categoryId: id, name });
  };

  const handleCloseDeleteModal = () => {
    setDeleteModal({ isOpen: false, categoryId: null, name: '' });
  };

  const confirmDeleteCategory = async () => {
    if (deleteModal.categoryId === null) return;
    
    setSaveStatus({ type: null, message: '' });
    const idToDelete = deleteModal.categoryId;
    handleCloseDeleteModal();

    try {
      const response = await fetch(`/api/categories/${idToDelete}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setSaveStatus({ type: 'success', message: 'Category deleted successfully!' });
        loadCategories();
        setSelectedMainCategoryId(null); // Reset active tab in case it was deleted
        setTimeout(() => setSaveStatus({ type: null, message: '' }), 5000);
      } else {
        const error = await response.json();
        setSaveStatus({ type: 'error', message: error.error || 'Failed to delete category.' });
      }
    } catch (err) {
      console.error('Error deleting category:', err);
      setSaveStatus({ type: 'error', message: 'A network error occurred during deletion.' });
    }
  };

  // Sidebar Layout Definitions
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
      { name: 'Categories', href: '/admin/categories', icon: FolderOpen, active: true },
      { name: 'Mobile Hero', href: '/admin/mobile-hero', icon: ImageIcon },
      { name: 'Demo Video', href: '/admin/demo', icon: Video },
    ],
    management: [
      { name: 'Pixel & Traffic', href: '/admin/pixel-traffic', icon: BarChart3 },
      { name: 'Meeting Requests', href: '/admin/meeting-requests', icon: Users },
      { name: 'SEO Settings', href: '/admin/seo', icon: Settings },
      { name: 'Trash', href: '/admin/trash', icon: Trash2 },
    ]
  };

  const filteredSubCategoriesList = getFilteredSubCategories();

  // Initialize SortableJS for Main Category Tabs
  useEffect(() => {
    if (isLoading || mainCategories.length === 0) return;

    const tabsContainer = document.getElementById('mainCategoryTabs');
    if (!tabsContainer) return;

    const sortable = Sortable.create(tabsContainer, {
      animation: 150,
      filter: '[data-id="null"]', // Prevent 'All Categories' from being dragged
      draggable: 'div[data-id]:not([data-id="null"])',
      handle: '.category-tab',
      ghostClass: 'opacity-50',
      onEnd: async () => {
        // Collect new order sequence from DOM children
        const tabs = Array.from(tabsContainer.children).filter(el => {
          const htmlEl = el as HTMLElement;
          return htmlEl.dataset.id && htmlEl.dataset.id !== 'null';
        });

        const orders = tabs.map((el, index) => ({
          id: parseInt((el as HTMLElement).dataset.id || '0'),
          position: index
        }));

        await saveReorderedPositions(orders);
      }
    });

    return () => {
      sortable.destroy();
    };
  }, [isLoading, mainCategories.length]);

  // Stable ref so SortableJS onEnd always calls the latest saveReorderedPositions
  const saveReorderedPositionsRef = useRef(saveReorderedPositions);
  useEffect(() => { saveReorderedPositionsRef.current = saveReorderedPositions; }, [saveReorderedPositions]);

  // Initialize SortableJS for Sub-Categories Pills
  useEffect(() => {
    if (isLoading) return;

    const grid = document.getElementById('categoriesGrid');
    if (!grid || grid.children.length === 0) return;

    const sortable = Sortable.create(grid, {
      animation: 150,
      ghostClass: 'opacity-40',
      onEnd: () => {
        const orders = Array.from(grid.children).map((el, index) => ({
          id: parseInt((el as HTMLElement).dataset.id || '0'),
          position: index
        }));
        saveReorderedPositionsRef.current(orders);
      }
    });

    return () => {
      sortable.destroy();
    };
  }, [isLoading, filteredSubCategoriesList.length, selectedMainCategoryId, searchQuery]);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans antialiased text-slate-800">
      
      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-45 md:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <AdminSidebar />

      {/* Main Container Context */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* Mobile Header Banner */}
        <header className="md:hidden h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-6 z-30">
          <button 
            onClick={() => setIsMobileOpen(true)}
            className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50"
          >
            <Menu className="w-5 h-5" />
          </button>
          <img src="/logo.png" alt="Color Hut" className="h-7 object-contain" />
          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-sm">
            C
          </div>
        </header>

        {/* Global Toast Alert */}
        {saveStatus.message && (
          <div className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-6 py-4 rounded-2xl shadow-xl shadow-slate-900/10 border transition-all duration-300 transform translate-y-0
            ${saveStatus.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'}
          `}>
            {saveStatus.type === 'success' ? (
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 animate-bounce">
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

        {/* Main Dashboard Layout Area */}
        <main className="flex-1 overflow-y-auto w-full">
          <div className="p-6 md:p-10 max-w-7xl mx-auto w-full">
            
            {/* Page Title block */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Categories</h1>
                <p className="text-slate-500 font-medium">Manage and reorder your product categories.</p>
              </div>
              <button 
                onClick={handleOpenCreateModal}
                className="bg-slate-900 hover:bg-orange-600 text-white px-5 py-3 rounded-xl text-sm font-bold transition-all shadow-lg flex items-center justify-center gap-2 self-start md:self-auto"
              >
                <Plus className="w-4.5 h-4.5" />
                New Category
              </button>
            </div>

            {/* Horizontal Scrollable Categories Tab Panel */}
            <div className="mb-8">
              <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide items-center" id="mainCategoryTabs">
                {/* All Categories Trigger */}
                <div className="relative flex items-center shrink-0" data-id="null">
                  <button
                    onClick={() => {
                      setSelectedMainCategoryId(null);
                      setSearchQuery('');
                    }}
                    className={`px-6 py-3.5 rounded-2xl font-bold text-sm whitespace-nowrap flex items-center gap-1.5 transition-all shadow-sm hover:-translate-y-0.5
                      ${selectedMainCategoryId === null 
                        ? 'bg-linear-to-r from-orange-500 to-orange-600 text-white border-transparent shadow-orange-500/20' 
                        : 'bg-white text-slate-700 hover:bg-orange-50/50 hover:text-orange-600 border-slate-100'
                      }
                    `}
                  >
                    <Grid className="w-4 h-4" />
                    All Categories
                  </button>
                  {selectedMainCategoryId === null && (
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[7px] border-t-orange-600 z-10 animate-in fade-in slide-in-from-top-1 duration-200" />
                  )}
                </div>

                {/* Dynamic Main Categories Tabs list */}
                {isLoading ? (
                  <div className="flex gap-3 animate-pulse">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="bg-slate-100 h-10 w-28 rounded-2xl" />
                    ))}
                  </div>
                ) : (
                  mainCategories.map((cat, idx) => {
                    const isActive = selectedMainCategoryId === cat.id;
                    return (
                      <div key={cat.id} data-id={cat.id} className="relative flex items-center group shrink-0 category-action-area">
                        <div
                          onClick={() => {
                            setSelectedMainCategoryId(cat.id);
                            setSearchQuery('');
                          }}
                          onDoubleClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowActionsId(prev => prev === cat.id ? null : cat.id);
                          }}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              setSelectedMainCategoryId(cat.id);
                              setSearchQuery('');
                            }
                          }}
                          className={`category-tab px-6 py-3.5 rounded-2xl font-bold text-sm whitespace-nowrap transition-all border shadow-sm flex items-center gap-2 hover:-translate-y-0.5 cursor-grab select-none outline-none
                            ${isActive 
                              ? 'bg-linear-to-r from-orange-500 to-orange-600 text-white border-transparent shadow-orange-500/20' 
                              : 'bg-white text-slate-700 hover:bg-orange-50/50 hover:text-orange-600 border-slate-100'
                            }
                          `}
                        >
                          <span>{cat.name}</span>
                          
                          {/* Inner edit and delete indicators visible on double click */}
                          <div className={`${showActionsId === cat.id ? 'flex' : 'hidden'} items-center gap-1.5 ml-2 border-l pl-2 transition-opacity duration-300
                            ${isActive ? 'border-orange-400' : 'border-slate-100'}
                          `}>
                            <button
                              onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenEditModal(cat);
                              }}
                              className={`p-1 rounded-md transition-colors ${isActive ? 'hover:bg-white/20 text-white' : 'hover:bg-slate-100 text-slate-400 hover:text-orange-500'}`}
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenDeleteModal(cat.id, cat.name);
                              }}
                              className={`p-1 rounded-md transition-colors ${isActive ? 'hover:bg-white/20 text-white' : 'hover:bg-slate-100 text-slate-400 hover:text-red-500'}`}
                              title="Delete"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Exact Downward Triangle Pointer Arrow mimicking active CSS ::after rule */}
                        {isActive && (
                          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[7px] border-t-orange-600 z-10 animate-in fade-in slide-in-from-top-1 duration-200" />
                        )}


                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Sub-categories Search Engine */}
            <div className="relative group mb-8">
              <input 
                type="text" 
                placeholder="Search sub-categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border-2 border-slate-100 shadow-sm rounded-2xl py-3.5 px-5 pl-12 outline-none focus:border-orange-500 focus:bg-white text-slate-800 font-bold transition-all placeholder:text-slate-300"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-500 transition-colors pointer-events-none">
                <Search className="w-5 h-5" />
              </div>
            </div>

            {/* Sub-categories as horizontal scrollable pills */}
            {isLoading ? (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="animate-pulse bg-slate-100 h-11 w-32 rounded-full shrink-0" />
                ))}
              </div>
            ) : filteredSubCategoriesList.length === 0 ? null : (
              <div
                className="flex flex-wrap gap-2"
                id="categoriesGrid"
              >
                {filteredSubCategoriesList.map((cat) => {
                  const isActionsOpen = showActionsId === cat.id;
                  return (
                    <div
                      key={cat.id}
                      data-id={cat.id}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        setShowActionsId(prev => prev === cat.id ? null : cat.id);
                      }}
                      className={`category-action-area relative flex items-center gap-2 h-11 rounded-full border bg-white pl-1.5 pr-4 shadow-sm cursor-grab active:cursor-grabbing select-none transition-all duration-200 hover:shadow-md
                        ${isActionsOpen
                          ? 'border-orange-400 ring-2 ring-orange-100'
                          : 'border-black/10'
                        }
                      `}
                    >
                      {/* Circular icon */}
                      <div className="w-8 h-8 rounded-full border border-black/10 overflow-hidden shrink-0 bg-slate-50">
                        {cat.icon ? (
                          <img src={cat.icon} className="w-full h-full object-cover object-center" alt={cat.name} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FolderOpen className="w-4 h-4 text-slate-300" />
                          </div>
                        )}
                      </div>

                      {/* Label */}
                      <span className="text-sm font-semibold text-slate-800 whitespace-nowrap" style={{ fontFamily: 'GTStandard-MSemibold, Inter, sans-serif', letterSpacing: '-0.2px' }}>
                        {cat.name}
                      </span>

                      {/* Edit / Delete — shown on double-click */}
                      {isActionsOpen && (
                        <div className="flex items-center gap-0.5 ml-1 border-l border-orange-200 pl-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleOpenEditModal(cat); }}
                            className="p-1 rounded-full hover:bg-orange-50 text-slate-400 hover:text-orange-500 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleOpenDeleteModal(cat.id, cat.name); }}
                            className="p-1 rounded-full hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                            title="Delete"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}


          </div>
        </main>
      </div>

      {/* Category Creation / Editing Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-black text-slate-900 mb-6">
              {modalMode === 'edit' ? 'Edit Category' : 'New Category'}
            </h2>
            
            <form onSubmit={handleSaveCategory} className="space-y-5">
              {/* Category Name Input */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-orange-500 focus:bg-white text-slate-800 font-medium transition-all"
                  placeholder="Enter category name"
                />
              </div>

              {/* Icon Image Drop Zone */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                  Category Icon
                </label>
                
                <div 
                  className="relative w-full bg-slate-50 border-2 border-dashed border-slate-200 hover:border-orange-500 hover:bg-orange-50/20 rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[96px] group"
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleIconUpload(e.target.files[0]);
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />

                  {isUploadingIcon ? (
                    <div className="flex flex-col items-center gap-1.5">
                      <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Uploading...</span>
                    </div>
                  ) : categoryIcon ? (
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-200 shadow-inner group">
                      <img src={categoryIcon} className="w-full h-full object-cover" alt="Preview" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setCategoryIcon(null);
                        }}
                        className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-orange-500 transition-colors" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Upload Icon Image</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Parent Category Multi-Select Selection Checklist */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                  Parent Categories (Select Multiple)
                </label>
                <div className="max-h-36 overflow-y-auto bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                  {mainCategories.length === 0 ? (
                    <p className="text-[10px] text-slate-400 text-center py-2 uppercase font-black">
                      No main categories available
                    </p>
                  ) : (
                    mainCategories
                      .filter(cat => cat.id !== editingCategoryId) // Prevent selecting self as parent
                      .map((cat) => (
                        <label 
                          key={cat.id} 
                          className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors border border-transparent hover:border-slate-100"
                        >
                          <input
                            type="checkbox"
                            checked={selectedParents.includes(cat.id)}
                            onChange={() => handleParentCheckboxChange(cat.id)}
                            className="w-4 h-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                          />
                          <span className="text-sm font-bold text-slate-700">{cat.name}</span>
                        </label>
                      ))
                  )}
                </div>
              </div>

              {/* Form Trigger Action Cta Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingCategory}
                  className="flex-1 bg-slate-900 hover:bg-orange-600 text-white py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  {isSavingCategory && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-8 text-left shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-black text-slate-900 mb-4">
              Delete Category?
            </h2>
            <p className="text-slate-600 mb-6 font-medium">
              Are you sure you want to delete <strong className="text-slate-900">{deleteModal.name}</strong>? This action cannot be undone. Products in this category will be uncategorized.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={handleCloseDeleteModal}
                className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDeleteCategory}
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