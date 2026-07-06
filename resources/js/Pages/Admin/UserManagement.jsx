import { Head, useForm, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '@/Layouts/DashboardLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';

export default function UserManagement({ users, availableRoles = {} }) {
    const { flash } = usePage().props;
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: '',
        nik: '',
        jabatan: '',
        email: '',
        role: 'user',
        password: '',
    });

    // Handle form submit
    const submit = (e) => {
        e.preventDefault();
        post(route('admin.users.store'), {
            onSuccess: () => {
                closeModal();
            },
        });
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
        clearErrors();
        setQuery('');
        setResults([]);
    };

    // HRD API Search State
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    
    useEffect(() => {
        if (query.length < 2) {
            setResults([]);
            return;
        }
        const timeout = setTimeout(() => {
            axios.get(route('admin.users.search_karyawan') + '?q=' + query)
                .then(res => setResults(res.data))
                .catch(err => console.error(err));
        }, 300);
        return () => clearTimeout(timeout);
    }, [query]);

    const handleDelete = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus akun ini secara permanen?')) {
            router.delete(route('admin.users.destroy', id));
        }
    };

    const handleResetPassword = (id) => {
        if (confirm('Apakah Anda yakin ingin mereset password akun ini menjadi "12345678"?')) {
            router.post(route('admin.users.reset_password', id));
        }
    };

    return (
        <DashboardLayout>
            <Head title="Manajemen Pengguna — PLO Monitoring" />

            <div className="min-h-screen theme-bg-main p-4 sm:p-6 lg:p-8">
                {/* Header & Add Button */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold theme-text-primary tracking-tight">Manajemen Pengguna</h1>
                        <p className="text-base theme-text-muted mt-2">Kelola akses dan akun pengguna sistem secara menyeluruh.</p>
                    </div>
                    <PrimaryButton onClick={() => setIsModalOpen(true)} className="h-12 px-6 rounded-xl shadow-lg shadow-indigo-500/30 whitespace-nowrap">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Tambah Pengguna
                    </PrimaryButton>
                </div>

                {/* Flash Message */}
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
                {flash?.error && (
                    <div className="mb-8 p-5 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-4 shadow-sm backdrop-blur-md">
                        <div className="bg-red-500/20 p-2 rounded-full">
                            <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <span className="text-red-400 font-semibold text-lg">{flash.error}</span>
                    </div>
                )}

                {/* Users Table */}
                <div className="theme-bg-card border theme-border rounded-3xl overflow-hidden shadow-2xl backdrop-blur-2xl transition-all">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm theme-text-primary">
                            <thead className="text-xs uppercase theme-table-header theme-text-muted tracking-wider">
                                <tr>
                                    <th className="px-8 py-5 font-semibold">Pengguna</th>
                                    <th className="px-8 py-5 font-semibold">Peran</th>
                                    <th className="px-8 py-5 font-semibold">Aktivitas Terakhir</th>
                                    <th className="px-8 py-5 font-semibold text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y theme-border">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:opacity-80 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-base theme-text-primary">{user.name}</span>
                                                <span className="text-xs theme-text-muted mt-1">NIK: {user.nik || '-'} &bull; {user.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-3 py-1.5 text-xs font-bold tracking-wider rounded-full border ${
                                                user.role === 'admin' ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' :
                                                user.role === 'it' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                                                user.role === 'cc' ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' :
                                                'bg-blue-500/10 border-blue-500/30 text-blue-400'
                                            }`}>
                                                {(availableRoles[user.role] || user.role).toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="theme-text-primary font-medium">{user.last_login_at ? new Date(user.last_login_at).toLocaleString('id-ID') : 'Belum pernah login'}</span>
                                                {user.last_login_ip && (
                                                    <span className="text-xs theme-text-muted mt-1" title={user.last_device}>
                                                        IP: {user.last_login_ip}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleResetPassword(user.id)}
                                                    className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl hover:bg-amber-500/20 transition-colors"
                                                    title="Reset Password ke 'password'"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="p-2.5 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-colors"
                                                    title="Hapus Akun"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                            Belum ada pengguna.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Add User Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
                    <div className="theme-bg-card border theme-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative">
                        {/* Close button */}
                        <button 
                            onClick={closeModal}
                            className="absolute top-4 right-4 theme-text-muted hover:theme-text-primary transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div className="p-6 sm:p-8">
                            <h2 className="text-xl font-bold theme-text-primary mb-6">Tambah Pengguna Baru</h2>

                            <form onSubmit={submit} className="space-y-4">
                                <div>
                                    <InputLabel htmlFor="name" value="Nama Lengkap (Otomatis dari HRD)" className="theme-text-primary" />
                                    <TextInput
                                        id="name"
                                        type="text"
                                        name="name"
                                        value={data.name}
                                        className="mt-1 block w-full theme-bg-input theme-border theme-text-primary placeholder-gray-500 focus:border-indigo-500 focus:ring-indigo-500 opacity-60 cursor-not-allowed"
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                        readOnly
                                    />
                                    {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                                </div>

                                <div className="relative">
                                    <InputLabel htmlFor="nik" value="NIK Karyawan" className="theme-text-primary" />
                                    <TextInput
                                        id="nik"
                                        type="text"
                                        name="nik"
                                        value={data.nik}
                                        className="mt-1 block w-full theme-bg-input theme-border theme-text-primary placeholder-gray-500 focus:border-indigo-500 focus:ring-indigo-500"
                                        onChange={(e) => {
                                            setData('nik', e.target.value);
                                            setQuery(e.target.value);
                                            setShowDropdown(true);
                                        }}
                                        onFocus={() => setShowDropdown(true)}
                                        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                                        required
                                        placeholder="Ketik NIK atau Nama..."
                                        autoComplete="off"
                                    />
                                    {showDropdown && results.length > 0 && (
                                        <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl theme-bg-card border theme-border py-1 text-base shadow-2xl focus:outline-none sm:text-sm">
                                            {results.map(r => (
                                                <li
                                                    key={r.NIK}
                                                    className="relative cursor-pointer select-none py-2 pl-3 pr-9 theme-text-primary hover:bg-indigo-500/20 transition-colors"
                                                    onClick={() => {
                                                        setData(prev => ({
                                                            ...prev,
                                                            nik: r.NIK,
                                                            name: r.Nama,
                                                            jabatan: r.Jabatan || '-',
                                                            email: r.Email || `${r.NIK}@hrd.local`
                                                        }));
                                                        setShowDropdown(false);
                                                    }}
                                                >
                                                    <span className="block truncate font-bold">{r.NIK}</span>
                                                    <span className="block truncate theme-text-muted text-xs">{r.Nama}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    {errors.nik && <p className="text-red-400 text-xs mt-1">{errors.nik}</p>}
                                </div>

                                <div>
                                    <InputLabel htmlFor="jabatan" value="Jabatan (Otomatis dari HRD)" className="theme-text-primary" />
                                    <TextInput
                                        id="jabatan"
                                        type="text"
                                        name="jabatan"
                                        value={data.jabatan}
                                        className="mt-1 block w-full theme-bg-input theme-border theme-text-primary placeholder-gray-500 focus:border-indigo-500 focus:ring-indigo-500 opacity-60 cursor-not-allowed"
                                        readOnly
                                    />
                                </div>

                                <div>
                                    <InputLabel htmlFor="role" value="Role (Hak Akses)" className="theme-text-primary" />
                                    <select
                                        id="role"
                                        name="role"
                                        value={data.role}
                                        className="mt-1 block w-full theme-bg-input theme-border theme-text-primary rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        onChange={(e) => setData('role', e.target.value)}
                                    >
                                        {Object.entries(availableRoles).map(([slug, name]) => (
                                            <option key={slug} value={slug}>{name}</option>
                                        ))}
                                    </select>
                                    {errors.role && <p className="text-red-400 text-xs mt-1">{errors.role}</p>}
                                </div>

                                <div>
                                    <InputLabel htmlFor="password" value="Password" className="theme-text-primary" />
                                    <TextInput
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={data.password}
                                        className="mt-1 block w-full theme-bg-input theme-border theme-text-primary placeholder-gray-500 focus:border-indigo-500 focus:ring-indigo-500"
                                        onChange={(e) => setData('password', e.target.value)}
                                        required
                                    />
                                    {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
                                </div>

                                <div className="mt-6 flex justify-end gap-3 pt-4 border-t theme-border">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="px-4 py-2 text-sm font-medium theme-text-primary theme-bg-card border theme-border rounded-lg hover:bg-white/10 transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <PrimaryButton className="ml-4" disabled={processing}>
                                        {processing ? 'Menyimpan...' : 'Simpan Pengguna'}
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
