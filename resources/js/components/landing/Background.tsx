const heroVideoSrc = import.meta.env.VITE_HERO_VIDEO_URL?.trim();

export default function Background() {
    return (
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#010101]">
            {heroVideoSrc ? (
                <video
                    className="absolute inset-0 h-full w-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                    aria-hidden
                >
                    <source src={heroVideoSrc} type="video/mp4" />
                </video>
            ) : null}

            {/* Readability overlay — keeps text crisp over video or when no video */}
            <div
                className={`absolute inset-0 ${heroVideoSrc ? 'bg-black/55' : 'bg-black'}`}
            />

            {/* Subtle film grain */}
            <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')]" />
        </div>
    );
}
