'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '../AdminSidebar';
import {
  UserCog,
  Plus,
  Shield,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  Trash2,
  Edit2,
  X,
  Lock,
  Mail,
  User,
  AlertCircle
} from 'lucide-react';

interface StaffUser {
  id: number;
  name: string;
  email: string;
  role: string;
  access_permissions: string;
  permissions: string[];
  status: string;
  created_at: string;
}

const SECTION_OPTIONS = [
  { id: 'dashboard', label: 'Dashboard & Metrics', desc: 'View revenue, traffic and store stats' },
  { id: 'products', label: 'Products & Categories', desc: 'Create, edit & manage catalog inventory' },
  { id: 'orders', label: 'Orders & Payments', desc: 'Process live orders & view transactions' },
  { id: 'consultations', label: 'Consultations & Inquiries', desc: 'Manage meeting requests & client quotes' },
  { id: 'settings', label: 'Store Settings & SEO', desc: 'Configure metadata, keywords & store profile' },
];

export default function ManageUsersAdminPage() {
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffUser | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'manager',
    permissions: ['products', 'orders']
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchStaff = () => {
    setLoading(true);
    fetch('/api/admin/staff')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setStaffList(data);
      })
      .catch(() => showToast('Failed to load staff list', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const openCreateModal = () => {
    setEditingStaff(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'manager',
      permissions: ['products', 'orders', 'consultations']
    });
    setIsModalOpen(true);
  };

  const openEditModal = (staff: StaffUser) => {
    setEditingStaff(staff);
    let perms = staff.permissions || [];
    if (perms.includes('all')) {
      perms = SECTION_OPTIONS.map(s => s.id);
    }
    setFormData({
      name: staff.name,
      email: staff.email,
      password: '',
      role: staff.role,
      permissions: perms
    });
    setIsModalOpen(true);
  };

  const handleTogglePermission = (permId: string) => {
    setFormData(prev => {
      const exists = prev.permissions.includes(permId);
      const next = exists
        ? prev.permissions.filter(p => p !== permId)
        : [...prev.permissions, permId];
      return { ...prev, permissions: next };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      showToast('Name and email are required', 'error');
      return;
    }
    if (!editingStaff && !formData.password) {
      showToast('Password is required for new staff', 'error');
      return;
    }

    try {
      const url = editingStaff ? `/api/admin/staff/${editingStaff.id}` : '/api/admin/staff';
      const method = editingStaff ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (res.ok) {
        showToast(editingStaff ? 'Staff member updated!' : 'New staff member added!');
        setIsModalOpen(false);
        fetchStaff();
      } else {
        showToast(data.error || 'Failed to save staff user', 'error');
      }
    } catch {
      showToast('Something went wrong. Please try again.', 'error');
    }
  };

  const handleDeleteStaff = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to remove staff member "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/staff/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        showToast(`Staff member "${name}" removed`);
        fetchStaff();
      } else {
        showToast(data.error || 'Cannot remove user', 'error');
      }
    } catch {
      showToast('Error removing staff user', 'error');
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">
      <AdminSidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-[68px] border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-30">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
              <UserCog className="w-5 h-5 text-orange-500" />
              Manage Staff & Store Roles
            </h1>
            <p className="text-xs text-slate-500 font-medium">Add maintainers, assign sectional access, and configure store permissions</p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-sm font-semibold transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Store Maintainer
          </button>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Maintainers</span>
              <p className="text-3xl font-black text-slate-900 mt-2">{staffList.length}</p>
              <p className="text-xs text-slate-500 mt-1">Users with backend store access</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Access Control</span>
              <p className="text-3xl font-black text-orange-600 mt-2">Section-Level</p>
              <p className="text-xs text-slate-500 mt-1">Granular permissions enabled</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Security</span>
              <p className="text-3xl font-black text-emerald-600 mt-2">Bcrypt Shield</p>
              <p className="text-xs text-slate-500 mt-1">Encrypted password credentials</p>
            </div>
          </div>

          {/* Staff Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-900 text-sm">Store Maintainers & Access Roles</h2>
            </div>
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3.5 px-6">Maintainer</th>
                  <th className="py-3.5 px-6">Email / Login</th>
                  <th className="py-3.5 px-6">Assigned Role</th>
                  <th className="py-3.5 px-6">Section Access</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">Loading maintainers...</td>
                  </tr>
                ) : staffList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">No staff members found.</td>
                  </tr>
                ) : (
                  staffList.map(s => {
                    const isRoot = s.id === 1;
                    const perms = s.permissions || [];
                    const isAll = perms.includes('all');

                    return (
                      <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                              {s.name ? s.name.slice(0, 2).toUpperCase() : 'ST'}
                            </div>
                            <div>
                              <span className="font-semibold text-slate-900 block">{s.name}</span>
                              {isRoot && (
                                <span className="text-[10px] text-orange-600 font-bold uppercase tracking-wider">
                                  Primary Root Admin
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-mono text-xs text-slate-700">{s.email}</td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            s.role === 'admin'
                              ? 'bg-orange-500/10 text-orange-600 border border-orange-500/20'
                              : 'bg-indigo-500/10 text-indigo-600 border border-indigo-500/20'
                          }`}>
                            <Shield className="w-3 h-3" />
                            {s.role === 'admin' ? 'Administrator' : s.role === 'manager' ? 'Store Manager' : s.role}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {isAll ? (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
                                Full Store Access
                              </span>
                            ) : perms.length === 0 ? (
                              <span className="text-slate-400 text-xs">No section assigned</span>
                            ) : (
                              perms.map(p => (
                                <span key={p} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200 capitalize">
                                  {p}
                                </span>
                              ))
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(s)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                              title="Edit permissions"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            {!isRoot && (
                              <button
                                onClick={() => handleDeleteStaff(s.id, s.name)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Remove staff"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Add/Edit Staff Maintainer */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl max-w-lg w-full p-7 shadow-2xl border border-slate-200 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {editingStaff ? 'Edit Store Maintainer' : 'Add New Store Maintainer'}
                  </h2>
                  <p className="text-xs text-slate-500">Configure role and section-specific access permissions</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Maintainer Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tanmoy Roy"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Email Address (Login ID)
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="manager@colorhut.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    {editingStaff ? 'Change Password (Leave blank to keep current)' : 'Password'}
                  </label>
                  <input
                    type="password"
                    required={!editingStaff}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Assigned Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-500"
                  >
                    <option value="manager">Store Manager (Operations)</option>
                    <option value="editor">Catalog & Product Specialist</option>
                    <option value="staff">Order & Support Staff</option>
                    <option value="admin">Co-Administrator (Full Access)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Section Access Permissions
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {SECTION_OPTIONS.map(opt => {
                      const isChecked = formData.permissions.includes(opt.id);
                      return (
                        <div
                          key={opt.id}
                          onClick={() => handleTogglePermission(opt.id)}
                          className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                            isChecked
                              ? 'bg-orange-500/5 border-orange-500/30'
                              : 'bg-slate-50 border-slate-200 hover:bg-slate-100/60'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="mt-0.5 rounded text-orange-600 focus:ring-orange-500"
                          />
                          <div>
                            <span className="text-xs font-bold text-slate-800 block">{opt.label}</span>
                            <span className="text-[11px] text-slate-500">{opt.desc}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white font-semibold text-xs shadow-md transition-all cursor-pointer"
                  >
                    {editingStaff ? 'Update Maintainer' : 'Save Maintainer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div className={`fixed bottom-6 right-6 px-4 py-3 rounded-xl shadow-xl text-white text-xs font-semibold flex items-center gap-2 z-50 ${
            toast.type === 'error' ? 'bg-rose-600' : 'bg-slate-900'
          }`}>
            {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            {toast.message}
          </div>
        )}
      </main>
    </div>
  );
}
