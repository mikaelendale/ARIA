export default function SocialProof() {
    return (
        <section className="relative z-10 pb-20">
            <div className="mx-auto max-w-4xl px-4 text-center">
                <p className="mb-8 text-sm text-white/50 md:text-base">
                    Built for{' '}
                    <span className="font-semibold text-white/70">
                        Kuriftu Resort
                    </span>{' '}
                    — the first hotel with an autonomous AI operating brain
                </p>

                <div className="flex flex-wrap items-center justify-center gap-6 opacity-50 md:gap-10">

                    <span className="text-xs font-medium tracking-widest text-white/60 uppercase">
                        Twilio
                    </span>
                    <span className="text-xs font-medium tracking-widest text-white/60 uppercase">
                        Laravel
                    </span>
                    <span className="text-xs font-medium tracking-widest text-white/60 uppercase">
                        Reverb
                    </span>
                    <span className="text-xs font-medium tracking-widest text-white/60 uppercase">
                        WhatsApp
                    </span>
                </div>
            </div>
        </section>
    );
}
