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
    { name: 'Orders', href: '/admin/orders', icon: ArrowLeftRight, badge: 'Live' },
    { name: 'Payments', href: '/admin/payments', icon: CreditCard },
    { name: 'Quick Manager', href: '/admin/products', icon: Zap },
    { name: 'Categories', href: '/admin/categories', icon: FolderTree },
    { name: 'eStore Users', href: '/admin/customers', icon: Users },
    { name: 'Coupons', href: '/admin/coupons', icon: Ticket },
    { name: 'Analytics & Leads', href: '/admin/pixel-traffic', icon: BarChart2 },
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
    <div className="w-9 h-9 rounded-2xl bg-orange-600 text-white flex items-center justify-center shadow-md shadow-orange-500/25 shrink-0">
      <Store className="w-5 h-5 text-white" />
    </div>
  );

  const renderItems = (items: NavItem[]) => (
    <div className="space-y-1.5">
      {items.map(item => {
        const active = isActive(item.href);
        const Icon = item.icon;
        return (
          <div key={item.name} className="relative">
            <a
              href={item.href}
              onMouseEnter={showTooltip(item.name)}
              onMouseLeave={() => setTooltip(null)}
              className={`group relative flex items-center rounded-2xl transition-all duration-150 text-[13px] font-semibold px-3.5 py-2.5 w-full gap-3
                ${collapsed ? 'md:w-11 md:h-11 md:px-0 md:py-0 md:gap-0 md:justify-center md:mx-auto' : ''}
                ${
                  active
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }
              `}
            >
              <Icon className={`w-[18px] h-[18px] shrink-0 transition-colors ${active ? 'text-white' : 'text-slate-500 group-hover:text-slate-900'}`} />

              <span className={`truncate flex-1 tracking-tight ${collapsed ? 'md:hidden' : ''}`}>
                {item.name}
              </span>

              {item.badge && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                  active 
                    ? 'bg-white/20 text-white' 
                    : 'bg-orange-100 text-orange-700'
                } ${collapsed ? 'md:hidden' : ''}`}>
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
        className="fixed top-3.5 left-4 z-[35] md:hidden w-10 h-10 rounded-2xl bg-white border border-slate-200/90 shadow-md shadow-slate-900/5 text-slate-700 flex items-center justify-center active:scale-95 transition-transform"
        aria-label="Open admin menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile drawer backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        onMouseLeave={() => setTooltip(null)}
        className={`z-50 flex flex-col shrink-0 select-none bg-white border border-slate-200/80
          transition-[transform,width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
          fixed inset-y-0 left-0 w-[260px] h-screen rounded-none my-0 ml-0
          md:sticky md:top-3 md:self-start md:translate-x-0 md:my-3 md:ml-3 md:h-[calc(100vh-24px)] md:rounded-[28px] md:shadow-xs
          ${mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
          ${collapsed ? 'md:w-[76px]' : 'md:w-[245px]'}
        `}
      >
        {/* Brand header — expanded */}
        <div className={`h-18 flex items-center border-b border-slate-100 shrink-0 px-5 ${collapsed ? 'md:hidden' : ''}`}>
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {brandMark}
            <div className="min-w-0">
              <p className="text-[15px] font-black text-slate-900 leading-tight truncate tracking-tight">Color Hut</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Admin Panel</p>
            </div>
          </div>

          {/* Desktop collapse toggle */}
          <button
            onClick={toggleCollapse}
            className="hidden md:flex w-7 h-7 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 items-center justify-center transition-colors shrink-0 cursor-pointer"
            title="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Mobile drawer close */}
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 cursor-pointer"
            aria-label="Close admin menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Brand header — collapsed rail (desktop only) */}
        <div className={`hidden h-18 items-center justify-center border-b border-slate-100 shrink-0 ${collapsed ? 'md:flex' : ''}`}>
          {brandMark}
        </div>

        {/* Floating edge expand toggle — collapsed rail only */}
        {collapsed && (
          <button
            onClick={toggleCollapse}
            title="Expand sidebar"
            className="hidden md:flex absolute -right-3 top-[76px] z-50 w-6 h-6 rounded-full bg-white border border-slate-200 text-slate-600 items-center justify-center shadow-md hover:bg-orange-500 hover:border-orange-500 hover:text-white transition-colors cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 space-y-5">
          <div>
            <p className={`text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2 ${collapsed ? 'md:hidden' : ''}`}>
              Menu
            </p>
            <div className={`hidden ${collapsed ? 'md:block' : ''} w-4 h-[1px] bg-slate-200 mx-auto mb-2`} />
            {renderItems(menuItems)}
          </div>

          <div className="pt-3 border-t border-slate-100">
            <p className={`text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2 ${collapsed ? 'md:hidden' : ''}`}>
              Account
            </p>
            <div className={`hidden ${collapsed ? 'md:block' : ''} w-4 h-[1px] bg-slate-200 mx-auto mb-2`} />
            {renderItems(accountItems)}
          </div>
        </div>

        {/* Bottom Profile Footer */}
        <div className="p-3 border-t border-slate-100">
          <div className={`flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 border border-slate-200/70 hover:bg-slate-100/70 transition-colors ${collapsed ? 'md:hidden' : ''}`}>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative shrink-0">
                <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center border border-slate-200">
                  {adminUser.name.slice(0, 1).toUpperCase()}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-bold text-slate-900 truncate leading-tight">
                  {adminUser.name}
                </p>
                <p className="text-[10px] text-slate-500 truncate font-medium">
                  Store Admin
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <div className={`hidden ${collapsed ? 'md:flex' : ''} justify-center py-1`}>
            <button
              onClick={handleLogout}
              className="relative group cursor-pointer"
              title="Sign Out"
            >
              <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center border border-slate-200 group-hover:border-rose-400 transition-colors">
                {adminUser.name.slice(0, 1).toUpperCase()}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
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
          <span className="w-1.5 h-1.5 rotate-45 bg-slate-900 -mr-[4.5px]" />
          <div className="px-2.5 py-1.5 rounded-xl bg-slate-900 text-white shadow-xl text-[12px] font-bold whitespace-nowrap">
            {tooltip.name}
          </div>
        </div>
      )}
    </>
  );
}
