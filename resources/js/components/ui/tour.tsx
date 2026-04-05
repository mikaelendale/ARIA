'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import {
    arrow,
    autoUpdate,
    flip,
    FloatingArrow,
    FloatingFocusManager,
    FloatingPortal,
    offset,
    shift,
    useFloating,
} from '@floating-ui/react';
import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type TourStepDef = {
    /** CSS selector (e.g. `.step-1` or `[data-tour="x"]`) or a bare class name `step-1` → `.step-1` */
    target: string;
    step: React.ReactNode;
};

type TourFloatingContextValue = ReturnType<typeof useFloating> & {
    arrowRef: React.RefObject<SVGSVGElement | null>;
};

const TourFloatingContext = React.createContext<TourFloatingContextValue | null>(null);

function useTourFloating(): TourFloatingContextValue {
    const ctx = React.useContext(TourFloatingContext);
    if (!ctx) {
        throw new Error('TourArrow, TourStep, and TourFooter must be used inside TourContent');
    }

    return ctx;
}

type TourContextValue = {
    isOpen: boolean;
    open: () => void;
    close: () => void;
    next: () => void;
    prev: () => void;
    currentStep: number;
    setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
    totalSteps: number;
    steps: TourStepDef[];
    referenceElement: HTMLElement | null;
    closeOnBackdrop: boolean;
};

const TourContext = React.createContext<TourContextValue | null>(null);

export function useTour(): TourContextValue {
    const ctx = React.useContext(TourContext);
    if (!ctx) {
        throw new Error('useTour must be used within Tour');
    }

    return ctx;
}

export function resolveTourTarget(target: string): string {
    if (target.startsWith('[') || target.startsWith('#') || target.startsWith('.')) {
        return target;
    }

    return `.${CSS.escape(target)}`;
}

type TourProps = {
    steps: TourStepDef[];
    children: React.ReactNode;
    /** Controlled open state */
    isOpen?: boolean;
    /** Uncontrolled default */
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    onClose?: () => void;
    /** Close when clicking the dimmed backdrop (default true) */
    closeOnBackdrop?: boolean;
};

export function Tour({
    steps,
    children,
    isOpen: controlledOpen,
    defaultOpen = false,
    onOpenChange,
    onClose,
    closeOnBackdrop = true,
}: TourProps) {
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
    const [currentStep, setCurrentStep] = React.useState(0);
    const isControlled = controlledOpen !== undefined;
    const isOpen = isControlled ? controlledOpen : uncontrolledOpen;

    const setOpen = React.useCallback(
        (next: boolean) => {
            if (!isControlled) {
                setUncontrolledOpen(next);
            }
            onOpenChange?.(next);
            if (!next) {
                onClose?.();
            }
        },
        [isControlled, onOpenChange, onClose],
    );

    const open = React.useCallback(() => {
        setOpen(true);
    }, [setOpen]);

    const close = React.useCallback(() => {
        setOpen(false);
    }, [setOpen]);

    const totalSteps = steps.length;

    const next = React.useCallback(() => {
        setCurrentStep((s) => {
            if (s >= totalSteps - 1) {
                return s;
            }

            return s + 1;
        });
    }, [totalSteps]);

    const prev = React.useCallback(() => {
        setCurrentStep((s) => Math.max(0, s - 1));
    }, []);

    React.useEffect(() => {
        if (!isOpen) {
            return;
        }

        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = prevOverflow;
        };
    }, [isOpen]);

    React.useEffect(() => {
        if (isOpen) {
            setCurrentStep(0);
        }
    }, [isOpen]);

    const [referenceElement, setReferenceElement] = React.useState<HTMLElement | null>(null);

    React.useLayoutEffect(() => {
        if (!isOpen || totalSteps === 0) {
            setReferenceElement(null);

            return;
        }

        const sel = resolveTourTarget(steps[currentStep]?.target ?? '');
        const el = document.querySelector(sel);

        if (el instanceof HTMLElement) {
            setReferenceElement(el);
            el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        } else {
            setReferenceElement(null);
        }
    }, [isOpen, currentStep, steps, totalSteps]);

    const value = React.useMemo<TourContextValue>(
        () => ({
            isOpen,
            open,
            close,
            next,
            prev,
            currentStep,
            setCurrentStep,
            totalSteps,
            steps,
            referenceElement,
            closeOnBackdrop,
        }),
        [isOpen, open, close, next, prev, currentStep, totalSteps, steps, referenceElement, closeOnBackdrop],
    );

    return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}

