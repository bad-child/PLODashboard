import { Head, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';

export default function Settings({ runningText, themeMode, rolePermissions }) {
    const { flash, auth } = usePage().props;
    const user = auth?.user;
    
    const [rtValue, setRtValue] = useState(runningText || '');
    const [rtProcessing, setRtProcessing] = useState(false);
    
    const [themeValue, setThemeValue] = useState(themeMode || 'dark');
    const [themeProcessing, setThemeProcessing] = useState(false);

    const [permissions, setPermissions] = useState(rolePermissions || {});
    const [permissionsProcessing, setPermissionsProcessing] = useState(false);

    const handleSaveRunningText = (e) => {
        e.preventDefault();
        setRtProcessing(true);
        router.post(route('admin.settings.running_text.update'), { text: rtValue }, {
            preserveScroll: true,
            onFinish: () => setRtProcessing(false),
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

    const configurableRoles = [
        { id: 'it', label: 'IT' },
        { id: 'cc', label: 'CC' },
        { id: 'user', label: 'User' }
    ];

    const configurableMenus = [
        { id: 'admin.users.index', label: 'Manajemen Pengguna' },
        { id: 'admin.settings', label: 'Pengaturan Sistem' }
    ];

    return (
        <DashboardLayout>
            <Head title="Pengaturan Sistem — PLO Monitoring" />

            <div className="min-h-screen theme-bg-main p-4 sm:p-6 lg:p-8">
                <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold theme-text-primary tracking-tight">Pengaturan Sistem</h1>
                        <p className="text-base theme-text-muted mt-2">Konfigurasi pengaturan global untuk platform PLO Dashboard.</p>
                    </div>
                </div>

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
                    {/* Theme Settings */}
                    <div className="theme-bg-card theme-border border rounded-3xl overflow-hidden shadow-2xl backdrop-blur-2xl p-8 transition-all hover:shadow-indigo-500/10">
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

                    {/* Running Text Settings */}
                    <div className="theme-bg-card theme-border border rounded-3xl overflow-hidden shadow-2xl backdrop-blur-2xl p-8 transition-all hover:shadow-indigo-500/10">
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

                    {/* Menu Permissions Settings - ONLY FOR ADMIN */}
                    {user?.role === 'admin' && (
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
                                                    return (
                                                        <td key={role.id} className="px-8 py-6 text-center">
                                                            <label className="inline-flex items-center cursor-pointer group">
                                                                <div className="relative flex items-center justify-center">
                                                                    <input 
                                                                        type="checkbox" 
                                                                        checked={isChecked}
                                                                        onChange={() => togglePermission(role.id, menu.id)}
                                                                        className="peer appearance-none w-8 h-8 rounded-lg border-2 theme-border theme-bg-input checked:bg-blue-500 checked:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all cursor-pointer"
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
