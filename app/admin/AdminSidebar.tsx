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
  UserCog,
  HeartHandshake,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ShieldCheck
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
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

  const toggleCollapse = () => {
    setCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('adminSidebarCollapsed', String(next));
      return next;
    });
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
    { name: 'Settings', href: '/admin/seo', icon: Settings },
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

  return (
    <aside
      className={`relative z-40 my-3 ml-3 h-[calc(100vh-24px)] flex flex-col shrink-0 select-none rounded-[26px] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
        bg-[#0C101A] border border-white/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.45)]
        ${collapsed ? 'w-[64px]' : 'w-[235px]'}
      `}
    >
      {/* Top Header */}
      <div className={`h-[56px] flex items-center border-b border-white/[0.06] shrink-0 ${collapsed ? 'justify-center px-2' : 'justify-between px-4'}`}>
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-bold text-white tracking-tight font-sans">
              eStore
            </span>
            <span className="text-[10px] font-semibold text-slate-400 bg-white/[0.06] border border-white/[0.08] px-1.5 py-0.5 rounded-md">
              Admin
            </span>
          </div>
        ) : null}

        {/* Minimal circular collapse toggle button */}
        <button
          onClick={toggleCollapse}
          className="w-7 h-7 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          title={collapsed ? 'Expand menu' : 'Collapse menu'}
        >
          {collapsed ? (
            <ChevronRight className="w-3.5 h-3.5" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-4 custom-dark-scrollbar">
        {/* SECTION: MENU */}
        <div>
          {!collapsed ? (
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-1.5">
              Menu
            </p>
          ) : (
            <div className="w-4 h-[1px] bg-white/[0.1] mx-auto mb-2" />
          )}

          <div className="space-y-1">
            {menuItems.map(item => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <div key={item.name} className="relative group">
                  <a
                    href={item.href}
                    onMouseEnter={() => setHoveredItem(item.name)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={`flex items-center rounded-xl transition-all duration-150 text-[13px] font-medium
                      ${collapsed ? 'w-10 h-10 justify-center mx-auto' : 'px-3 py-2 w-full gap-3'}
                      ${
                        active
                          ? 'bg-white/[0.12] text-white font-semibold shadow-sm border border-white/[0.08]'
                          : 'text-[#94A3B8] hover:text-white hover:bg-white/[0.05]'
                      }
                    `}
                  >
                    <Icon className={`w-[18px] h-[18px] shrink-0 ${active ? 'text-white' : 'text-[#8592A6] group-hover:text-slate-200'}`} />

                    {!collapsed && (
                      <span className="truncate flex-1 tracking-tight text-slate-200">
                        {item.name}
                      </span>
                    )}

                    {!collapsed && item.badge && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-white/[0.08] text-slate-300 border border-white/[0.06] shrink-0">
                        {item.badge}
                      </span>
                    )}
                  </a>

                  {/* Clean Floating Tooltip when Collapsed */}
                  {collapsed && hoveredItem === item.name && (
                    <div className="fixed left-[84px] ml-1 px-2.5 py-1 rounded-lg bg-[#141A28] border border-white/15 text-white shadow-xl text-[12px] font-medium whitespace-nowrap z-50 pointer-events-none animate-in fade-in duration-100">
                      {item.name}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION: ACCOUNT */}
        <div className="pt-2 border-t border-white/[0.06]">
          {!collapsed ? (
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-1.5">
              Account
            </p>
          ) : (
            <div className="w-4 h-[1px] bg-white/[0.1] mx-auto mb-2" />
          )}

          <div className="space-y-1">
            {accountItems.map(item => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <div key={item.name} className="relative group">
                  <a
                    href={item.href}
                    onMouseEnter={() => setHoveredItem(item.name)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={`flex items-center rounded-xl transition-all duration-150 text-[13px] font-medium
                      ${collapsed ? 'w-10 h-10 justify-center mx-auto' : 'px-3 py-2 w-full gap-3'}
                      ${
                        active
                          ? 'bg-white/[0.12] text-white font-semibold shadow-sm border border-white/[0.08]'
                          : 'text-[#94A3B8] hover:text-white hover:bg-white/[0.05]'
                      }
                    `}
                  >
                    <Icon className={`w-[18px] h-[18px] shrink-0 ${active ? 'text-white' : 'text-[#8592A6] group-hover:text-slate-200'}`} />

                    {!collapsed && (
                      <span className="truncate flex-1 tracking-tight text-slate-200">
                        {item.name}
                      </span>
                    )}
                  </a>

                  {collapsed && hoveredItem === item.name && (
                    <div className="fixed left-[84px] ml-1 px-2.5 py-1 rounded-lg bg-[#141A28] border border-white/15 text-white shadow-xl text-[12px] font-medium whitespace-nowrap z-50 pointer-events-none animate-in fade-in duration-100">
                      {item.name}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Profile Footer */}
      <div className="p-2 border-t border-white/[0.06]">
        {!collapsed ? (
          <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-colors">
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
        ) : (
          <div className="flex justify-center py-1">
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
        )}
      </div>
    </aside>
  );
}
