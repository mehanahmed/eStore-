'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import {
    Star,
    Heart,
    Share2,
    Plus,
    Minus,
    ShoppingBag,
    FileText,
    ListCheck,
    Sparkles,
    ChevronLeft as LucideChevronLeft,
    ChevronRight as LucideChevronRight
} from 'lucide-react';
import { FaShieldHalved, FaTruckFast, FaBoxesPacking, FaHeadset } from 'react-icons/fa6';

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

const GlobeIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
);

const FacebookIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
);

const InstagramIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
);

const PinterestIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.2 0 1.033.394 2.137.884 2.738.097.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.252 7.929-7.252 4.163 0 7.398 2.967 7.398 6.92 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592 0 11.985 0" /></svg>
);

const FooterYouTubeIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.11 1 12 1 12s0 3.89.46 5.58a2.78 2.78 0 0 0 1.94 2c1.72.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.89 23 12 23 12s0-3.89-.46-5.58z"></path><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"></polygon></svg>
);


// === SUB-COMPONENTS ===
const SideRelatedCard = ({ item }: { item: any }) => {
    const [hovered, setHovered] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    let images: string[] = [];
    try {
        if (item.image?.startsWith('[')) {
            images = JSON.parse(item.image);
        } else if (item.image) {
            images = [item.image];
        }
    } catch (e) {
        images = item.image ? [item.image] : [];
    }
    const mainImage = images[0] || 'https://via.placeholder.com/400';
    let imgUrl = mainImage;
    if (imgUrl && !imgUrl.startsWith('http') && !imgUrl.startsWith('/')) {
        imgUrl = '/uploads/' + imgUrl;
    }
    if (imgUrl.includes('/uploads/')) {
        imgUrl = imgUrl.replace('/uploads/', '/api/public/watermark/');
    }

    const hasVideo = !!item.video_url;

    const handleMouseEnter = () => {
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

    return (
        <a
            href={`/p/${item.id}/${item.slug}`}
            className="group relative w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-slate-100 border border-slate-200/60 shadow-sm hover:shadow-md transition-all shimmer-sweep"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <img
                src={imgUrl}
                className="w-full h-full object-contain group-hover:scale-110 transition-all duration-700"
                alt={`Related: ${item.name} | Color Hut`}
                title={item.name}
                style={{ opacity: hovered && hasVideo ? 0 : 1 }}
            />
            {hasVideo && (
                <>
                    <video
                        ref={videoRef}
                        src={item.video_url}
                        className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-300 pointer-events-none"
                        muted
                        playsInline
                        loop
                        style={{ opacity: hovered ? 1 : 0 }}
                    />
                    {!hovered && (
                        <div className="video-icon-badge absolute bottom-1 left-1 w-5 h-5 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg z-20 transition-opacity">
                            <svg className="w-2.5 h-2.5 text-orange-600 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                        </div>
                    )}
                </>
            )}
            <div className="absolute inset-0 ring-1 ring-inset ring-black/5 group-hover:ring-orange-500/20 rounded-lg transition-all"></div>
        </a>
    );
};

const RelatedCard = ({ item, idx }: { item: any, idx: number }) => {
    const [hovered, setHovered] = useState(false);
    const [imgIndex, setImgIndex] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);

    let images: string[] = [];
    try {
        if (item.image?.startsWith('[')) {
            images = JSON.parse(item.image);
        } else if (item.image) {
            images = [item.image];
        }
    } catch (e) {
        images = item.image ? [item.image] : [];
    }

    const hasVideo = !!item.video_url;
    const hasMultipleImages = images.length > 1;

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (hasMultipleImages && hovered) {
            interval = setInterval(() => {
                setImgIndex((prev) => (prev + 1) % images.length);
            }, 2500);
        } else {
            setImgIndex(0);
        }
        return () => clearInterval(interval);
    }, [hasMultipleImages, images.length, hovered]);

    const handleMouseEnter = () => {
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
    if (currentImgUrl.includes('/uploads/')) {
        currentImgUrl = currentImgUrl.replace('/uploads/', '/api/public/watermark/');
    }

    const fakeRating = idx % 2 === 0 ? '5.0' : '4.8';
    const fakeCount = ((idx + 1) * 342) % 3000;

    return (
        <a
            href={`/p/${item.id}/${item.slug}`}
            className="rc-card"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className="rc-image-box">
                <img
                    src={currentImgUrl || 'https://via.placeholder.com/400'}
                    alt={item.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-opacity duration-300"
                    style={{ opacity: hovered && hasVideo ? 0 : 1 }}
                />
                {hasVideo && (
                    <>
                        <video
                            ref={videoRef}
                            src={item.video_url}
                            className="rc-video-hover"
                            muted
                            playsInline
                            loop
                            style={{ opacity: hovered ? 1 : 0 }}
                        />
                        {!hovered && (
                            <div className="rc-play-overlay">
                                <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor"><path d="M0 0l10 6-10 6z" /></svg>
                            </div>
                        )}
                    </>
                )}
                <button className="rc-fav-btn" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} aria-label="Favourite">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
                </button>
            </div>
            <div className="rc-card-info">
                <div className="rc-title-row">
                    <h3 className="rc-prod-title">{item.name}</h3>
                    <div className="rc-prod-rating">
                        <span style={{ fontWeight: 700 }}>{fakeRating}</span>
                        <span style={{ margin: '0 1px' }}>★</span>
                        <span style={{ color: '#595959' }}>({fakeCount})</span>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginTop: '4px' }}>
                    <div className="rc-category-badge">{item.category_name || 'Design'}</div>
                    {Boolean(item.price && Number(item.price) > 0) && (
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'baseline',
                            fontWeight: 900,
                            color: '#0f172a',
                            fontSize: '13px',
                            letterSpacing: '-0.02em',
                            background: '#fff7ed',
                            border: '1px solid #fed7aa',
                            padding: '2px 7px',
                            borderRadius: '6px',
                            whiteSpace: 'nowrap'
                        }}>
                            <span style={{ color: '#ea580c', fontSize: '11px', marginRight: '1.5px', fontWeight: 900 }}>৳</span>
                            <span>{Number(item.price).toLocaleString()}</span>
                        </div>
                    )}
                </div>
            </div>
        </a>
    );
};

