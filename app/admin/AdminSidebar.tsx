'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  Users,
  Ticket,
  ArrowLeftRight,
  CreditCard,
  BarChart2,
  Zap,
  FolderTree,
  Calendar,
  MessageSquare,
  Settings,
  Globe,
  UserCog,
  HeartHandshake,
  Store,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface TooltipState {
  name: string;
  left: number;
  top: number;
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [adminUser, setAdminUser] = useState<{ name: string; email: string }>({
    name: 'Admin User',
    email: 'admin@colorhut.com'
  });

  useEffect(() => {
    const saved = localStorage.getItem('adminSidebarCollapsed');
    if (saved !== null) {
      setCollapsed(saved === 'true');
    }

    fetch('/api/admin/profile')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data && data.name) {
          setAdminUser({ name: data.name, email: data.email });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const toggleCollapse = () => {
    setCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('adminSidebarCollapsed', String(next));
      return next;
    });
  };

  const showTooltip = (name: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!collapsed || mobileOpen) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({ name, left: rect.right + 14, top: rect.top + rect.height / 2 });
  };

  const menuItems: NavItem[] = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutGrid },
    { name: 'eStore Users', href: '/admin/customers', icon: Users },
    { name: 'Coupons', href: '/admin/coupons', icon: Ticket, badge: 'Active' },
    { name: 'Orders', href: '/admin/orders', icon: ArrowLeftRight, badge: 'Live' },
    { name: 'Payments', href: '/admin/payments', icon: CreditCard },
    { name: 'Analytics & Leads', href: '/admin/pixel-traffic', icon: BarChart2 },
    { name: 'Quick Manager', href: '/admin/products', icon: Zap },
    { name: 'Categories', href: '/admin/categories', icon: FolderTree },
    { name: 'Consultations', href: '/admin/meeting-requests', icon: Calendar },
    { name: 'Responses', href: '/admin/responses', icon: MessageSquare }
  ];

  const accountItems: NavItem[] = [
    { name: 'Settings', href: '/admin/settings', icon: Settings },
    { name: 'SEO & Social', href: '/admin/seo', icon: Globe },
    { name: 'Manage Users', href: '/admin/manage-users', icon: UserCog },
    { name: 'Testimonials', href: '/admin/testimonials', icon: HeartHandshake }
  ];

  const isActive = (href: string) => {
    if (href === '/admin/dashboard') {
      return pathname === '/admin/dashboard' || pathname === '/admin';
    }
    return pathname?.startsWith(href);
  };

  const handleLogout = () => {
    window.location.href = '/admin/logout';
  };

  const brandMark = (
    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-md shadow-orange-500/25 ring-1 ring-white/10 shrink-0">
      <Store className="w-4 h-4 text-white" />
    </div>
  );

  const renderItems = (items: NavItem[]) => (
    <div className="space-y-1">
      {items.map(item => {
        const active = isActive(item.href);
        const Icon = item.icon;
        return (
          <div key={item.name} className="relative">
            <a
              href={item.href}
              onMouseEnter={showTooltip(item.name)}
              onMouseLeave={() => setTooltip(null)}
              className={`group relative flex items-center rounded-xl transition-all duration-150 text-[13px] font-medium px-3 py-2 w-full gap-3
                ${collapsed ? 'md:w-10 md:h-10 md:px-0 md:py-0 md:gap-0 md:justify-center md:mx-auto' : ''}
                ${
                  active
                    ? 'bg-gradient-to-r from-orange-500/[0.16] to-orange-500/[0.04] text-white font-semibold border border-orange-500/20'
                    : 'text-[#94A3B8] hover:text-white hover:bg-white/[0.05] border border-transparent'
                }
              `}
            >
              {active && (
                <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.7)] ${collapsed ? 'md:-left-[5px]' : ''}`} />
              )}
              <Icon className={`w-[18px] h-[18px] shrink-0 transition-colors ${active ? 'text-orange-400' : 'text-[#8592A6] group-hover:text-slate-200'}`} />

              <span className={`truncate flex-1 tracking-tight text-slate-200 ${collapsed ? 'md:hidden' : ''}`}>
                {item.name}
              </span>

              {item.badge && (
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-white/[0.08] text-slate-300 border border-white/[0.06] shrink-0 ${collapsed ? 'md:hidden' : ''}`}>
                  {item.badge}
                </span>
              )}
            </a>
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Floating hamburger — mobile only */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-3.5 left-4 z-[35] md:hidden w-10 h-10 rounded-xl bg-white border border-slate-200/80 shadow-md shadow-slate-900/5 text-slate-600 flex items-center justify-center active:scale-95 transition-transform"
        aria-label="Open admin menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile drawer backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        onMouseLeave={() => setTooltip(null)}
        className={`z-50 flex flex-col shrink-0 select-none bg-[#0C101A] border border-white/[0.08]
          transition-[transform,width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
          fixed inset-y-0 left-0 w-[264px] h-screen rounded-none my-0 ml-0
          md:relative md:translate-x-0 md:my-3 md:ml-3 md:h-[calc(100vh-24px)] md:rounded-[26px] md:shadow-[0_12px_40px_rgba(0,0,0,0.45)]
          ${mobileOpen ? 'translate-x-0 shadow-[0_12px_40px_rgba(0,0,0,0.45)]' : '-translate-x-full'}
          ${collapsed ? 'md:w-[68px]' : 'md:w-[240px]'}
        `}
      >
        {/* Brand header — expanded (always used on mobile drawer) */}
        <div className={`h-16 flex items-center border-b border-white/[0.06] shrink-0 px-4 ${collapsed ? 'md:hidden' : ''}`}>
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {brandMark}
            <div className="min-w-0">
              <p className="text-[14px] font-bold text-white leading-tight truncate">Color Hut</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Admin Panel</p>
            </div>
          </div>

          {/* Desktop collapse toggle */}
          <button
            onClick={toggleCollapse}
            className="hidden md:flex w-7 h-7 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.08] items-center justify-center transition-colors shrink-0"
            title="Hide sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Mobile drawer close */}
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden w-8 h-8 rounded-lg bg-white/[0.06] text-slate-300 flex items-center justify-center shrink-0"
            aria-label="Close admin menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Brand header — collapsed rail (desktop only) */}
        <div className={`hidden h-16 items-center justify-center border-b border-white/[0.06] shrink-0 ${collapsed ? 'md:flex' : ''}`}>
          {brandMark}
        </div>

        {/* Floating edge expand toggle — collapsed rail only */}
        {collapsed && (
          <button
            onClick={toggleCollapse}
            title="Show sidebar"
            className="hidden md:flex absolute -right-3 top-[76px] z-50 w-6 h-6 rounded-full bg-[#151B29] border border-white/15 text-slate-400 items-center justify-center shadow-lg hover:bg-orange-500 hover:border-orange-500 hover:text-white transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-5 custom-dark-scrollbar">
          <div>
            <p className={`text-[11px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-2 ${collapsed ? 'md:hidden' : ''}`}>
              Menu
            </p>
            <div className={`hidden ${collapsed ? 'md:block' : ''} w-4 h-[1px] bg-white/[0.1] mx-auto mb-2`} />
            {renderItems(menuItems)}
          </div>

          <div className="pt-3 border-t border-white/[0.06]">
            <p className={`text-[11px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-2 ${collapsed ? 'md:hidden' : ''}`}>
              Account
            </p>
            <div className={`hidden ${collapsed ? 'md:block' : ''} w-4 h-[1px] bg-white/[0.1] mx-auto mb-2`} />
            {renderItems(accountItems)}
          </div>
        </div>

        {/* Bottom Profile Footer */}
        <div className="p-2 border-t border-white/[0.06]">
          <div className={`flex items-center justify-between p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-colors ${collapsed ? 'md:hidden' : ''}`}>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative shrink-0">
                <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center border border-white/10">
                  {adminUser.name.slice(0, 1).toUpperCase()}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#0C101A] rounded-full" />
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-white truncate leading-tight">
                  {adminUser.name}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  Admin
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className={`hidden ${collapsed ? 'md:flex' : ''} justify-center py-1`}>
            <button
              onClick={handleLogout}
              className="relative group cursor-pointer"
              title="Sign Out"
            >
              <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center border border-white/10 hover:border-rose-400 transition-colors">
                {adminUser.name.slice(0, 1).toUpperCase()}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#0C101A] rounded-full" />
            </button>
          </div>
        </div>
      </aside>

      {/* Floating tooltip for collapsed desktop rail */}
      {collapsed && tooltip && (
        <div
          className="fixed z-[70] -translate-y-1/2 flex items-center pointer-events-none"
          style={{ left: tooltip.left, top: tooltip.top }}
        >
          <span className="w-1.5 h-1.5 rotate-45 bg-[#141A28] border-l border-b border-white/15 -mr-[4.5px]" />
          <div className="px-2.5 py-1.5 rounded-lg bg-[#141A28] border border-white/15 text-white shadow-xl text-[12px] font-medium whitespace-nowrap">
            {tooltip.name}
          </div>
        </div>
      )}
    </>
  );
}