export function TourTrigger({
    asChild = false,
    children,
    ...props
}: React.ComponentProps<'button'> & { asChild?: boolean }) {
    const { open } = useTour();
    const Comp = asChild ? Slot : 'button';

    return (
        <Comp type="button" onClick={() => open()} {...props}>
            {children}
        </Comp>
    );
}

function useHighlightRect(referenceElement: HTMLElement | null): DOMRect | null {
    const [rect, setRect] = React.useState<DOMRect | null>(null);

    React.useLayoutEffect(() => {
        if (!referenceElement) {
            setRect(null);

            return;
        }

        const update = (): void => {
            setRect(referenceElement.getBoundingClientRect());
        };

        update();
        const ro = new ResizeObserver(update);
        ro.observe(referenceElement);
        window.addEventListener('resize', update);
        window.addEventListener('scroll', update, true);

        return () => {
            ro.disconnect();
            window.removeEventListener('resize', update);
            window.removeEventListener('scroll', update, true);
        };
    }, [referenceElement]);

    return rect;
}

const DIM_PANEL =
    'fixed z-100 bg-background/75 backdrop-blur-[2px] dark:bg-black/50 dark:backdrop-blur-sm';

/**
 * Dim only the regions *outside* the highlight rect so the toured element stays sharp.
 * A full-screen backdrop + blur sits on top of the whole page, so the “hole” still looked blurred.
 */
function TourDimmingPanels({
    rect,
    closeOnBackdrop,
    onBackdropClick,
    className,
}: {
    rect: DOMRect | null;
    closeOnBackdrop: boolean;
    onBackdropClick: () => void;
    className?: string;
}) {
    const handle = (): void => {
        if (closeOnBackdrop) {
            onBackdropClick();
        }
    };

    const pe = closeOnBackdrop ? 'pointer-events-auto' : 'pointer-events-none';

    const panelBase = cn(DIM_PANEL, className);

    if (!rect) {
        return (
            <button
                type="button"
                aria-label="Close tour"
                className={cn(panelBase, 'inset-0', pe)}
                onClick={handle}
            />
        );
    }

    const pad = 8;
    const left = rect.left - pad;
    const top = rect.top - pad;
    const width = rect.width + pad * 2;
    const height = rect.height + pad * 2;
    const vw = typeof window !== 'undefined' ? window.innerWidth : 0;

    return (
        <>
            {/* Top */}
            <button
                type="button"
                aria-hidden
                tabIndex={-1}
                className={cn(panelBase, 'left-0 right-0 top-0', pe)}
                style={{ height: Math.max(0, top) }}
                onClick={handle}
            />
            {/* Bottom */}
            <button
                type="button"
                aria-hidden
                tabIndex={-1}
                className={cn(panelBase, 'bottom-0 left-0 right-0', pe)}
                style={{ top: top + height }}
                onClick={handle}
            />
            {/* Left (middle band) */}
            <button
                type="button"
                aria-hidden
                tabIndex={-1}
                className={cn(panelBase, 'left-0', pe)}
                style={{
                    top,
                    width: Math.max(0, left),
                    height,
                }}
                onClick={handle}
            />
            {/* Right (middle band) */}
            <button
                type="button"
                aria-hidden
                tabIndex={-1}
                className={cn(panelBase, 'right-0', pe)}
                style={{
                    top,
                    left: left + width,
                    width: Math.max(0, vw - left - width),
                    height,
                }}
                onClick={handle}
            />
        </>
    );
}

