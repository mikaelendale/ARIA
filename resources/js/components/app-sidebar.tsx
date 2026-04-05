import { Link } from '@inertiajs/react';
import { Activity, LayoutGrid, MessageSquare, LineChart, Presentation, ShieldAlert, Users, Video, User } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard, revenue } from '@/routes';
import type { NavItem } from '@/types';
import { NavSub } from '@/components/nav-sub';
import { Knife } from '@phosphor-icons/react';
const subNavItems: NavItem[] = [
    {
        title: 'Guest portal',
        href: '/guest/voice',
        icon: User,
    },
    {
        title: 'Kitchen',
        href: '/kitchen?token=1234567890',
        icon: Knife,
    }
];
const mainNavItems: NavItem[] = [
    {
        title: 'Overview',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Revenue',
        href: revenue(),
        icon: LineChart,
    },
    {
        title: 'Guests',
        href: '/guests',
        icon: Users,
    },
    {
        title: 'Issues',
        href: '/incidents',
        icon: ShieldAlert,
    },
];

const demoVideoUrl = import.meta.env.VITE_DEMO_VIDEO_URL?.trim() || '#';
const pitchdeckUrl = import.meta.env.VITE_PITCHDECK_URL?.trim() || '#';

const footerNavItems: NavItem[] = [
    {
        title: 'Demo video',
        href: demoVideoUrl,
        icon: Video,
    },
    {
        title: 'Pitch deck',
        href: pitchdeckUrl,
        icon: Presentation,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
                <NavSub items={subNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
