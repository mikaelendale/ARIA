import { Head } from '@inertiajs/react';
import AboutSection from '@/components/landing/AboutSection';
import AgentsShowcase from '@/components/landing/AgentsShowcase';
import Background from '@/components/landing/Background';
import Footer from '@/components/landing/Footer';
import Navbar from '@/components/landing/Navbar';
import StatsSection from '@/components/landing/StatsSection';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    return (
        <div
            className="min-h-screen bg-black text-white antialiased"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
            <Head title="ARIA — Autonomous Resort Intelligence Agent">
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossOrigin="anonymous"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap"
                    rel="stylesheet"
                />
                <meta
                    name="description"
                    content="ARIA is the autonomous AI system that monitors every signal, resolves issues before guests notice, and drives revenue — in real time."
                />
            </Head>

            <Background />
            <Navbar canRegister={canRegister} />

            {/* Hero: agents showcase over video background */}
            <AgentsShowcase variant="hero" />

            <StatsSection />
            <AboutSection />
            <Footer />
        </div>
    );
}
