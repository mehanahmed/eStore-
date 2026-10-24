'use client';

import React, { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';

// === ICONS ===
const SearchIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
);

const HeartIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
);

const CartIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
);

const MenuIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
);

const UserIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
);

const GridIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"></rect>
        <rect x="14" y="3" width="7" height="7"></rect>
        <rect x="14" y="14" width="7" height="7"></rect>
        <rect x="3" y="14" width="7" height="7"></rect>
    </svg>
);

const ChevronDown = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
    <svg className={className} style={style} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
);

const ChevronRight = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
    <svg className={className} style={style} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
);

const ArrowLeft = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
);

const FolderIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
);

const CloseIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

const PlayCircleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polygon points="10 8 16 12 10 16 10 8"></polygon>
    </svg>
);

const FlameIcon = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="text-rose-500">
        <path d="M12 23c-4.97 0-9-3.8-9-8.5 0-3.1 1.63-5.77 3.5-7.5.34-.31.87-.2 1.05.23.47 1.11 1.25 2.11 2.2 2.77.3.21.71.02.76-.34.33-2.3 1.6-4.5 3.32-6.07.36-.33.93-.16 1.05.3 1.05 4.02 5.12 6.07 5.12 10.61 0 4.7-4.03 8.5-8 8.5z"/>
    </svg>
);

// === SUB NAV (hardcoded) ===
const SUB_NAV = [
    { label: 'All Products', href: '/all/', icon: 'grid' as const },
    { label: 'Hot Deal', href: '/hot-deals/', icon: null },
    { label: 'Restaurant', href: '/restaurant/', icon: null },
    { label: 'Parlour', href: '/parlour/', icon: null },
    { label: 'Interior', href: '/interior/', icon: null },
    { label: 'Exterior', href: '/exterior/', icon: null },
    { label: 'Management', href: '/management/', icon: null },
    { label: 'Demo', href: '/demo/', icon: 'play' as const },
    { label: 'Track Order', href: '/track/', icon: null },
];

// ===  PROPS ===
interface HomeNavbarProps {
    categories: any[];
    allProducts: any[];
    searchQuery: string;
    onSearchChange: (q: string) => void;
    mobileSheetOpen: boolean;
    onMobileSheetOpen: () => void;
    onMobileSheetClose: () => void;
}

