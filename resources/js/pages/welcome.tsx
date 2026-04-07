import { Head } from '@inertiajs/react';
import AboutSection from '@/components/landing/AboutSection';
import AgentsShowcase from '@/components/landing/AgentsShowcase';
import AriaHighlightCards from '@/components/landing/AriaHighlightCards';
import AriaSystemHero from '@/components/landing/AriaSystemHero';
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
            className="min-h-screen bg-background text-foreground antialiased"
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
                    href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap"
                    rel="stylesheet"
                />
                <meta
                    name="description"
                    content="ARIA is Kuriftu Resort's always-on Autonomous Resort Intelligence Agent: she runs the hotel—monitoring, deciding, and acting across WhatsApp, voice, and ops before you're asked."
                />
            </Head>

            <Navbar canRegister={canRegister} variant="light" />

            <AriaSystemHero canRegister={canRegister} />
            <AriaHighlightCards />
            <AgentsShowcase />
            {/* <StatsSection /> */}
            {/* <AboutSection /> */}
            <Footer />
        </div>
    );
}
