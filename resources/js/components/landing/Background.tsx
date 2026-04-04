export default function Background() {
    return (
        <div className="fixed inset-0 z-0 bg-[#020202] overflow-hidden pointer-events-none">
            {/* Extremely subtle ambient mesh glow behind the main screen */}
            <div className="absolute top-[20%] left-[20%] w-[50vw] h-[50vh] bg-emerald-900/10 blur-[150px] rounded-full" />
            <div className="absolute bottom-[10%] right-[20%] w-[40vw] h-[40vh] bg-indigo-900/10 blur-[120px] rounded-full" />
            
            {/* A subtle noise grain over the deepest background */}
            <div className="absolute inset-0 opacity-[0.02] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] mix-blend-overlay" />
        </div>
    );
}
