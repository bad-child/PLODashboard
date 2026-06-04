import { Head } from '@inertiajs/react';
import Dashboard from '@/Components/Dashboard';

export default function ITDashboard() {
    return (
        <>
            <Head title="IT Dashboard — PLO Monitoring" />
            <Dashboard role="it" />
        </>
    );
}
