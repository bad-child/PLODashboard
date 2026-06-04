import { Head } from '@inertiajs/react';
import Dashboard from '@/Components/Dashboard';

export default function CCDashboard() {
    return (
        <>
            <Head title="CC Dashboard — PLO Monitoring" />
            <Dashboard role="cc" />
        </>
    );
}
