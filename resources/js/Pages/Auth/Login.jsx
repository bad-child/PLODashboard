import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Login — PLO Dashboard Monitoring" />

            <div className="login-wrapper">
                {/* Animated background */}
                <div className="bg-orbs">
                    <div className="orb orb-1"></div>
                    <div className="orb orb-2"></div>
                    <div className="orb orb-3"></div>
                </div>

                {/* Card */}
                <div className="login-card">
                    {/* Logo / Brand */}
                    <div className="brand">
                        <div className="brand-icon">
                            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect width="40" height="40" rx="12" fill="url(#grad1)"/>
                                <path d="M12 20 L20 12 L28 20 L20 28 Z" fill="white" fillOpacity="0.9"/>
                                <path d="M16 20 L20 16 L24 20 L20 24 Z" fill="url(#grad1)"/>
                                <defs>
                                    <linearGradient id="grad1" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                                        <stop stopColor="#6366f1"/>
                                        <stop offset="1" stopColor="#8b5cf6"/>
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                        <div>
                            <h1 className="brand-title">PLO Dashboard</h1>
                            <p className="brand-subtitle">Monitoring System</p>
                        </div>
                    </div>

                    <div className="card-header">
                        <h2 className="card-title">Selamat Datang</h2>
                        <p className="card-desc">Masuk ke akun Anda untuk melanjutkan</p>
                    </div>

                    {status && (
                        <div className="alert-success">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm3.54 6.54l-4 4a.75.75 0 01-1.08 0l-2-2a.75.75 0 011.08-1.08L7 8.92l3.46-3.46a.75.75 0 011.08 1.08z" fill="currentColor"/>
                            </svg>
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="login-form">
                        {/* Email */}
                        <div className="form-group">
                            <label htmlFor="email" className="form-label">
                                Email Address
                            </label>
                            <div className="input-wrapper">
                                <span className="input-icon">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                        <polyline points="22,6 12,13 2,6"/>
                                    </svg>
                                </span>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className={`form-input ${errors.email ? 'input-error' : ''}`}
                                    placeholder="nama@example.com"
                                    autoComplete="username"
                                    autoFocus
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                            </div>
                            {errors.email && <p className="error-msg">{errors.email}</p>}
                        </div>

                        {/* Password */}
                        <div className="form-group">
                            <label htmlFor="password" className="form-label">
                                Password
                            </label>
                            <div className="input-wrapper">
                                <span className="input-icon">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                        <path d="M7 11V7a5 5 0 0110 0v4"/>
                                    </svg>
                                </span>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={data.password}
                                    className={`form-input ${errors.password ? 'input-error' : ''}`}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    onChange={(e) => setData('password', e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="toggle-password"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex="-1"
                                >
                                    {showPassword ? (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                                            <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                                            <line x1="1" y1="1" x2="23" y2="23"/>
                                        </svg>
                                    ) : (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                            <circle cx="12" cy="12" r="3"/>
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {errors.password && <p className="error-msg">{errors.password}</p>}
                        </div>

                        {/* Remember + Forgot */}
                        <div className="form-row">
                            <label className="remember-label">
                                <input
                                    type="checkbox"
                                    name="remember"
                                    id="remember"
                                    checked={data.remember}
                                    className="remember-checkbox"
                                    onChange={(e) => setData('remember', e.target.checked)}
                                />
                                <span className="remember-text">Ingat saya</span>
                            </label>

                            {canResetPassword && (
                                <Link href={route('password.request')} className="forgot-link">
                                    Lupa password?
                                </Link>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            id="login-submit-btn"
                            className={`submit-btn ${processing ? 'btn-loading' : ''}`}
                            disabled={processing}
                        >
                            {processing ? (
                                <span className="loading-content">
                                    <svg className="spinner" viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="32" strokeDashoffset="12"/>
                                    </svg>
                                    Masuk...
                                </span>
                            ) : (
                                <span className="btn-content">
                                    Masuk
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="5" y1="12" x2="19" y2="12"/>
                                        <polyline points="12 5 19 12 12 19"/>
                                    </svg>
                                </span>
                            )}
                        </button>
                    </form>

                    {/* Register link */}
                    <p className="register-text">
                        Belum punya akun?{' '}
                        <Link href={route('register')} className="register-link">
                            Daftar sekarang
                        </Link>
                    </p>
                </div>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

                * { box-sizing: border-box; margin: 0; padding: 0; }

                .login-wrapper {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #0a0a0f;
                    font-family: 'Inter', sans-serif;
                    position: relative;
                    overflow: hidden;
                    padding: 24px;
                }

                /* Animated orb background */
                .bg-orbs {
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                }
                .orb {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(80px);
                    animation: float 8s ease-in-out infinite;
                }
                .orb-1 {
                    width: 500px; height: 500px;
                    background: radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%);
                    top: -150px; left: -150px;
                    animation-delay: 0s;
                }
                .orb-2 {
                    width: 400px; height: 400px;
                    background: radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%);
                    bottom: -100px; right: -100px;
                    animation-delay: -3s;
                }
                .orb-3 {
                    width: 300px; height: 300px;
                    background: radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 70%);
                    top: 50%; left: 60%;
                    animation-delay: -5s;
                }
                @keyframes float {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(30px, -30px) scale(1.05); }
                    66% { transform: translate(-20px, 20px) scale(0.95); }
                }

                /* Card */
                .login-card {
                    background: rgba(255,255,255,0.04);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 24px;
                    padding: 40px;
                    width: 100%;
                    max-width: 440px;
                    position: relative;
                    z-index: 10;
                    box-shadow:
                        0 0 0 1px rgba(255,255,255,0.05) inset,
                        0 25px 50px rgba(0,0,0,0.5),
                        0 0 80px rgba(99,102,241,0.1);
                }

                /* Brand */
                .brand {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    margin-bottom: 32px;
                }
                .brand-icon {
                    width: 44px;
                    height: 44px;
                    flex-shrink: 0;
                }
                .brand-icon svg { width: 100%; height: 100%; }
                .brand-title {
                    font-size: 16px;
                    font-weight: 700;
                    color: #f1f5f9;
                    letter-spacing: -0.3px;
                    line-height: 1.2;
                }
                .brand-subtitle {
                    font-size: 12px;
                    color: #64748b;
                    font-weight: 400;
                    margin-top: 2px;
                }

                /* Card header */
                .card-header { margin-bottom: 28px; }
                .card-title {
                    font-size: 26px;
                    font-weight: 700;
                    color: #f1f5f9;
                    letter-spacing: -0.5px;
                    line-height: 1.2;
                }
                .card-desc {
                    font-size: 14px;
                    color: #64748b;
                    margin-top: 6px;
                }

                /* Alert success */
                .alert-success {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px 16px;
                    background: rgba(34,197,94,0.1);
                    border: 1px solid rgba(34,197,94,0.2);
                    border-radius: 10px;
                    color: #4ade80;
                    font-size: 13px;
                    margin-bottom: 20px;
                }

                /* Form */
                .login-form { display: flex; flex-direction: column; gap: 20px; }
                .form-group { display: flex; flex-direction: column; gap: 8px; }
                .form-label {
                    font-size: 13px;
                    font-weight: 500;
                    color: #94a3b8;
                    letter-spacing: 0.2px;
                }

                .input-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                }
                .input-icon {
                    position: absolute;
                    left: 14px;
                    color: #475569;
                    display: flex;
                    pointer-events: none;
                    transition: color 0.2s;
                }
                .form-input {
                    width: 100%;
                    padding: 12px 14px 12px 44px;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 12px;
                    color: #f1f5f9;
                    font-size: 14px;
                    font-family: 'Inter', sans-serif;
                    outline: none;
                    transition: all 0.2s ease;
                }
                .form-input::placeholder { color: #334155; }
                .form-input:focus {
                    border-color: rgba(99,102,241,0.6);
                    background: rgba(99,102,241,0.05);
                    box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
                }
                .form-input:focus + .input-icon,
                .input-wrapper:focus-within .input-icon { color: #818cf8; }
                .form-input.input-error {
                    border-color: rgba(239,68,68,0.5);
                    background: rgba(239,68,68,0.05);
                }
                .toggle-password {
                    position: absolute;
                    right: 14px;
                    background: none;
                    border: none;
                    color: #475569;
                    cursor: pointer;
                    padding: 4px;
                    display: flex;
                    align-items: center;
                    transition: color 0.2s;
                }
                .toggle-password:hover { color: #818cf8; }
                .error-msg {
                    font-size: 12px;
                    color: #f87171;
                    margin-top: 2px;
                }

                /* Form row */
                .form-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                .remember-label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                }
                .remember-checkbox {
                    width: 16px;
                    height: 16px;
                    accent-color: #6366f1;
                    cursor: pointer;
                }
                .remember-text {
                    font-size: 13px;
                    color: #64748b;
                }
                .forgot-link {
                    font-size: 13px;
                    color: #818cf8;
                    text-decoration: none;
                    transition: color 0.2s;
                }
                .forgot-link:hover { color: #a5b4fc; }

                /* Submit button */
                .submit-btn {
                    width: 100%;
                    padding: 14px;
                    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                    border: none;
                    border-radius: 12px;
                    color: white;
                    font-size: 15px;
                    font-weight: 600;
                    font-family: 'Inter', sans-serif;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    position: relative;
                    overflow: hidden;
                    margin-top: 4px;
                    box-shadow: 0 4px 15px rgba(99,102,241,0.35);
                }
                .submit-btn::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%);
                }
                .submit-btn:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 8px 25px rgba(99,102,241,0.45);
                }
                .submit-btn:active:not(:disabled) {
                    transform: translateY(0);
                }
                .submit-btn:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }
                .btn-content, .loading-content {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    position: relative;
                }
                .spinner {
                    width: 18px;
                    height: 18px;
                    animation: spin 0.8s linear infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                /* Register */
                .register-text {
                    text-align: center;
                    font-size: 13px;
                    color: #64748b;
                    margin-top: 24px;
                }
                .register-link {
                    color: #818cf8;
                    text-decoration: none;
                    font-weight: 500;
                    transition: color 0.2s;
                }
                .register-link:hover { color: #a5b4fc; }
            `}</style>
        </>
    );
}
