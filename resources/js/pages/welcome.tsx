import { Head } from '@inertiajs/react';
import Background from '@/components/landing/Background';
import Hero from '@/components/landing/Hero';
import Navbar from '@/components/landing/Navbar';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    return (
        <>
            <Head title="ARIA — Autonomous Resort Intelligence Agent">
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin="anonymous"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
                    rel="stylesheet"
                />
            </Head>
            <div
                className="relative h-screen overflow-hidden bg-black text-white"
                style={{ fontFamily: "'Inter', sans-serif" }}
            >
                <Background />
                <Navbar canRegister={canRegister} />
                <Hero canRegister={canRegister} />
            </div>
        </>
    );
}
