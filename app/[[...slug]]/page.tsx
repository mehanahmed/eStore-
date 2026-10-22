'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import HeroSlider from '../HeroSlider';
import HomeNavbar from '../HomeNavbar';

// === ICONS ===
const YouTubeIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
);

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

const PlayIcon = () => (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: '2px' }}><path d="M5 3l14 9-14 9V3z" /></svg>
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

const CalendarIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
);

const RestaurantIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8V2M15 2h6M13 14h8V8h-8zM3 2v20a5 5 0 0 1 5-5h13a2 2 0 1 0 0-4H8a2 2 0 1 1 0-4h13a2 2 0 1 0 0-4H8a2 2 0 1 1 0-4h13" />
    </svg>
);

const FolderIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
);

const TagIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
);

const CloseIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

const WhatsAppIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.396.015 12.03c0 2.12.541 4.189 1.57 6.007L0 24l6.135-1.61a11.803 11.803 0 005.911 1.6h.005c6.634 0 12.032-5.396 12.035-12.03a11.85 11.85 0 00-3.536-8.261" />
    </svg>
);

const MailIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
    </svg>
);

const CheckIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);

const PlaneIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13"></line>
        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg>
);

// === TYPES ===
interface Product {
    id: number;
    name: string;
    slug: string;
    price: string | number;
    image: string;
    video_url?: string;
    category_id?: number | string;
    category_name?: string;
    description?: string;
    rating?: string | number;
    is_pinned?: boolean | number;
    position?: number;
}

interface Category {
    id: number;
    name: string;
    slug: string;
    parent_ids?: string;
    parent_id?: string;
    position?: number;
}

const ProductSkeleton = () => (
    <div className="store-card">
        <div className="store-image-box skeleton"></div>
        <div className="store-card-info">
            <div className="skeleton skeleton-title" style={{ width: '70%', height: '16px' }}></div>
            <div className="skeleton skeleton-text" style={{ width: '40%', height: '12px' }}></div>
        </div>
    </div>
);

