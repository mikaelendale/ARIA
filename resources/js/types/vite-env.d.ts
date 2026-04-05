/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_DEMO_VIDEO_URL?: string;
    readonly VITE_PITCHDECK_URL?: string;
    /** Optional MP4 URL for the landing hero background (e.g. `/videos/hero.mp4` or full URL). */
    readonly VITE_HERO_VIDEO_URL?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
