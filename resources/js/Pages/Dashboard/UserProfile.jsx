import React from 'react';
import { usePage } from '@inertiajs/react';
import DashboardLayout from '@/Layouts/DashboardLayout';

export default function UserProfile() {
    const { auth } = usePage().props;
    const user = auth?.user;

    return (
        <DashboardLayout>
            <div className="profile-wrap">
                <main className="main-content">
                    <header className="topbar">
                        <div>
                            <h1 className="page-title">User Profile</h1>
                            <p className="page-subtitle">Informasi detail akun Anda</p>
                        </div>
                    </header>

                    <div className="profile-content">
                        <div className="profile-card">
                            <div className="profile-header">
                                <div className="profile-avatar">
                                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                <div className="profile-title">
                                    <h2>{user?.name}</h2>
                                    <span className={`role-badge role-${user?.role || 'user'}`}>
                                        {user?.role ? user.role.toUpperCase() : 'USER'}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="profile-details">
                                <div className="detail-group">
                                    <label>Nama Lengkap</label>
                                    <div className="detail-value">{user?.name}</div>
                                </div>
                                
                                <div className="detail-group">
                                    <label>Email Address</label>
                                    <div className="detail-value">{user?.email}</div>
                                </div>
                                
                                <div className="detail-group">
                                    <label>Role</label>
                                    <div className="detail-value">{user?.role}</div>
                                </div>

                                <div className="detail-group">
                                    <label>Status Akun</label>
                                    <div className="detail-value status-active">
                                        <span className="status-dot"></span> Active
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }

                .profile-wrap { display: flex; min-height: 100vh; font-family: 'Inter', sans-serif; color: #e2e8f0; }
                .main-content { flex: 1; padding: 0 40px 40px; max-width: 1200px; margin: 0 auto; width: 100%; }
                
                .topbar { padding: 30px 0; margin-bottom: 20px; }
                .page-title { font-size: 24px; font-weight: 700; color: #f1f5f9; letter-spacing: -0.5px; }
                .page-subtitle { font-size: 14px; color: #94a3b8; margin-top: 6px; }

                .profile-content {
                    margin-top: 20px;
                }

                .profile-card {
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 20px;
                    padding: 40px;
                }

                .profile-header {
                    display: flex;
                    align-items: center;
                    gap: 24px;
                    padding-bottom: 40px;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    margin-bottom: 40px;
                }

                .profile-avatar {
                    width: 80px;
                    height: 80px;
                    border-radius: 24px;
                    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 32px;
                    font-weight: 700;
                    color: white;
                    box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.3);
                }

                .profile-title h2 {
                    font-size: 28px;
                    font-weight: 700;
                    color: #f1f5f9;
                    margin-bottom: 8px;
                }

                .role-badge {
                    display: inline-block;
                    padding: 6px 14px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 700;
                    letter-spacing: 0.5px;
                }
                .role-admin { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); }
                .role-it { background: rgba(59, 130, 246, 0.1); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.2); }
                .role-cc { background: rgba(245, 158, 11, 0.1); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.2); }
                .role-user { background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2); }

                .profile-details {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 32px;
                }

                .detail-group label {
                    display: block;
                    font-size: 13px;
                    font-weight: 500;
                    color: #64748b;
                    margin-bottom: 8px;
                }

                .detail-value {
                    font-size: 16px;
                    font-weight: 500;
                    color: #f1f5f9;
                    background: rgba(255,255,255,0.02);
                    padding: 16px;
                    border-radius: 12px;
                    border: 1px solid rgba(255,255,255,0.05);
                }

                .status-active {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #10b981;
                }

                .status-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: #10b981;
                    box-shadow: 0 0 10px #10b981;
                }

                @media (max-width: 768px) {
                    .main-content { padding: 0 20px 20px; }
                    .profile-details { grid-template-columns: 1fr; }
                    .profile-card { padding: 24px; }
                }
            `}</style>
        </DashboardLayout>
    );
}
