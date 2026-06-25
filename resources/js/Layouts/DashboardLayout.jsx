import { Link, usePage } from '@inertiajs/react';
import React from 'react';

export default function DashboardLayout({ children }) {
    const { auth, theme } = usePage().props;
    const user = auth?.user;

    // Determine the base route prefix based on role for the dashboard link
    let dashboardRoute = route('user.dashboard');
    if (user?.role === 'admin') dashboardRoute = route('admin.dashboard');
    else if (user?.role === 'it') dashboardRoute = route('it.dashboard');
    else if (user?.role === 'cc') dashboardRoute = route('cc.dashboard');

    return (
        <div className="app-container" data-theme={theme || 'dark'}>
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-top">
                    <div className="logo-area">
                        <img
                            src="/logo.png"
                            alt="Logo"
                            className="logo-img"
                            style={{ maxWidth: '100%', maxHeight: '40px', objectFit: 'contain' }}
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                            }}
                        />
                        <div className="logo-icon" style={{ display: 'none' }}>M</div>
                    </div>

                    <nav className="sidebar-nav">
                        <Link
                            href={dashboardRoute}
                            className={`nav-icon ${route().current('*dashboard') ? 'active' : ''}`}
                            title="Dashboard"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                        </Link>

                        {auth?.permissions?.includes('admin.users.index') && (
                            <Link
                                href={route('admin.users.index')}
                                className={`nav-icon ${route().current('admin.users.*') ? 'active' : ''}`}
                                title="Manajemen Pengguna"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                            </Link>
                        )}
                        
                        {auth?.permissions?.includes('admin.settings') && (
                            <Link
                                href={route('admin.settings')}
                                className={`nav-icon ${route().current('admin.settings') ? 'active' : ''}`}
                                title="Pengaturan Sistem"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                            </Link>
                        )}

                        <Link
                            href={route('dashboard.profile')}
                            className={`nav-icon ${route().current('dashboard.profile') ? 'active' : ''}`}
                            title="Profile"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        </Link>
                    </nav>
                </div>

                <div className="sidebar-bottom">
                    {/* Logout Icon Button Only */}
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="logout-icon-btn"
                        title="Logout"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="main-wrapper">
                {children}
            </div>

            <style>{`
                :root {
                    --sidebar-width: 80px;
                }

                /* Dark Theme (Default) */

                [data-theme="dark"] {
                    --sidebar-bg: #050508;
                    --main-bg: #0a0a0f;
                    --text-primary: #f1f5f9;
                    --text-muted: #64748b;
                    --accent: #3b82f6;
                    --card-bg: rgba(255,255,255,0.05);
                    --solid-card-bg: #16161b;
                    --card-border: rgba(255,255,255,0.1);
                    --popover-bg: #1e293b;
                    --input-bg: rgba(0,0,0,0.5);
                    --table-header-bg: rgba(0,0,0,0.4);
                    --table-border: rgba(255,255,255,0.05);
                }

                /* Light / White Theme */
                [data-theme="light"] {
                    --sidebar-bg: #ffffff;
                    --main-bg: #f8fafc;
                    --text-primary: #1e293b;
                    --text-muted: #475569;
                    --accent: #3b82f6;
                    --card-bg: #ffffff;
                    --solid-card-bg: #ffffff;
                    --card-border: rgba(0,0,0,0.1);
                    --popover-bg: #ffffff;
                    --input-bg: #ffffff;
                    --table-header-bg: #f1f5f9;
                    --table-border: rgba(0,0,0,0.05);
                }

                /* Senja Theme */
                [data-theme="senja"] {
                    --sidebar-bg: #3d1c04;
                    --main-bg: #2a1100;
                    --text-primary: #fef08a;
                    --text-muted: #fdba74;
                    --accent: #ea580c;
                    --card-bg: rgba(255, 237, 213, 0.05);
                    --solid-card-bg: #351c0b;
                    --card-border: rgba(255, 237, 213, 0.15);
                    --popover-bg: #4a2408;
                    --input-bg: rgba(0,0,0,0.4);
                    --table-header-bg: rgba(0,0,0,0.4);
                    --table-border: rgba(255, 237, 213, 0.1);
                }

                /* Utility Classes for Theme Support */
                .theme-text-primary { color: var(--text-primary); }
                .theme-text-muted { color: var(--text-muted); }
                .theme-bg-card { background-color: var(--card-bg); border-color: var(--card-border); }
                .theme-border { border-color: var(--card-border); }
                .theme-bg-input { background-color: var(--input-bg); border-color: var(--card-border); color: var(--text-primary); }
                .theme-table-header { background-color: var(--table-header-bg); }
                
                body {
                    margin: 0;
                    padding: 0;
                    font-family: 'Inter', sans-serif;
                    background: #0a0a0f; /* fallback */
                }

                .app-container {
                    display: flex;
                    min-height: 100vh;
                    background: var(--main-bg);
                    color: var(--text-primary);
                }

                .sidebar {
                    width: var(--sidebar-width);
                    background: var(--sidebar-bg);
                    border-right: 1px solid rgba(255,255,255,0.05);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: space-between;
                    padding: 24px 0;
                    position: fixed;
                    top: 0;
                    bottom: 0;
                    left: 0;
                    z-index: 50;
                }

                .sidebar-top {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 100%;
                }

                .logo-area {
                    margin-bottom: 40px;
                }
                
                .logo-img {
                    width: 44px;
                    height: 44px;
                    object-fit: contain;
                }

                .logo-icon {
                    width: 40px;
                    height: 40px;
                    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 800;
                    font-size: 20px;
                    color: #fff;
                }

                .sidebar-nav {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    width: 100%;
                    align-items: center;
                }

                .nav-icon {
                    width: 48px;
                    height: 48px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 14px;
                    color: var(--text-muted);
                    transition: all 0.2s ease;
                    background: transparent;
                }

                .nav-icon:hover {
                    color: var(--text-primary);
                    background: rgba(255,255,255,0.05);
                }

                .nav-icon.active {
                    color: #fff;
                    background: var(--accent);
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
                }

                .sidebar-bottom {
                    width: 100%;
                    display: flex;
                    justify-content: center;
                }

                .logout-icon-btn {
                    width: 48px;
                    height: 48px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 14px;
                    color: #ef4444;
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    opacity: 0.7;
                }

                .logout-icon-btn:hover {
                    opacity: 1;
                    background: rgba(239, 68, 68, 0.1);
                }

                .main-wrapper {
                    flex: 1;
                    margin-left: var(--sidebar-width);
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                }
                
                /* Responsive adjustment */
                @media (max-width: 768px) {
                    .app-container {
                        flex-direction: column;
                    }
                    .sidebar {
                        width: 100%;
                        height: 60px;
                        border-right: none;
                        border-bottom: 1px solid rgba(255,255,255,0.05);
                        position: relative;
                        flex-direction: row;
                        padding: 0 20px;
                    }
                    .sidebar-top {
                        flex-direction: row;
                        width: auto;
                    }
                    .logo-area {
                        margin-bottom: 0;
                        margin-right: 20px;
                    }
                    .sidebar-nav {
                        flex-direction: row;
                        gap: 10px;
                    }
                    .main-wrapper {
                        margin-left: 0;
                    }
                }
            `}</style>
        </div>
    );
}