export function TourOverlay({ className }: { className?: string }) {
    const { isOpen, referenceElement, close, closeOnBackdrop } = useTour();
    const rect = useHighlightRect(referenceElement);

    if (!isOpen) {
        return null;
    }

    return (
        <FloatingPortal>
            <div className="pointer-events-none fixed inset-0 z-[100]" aria-hidden>
                <TourDimmingPanels
                    rect={rect}
                    closeOnBackdrop={closeOnBackdrop}
                    onBackdropClick={close}
                    className={className}
                />
                {/* Ring only — dimming is the four panels; no full-screen layer over the hole */}
                {rect ? (
                    <div
                        className="border-primary/70 pointer-events-none fixed z-[101] rounded-md border-2 ring-1 ring-white/15"
                        style={{
                            left: rect.left - 8,
                            top: rect.top - 8,
                            width: rect.width + 16,
                            height: rect.height + 16,
                        }}
                    />
                ) : null}
            </div>
        </FloatingPortal>
    );
}

export function TourContent({ children, className }: { children: React.ReactNode; className?: string }) {
    const { isOpen, referenceElement } = useTour();
    const arrowRef = React.useRef<SVGSVGElement | null>(null);

    const floating = useFloating({
        elements: {
            reference: referenceElement,
        },
        placement: 'bottom',
        strategy: 'fixed',
        middleware: [offset(14), flip({ fallbackPlacements: ['top', 'left', 'right'] }), shift({ padding: 12 }), arrow({ element: arrowRef })],
        whileElementsMounted: autoUpdate,
    });

    const { refs, floatingStyles, context } = floating;

    const floatingValue = React.useMemo(
        () => ({
            ...floating,
            arrowRef,
        }),
        [floating, arrowRef],
    );

    if (!isOpen) {
        return null;
    }

    const panel = (
        <div
            ref={refs.setFloating}
            style={referenceElement ? floatingStyles : undefined}
            className={cn(
                'border-border bg-popover text-popover-foreground z-[102] w-[min(420px,calc(100vw-2rem))] rounded-lg border p-5 shadow-lg',
                !referenceElement && 'fixed top-1/2 left-1/2 max-h-[min(80dvh,560px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto',
                className,
            )}
        >
            {children}
        </div>
    );

    return (
        <TourFloatingContext.Provider value={floatingValue}>
            <FloatingPortal>
                {referenceElement ? (
                    <FloatingFocusManager context={context} modal={false} initialFocus={-1}>
                        {panel}
                    </FloatingFocusManager>
                ) : (
                    panel
                )}
            </FloatingPortal>
        </TourFloatingContext.Provider>
    );
}

export function TourArrow({ className }: { className?: string }) {
    const { referenceElement } = useTour();
    const { context, arrowRef } = useTourFloating();

    if (!referenceElement) {
        return null;
    }

    return (
        <FloatingArrow
            ref={arrowRef}
            context={context}
            className={cn('fill-popover [&>path:first-of-type]:stroke-border', className)}
            height={10}
            width={18}
        />
    );
}

export function TourStep({ className }: { className?: string }) {
    const { steps, currentStep } = useTour();
    const step = steps[currentStep];

    if (!step) {
        return null;
    }

    return <div className={cn('text-sm leading-relaxed', className)}>{step.step}</div>;
}

type TourFooterProps = {
    className?: string;
    /** Optional slot before buttons (e.g. step dots) */
    children?: React.ReactNode;
    nextButtonClassName?: string;
    prevButtonClassName?: string;
};

export function TourFooter({ className, children, nextButtonClassName, prevButtonClassName }: TourFooterProps) {
    const { currentStep, totalSteps, next, prev, close } = useTour();
    const last = currentStep >= totalSteps - 1;

    return (
        <div className={cn('mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4', className)}>
            <span className="text-muted-foreground text-xs font-medium tabular-nums">
                {currentStep + 1} / {totalSteps}
            </span>
            <div className="flex flex-wrap items-center gap-2">
                {children}
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={cn('rounded-md', prevButtonClassName)}
                    disabled={currentStep === 0}
                    onClick={() => prev()}
                >
                    Back
                </Button>
                <Button
                    type="button"
                    size="sm"
                    className={cn('rounded-md', nextButtonClassName)}
                    onClick={() => {
                        if (last) {
                            close();
                        } else {
                            next();
                        }
                    }}
                >
                    {last ? 'Finish' : 'Next'}
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground size-8 shrink-0 rounded-md"
                    aria-label="Close tour"
                    onClick={() => close()}
                >
                    <X className="size-4" />
                </Button>
            </div>
        </div>
    );
}
