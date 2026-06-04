import { Head } from '@inertiajs/react';
import Dashboard from '@/Components/Dashboard';

export default function AdminDashboard() {
    return (
        <>
            <Head title="Admin Dashboard — PLO Monitoring" />
            <Dashboard role="admin" />
        </>
    );
}
