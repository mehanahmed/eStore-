'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UserLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await fetch('/api/user/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Login failed');
            } else {
                router.push('/');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #fff8f5 0%, #fff 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
        }}>
            <div style={{
                background: '#fff',
                borderRadius: '16px',
                boxShadow: '0 4px 32px rgba(241,100,30,0.10)',
                padding: '48px 40px',
                width: '100%',
                maxWidth: '420px',
            }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <a href="/">
                        <img src="/logo.png" alt="Color Hut" style={{ height: '48px', objectFit: 'contain' }} />
                    </a>
                </div>

                <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#1a1a1a', margin: '0 0 6px', textAlign: 'center' }}>
                    Sign In
                </h1>
                <p style={{ textAlign: 'center', color: '#666', marginBottom: '32px', fontSize: '15px' }}>
                    Welcome back to Color Hut
                </p>

                {error && (
                    <div style={{
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        color: '#dc2626',
                        borderRadius: '8px',
                        padding: '12px 16px',
                        marginBottom: '20px',
                        fontSize: '14px',
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '18px' }}>
                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', fontSize: '14px', color: '#374151' }}>
                            Email Address
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            style={{
                                width: '100%',
                                padding: '12px 14px',
                                border: '1.5px solid #e5e7eb',
                                borderRadius: '8px',
                                fontSize: '15px',
                                outline: 'none',
                                boxSizing: 'border-box',
                                transition: 'border-color 0.2s',
                            }}
                            onFocus={e => (e.target.style.borderColor = '#F1641E')}
                            onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
                        />
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', fontSize: '14px', color: '#374151' }}>
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            style={{
                                width: '100%',
                                padding: '12px 14px',
                                border: '1.5px solid #e5e7eb',
                                borderRadius: '8px',
                                fontSize: '15px',
                                outline: 'none',
                                boxSizing: 'border-box',
                                transition: 'border-color 0.2s',
                            }}
                            onFocus={e => (e.target.style.borderColor = '#F1641E')}
                            onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '13px',
                            background: loading ? '#f09060' : '#F1641E',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '16px',
                            fontWeight: 700,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'background 0.2s',
                        }}
                    >
                        {loading ? 'Signing in\u2026' : 'Sign In'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#6b7280' }}>
                    Don&apos;t have an account?{' '}
                    <a href="/register" style={{ color: '#F1641E', fontWeight: 600, textDecoration: 'none' }}>
                        Register
                    </a>
                </p>
            </div>
        </div>
    );
}
