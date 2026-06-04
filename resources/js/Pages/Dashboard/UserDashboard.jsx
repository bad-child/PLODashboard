import { Head } from '@inertiajs/react';
import Dashboard from '@/Components/Dashboard';

export default function UserDashboard() {
    return (
        <>
            <Head title="User Dashboard — PLO Monitoring" />
            <Dashboard role="user" />
        </>
    );
}
