import { Link, usePage } from '@inertiajs/react';
import React from 'react';
import Dropdown from '@/Components/Dropdown';

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

                        
                        {(auth?.permissions?.includes('admin.settings') || auth?.permissions?.some(p => p.startsWith('config.settings.'))) && (
                            <Link 
                                href={route('admin.settings')} 
                                className={`sidebar-icon ${route().current('admin.settings') ? 'active' : ''}`}
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
                {/* Top Navigation Bar - Hidden on Dashboard and Profile */}
                {(!route().current('*dashboard*') && !route().current('*profile*')) && (
                    <header className="top-navbar theme-bg-card theme-border border-b px-6 py-4 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md bg-opacity-80">
                        <div className="flex items-center gap-6">
                            {(auth?.permissions?.includes('admin.users.index') || auth?.permissions?.includes('admin.settings') || auth?.permissions?.some(p => p.startsWith('config.settings.'))) && (
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button className="flex items-center gap-2 px-4 py-2 rounded-xl theme-bg-input theme-border border hover:bg-[var(--accent)] hover:text-white transition-colors">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                                            <span className="font-semibold">Config</span>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                        </button>
                                    </Dropdown.Trigger>
                                    
                                    <Dropdown.Content align="left" contentClasses="py-2 bg-[var(--popover-bg)] border border-[var(--card-border)] text-[var(--text-primary)] shadow-2xl rounded-xl min-w-[240px] mt-2">
                                    
                                    {auth?.permissions?.includes('admin.users.index') && (
                                        <div className="relative group">
                                            <Link href={route('admin.users.index')} className="block text-black hover:bg-gray-100 hover:text-blue-600 rounded-lg mx-2 my-1 flex items-center justify-between gap-3 px-4 py-3 font-semibold transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                                                    Manajemen Pengguna
                                                </div>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                            </Link>
                                            
                                            {/* Submenu Users */}
                                            <div className="absolute left-full top-0 hidden group-hover:block w-56 bg-white border border-gray-200 rounded-xl shadow-2xl py-2 z-50">
                                                <Link href={route('admin.users.index')} className="block px-4 py-2 text-sm font-medium text-black hover:bg-gray-100 hover:text-blue-600 transition-colors">Tambah Pengguna Baru</Link>
                                                <Link href={route('admin.users.index')} className="block px-4 py-2 text-sm font-medium text-black hover:bg-gray-100 hover:text-blue-600 transition-colors">Edit Pengguna</Link>
                                                <Link href={route('admin.users.index')} className="block px-4 py-2 text-sm font-medium text-black hover:bg-gray-100 hover:text-blue-600 transition-colors">Hapus Pengguna</Link>
                                                <Link href={route('admin.users.index')} className="block px-4 py-2 text-sm font-medium text-black hover:bg-gray-100 hover:text-blue-600 transition-colors">Reset Password</Link>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Pengaturan Sistem */}
                                    {(auth?.permissions?.includes('admin.settings') || auth?.permissions?.some(p => p.startsWith('config.settings.'))) && (
                                        <div className="relative group">
                                            <Link href={route('admin.settings')} className="block text-black hover:bg-gray-100 hover:text-blue-600 rounded-lg mx-2 my-1 flex items-center justify-between gap-3 px-4 py-3 font-semibold transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                                                    Pengaturan Sistem
                                                </div>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                            </Link>
                                            
                                            {/* Submenu Settings */}
                                            <div className="absolute left-full top-0 hidden group-hover:block w-56 bg-white border border-gray-200 rounded-xl shadow-2xl py-2 z-50">
                                                {(auth?.permissions?.includes('admin.settings') || auth?.permissions?.includes('config.settings.theme')) && (
                                                    <Link href={route('admin.settings') + '?feature=theme'} className="block px-4 py-2 text-sm font-medium text-black hover:bg-gray-100 hover:text-blue-600 transition-colors">Ubah Tema</Link>
                                                )}
                                                {(auth?.permissions?.includes('admin.settings') || auth?.permissions?.includes('config.settings.running_text')) && (
                                                    <Link href={route('admin.settings') + '?feature=running_text'} className="block px-4 py-2 text-sm font-medium text-black hover:bg-gray-100 hover:text-blue-600 transition-colors">Ubah Teks Berjalan</Link>
                                                )}
                                                {(auth?.permissions?.includes('admin.settings') || auth?.permissions?.includes('config.settings.privacy_policy')) && (
                                                    <Link href={route('admin.settings') + '?feature=privacy_policy'} className="block px-4 py-2 text-sm font-medium text-black hover:bg-gray-100 hover:text-blue-600 transition-colors">Ubah Privacy Policy</Link>
                                                )}
                                                {(auth?.permissions?.includes('admin.settings') || auth?.permissions?.includes('config.settings.roles')) && (
                                                    <Link href={route('admin.settings') + '?feature=roles'} className="block px-4 py-2 text-sm font-medium text-black hover:bg-gray-100 hover:text-blue-600 transition-colors">Manajemen Role</Link>
                                                )}
                                                {(auth?.permissions?.includes('admin.settings') || auth?.permissions?.includes('config.settings.features')) && (
                                                    <Link href={route('admin.settings') + '?feature=features'} className="block px-4 py-2 text-sm font-medium text-black hover:bg-gray-100 hover:text-blue-600 transition-colors">Manajemen Fitur</Link>
                                                )}
                                                {(auth?.permissions?.includes('admin.settings') || auth?.permissions?.includes('config.settings.permissions')) && (
                                                    <Link href={route('admin.settings') + '?feature=permissions'} className="block px-4 py-2 text-sm font-medium text-black hover:bg-gray-100 hover:text-blue-600 transition-colors">Konfigurasi Akses Menu</Link>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    </Dropdown.Content>
                                </Dropdown>
                            )}
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <span className="text-sm theme-text-muted hidden sm:inline-block">Halo, {user?.name}</span>
                            <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                        </div>
                    </header>
                )}

                <main className="flex-1 p-0">
                    {children}
                </main>
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
                    min-width: 0; /* Prevents flex item from expanding past viewport */
                    width: 100%;
                    overflow-x: hidden; /* Hide body horizontal scroll */
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
