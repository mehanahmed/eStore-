'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UserRegisterPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch('/api/user/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Registration failed');
            } else {
                router.push('/login');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '12px 14px',
        border: '1.5px solid #e5e7eb',
        borderRadius: '8px',
        fontSize: '15px',
        outline: 'none',
        boxSizing: 'border-box',
        transition: 'border-color 0.2s',
    };

    const labelStyle: React.CSSProperties = {
        display: 'block',
        fontWeight: 600,
        marginBottom: '6px',
        fontSize: '14px',
        color: '#374151',
    };

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
                    Create Account
                </h1>
                <p style={{ textAlign: 'center', color: '#666', marginBottom: '32px', fontSize: '15px' }}>
                    Join Color Hut today
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
                        <label style={labelStyle}>Full Name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Your full name"
                            style={inputStyle}
                            onFocus={e => (e.target.style.borderColor = '#F1641E')}
                            onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
                        />
                    </div>

                    <div style={{ marginBottom: '18px' }}>
                        <label style={labelStyle}>Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            style={inputStyle}
                            onFocus={e => (e.target.style.borderColor = '#F1641E')}
                            onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
                        />
                    </div>

                    <div style={{ marginBottom: '18px' }}>
                        <label style={labelStyle}>Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="At least 6 characters"
                            style={inputStyle}
                            onFocus={e => (e.target.style.borderColor = '#F1641E')}
                            onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
                        />
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={labelStyle}>Confirm Password</label>
                        <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            placeholder="Repeat your password"
                            style={inputStyle}
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
                        {loading ? 'Creating account\u2026' : 'Create Account'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#6b7280' }}>
                    Already have an account?{' '}
                    <a href="/login" style={{ color: '#F1641E', fontWeight: 600, textDecoration: 'none' }}>
                        Sign in
                    </a>
                </p>
            </div>
        </div>
    );
}
