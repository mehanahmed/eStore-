'use client';

import AdminSidebar from '../AdminSidebar';
﻿import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  ChevronRight,
  X,
  LogOut,
  Loader2,
  Plus,
  Search,
  Grid,
  Trash,
  Check,
  Edit2,
  ChevronDown,
  Youtube,
  Pin,
  Bold,
  Italic,
  Heading,
  List,
  Link as LinkIcon,
  Eye,
  UploadCloud,
  FileImage,
  GripVertical,
  Save,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  ListOrdered,
  Quote,
  Code,
  Undo,
  Redo,
  Eraser,
  Palette,
  Highlighter,
  Video,
  ShoppingCart
} from 'lucide-react';

const PRODUCTS_PER_PAGE = 30;

interface Product {
  id: number;
  name: string;
  category_id?: string | null;
  category_name?: string | null;
  description?: string | null;
  image?: string | null;
  video_url?: string | null;
  status: 'Published' | 'Draft';
  rating?: number | null;
  seo_keywords?: string | null;
  seo_description?: string | null;
  position: number;
  is_pinned: boolean | number;
  price?: number | string | null;
  allow_buy_now?: boolean | number | string | null;
}

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

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  active?: boolean;
}

// Custom Premium Filter Dropdown Component
function ModernDropdown({
  value,
  onChange,
  options,
  placeholder = 'Select...'
}: {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string; indent?: boolean }[];
  placeholder?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const selectedOption = options.find(o => o.value === value);
  const filteredOptions = options.filter(o => 
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={wrapperRef} className="modern-dropdown-wrapper relative w-full md:w-56">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="modern-dropdown-trigger w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-5 flex items-center justify-between cursor-pointer hover:bg-white hover:border-orange-500 hover:shadow-lg hover:shadow-orange-500/5 transition-all duration-300 group overflow-hidden"
      >
        <span className="text-sm font-bold text-slate-800 pointer-events-none truncate flex-1 mr-3 tracking-tight">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <div className="text-slate-300 group-hover:text-orange-500 transition-all duration-300 pointer-events-none shrink-0">
          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isOpen && (
        <div className="modern-dropdown-menu absolute top-[calc(100%+8px)] left-0 min-w-full w-max max-w-[400px] bg-white border border-slate-200 rounded-2xl shadow-2xl z-100 flex flex-col max-h-[320px] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-3 border-b border-slate-100 bg-slate-50/50">
            <input 
              type="text" 
              placeholder="Type to filter..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-100 border-none rounded-lg py-2 px-3 text-xs font-bold outline-none focus:ring-2 focus:ring-orange-500/20 transition-all placeholder:text-slate-400"
            />
          </div>
          <div className="overflow-y-auto flex-1 py-1 custom-scrollbar">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(opt => (
                <div 
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer transition-all duration-200 whitespace-nowrap mx-2 my-0.5 rounded-lg ${opt.value === value ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/10' : 'text-slate-500 hover:bg-slate-50 hover:text-orange-600'} ${opt.indent ? 'pl-8' : ''}`}
                >
                  {opt.indent ? `\u2011\u2011 ` : ''}{opt.label}
                </div>
              ))
            ) : (
              <div className="px-5 py-4 text-xs font-bold text-slate-400 text-center uppercase tracking-widest">
                No matches found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {

  const formatAdminImageUrl = (img?: string) => {
    if (!img) return "https://via.placeholder.com/100";
    if (img.startsWith("http") || img.startsWith("data:")) return img;
    return img.startsWith("/") ? (img.startsWith("/uploads/") ? img : "/uploads" + img) : "/uploads/" + img;
  };

  // Products listing
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // State variables for filters and pagination
  const [activePage, setActivePage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isProductsLoading, setIsProductsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal forms & status toast
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | null }>({
    message: '',
    type: null
  });

  // Sidebar controls
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Form Fields State
  const [productId, setProductId] = useState<number | null>(null);
  const [productName, setProductName] = useState('');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [productStatus, setProductStatus] = useState<'Published' | 'Draft'>('Draft');
  const [productRating, setProductRating] = useState(5);
  const [productSeoKeywords, setProductSeoKeywords] = useState('');
  const [productSeoDescription, setProductSeoDescription] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productVideo, setProductVideo] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [productPosition, setProductPosition] = useState(0);
  const [productIsPinned, setProductIsPinned] = useState(0);
  const [allowBuyNow, setAllowBuyNow] = useState(false);
  const [productPrice, setProductPrice] = useState('');

  // Modal editor preview mode
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Image Drag/Drop State variables
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  // Tree Popup selection visibility
  const [isCatPopupOpen, setIsCatPopupOpen] = useState(false);
  const [catSearchQuery, setCatSearchQuery] = useState('');
  const [expandedBranchIds, setExpandedBranchIds] = useState<Record<number, boolean>>({});

  // Deletion Dialog State variables
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: number | null }>({
    isOpen: false,
    id: null
  });

  // Rich Text Editor Dropdown states
  const [isTextColorOpen, setIsTextColorOpen] = useState(false);
  const [isHighlightColorOpen, setIsHighlightColorOpen] = useState(false);
  const [isImageInsertOpen, setIsImageInsertOpen] = useState(false);
  const [editorImageUrlInput, setEditorImageUrlInput] = useState('');

  // Image Resize and Move states
  const [selectedEditorImage, setSelectedEditorImage] = useState<HTMLImageElement | null>(null);
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const [imageRect, setImageRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  // Image Cropper states
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropTargetImgSrc, setCropTargetImgSrc] = useState('');
  const [cropLeft, setCropLeft] = useState(0);
  const [cropRight, setCropRight] = useState(0);
  const [cropTop, setCropTop] = useState(0);
  const [cropBottom, setCropBottom] = useState(0);
  const [isCropMode, setIsCropMode] = useState(false);

  // DOM Refs
  const listRef = useRef<HTMLDivElement>(null);
  const sortableRef = useRef<any>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed') === 'true';
    setIsSidebarCollapsed(saved);
  }, []);

  const toggleSidebar = () => {
    const nextState = !isSidebarCollapsed;
    setIsSidebarCollapsed(nextState);
    localStorage.setItem('sidebarCollapsed', String(nextState));
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: null }), 4000);
  };

  // Load categories from API
  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  // Re-order sorting API
  const saveReorderedPositions = useCallback(async (orders: { id: number; position: number }[]) => {
    try {
      const response = await fetch('/api/products/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orders })
      });

      if (!response.ok) {
        showToast('Sorting failed. Restoring original list.', 'error');
        loadProducts(activePage, { category: categoryFilter, status: statusFilter, search: searchQuery });
      } else {
        showToast('Products layout re-ordered successfully!');
      }
    } catch (e) {
      console.error('Reorder failed', e);
      loadProducts(activePage, { category: categoryFilter, status: statusFilter, search: searchQuery });
      showToast('Network error while reordering.', 'error');
    }
  }, [activePage, categoryFilter, statusFilter, searchQuery]);

  const saveReorderedPositionsRef = useRef(saveReorderedPositions);
  useEffect(() => {
    saveReorderedPositionsRef.current = saveReorderedPositions;
  }, [saveReorderedPositions]);

  // Load Products list API (paged — 30 per page)
  const loadProducts = async (
    pageToFetch = activePage,
    currentFilters = { category: categoryFilter, status: statusFilter, search: searchQuery }
  ) => {
    if (isProductsLoading) return;
    setIsProductsLoading(true);

    try {
      let url = `/api/products?page=${pageToFetch}&limit=${PRODUCTS_PER_PAGE}`;
      if (currentFilters.category !== 'all') url += `&category=${currentFilters.category}`;
      if (currentFilters.status !== 'all') url += `&status=${currentFilters.status}`;
      if (currentFilters.search) url += `&search=${encodeURIComponent(currentFilters.search)}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.products) {
        const uniqueProducts: Product[] = [];
        const seen = new Set<number>();
        data.products.forEach((p: Product) => {
          if (!seen.has(p.id)) {
            seen.add(p.id);
            uniqueProducts.push(p);
          }
        });
        setProducts(uniqueProducts);
        setTotalProducts(data.total || 0);
        setActivePage(data.page || pageToFetch);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      showToast('Failed to load products list.', 'error');
    } finally {
      setIsProductsLoading(false);
    }
  };

  const goToPage = (page: number) => {
    if (page < 1 || page > Math.max(1, Math.ceil(totalProducts / PRODUCTS_PER_PAGE))) return;
    if (page === activePage && products.length > 0) return;
    loadProducts(page);
  };

  // Sync category filter options
  const categoryFilterOptions = React.useMemo(() => {
    const options: { value: string; label: string; indent?: boolean }[] = [
      { value: 'all', label: 'All Categories' }
    ];
    const addedIds = new Set<number>();
    const mainCats = categories.filter(c => !c.parent_ids);

    mainCats.forEach(main => {
      options.push({ value: String(main.id), label: main.name });
      addedIds.add(main.id);
      
      const subs = categories.filter(c => 
        String(c.parent_ids || '').split(',').map(Number).includes(main.id)
      );
      subs.forEach(sub => {
        options.push({ value: String(sub.id), label: sub.name, indent: true });
        addedIds.add(sub.id);
      });
    });

    categories.forEach(cat => {
      if (!addedIds.has(cat.id)) {
        options.push({ value: String(cat.id), label: cat.name });
      }
    });

    return options;
  }, [categories]);

  // Handle filter changes — always restart from page 1
  useEffect(() => {
    loadProducts(1, { category: categoryFilter, status: statusFilter, search: searchQuery });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter, statusFilter, searchQuery]);

  // Initial Load
  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Bind SortableJS
  useEffect(() => {
    const list = listRef.current;
    if (!list || products.length === 0) return;

    if (sortableRef.current) {
      sortableRef.current.destroy();
    }

    sortableRef.current = Sortable.create(list, {
      animation: 150,
      handle: '.drag-handle',
      ghostClass: 'bg-orange-50',
      onEnd: () => {
        const rows = Array.from(list.querySelectorAll('[data-id]'));
        const orders = rows.map((row, index) => ({
          id: parseInt((row as HTMLElement).dataset.id || '0'),
          position: index
        }));

        setProducts(prev => {
          const updated = [...prev];
          orders.forEach(o => {
            const p = updated.find(prod => prod.id === o.id);
            if (p) p.position = o.position;
          });
          return updated.sort((a, b) => a.position - b.position);
        });

        saveReorderedPositionsRef.current(orders);
      }
    });

    return () => {
      if (sortableRef.current) {
        sortableRef.current.destroy();
        sortableRef.current = null;
      }
    };
  }, [products.length]);

  // Modal open handlers
  const handleOpenCreateModal = () => {
    setModalMode('create');
    setProductId(null);
    setProductName('');
    setSelectedCategoryIds([]);
    setProductStatus('Draft');
    setProductRating(5);
    setProductSeoKeywords('');
    setProductSeoDescription('');
    setProductDescription('');
    setProductVideo('');
    setUploadedImages([]);
    setProductPosition(0);
    setProductIsPinned(0);
    setAllowBuyNow(false);
    setProductPrice('');
    setIsPreviewMode(false);
    setCatSearchQuery('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setModalMode('edit');
    setProductId(product.id);
    setProductName(product.name);
    
    const catIds = product.category_id ? product.category_id.split(',').map(Number).filter(Boolean) : [];
    setSelectedCategoryIds(catIds);
    setProductStatus(product.status);
    setProductRating(product.rating || 5);
    setProductSeoKeywords(product.seo_keywords || '');
    setProductSeoDescription(product.seo_description || '');
    setProductDescription(product.description || '');
    setProductVideo(product.video_url || '');
    setProductPosition(product.position || 0);
    setProductIsPinned(product.is_pinned ? 1 : 0);
    const isBuyNow = product.allow_buy_now === 1 || product.allow_buy_now === true || product.allow_buy_now === '1';
    setAllowBuyNow(Boolean(isBuyNow));
    setProductPrice(product.price !== undefined && product.price !== null && product.price !== '' ? String(product.price) : '');
    setIsPreviewMode(false);
    setCatSearchQuery('');

    let parsedImgs: string[] = [];
    try {
      parsedImgs = product.image ? (product.image.startsWith('[') ? JSON.parse(product.image) : [product.image]) : [];
    } catch (e) {
      parsedImgs = product.image ? [product.image] : [];
    }
    setUploadedImages(parsedImgs);
    setIsModalOpen(true);
  };

  // Category Selector Popup helpers
  const mainCategories = categories.filter(c => !c.parent_ids);

  const toggleCategoryBranch = (mainId: number) => {
    setExpandedBranchIds(prev => ({
      ...prev,
      [mainId]: !prev[mainId]
    }));
  };

  const handleCategoryCheckboxChange = (subId: number, parentId: number) => {
    setSelectedCategoryIds(prev => {
      if (prev.includes(subId)) {
        return prev.filter(id => id !== subId);
      }
      // Constraint: Only 1 sub-category checked per main category parent
      const otherSubsOfThisParent = categories
        .filter(c => {
          const pIds = String(c.parent_ids || '').split(',').map(Number);
          return pIds.includes(parentId) && c.id !== subId;
        })
        .map(c => c.id);
      const filtered = prev.filter(id => !otherSubsOfThisParent.includes(id));
      return [...filtered, subId];
    });
  };

  // Get selected category names for trigger preview text
  const selectedCategoriesDisplayString = React.useMemo(() => {
    if (selectedCategoryIds.length === 0) return 'Select categories...';
    const names = categories
      .filter(c => selectedCategoryIds.includes(c.id))
      .map(c => c.name);
    return names.join(', ');
  }, [selectedCategoryIds, categories]);

  // Filter main/sub categories list by popup search box
  const filteredMainCategoriesTree = React.useMemo(() => {
    const q = catSearchQuery.toLowerCase().trim();
    if (!q) return mainCategories;

    return mainCategories.filter(main => {
      const mainName = main.name.toLowerCase();
      const subs = categories.filter(c => 
        String(c.parent_ids || '').split(',').map(Number).includes(main.id)
      );
      const matchesMain = mainName.includes(q);
      const matchesSub = subs.some(sub => sub.name.toLowerCase().includes(q));
      return matchesMain || matchesSub;
    });
  }, [catSearchQuery, mainCategories, categories]);

  // Image upload helpers
  const triggerImageUpload = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.multiple = true;
    fileInput.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) handleFileUpload(files);
    };
    fileInput.click();
  };

  const handleFileUpload = async (files: FileList) => {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      if (files[i].type.startsWith('image/')) {
        formData.append('images', files[i]);
      }
    }

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (data.imageUrls) {
        setUploadedImages(prev => [...prev, ...data.imageUrls]);
        showToast('Images uploaded successfully!');
      }
    } catch (err) {
      console.error('Upload failed:', err);
      showToast('Image upload failed.', 'error');
    }
  };

  const removeImage = (indexToRemove: number) => {
    setUploadedImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Image Drag & Drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null) return;
    const reordered = [...uploadedImages];
    const [movedItem] = reordered.splice(draggedIndex, 1);
    reordered.splice(index, 0, movedItem);
    setUploadedImages(reordered);
    setDraggedIndex(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedIndex === null && e.dataTransfer.types.includes('Files')) {
      setIsDragActive(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (items) {
      const files: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            files.push(file);
          }
        }
      }
      if (files.length > 0) {
        handleFileUpload(files as any);
      }
    }
  };

  // Convert HTML back to Markdown using browser-native DOM tree-walking (100% robust)
  const convertHtmlToMarkdown = (html: string): string => {
    if (!html) return '';
    
    if (typeof document === 'undefined') return html;

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // 1. Convert Images
    doc.querySelectorAll('img').forEach(img => {
      const src = img.getAttribute('src') || '';
      const alt = img.getAttribute('alt') || '';
      const style = img.getAttribute('style') || '';
      const className = img.getAttribute('class') || '';
      
      if (style || className) {
        // If it has resizing/alignment styled properties, preserve it as a clean raw HTML img tag
        img.outerHTML = `||IMG src="${src}" alt="${alt}" style="${style}" class="${className}"||`;
      } else {
        // Standard unstyled image
        img.outerHTML = `![${alt}](${src})`;
      }
    });

    // 2. Convert Links
    doc.querySelectorAll('a').forEach(link => {
      const href = link.getAttribute('href') || '';
      const text = link.innerHTML || '';
      link.outerHTML = `[${text}](${href})`;
    });

    // 3. Convert Headings
    doc.querySelectorAll('h1').forEach(h => { h.outerHTML = `\n# ${h.innerHTML}\n\n`; });
    doc.querySelectorAll('h2').forEach(h => { h.outerHTML = `\n## ${h.innerHTML}\n\n`; });
    doc.querySelectorAll('h3').forEach(h => { h.outerHTML = `\n### ${h.innerHTML}\n\n`; });

    // 4. Convert Lists
    doc.querySelectorAll('ul').forEach(ul => {
      const lis = ul.querySelectorAll('li');
      let mdList = '\n\n';
      lis.forEach(li => {
        mdList += `- ${li.innerHTML}\n`;
      });
      mdList += '\n';
      ul.outerHTML = mdList;
    });

    doc.querySelectorAll('ol').forEach(ol => {
      const lis = ol.querySelectorAll('li');
      let mdList = '\n\n';
      lis.forEach((li, idx) => {
        mdList += `${idx + 1}. ${li.innerHTML}\n`;
      });
      mdList += '\n';
      ol.outerHTML = mdList;
    });

    // 5. Convert Blockquotes
    doc.querySelectorAll('blockquote').forEach(b => {
      b.outerHTML = `\n\n> ${b.innerHTML}\n\n`;
    });

    // 6. Convert Bold
    doc.querySelectorAll('strong, b').forEach(s => {
      s.outerHTML = `**${s.innerHTML}**`;
    });

    // 7. Convert Italic
    doc.querySelectorAll('em, i').forEach(e => {
      e.outerHTML = `*${e.innerHTML}*`;
    });

    // 8. Convert Underline (keep <u> tags)
    doc.querySelectorAll('u').forEach(u => {
      u.outerHTML = `<u>${u.innerHTML}</u>`;
    });

    // 9. Convert inline Code
    doc.querySelectorAll('code').forEach(c => {
      c.outerHTML = `\`${c.innerHTML}\``;
    });

    // Let's get the parsed body HTML
    let md = doc.body.innerHTML;

    // Mask allowed HTML tags (spans, font, styled div/p, <u>)
    md = md.replace(/<span([^>]*)>/gi, '||SPAN$1||').replace(/<\/span>/gi, '||/SPAN||');
    md = md.replace(/<font([^>]*)>/gi, '||FONT$1||').replace(/<\/font>/gi, '||/FONT||');
    md = md.replace(/<u([^>]*)>/gi, '||U$1||').replace(/<\/u>/gi, '||/U||');
    md = md.replace(/<(div|p)([^>]+style=[^>]+|[^>]+align=[^>]+)>/gi, '||$1$2||').replace(/<\/(div|p)>/gi, '||/$1||');

    // Convert standard divs and paragraph elements (without styling) to newlines
    md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
    md = md.replace(/<div[^>]*>(.*?)<\/div>/gi, '$1\n');
    md = md.replace(/<br\s*\/?>/gi, '\n');

    // Strip all remaining HTML tags
    md = md.replace(/<[^>]+>/g, '');

    // Restore allowed HTML tags & preserved custom styled images
    md = md.replace(/\|\|SPAN([^\|]*)\|\|/gi, '<span$1>').replace(/\|\|\/SPAN\|\|/gi, '</span>');
    md = md.replace(/\|\|FONT([^\|]*)\|\|/gi, '<font$1>').replace(/\|\|\/FONT\|\|/gi, '</font>');
    md = md.replace(/\|\|U([^\|]*)\|\|/gi, '<u$1>').replace(/\|\|\/U\|\|/gi, '</u>');
    md = md.replace(/\|\|(div|p)([^\|]*)\|\|/gi, '<$1$2>').replace(/\|\|\/(div|p)\|\|/gi, '</$1>');
    md = md.replace(/\|\|IMG([^\|]*)\|\|/gi, '<img$1 />');

    // Decode HTML entities
    const tempEl = document.createElement('textarea');
    tempEl.innerHTML = md;
    md = tempEl.value;

    // Clean up multiple newlines
    md = md.replace(/\n{3,}/g, '\n\n');

    return md.trim();
  };

  // Selection tracking hooks to prevent formatting tools focus-stealing
  const savedSelectionRangeRef = useRef<Range | null>(null);

  const saveSelection = () => {
    if (typeof window !== 'undefined') {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        savedSelectionRangeRef.current = sel.getRangeAt(0);
      }
    }
  };

  const restoreSelection = () => {
    if (savedSelectionRangeRef.current && typeof window !== 'undefined') {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedSelectionRangeRef.current);
      }
    }
  };

  const handleEditorInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      const markdown = convertHtmlToMarkdown(html);
      setProductDescription(markdown);
    }
  };

  const execEditorCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
      handleEditorInput();
    }
  };

  // Click handler inside the editor to select an image for resizing/alignment
  const handleEditorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'IMG') {
      setSelectedEditorImage(target as HTMLImageElement);
      setUpdateTrigger(prev => prev + 1);
    } else {
      setSelectedEditorImage(null);
    }
  };

  // Drag-to-resize logic for the selected image
  const handleResizeStart = (e: React.MouseEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedEditorImage || !editorRef.current) return;

    const startX = e.clientX;
    const startWidth = selectedEditorImage.clientWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      let newWidth = startWidth;
      
      if (handle.includes('right')) {
        newWidth = startWidth + deltaX;
      } else if (handle.includes('left')) {
        newWidth = startWidth - deltaX;
      }

      // Constrain sizing inside editor container boundaries
      const editorWidth = editorRef.current?.clientWidth || 800;
      if (newWidth < 60) newWidth = 60;
      if (newWidth > editorWidth - 20) newWidth = editorWidth - 20;

      selectedEditorImage.style.width = `${newWidth}px`;
      selectedEditorImage.style.height = 'auto'; // Maintain aspect ratio automatically

      setUpdateTrigger(prev => prev + 1);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      handleEditorInput(); // Save updated HTML configuration
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Alignment options
  const alignEditorImage = (alignment: 'left' | 'center' | 'right' | 'full') => {
    if (!selectedEditorImage) return;
    
    if (alignment === 'left') {
      selectedEditorImage.style.display = 'inline-block';
      selectedEditorImage.style.float = 'left';
      selectedEditorImage.style.margin = '10px 20px 10px 0';
      selectedEditorImage.style.clear = 'none'; // Allow text to flow next to it
    } else if (alignment === 'center') {
      selectedEditorImage.style.display = 'block';
      selectedEditorImage.style.float = 'none';
      selectedEditorImage.style.margin = '20px auto';
      selectedEditorImage.style.clear = 'both';
    } else if (alignment === 'right') {
      selectedEditorImage.style.display = 'inline-block';
      selectedEditorImage.style.float = 'right';
      selectedEditorImage.style.margin = '10px 0 10px 20px';
      selectedEditorImage.style.clear = 'none'; // Allow text to flow next to it
    } else if (alignment === 'full') {
      selectedEditorImage.style.display = 'block';
      selectedEditorImage.style.float = 'none';
      selectedEditorImage.style.width = '100%';
      selectedEditorImage.style.margin = '20px 0';
      selectedEditorImage.style.clear = 'both';
    }

    setUpdateTrigger(prev => prev + 1);
    handleEditorInput();
  };

  // Quick percent size modification
  const resizeEditorImagePercent = (percent: number) => {
    if (!selectedEditorImage) return;
    selectedEditorImage.style.width = `${percent}%`;
    selectedEditorImage.style.height = 'auto';
    
    setUpdateTrigger(prev => prev + 1);
    handleEditorInput();
  };

  // Delete image from editor
  const deleteEditorImage = () => {
    if (!selectedEditorImage) return;
    selectedEditorImage.remove();
    setSelectedEditorImage(null);
    handleEditorInput();
  };

  // Open image crop modal
  const openCropModal = () => {
    if (!selectedEditorImage) return;
    setCropTargetImgSrc(selectedEditorImage.src);
    setCropLeft(0);
    setCropRight(0);
    setCropTop(0);
    setCropBottom(0);
    setCropModalOpen(true);
  };

  // Perform canvas crop
  const applyImageCrop = () => {
    if (!cropTargetImgSrc) return;
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const origW = img.naturalWidth;
      const origH = img.naturalHeight;
      
      const x = (cropLeft / 100) * origW;
      const y = (cropTop / 100) * origH;
      const w = Math.max(10, origW - x - ((cropRight / 100) * origW));
      const h = Math.max(10, origH - y - ((cropBottom / 100) * origH));
      
      canvas.width = w;
      canvas.height = h;
      
      ctx.drawImage(img, x, y, w, h, 0, 0, w, h);
      
      try {
        const croppedDataUrl = canvas.toDataURL('image/png');
        if (selectedEditorImage) {
          selectedEditorImage.src = croppedDataUrl;
          setSelectedEditorImage(null);
          handleEditorInput();
          showToast('Image cropped successfully!');
        }
      } catch (err) {
        console.error('Failed to export canvas:', err);
        showToast('Failed to crop image (CORS / Security limit).', 'error');
      }
      setCropModalOpen(false);
    };
    
    img.onerror = () => {
      showToast('Error loading image for cropping.', 'error');
      setCropModalOpen(false);
    };
    
    img.src = cropTargetImgSrc;
  };

  // Perform interactive in-place canvas crop via mouse drag
  const handleCropDragStart = (e: React.MouseEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedEditorImage || !imageRect) return;

    const startX = e.clientX;
    const startY = e.clientY;
    
    const imgWidth = selectedEditorImage.clientWidth;
    const imgHeight = selectedEditorImage.clientHeight;

    const initialLeft = cropLeft;
    const initialRight = cropRight;
    const initialTop = cropTop;
    const initialBottom = cropBottom;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      let nextLeft = initialLeft;
      let nextRight = initialRight;
      let nextTop = initialTop;
      let nextBottom = initialBottom;

      if (handle === 'bottom-right') {
        nextRight = Math.max(0, Math.min(80, initialRight - (dx / imgWidth) * 100));
        nextBottom = Math.max(0, Math.min(80, initialBottom - (dy / imgHeight) * 100));
      } else if (handle === 'top-left') {
        nextLeft = Math.max(0, Math.min(80, initialLeft + (dx / imgWidth) * 100));
        nextTop = Math.max(0, Math.min(80, initialTop + (dy / imgHeight) * 100));
      } else if (handle === 'top-right') {
        nextRight = Math.max(0, Math.min(80, initialRight - (dx / imgWidth) * 100));
        nextTop = Math.max(0, Math.min(80, initialTop + (dy / imgHeight) * 100));
      } else if (handle === 'bottom-left') {
        nextLeft = Math.max(0, Math.min(80, initialLeft + (dx / imgWidth) * 100));
        nextBottom = Math.max(0, Math.min(80, initialBottom - (dy / imgHeight) * 100));
      }

      setCropLeft(nextLeft);
      setCropRight(nextRight);
      setCropTop(nextTop);
      setCropBottom(nextBottom);

      // Live CSS visual inset clipping
      selectedEditorImage.style.clipPath = `inset(${nextTop}% ${nextRight}% ${nextBottom}% ${nextLeft}%)`;
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Finalize visual mouse crop using canvas
  const saveInPlaceCrop = () => {
    if (!selectedEditorImage) return;

    const img = new Image();
    
    // Only apply CORS anonymous if it is a truly external remote URL
    const src = selectedEditorImage.src;
    if (src.startsWith('http') && !src.includes(window.location.host)) {
      img.crossOrigin = 'anonymous';
    }

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          showToast('Failed to acquire canvas context', 'error');
          return;
        }

        const origW = img.naturalWidth;
        const origH = img.naturalHeight;

        const x = (cropLeft / 100) * origW;
        const y = (cropTop / 100) * origH;
        const w = Math.max(10, origW - x - ((cropRight / 100) * origW));
        const h = Math.max(10, origH - y - ((cropBottom / 100) * origH));

        canvas.width = w;
        canvas.height = h;

        ctx.drawImage(img, x, y, w, h, 0, 0, w, h);

        const croppedDataUrl = canvas.toDataURL('image/png');
        selectedEditorImage.src = croppedDataUrl;
        selectedEditorImage.style.clipPath = 'none';
        
        setSelectedEditorImage(null);
        setIsCropMode(false);
        setCropLeft(0);
        setCropRight(0);
        setCropTop(0);
        setCropBottom(0);
        handleEditorInput();
        showToast('Image cropped successfully!');
      } catch (err) {
        console.error('Failed to crop image on save:', err);
        showToast('Failed to apply crop. Please try downloading/re-uploading the image.', 'error');
      }
    };

    img.onerror = (err) => {
      console.error('Error loading image for cropping:', err);
      // Fallback: If CORS load failed, try without anonymous header
      if (img.crossOrigin === 'anonymous') {
        console.log('Retrying image crop load without crossOrigin...');
        const retryImg = new Image();
        retryImg.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            const origW = retryImg.naturalWidth;
            const origH = retryImg.naturalHeight;
            const x = (cropLeft / 100) * origW;
            const y = (cropTop / 100) * origH;
            const w = Math.max(10, origW - x - ((cropRight / 100) * origW));
            const h = Math.max(10, origH - y - ((cropBottom / 100) * origH));
            canvas.width = w;
            canvas.height = h;
            ctx.drawImage(retryImg, x, y, w, h, 0, 0, w, h);
            const croppedDataUrl = canvas.toDataURL('image/png');
            selectedEditorImage.src = croppedDataUrl;
            selectedEditorImage.style.clipPath = 'none';
            setSelectedEditorImage(null);
            setIsCropMode(false);
            setCropLeft(0);
            setCropRight(0);
            setCropTop(0);
            setCropBottom(0);
            handleEditorInput();
            showToast('Image cropped successfully!');
          } catch (retryErr) {
            console.error('Failed on CORS fallback:', retryErr);
            showToast('Failed to apply crop (CORS restriction).', 'error');
          }
        };
        retryImg.src = src;
      } else {
        showToast('Error loading image for cropping.', 'error');
      }
    };

    img.src = src;
  };

  // Discard visual mouse crop modifications
  const cancelInPlaceCrop = () => {
    if (selectedEditorImage) {
      selectedEditorImage.style.clipPath = 'none';
    }
    setIsCropMode(false);
    setCropLeft(0);
    setCropRight(0);
    setCropTop(0);
    setCropBottom(0);
  };

  // Dynamic layout synchronization triggers
  useEffect(() => {
    if (selectedEditorImage && editorRef.current) {
      const editorRect = editorRef.current.getBoundingClientRect();
      const imgRect = selectedEditorImage.getBoundingClientRect();
      
      setImageRect({
        top: imgRect.top - editorRect.top + editorRef.current.scrollTop,
        left: imgRect.left - editorRect.left + editorRef.current.scrollLeft,
        width: imgRect.width,
        height: imgRect.height
      });
    } else {
      setImageRect(null);
    }
  }, [selectedEditorImage, updateTrigger]);

  // Keep handles aligned when editor scrolls
  useEffect(() => {
    const handleScroll = () => {
      if (selectedEditorImage) {
        setUpdateTrigger(prev => prev + 1);
      }
    };
    
    const editor = editorRef.current;
    if (editor) {
      editor.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (editor) {
        editor.removeEventListener('scroll', handleScroll);
      }
    };
  }, [selectedEditorImage]);

  // Handle window resizing
  useEffect(() => {
    const handleResize = () => {
      setUpdateTrigger(prev => prev + 1);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Dismiss selection on click outside
  useEffect(() => {
    if (!selectedEditorImage) {
      setIsCropMode(false);
      return;
    }

    const handleWindowClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target === selectedEditorImage) return;
      if (target.tagName === 'IMG') return; // Let React handleEditorClick manage new selections
      if (!document.body.contains(target)) return; // Ignore nodes detached by React renders
      if (target.closest('.pointer-events-auto')) return;
      
      setSelectedEditorImage(null);
      setIsCropMode(false);
    };

    window.addEventListener('click', handleWindowClick);
    return () => {
      window.removeEventListener('click', handleWindowClick);
    };
  }, [selectedEditorImage]);

  // Keep editor content in sync when modal opens
  useEffect(() => {
    if (isModalOpen && editorRef.current) {
      editorRef.current.innerHTML = parseMarkdownDescription(productDescription) || '';
    }
  }, [isModalOpen]);

  const parseMarkdownDescription = (text: string) => {
    if (!text) return '';
    return text
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-extrabold text-slate-900 mt-6 mb-3">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-black text-slate-900 mt-8 mb-4 border-b border-slate-100 pb-2">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-4xl font-black text-slate-900 mt-10 mb-6">$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-extrabold text-slate-900">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-slate-600">$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-slate-100 px-1.5 py-0.5 rounded text-sm font-mono text-orange-600">$1</code>')
      // Standard markdown Image Syntax: ![alt](url) -> <img ... />
      .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" style="float: left; display: inline-block; margin: 10px 20px 10px 0; max-width: 100%; height: auto;" class="rounded-xl border border-slate-100 shadow-sm" />')
      .replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" target="_blank" class="text-orange-600 underline font-bold hover:text-orange-700 transition-colors">$1</a>')
      .split('\n\n').map(para => {
        // Unordered lists
        if (para.trim().startsWith('-')) {
          const items = para.split('\n').filter(line => line.trim().startsWith('-'))
            .map(line => {
              const content = line.trim().substring(1).trim();
              return `<li class="mb-2 text-slate-600 leading-relaxed font-medium pl-1">${content}</li>`;
            }).join('');
          return `<ul class="list-disc pl-6 my-6 space-y-1 marker:text-orange-500">${items}</ul>`;
        }
        // Ordered lists
        const firstLine = para.trim();
        const isOrderedList = /^\d+\.\s/.test(firstLine);
        if (isOrderedList) {
          const items = para.split('\n').filter(line => /^\d+\.\s/.test(line.trim()))
            .map(line => {
              const content = line.trim().replace(/^\d+\.\s/, '');
              return `<li class="mb-2 text-slate-600 leading-relaxed font-medium pl-1">${content}</li>`;
            }).join('');
          return `<ol class="list-decimal pl-6 my-6 space-y-1">${items}</ol>`;
        }
        // If it starts with any HTML block-like element, don't wrap it in a <p> tag
        const trimmed = para.trim();
        if (trimmed.startsWith('<h1') || trimmed.startsWith('<h2') || trimmed.startsWith('<h3') || trimmed.startsWith('<ul') || trimmed.startsWith('<ol') || trimmed.startsWith('<div') || trimmed.startsWith('<blockquote') || trimmed.startsWith('<p') || trimmed.startsWith('<img') || trimmed.startsWith('<span') || trimmed.startsWith('<u') || trimmed.startsWith('<font')) {
          return para;
        }
        return `<p class="mb-6 leading-loose text-slate-600 font-medium">${para.replace(/\n/g, '<br>')}</p>`;
      }).join('');
  };

  // Submit Product Creation/Update form
  const handleSaveProductSubmit = async (e: React.FormEvent, keepEditing = false) => {
    if (e) e.preventDefault();
    if (!productName.trim()) return;

    if (allowBuyNow && (!productPrice || isNaN(Number(productPrice)) || Number(productPrice) <= 0)) {
      showToast('Please enter a valid price for the Buy Now option.', 'error');
      return;
    }

    const payload = {
      name: productName,
      category_id: selectedCategoryIds.join(','),
      description: productDescription,
      price: allowBuyNow && productPrice ? parseFloat(productPrice) : null,
      allow_buy_now: allowBuyNow ? 1 : 0,
      image: JSON.stringify(uploadedImages),
      video_url: productVideo || null,
      status: productStatus,
      rating: productRating,
      seo_keywords: productSeoKeywords,
      seo_description: productSeoDescription,
      position: productPosition,
      is_pinned: productIsPinned === 1
    };

    try {
      const url = productId ? `/api/products/${productId}` : '/api/products';
      const method = productId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        showToast(
          productId 
            ? 'Product details updated successfully!' 
            : 'New product listed in catalog successfully!'
        );
        
        loadProducts(productId ? activePage : 1, { category: categoryFilter, status: statusFilter, search: searchQuery });

        if (keepEditing) {
          handleOpenCreateModal();
        } else {
          setIsModalOpen(false);
        }
      } else {
        const error = await response.json();
        showToast(error.error || 'Failed to save product details.', 'error');
      }
    } catch (err) {
      console.error('Error saving product:', err);
      showToast('Network error while saving.', 'error');
    }
  };

  // Toggles the Home Page Pin property
  const handleToggleProductPin = async (product: Product) => {
    const originalStatus = product.is_pinned;
    const nextPinnedStatus = originalStatus ? 0 : 1;

    // Optimistically update
    setProducts(prev => 
      prev.map(p => p.id === product.id ? { ...p, is_pinned: nextPinnedStatus === 1 } : p)
    );

    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...product,
          is_pinned: nextPinnedStatus === 1
        })
      });

      if (response.ok) {
        showToast('Pinned order status synchronized successfully!');
      } else {
        // Revert
        setProducts(prev => 
          prev.map(p => p.id === product.id ? { ...p, is_pinned: originalStatus } : p)
        );
        showToast('Failed to sync pin status.', 'error');
      }
    } catch (error) {
      console.error('Error toggling pin:', error);
      // Revert
      setProducts(prev => 
        prev.map(p => p.id === product.id ? { ...p, is_pinned: originalStatus } : p)
      );
      showToast('Connection error updating pin.', 'error');
    }
  };

  // Delete modal triggers
  const handleOpenDeleteDialog = (id: number) => {
    setDeleteModal({ isOpen: true, id });
  };

  const handleConfirmDelete = async () => {
    if (deleteModal.id === null) return;
    const targetId = deleteModal.id;
    setDeleteModal({ isOpen: false, id: null });

    try {
      const response = await fetch(`/api/products/${targetId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        showToast('Product deleted successfully!');
        loadProducts(products.length === 1 && activePage > 1 ? activePage - 1 : activePage, { category: categoryFilter, status: statusFilter, search: searchQuery });
      } else {
        showToast('Failed to delete product.', 'error');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      showToast('Network error occurred during deletion.', 'error');
    }
  };

  // Sidebar Links Navigation Config
  const sidebarLinks: { overview: SidebarItem[]; management: SidebarItem[] } = {
    overview: [
      { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'Products', href: '/admin/products', icon: Package, active: true },
      { name: 'Categories', href: '/admin/categories', icon: FolderOpen },
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

  // Pagination derived values
  const totalPages = Math.max(1, Math.ceil(totalProducts / PRODUCTS_PER_PAGE));
  const showingFrom = totalProducts === 0 ? 0 : (activePage - 1) * PRODUCTS_PER_PAGE + 1;
  const showingTo = Math.min(activePage * PRODUCTS_PER_PAGE, totalProducts);
  const pageNumbers: (number | 'ellipsis')[] = (() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | 'ellipsis')[] = [1];
    if (activePage > 3) pages.push('ellipsis');
    for (let i = Math.max(2, activePage - 1); i <= Math.min(totalPages - 1, activePage + 1); i++) {
      pages.push(i);
    }
    if (activePage < totalPages - 2) pages.push('ellipsis');
    pages.push(totalPages);
    return pages;
  })();

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans antialiased text-slate-800">
      {/* Sidebar Navigation */}
      <AdminSidebar />

      {/* Main Container Context */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">

        {/* Mobile Header Banner */}
        <header className="md:hidden h-16 bg-white border-b border-slate-200/80 flex items-center justify-center relative px-6 z-30">
          <img src="/logo.png" alt="Color Hut" className="h-7 object-contain" />
          <div className="absolute right-6 w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-sm">
            C
          </div>
        </header>

        {/* Global Toast Alert */}
        {toast.message && (
          <div className={`fixed top-4 right-4 z-99 flex items-center gap-2.5 px-6 py-4 rounded-2xl shadow-xl shadow-slate-900/10 border transition-all duration-300 transform translate-y-0
            ${toast.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'}
          `}>
            {toast.type === 'success' ? (
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 animate-bounce">
                <Check className="w-3.5 h-3.5" />
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0 font-bold text-xs">
                !
              </div>
            )}
            <p className="text-sm font-semibold">{toast.message}</p>
          </div>
        )}

        {/* Main Dashboard Layout Area */}
        <main className="flex-1 overflow-y-auto w-full">
          <div className="p-6 md:p-10 max-w-7xl mx-auto w-full">
            
            {/* Header Title block */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Products</h1>
                <p className="text-slate-500 font-medium">Manage your product catalog.</p>
              </div>
              <button 
                onClick={handleOpenCreateModal}
                className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-slate-900/10 flex items-center gap-2 self-start md:self-auto"
              >
                <Plus className="w-4 h-4" />
                New Product
              </button>
            </div>

            {/* Toolbar: Search + Filters */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 mb-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative w-full md:w-96">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Search className="h-5 w-5" />
                  </div>
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 sm:text-sm font-bold transition-all"
                    placeholder="Search products..."
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <ModernDropdown 
                    value={categoryFilter}
                    onChange={setCategoryFilter}
                    options={categoryFilterOptions}
                    placeholder="All Categories"
                  />
                  <ModernDropdown 
                    value={statusFilter}
                    onChange={setStatusFilter}
                    options={[
                      { value: 'all', label: 'All Status' },
                      { value: 'Published', label: 'Published' },
                      { value: 'Draft', label: 'Draft' }
                    ]}
                    placeholder="All Status"
                  />
                </div>
              </div>
            </div>

            {/* Product List */}
            {products.length === 0 && !isProductsLoading ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs py-16 flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                  <Package className="w-7 h-7 text-slate-400" />
                </div>
                <p className="text-slate-600 font-bold text-sm uppercase tracking-widest">No products found</p>
                <p className="text-slate-400 text-sm mt-1.5">Try adjusting your search or filters.</p>
              </div>
            ) : (
              <div ref={listRef} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {products.map((product, index) => {
                  let parsedImages: string[] = [];
                  try {
                    parsedImages = product.image ? (product.image.startsWith('[') ? JSON.parse(product.image) : [product.image]) : [];
                  } catch (e) {
                    parsedImages = product.image ? [product.image] : [];
                  }
                  let rawImg = parsedImages[0] || '';
                  let mainImage = rawImg;
                  if (rawImg && !rawImg.startsWith('http') && !rawImg.startsWith('data:')) {
                    mainImage = rawImg.startsWith('/') ? (rawImg.startsWith('/uploads/') ? rawImg : '/uploads' + rawImg) : '/uploads/' + rawImg;
                  }
                  if (!mainImage) {
                    mainImage = 'https://via.placeholder.com/300';
                  }

                  return (
                    <div
                      key={`${product.id}-${index}`}
                      data-id={product.id}
                      className="group flex flex-col bg-white border border-slate-200/80 rounded-2xl overflow-hidden hover:border-orange-300/70 hover:shadow-lg hover:shadow-orange-500/5 transition-all"
                    >
                      {/* Image */}
                      <div className="relative">
                        <img
                          src={mainImage}
                          className="w-full aspect-square object-cover bg-slate-50"
                          alt="Product"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300';
                          }}
                        />
                        <div className="drag-handle absolute top-2 left-2 w-7 h-7 bg-white/90 backdrop-blur-sm rounded-lg text-slate-400 hidden sm:flex items-center justify-center cursor-move hover:bg-white hover:text-slate-600 shadow-sm transition-colors">
                          <GripVertical className="w-4 h-4" />
                        </div>
                        <button
                          onClick={() => handleToggleProductPin(product)}
                          className={`absolute top-2 right-2 p-1.5 rounded-lg bg-white/90 backdrop-blur-sm shadow-sm transition-all ${product.is_pinned ? 'text-orange-500' : 'text-slate-300 hover:text-slate-400'}`}
                        >
                          <Pin className="w-4 h-4" fill={product.is_pinned ? 'currentColor' : 'none'} />
                        </button>
                        <span className={`absolute bottom-2 left-2 ${product.status === 'Published' ? 'bg-emerald-500/90 text-white' : 'bg-amber-500/90 text-white'} backdrop-blur-sm font-bold text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-md shadow-sm`}>
                          {product.status}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="flex flex-col flex-1 p-3">
                        <div className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 min-h-[2.5rem]">{product.name}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                          #{product.id.toString().padStart(4, '0')}
                        </div>
                        <div className="flex flex-wrap items-center gap-1 mt-1.5">
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md truncate max-w-full">
                            {product.category_name || 'Uncategorized'}
                          </span>
                          {Boolean((product.allow_buy_now === 1 || product.allow_buy_now === true || product.allow_buy_now === '1') && product.price) && (
                            <span className="text-[10px] font-extrabold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-md">
                              ৳{Number(product.price).toLocaleString()}
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="mt-auto pt-2.5 mt-2.5 border-t border-slate-100 flex items-center justify-between">
                          {product.video_url ? (
                            <a
                              href={product.video_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                            >
                              <Youtube className="w-4 h-4" />
                            </a>
                          ) : (
                            <span className="w-7" />
                          )}
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(product)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-colors focus:outline-none"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenDeleteDialog(product.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors focus:outline-none"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Loading Spinner */}
            {isProductsLoading && (
              <div className="py-10 flex items-center justify-center">
                <svg className="animate-spin h-6 w-6 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 bg-white rounded-2xl border border-slate-200 shadow-xs px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm font-semibold text-slate-500">
                  Showing <span className="text-slate-900 font-bold">{showingFrom}</span>–<span className="text-slate-900 font-bold">{showingTo}</span> of <span className="text-slate-900 font-bold">{totalProducts}</span> products
                </p>
                <div className="flex items-center gap-1.5 flex-wrap justify-center">
                  <button
                    onClick={() => goToPage(activePage - 1)}
                    disabled={activePage === 1}
                    className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {pageNumbers.map((pg, idx) => (
                    pg === 'ellipsis' ? (
                      <span key={`ellipsis-${idx}`} className="w-9 h-9 flex items-center justify-center text-slate-400 font-bold">…</span>
                    ) : (
                      <button
                        key={pg}
                        onClick={() => goToPage(pg)}
                        className={`w-9 h-9 rounded-xl text-sm font-bold transition-colors ${pg === activePage ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 border border-transparent'}`}
                      >
                        {pg}
                      </button>
                    )
                  ))}
                  <button
                    onClick={() => goToPage(activePage + 1)}
                    disabled={activePage === totalPages}
                    className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Product Creation & Editing Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full flex flex-col overflow-hidden max-h-[92vh] shadow-2xl animate-in fade-in zoom-in-95 duration-200">

            {/* Sticky Header */}
            <div className="px-7 py-5 border-b border-slate-100 bg-white flex items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5 text-orange-600" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl font-black text-slate-900 leading-tight">
                    {modalMode === 'edit' ? 'Edit Product' : 'New Product'}
                  </h2>
                  <p className="text-xs text-slate-400 font-medium truncate">
                    {modalMode === 'edit' ? 'Update details, media, pricing and SEO' : 'Fill in the details to publish a new product'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-colors shrink-0"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form 
              onSubmit={(e) => handleSaveProductSubmit(e, false)} 
              onPaste={handlePaste}
              className="flex flex-col flex-1 overflow-hidden min-h-0"
            >
              
              {/* Scrollable Form Content */}
              <div className="flex-1 overflow-y-auto p-7 pt-5 scrollbar-hide">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Section: Basic Information */}
                <div className="md:col-span-2 flex items-center gap-3">
                  <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Basic Information</span>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>

                {/* Product Name */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">
                    Product Name
                  </label>
                  <input 
                    type="text" 
                    required
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-orange-500 focus:bg-white text-slate-800 font-medium"
                  />
                </div>

                {/* Custom Categories Dropdown Selector Tree */}
                <div className="md:col-span-2 relative">
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">
                    Categories
                  </label>

                  {/* Trigger Display */}
                  <div 
                    onClick={() => setIsCatPopupOpen(!isCatPopupOpen)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-5 flex items-center justify-between cursor-pointer hover:bg-white hover:border-orange-500 transition-all group"
                  >
                    <span className={`font-bold select-none ${selectedCategoryIds.length === 0 ? 'text-slate-400' : 'text-slate-700'}`}>
                      {selectedCategoriesDisplayString}
                    </span>
                    <div className="text-slate-300 group-hover:text-orange-500 transition-colors">
                      <ChevronDown className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Popup Tree Dialog container */}
                  {isCatPopupOpen && (
                    <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-4xl p-6 shadow-2xl z-110 animate-in fade-in slide-in-from-top-2 duration-200">
                      
                      {/* Search box inside Tree */}
                      <div className="relative group mb-4">
                        <input 
                          type="text" 
                          placeholder="Search categories..."
                          value={catSearchQuery}
                          onChange={(e) => setCatSearchQuery(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-5 outline-none focus:border-orange-500 focus:bg-white text-slate-800 font-bold transition-all placeholder:text-slate-300 pr-12"
                        />
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-500 transition-colors pointer-events-none">
                          <Search className="w-5 h-5" />
                        </div>
                      </div>

                      {/* Tree hierarchy viewport */}
                      <div className="max-h-64 overflow-y-auto custom-scrollbar pr-2">
                        {filteredMainCategoriesTree.length === 0 ? (
                          <div className="text-center py-6 text-slate-400 font-bold uppercase tracking-widest text-xs">
                            No categories found
                          </div>
                        ) : (
                          filteredMainCategoriesTree.map(main => {
                            const subs = categories.filter(c => 
                              String(c.parent_ids || '').split(',').map(Number).includes(main.id)
                            );
                            const isExpanded = expandedBranchIds[main.id] || catSearchQuery.length > 0;

                            return (
                              <div key={main.id} className="category-main-branch mb-4 last:mb-0">
                                <div 
                                  onClick={() => toggleCategoryBranch(main.id)}
                                  className="flex items-center gap-3 py-2 px-3 hover:bg-slate-100 rounded-xl cursor-pointer group transition-all"
                                >
                                  <div className={`branch-toggle text-slate-400 group-hover:text-orange-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                                    <ChevronLeft className="w-4 h-4 -rotate-180" />
                                  </div>
                                  <span className="font-bold text-slate-700 select-none">
                                    {main.name}
                                  </span>
                                </div>

                                {isExpanded && (
                                  <div className="category-subs ml-11 mt-1 space-y-2 border-l-2 border-slate-100 pl-4">
                                    {subs.map(sub => {
                                      const isChecked = selectedCategoryIds.includes(sub.id);
                                      return (
                                        <label 
                                          key={sub.id} 
                                          onClick={(e) => e.stopPropagation()}
                                          className="flex items-center gap-3 cursor-pointer group"
                                        >
                                          <input 
                                            type="checkbox" 
                                            className="hidden" 
                                            checked={isChecked}
                                            onChange={() => handleCategoryCheckboxChange(sub.id, main.id)}
                                          />
                                          <div className={`custom-checkbox w-5 h-5 border-2 rounded-lg flex items-center justify-center transition-all overflow-hidden ${isChecked ? 'bg-orange-500 border-orange-500' : 'bg-white border-slate-200'}`}>
                                            <Check className={`w-3.5 h-3.5 text-white transition-all duration-200 ${isChecked ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} />
                                          </div>
                                          <span className="font-bold text-slate-600 text-sm group-hover:text-slate-900 transition-colors select-none whitespace-nowrap">
                                            {sub.name}
                                          </span>
                                        </label>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Close done button */}
                      <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                        <button 
                          type="button" 
                          onClick={() => setIsCatPopupOpen(false)}
                          className="px-5 py-2 bg-orange-500 text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-orange-600 transition-colors"
                        >
                          Done
                        </button>
                      </div>

                    </div>
                  )}

                </div>

                {/* Status Options dropdown */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">
                    Status
                  </label>
                  <div className="relative">
                    <select 
                      value={productStatus}
                      onChange={(e) => setProductStatus(e.target.value as 'Published' | 'Draft')}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-4 outline-none focus:border-orange-500 font-bold text-slate-700 appearance-none"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Published">Published</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <ChevronDown className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {/* Rating hidden or set */}
                <input type="hidden" value={productRating} />

                {/* Section: Media */}
                <div className="md:col-span-2 flex items-center gap-3 pt-2">
                  <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Media</span>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>

                {/* Product Images Drag & Drop upload */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">
                    Product Images
                  </label>

                  <div
                    onClick={(e) => {
                      if ((e.target as HTMLElement).closest('.remove-image-btn')) return;
                      triggerImageUpload();
                    }}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleFileDrop}
                    className={`relative border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center gap-4 transition-all cursor-pointer group ${
                      isDragActive
                        ? 'border-orange-500 bg-orange-50/50 scale-[1.01] shadow-md ring-4 ring-orange-500/10'
                        : 'border-slate-200 hover:border-orange-500 hover:bg-orange-50/30'
                    }`}
                  >
                    {uploadedImages.length === 0 ? (
                      <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 mb-4 group-hover:scale-110 transition-transform">
                          <UploadCloud className="w-8 h-8" />
                        </div>
                        <p className="text-slate-900 font-bold">
                          Drag & drop or <span className="text-orange-600 underline">click to upload</span>
                        </p>
                        <p className="text-slate-400 text-sm font-medium">
                          Add multiple PNG, JPG or WEBP (Max 5MB each)
                        </p>
                      </div>
                    ) : (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full"
                      >
                        {uploadedImages.map((url, index) => (
                          <div
                            key={index}
                            draggable
                            onDragStart={() => handleDragStart(index)}
                            onDragOver={handleDragOver}
                            onDrop={() => handleDrop(index)}
                            className={`relative group/item aspect-square rounded-xl overflow-hidden shadow-sm border border-slate-100 cursor-move transition-all duration-200 ${draggedIndex === index ? 'opacity-50 border-2 border-dashed border-orange-500 scale-95' : ''}`}
                          >
                            <img
                              src={formatAdminImageUrl(url)}
                              className="w-full h-full object-cover pointer-events-none"
                              alt="preview"
                            />

                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="remove-image-btn absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-lg opacity-0 group-hover/item:opacity-100 transition-opacity hover:bg-red-700 shadow-lg cursor-pointer"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>

                            <div className="absolute bottom-2 left-2 bg-black/50 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm pointer-events-none">
                              {index + 1}
                            </div>
                          </div>
                        ))}

                        {/* Plus button / Upload card to add more images */}
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerImageUpload();
                          }}
                          className="aspect-square rounded-xl border-2 border-dashed border-slate-200 hover:border-orange-500 hover:bg-orange-50/30 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all group/upload"
                        >
                          <Plus className="w-5 h-5 text-slate-450 group-hover/upload:text-orange-500 group-hover/upload:scale-110 transition-all" />
                          <span className="text-[10px] font-bold text-slate-450 group-hover/upload:text-orange-600 uppercase tracking-wider">
                            Upload
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Optional Video link */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">
                    Video URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={productVideo}
                    onChange={(e) => setProductVideo(e.target.value)}
                    placeholder="https://youtube.com/..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-orange-500 focus:bg-white text-slate-800 font-medium"
                  />
                </div>

                {/* Section: Description */}
                <div className="md:col-span-2 flex items-center gap-3 pt-2">
                  <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Description</span>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>

                {/* Product Description Editor */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">
                    Product Description
                  </label>
                  <div className="bg-slate-100/50 rounded-4xl p-4 border border-slate-200">
                    
                    {/* Google Docs Toolbar formatting */}
                    <div className="flex flex-wrap items-center gap-1.5 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm mb-4 sticky top-0 z-20">
                      
                      {/* Undo / Redo group */}
                      <button 
                        type="button" 
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => execEditorCommand('undo')}
                        className="p-2 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all cursor-pointer"
                        title="Undo"
                      >
                        <Undo className="w-4 h-4" />
                      </button>

                      <button 
                        type="button" 
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => execEditorCommand('redo')}
                        className="p-2 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all cursor-pointer"
                        title="Redo"
                      >
                        <Redo className="w-4 h-4" />
                      </button>

                      <div className="w-px h-6 bg-slate-100 mx-1"></div>

                      {/* Heading Format */}
                      <select 
                        onChange={(e) => execEditorCommand('formatBlock', e.target.value)}
                        defaultValue="<p>"
                        className="p-1.5 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 cursor-pointer"
                        title="Text Style"
                      >
                        <option value="<p>">Normal Text</option>
                        <option value="<h1>">Heading 1</option>
                        <option value="<h2>">Heading 2</option>
                        <option value="<h3>">Heading 3</option>
                        <option value="<blockquote>">Blockquote</option>
                        <option value="<pre>">Code Block</option>
                      </select>

                      {/* Font Size */}
                      <select 
                        onChange={(e) => execEditorCommand('fontSize', e.target.value)}
                        defaultValue="3"
                        className="p-1.5 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 cursor-pointer"
                        title="Font Size"
                      >
                        <option value="1">10px (XS)</option>
                        <option value="2">13px (S)</option>
                        <option value="3">16px (M)</option>
                        <option value="4">18px (L)</option>
                        <option value="5">24px (XL)</option>
                        <option value="6">32px (XXL)</option>
                        <option value="7">48px (Huge)</option>
                      </select>

                      <div className="w-px h-6 bg-slate-100 mx-1"></div>

                      {/* Inline styling group */}
                      <button 
                        type="button" 
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => execEditorCommand('bold')}
                        className="p-2 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all cursor-pointer"
                        title="Bold"
                      >
                        <Bold className="w-4 h-4" />
                      </button>

                      <button 
                        type="button" 
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => execEditorCommand('italic')}
                        className="p-2 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all cursor-pointer"
                        title="Italic"
                      >
                        <Italic className="w-4 h-4" />
                      </button>

                      <button 
                        type="button" 
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => execEditorCommand('underline')}
                        className="p-2 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all cursor-pointer"
                        title="Underline"
                      >
                        <Underline className="w-4 h-4" />
                      </button>

                      <button 
                        type="button" 
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => execEditorCommand('strikeThrough')}
                        className="p-2 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all cursor-pointer"
                        title="Strikethrough"
                      >
                        <Strikethrough className="w-4 h-4" />
                      </button>

                      <div className="w-px h-6 bg-slate-100 mx-1"></div>

                      {/* Text Color Popover */}
                      <div className="relative">
                        <button 
                          type="button" 
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setIsTextColorOpen(!isTextColorOpen);
                            setIsHighlightColorOpen(false);
                            setIsImageInsertOpen(false);
                          }}
                          className="p-2 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                          title="Text Color"
                        >
                          <Palette className="w-4 h-4" />
                          <div className="w-2 h-2 rounded-full bg-slate-900 border border-slate-200"></div>
                        </button>

                        {isTextColorOpen && (
                          <div className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 bg-white border border-slate-200 rounded-2xl p-3 shadow-2xl z-30 grid grid-cols-4 gap-1.5 min-w-[140px] animate-in fade-in zoom-in-95 duration-150">
                            {[
                              { name: 'Default', value: '#334155' },
                              { name: 'Orange', value: '#ea580c' },
                              { name: 'Red', value: '#dc2626' },
                              { name: 'Green', value: '#059669' },
                              { name: 'Blue', value: '#2563eb' },
                              { name: 'Purple', value: '#7c3aed' },
                              { name: 'Gold', value: '#d97706' },
                              { name: 'Pink', value: '#db2777' }
                            ].map((color) => (
                              <button
                                key={color.value}
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => {
                                  execEditorCommand('foreColor', color.value);
                                  setIsTextColorOpen(false);
                                }}
                                className="w-6 h-6 rounded-lg border border-slate-100 shadow-sm transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                                style={{ backgroundColor: color.value }}
                                title={color.name}
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Highlight Color Popover */}
                      <div className="relative">
                        <button 
                          type="button" 
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setIsHighlightColorOpen(!isHighlightColorOpen);
                            setIsTextColorOpen(false);
                            setIsImageInsertOpen(false);
                          }}
                          className="p-2 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                          title="Highlight Color"
                        >
                          <Highlighter className="w-4 h-4" />
                          <div className="w-2 h-2 rounded-full bg-yellow-200 border border-slate-200"></div>
                        </button>

                        {isHighlightColorOpen && (
                          <div className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 bg-white border border-slate-200 rounded-2xl p-3 shadow-2xl z-30 grid grid-cols-4 gap-1.5 min-w-[140px] animate-in fade-in zoom-in-95 duration-150">
                            {[
                              { name: 'None', value: 'transparent' },
                              { name: 'Yellow', value: '#fef08a' },
                              { name: 'Orange', value: '#ffedd5' },
                              { name: 'Green', value: '#dcfce7' },
                              { name: 'Blue', value: '#dbeafe' },
                              { name: 'Purple', value: '#f3e8ff' },
                              { name: 'Pink', value: '#fce7f3' }
                            ].map((color) => (
                              <button
                                key={color.value}
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => {
                                  execEditorCommand('hiliteColor', color.value);
                                  setIsHighlightColorOpen(false);
                                }}
                                className="w-6 h-6 rounded-lg border border-slate-200 shadow-sm transition-transform hover:scale-110 active:scale-95 flex items-center justify-center font-bold text-[10px] text-slate-400 bg-slate-50 cursor-pointer"
                                style={{ backgroundColor: color.value !== 'transparent' ? color.value : undefined }}
                                title={color.name}
                              >
                                {color.value === 'transparent' ? '✕' : ''}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="w-px h-6 bg-slate-100 mx-1"></div>

                      {/* Alignment group */}
                      <button 
                        type="button" 
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => execEditorCommand('justifyLeft')}
                        className="p-2 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all cursor-pointer"
                        title="Align Left"
                      >
                        <AlignLeft className="w-4 h-4" />
                      </button>

                      <button 
                        type="button" 
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => execEditorCommand('justifyCenter')}
                        className="p-2 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all cursor-pointer"
                        title="Align Center"
                      >
                        <AlignCenter className="w-4 h-4" />
                      </button>

                      <button 
                        type="button" 
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => execEditorCommand('justifyRight')}
                        className="p-2 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all cursor-pointer"
                        title="Align Right"
                      >
                        <AlignRight className="w-4 h-4" />
                      </button>

                      <button 
                        type="button" 
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => execEditorCommand('justifyFull')}
                        className="p-2 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all cursor-pointer"
                        title="Justify"
                      >
                        <AlignJustify className="w-4 h-4" />
                      </button>

                      <div className="w-px h-6 bg-slate-100 mx-1"></div>

                      {/* Lists */}
                      <button 
                        type="button" 
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => execEditorCommand('insertUnorderedList')}
                        className="p-2 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all cursor-pointer"
                        title="Bullet List"
                      >
                        <List className="w-4 h-4" />
                      </button>

                      <button 
                        type="button" 
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => execEditorCommand('insertOrderedList')}
                        className="p-2 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all cursor-pointer"
                        title="Numbered List"
                      >
                        <ListOrdered className="w-4 h-4" />
                      </button>

                      <div className="w-px h-6 bg-slate-100 mx-1"></div>

                      {/* Links and Images */}
                      <button 
                        type="button" 
                        onMouseDown={(e) => {
                          e.preventDefault();
                          saveSelection();
                        }}
                        onClick={() => {
                          restoreSelection();
                          const url = prompt('Enter link URL (e.g. https://example.com):');
                          if (url) execEditorCommand('createLink', url);
                        }}
                        className="p-2 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all cursor-pointer"
                        title="Insert Link"
                      >
                        <LinkIcon className="w-4 h-4" />
                      </button>

                      {/* Premium Image Insert dropdown */}
                      <div className="relative">
                        <button 
                          type="button" 
                          onMouseDown={(e) => {
                            e.preventDefault();
                            saveSelection();
                          }}
                          onClick={() => {
                            setIsImageInsertOpen(!isImageInsertOpen);
                            setIsTextColorOpen(false);
                            setIsHighlightColorOpen(false);
                          }}
                          className="p-2 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all cursor-pointer"
                          title="Insert Image"
                        >
                          <ImageIcon className="w-4 h-4" />
                        </button>

                        {isImageInsertOpen && (
                          <div className="absolute top-[calc(100%+8px)] right-0 bg-white border border-slate-200 rounded-2xl p-4 shadow-2xl z-30 min-w-[280px] w-max max-w-[340px] flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-150">
                            
                            {/* Insert from Product Images */}
                            {uploadedImages.length > 0 && (
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                                  Click to insert product image
                                </p>
                                <div className="grid grid-cols-4 gap-2 max-h-[140px] overflow-y-auto custom-scrollbar p-1 bg-slate-50 rounded-xl border border-slate-100">
                                  {uploadedImages.map((url, index) => (
                                    <button
                                      key={index}
                                      type="button"
                                      onMouseDown={(e) => e.preventDefault()}
                                      onClick={() => {
                                        restoreSelection();
                                        const imgHtml = `<img src="${formatAdminImageUrl(url)}" alt="Product Image" style="float: left; display: inline-block; margin: 10px 20px 10px 0; max-width: 100%; height: auto;" class="rounded-xl border border-slate-100 shadow-sm" />`;
                                        execEditorCommand('insertHTML', imgHtml);
                                        setIsImageInsertOpen(false);
                                      }}
                                      className="aspect-square rounded-lg overflow-hidden border border-slate-200 hover:border-orange-500 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                                    >
                                      <img src={formatAdminImageUrl(url)} className="w-full h-full object-cover" alt="product" />
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Insert from URL input */}
                            <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-100">
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                Insert Image from URL
                              </p>
                              <div className="flex gap-2">
                                <input 
                                  type="url" 
                                  placeholder="https://example.com/image.png"
                                  value={editorImageUrlInput}
                                  onChange={(e) => setEditorImageUrlInput(e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-medium outline-none focus:border-orange-500 focus:bg-white text-slate-800"
                                />
                                <button
                                  type="button"
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={() => {
                                    if (editorImageUrlInput.trim()) {
                                      restoreSelection();
                                      const imgHtml = `<img src="${editorImageUrlInput.trim()}" alt="External Image" style="float: left; display: inline-block; margin: 10px 20px 10px 0; max-width: 100%; height: auto;" class="rounded-xl border border-slate-100 shadow-sm" />`;
                                      execEditorCommand('insertHTML', imgHtml);
                                      setEditorImageUrlInput('');
                                      setIsImageInsertOpen(false);
                                    }
                                  }}
                                  className="px-3 bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-orange-600 transition-colors cursor-pointer"
                                >
                                  Add
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="w-px h-6 bg-slate-100 mx-1"></div>

                      {/* Clear Formatting / Erase */}
                      <button 
                        type="button" 
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => execEditorCommand('removeFormat')}
                        className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                        title="Clear Formatting"
                      >
                        <Eraser className="w-4 h-4" />
                      </button>

                    </div>

                    {/* Google Doc Document style page sheet */}
                    <div className="relative max-w-[800px] mx-auto bg-white rounded-md shadow-inner border border-slate-200/60 overflow-visible group/doc">
                      <div 
                        ref={editorRef}
                        contentEditable
                        onInput={handleEditorInput}
                        onBlur={handleEditorInput}
                        onClick={handleEditorClick}
                        data-placeholder="Start crafting your premium product story..."
                        className="w-full min-h-[400px] p-[5px] outline-none resize-none text-slate-700 text-lg leading-relaxed scrollbar-hide bg-transparent selection:bg-orange-100 selection:text-orange-900 font-sans markdown-preview animate-in fade-in duration-300"
                      />

                      {/* Image Resize and Interaction Overlay */}
                      {selectedEditorImage && imageRect && (
                        <div 
                          className={`absolute pointer-events-none z-10 border-2 border-dashed ${isCropMode ? 'border-green-500' : 'border-orange-500'}`}
                          style={{
                            top: `${imageRect.top + (cropTop / 100) * imageRect.height}px`,
                            left: `${imageRect.left + (cropLeft / 100) * imageRect.width}px`,
                            width: `${imageRect.width * (1 - cropLeft / 100 - cropRight / 100)}px`,
                            height: `${imageRect.height * (1 - cropTop / 100 - cropBottom / 100)}px`,
                          }}
                        >
                          {/* Corner Resize / Crop Handles */}
                          {[
                            { name: 'top-left', cursor: 'nwse-resize', class: 'top-0 left-0 -translate-x-1/2 -translate-y-1/2' },
                            { name: 'top-right', cursor: 'nesw-resize', class: 'top-0 right-0 translate-x-1/2 -translate-y-1/2' },
                            { name: 'bottom-left', cursor: 'nesw-resize', class: 'bottom-0 left-0 -translate-x-1/2 translate-y-1/2' },
                            { name: 'bottom-right', cursor: 'nwse-resize', class: 'bottom-0 right-0 translate-x-1/2 translate-y-1/2' }
                          ].map((handle) => (
                            <div
                              key={handle.name}
                              onMouseDown={(e) => isCropMode ? handleCropDragStart(e, handle.name) : handleResizeStart(e, handle.name)}
                              className={`absolute w-3.5 h-3.5 border-2 shadow-md pointer-events-auto active:scale-125 transition-all ${
                                isCropMode ? 'bg-green-500 border-green-100 rounded-sm' : 'bg-orange-500 border-white rounded-full'
                              } ${handle.class}`}
                              style={{ cursor: handle.cursor }}
                            />
                          ))}

                          {/* Floating Image Mini-Toolbar */}
                          <div 
                            className="absolute bottom-[calc(100%+12px)] left-1/2 -translate-x-1/2 bg-slate-900 text-white rounded-xl shadow-2xl p-1.5 flex items-center gap-1.5 pointer-events-auto border border-slate-800 animate-in fade-in slide-in-from-bottom-2 duration-150"
                            onMouseDown={(e) => e.preventDefault()}
                          >
                            {/* Alignment Options */}
                            <button
                              type="button"
                              onClick={() => alignEditorImage('left')}
                              className={`p-1.5 hover:bg-slate-800 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                                selectedEditorImage.style.float === 'left' ? 'text-orange-500 bg-slate-850' : 'text-slate-300'
                              }`}
                              title="Align Left"
                            >
                              <AlignLeft className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => alignEditorImage('center')}
                              className={`p-1.5 hover:bg-slate-800 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                                selectedEditorImage.style.display === 'block' && selectedEditorImage.style.float === 'none' ? 'text-orange-500 bg-slate-850' : 'text-slate-300'
                              }`}
                              title="Align Center"
                            >
                              <AlignCenter className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => alignEditorImage('right')}
                              className={`p-1.5 hover:bg-slate-800 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                                selectedEditorImage.style.float === 'right' ? 'text-orange-500 bg-slate-850' : 'text-slate-300'
                              }`}
                              title="Align Right"
                            >
                              <AlignRight className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => alignEditorImage('full')}
                              className="p-1.5 hover:bg-slate-800 rounded-lg text-xs font-bold transition-all flex items-center gap-1 text-slate-300"
                              title="Full Width"
                            >
                              <AlignJustify className="w-3.5 h-3.5" />
                            </button>

                            <div className="w-px h-4 bg-slate-800 mx-1"></div>

                            {/* Quick Percent Sizes */}
                            {[25, 50, 75, 100].map((size) => (
                              <button
                                key={size}
                                type="button"
                                onClick={() => resizeEditorImagePercent(size)}
                                className="px-1.5 py-1 hover:bg-slate-800 rounded-md text-[10px] font-black text-slate-300 hover:text-white transition-all"
                              >
                                {size}%
                              </button>
                            ))}

                            <div className="w-px h-4 bg-slate-800 mx-1"></div>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={deleteEditorImage}
                              className="p-1.5 hover:bg-red-950 text-red-450 hover:text-red-300 rounded-lg transition-all"
                              title="Delete Image"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                            <div className="w-px h-4 bg-slate-800 mx-1"></div>

                            {/* Crop */}
                            {!isCropMode ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setIsCropMode(true);
                                  setCropLeft(0);
                                  setCropRight(0);
                                  setCropTop(0);
                                  setCropBottom(0);
                                }}
                                className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-orange-500 rounded-lg transition-all flex items-center justify-center gap-1.5"
                                title="Crop Image"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6.13 1L6 16a2 2 0 002 2h15m-3-7v12a2 2 0 01-2 2H1m5-13V1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                <span className="text-[10px] font-black uppercase tracking-wider">Crop</span>
                              </button>
                            ) : (
                              <div className="flex items-center gap-1 bg-slate-950/80 p-0.5 rounded-lg border border-slate-800">
                                {/* Save Crop */}
                                <button
                                  type="button"
                                  onMouseDown={(e) => { e.stopPropagation(); saveInPlaceCrop(); }}
                                  className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 shadow-md cursor-pointer"
                                  title="Save Crop Changes"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                  Save
                                </button>
                                {/* Cancel Crop */}
                                <button
                                  type="button"
                                  onMouseDown={(e) => { e.stopPropagation(); cancelInPlaceCrop(); }}
                                  className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 shadow-md cursor-pointer"
                                  title="Cancel Crop"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                  Cancel
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="absolute bottom-4 right-6 pointer-events-none transition-opacity opacity-0 group-hover/doc:opacity-100">
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                          Document Editor v1.0
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section: Pricing & Checkout */}
                <div className="md:col-span-2 flex items-center gap-3 pt-2">
                  <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Pricing & Checkout</span>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>

                {/* Direct Checkout & Buy Now Option */}
                <div className="md:col-span-2 bg-gradient-to-br from-orange-50/70 via-amber-50/40 to-white p-5 rounded-2xl border border-orange-200/80 shadow-xs">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center shadow-md shadow-orange-500/25">
                        <ShoppingCart className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          Direct Checkout & "Buy Now" Button
                          {allowBuyNow && (
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                              Active
                            </span>
                          )}
                        </h4>
                        <p className="text-xs text-slate-500">Allow customers to buy this product directly on website with instant checkout</p>
                      </div>
                    </div>
                    
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input 
                        type="checkbox" 
                        checked={allowBuyNow}
                        onChange={(e) => setAllowBuyNow(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                    </label>
                  </div>

                  {allowBuyNow && (
                    <div className="mt-4 pt-4 border-t border-orange-200/60">
                      <div className="max-w-md">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">
                          Product Price (BDT ৳) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base">৳</span>
                          <input 
                            type="number" 
                            min="0"
                            step="0.01"
                            required={allowBuyNow}
                            value={productPrice}
                            onChange={(e) => setProductPrice(e.target.value)}
                            placeholder="e.g. 1190"
                            className="w-full bg-white border border-orange-300 rounded-xl py-2.5 pl-8 pr-4 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-slate-900 font-black text-base shadow-xs"
                          />
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1.5 font-medium">
                          The product details page will display this price and a "Buy Now" button next to WhatsApp inquiry.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Section: SEO & Meta */}
                <div className="md:col-span-2 flex items-center gap-3 pt-2">
                  <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">SEO & Meta</span>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>

                {/* SEO Keywords Input */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">
                    SEO Keywords (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={productSeoKeywords}
                    onChange={(e) => setProductSeoKeywords(e.target.value)}
                    placeholder="e.g. premium, design, studio, minimalist"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-orange-500 focus:bg-white text-slate-800 font-medium placeholder:text-slate-400"
                  />
                </div>

                {/* SEO Description Meta Input */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-1">
                    SEO Description (Meta Description)
                  </label>
                  <textarea
                    value={productSeoDescription}
                    onChange={(e) => setProductSeoDescription(e.target.value)}
                    placeholder="A brief summary for Google search results..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-orange-500 focus:bg-white text-slate-800 font-medium placeholder:text-slate-400 resize-none h-24"
                  />
                </div>

              </div>
            </div>
            
            {/* Sticky Footer Action Buttons */}
            <div className="px-7 py-5 border-t border-slate-100 bg-white shrink-0">
              <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>

                {modalMode === 'create' && (
                  <button
                    type="button"
                    onClick={(e) => handleSaveProductSubmit(e, true)}
                    className="px-5 py-2.5 rounded-xl border border-orange-200 bg-orange-50 text-orange-700 text-sm font-bold hover:bg-orange-100 transition-colors"
                  >
                    Save & Add New
                  </button>
                )}

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-orange-600 text-white text-sm font-bold hover:bg-orange-700 shadow-md shadow-orange-500/20 transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Product
                </button>
              </div>
            </div>

            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal Dialog */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-4xl max-w-md w-full p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-black text-slate-900 mb-4">Delete Product?</h2>
            <p className="text-slate-600 mb-6 font-medium">
              This action cannot be undone. This product will be permanently removed from your catalog.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteModal({ isOpen: false, id: null })}
                className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmDelete}
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