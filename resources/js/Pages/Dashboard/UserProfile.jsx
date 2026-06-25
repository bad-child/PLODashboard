import React, { useEffect, useRef } from 'react';
import { usePage, useForm } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';

export default function UserProfile() {
    const { auth, flash } = usePage().props;
    const user = auth?.user;
    const fileInputRef = useRef(null);

    // Form for Avatar Upload
    const avatarForm = useForm({
        avatar: null,
    });

    // Form for Profile Info
    const infoForm = useForm({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
    });

    // Form for Password Update
    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    // Handle Profile Info Update
    const updateInfo = (e) => {
        e.preventDefault();
        infoForm.patch(route('dashboard.profile.info'), {
            preserveScroll: true,
        });
    };

    // Handle Avatar Selection
    const handleAvatarClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleAvatarChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            avatarForm.setData('avatar', e.target.files[0]);
        }
    };

    // Auto submit avatar when selected
    useEffect(() => {
        if (avatarForm.data.avatar) {
            avatarForm.post(route('dashboard.profile.avatar'), {
                preserveScroll: true,
                onSuccess: () => avatarForm.reset(),
            });
        }
    }, [avatarForm.data.avatar]);

    // Handle Password Update
    const updatePassword = (e) => {
        e.preventDefault();
        passwordForm.post(route('dashboard.profile.password'), {
            preserveScroll: true,
            onSuccess: () => passwordForm.reset(),
        });
    };

    return (
        <DashboardLayout>
            <div className="profile-wrap min-h-screen">
                <main className="main-content">
                    <header className="topbar">
                        <div>
                            <h1 className="page-title">User Profile</h1>
                            <p className="page-subtitle">Kelola informasi dan keamanan akun Anda</p>
                        </div>
                    </header>

                    {/* Flash Messages */}
                    {flash?.success && (
                        <div className="mb-8 p-5 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center gap-4 shadow-sm backdrop-blur-md">
                            <div className="bg-green-500/20 p-2 rounded-full">
                                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <span className="text-green-400 font-semibold text-lg">{flash.success}</span>
                        </div>
                    )}
                    
                    {avatarForm.errors.avatar && (
                        <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            {avatarForm.errors.avatar}
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Profile Info & Avatar */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="profile-card">
                                <div className="profile-header flex flex-col md:flex-row items-center md:items-start gap-6">
                                    <div 
                                        className="profile-avatar relative group cursor-pointer overflow-hidden flex-shrink-0" 
                                        onClick={handleAvatarClick}
                                    >
                                        {user?.avatar_url ? (
                                            <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-white text-4xl">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                                        )}
                                        
                                        {/* Hover Overlay */}
                                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                                            <svg className="w-8 h-8 text-white mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span className="text-xs text-white font-medium">Ubah Foto</span>
                                        </div>

                                        {/* Loading Overlay */}
                                        {avatarForm.processing && (
                                            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                                            </div>
                                        )}
                                    </div>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        className="hidden" 
                                        accept="image/jpeg,image/png,image/jpg" 
                                        onChange={handleAvatarChange} 
                                    />

                                    <div className="profile-title text-center md:text-left mt-2 md:mt-0">
                                        <h2>{user?.name}</h2>
                                        <span className={`role-badge role-${user?.role || 'user'}`}>
                                            {user?.role ? user.role.toUpperCase() : 'USER'}
                                        </span>
                                    </div>
                                </div>
                                
                                <form onSubmit={updateInfo} className="mt-8">
                                    <div className="profile-details">
                                        <div className="detail-group">
                                            <label>Nama Lengkap</label>
                                            <div className="detail-value !p-0 focus-within:ring-2 focus-within:ring-indigo-500 transition-shadow">
                                                <input
                                                    type="text"
                                                    value={infoForm.data.name}
                                                    onChange={(e) => infoForm.setData('name', e.target.value)}
                                                    className="w-full bg-transparent border-0 focus:ring-0 px-5 py-4 text-base font-semibold theme-text-primary outline-none"
                                                    required
                                                />
                                            </div>
                                            {infoForm.errors.name && <p className="text-red-400 text-xs mt-1">{infoForm.errors.name}</p>}
                                        </div>
                                        
                                        <div className="detail-group">
                                            <label>Email Address</label>
                                            <div className="detail-value !p-0 focus-within:ring-2 focus-within:ring-indigo-500 transition-shadow">
                                                <input
                                                    type="email"
                                                    value={infoForm.data.email}
                                                    onChange={(e) => infoForm.setData('email', e.target.value)}
                                                    className="w-full bg-transparent border-0 focus:ring-0 px-5 py-4 text-base font-semibold theme-text-primary outline-none"
                                                    required
                                                />
                                            </div>
                                            {infoForm.errors.email && <p className="text-red-400 text-xs mt-1">{infoForm.errors.email}</p>}
                                        </div>

                                        <div className="detail-group">
                                            <label>Nomor HP</label>
                                            <div className="detail-value !p-0 focus-within:ring-2 focus-within:ring-indigo-500 transition-shadow">
                                                <input
                                                    type="text"
                                                    value={infoForm.data.phone}
                                                    onChange={(e) => infoForm.setData('phone', e.target.value)}
                                                    className="w-full bg-transparent border-0 focus:ring-0 px-5 py-4 text-base font-semibold theme-text-primary outline-none placeholder-gray-500"
                                                    placeholder="Contoh: 08123456789"
                                                />
                                            </div>
                                            {infoForm.errors.phone && <p className="text-red-400 text-xs mt-1">{infoForm.errors.phone}</p>}
                                        </div>

                                        <div className="detail-group">
                                            <label>NIK</label>
                                            <div className="detail-value !p-0 opacity-70 cursor-not-allowed">
                                                <input
                                                    type="text"
                                                    value={user?.nik || '-'}
                                                    readOnly
                                                    className="w-full bg-transparent border-0 focus:ring-0 px-5 py-4 text-base font-semibold theme-text-primary outline-none cursor-not-allowed"
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="detail-group">
                                            <label>Status Akun</label>
                                            <div className="detail-value status-active">
                                                <span className="status-dot"></span> Active
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {infoForm.isDirty && (
                                        <div className="mt-8 flex justify-end pt-4 border-t theme-border">
                                            <PrimaryButton disabled={infoForm.processing} className="shadow-lg shadow-indigo-500/20 h-11 px-6">
                                                {infoForm.processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                            </PrimaryButton>
                                        </div>
                                    )}
                                </form>
                            </div>
                        </div>

                        {/* Right Column: Change Password */}
                        <div className="lg:col-span-1 space-y-8">
                            <div className="profile-card h-full">
                                <div className="mb-6">
                                    <h3 className="text-xl font-bold theme-text-primary flex items-center gap-2">
                                        <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        Ubah Password
                                    </h3>
                                    <p className="text-sm theme-text-muted mt-1">Gunakan password yang kuat untuk keamanan akun Anda.</p>
                                </div>

                                <form onSubmit={updatePassword} className="space-y-5">
                                    <div>
                                        <InputLabel htmlFor="current_password" value="Password Lama" className="theme-text-primary" />
                                        <TextInput
                                            id="current_password"
                                            type="password"
                                            value={passwordForm.data.current_password}
                                            onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                                            className="mt-1 block w-full theme-bg-input theme-border theme-text-primary placeholder-gray-500"
                                            required
                                        />
                                        {passwordForm.errors.current_password && <p className="text-red-400 text-xs mt-1">{passwordForm.errors.current_password}</p>}
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="password" value="Password Baru" className="theme-text-primary" />
                                        <TextInput
                                            id="password"
                                            type="password"
                                            value={passwordForm.data.password}
                                            onChange={(e) => passwordForm.setData('password', e.target.value)}
                                            className="mt-1 block w-full theme-bg-input theme-border theme-text-primary placeholder-gray-500"
                                            required
                                        />
                                        {passwordForm.errors.password && <p className="text-red-400 text-xs mt-1">{passwordForm.errors.password}</p>}
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="password_confirmation" value="Konfirmasi Password Baru" className="theme-text-primary" />
                                        <TextInput
                                            id="password_confirmation"
                                            type="password"
                                            value={passwordForm.data.password_confirmation}
                                            onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                                            className="mt-1 block w-full theme-bg-input theme-border theme-text-primary placeholder-gray-500"
                                            required
                                        />
                                        {passwordForm.errors.password_confirmation && <p className="text-red-400 text-xs mt-1">{passwordForm.errors.password_confirmation}</p>}
                                    </div>

                                    <div className="pt-4 border-t theme-border mt-6">
                                        <PrimaryButton disabled={passwordForm.processing} className="w-full justify-center h-12 shadow-lg shadow-indigo-500/20">
                                            {passwordForm.processing ? 'Menyimpan...' : 'Perbarui Password'}
                                        </PrimaryButton>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }

                .profile-wrap { font-family: 'Inter', sans-serif; color: var(--text-primary); }
                .main-content { padding: 0 40px 40px; max-width: 1400px; margin: 0 auto; width: 100%; }
                
                .topbar { padding: 30px 0; margin-bottom: 20px; }
                .page-title { font-size: 32px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.5px; }
                .page-subtitle { font-size: 15px; color: var(--text-muted); margin-top: 8px; }

                .profile-card {
                    background: var(--card-bg);
                    border: 1px solid var(--card-border);
                    border-radius: 24px;
                    padding: 40px;
                    box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
                    backdrop-filter: blur(20px);
                }

                .profile-header {
                    padding-bottom: 30px;
                    border-bottom: 1px solid var(--card-border);
                }

                .profile-avatar {
                    width: 100px;
                    height: 100px;
                    border-radius: 30px;
                    background: linear-gradient(135deg, #4f46e5, #ec4899);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    box-shadow: 0 10px 25px -5px rgba(79, 70, 229, 0.4);
                }

                .profile-title h2 {
                    font-size: 32px;
                    font-weight: 800;
                    color: var(--text-primary);
                    margin-bottom: 10px;
                    letter-spacing: -0.5px;
                }

                .role-badge {
                    display: inline-block;
                    padding: 6px 16px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 700;
                    letter-spacing: 1px;
                }
                .role-admin { background: rgba(99, 102, 241, 0.1); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.2); }
                .role-it { background: rgba(16, 185, 129, 0.1); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.2); }
                .role-cc { background: rgba(245, 158, 11, 0.1); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.2); }
                .role-user { background: rgba(59, 130, 246, 0.1); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.2); }

                .profile-details {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 32px;
                }

                .detail-group label {
                    display: block;
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--text-muted);
                    margin-bottom: 10px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .detail-value {
                    font-size: 16px;
                    font-weight: 600;
                    color: var(--text-primary);
                    background: var(--input-bg);
                    padding: 16px 20px;
                    border-radius: 16px;
                    border: 1px solid var(--card-border);
                }

                .status-active {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    color: #10b981;
                }

                .status-dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    background: #10b981;
                    box-shadow: 0 0 12px #10b981;
                }

                @media (max-width: 1024px) {
                    .profile-details { grid-template-columns: 1fr; }
                }
                @media (max-width: 768px) {
                    .main-content { padding: 0 20px 20px; }
                    .profile-card { padding: 24px; }
                }
            `}</style>
        </DashboardLayout>
    );
}
