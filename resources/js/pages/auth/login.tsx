import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { cn } from '@/lib/utils';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

const DEMO_ACCOUNTS = [
    { email: 'gm@aria.local', role: 'General Manager' },
    { email: 'ops@aria.local', role: 'Operations' },
    { email: 'manager@aria.local', role: 'Department Manager' },
    { email: 'reception@aria.local', role: 'Reception' },
    { email: 'viewer@aria.local', role: 'Viewer' },
];

export default function Login({ status, canResetPassword, canRegister }: Props) {
    const showDemo = import.meta.env.DEV;

    return (
        <AuthLayout
            title="Sign in"
            description="Access the ARIA operations console for Kuriftu Resort."
        >
            <Head title="Log in" />

            {showDemo && (
                <div className="border-border/50 bg-muted/25 mb-6 rounded-xl border px-4 py-3 text-left">
                    <p className="text-muted-foreground mb-2 text-[10px] font-semibold tracking-widest uppercase">
                        Seeded accounts
                    </p>
                    <p className="text-muted-foreground mb-2 text-xs">
                        Password for each: <span className="text-foreground font-mono">password</span>
                    </p>
                    <ul className="max-h-36 space-y-1.5 overflow-y-auto text-xs">
                        {DEMO_ACCOUNTS.map((row) => (
                            <li
                                key={row.email}
                                className="text-muted-foreground flex justify-between gap-2 border-border/30 border-b border-dashed pb-1 last:border-0"
                            >
                                <span className="font-mono text-foreground">{row.email}</span>
                                <span className="shrink-0 text-[11px]">{row.role}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-5">
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-xs font-medium tracking-wide uppercase">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="you@resort.com"
                                    className={cn(
                                        'h-11 rounded-xl border-border/70 bg-background/50',
                                        'focus-visible:ring-primary/30',
                                    )}
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center justify-between gap-2">
                                    <Label
                                        htmlFor="password"
                                        className="text-xs font-medium tracking-wide uppercase"
                                    >
                                        Password
                                    </Label>
                                    {canResetPassword && (
                                        <TextLink href={request()} className="text-xs" tabIndex={5}>
                                            Forgot?
                                        </TextLink>
                                    )}
                                </div>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    className="h-11 rounded-xl border-border/70 bg-background/50"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center gap-3">
                                <Checkbox id="remember" name="remember" tabIndex={3} />
                                <Label htmlFor="remember" className="text-muted-foreground text-sm font-normal">
                                    Remember this device
                                </Label>
                            </div>

                            <Button
                                type="submit"
                                className="h-11 w-full rounded-xl text-sm font-semibold shadow-sm"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner />}
                                Continue
                            </Button>
                        </div>

                        {canRegister && (
                            <div className="text-muted-foreground text-center text-sm">
                                New operator?{' '}
                                <TextLink href={register()} tabIndex={5}>
                                    Create account
                                </TextLink>
                            </div>
                        )}
                    </>
                )}
            </Form>

            {status && (
                <div className="mt-4 text-center text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    {status}
                </div>
            )}
        </AuthLayout>
    );
}
