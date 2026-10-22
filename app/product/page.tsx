'use client';

import React, { useEffect, useState, useRef } from 'react';
import HomeNavbar from '../HomeNavbar';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Flame,
  ShoppingBag, 
  Heart, 
  Eye, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  Clock, 
  Search,
  Star,
  CheckCircle2,
  PackageSearch
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { trackAddToCart, trackInitiateCheckout, trackViewContent } from '../lib/analytics';

interface ProductItem {
  id: number;
  name: string;
  slug: string;
  category_id?: string;
  category_name?: string;
  price?: number | string | null;
  allow_buy_now?: boolean | number | string | null;
  is_menu_product?: boolean | number | string | null;
  image?: string;
  video_url?: string;
  rating?: number;
  position?: number;
}

// === FOOTER ICONS ===
const InstagramIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
);

const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
);

const FooterYouTubeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.11 1 12 1 12s0 3.89.46 5.58a2.78 2.78 0 0 0 1.94 2c1.72.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.89 23 12 23 12s0-3.89-.46-5.58z"></path><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"></polygon></svg>
);

const PinterestIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.2 0 1.033.394 2.137.884 2.738.097.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.252 7.929-7.252 4.163 0 7.398 2.967 7.398 6.92 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592 0 11.985 0" /></svg>
);

