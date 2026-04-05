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
    { email: 'gm@aria.local', label: 'General manager' },
    { email: 'ops@aria.local', label: 'Front office & ops' },
    { email: 'manager@aria.local', label: 'Department lead' },
    { email: 'reception@aria.local', label: 'Reception' },
    { email: 'viewer@aria.local', label: 'View only' },
];

export default function Login({ status, canResetPassword, canRegister }: Props) {
    const showDemo = import.meta.env.DEV;

    return (
        <AuthLayout
            title="Welcome back"
            description="Use the email and password from your team. You’ll open the same guest and room overview your colleagues use."
        >
            <Head title="Sign in" />

            {/* {showDemo && ( */}
                <div className="border-border/50 bg-muted/25 mb-6 rounded-xl border px-4 py-3 text-left">
                    <p className="text-foreground mb-1 text-sm font-medium">Try the app on this computer</p>
                    <p className="text-muted-foreground mb-3 text-xs leading-relaxed">
                        Sample sign-ins for local testing. Use the password:{' '}
                        <span className="text-foreground font-medium bg-amber-300">password</span>
                    </p>
                    <ul className="max-h-36 space-y-1.5 overflow-y-auto text-xs">
                        {DEMO_ACCOUNTS.map((row) => (
                            <li
                                key={row.email}
                                className="text-muted-foreground flex justify-between gap-2 border-border/30 border-b border-dashed pb-1 last:border-0"
                            >
                                <span className="font-mono text-foreground">{row.email}</span>
                                <span className="shrink-0 text-[11px]">{row.label}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            {/* )} */}

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-5">
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-sm font-medium">
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
                                    placeholder="name@yourworkemail.com"
                                    className={cn(
                                        'h-11 rounded-xl border-border/70 bg-background/50',
                                        'focus-visible:ring-primary/30',
                                    )}
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center justify-between gap-2">
                                    <Label htmlFor="password" className="text-sm font-medium">
                                        Password
                                    </Label>
                                    {canResetPassword && (
                                        <TextLink href={request()} className="text-xs" tabIndex={5}>
                                            Forgot password?
                                        </TextLink>
                                    )}
                                </div>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="Your password"
                                    className="h-11 rounded-xl border-border/70 bg-background/50"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center gap-3">
                                <Checkbox id="remember" name="remember" tabIndex={3} />
                                <Label htmlFor="remember" className="text-muted-foreground text-sm font-normal leading-snug">
                                    Stay signed in on this device
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
                                Sign in
                            </Button>
                        </div>

                        {canRegister && (
                            <div className="text-muted-foreground text-center text-sm leading-relaxed">
                                New here?{' '}
                                <TextLink href={register()} tabIndex={5}>
                                    Create an account
                                </TextLink>
                            </div>
                        )}
                    </>
                )}
            </Form>

            {status && (
                <div
                    className="mt-4 text-center text-sm font-medium text-emerald-600 dark:text-emerald-400"
                    role="status"
                >
                    {status}
                </div>
            )}
        </AuthLayout>
    );
}
