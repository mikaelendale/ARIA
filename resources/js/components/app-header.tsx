import { Link, usePage } from '@inertiajs/react';
import {
    LayoutGrid,
    LineChart,
    Menu,
    ShieldAlert,
    Sparkles,
    Users,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import AppLogoIcon from '@/components/app-logo-icon';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { UserMenuContent } from '@/components/user-menu-content';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { roleLabel } from '@/lib/aria-roles';
import { cn } from '@/lib/utils';
import { dashboard, revenue } from '@/routes';
import type { BreadcrumbItem, NavItem } from '@/types';

type Props = {
    breadcrumbs?: BreadcrumbItem[];
};

const mainNavItems: NavItem[] = [
    { title: 'Overview', href: dashboard(), icon: LayoutGrid },
    { title: 'Revenue', href: revenue(), icon: LineChart },
    { title: 'Guests', href: '/guests', icon: Users },
    { title: 'Issues', href: '/incidents', icon: ShieldAlert },
];

const activeStyles =
    'bg-muted/80 text-foreground border';

export function AppHeader({ breadcrumbs = [] }: Props) {
    const page = usePage();
    const { auth } = page.props;
    const { isCurrentUrl, whenCurrentUrl } = useCurrentUrl();

    return (
        <>
            <header className="sticky top-0 z-50 border-b border-border/60 bg-background/75 backdrop-blur-xl">
                <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:h-16 sm:px-6">
                    <div className="lg:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="shrink-0">
                                    <Menu className="size-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-72 border-border/60 bg-background/95">
                                <SheetTitle className="sr-only">Navigation</SheetTitle>
                                <SheetHeader className="border-b border-border/50 pb-4 text-left">
                                    <AppLogoIcon className="size-8 fill-foreground" />
                                    <p className="text-muted-foreground text-xs leading-snug">
                                        Kuriftu — guest & operations overview
                                    </p>
                                </SheetHeader>
                                <nav className="mt-6 flex flex-col gap-1">
                                    {mainNavItems.map((item) => (
                                        <Link
                                            key={item.title}
                                            href={item.href}
                                            className={cn(
                                                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                                                isCurrentUrl(item.href)
                                                    ? 'bg-primary/10 text-foreground'
                                                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                                            )}
                                        >
                                            {item.icon && <item.icon className="size-4 opacity-80" />}
                                            {item.title}
                                        </Link>
                                    ))}
                                </nav>
                            </SheetContent>
                        </Sheet>
                    </div>

                    <Link
                        href={dashboard()}
                        prefetch
                        className="flex shrink-0 items-center gap-2 transition-opacity hover:opacity-90"
                    >
                        <AppLogoIcon /> ARIA
                    </Link>

                    <div className="hidden h-full flex-1 items-center lg:flex lg:pl-6">
                        <NavigationMenu className="flex h-full max-w-max items-stretch">
                            <NavigationMenuList className="flex h-full items-stretch gap-1">
                                {mainNavItems.map((item, index) => (
                                    <NavigationMenuItem
                                        key={index}
                                        className="relative flex h-full items-center"
                                    >
                                        <Link
                                            href={item.href}
                                            prefetch
                                            className={cn(
                                                navigationMenuTriggerStyle(),
                                                whenCurrentUrl(item.href, activeStyles),
                                                'text-muted-foreground hover:text-foreground h-9 cursor-pointer rounded-lg px-3 text-sm font-medium',
                                            )}
                                        >
                                            {item.icon && <item.icon className="mr-2 size-4 opacity-70" />}
                                            {item.title}
                                        </Link>
                                        {isCurrentUrl(item.href) && (
                                            <span className="bg-primary absolute bottom-0 left-2 right-2 h-0.5 rounded-full" />
                                        )}
                                    </NavigationMenuItem>
                                ))}
                            </NavigationMenuList>
                        </NavigationMenu>
                    </div>

                    <div className="ml-auto flex items-center gap-2">
                        <div className="text-muted-foreground hidden items-center gap-1.5 rounded-full border border-border/50 bg-muted/30 px-3 py-1 text-xs font-medium sm:flex">
                            <Sparkles className="size-3.5 text-amber-600/90 dark:text-amber-400/90" />
                            <span>{roleLabel(auth.user.role as string | undefined)}</span>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="ring-offset-background focus-visible:ring-ring relative size-10 rounded-full p-0 focus-visible:ring-2"
                                >
                                    <span className="sr-only">Open menu</span>
                                    <span className="flex size-9 items-center justify-center rounded-full bg-linear-to-br from-zinc-200 to-zinc-300 text-sm font-semibold text-zinc-800 dark:from-zinc-600 dark:to-zinc-700 dark:text-zinc-100">
                                        {auth.user.name
                                            .split(' ')
                                            .map((n) => n[0])
                                            .join('')
                                            .slice(0, 2)
                                            .toUpperCase()}
                                    </span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="min-w-56 rounded-xl" align="end">
                                <UserMenuContent user={auth.user} />
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {breadcrumbs.length > 1 && (
                    <div className="border-border/50 border-t bg-muted/20">
                        <div className="text-muted-foreground mx-auto flex h-11 max-w-6xl items-center px-4 text-sm sm:px-6">
                            <Breadcrumbs breadcrumbs={breadcrumbs} />
                        </div>
                    </div>
                )}
            </header>
        </>
    );
}