const RatingStars = ({ rating }: { rating: number }) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    return (
        <div className="flex gap-1 items-center">
            {Array.from({ length: 5 }, (_, i) => {
                let fillInfo = 'text-slate-200 fill-current';
                if (i < fullStars) fillInfo = 'text-orange-400 fill-current';
                else if (i === fullStars && hasHalfStar) fillInfo = 'text-orange-400 fill-current';
                return (
                    <svg key={i} className={`w-5 h-5 ${fillInfo}`} viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                );
            })}
            <span className="text-sm font-bold text-slate-400 ml-2">({rating.toFixed(1)} / 5.0)</span>
        </div>
    );
};


// === SKELETON LOADER COMPONENT FOR HIGH-FIDELITY LOADING ===
const ProductPageSkeleton = () => {
    return (
        <div suppressHydrationWarning className="bg-slate-50 min-h-screen">
            {/* Header Placeholder */}
            <div className="h-16 bg-white border-b border-slate-200/80 sticky top-0 z-50 flex items-center justify-between px-6 md:px-10">
                <div className="w-32 h-6 bg-slate-200/60 rounded-lg animate-pulse"></div>
                <div className="hidden md:flex gap-6">
                    <div className="w-16 h-4 bg-slate-200/60 rounded animate-pulse"></div>
                    <div className="w-16 h-4 bg-slate-200/60 rounded animate-pulse"></div>
                    <div className="w-16 h-4 bg-slate-200/60 rounded animate-pulse"></div>
                </div>
                <div className="w-8 h-8 bg-slate-200/60 rounded-full animate-pulse"></div>
            </div>

            <main className="max-w-[1400px] mx-auto px-6 md:px-10 pt-5 pb-8 md:pt-8 md:pb-12">
                {/* Breadcrumbs Skeleton */}
                <div className="flex items-center gap-2 mb-8">
                    <div className="w-8 h-8 rounded-full bg-slate-200/60 animate-pulse"></div>
                    <div className="h-4 w-16 bg-slate-200/60 rounded-md animate-pulse"></div>
                    <div className="h-4 w-2 bg-slate-200/60 rounded animate-pulse"></div>
                    <div className="h-4 w-24 bg-slate-200/60 rounded-md animate-pulse"></div>
                    <div className="h-4 w-2 bg-slate-200/60 rounded animate-pulse"></div>
                    <div className="h-4 w-32 bg-slate-200/60 rounded-md animate-pulse"></div>
                </div>

                <div className="flex flex-col lg:flex-row gap-16 md:gap-24 mb-10">
                    {/* Gallery Section Skeleton */}
                    <div className="w-full lg:w-[720px] shrink-0 flex flex-col gap-10">
                        <div className="flex gap-4 md:gap-6 flex-col-reverse lg:flex-row h-auto lg:h-[600px]">
                            {/* Thumbnails */}
                            <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto w-full lg:w-24 shrink-0 py-2 lg:py-0">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="w-20 h-20 lg:w-full lg:h-24 rounded-2xl bg-slate-200/60 animate-pulse shrink-0"></div>
                                ))}
                            </div>

                            {/* Main Active Media */}
                            <div className="w-full lg:w-[600px] aspect-square rounded-3xl bg-slate-200/60 animate-pulse relative shadow-md"></div>
                        </div>
                    </div>

                    {/* Content Section Skeleton */}
                    <div className="flex-1 flex flex-col justify-start">
                        {/* Title & Rating */}
                        <div className="mb-6">
                            <div className="h-10 md:h-12 w-3/4 bg-slate-200/60 rounded-2xl animate-pulse mb-4"></div>
                            <div className="h-5 w-40 bg-slate-200/60 rounded-lg animate-pulse"></div>
                        </div>

                        {/* Highlights Grid */}
                        <div className="grid grid-cols-2 gap-4 py-6 border-y border-slate-200/50 mb-6">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-slate-200/60 animate-pulse"></div>
                                    <div className="flex flex-col gap-1.5 flex-1">
                                        <div className="h-3 w-20 bg-slate-200/60 rounded animate-pulse"></div>
                                        <div className="h-2.5 w-28 bg-slate-200/60 rounded animate-pulse"></div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-col gap-4 mb-8">
                            <div className="h-16 w-full rounded-2xl bg-slate-200/60 animate-pulse"></div>
                            <div className="h-14 w-full rounded-2xl bg-slate-200/60 animate-pulse"></div>
                        </div>

                        {/* Paragraph lines */}
                        <div className="space-y-3">
                            <div className="h-4 w-full bg-slate-200/60 rounded animate-pulse"></div>
                            <div className="h-4 w-[95%] bg-slate-200/60 rounded animate-pulse"></div>
                            <div className="h-4 w-[90%] bg-slate-200/60 rounded animate-pulse"></div>
                            <div className="h-4 w-[60%] bg-slate-200/60 rounded animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};


// === GRAPHQL QUERIES ===
const GET_CATEGORIES = gql`
    query GetCategories {
        categories {
            id
            name
            slug
            parent_id
            image
            children {
                id
                name
                slug
                parent_id
                image
            }
        }
    }
`;