const Footer = ({ socialLinks }: { socialLinks: { facebook: string; instagram: string; youtube: string; pinterest: string } }) => {
  return (
    <footer className="store-footer border-t border-slate-100 mt-auto bg-white py-12">
      <div className="store-footer-content max-w-7xl mx-auto px-4 md:px-8">
        <div className="store-footer-grid grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="store-footer-col">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-4">Shop</h3>
            <ul className="space-y-2.5 text-sm text-slate-500 font-medium">
              <li><a href="/all/" className="hover:text-slate-800">All Products</a></li>
              <li><a href="/hot-deals/" className="hover:text-slate-800">Hot Deals</a></li>
              <li><a href="/demo/" className="hover:text-slate-800">Video Demos</a></li>
            </ul>
          </div>
          <div className="store-footer-col">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-4">Categories</h3>
            <ul className="space-y-2.5 text-sm text-slate-500 font-medium">
              <li><a href="/restaurant/" className="hover:text-slate-800">Restaurant</a></li>
              <li><a href="/parlour/" className="hover:text-slate-800">Parlour</a></li>
              <li><a href="/interior/" className="hover:text-slate-800">Interior</a></li>
              <li><a href="/management/" className="hover:text-slate-800">Management</a></li>
            </ul>
          </div>
          <div className="store-footer-col">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-4">Support</h3>
            <ul className="space-y-2.5 text-sm text-slate-500 font-medium">
              <li><a href="/contact" className="hover:text-slate-800">Contact Us</a></li>
              <li><a href="/checkout" className="hover:text-slate-800">Track Order</a></li>
              <li><a href="/privacy" className="hover:text-slate-800">Privacy Policy</a></li>
            </ul>
          </div>
          <div className="store-footer-col">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-4">Connect</h3>
            <div className="flex items-center gap-3">
              {socialLinks.facebook && (
                <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-slate-50 hover:bg-orange-50 text-slate-600 hover:text-orange-600 flex items-center justify-center transition-colors">
                  <FacebookIcon />
                </a>
              )}
              {socialLinks.instagram && (
                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-slate-50 hover:bg-orange-50 text-slate-600 hover:text-orange-600 flex items-center justify-center transition-colors">
                  <InstagramIcon />
                </a>
              )}
              {socialLinks.youtube && (
                <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-slate-50 hover:bg-orange-50 text-slate-600 hover:text-orange-600 flex items-center justify-center transition-colors">
                  <FooterYouTubeIcon />
                </a>
              )}
              {socialLinks.pinterest && (
                <a href={socialLinks.pinterest} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-slate-50 hover:bg-orange-50 text-slate-600 hover:text-orange-600 flex items-center justify-center transition-colors">
                  <PinterestIcon />
                </a>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-4 font-medium">
              © {new Date().getFullYear()} Color Hut Studio. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

// === PRODUCT CARD COMPONENT ===
const ProductCard = ({ product }: { product: ProductItem }) => {
  const [hovered, setHovered] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Parse images
  let images: string[] = [];
  try {
    if (product.image) {
      if (product.image.startsWith('[')) {
        images = JSON.parse(product.image);
      } else {
        images = [product.image];
      }
    }
  } catch (e) {
    images = product.image ? [product.image] : [];
  }

  const formatImg = (url?: string) => {
    if (!url) return 'https://via.placeholder.com/400x320?text=Color+Hut';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    if (url.startsWith('/uploads/')) return url;
    if (url.startsWith('/')) return '/uploads' + url;
    return '/uploads/' + url;
  };

  const hasVideo = Boolean(product.video_url);
  const isBuyNow = Boolean(
    (product.allow_buy_now === 1 || product.allow_buy_now === true || product.allow_buy_now === '1') && product.price
  );

  const handleMouseEnter = () => {
    setHovered(true);
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const currentImage = formatImg(images[imgIndex] || images[0]);

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative flex flex-col bg-white border border-slate-200/90 rounded-2xl overflow-hidden hover:border-orange-500/60 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300"
    >
      {/* Product Image / Media Box */}
      <a href={`/p/${product.id}/${product.slug}`} className="relative aspect-4/3 overflow-hidden bg-slate-100 block">
        <img
          src={currentImage}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            hovered && hasVideo ? 'opacity-0' : 'opacity-100'
          }`}
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&background=f8fafc&color=64748b&size=400`;
          }}
        />

        {hasVideo && (
          <video
            ref={videoRef}
            src={product.video_url}
            muted
            playsInline
            loop
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              hovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          />
        )}

        {/* Hot Deal Tag */}
        <span className="absolute top-2.5 left-2.5 bg-rose-600 text-white font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
          <Flame className="w-3 h-3 fill-white text-white" />
          Hot Deal
        </span>

        {/* Category Badge */}
        {product.category_name && (
          <span className="absolute bottom-2.5 left-2.5 bg-white/90 backdrop-blur-xs text-slate-700 font-semibold text-[10px] px-2 py-0.5 rounded-md shadow-xs">
            {product.category_name}
          </span>
        )}
      </a>

      {/* Product Info */}
      <div className="flex flex-col flex-1 p-4">
        <a
          href={`/p/${product.id}/${product.slug}`}
          className="font-bold text-slate-900 text-sm md:text-base leading-snug line-clamp-2 hover:text-orange-600 transition-colors"
        >
          {product.name}
        </a>

        {/* Rating */}
        <div className="flex items-center gap-1 mt-1.5 text-amber-400">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
          ))}
          <span className="text-[11px] font-bold text-slate-500 ml-1">
            {product.rating ? Number(product.rating).toFixed(1) : '5.0'}
          </span>
        </div>

        {/* Price & Action Row */}
        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          {isBuyNow ? (
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Price</span>
              <span className="text-base font-black text-slate-900">
                ৳{Number(product.price).toLocaleString()}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Available for Order</span>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            {isBuyNow ? (
              <a
                href={`/checkout?productId=${product.id}`}
                onClick={() => {
                  trackAddToCart(product, 1);
                  trackInitiateCheckout([product], Number(product.price || 0));
                }}
                className="px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition-colors shadow-xs"
              >
                Buy Now
              </a>
            ) : (
              <a
                href={`/p/${product.id}/${product.slug}`}
                onClick={() => trackViewContent(product)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:border-orange-500 hover:text-orange-600 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1"
              >
                <span>View</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// === MAIN PAGE COMPONENT ===
export default function ProductMenuPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [menuProducts, setMenuProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [pageSearch, setPageSearch] = useState('');
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [socialLinks, setSocialLinks] = useState({
    facebook: '',
    instagram: '',
    youtube: '',
    pinterest: ''
  });

  useEffect(() => {
    // 1. Fetch categories
    fetch('/api/public/categories')
      .then(r => r.ok ? r.json() : [])
      .then(data => setCategories(data || []))
      .catch(() => {});

    // 2. Fetch all products for navbar search
    fetch('/api/public/products?limit=100')
      .then(r => r.ok ? r.json() : [])
      .then(data => setAllProducts(data || []))
      .catch(() => {});

    // 3. Fetch menu products
    fetch('/api/public/menu-products')
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        setMenuProducts(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch menu products:', err);
        setLoading(false);
      });

    // 4. Fetch site social config
    fetch('/api/public/config')
      .then(r => r.ok ? r.json() : null)
      .then(cfg => {
        if (cfg) {
          setSocialLinks({
            facebook: cfg.social_facebook || '',
            instagram: cfg.social_instagram || '',
            youtube: cfg.social_youtube || '',
            pinterest: cfg.social_pinterest || ''
          });
        }
      })
      .catch(() => {});
  }, []);

  // Filter products by in-page search
  const filteredProducts = menuProducts.filter(p => {
    if (!pageSearch.trim()) return true;
    const term = pageSearch.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      (p.category_name && p.category_name.toLowerCase().includes(term))
    );
  });

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between selection:bg-orange-500 selection:text-white">
      <div>
        {/* --- HEADER NAVBAR --- */}
        <HomeNavbar
          categories={categories}
          allProducts={allProducts}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          mobileSheetOpen={mobileSheetOpen}
          onMobileSheetOpen={() => setMobileSheetOpen(true)}
          onMobileSheetClose={() => setMobileSheetOpen(false)}
        />

        {/* --- HERO / BANNER SECTION --- */}
        <section className="bg-gradient-to-b from-rose-50/60 via-amber-50/30 to-white border-b border-slate-100 py-10 md:py-14">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100/90 border border-rose-200/90 text-rose-700 text-xs font-black uppercase tracking-wider mb-4">
                <Flame className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
                <span>Hot Deals & Special Offers</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Hot Deals & Selected Offers
              </h1>
              
              <p className="mt-3 text-slate-600 text-sm md:text-base font-medium leading-relaxed">
                Explore our exclusive hot deals, limited-time special discounts, and best-value packages for your business.
              </p>

              {/* Quick Search Toolbar */}
              <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={pageSearch}
                    onChange={(e) => setPageSearch(e.target.value)}
                    placeholder="Search in hot deals..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs md:text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 transition-all shadow-xs"
                  />
                  {pageSearch && (
                    <button
                      onClick={() => setPageSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="text-xs font-bold text-slate-500 self-start sm:self-center">
                  Showing <span className="text-slate-900 font-extrabold">{filteredProducts.length}</span> hot deals
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- PRODUCTS SECTION --- */}
        <main className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-14 min-h-[50vh]">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 animate-pulse">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-slate-100 rounded-2xl aspect-3/4"></div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-16 text-center max-w-md mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4 border border-rose-100">
                <Flame className="w-8 h-8 fill-rose-500 text-rose-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                {pageSearch ? 'No Matching Deals' : 'No Hot Deals Active Yet'}
              </h3>
              <p className="text-xs md:text-sm text-slate-500 leading-relaxed">
                {pageSearch
                  ? `No hot deals matched "${pageSearch}". Try a different search keyword.`
                  : 'Products selected by the store admin will appear here as Hot Deals. Check back soon!'}
              </p>
              {pageSearch && (
                <button
                  onClick={() => setPageSearch('')}
                  className="mt-4 px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition-colors shadow-xs"
                >
                  View All Hot Deals
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>

        {/* --- TRUST BANNER --- */}
        <section className="bg-slate-50/80 border-t border-slate-100 py-10">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-slate-200/60 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Premium Quality Guarantee</h4>
                  <p className="text-xs text-slate-500">Every design crafted with high standards</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-slate-200/60 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Fast Delivery Available</h4>
                  <p className="text-xs text-slate-500">Quick turnaround inside & outside Dhaka</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-slate-200/60 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Direct Expert Support</h4>
                  <p className="text-xs text-slate-500">Talk to our design team via WhatsApp anytime</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* --- FOOTER --- */}
      <Footer socialLinks={socialLinks} />
    </div>
  );
}