export default function HomeNavbar({
    categories,
    allProducts,
    searchQuery,
    onSearchChange,
    mobileSheetOpen,
    onMobileSheetOpen,
    onMobileSheetClose,
}: HomeNavbarProps) {
    const pathname = usePathname();
    const [searchFocused, setSearchFocused] = useState(false);
    const [catMenuOpen, setCatMenuOpen] = useState(false);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [hoveredCatId, setHoveredCatId] = useState<number | null>(null);
    const [expandedCatId, setExpandedCatId] = useState<number | null>(null);
    const [activeSheetCatId, setActiveSheetCatId] = useState<number | null>(null);

    const catMenuRef = useRef<HTMLDivElement>(null);
    const searchBarRef = useRef<HTMLDivElement>(null);
    const subNavRef = useRef<HTMLDivElement>(null);

    // Close menus on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (catMenuRef.current && !catMenuRef.current.contains(event.target as Node)) {
                setCatMenuOpen(false);
            }
            if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
                setSearchFocused(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Horizontal scroll subnav with mouse wheel
    useEffect(() => {
        const sn = subNavRef.current;
        const onWheel = (e: WheelEvent) => {
            if (sn && Math.abs(e.deltaY) > 0) {
                e.preventDefault();
                sn.scrollLeft += e.deltaY;
            }
        };
        if (sn) sn.addEventListener('wheel', onWheel, { passive: false });
        return () => { if (sn) sn.removeEventListener('wheel', onWheel); };
    }, []);

    // Search suggestions
    useEffect(() => {
        if (!searchQuery.trim()) { setSuggestions([]); return; }
        const query = searchQuery.toLowerCase().trim();
        const matches: any[] = [];
        categories.forEach(cat => {
            if (cat.name.toLowerCase().includes(query))
                matches.push({ type: 'category', id: cat.id, name: cat.name, slug: cat.slug });
        });
        allProducts.forEach(p => {
            if (p.name.toLowerCase().includes(query))
                matches.push({ type: 'product', id: p.id, name: p.name, slug: p.slug });
        });
        setSuggestions(matches.slice(0, 8));
    }, [searchQuery, categories, allProducts]);

    return (
        <>
            {/* --- HEADER --- */}
            <header className={`store-header ${searchFocused ? 'is-searching' : ''}`}>
                <div className="store-header-top-row">
                    {/* Mobile Menu Icon */}
                    <button className="store-icon-btn mobile-only" onClick={onMobileSheetOpen}>
                        <MenuIcon />
                    </button>

                    <a href="/" className="store-logo">
                        <img src="/logo.png" alt="Color Hut" width={140} height={44} style={{ objectFit: 'contain' }} />
                    </a>

                    {/* Desktop Categories Mega Menu */}
                    <div className="store-categories-container desktop-only" ref={catMenuRef}>
                        <button className="store-categories-btn" onClick={() => setCatMenuOpen(!catMenuOpen)}>
                            <MenuIcon />
                            Categories
                        </button>
                        {catMenuOpen && (
                            <div className="store-cat-mega-wrapper">
                                <div className="mega-menu-content">
                                    {/* Left Column: Categories List */}
                                    <div className="mega-menu-list">
                                        {categories
                                            .filter(cat => !cat.parent_id && !cat.parent_ids)
                                            .map(cat => {
                                                const hasChildren = categories.some(child => {
                                                    const childParents = String(child.parent_ids || child.parent_id || '').split(',').map(id => id.trim());
                                                    return childParents.includes(String(cat.id));
                                                });
                                                const isHovered = hoveredCatId === cat.id || (!hoveredCatId && categories.filter(c => !c.parent_id && !c.parent_ids)[0].id === cat.id);

                                                return (
                                                    <div key={cat.id} className="mega-menu-item-group">
                                                        <a
                                                            href={`/${cat.id}/${cat.slug}/`}
                                                            className={`mega-menu-list-item ${isHovered ? 'is-active' : ''}`}
                                                            onMouseEnter={() => setHoveredCatId(cat.id)}
                                                            onClick={(e) => {
                                                                if (window.innerWidth <= 900 && hasChildren) {
                                                                    e.preventDefault();
                                                                    setExpandedCatId(expandedCatId === cat.id ? null : cat.id);
                                                                } else {
                                                                    setCatMenuOpen(false);
                                                                }
                                                            }}
                                                        >
                                                            <div className="mega-item-label">
                                                                <span className="mega-icon-box"><FolderIcon /></span>
                                                                {cat.name}
                                                            </div>
                                                            <ChevronDown
                                                                className="mega-chevron-right"
                                                                style={{
                                                                    transform: expandedCatId === cat.id ? 'rotate(0deg)' : 'rotate(-90deg)',
                                                                    transition: 'transform 0.3s ease'
                                                                }}
                                                            />
                                                        </a>
                                                        {expandedCatId === cat.id && hasChildren && (
                                                            <div className="mega-mobile-accordion shadow-sm">
                                                                {categories
                                                                    .filter(child => {
                                                                        const childParents = String(child.parent_ids || child.parent_id || '').split(',').map(id => id.trim());
                                                                        return childParents.includes(String(cat.id));
                                                                    })
                                                                    .map(sub => (
                                                                        <a
                                                                            key={sub.id}
                                                                            href={`/${sub.id}/${sub.slug}/`}
                                                                            className="mega-mobile-sublink"
                                                                            onClick={() => setCatMenuOpen(false)}
                                                                        >
                                                                            {sub.name}
                                                                        </a>
                                                                    ))
                                                                }
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                    </div>

                                    {/* Right Column: Sub-Categories Sidepane */}
                                    <div className="mega-menu-sidepane">
                                        <div className="mega-sidepane-header">
                                            <h3>{categories.find(c => c.id === (hoveredCatId || categories.filter(cat => !cat.parent_id && !cat.parent_ids)[0]?.id))?.name}</h3>
                                            <a href={`/${hoveredCatId || categories.filter(cat => !cat.parent_id && !cat.parent_ids)[0]?.id}/${categories.find(c => c.id === (hoveredCatId || categories.filter(cat => !cat.parent_id && !cat.parent_ids)[0]?.id))?.slug}/`} className="see-all-link">See all</a>
                                        </div>
                                        <div className="mega-sidepane-grid">
                                            {categories
                                                .filter(child => {
                                                    const parentId = hoveredCatId || categories.filter(cat => !cat.parent_id && !cat.parent_ids)[0]?.id;
                                                    const childParents = String(child.parent_ids || child.parent_id || '').split(',').map(id => id.trim());
                                                    return childParents.includes(String(parentId));
                                                })
                                                .map(sub => {
                                                    const catImg = sub.icon || allProducts.find((p: any) => Number(p.category_id) === Number(sub.id))?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(sub.name)}&background=f8f9fa&color=F1641E&size=200`;
                                                    return (
                                                        <a
                                                            key={sub.id}
                                                            href={`/${sub.id}/${sub.slug}/`}
                                                            className="mega-grid-card"
                                                            onClick={() => setCatMenuOpen(false)}
                                                        >
                                                            <div className="mega-card-image">
                                                                <img src={catImg} alt={sub.name} />
                                                            </div>
                                                            <span className="mega-card-title">{sub.name}</span>
                                                        </a>
                                                    );
                                                })
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Search Bar */}
                    <div className="store-search-bar" ref={searchBarRef}>
                        <input
                            type="text"
                            className="store-search-input"
                            placeholder="Search for anything"
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            onFocus={() => setSearchFocused(true)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    const queryVal = searchQuery.trim();
                                    window.history.pushState(null, '', queryVal ? `/?q=${encodeURIComponent(queryVal)}` : '/');
                                    setSearchFocused(false);
                                }
                            }}
                        />
                        <button
                            className="store-search-submit"
                            onClick={() => {
                                const queryVal = searchQuery.trim();
                                window.history.pushState(null, '', queryVal ? `/?q=${encodeURIComponent(queryVal)}` : '/');
                                setSearchFocused(false);
                            }}
                        >
                            <SearchIcon />
                        </button>

                        {searchFocused && suggestions.length > 0 && (
                            <div className="store-search-suggestions">
                                {suggestions.map((item) => (
                                    <a
                                        key={`${item.type}-${item.id}`}
                                        href={item.type === 'category' ? `/${item.id}/${item.slug}/` : `/p/${item.id}/${item.slug}/`}
                                        className="store-suggestion-item"
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            window.location.href = item.type === 'category' ? `/${item.id}/${item.slug}/` : `/p/${item.id}/${item.slug}/`;
                                        }}
                                    >
                                        <div className="store-suggestion-icon">
                                            {item.type === 'category' ? <MenuIcon /> : <SearchIcon />}
                                        </div>
                                        <div className="store-suggestion-text">{item.name}</div>
                                        <div className="store-suggestion-type">{item.type}</div>
                                    </a>
                                ))}
                            </div>
                        )}
                        <button className="store-search-cancel" onClick={(e) => { e.preventDefault(); setSearchFocused(false); }}>
                            Cancel
                        </button>
                    </div>

                    {/* Header Actions */}
                    <div className="store-header-nav">
                        <a href="/login" className="store-icon-btn" title="Account" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', color: 'inherit' }}>
                            <UserIcon />
                        </a>
                        <button className="store-icon-btn desktop-only" title="Favorites"><HeartIcon /></button>
                        <button className="store-icon-btn mobile-only" title="All Categories" onClick={onMobileSheetOpen}>
                            <GridIcon />
                        </button>
                        <button className="store-icon-btn desktop-only" title="Cart"><CartIcon /></button>
                    </div>
                </div>

                {/* --- SUBNAV (hardcoded) --- */}
                <nav className="store-subnav" ref={subNavRef as any}>
                    {SUB_NAV.map((item) => {
                        const isActive = item.href === '/hot-deals/'
                            ? (pathname === '/hot-deals' || pathname === '/hot-deals/' || pathname === '/hot-deal' || pathname === '/hot-deal/' || pathname === '/product' || pathname === '/product/' || pathname === '/products' || pathname === '/products/')
                            : (pathname === item.href || pathname?.startsWith(item.href.replace(/\/$/, '')));
                        return (
                            <a
                                key={item.href}
                                href={item.href}
                                className={`store-subnav-item${isActive ? ' is-active' : ''}`}
                            >
                                {item.icon === 'grid' && <GridIcon />}
                                {item.icon === 'play' && <PlayCircleIcon />}
                                {item.icon === 'flame' && <FlameIcon />}
                                {item.label}
                            </a>
                        );
                    })}
                </nav>
            </header>

            {/* --- MOBILE FULL PAGE SHEET (Drill-down Style) --- */}
            <div className={`store-mobile-overlay ${mobileSheetOpen ? 'active' : ''}`} onClick={onMobileSheetClose}></div>
            <div className={`store-mobile-sheet ${mobileSheetOpen ? 'is-open' : ''} ${activeSheetCatId ? 'mobile-sheet-detail-view' : ''}`}>
                <div className="mobile-sheet-header">
                    {activeSheetCatId ? (
                        <button className="mobile-sheet-back" onClick={() => setActiveSheetCatId(null)}>
                            <ArrowLeft />
                        </button>
                    ) : (
                        <div className="mobile-sheet-spacer"></div>
                    )}

                    <h3 className="mobile-sheet-title">
                        {activeSheetCatId
                            ? categories.find(c => c.id === activeSheetCatId)?.name
                            : 'Browse Categories'}
                    </h3>

                    <button className="mobile-sheet-close" onClick={onMobileSheetClose}>
                        <CloseIcon />
                    </button>
                </div>

                <div className="mobile-sheet-body">
                    {!activeSheetCatId ? (
                        /* TOP LEVEL LIST */
                        <div className="mobile-sheet-list">
                            {categories
                                .filter(cat => !cat.parent_id && !cat.parent_ids)
                                .map(cat => {
                                    const hasSub = categories.some(child => {
                                        const childParents = String(child.parent_ids || child.parent_id || '').split(',').map(id => id.trim());
                                        return childParents.includes(String(cat.id));
                                    });
                                    return (
                                        <div
                                            key={cat.id}
                                            className="mobile-sheet-row"
                                            onClick={() => {
                                                if (hasSub) {
                                                    setActiveSheetCatId(cat.id);
                                                } else {
                                                    onMobileSheetClose();
                                                    window.location.href = `/${cat.id}/${cat.slug}/`;
                                                }
                                            }}
                                        >
                                            <span>{cat.name}</span>
                                            {hasSub && <ChevronRight className="row-chevron" />}
                                        </div>
                                    );
                                })
                            }
                        </div>
                    ) : (
                        /* DETAIL LEVEL LIST */
                        <div className="mobile-sheet-detail">
                            <a
                                href={`/${activeSheetCatId}/${categories.find(c => c.id === activeSheetCatId)?.slug}/`}
                                className="mobile-sheet-view-all"
                                onClick={onMobileSheetClose}
                            >
                                View all
                            </a>
                            <div className="mobile-sheet-list">
                                {categories
                                    .filter(child => {
                                        const childParents = String(child.parent_ids || child.parent_id || '').split(',').map(id => id.trim());
                                        return childParents.includes(String(activeSheetCatId));
                                    })
                                    .map(sub => (
                                        <a
                                            key={sub.id}
                                            href={`/${sub.id}/${sub.slug}/`}
                                            className="mobile-sheet-row sub-row"
                                            onClick={onMobileSheetClose}
                                        >
                                            {sub.name}
                                        </a>
                                    ))
                                }
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