// === MAIN PRODUCT DETAIL PAGE COMPONENT ===
export default function ProductDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const title = params.title as string;

    const [product, setProduct] = useState<any>(null);
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
    const [related, setRelated] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Gallery state
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [galleryItems, setGalleryItems] = useState<any[]>([]);

    // Navigation and header/footer states
    const [searchFocused, setSearchFocused] = useState(false);
    const [catMenuOpen, setCatMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [allProducts, setAllProducts] = useState<any[]>([]);
    const [hoveredCatId, setHoveredCatId] = useState<number | null>(null);
    const [expandedCatId, setExpandedCatId] = useState<number | null>(null);
    const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
    const [activeSheetCatId, setActiveSheetCatId] = useState<number | null>(null);
    const [showCopiedToast, setShowCopiedToast] = useState(false);
    const [storyExpanded, setStoryExpanded] = useState(false);
    const [isLongStory, setIsLongStory] = useState(false);
    const [descModalOpen, setDescModalOpen] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'shipping'>('description');
    const [isWishlisted, setIsWishlisted] = useState(false);

    const catMenuRef = useRef<HTMLDivElement>(null);
    const searchBarRef = useRef<HTMLDivElement>(null);
    const storyRef = useRef<HTMLDivElement>(null);

    const storyCallbackRef = useCallback((node: HTMLDivElement | null) => {
        if (node) {
            storyRef.current = node;
            const checkHeight = () => {
                if (node.scrollHeight > 90) {
                    setIsLongStory(true);
                } else {
                    setIsLongStory(false);
                }
            };
            checkHeight();
            setTimeout(checkHeight, 50);
            setTimeout(checkHeight, 150);
            setTimeout(checkHeight, 400);
        }
    }, [product?.description]);

    // Dynamic clean thumbnail helper
    const getThumb = (src: string) => {
        if (!src || src.startsWith('blob:') || src.startsWith('data:')) return src;

        if (!src.startsWith('http') && !src.startsWith('/')) {
            src = '/uploads/' + src;
        }

        if (src.includes('/opt-') && !src.includes('/uploads/') && !src.includes('/api/')) {
            src = '/uploads' + src;
        }

        if (src.includes('/api/public/watermark/')) return src;

        if (src.includes('/uploads/')) {
            return src.replace('/uploads/', '/api/public/watermark/');
        }

        if (src.includes('/opt-') && !src.includes('/thumb-')) {
            const parts = src.split('/');
            const filename = parts.pop();
            return parts.join('/') + '/thumb-' + filename;
        }
        return src;
    };

    // Close on click outside helpers
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

    // Prevent body scroll when mobile sheet or modal is open
    useEffect(() => {
        if (mobileSheetOpen || descModalOpen) {
            document.body.classList.add('no-scroll');
        } else {
            document.body.classList.remove('no-scroll');
        }
        return () => document.body.classList.remove('no-scroll');
    }, [mobileSheetOpen, descModalOpen]);



    // Load categories via Apollo Client (GraphQL)
    const { data: categoriesData } = useQuery<{ categories: any[] }>(GET_CATEGORIES);
    useEffect(() => {
        if (categoriesData?.categories && Array.isArray(categoriesData.categories)) {
            setCategories(categoriesData.categories);
        }
    }, [categoriesData]);

    // Load all products for search suggestions
    useEffect(() => {
        async function loadAllProducts() {
            try {
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

    // Search suggestions filter logic
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSuggestions([]);
            return;
        }

        const query = searchQuery.toLowerCase().trim();
        const matches: any[] = [];

        categories.forEach(cat => {
            if (cat.name.toLowerCase().includes(query)) {
                matches.push({ type: 'category', id: cat.id, name: cat.name, slug: cat.slug });
            }
        });

        allProducts.forEach(p => {
            if (p.name.toLowerCase().includes(query)) {
                matches.push({ type: 'product', id: p.id, name: p.name, slug: p.slug });
            }
        });

        setSuggestions(matches.slice(0, 8));
    }, [searchQuery, categories, allProducts]);

    // Load main product detail & related items
    useEffect(() => {
        if (!id) return;

        async function loadProductDetails() {
            setLoading(true);
            try {
                const res = await fetch(`/api/public/products/${id}`);
                if (!res.ok) throw new Error('Product not found');
                const data = await res.json();
                setProduct(data);

                // Document title updates
                document.title = `${data.name} | Color Hut Studio`;

                // Build main gallery arrays
                let images: string[] = [];
                try {
                    images = data.image ? (data.image.startsWith('[') ? JSON.parse(data.image) : [data.image]) : [];
                } catch (e) {
                    images = data.image ? [data.image] : [];
                }

                const gallery = images.map(url => {
                    let src = url;
                    if (!src.startsWith('http') && !src.startsWith('/')) {
            src = '/uploads/' + src;
        }
                    if (src.includes('/opt-') && !src.includes('/uploads/') && !src.includes('/api/')) {
                        src = '/uploads' + src;
                    }
                    if (src.includes('/uploads/')) {
                        src = src.replace('/uploads/', '/api/public/watermark/');
                    }
                    return { type: 'image', src };
                });

                if (data.video_url) {
                    if (gallery.length > 0) {
                        gallery.splice(1, 0, { type: 'video', src: data.video_url });
                    } else {
                        gallery.push({ type: 'video', src: data.video_url });
                    }
                }

                if (gallery.length === 0) {
                    gallery.push({ type: 'image', src: 'https://via.placeholder.com/600' });
                }

                setGalleryItems(gallery);
                setCurrentMediaIndex(0);

                // Fetch Related / Recommended Products
                const catIds = String(data.category_id || '').split(',').map(id => id.trim()).filter(Boolean).join(',');
                const relatedRes = await fetch(`/api/public/related/${catIds || '0'}?exclude=${data.id}`);
                const relatedData = await relatedRes.json();
                let relatedProducts = Array.isArray(relatedData) ? relatedData : [];
                if (relatedProducts.length === 0) {
                    const fallbackRes = await fetch(`/api/public/products?limit=8`);
                    const fallbackData = await fallbackRes.json();
                    if (Array.isArray(fallbackData)) {
                        relatedProducts = fallbackData.filter((p: any) => p.id !== data.id);
                    }
                }
                setRelated(relatedProducts);

            } catch (err) {
                console.error('Error fetching product detail page details:', err);
            } finally {
                setLoading(false);
            }
        }

        loadProductDetails();
    }, [id]);

    // Auto-correct URL title in browser address bar if mismatched (Premium SEO dynamic correction)
    useEffect(() => {
        if (product && id && title !== product.slug) {
            const newPath = `/p/${id}/${product.slug}/`;
            window.history.replaceState(null, '', newPath);
        }
    }, [product, id, title]);

    // Inquiry WhatsApp trigger
    const inquireWhatsApp = () => {
        const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
        const phoneNumber = "8801919760626";
        const qtyText = quantity > 1 ? ` (Quantity: ${quantity})` : '';
        const message = `Hello, I'm interested in ordering ${product?.name || 'this product'}${qtyText} from ${currentUrl}. Can you please confirm availability?`;
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
    };

    // Advanced Markdown parsing (sync with admin preview exactly)
    const parseMarkdownDescription = (text: string) => {
        if (!text) return '';
        return text
            .replace(/^### (.*$)/gim, '<h3 class="text-xl font-extrabold text-slate-900 mt-6 mb-3">$1</h3>')
            .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-black text-slate-900 mt-8 mb-4 border-b border-slate-100 pb-2">$1</h2>')
            .replace(/^# (.*$)/gim, '<h1 class="text-4xl font-black text-slate-900 mt-10 mb-6">$1</h1>')
            .replace(/\*\*(.*?)\*\*/g, '<strong class="font-extrabold text-slate-900">$1</strong>')
            .replace(/\*(.*?)\*/g, '<em class="italic text-slate-600">$1</em>')
            .replace(/`(.*?)`/g, '<code class="bg-slate-100 px-1.5 py-0.5 rounded text-sm font-mono text-orange-600">$1</code>')
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
                const trimmed = para.trim();
                if (trimmed.startsWith('<h1') || trimmed.startsWith('<h2') || trimmed.startsWith('<h3') || trimmed.startsWith('<ul') || trimmed.startsWith('<ol') || trimmed.startsWith('<div') || trimmed.startsWith('<blockquote') || trimmed.startsWith('<p') || trimmed.startsWith('<img') || trimmed.startsWith('<span') || trimmed.startsWith('<u') || trimmed.startsWith('<font')) {
                    return para;
                }
                return `<p class="mb-6 leading-loose text-slate-600 font-medium">${para.replace(/\n/g, '<br>')}</p>`;
            }).join('');
    };

    // Switch media gallery items
    const switchMedia = (index: number) => {
        setCurrentMediaIndex(index);
    };

    const shareProduct = () => {
        if (typeof navigator !== 'undefined') {
            navigator.clipboard.writeText(window.location.href);
            setShowCopiedToast(true);
            setTimeout(() => setShowCopiedToast(false), 2500);
        }
    };

    const nextMedia = () => {
        setCurrentMediaIndex((prev) => (prev + 1) % galleryItems.length);
    };

    const prevMedia = () => {
        setCurrentMediaIndex((prev) => (prev - 1 + galleryItems.length) % galleryItems.length);
    };

    // Render active media view
    const renderActiveMedia = () => {
        const item = galleryItems[currentMediaIndex];
        if (!item) return null;

        if (item.type === 'video') {
            if (item.src.includes('youtube.com') || item.src.includes('youtu.be')) {
                let videoId = '';
                if (item.src.includes('v=')) videoId = item.src.split('v=')[1].split('&')[0];
                else videoId = item.src.split('/').pop() || '';
                return <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&playsinline=1`} frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen></iframe>;
            } else if (item.src.includes('vimeo.com')) {
                let videoId = item.src.split('/').pop() || '';
                return <iframe className="w-full h-full" src={`https://player.vimeo.com/video/${videoId}?autoplay=1&muted=0`} frameBorder="0" allow="autoplay; fullscreen" allowFullScreen></iframe>;
            } else {
                return (
                    <video
                        className="w-full h-full object-cover"
                        src={item.src}
                        loop
                        controls
                        controlsList="nodownload"
                        onContextMenu={e => e.preventDefault()}
                        playsInline
                        autoPlay
                    />
                );
            }
        }

        return <img src={item.src} className="w-full h-full object-contain" alt="Gallery active view" />;
    };

    // Self-contained dynamic SEO & Open Graph calculation
    let seoImages: string[] = [];
    try {
        if (product && product.image) {
            if (product.image.startsWith('[')) {
                seoImages = JSON.parse(product.image);
            } else {
                seoImages = [product.image];
            }
        }
    } catch (e) {
        seoImages = product && product.image ? [product.image] : [];
    }
    const seoMainImage = seoImages[0] || '';
    let seoImageUrl = seoMainImage;
    if (seoImageUrl && !seoImageUrl.startsWith('http') && !seoImageUrl.startsWith('/')) {
        seoImageUrl = '/uploads/' + seoImageUrl;
    }
    if (seoImageUrl.includes('/uploads/')) {
        seoImageUrl = seoImageUrl.replace('/uploads/', '/api/public/watermark/');
    }
    const originUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const fullSeoImageUrl = seoImageUrl ? (seoImageUrl.startsWith('http') ? seoImageUrl : `${originUrl}${seoImageUrl}`) : '';
    const fullProductUrl = product ? `${originUrl}/p/${product.id}/${product.slug}` : '';

    if (loading || !product) {
        return <ProductPageSkeleton />;
    }

    const productJsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "image": fullSeoImageUrl,
        "description": product.description || product.seo_description || `Buy ${product.name} at Color Hut Studio.`,
        "sku": `PROD-${product.id}`,
        "offers": {
            "@type": "Offer",
            "url": fullProductUrl,
            "priceCurrency": "BDT",
            "price": product.price || 0,
            "priceValidUntil": "2028-12-31",
            "itemCondition": "https://schema.org/NewCondition",
            "availability": "https://schema.org/InStock",
            "seller": {
                "@type": "Organization",
                "name": "Color Hut"
            }
        }
    };

    return (
        <div suppressHydrationWarning className="bg-slate-50 min-h-screen">
            {/* Dynamic SEO, Open Graph & Twitter Card head tags (Natively Hoisted by React 19) */}
            <title>{product.name} | Color Hut Studio</title>
            <meta name="description" content={product.seo_description || `Buy ${product.name} at Color Hut Studio. High quality designs and premium catalog assets.`} />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
            />

            {/* Open Graph / Facebook / WhatsApp */}
            <meta property="og:title" content={product.name} />
            <meta property="og:description" content={product.seo_description || `Buy ${product.name} at Color Hut Studio.`} />
            <meta property="og:image" content={fullSeoImageUrl} />
            <meta property="og:url" content={fullProductUrl} />
            <meta property="og:type" content="website" />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={product.name} />
            <meta name="twitter:description" content={product.seo_description || `Buy ${product.name} at Color Hut Studio.`} />
            <meta name="twitter:image" content={fullSeoImageUrl} />
            {/* Inject Exact CSS Styles from product.html */}
            <style dangerouslySetInnerHTML={{
                __html: `
                :root {
                    --primary: #f97316;
                    --primary-dark: #ea580c;
                    --accent: #4f46e5;
                }

                .glass-panel {
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                }

                .product-card {
                    transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
                    border: 1px solid rgba(226, 232, 240, 0.5);
                }

                .product-card:hover {
                    transform: translateY(-16px) scale(1.03);
                    box-shadow: 0 40px 80px -15px rgba(0, 0, 0, 0.1);
                    border-color: rgba(249, 115, 22, 0.3);
                }

                .shine-effect {
                    position: relative;
                    overflow: hidden;
                }

                .shine-effect::after {
                    content: '';
                    position: absolute;
                    top: -50%;
                    left: -60%;
                    width: 30%;
                    height: 200%;
                    background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.4), transparent);
                    transform: rotate(30deg);
                    transition: all 0.9s cubic-bezier(0.19, 1, 0.22, 1);
                }

                .product-card:hover .shine-effect::after {
                    left: 150%;
                }

                .shimmer-sweep {
                    position: relative;
                    overflow: hidden;
                    background: #f1f5f9;
                }

                .shimmer-sweep::after {
                    content: "";
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 200%;
                    height: 100%;
                    background: linear-gradient(90deg,
                            rgba(255, 255, 255, 0) 0%,
                            rgba(255, 255, 255, 0.4) 50%,
                            rgba(255, 255, 255, 0) 100%);
                    transform: translateX(-100%);
                    animation: shimmer-sweep-anim 1.5s infinite;
                }

                @keyframes shimmer-sweep-anim {
                    0% {
                        transform: translateX(-100%);
                    }
                    100% {
                        transform: translateX(100%);
                    }
                }

                /* Premium Rich Text Typography styling inside the Product Detail View */
                .markdown-content {
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    color: #475467; /* slate-600 */
                }

                .markdown-content p {
                    margin-bottom: 24px;
                    line-height: 1.85;
                    font-size: 1.125rem; /* 18px */
                    font-weight: 500;
                }

                .markdown-content h1 {
                    font-size: 2.25rem; /* 36px */
                    font-weight: 900;
                    color: #0f172a; /* slate-900 */
                    margin-top: 40px;
                    margin-bottom: 24px;
                    letter-spacing: -0.02em;
                    line-height: 1.25;
                }

                .markdown-content h2 {
                    font-size: 1.75rem; /* 28px */
                    font-weight: 800;
                    color: #0f172a;
                    margin-top: 32px;
                    margin-bottom: 16px;
                    letter-spacing: -0.01em;
                    border-bottom: 1px solid #f1f5f9;
                    padding-bottom: 8px;
                    line-height: 1.35;
                }

                .markdown-content h3 {
                    font-size: 1.375rem; /* 22px */
                    font-weight: 800;
                    color: #0f172a;
                    margin-top: 24px;
                    margin-bottom: 12px;
                    line-height: 1.4;
                }

                .markdown-content strong, 
                .markdown-content b {
                    font-weight: 800;
                    color: #0f172a;
                }

                .markdown-content em, 
                .markdown-content i {
                    font-style: italic;
                    color: #475467;
                }

                .markdown-content ul {
                    list-style-type: disc !important;
                    padding-left: 24px !important;
                    margin-top: 16px !important;
                    margin-bottom: 24px !important;
                }

                .markdown-content ul li {
                    list-style-type: disc !important;
                    margin-bottom: 8px;
                    line-height: 1.75;
                    font-weight: 500;
                }

                .markdown-content ul li::marker {
                    color: #f97316 !important; /* Orange list-bullets matching products page */
                }

                .markdown-content ol {
                    list-style-type: decimal !important;
                    padding-left: 24px !important;
                    margin-top: 16px !important;
                    margin-bottom: 24px !important;
                }

                .markdown-content ol li {
                    list-style-type: decimal !important;
                    margin-bottom: 8px;
                    line-height: 1.75;
                    font-weight: 500;
                }

                .markdown-content code {
                    background-color: #f1f5f9;
                    color: #ea580c; /* orange-600 */
                    font-family: monospace;
                    font-size: 0.875em;
                    padding: 2px 6px;
                    border-radius: 6px;
                    font-weight: 600;
                }

                .markdown-content blockquote {
                    border-left: 4px solid #f97316; /* Orange side accent */
                    background-color: #fff7ed; /* orange-50 */
                    padding: 16px 24px;
                    margin: 24px 0;
                    border-radius: 8px;
                    font-style: italic;
                }

                .markdown-content blockquote p {
                    margin-bottom: 0;
                    color: #c2410c; /* orange-700 */
                    font-weight: 600;
                }

                .markdown-content img {
                    border-radius: 12px;
                    border: 1px solid #f1f5f9;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
                    margin: 16px 0;
                    max-width: 100%;
                    height: auto;
                    display: inline-block;
                }

                /* Floating support for inline rich images */
                .markdown-content img[style*="float: left"] {
                    margin-right: 24px !important;
                    margin-bottom: 16px !important;
                    margin-top: 8px !important;
                }

                .markdown-content img[style*="float: right"] {
                    margin-left: 24px !important;
                    margin-bottom: 16px !important;
                    margin-top: 8px !important;
                }

                /* Related creation store layouts */
                .related-store-grid {
                    display: grid;
                    grid-template-columns: repeat(4, minmax(0, 1fr));
                    gap: 32px 18px;
                    padding: 12px 0 60px 0;
                    width: 100%;
                }

                @media (max-width: 1100px) {
                    .related-store-grid {
                        grid-template-columns: repeat(3, minmax(0, 1fr));
                    }
                }

                @media (max-width: 900px) {
                    .related-store-grid {
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                        gap: 16px 12px;
                    }
                }

                .rc-card {
                    display: flex;
                    flex-direction: column;
                    text-decoration: none;
                    color: inherit;
                    position: relative;
                    cursor: pointer;
                    transition: transform 0.2s ease;
                    width: 100%;
                    min-width: 0;
                }

                .rc-card:hover {
                    transform: translateY(-2px);
                }

                .rc-image-box {
                    position: relative;
                    width: 100%;
                    padding-top: 80%;
                    border-radius: 16px;
                    overflow: hidden;
                    background: #fdfdfd;
                    margin-bottom: 6px;
                }

                .rc-image-box img,
                .rc-video-hover {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.6s cubic-bezier(0.2, 0, 0.2, 1);
                }

                .rc-card:hover .rc-image-box img {
                    transform: scale(1.05);
                }

                .rc-play-overlay {
                    position: absolute;
                    bottom: 12px;
                    left: 12px;
                    background: #fff;
                    color: #1a1a1a;
                    width: 26px;
                    height: 26px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 5;
                    pointer-events: none;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
                }

                .rc-fav-btn {
                    position: absolute;
                    top: 12px;
                    right: 12px;
                    background: white;
                    border: none;
                    border-radius: 50%;
                    width: 34px;
                    height: 34px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    opacity: 0;
                    transition: opacity 0.2s;
                }

                .rc-card:hover .rc-fav-btn {
                    opacity: 1;
                }

                .rc-card-info {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .rc-title-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    gap: 8px;
                }

                .rc-prod-title {
                    font-size: 14px;
                    font-weight: 400;
                    color: #1a1a1a;
                    margin: 0;
                    line-height: 1.4;
                    white-space: normal;
                    overflow: hidden;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    line-clamp: 2;
                    flex: 1;
                }

                .rc-prod-rating {
                    font-size: 12px;
                    color: #1a1a1a;
                    display: flex;
                    align-items: center;
                    white-space: nowrap;
                    font-weight: 400;
                }

                .rc-category-badge {
                    font-size: 10px;
                    font-weight: 700;
                    padding: 4px 12px;
                    border-radius: 99px;
                    display: inline-block;
                    align-self: flex-start;
                    margin-top: 8px;
                    background-color: #f2f4f7;
                    color: #475467;
                    letter-spacing: 0.05em;
                    text-transform: capitalize;
                    transition: all 0.2s ease;
                }

                .rc-card:hover .rc-category-badge {
                    background-color: #e0e7ff;
                    color: #4338ca;
                }

                @media (max-width: 900px) {
                    .rc-prod-rating,
                    .rc-category-badge,
                    .rc-fav-btn,
                    .rc-play-overlay {
                        display: none !important;
                    }
                }

                .rc-video-hover {
                    opacity: 0;
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .rc-card:hover .rc-video-hover {
                    opacity: 1;
                }

                @keyframes attract-pulse {
                    0%, 100% {
                        transform: scale(1);
                        box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.1), 0 2px 4px -1px rgba(16, 185, 129, 0.06);
                    }
                    50% {
                        transform: scale(1.02);
                        box-shadow: 0 16px 20px -5px rgba(16, 185, 129, 0.35), 0 8px 10px -5px rgba(16, 185, 129, 0.15);
                    }
                }

                .animate-attract {
                    animation: attract-pulse 2s infinite;
                }
            ` }} />

            {/* --- HEADER --- */}
            <header className={`store-header ${searchFocused ? 'is-searching' : ''}`}>
                <div className="store-header-top-row">
                    {/* Mobile Menu Icon */}
                    <button className="store-icon-btn mobile-only" onClick={() => setMobileSheetOpen(true)}>
                        <MenuIcon />
                    </button>

                    <a href="/" className="store-logo">
                        <img src="/logo.png" alt="Color Hut" width={140} height={44} style={{ objectFit: 'contain' }} />
                    </a>

                    {/* Desktop Categories */}
                    <div className="store-categories-container desktop-only" ref={catMenuRef}>
                        <button
                            className="store-categories-btn"
                            onClick={() => setCatMenuOpen(!catMenuOpen)}
                        >
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
                                                    const catImg = sub.icon || allProducts.find(p => Number(p.category_id) === Number(sub.id))?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(sub.name)}&background=f8f9fa&color=F1641E&size=200`;
                                                    return (
                                                        <a
                                                            key={sub.id}
                                                            href={`/${sub.id}/${sub.slug}/`}
                                                            className="mega-grid-card"
                                                            onClick={() => setCatMenuOpen(false)}
                                                        >
                                                            <div className="mega-card-image">
                                                                <img
                                                                    src={catImg}
                                                                    alt={sub.name}
                                                                />
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

                    {/* Search */}
                    <div className="store-search-bar" ref={searchBarRef}>
                        <input
                            type="text"
                            className="store-search-input"
                            placeholder="Search for anything"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setSearchFocused(true)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && searchQuery.trim()) {
                                    window.location.href = `/?q=${encodeURIComponent(searchQuery.trim())}`;
                                }
                            }}
                        />
                        <button
                            className="store-search-submit"
                            onClick={() => {
                                if (searchQuery.trim()) {
                                    window.location.href = `/?q=${encodeURIComponent(searchQuery.trim())}`;
                                }
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
                        <button
                            className="store-search-cancel"
                            onClick={(e) => {
                                e.preventDefault();
                                setSearchFocused(false);
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </header>
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

            {/* --- MAIN PAGE CONTENT --- */}
            <main className="max-w-[1400px] mx-auto px-6 md:px-10 pt-5 pb-8 md:pt-8 md:pb-12">
                {/* Breadcrumbs */}
                <nav id="breadcrumb-nav"
                    className="flex items-center gap-2 text-xs md:text-sm font-bold uppercase tracking-widest text-slate-400 mb-8 overflow-x-auto whitespace-nowrap scrollbar-hide">
                    <a href="#"
                        onClick={(e) => { e.preventDefault(); if (typeof window !== 'undefined') window.history.back(); }}
                        className="mr-2 p-1 -ml-1 text-slate-400 hover:text-orange-500 transition-colors" title="Go Back">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M10 19l-7-7m0 0l7-7m-7 7h18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </a>
                    <div className="h-4 w-px bg-slate-300 mx-2"></div>
                    <a href="/" className="hover:text-orange-500 transition-colors">Home</a>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M9 5l7 7-7 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-slate-400">{product.category_name || 'Uncategorized'}</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M9 5l7 7-7 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-orange-500">{product.name}</span>
                </nav>

                <div className="flex flex-col lg:flex-row gap-10 lg:gap-14 mb-12">
                    {/* Gallery Section */}
                    <div className="w-full lg:w-[560px] xl:w-[620px] shrink-0 flex flex-col gap-4">
                        {/* Main Active Media */}
                        <div className="w-full aspect-square relative group rounded-2xl md:rounded-3xl overflow-hidden bg-white shadow-xs border border-slate-200/80 flex items-center justify-center">
                            {galleryItems.length > 1 && (
                                <div className="absolute top-4 right-4 bg-slate-900/75 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white z-20 shadow-sm tracking-wider">
                                    {currentMediaIndex + 1} / {galleryItems.length}
                                </div>
                            )}

                            <div className="w-full h-full relative overflow-hidden flex items-center justify-center p-2">
                                {renderActiveMedia()}
                            </div>

                            {galleryItems.length > 1 && (
                                <>
                                    <button
                                        onClick={prevMedia}
                                        aria-label="Previous image"
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white text-slate-700 hover:text-orange-600 rounded-full flex items-center justify-center shadow-md border border-slate-200/80 transition-all opacity-0 group-hover:opacity-100 z-20 active:scale-95 cursor-pointer"
                                    >
                                        <LucideChevronLeft className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={nextMedia}
                                        aria-label="Next image"
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white text-slate-700 hover:text-orange-600 rounded-full flex items-center justify-center shadow-md border border-slate-200/80 transition-all opacity-0 group-hover:opacity-100 z-20 active:scale-95 cursor-pointer"
                                    >
                                        <LucideChevronRight className="w-5 h-5" />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Horizontal Thumbnails Row (below main image) */}
                        {galleryItems.length > 1 && (
                            <div className="flex gap-3 overflow-x-auto scrollbar-hide py-1 px-0.5">
                                {galleryItems.map((item, idx) => {
                                    const isActive = idx === currentMediaIndex;
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => switchMedia(idx)}
                                            className={`relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all bg-white cursor-pointer ${
                                                isActive
                                                    ? 'border-orange-500 shadow-md ring-2 ring-orange-500/20 scale-102'
                                                    : 'border-slate-200/80 hover:border-slate-300 opacity-70 hover:opacity-100'
                                            }`}
                                        >
                                            {item.type === 'video' ? (
                                                <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                                                    <div className="w-7 h-7 rounded-full bg-white/95 flex items-center justify-center text-orange-600 shadow-sm">
                                                        <svg className="w-3.5 h-3.5 fill-current ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                                    </div>
                                                </div>
                                            ) : (
                                                <img src={getThumb(item.src)} className="w-full h-full object-contain p-1" alt={`Thumbnail ${idx + 1}`} />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Buy Box / Details Section */}
                    <div className="flex-1 flex flex-col justify-start">
                        {/* Product Title */}
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight mb-2.5">
                            {product.name}
                        </h1>

                        {/* Rating & Stock Status */}
                        <div className="flex items-center gap-3 mb-5 flex-wrap">
                            <div className="flex items-center gap-1.5">
                                <div className="flex items-center text-amber-400">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                                    ))}
                                </div>
                                <span className="text-sm font-bold text-slate-800">5.0</span>
                                <span className="text-xs text-slate-400 font-medium">(48 reviews)</span>
                            </div>
                            <span className="text-slate-300">•</span>
                            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <span>In Stock • Ready to Dispatch</span>
                            </div>
                        </div>

                        {/* Price & Quantity Row */}
                        <div className="py-4 my-2 border-y border-slate-100">
                            <div className="flex items-end justify-between gap-4 flex-wrap">
                                <div>
                                    <div className="flex items-baseline gap-2">
                                        {Number(product.price) > 0 ? (
                                            <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                                                ৳{Number(product.price).toLocaleString()}
                                            </span>
                                        ) : (
                                            <span className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
                                                Custom Order
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">
                                        {Number(product.price) > 0
                                            ? 'Tax included • Nationwide express delivery available'
                                            : 'Custom sizing & specifications available • Contact on WhatsApp'}
                                    </p>
                                </div>

                                {/* Quantity Selector */}
                                {Boolean(product.allow_buy_now && product.price) && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Qty:</span>
                                        <div className="flex items-center border border-slate-200 rounded-xl bg-white shadow-xs p-0.5">
                                            <button
                                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                                disabled={quantity <= 1}
                                                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-orange-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
                                                aria-label="Decrease quantity"
                                            >
                                                <Minus className="w-3.5 h-3.5" />
                                            </button>
                                            <span className="w-9 text-center font-black text-sm text-slate-800">{quantity}</span>
                                            <button
                                                onClick={() => setQuantity(q => q + 1)}
                                                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-orange-600 hover:bg-slate-100 transition-colors cursor-pointer"
                                                aria-label="Increase quantity"
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Primary Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 my-5">
                            {Boolean(product.allow_buy_now && product.price) && (
                                <a
                                    href={`/checkout/?product=${product.id}&qty=${quantity}`}
                                    className="flex-1 min-w-[190px] bg-[#ea580c] hover:bg-[#c2410c] text-white px-6 py-4 rounded-xl text-base font-extrabold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:scale-98 transition-all flex items-center justify-center gap-2.5 text-center cursor-pointer"
                                >
                                    <ShoppingBag className="w-5 h-5 text-white" />
                                    <span>Buy Now</span>
                                </a>
                            )}

                            <button
                                onClick={inquireWhatsApp}
                                className="flex-1 min-w-[190px] bg-[#25D366] hover:bg-[#20bd5a] text-white px-6 py-4 rounded-xl text-base font-extrabold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35 hover:-translate-y-0.5 active:scale-98 transition-all flex items-center justify-center gap-2 group cursor-pointer"
                            >
                                <WhatsAppIcon />
                                <span>Order via WhatsApp</span>
                            </button>

                            <div className="flex gap-2 justify-center sm:justify-start">
                                <button
                                    onClick={() => setIsWishlisted(!isWishlisted)}
                                    className={`p-4 rounded-xl border transition-all active:scale-95 cursor-pointer ${
                                        isWishlisted
                                            ? 'bg-rose-50 border-rose-200 text-rose-600'
                                            : 'bg-white border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-slate-50'
                                    }`}
                                    title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                                    aria-label="Wishlist"
                                >
                                    <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                                </button>
                                <button
                                    onClick={shareProduct}
                                    className="p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-all active:scale-95 cursor-pointer"
                                    title="Share Product"
                                    aria-label="Share"
                                >
                                    <Share2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Professional Trust Badges */}
                        <div className="grid grid-cols-2 gap-2.5 my-4">
                            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50/80 border border-slate-100">
                                <div className="w-8 h-8 rounded-lg bg-orange-100/70 text-orange-600 flex items-center justify-center shrink-0">
                                    <FaShieldHalved className="w-4 h-4 text-orange-600" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-900 truncate">100% Authentic</p>
                                    <p className="text-[11px] text-slate-500 truncate">Studio verified quality</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50/80 border border-slate-100">
                                <div className="w-8 h-8 rounded-lg bg-orange-100/70 text-orange-600 flex items-center justify-center shrink-0">
                                    <FaTruckFast className="w-4 h-4 text-orange-600" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-900 truncate">Fast Delivery</p>
                                    <p className="text-[11px] text-slate-500 truncate">24-48h inside Dhaka</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50/80 border border-slate-100">
                                <div className="w-8 h-8 rounded-lg bg-orange-100/70 text-orange-600 flex items-center justify-center shrink-0">
                                    <FaBoxesPacking className="w-4 h-4 text-orange-600" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-900 truncate">Safe Packaging</p>
                                    <p className="text-[11px] text-slate-500 truncate">Multi-layer bubble wrap</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50/80 border border-slate-100">
                                <div className="w-8 h-8 rounded-lg bg-orange-100/70 text-orange-600 flex items-center justify-center shrink-0">
                                    <FaHeadset className="w-4 h-4 text-orange-600" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-900 truncate">Direct Support</p>
                                    <p className="text-[11px] text-slate-500 truncate">Instant WhatsApp help</p>
                                </div>
                            </div>
                        </div>

                        {/* Recommended Product Suggestion in Buy Box */}
                        
                    </div>
                </div>

                

                {/* Product Information Tabs Section */}
                <section className="my-10 bg-white rounded-2xl md:rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
                    {/* Tab Navigation */}
                    <div className="flex border-b border-slate-200 overflow-x-auto scrollbar-hide bg-slate-50/50">
                        <button
                            onClick={() => setActiveTab('description')}
                            className={`px-6 py-4 text-sm font-extrabold tracking-wide uppercase flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                                activeTab === 'description'
                                    ? 'border-orange-500 text-orange-600 bg-white'
                                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
                            }`}
                        >
                            <FileText className="w-4 h-4" />
                            <span>Description</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('specs')}
                            className={`px-6 py-4 text-sm font-extrabold tracking-wide uppercase flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                                activeTab === 'specs'
                                    ? 'border-orange-500 text-orange-600 bg-white'
                                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
                            }`}
                        >
                            <ListCheck className="w-4 h-4" />
                            <span>Features & Specifications</span>
                        </button>

                        <button
                            onClick={() => setActiveTab('shipping')}
                            className={`px-6 py-4 text-sm font-extrabold tracking-wide uppercase flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                                activeTab === 'shipping'
                                    ? 'border-orange-500 text-orange-600 bg-white'
                                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
                            }`}
                        >
                            <FaTruckFast className="w-4 h-4" />
                            <span>Shipping & Delivery</span>
                        </button>
                    </div>

                    {/* Tab Contents */}
                    <div className="p-6 md:p-8">
                        {activeTab === 'description' && (
                            <div className="max-w-4xl">
                                <div
                                    className="markdown-content text-base md:text-[17px] text-slate-600 leading-relaxed font-medium"
                                    dangerouslySetInnerHTML={{
                                        __html: parseMarkdownDescription(product.description || 'This premium design is part of our curated studio collection.')
                                    }}
                                />
                            </div>
                        )}

                        {activeTab === 'specs' && (
                            <div className="max-w-3xl">
                                <h3 className="text-lg font-black text-slate-900 mb-4">Product Specifications</h3>
                                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-200">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 p-3.5 bg-slate-50/60 text-sm">
                                        <span className="font-bold text-slate-700">Product SKU</span>
                                        <span className="sm:col-span-2 text-slate-600 font-mono">PROD-{product.id}</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 p-3.5 bg-white text-sm">
                                        <span className="font-bold text-slate-700">Category</span>
                                        <span className="sm:col-span-2 text-slate-600">{product.category_name || 'Design & Accessories'}</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 p-3.5 bg-slate-50/60 text-sm">
                                        <span className="font-bold text-slate-700">Brand / Studio</span>
                                        <span className="sm:col-span-2 text-slate-600">Color Hut Studio</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 p-3.5 bg-white text-sm">
                                        <span className="font-bold text-slate-700">Availability</span>
                                        <span className="sm:col-span-2 text-emerald-600 font-bold">In Stock • Ready to Dispatch</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 p-3.5 bg-slate-50/60 text-sm">
                                        <span className="font-bold text-slate-700">Customization</span>
                                        <span className="sm:col-span-2 text-slate-600">Custom sizing & specifications available upon request via WhatsApp</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 p-3.5 bg-white text-sm">
                                        <span className="font-bold text-slate-700">Country of Origin</span>
                                        <span className="sm:col-span-2 text-slate-600">Bangladesh</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'shipping' && (
                            <div className="max-w-3xl space-y-6">
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 mb-2">Delivery Timeframe & Rates</h3>
                                    <p className="text-sm text-slate-600 leading-relaxed mb-4">
                                        We deliver nationwide across Bangladesh using trusted courier partners including Steadfast, SA Paribahan, and Sundarban Courier.
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                                            <span className="text-xs font-bold uppercase tracking-wider text-orange-600 block mb-1">Inside Dhaka Metro</span>
                                            <span className="text-base font-extrabold text-slate-900 block">24 – 48 Hours</span>
                                            <span className="text-xs text-slate-500 font-medium">Standard home delivery</span>
                                        </div>
                                        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                                            <span className="text-xs font-bold uppercase tracking-wider text-orange-600 block mb-1">Outside Dhaka Metro</span>
                                            <span className="text-base font-extrabold text-slate-900 block">2 – 4 Business Days</span>
                                            <span className="text-xs text-slate-500 font-medium">District & Thana level express courier</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-200">
                                    <h4 className="text-sm font-black text-slate-900 mb-2">Safe Packaging Guarantee</h4>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        Every order is securely wrapped with multi-layered protective bubble wrap and packaged in heavy-duty cardboard boxes to ensure zero damage during transit.
                                    </p>
                                </div>

                                <div className="pt-4 border-t border-slate-200">
                                    <h4 className="text-sm font-black text-slate-900 mb-2">Payment Methods</h4>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        We accept Cash on Delivery (COD), bKash, Nagad, and direct bank transfer.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </section>



                {/* Recommended or Similar Products Section (Directly after main product) */}
                {related.length > 0 && (
                    <section id="recommended-products" className="my-10 pt-8 border-t border-slate-200/80">
                        <div className="mb-6 flex items-end justify-between flex-wrap gap-4">
                            <div>
                                <span className="text-xs font-black uppercase tracking-widest text-orange-600 block mb-1">
                                    Curated For You
                                </span>
                                <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
                                    Recommended & Similar Products
                                </h2>
                                <p className="text-xs md:text-sm text-slate-500 mt-1 font-medium">
                                    Complementary items and top studio designs you may also like
                                </p>
                            </div>
                            {product.category_id && (
                                <a
                                    href={`/${product.category_id}/${product.category_name?.toLowerCase().replace(/\s+/g, '-')}/`}
                                    className="text-xs md:text-sm font-extrabold text-orange-600 hover:text-orange-700 flex items-center gap-1 hover:underline"
                                >
                                    <span>Browse more {product.category_name}</span>
                                    <LucideChevronRight className="w-4 h-4" />
                                </a>
                            )}
                        </div>
                        <div className="related-store-grid">
                            {related.map((item, idx) => (
                                <RelatedCard key={item.id} item={item} idx={idx} />
                            ))}
                        </div>
                    </section>
                )}




            </main>

            {/* --- FOOTER --- */}
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

            {/* Link Copied Toast Notification */}
            {showCopiedToast && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-md text-white font-extrabold text-[10px] md:text-xs uppercase tracking-widest px-6 py-4 rounded-full shadow-2xl border border-slate-800 z-[1000] flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    <span>Link copied to clipboard!</span>
                </div>
            )}
        </div>
    );
}
