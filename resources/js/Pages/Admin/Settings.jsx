import { Head, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';

export default function Settings({ runningText, privacyPolicy, themeMode, rolePermissions, customRoles = {}, availableRoles = {}, customFeatures = {}, availableFeatures = {}, appFeaturesDictionary = {} }) {
    const { props, url } = usePage();
    const { auth, flash } = props;
    const user = auth?.user;
    
    // Parse URL parameter
    const searchParams = new URLSearchParams(url.split('?')[1] || '');
    const currentFeature = searchParams.get('feature');
    
    const [rtValue, setRtValue] = useState(runningText || '');
    const [rtProcessing, setRtProcessing] = useState(false);

    const [ppValue, setPpValue] = useState(privacyPolicy || '');
    const [ppProcessing, setPpProcessing] = useState(false);
    
    const [themeValue, setThemeValue] = useState(themeMode || 'dark');
    const [themeProcessing, setThemeProcessing] = useState(false);

    const [permissions, setPermissions] = useState(rolePermissions || {});
    const [permissionsProcessing, setPermissionsProcessing] = useState(false);

    const [newRoleName, setNewRoleName] = useState('');
    const [roleProcessing, setRoleProcessing] = useState(false);

    const [selectedFeature, setSelectedFeature] = useState('');
    
    const [featureProcessing, setFeatureProcessing] = useState(false);

    const handleSaveRunningText = (e) => {
        e.preventDefault();
        setRtProcessing(true);
        router.post(route('admin.settings.running_text.update'), { text: rtValue }, {
            preserveScroll: true,
            onFinish: () => setRtProcessing(false),
        });
    };

    const handleSavePrivacyPolicy = (e) => {
        e.preventDefault();
        setPpProcessing(true);
        router.post(route('admin.settings.privacy_policy.update'), { privacy_policy: ppValue }, {
            preserveScroll: true,
            onFinish: () => setPpProcessing(false),
        });
    };
    const handleSaveTheme = (e) => {
        e.preventDefault();
        setThemeProcessing(true);
        router.post(route('admin.settings.theme.update'), { theme: themeValue }, {
            preserveScroll: true,
            onFinish: () => setThemeProcessing(false),
        });
    };

    const handleSavePermissions = (e) => {
        e.preventDefault();
        setPermissionsProcessing(true);
        router.post(route('admin.settings.permissions.update'), { permissions: permissions }, {
            preserveScroll: true,
            onFinish: () => setPermissionsProcessing(false),
        });
    };

    const togglePermission = (roleId, menuId) => {
        setPermissions(prev => {
            const rolePerms = prev[roleId] || [];
            if (rolePerms.includes(menuId)) {
                return { ...prev, [roleId]: rolePerms.filter(id => id !== menuId) };
            } else {
                return { ...prev, [roleId]: [...rolePerms, menuId] };
            }
        });
    };

    const handleAddRole = (e) => {
        e.preventDefault();
        if (!newRoleName.trim()) return;
        setRoleProcessing(true);
        router.post(route('admin.settings.roles.store'), { name: newRoleName }, {
            preserveScroll: true,
            onSuccess: () => setNewRoleName(''),
            onFinish: () => setRoleProcessing(false),
        });
    };

    const handleDeleteRole = (roleSlug) => {
        if (confirm('Apakah Anda yakin ingin menghapus role ini?')) {
            router.delete(route('admin.settings.roles.destroy', roleSlug), {
                preserveScroll: true,
            });
        }
    };

    // Filter out admin and administrator, we only configure non-admin roles
    const configurableRoles = Object.keys(availableRoles)
        .filter(key => key !== 'admin' && key !== 'administrator')
        .map(key => ({ id: key, label: availableRoles[key] }));

    const handleAddFeature = (e) => {
        e.preventDefault();
        if (!selectedFeature) return;
        
        setFeatureProcessing(true);
        router.post(route('admin.settings.features.store'), { feature_id: selectedFeature }, {
            preserveScroll: true,
            onSuccess: () => setSelectedFeature(''),
            onFinish: () => setFeatureProcessing(false),
        });
    };

    const handleDeleteFeature = (featureSlug) => {
        if (confirm('Apakah Anda yakin ingin menghapus fitur ini?')) {
            router.delete(route('admin.settings.features.destroy', featureSlug), {
                preserveScroll: true,
            });
        }
    };

    const configurableMenus = Object.keys(availableFeatures).map(key => ({ id: key, label: availableFeatures[key] }));

    return (
        <DashboardLayout>
            <Head title="Pengaturan Sistem — PLO Monitoring" />

            <div className="min-h-screen theme-bg-main p-4 sm:p-6 lg:p-8">

                {flash?.success && (
                    <div className="mb-8 p-5 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-between gap-4 shadow-sm backdrop-blur-md">
                        <div className="flex items-center gap-4">
                            <div className="bg-green-500/20 p-2 rounded-full">
                                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <span className="text-green-400 font-semibold text-lg">{flash.success}</span>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* Empty State */}
                    {!currentFeature && (
                        <div className="col-span-1 xl:col-span-2 mt-4">
                            <div className="flex flex-col items-center justify-center p-16 theme-bg-card theme-border border rounded-3xl shadow-xl backdrop-blur-md">
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500/50 mb-6"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                                <h3 className="text-2xl font-bold theme-text-primary mb-2">Pilih Fitur Konfigurasi</h3>
                                <p className="theme-text-muted text-center max-w-md">Gunakan menu dropdown <strong>Config</strong> di panel navigasi atas untuk memilih fitur yang ingin Anda atur.</p>
                            </div>
                        </div>
                    )}

                    {/* Theme Settings */}
                    {currentFeature === 'theme' && (auth?.permissions?.includes('admin.settings') || auth?.permissions?.includes('config.settings.theme')) && (
                    <div className="col-span-1 xl:col-span-2 theme-bg-card theme-border border rounded-3xl overflow-hidden shadow-2xl backdrop-blur-2xl p-8 transition-all hover:shadow-indigo-500/10">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-indigo-500/20 rounded-2xl">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold theme-text-primary">Pengaturan Tema</h2>
                                <p className="text-sm theme-text-muted mt-1">Ubah tema warna global untuk seluruh pengguna dashboard.</p>
                            </div>
                        </div>
                        
                        <form onSubmit={handleSaveTheme} className="flex flex-col gap-5 mt-8">
                            <div className="w-full">
                                <select
                                    value={themeValue}
                                    onChange={(e) => setThemeValue(e.target.value)}
                                    className="w-full h-14 px-4 theme-bg-input theme-border rounded-xl shadow-inner focus:border-indigo-500 focus:ring-indigo-500 text-lg transition-colors"
                                >
                                    <option value="dark">🌙 Dark Mode (Mode Gelap)</option>
                                    <option value="light">☀️ White Mode (Mode Terang)</option>
                                    <option value="senja">🌅 Mode Senja</option>
                                </select>
                            </div>
                            <PrimaryButton disabled={themeProcessing} type="submit" className="w-full justify-center h-14 text-lg rounded-xl shadow-lg shadow-indigo-500/30">
                                {themeProcessing ? 'Menyimpan...' : 'Simpan Tema'}
                            </PrimaryButton>
                        </form>
                    </div>
                    )}

                    {/* Running Text Settings */}
                    {currentFeature === 'running_text' && (auth?.permissions?.includes('admin.settings') || auth?.permissions?.includes('config.settings.running_text')) && (
                    <div className="col-span-1 xl:col-span-2 theme-bg-card theme-border border rounded-3xl overflow-hidden shadow-2xl backdrop-blur-2xl p-8 transition-all hover:shadow-indigo-500/10">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-purple-500/20 rounded-2xl">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold theme-text-primary">Teks Berjalan</h2>
                                <p className="text-sm theme-text-muted mt-1">Ubah teks informasi berjalan (running text) yang tampil di semua halaman.</p>
                            </div>
                        </div>
                        
                        <form onSubmit={handleSaveRunningText} className="flex flex-col gap-5 mt-8">
                            <div className="w-full">
                                <TextInput
                                    type="text"
                                    value={rtValue}
                                    onChange={(e) => setRtValue(e.target.value)}
                                    className="w-full h-14 px-4 theme-bg-input theme-border rounded-xl shadow-inner placeholder-gray-500 focus:border-purple-500 focus:ring-purple-500 text-lg transition-colors"
                                    placeholder="Kosongkan jika tidak ingin menampilkan teks berjalan..."
                                />
                            </div>
                            <PrimaryButton disabled={rtProcessing} type="submit" className="w-full justify-center h-14 text-lg rounded-xl shadow-lg shadow-purple-500/30 !bg-purple-600 hover:!bg-purple-700">
                                {rtProcessing ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </PrimaryButton>
                        </form>
                    </div>
                    )}

                    {/* Privacy Policy Settings */}
                    {currentFeature === 'privacy_policy' && (auth?.permissions?.includes('admin.settings') || auth?.permissions?.includes('config.settings.privacy_policy')) && (
                    <div className="col-span-1 xl:col-span-2 theme-bg-card theme-border border rounded-3xl overflow-hidden shadow-2xl backdrop-blur-2xl p-8 transition-all hover:shadow-cyan-500/10">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-cyan-500/20 rounded-2xl">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold theme-text-primary">Privacy Policy</h2>
                                <p className="text-sm theme-text-muted mt-1">Ubah teks kebijakan privasi yang tampil di halaman login (Bisa menggunakan tag HTML dasar seperti &lt;p&gt;, &lt;b&gt;, &lt;br&gt;).</p>
                            </div>
                        </div>
                        
                        <form onSubmit={handleSavePrivacyPolicy} className="flex flex-col gap-5 mt-8">
                            <div className="w-full">
                                <textarea
                                    value={ppValue}
                                    onChange={(e) => setPpValue(e.target.value)}
                                    className="w-full h-64 p-4 theme-bg-input theme-border rounded-xl shadow-inner placeholder-gray-500 focus:border-cyan-500 focus:ring-cyan-500 text-sm transition-colors"
                                    placeholder="Masukkan teks kebijakan privasi di sini..."
                                />
                            </div>
                            <PrimaryButton disabled={ppProcessing} type="submit" className="w-full justify-center h-14 text-lg rounded-xl shadow-lg shadow-cyan-500/30 !bg-cyan-600 hover:!bg-cyan-700">
                                {ppProcessing ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </PrimaryButton>
                        </form>
                    </div>
                    )}

                    {/* Role Management Settings */}
                    {currentFeature === 'roles' && (auth?.permissions?.includes('admin.settings') || auth?.permissions?.includes('config.settings.roles')) && (
                        <div className="theme-bg-card theme-border border rounded-3xl overflow-hidden shadow-2xl backdrop-blur-2xl p-8 col-span-1 xl:col-span-2 mt-2 transition-all hover:shadow-green-500/10">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-green-500/20 rounded-2xl">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold theme-text-primary">Manajemen Role</h2>
                                    <p className="text-sm theme-text-muted mt-1">Tambahkan role kustom baru untuk membedakan akses pengguna.</p>
                                </div>
                            </div>
                            
                            <form onSubmit={handleAddRole} className="flex flex-col sm:flex-row gap-4 mb-8">
                                <TextInput
                                    type="text"
                                    value={newRoleName}
                                    onChange={(e) => setNewRoleName(e.target.value)}
                                    className="flex-1 h-12 px-4 theme-bg-input theme-border rounded-xl shadow-inner placeholder-gray-500 focus:border-green-500 focus:ring-green-500 transition-colors"
                                    placeholder="Nama Role Baru (misal: Finance, Manager)"
                                />
                                <PrimaryButton disabled={roleProcessing || !newRoleName.trim()} type="submit" className="h-12 px-6 rounded-xl shadow-lg shadow-green-500/30 !bg-green-600 hover:!bg-green-700 whitespace-nowrap">
                                    {roleProcessing ? 'Menambahkan...' : 'Tambah Role'}
                                </PrimaryButton>
                            </form>

                            {Object.keys(customRoles).length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {Object.entries(customRoles)
                                        .filter(([slug]) => slug !== 'administrator')
                                        .map(([slug, name]) => (
                                        <div key={slug} className="flex items-center justify-between p-4 rounded-xl border theme-border theme-bg-input/50">
                                            <div>
                                                <div className="font-semibold theme-text-primary">{name}</div>
                                                <div className="text-xs theme-text-muted">ID: {slug}</div>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteRole(slug)}
                                                className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                title="Hapus Role"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center p-8 rounded-xl border border-dashed theme-border theme-text-muted">
                                    Belum ada role kustom yang dibuat.
                                </div>
                            )}
                        </div>
                    )}

                    {/* Feature Management Settings */}
                    {currentFeature === 'features' && (auth?.permissions?.includes('admin.settings') || auth?.permissions?.includes('config.settings.features')) && (
                        <div className="theme-bg-card theme-border border rounded-3xl overflow-hidden shadow-2xl backdrop-blur-2xl p-8 col-span-1 xl:col-span-2 mt-2 transition-all hover:shadow-orange-500/10">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-orange-500/20 rounded-2xl">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-400"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold theme-text-primary">Manajemen Fitur / Akses Menu</h2>
                                </div>
                            </div>
                            
                            <form onSubmit={handleAddFeature} className="flex flex-col sm:flex-row gap-4 mb-6">
                                <select
                                    value={selectedFeature}
                                    onChange={(e) => setSelectedFeature(e.target.value)}
                                    className="flex-1 h-12 px-4 theme-bg-input theme-border rounded-xl shadow-inner focus:border-orange-500 focus:ring-orange-500 transition-colors"
                                >
                                    <option value="">-- Pilih Fitur untuk Ditambahkan --</option>
                                    {Object.entries(appFeaturesDictionary).map(([catKey, category]) => {
                                        // filter features that are already in customFeatures
                                        const availableOptions = Object.entries(category.features).filter(([id]) => !customFeatures[id]);
                                        if (availableOptions.length === 0) return null;

                                        return (
                                            <optgroup key={catKey} label={category.label}>
                                                {availableOptions.map(([id, name]) => (
                                                    <option key={id} value={id}>{name}</option>
                                                ))}
                                            </optgroup>
                                        );
                                    })}
                                </select>

                                <PrimaryButton disabled={featureProcessing || !selectedFeature} type="submit" className="h-12 px-6 rounded-xl shadow-lg shadow-orange-500/30 !bg-orange-600 hover:!bg-orange-700 whitespace-nowrap">
                                    {featureProcessing ? 'Menambahkan...' : 'Tambah Fitur'}
                                </PrimaryButton>
                            </form>

                            {Object.keys(customFeatures).length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {Object.entries(customFeatures).map(([slug, name]) => (
                                        <div key={slug} className="flex items-center justify-between p-4 rounded-xl border theme-border theme-bg-input/50">
                                            <div>
                                                <div className="font-semibold theme-text-primary">{name}</div>
                                                <div className="text-xs theme-text-muted">ID: {slug}</div>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteFeature(slug)}
                                                className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                title="Hapus Fitur"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center p-8 rounded-xl border border-dashed theme-border theme-text-muted">
                                    Belum ada fitur kustom yang dibuat.
                                </div>
                            )}
                        </div>
                    )}

                    {/* Menu Permissions Settings */}
                    {currentFeature === 'permissions' && (auth?.permissions?.includes('admin.settings') || auth?.permissions?.includes('config.settings.permissions')) && (
                        <div className="theme-bg-card theme-border border rounded-3xl overflow-hidden shadow-2xl backdrop-blur-2xl p-8 col-span-1 xl:col-span-2 mt-2 transition-all hover:shadow-blue-500/10">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-500/20 rounded-2xl">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold theme-text-primary">Konfigurasi Akses Menu</h2>
                                        <p className="text-sm theme-text-muted mt-1">Atur role mana saja yang memiliki hak akses untuk membuka menu tertentu (Admin secara otomatis memiliki akses penuh).</p>
                                    </div>
                                </div>
                                <PrimaryButton onClick={handleSavePermissions} disabled={permissionsProcessing} className="h-12 px-6 rounded-xl shadow-lg shadow-blue-500/30 !bg-blue-600 hover:!bg-blue-700 whitespace-nowrap">
                                    {permissionsProcessing ? 'Menyimpan...' : 'Simpan Hak Akses'}
                                </PrimaryButton>
                            </div>

                            <div className="overflow-x-auto rounded-2xl border theme-border">
                                <table className="w-full text-left text-sm">
                                    <thead className="theme-table-header theme-text-muted uppercase text-xs tracking-wider">
                                        <tr>
                                            <th className="px-8 py-5 font-semibold">Nama Menu</th>
                                            {configurableRoles.map(role => (
                                                <th key={role.id} className="px-8 py-5 text-center font-semibold">{role.label}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y theme-border">
                                        {configurableMenus.map(menu => (
                                            <tr key={menu.id} className="transition-colors">
                                                <td className="px-8 py-6 font-medium text-base theme-text-primary">
                                                    {menu.label}
                                                </td>
                                                {configurableRoles.map(role => {
                                                    const isChecked = (permissions[role.id] || []).includes(menu.id);
                                                    
                                                    // Hanya administrator yang bisa mengatur akses milik it dan administrator
                                                    const isRestricted = user?.role !== 'admin' && user?.role !== 'administrator' && (role.id === 'it' || role.id === 'administrator' || role.id === 'admin');

                                                    return (
                                                        <td key={role.id} className="px-8 py-6 text-center">
                                                            <label className={`inline-flex items-center group ${isRestricted ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}`}>
                                                                <div className="relative flex items-center justify-center">
                                                                    <input 
                                                                        type="checkbox" 
                                                                        checked={isChecked}
                                                                        disabled={isRestricted}
                                                                        onChange={() => {
                                                                            if (!isRestricted) togglePermission(role.id, menu.id);
                                                                        }}
                                                                        className={`peer appearance-none w-8 h-8 rounded-lg border-2 theme-border theme-bg-input checked:bg-blue-500 checked:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all ${isRestricted ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                                                    />
                                                                    <svg className="absolute w-5 h-5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                                    </svg>
                                                                </div>
                                                            </label>
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