const ProductCard = React.forwardRef<HTMLAnchorElement, { p: Product, idx: number, getCategoryStyles: any, categories: Category[], currentCategory?: Category | null }>(({ p, idx, getCategoryStyles, categories, currentCategory }, ref) => {
    const [hovered, setHovered] = useState(false);
    const [imgIndex, setImgIndex] = useState(0);
    const videoRef = React.useRef<HTMLVideoElement>(null);

    let images: string[] = [];
    try {
        if (p.image?.startsWith('[')) {
            images = JSON.parse(p.image);
        } else if (p.image) {
            images = [p.image];
        }
    } catch (e) {
        images = p.image ? [p.image] : [];
    }

    const hasPlay = !!p.video_url;
    const hasMultipleImages = images.length > 1;

    // Parse category_id to check for multiple categories
    const categoryIds = String(p.category_id || '').split(',').map(id => id.trim()).filter(Boolean);
    const hasMultipleCategories = categoryIds.length > 1;

    // Determine what to display based on context
    let displayNames: string[] = [];

    if (currentCategory) {
        // On a category page - show sub-category names
        categoryIds.forEach(catId => {
            const cat = categories.find(c => String(c.id) === catId);
            if (cat) {
                // Only show if this category belongs to current category context
                const parentIds = String(cat.parent_ids || '').split(',').map(id => id.trim());
                if (String(cat.id) === String(currentCategory.id) || parentIds.includes(String(currentCategory.id))) {
                    displayNames.push(cat.name);
                }
            }
        });
    } else {
        // On homepage - show main category names for multi-category products
        if (hasMultipleCategories && categories.length > 0) {
            categoryIds.forEach(catId => {
                const cat = categories.find(c => String(c.id) === catId);
                if (cat) {
                    // Check if this is a main category (no parent_ids)
                    if (!cat.parent_ids) {
                        displayNames.push(cat.name);
                    } else {
                        // If it's a sub-category, find its main parent
                        const parentIds = String(cat.parent_ids).split(',').map(id => id.trim());
                        const mainParent = categories.find(c => parentIds.includes(String(c.id)) && !c.parent_ids);
                        if (mainParent && !displayNames.includes(mainParent.name)) {
                            displayNames.push(mainParent.name);
                        }
                    }
                }
            });
        }
    }

    const catName = p.category_name || 'Handmade';
    const catStyle = getCategoryStyles(catName);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (!hasPlay && hasMultipleImages && !hovered) {
            interval = setInterval(() => {
                setImgIndex((prev) => (prev + 1) % images.length);
            }, 2500); // Auto-slide every 2.5s
        }
        return () => clearInterval(interval);
    }, [hasPlay, hasMultipleImages, images.length, hovered]);

    const handleMouseEnter = () => {
        if (typeof window !== 'undefined' && window.innerWidth <= 900) return;
        setHovered(true);
        if (videoRef.current) {
            videoRef.current.play().catch(() => { });
        }
    };

    const handleMouseLeave = () => {
        setHovered(false);
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
        }
    };

    let currentImgUrl = images[imgIndex] || '';
    if (currentImgUrl && !currentImgUrl.startsWith('http') && !currentImgUrl.startsWith('/')) {
        currentImgUrl = '/uploads/' + currentImgUrl;
    }
    if (currentImgUrl.includes('/opt-') && !currentImgUrl.includes('/uploads/') && !currentImgUrl.includes('/api/')) {
        currentImgUrl = '/uploads' + currentImgUrl;
    }

    return (
        <a
            ref={ref}
            key={p.id}
            href={`/p/${p.id}/${p.slug}`}
            className="store-card"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            aria-label={`View details for ${p.name}`}
        >
            <div className="store-image-box">
                <AnimatePresence initial={false} mode="popLayout">
                    <motion.img
                        key={imgIndex}
                        src={currentImgUrl}
                        alt={p.name}
                        loading={idx < 6 ? "eager" : "lazy"}
                        fetchPriority={idx < 6 ? "high" : "auto"}
                        width={400}
                        height={320}
                        initial={{ opacity: 0, scale: 1.1, x: 20, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, scale: 1, x: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, scale: 0.95, x: -20, filter: 'blur(2px)' }}
                        transition={{
                            duration: 0.7,
                            ease: [0.16, 1, 0.3, 1] // Custom cubic-bezier for a snappy yet smooth finish
                        }}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            opacity: hovered && hasPlay ? 0 : 1
                        }}
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=f0f0f0&color=333&size=400`;
                        }}
                    />
                </AnimatePresence>
                {hasPlay && (
                    <video
                        ref={videoRef}
                        src={p.video_url}
                        className="store-video-hover"
                        muted
                        playsInline
                        loop
                        style={{ opacity: hovered ? 1 : 0 }}
                    />
                )}
                <button className="store-fav-btn" aria-label="Add to Favorites" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                    <HeartIcon />
                </button>
                {hasPlay && !hovered && (
                    <div className="store-play-overlay">
                        <PlayIcon />
                    </div>
                )}
            </div>
            <div className="store-card-info">
                <div className="store-title-row">
                    <h3 className="store-prod-title">{p.name}</h3>
                    <div className="store-prod-rating">
                        <span style={{ fontWeight: 700 }}>{idx % 2 === 0 ? '5.0' : '4.8'}</span>
                        <span style={{ margin: '0 1px' }}>★</span>
                        <span style={{ color: '#595959' }}>({((idx + 1) * 342) % 3000})</span>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginTop: '4px' }}>
                    {displayNames.length > 0 ? (
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {displayNames.map((name, i) => {
                                const style = getCategoryStyles(name);
                                return (
                                    <div key={i} className="store-category-badge" style={{ backgroundColor: style.bg, color: style.text, fontSize: '9px', padding: '3px 8px' }}>
                                        {name}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="store-category-badge" style={{ backgroundColor: catStyle.bg, color: catStyle.text }}>
                            {catName}
                        </div>
                    )}

                    {Boolean(p.price && Number(p.price) > 0) && (
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'baseline',
                            fontWeight: 900,
                            color: '#0f172a',
                            fontSize: '13.5px',
                            letterSpacing: '-0.02em',
                            background: '#fff7ed',
                            border: '1px solid #fed7aa',
                            padding: '2px 7px',
                            borderRadius: '6px',
                            whiteSpace: 'nowrap'
                        }}>
                            <span style={{ color: '#ea580c', fontSize: '12px', marginRight: '1.5px', fontWeight: 900 }}>৳</span>
                            <span>{Number(p.price).toLocaleString()}</span>
                        </div>
                    )}
                </div>
            </div>
        </a>
    );
});

ProductCard.displayName = 'ProductCard';

const ProductCarousel = ({
    products,
    categories,
    getCategoryStyles,
    currentCategory
}: {
    products: Product[];
    categories: Category[];
    getCategoryStyles: any;
    currentCategory?: Category | null;
}) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showLeftBtn, setShowLeftBtn] = useState(false);
    const [showRightBtn, setShowRightBtn] = useState(true);

    const updateButtonVisibility = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setShowLeftBtn(scrollLeft > 5);
            setShowRightBtn(scrollLeft + clientWidth < scrollWidth - 5);
        }
    };

    useEffect(() => {
        const el = scrollRef.current;
        if (el) {
            el.addEventListener('scroll', updateButtonVisibility);
            updateButtonVisibility();
            window.addEventListener('resize', updateButtonVisibility);
        }
        return () => {
            if (el) el.removeEventListener('scroll', updateButtonVisibility);
            window.removeEventListener('resize', updateButtonVisibility);
        };
    }, [products]);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollTo = direction === 'left'
                ? scrollLeft - clientWidth * 0.85
                : scrollLeft + clientWidth * 0.85;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    return (
        <div style={{ position: 'relative', width: '100%' }}>
            {showLeftBtn && (
                <button
                    onClick={() => scroll('left')}
                    className="carousel-control-btn"
                    style={{
                        position: 'absolute',
                        left: '-22px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        zIndex: 10,
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '50%',
                        width: '44px',
                        height: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
                        cursor: 'pointer',
                        color: '#1a1a1a',
                        transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-50%) scale(1.05)';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                        e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 0, 0, 0.1)';
                    }}
                    aria-label="Previous Products"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </button>
            )}

            <div
                ref={scrollRef}
                style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                }}
                className="hide-scrollbar carousel-container"
            >
                {products.map((p, idx) => (
                    <div
                        key={p.id}
                        className="carousel-item"
                    >
                        <ProductCard
                            p={p}
                            idx={idx}
                            getCategoryStyles={getCategoryStyles}
                            categories={categories}
                            currentCategory={currentCategory}
                        />
                    </div>
                ))}
            </div>

            {showRightBtn && (
                <button
                    onClick={() => scroll('right')}
                    className="carousel-control-btn"
                    style={{
                        position: 'absolute',
                        right: '-22px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        zIndex: 10,
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '50%',
                        width: '44px',
                        height: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
                        cursor: 'pointer',
                        color: '#1a1a1a',
                        transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-50%) scale(1.05)';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                        e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 0, 0, 0.1)';
                    }}
                    aria-label="Next Products"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </button>
            )}
        </div>
    );
};
const ModernSelect = ({
    name,
    value,
    options,
    placeholder,
    onChange,
    disabled = false
}: {
    name: string;
    value: string;
    options: { label: string; value: string }[];
    placeholder: string;
    onChange: (name: string, value: string) => void;
    disabled?: boolean;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggle = () => {
        if (!disabled) setIsOpen(!isOpen);
    };

    const handleSelect = (val: string) => {
        onChange(name, val);
        setIsOpen(false);
    };

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div className="modern-select-container" ref={containerRef}>
            <div
                className={`modern-select-trigger ${isOpen ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
                onClick={handleToggle}
            >
                <span className={!selectedOption ? 'placeholder-text' : ''}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown className="modern-select-chevron" />
            </div>

            {isOpen && (
                <div className="modern-select-dropdown">
                    {options.map((opt) => (
                        <div
                            key={opt.value}
                            className={`modern-select-option ${value === opt.value ? 'selected' : ''}`}
                            onClick={() => handleSelect(opt.value)}
                        >
                            {opt.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

ProductCard.displayName = 'ProductCard';


const MeetingRequestPopup = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    const [formData, setFormData] = useState({
        businessType: '',
        fullName: '',
        designation: '',
        whatsappNumber: '',
        address: '',
        menuType: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        // Check if user has already submitted successfully or already seen the popup
        try {
            const hasSubmitted = localStorage.getItem('request_submitted');
            const hasSeen = localStorage.getItem('meeting_popup_shown');
            if (hasSubmitted || hasSeen) {
                onClose();
            } else {
                localStorage.setItem('meeting_popup_shown', 'true');
            }
        } catch (e) {}
    }, [isOpen, onClose]);

    const handleClose = () => {
        try {
            localStorage.setItem('meeting_popup_shown', 'true');
        } catch (e) {}
        onClose();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'businessType') {
            setFormData(prev => ({ ...prev, [name]: value, designation: '' }));
        } else if (name === 'whatsappNumber') {
            const filteredValue = value.replace(/[^+0-9]/g, '');
            setFormData(prev => ({ ...prev, [name]: filteredValue }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleOptionChange = (name: string, value: string) => {
        if (name === 'businessType') {
            setFormData(prev => ({ ...prev, [name]: value, designation: '' }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.businessType) {
            alert('Please select a Business Type first.');
            return;
        }
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/public/meeting-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                localStorage.setItem('request_submitted', 'true');
                localStorage.setItem('meeting_popup_shown', 'true');
                window.location.href = '/thank-you/';
            } else {
                alert('Failed to submit request. Please try again.');
            }
        } catch (err) {
            console.error('Submission error:', err);
            alert('Something went wrong. Please try again later.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={`meeting-popup-overlay ${isOpen ? 'active' : ''}`} onClick={(e) => e.target === e.currentTarget && handleClose()}>
            <div className="meeting-popup-content">
                <button className="meeting-popup-close" onClick={handleClose}>
                    <CloseIcon />
                </button>

                <div className="meeting-popup-header">
                    <div className="meeting-popup-header-icon">
                        <MailIcon />
                    </div>
                    <div className="meeting-popup-header-text">
                        <h3>Make an Meeting Call</h3>
                        <p>Discuss your vision with our experts.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="meeting-popup-form">
                    <div className="form-group">
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            placeholder="Enter your full name"
                            className="form-control"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <input
                            type="tel"
                            name="whatsappNumber"
                            value={formData.whatsappNumber}
                            onChange={handleChange}
                            placeholder="Enter WhatsApp Number"
                            className="form-control"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="Enter business address"
                            className="form-control"
                            rows={2}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <ModernSelect
                                name="businessType"
                                value={formData.businessType}
                                placeholder="Select business type"
                                options={[
                                    { label: 'Restaurant', value: 'restaurant' },
                                    { label: 'Parlor', value: 'parlor' }
                                ]}
                                onChange={handleOptionChange}
                            />
                        </div>

                        {formData.businessType && (
                            <div className="form-group">
                                <ModernSelect
                                    name="designation"
                                    value={formData.designation}
                                    placeholder="Select designation"
                                    options={
                                        formData.businessType === 'parlor'
                                            ? [
                                                { label: 'Owner', value: 'Owner' },
                                                { label: 'Staff', value: 'Staff' },
                                                { label: 'Management', value: 'Management' },
                                                { label: 'Official', value: 'Official' }
                                            ]
                                            : formData.businessType === 'restaurant'
                                                ? [
                                                    { label: 'Owner', value: 'Owner' },
                                                    { label: 'Chef', value: 'Chef' },
                                                    { label: 'Manager', value: 'Manager' },
                                                    { label: 'Management', value: 'Management' },
                                                    { label: 'Official', value: 'Official' }
                                                ]
                                                : []
                                    }
                                    onChange={handleOptionChange}
                                />
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Menu Type</label>
                        <div className="form-options-grid">
                            <button
                                type="button"
                                className={`form-option ${formData.menuType === 'new' ? 'active' : ''}`}
                                onClick={() => handleOptionChange('menuType', 'new')}
                            >
                                New Menu
                            </button>
                            <button
                                type="button"
                                className={`form-option ${formData.menuType === 'update' ? 'active' : ''}`}
                                onClick={() => handleOptionChange('menuType', 'update')}
                            >
                                Update Menu
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="meeting-popup-submit" disabled={isSubmitting || !formData.businessType}>
                        {isSubmitting ? 'Submitting...' : 'Request Meeting Call'}
                    </button>
                </form>
            </div>
        </div>
    );
};

const ImagePopup = ({ isOpen, onClose, onAction }: { isOpen: boolean, onClose: () => void, onAction?: () => void }) => {
    return (
        <div className={`image-popup-overlay ${isOpen ? 'active' : ''}`} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="image-popup-content">
                <button className="image-popup-close" onClick={onClose} aria-label="Close popup">
                    <CloseIcon />
                </button>
                <div className="image-popup-body">
                    <img
                        src="/popup.jpg"
                        alt="Special Design Solutions"
                        className="popup-banner-img"
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                            onClose();
                            onAction?.();
                        }}
                    />
                    {/* Text content removed per user request */}
                </div>
            </div>
        </div>
    );
};

const MeetingFormSection = ({ initialBusinessType, onStartFilling }: { initialBusinessType?: string, onStartFilling?: () => void }) => {
    const [formData, setFormData] = useState({
        businessType: initialBusinessType || '',
        fullName: '',
        designation: '',
        whatsappNumber: '',
        address: '',
        menuType: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'businessType') {
            setFormData(prev => ({ ...prev, [name]: value, designation: '' }));
        } else if (name === 'whatsappNumber') {
            const filteredValue = value.replace(/[^+0-9]/g, '');
            setFormData(prev => ({ ...prev, [name]: filteredValue }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleOptionChange = (name: string, value: string) => {
        if (name === 'businessType') {
            setFormData(prev => ({ ...prev, [name]: value, designation: '' }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.businessType) {
            alert('Please select a Business Type first.');
            return;
        }
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/public/meeting-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                localStorage.setItem('request_submitted', 'true');
                localStorage.setItem('meeting_popup_shown', 'true');
                window.location.href = '/thank-you/';
            } else {
                alert('Failed to submit request. Please try again.');
            }
        } catch (err) {
            console.error('Submission error:', err);
            alert('Something went wrong. Please try again later.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="store-meeting-section" id="meeting-call">
            <div className="store-meeting-container">
                <div className="store-meeting-info">
                    <h2 className="serif">Make a Meeting Call</h2>
                    <p>Discuss your vision with our experts. Whether it's a new menu design or a complete branding overhaul, we're here to help you stand out.</p>
                </div>

                <div className="store-meeting-form-card">
                    <form onSubmit={handleSubmit} className="meeting-inline-form">
                        <div className="meeting-form-grid">
                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    onFocus={onStartFilling}
                                    placeholder="e.g: Abdul Awal"
                                    className="form-control"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>WhatsApp Number</label>
                                <input
                                    type="tel"
                                    name="whatsappNumber"
                                    value={formData.whatsappNumber}
                                    onChange={handleChange}
                                    onFocus={onStartFilling}
                                    placeholder="Enter WhatsApp Number"
                                    className="form-control"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Menu Type</label>
                                <div className="form-options-grid">
                                    <button
                                        type="button"
                                        className={`form-option ${formData.menuType === 'new' ? 'active' : ''}`}
                                        onClick={() => { handleOptionChange('menuType', 'new'); onStartFilling?.(); }}
                                    >
                                        New Menu
                                    </button>
                                    <button
                                        type="button"
                                        className={`form-option ${formData.menuType === 'update' ? 'active' : ''}`}
                                        onClick={() => { handleOptionChange('menuType', 'update'); onStartFilling?.(); }}
                                    >
                                        Update Menu
                                    </button>
                                </div>
                            </div>
                        </div>
                        <button type="submit" className="meeting-submit-btn" style={{ marginTop: '32px' }} disabled={isSubmitting || !formData.businessType}>
                            {isSubmitting ? 'Submitting...' : 'Request Meeting Call'}
                            <PlaneIcon />
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
};

const Footer = ({ socialLinks }: { socialLinks: { facebook: string; instagram: string; youtube: string; pinterest: string } }) => {
    return (
        <footer className="store-footer">
            <div className="store-footer-content">
                <div className="store-footer-grid">
                    <div className="store-footer-col">
                        <h3>Shop</h3>
                        <ul className="store-footer-links">
                            <li><a href="#">Gift cards</a></li>
                            <li><a href="#">Sitemap</a></li>
                            <li><a href="#">Registry</a></li>
                        </ul>
                    </div>
                    <div className="store-footer-col">
                        <h3>Sell</h3>
                        <ul className="store-footer-links">
                            <li><a href="#">Sell on Color Hut</a></li>
                            <li><a href="#">Teams</a></li>
                            <li><a href="#">Forums</a></li>
                            <li><a href="#">Affiliates & Creators</a></li>
                        </ul>
                    </div>
                    <div className="store-footer-col">
                        <h3>About</h3>
                        <ul className="store-footer-links">
                            <li><a href="#">Color Hut, Inc.</a></li>
                            <li><a href="#">Policies</a></li>
                            <li><a href="#">Investors</a></li>
                            <li><a href="#">Careers</a></li>
                            <li><a href="#">Impact</a></li>
                        </ul>
                    </div>
                    <div className="store-footer-col">
                        <h3>Help</h3>
                        <ul className="store-footer-links">
                            <li><a href="#">Help Center</a></li>
                            <li><a href="#">Privacy settings</a></li>
                            <li><a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer">Studio Gallery</a></li>
                        </ul>
                        <div className="store-footer-socials" style={{ marginTop: '24px' }}>
                            <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="store-social-btn"><FacebookIcon /></a>
                            <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="store-social-btn"><InstagramIcon /></a>
                            <a href={socialLinks.pinterest} target="_blank" rel="noopener noreferrer" className="store-social-btn"><PinterestIcon /></a>
                            <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="store-social-btn"><FooterYouTubeIcon /></a>
                        </div>
                    </div>
                </div>

                <div className="store-footer-bottom">
                    <div className="store-footer-settings">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <GlobeIcon />
                            <span>Bangladesh | English (US) | BDT</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
                        <ul className="store-footer-legal">
                            <li>© 2026 Color Hut BD, Inc.</li>
                            <li><a href="#">Terms of Use</a></li>
                            <li><a href="#">Privacy</a></li>
                            <li><a href="#">Interest-based ads</a></li>
                            <li><a href="#">Local Shops</a></li>
                            <li><a href="#">Regions</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        </footer>
    );
};

const InstagramIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
);

const FacebookIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
);

const FooterYouTubeIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.11 1 12 1 12s0 3.89.46 5.58a2.78 2.78 0 0 0 1.94 2c1.72.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.89 23 12 23 12s0-3.89-.46-5.58z"></path><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"></polygon></svg>
);

const PinterestIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.2 0 1.033.394 2.137.884 2.738.097.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.252 7.929-7.252 4.163 0 7.398 2.967 7.398 6.92 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592 0 11.985 0" /></svg>
);

const GlobeIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
);

export default function HomePage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [socialLinks, setSocialLinks] = useState({
        facebook: 'https://facebook.com/colorhutbd',
        instagram: 'https://www.instagram.com/colorhutbd',
        youtube: 'https://www.youtube.com/@colorhut_official',
        pinterest: '#'
    });

    useEffect(() => {
        const fetchSocial = async () => {
            try {
                const res = await fetch('/api/public/config');
                if (res.ok) {
                    const data = await res.json();
                    setSocialLinks({
                        facebook: data.social_facebook || 'https://facebook.com/colorhutbd',
                        instagram: data.social_instagram || 'https://www.instagram.com/colorhutbd',
                        youtube: data.social_youtube || 'https://www.youtube.com/@colorhut_official',
                        pinterest: data.social_pinterest || '#'
                    });
                }
            } catch (e) {}
        };
        fetchSocial();
    }, []);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchFocused, setSearchFocused] = useState(false); // kept for is-searching class on header
    const [catMenuOpen, setCatMenuOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [fetchingLimit] = useState(12);
    const pathname = usePathname();
    const [searchQuery, setSearchQuery] = useState('');

    // Load search query from URL on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const q = params.get('q');
            if (q) {
                setSearchQuery(q);
            }
        }
    }, []);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [expandedCatId, setExpandedCatId] = useState<number | null>(null);
    const [hoveredCatId, setHoveredCatId] = useState<number | null>(null);
    const [allProducts, setAllProducts] = useState<any[]>([]); // For global search suggestions
    const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
    const [activeSheetCatId, setActiveSheetCatId] = useState<number | null>(null);
    const [meetingPopupOpen, setMeetingPopupOpen] = useState(false);
    const [imagePopupOpen, setImagePopupOpen] = useState(false);
    const [isFillingForm, setIsFillingForm] = useState(false);
    const [isAutoScrolling, setIsAutoScrolling] = useState(false);
    const [isMeetingHidden, setIsMeetingHidden] = useState(false);

    // Check for active campaign meeting visibility override
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const checkOverride = () => {
                const override = localStorage.getItem('meeting_override');
                const expires = localStorage.getItem('meeting_override_expires');
                if (override && expires) {
                    if (expires !== '0' && Date.now() > Number(expires)) {
                        localStorage.removeItem('meeting_override');
                        localStorage.removeItem('meeting_override_expires');
                    } else if (override === 'hide') {
                        setIsMeetingHidden(true);
                    }
                }
            };
            checkOverride();
            window.addEventListener('meeting_override_updated', checkOverride);
            return () => window.removeEventListener('meeting_override_updated', checkOverride);
        }
    }, []);

    const currentPath = pathname || '/';
    const isBaseHome = currentPath === '/';
    const slug = currentPath.split('/').filter(Boolean).pop();

    const subNavRef = useRef<HTMLDivElement>(null);


    const observer = useRef<IntersectionObserver | null>(null);
    const lastProductElementRef = useCallback((node: HTMLElement | null) => {
        if (loading || isAutoScrolling) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore, isAutoScrolling]);

    useEffect(() => {
        if (mobileSheetOpen || meetingPopupOpen || imagePopupOpen) {
            document.body.classList.add('no-scroll');
        } else {
            document.body.classList.remove('no-scroll');
        }
        return () => document.body.classList.remove('no-scroll');
    }, [mobileSheetOpen, meetingPopupOpen, imagePopupOpen]);

    useEffect(() => {
        try {
            const hasSubmitted = localStorage.getItem('request_submitted');
            const hasSeen = localStorage.getItem('meeting_popup_shown');
            if (hasSubmitted || hasSeen || isFillingForm || isMeetingHidden) return;

            const excludedSlugs = ['restaurant', 'parlor', 'parlour'];
            const isExcludedPage = slug && excludedSlugs.includes(slug.toLowerCase());
            const isRelevantPage = isBaseHome || (!isExcludedPage && slug !== 'all' && categories.some(c => c.slug === slug));

            if (isRelevantPage) {
                const timer = setTimeout(() => {
                    const stillSubmitted = localStorage.getItem('request_submitted');
                    const stillSeen = localStorage.getItem('meeting_popup_shown');
                    if (!stillSubmitted && !stillSeen && !isMeetingHidden) {
                        setMeetingPopupOpen(true);
                        localStorage.setItem('meeting_popup_shown', 'true');
                    }
                }, 5000);
                return () => clearTimeout(timer);
            } else if (isExcludedPage) {
                const timer = setTimeout(() => {
                    if (!localStorage.getItem('request_submitted')) {
                        setImagePopupOpen(true);
                    }
                }, 10000);
                return () => clearTimeout(timer);
            }
        } catch (e) {}
    }, [slug, isBaseHome, categories.length, isFillingForm, isMeetingHidden]);

    const handlePopupClose = (type: 'meeting' | 'image') => {
        if (type === 'meeting') {
            setMeetingPopupOpen(false);
            try {
                localStorage.setItem('meeting_popup_shown', 'true');
            } catch (e) {}
        } else {
            setImagePopupOpen(false);
        }
    };


    

    // Robust category finding
    const currentCategory = categories.find(c =>
        c.slug?.toLowerCase().trim() === slug?.toLowerCase().trim()
    );

    const subCategories = currentCategory
        ? categories.filter(cat => {
            const parents = String(cat.parent_ids || cat.parent_id || '').split(',').map(id => id.trim());
            return parents.includes(String(currentCategory.id));
        })
        : [];

    const mainCategories = categories.filter(cat => !cat.parent_id && (!cat.parent_ids || String(cat.parent_ids).trim() === ''));

    const catMenuRef = useRef<HTMLDivElement>(null);
    const searchBarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (catMenuRef.current && !catMenuRef.current.contains(event.target as Node)) {
                setCatMenuOpen(false);
            }
            if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
                setSearchFocused(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        async function loadCategories() {
            try {
                const res = await fetch('/api/public/categories');
                const data = await res.json();
                if (Array.isArray(data)) setCategories(data);
            } catch (e) { }
        }
        loadCategories();
    }, []);

    // Load all products for site-wide search suggestions
    useEffect(() => {
        async function loadAllProducts() {
            try {
                // Fetch a large limit or a specific search-metadata endpoint if available
                const res = await fetch('/api/public/products?limit=1000');
                const data = await res.json();
                if (Array.isArray(data)) {
                    setAllProducts(data);
                }
            } catch (e) {
                console.error('Error loading search metadata:', e);
            }
        }
        loadAllProducts();
    }, []);

    const navKey = `${slug || 'home'}-${currentCategory?.id || 'all'}`;

    useEffect(() => {
        // Reset products when navigation key changes
        setProducts([]);
        setPage(1);
        setHasMore(true);
    }, [navKey]);

    useEffect(() => {
        // Essential guard: wait for categories if we're on a sub-path
        if (!isBaseHome && categories.length === 0) return;

        async function loadProducts() {
            setLoading(true);
            try {
                const limit = slug === 'all' ? 1000 : fetchingLimit;
                let url = `/api/public/products?page=${page}&limit=${limit}`;
                if (isBaseHome) url += `&pinned=true`;

                if (currentCategory) {
                    url += `&categoryId=${currentCategory.id}`;
                } else if (!isBaseHome && slug && slug !== 'all') {
                    // This is not a category page but also not the home page.
                    // If we strictly follow the user's request, we shouldn't show all products.
                    setProducts([]);
                    setHasMore(false);
                    setLoading(false);
                    return;
                }

                const res = await fetch(url);
                const data = await res.json();

                if (Array.isArray(data)) {
                    setProducts(prev => {
                        // If it's page 1, we should probably just use the new data
                        // but since we clear it in a separate effect, this is usually safe.
                        // To be absolutely sure, let's filter the data if currentCategory exists.
                        const filteredData = currentCategory
                            ? data.filter((p: any) => {
                                const pCatIds = String(p.category_id || '').split(',').map(id => id.trim());
                                const pCatNames = String(p.category_name || '').split(',').map(n => n.trim().toLowerCase());
                                const targetName = String(currentCategory.name || '').toLowerCase().trim();

                                const isDirect = pCatIds.includes(String(currentCategory.id)) || pCatNames.includes(targetName);
                                const isSub = subCategories.some(sub => {
                                    const subName = String(sub.name || '').toLowerCase().trim();
                                    return pCatIds.includes(String(sub.id)) || pCatNames.includes(subName);
                                });
                                return isDirect || isSub;
                            })
                            : data;

                        if (page === 1) return filteredData;
                        const newProducts = [...prev, ...filteredData];
                        return Array.from(new Map(newProducts.map(item => [item.id, item])).values());
                    });
                    if (data.length < limit || slug === 'all') {
                        setHasMore(false);
                    }
                } else {
                    if (page === 1) setFallback();
                    setHasMore(false);
                }
            } catch (e) {
                if (page === 1) setFallback();
                setHasMore(false);
            }
            setLoading(false);
        }
        loadProducts();
    }, [page, navKey, isBaseHome, categories.length]);

    function setFallback() {
        const dummy: Product[] = [
            { id: 1, name: "Restaurant Packaging Box 2", slug: "box-2", price: 19.00, image: "https://via.placeholder.com/400?text=Box+2", category_name: "Packaging", rating: "5.0 (2.3k)" },
            { id: 2, name: "mehan ahmed 2", slug: "mehan-2", price: 0.66, image: "https://via.placeholder.com/400?text=Mehan+2", category_name: "Design", rating: "5.0 (5.8k)" },
            { id: 3, name: "Ledies Parlor Menu Design 2", slug: "parlor-2", price: 4.25, image: "https://via.placeholder.com/400?text=Parlor+2", category_name: "Menu", rating: "5.0 (23.2k)" },
            { id: 4, name: "Restaurant Packaging Box", slug: "box-1", price: 2.54, image: "https://via.placeholder.com/400?text=Box+1", category_name: "Packaging", rating: "4.8 (75.5k)" },
            { id: 5, name: "Luxury Villa Resort", slug: "villa", price: 1200.00, image: "https://via.placeholder.com/400?text=Villa", category_name: "Travel", rating: "4.9 (1.1k)" },
            { id: 6, name: "Chandelier Design", slug: "chandelier", price: 850.00, image: "https://via.placeholder.com/400?text=Chandelier", category_name: "Lighting", rating: "5.0 (456)" },
        ];
        setProducts(dummy);
    }

    const getCategoryStyles = (name: string) => {
        return { bg: '#F1F5F9', text: '#475569' }; // Neutral Slate/Grey
    };

    const filteredProducts = products.filter(p => {
        // 1. Category Filter
        if (currentCategory) {
            const pCatIds = String(p.category_id || '').split(',').map(id => id.trim());
            const pCatNames = String(p.category_name || '').split(',').map(n => n.trim().toLowerCase());
            const targetName = String(currentCategory.name || '').toLowerCase().trim();
            const isDirectMatch = pCatIds.includes(String(currentCategory.id)) || pCatNames.includes(targetName);

            const isSubMatch = subCategories.some(sub => {
                const subName = String(sub.name || '').toLowerCase().trim();
                return pCatIds.includes(String(sub.id)) || pCatNames.includes(subName);
            });

            if (!isDirectMatch && !isSubMatch) return false;
        }

        // 2. Search Text Filter
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            const matchesName = String(p.name || '').toLowerCase().includes(q);
            const matchesCategory = String(p.category_name || '').toLowerCase().includes(q);
            const matchesDesc = String(p.description || '').toLowerCase().includes(q);
            return matchesName || matchesCategory || matchesDesc;
        }

        return true;
    });

    // Search Suggestion Logic
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSuggestions([]);
            return;
        }

        const query = searchQuery.toLowerCase().trim();
        const matches: any[] = [];

        // Match categories (Global)
        categories.forEach(cat => {
            if (cat.name.toLowerCase().includes(query)) {
                matches.push({ type: 'category', id: cat.id, name: cat.name, slug: cat.slug });
            }
        });

        // Match products (Global - from allProducts)
        allProducts.forEach(p => {
            if (p.name.toLowerCase().includes(query)) {
                matches.push({ type: 'product', id: p.id, name: p.name, slug: p.slug });
            }
        });

        setSuggestions(matches.slice(0, 8)); // Limit to 8 suggestions
    }, [searchQuery, categories, allProducts]);

    return (
        <div suppressHydrationWarning>
            <style>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .carousel-container {
                    display: flex;
                    overflow-x: auto;
                    gap: 20px;
                    padding: 8px 4px 16px 4px;
                    scroll-behavior: smooth;
                    width: 100%;
                }
                .carousel-item {
                    flex: 0 0 280px;
                    width: 280px;
                    max-width: 280px;
                    min-width: 280px;
                }
                @media (max-width: 900px) {
                    .carousel-container {
                        gap: 12px !important;
                        padding-left: 12px !important;
                        padding-right: 12px !important;
                    }
                    .carousel-item {
                        flex: 0 0 calc((100% - 12px) / 2) !important;
                        width: calc((100% - 12px) / 2) !important;
                        max-width: calc((100% - 12px) / 2) !important;
                        min-width: calc((100% - 12px) / 2) !important;
                    }
                    .carousel-control-btn {
                        display: none !important;
                    }
                }
            `}</style>
            {/* --- NAVBAR --- */}
            <HomeNavbar
                categories={categories}
                allProducts={allProducts}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                mobileSheetOpen={mobileSheetOpen}
                onMobileSheetOpen={() => setMobileSheetOpen(true)}
                onMobileSheetClose={() => setMobileSheetOpen(false)}
            />

            {/* SEO Critical H1 - Visually Hidden on Home */}
            {isBaseHome && (
                <h1 style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', border: 0 }}>
                    Color Hut - Branding & Creative Solutions in Bangladesh
                </h1>
            )}

            <div className="store-container">
                {/* --- MOBILE HERO --- */}
                {isBaseHome && (
                    <HeroSlider />
                )}

                {/* --- PAGE TITLES --- */}
                {!isBaseHome && (
                    <div className="store-page-header">
                        <h1 className="store-page-title serif">
                            {currentCategory ? currentCategory.name : (slug === 'all' ? 'All Products' : 'Color Hut')}
                        </h1>
                        {subCategories.length > 0 && <p className="store-page-subtitle">Picks you'll love</p>}
                    </div>
                )}

                {/* --- SUB-CATEGORIES (Etsy Style) --- */}
                {subCategories.length > 0 && (
                    <div className="narrowing-pathways-container">
                        {subCategories.map(sub => (
                            <div key={sub.id} className="narrowing-pathway-item">
                                <a href={`/${sub.id}/${sub.slug}/`} className="narrowing-pathway-chip">
                                    <div className="pathway-icon">
                                        <img
                                            src={sub.icon || `https://ui-avatars.com/api/?name=${encodeURIComponent(sub.name)}&background=f0f0f0&color=333&size=200`}
                                            alt={sub.name}
                                        />
                                    </div>
                                    <span className="pathway-title">{sub.name}</span>
                                </a>
                            </div>
                        ))}
                    </div>
                )}


                {/* --- GRID --- */}
                {/* --- GRID OR CAROUSEL --- */}
                {slug === 'all' ? (
                    <div className="master-category-sections" style={{ width: '100%', marginTop: '30px' }}>
                        {mainCategories.map(cat => {
                            const catProducts = products.filter(p => {
                                const pCatIds = String(p.category_id || '').split(',').map(id => id.trim());
                                const pCatNames = String(p.category_name || '').split(',').map(n => n.trim().toLowerCase());
                                const catName = String(cat.name || '').toLowerCase().trim();
                                
                                const isDirect = pCatIds.includes(String(cat.id)) || pCatNames.includes(catName);
                                const isSub = categories.some(child => {
                                    const childParents = String(child.parent_ids || child.parent_id || '').split(',').map(id => id.trim());
                                    if (childParents.includes(String(cat.id))) {
                                        const childName = String(child.name || '').toLowerCase().trim();
                                        return pCatIds.includes(String(child.id)) || pCatNames.includes(childName);
                                    }
                                    return false;
                                });
                                
                                const matchesCat = isDirect || isSub;
                                if (!matchesCat) return false;

                                if (searchQuery.trim()) {
                                    const q = searchQuery.toLowerCase().trim();
                                    const matchesName = String(p.name || '').toLowerCase().includes(q);
                                    const matchesCategory = String(p.category_name || '').toLowerCase().includes(q);
                                    const matchesDesc = String(p.description || '').toLowerCase().includes(q);
                                    return matchesName || matchesCategory || matchesDesc;
                                }

                                return true;
                            });

                            if (catProducts.length === 0) return null;

                            // Sort products by subcategory position
                            const catSubCategories = categories.filter(child => {
                                const parentIds = String(child.parent_ids || child.parent_id || '').split(',').map(id => id.trim());
                                return parentIds.includes(String(cat.id));
                            });

                            const sortedCatProducts = [...catProducts].sort((a, b) => {
                                const getSubcategoryIndex = (p: Product) => {
                                    const pCatIds = String(p.category_id || '').split(',').map(id => id.trim());
                                    const pCatNames = String(p.category_name || '').split(',').map(n => n.trim().toLowerCase());
                                    
                                    const matchIdx = catSubCategories.findIndex(sub => {
                                        const subName = String(sub.name || '').toLowerCase().trim();
                                        return pCatIds.includes(String(sub.id)) || pCatNames.includes(subName);
                                    });
                                    
                                    return matchIdx;
                                };

                                const idxA = getSubcategoryIndex(a);
                                const idxB = getSubcategoryIndex(b);

                                if (idxA !== idxB) {
                                    return idxA - idxB;
                                }

                                const posA = a.position !== undefined ? a.position : 999999;
                                const posB = b.position !== undefined ? b.position : 999999;
                                if (posA !== posB) {
                                    return posA - posB;
                                }

                                return b.id - a.id;
                            });

                            return (
                                <div key={cat.id} className="sub-category-section" style={{ marginBottom: '20px', width: '100%' }}>
                                    {/* Category title link and chevron arrow */}
                                    <a 
                                        href={`/${cat.id}/${cat.slug}/`} 
                                        style={{ 
                                            display: 'inline-flex', 
                                            alignItems: 'center', 
                                            gap: '8px', 
                                            textDecoration: 'none', 
                                            color: '#1a1a1a', 
                                            margin: '12px 0 8px 0'
                                        }}
                                        onMouseEnter={(e) => {
                                            const circle = e.currentTarget.querySelector('.chevron-circle') as HTMLDivElement;
                                            if (circle) circle.style.backgroundColor = '#e2e8f0';
                                        }}
                                        onMouseLeave={(e) => {
                                            const circle = e.currentTarget.querySelector('.chevron-circle') as HTMLDivElement;
                                            if (circle) circle.style.backgroundColor = '#f1f5f9';
                                        }}
                                    >
                                        <span style={{ fontSize: '16px', fontWeight: 700, textTransform: 'capitalize' }}>
                                            {cat.name}
                                        </span>
                                        <div 
                                            className="chevron-circle"
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                width: '22px',
                                                height: '22px',
                                                borderRadius: '50%',
                                                backgroundColor: '#f1f5f9',
                                                color: '#1a1a1a',
                                                transition: 'background-color 0.2s ease'
                                            }}
                                        >
                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="9 18 15 12 9 6"></polyline>
                                            </svg>
                                        </div>
                                    </a>

                                    {/* Products Carousel */}
                                    <ProductCarousel
                                        products={sortedCatProducts}
                                        categories={categories}
                                        getCategoryStyles={getCategoryStyles}
                                        currentCategory={cat}
                                    />
                                </div>
                            );
                        })}
                        {loading && (
                            <div style={{ display: 'flex', gap: '20px', overflowX: 'hidden', padding: '20px 0' }}>
                                {[1, 2, 3, 4].map(i => <ProductSkeleton key={`loading-carousel-${i}`} />)}
                            </div>
                        )}
                        {!loading && mainCategories.every(cat => {
                            const catProducts = products.filter(p => {
                                const pCatIds = String(p.category_id || '').split(',').map(id => id.trim());
                                const pCatNames = String(p.category_name || '').split(',').map(n => n.trim().toLowerCase());
                                const catName = String(cat.name || '').toLowerCase().trim();
                                
                                const isDirect = pCatIds.includes(String(cat.id)) || pCatNames.includes(catName);
                                const isSub = categories.some(child => {
                                    const childParents = String(child.parent_ids || child.parent_id || '').split(',').map(id => id.trim());
                                    if (childParents.includes(String(cat.id))) {
                                        const childName = String(child.name || '').toLowerCase().trim();
                                        return pCatIds.includes(String(child.id)) || pCatNames.includes(childName);
                                    }
                                    return false;
                                });
                                
                                const matchesCat = isDirect || isSub;
                                if (!matchesCat) return false;

                                if (searchQuery.trim()) {
                                    const q = searchQuery.toLowerCase().trim();
                                    const matchesName = String(p.name || '').toLowerCase().includes(q);
                                    const matchesCategory = String(p.category_name || '').toLowerCase().includes(q);
                                    const matchesDesc = String(p.description || '').toLowerCase().includes(q);
                                    return matchesName || matchesCategory || matchesDesc;
                                }

                                return true;
                            });
                            return catProducts.length === 0;
                        }) && (
                            <div style={{ textAlign: 'center', padding: '60px 0', color: '#666' }}>
                                No products found.
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="store-grid">
                        {(() => {
                            let displayProducts = filteredProducts;
                            if (currentCategory && !currentCategory.parent_id && (!currentCategory.parent_ids || String(currentCategory.parent_ids).trim() === '')) {
                                const catSubCategories = categories.filter(child => {
                                    const parentIds = String(child.parent_ids || child.parent_id || '').split(',').map(id => id.trim());
                                    return parentIds.includes(String(currentCategory.id));
                                });

                                displayProducts = [...filteredProducts].sort((a, b) => {
                                    const getSubcategoryIndex = (p: Product) => {
                                        const pCatIds = String(p.category_id || '').split(',').map(id => id.trim());
                                        const pCatNames = String(p.category_name || '').split(',').map(n => n.trim().toLowerCase());
                                        
                                        const matchIdx = catSubCategories.findIndex(sub => {
                                            const subName = String(sub.name || '').toLowerCase().trim();
                                            return pCatIds.includes(String(sub.id)) || pCatNames.includes(subName);
                                        });
                                        
                                        return matchIdx;
                                    };

                                    const idxA = getSubcategoryIndex(a);
                                    const idxB = getSubcategoryIndex(b);

                                    if (idxA !== idxB) {
                                        return idxA - idxB;
                                    }

                                    const posA = a.position !== undefined ? a.position : 999999;
                                    const posB = b.position !== undefined ? b.position : 999999;
                                    if (posA !== posB) {
                                        return posA - posB;
                                    }

                                    return b.id - a.id;
                                });
                            }

                            return displayProducts.map((p, idx) => {
                                const isLast = displayProducts.length === idx + 1;
                                return (
                                    <ProductCard
                                        key={p.id}
                                        ref={isLast ? lastProductElementRef : null}
                                        p={p}
                                        idx={idx}
                                        getCategoryStyles={getCategoryStyles}
                                        categories={categories}
                                        currentCategory={currentCategory}
                                    />
                                );
                            });
                        })()}
                        {loading && [1, 2, 3, 4, 5, 6, 7, 8].map(i => <ProductSkeleton key={`loading-${i}`} />)}
                    </div>
                )}
            </div>

            {/* --- ABOUT SECTION --- */}
            {isBaseHome && (
                <section className="store-about-section" vocab="http://schema.org/" {...{ typeof: "Organization" }}>
                    <div className="store-about-content">
                        <div className="store-about-header">
                            <a href="https://wa.me/8801989224436" target="_blank" rel="noopener noreferrer" className="store-about-whatsapp-btn">
                                <WhatsAppIcon />
                                Contact Us
                            </a>
                            <h2 className="serif" itemProp="name" property="name">What is Color Hut?</h2>
                            <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="store-about-story" style={{ color: '#FF0000', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <YouTubeIcon />
                                Watch our studio story on YouTube
                                <YouTubeIcon />
                            </a>
                        </div>

                        <div className="store-about-grid">
                            <div className="store-about-col">
                                <h3>Creative Branding Studio</h3>
                                <p itemProp="description" property="description">
                                    Color Hut is a leading branding agency based in Bangladesh, specializing in creating unforgettable visual identities.
                                    We craft custom logos, color schemes, and typography that bring your brand's values to life and help you stand out.
                                </p>
                            </div>
                            <div className="store-about-col">
                                <h3>The Silent Salesman</h3>
                                <p>
                                    We believe a menu is the heart of a restaurant—a silent salesman that defines your brand.
                                    Our premium menu design and printing services focus on unique, high-quality books that capture your culinary essence.
                                </p>
                            </div>
                            <div className="store-about-col">
                                <h3>Complete Design Solutions</h3>
                                <p>
                                    Our expertise extends beyond branding to complete design solutions.
                                    From user-focused interior and exterior design to advanced digital marketing and ERP systems, we provide the tools businesses need to scale.
                                </p>
                            </div>
                        </div>

                        <div className="store-about-footer">
                            <h4>Trusted by brands like Dhaka Club, HASH & NOSH and Sea Shell.</h4>
                            <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="store-help-btn">Connect on Facebook</a>
                        </div>
                    </div>
                </section>
            )}

            {/* --- MOBILE FULL PAGE SHEET (Drill-down Style) --- */}
            <div className={`store-mobile-overlay ${mobileSheetOpen ? 'active' : ''}`} onClick={() => setMobileSheetOpen(false)}></div>
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

                    <button className="mobile-sheet-close" onClick={() => setMobileSheetOpen(false)}>
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
                                                    setMobileSheetOpen(false);
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
                                onClick={() => setMobileSheetOpen(false)}
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
                                            onClick={() => setMobileSheetOpen(false)}
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

            <MeetingRequestPopup isOpen={meetingPopupOpen} onClose={() => handlePopupClose('meeting')} />
            <ImagePopup
                isOpen={imagePopupOpen}
                onClose={() => handlePopupClose('image')}
                onAction={() => {
                    setIsAutoScrolling(true);
                    const element = document.getElementById('meeting-call');
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                    }
                    // Release the scroll lock after animation finishes
                    setTimeout(() => setIsAutoScrolling(false), 1500);
                }}
            />
            {!isMeetingHidden && (slug?.toLowerCase() === 'restaurant' || slug?.toLowerCase() === 'parlor' || slug?.toLowerCase() === 'parlour') && (
                <MeetingFormSection
                    initialBusinessType={slug?.toLowerCase() === 'restaurant' ? 'restaurant' : 'parlor'}
                    onStartFilling={() => setIsFillingForm(true)}
                />
            )}
            <Footer socialLinks={socialLinks} />
        </div>
    );
}
