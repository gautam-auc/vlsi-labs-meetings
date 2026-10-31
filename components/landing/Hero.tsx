"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/**
 * High-tech kinetic motion background active ONLY in light mode.
 * Combines warm cream ambiance, luminous floating orbs, and a 60 FPS
 * fluid silicon wave canvas simulation. Completely hidden in dark mode.
 */
function LightModeMotionBackground() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        let width = 0;
        let height = 0;

        const resize = () => {
            if (!canvas) return;
            const rect = canvas.getBoundingClientRect();
            width = rect.width;
            height = rect.height;
            canvas.width = Math.floor(width * dpr);
            canvas.height = Math.floor(height * dpr);
            ctx.scale(dpr, dpr);
        };

        resize();
        window.addEventListener("resize", resize);

        // Floating silicon pulse particles
        const particleCount = 22;
        const particles = Array.from({ length: particleCount }, () => ({
            x: Math.random() * (width || 800),
            y: Math.random() * (height || 600),
            radius: Math.random() * 2 + 1.2,
            vx: (Math.random() - 0.5) * 0.45,
            vy: (Math.random() - 0.5) * 0.35,
            alpha: Math.random() * 0.5 + 0.25,
            pulseSpeed: Math.random() * 0.02 + 0.01,
            pulsePhase: Math.random() * Math.PI * 2,
        }));

        let step = 0;

        const render = () => {
            step += 0.012;
            ctx.clearRect(0, 0, width, height);

            // Flowing kinetic wave layers (semiconductor signals & fluid silk)
            const waveLayers = [
                {
                    amplitude: 50,
                    wavelength: 0.0028,
                    speed: 0.015,
                    offsetY: height * 0.42,
                    color: "rgba(37, 99, 235, 0.16)", // Primary blue
                    fillColor: "rgba(59, 130, 246, 0.05)",
                    lineWidth: 2.5,
                },
                {
                    amplitude: 65,
                    wavelength: 0.0022,
                    speed: 0.011,
                    offsetY: height * 0.52,
                    color: "rgba(6, 182, 212, 0.20)", // Cyan
                    fillColor: "rgba(6, 182, 212, 0.04)",
                    lineWidth: 2,
                },
                {
                    amplitude: 40,
                    wavelength: 0.0038,
                    speed: 0.020,
                    offsetY: height * 0.62,
                    color: "rgba(99, 102, 241, 0.14)", // Indigo
                    fillColor: "rgba(99, 102, 241, 0.03)",
                    lineWidth: 1.8,
                },
            ];

            // Draw wave ribbons with gradient fills
            waveLayers.forEach((w, index) => {
                ctx.beginPath();
                ctx.lineWidth = w.lineWidth;
                ctx.strokeStyle = w.color;

                for (let x = 0; x <= width + 8; x += 6) {
                    const y =
                        w.offsetY +
                        Math.sin(x * w.wavelength + step * (index + 1) * 0.9) *
                            w.amplitude +
                        Math.cos(x * 0.0012 + step * 0.6) * (w.amplitude * 0.35);

                    if (x === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                ctx.stroke();

                // Soft translucent gradient fill under the wave ribbon
                ctx.lineTo(width, height);
                ctx.lineTo(0, height);
                ctx.closePath();
                ctx.fillStyle = w.fillColor;
                ctx.fill();
            });

            // Draw glowing EDA data pulses drifting along the stream
            particles.forEach((p) => {
                p.x += p.vx;
                p.y += p.vy;
                p.pulsePhase += p.pulseSpeed;

                if (p.x < 0) p.x = width;
                if (p.x > width) p.x = 0;
                if (p.y < 0) p.y = height;
                if (p.y > height) p.y = 0;

                const currentAlpha = p.alpha + Math.sin(p.pulsePhase) * 0.2;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(37, 99, 235, ${Math.max(0.1, currentAlpha * 0.6)})`;
                ctx.fill();

                // Subtle halo around key pulse nodes
                if (p.radius > 2) {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(6, 182, 212, ${Math.max(0.02, currentAlpha * 0.15)})`;
                    ctx.fill();
                }
            });

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener("resize", resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden block dark:hidden">
            {/* Luminous Warm Cream & Pearl Horizon Ambience */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_65%_at_50%_0%,rgba(241,245,249,0.85),rgba(255,255,255,0.4)_60%,transparent_100%)]" />
            
            {/* Ambient soft glow orbs in cream, sky-blue, and soft amber */}
            <div className="absolute -top-24 left-1/5 h-96 w-96 rounded-full bg-blue-400/12 blur-[110px]" />
            <div className="absolute top-1/4 right-1/6 h-[26rem] w-[26rem] rounded-full bg-cyan-400/14 blur-[120px]" />
            <div className="absolute bottom-10 left-1/3 h-80 w-80 rounded-full bg-amber-200/25 blur-[100px]" />

            {/* 60 FPS Silicon Flowing Waves Canvas with Feathered Radial Vignette */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 h-full w-full"
                style={{
                    maskImage: "radial-gradient(ellipse 95% 85% at 50% 48%, black 45%, transparent 95%)",
                    WebkitMaskImage: "radial-gradient(ellipse 95% 85% at 50% 48%, black 45%, transparent 95%)",
                }}
            />
        </div>
    );
}

export default function Hero() {
    const router = useRouter();
    const [joinInput, setJoinInput] = useState("");
    const [joinError, setJoinError] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    const handleJoinSubmit = (e: FormEvent) => {
        e.preventDefault();
        setJoinError("");
        const raw = joinInput.trim();
        if (!raw) {
            setJoinError("Please enter a meeting code or link");
            return;
        }

        let cleanId = raw;
        if (raw.includes("/meet/")) {
            cleanId = raw.split("/meet/")[1].split("?")[0].split("#")[0].trim();
        }

        if (cleanId.length < 3) {
            setJoinError("Please enter a valid meeting code");
            return;
        }

        router.push(`/meet/${encodeURIComponent(cleanId)}`);
    };

    const handleCreateInstantMeeting = () => {
        setIsCreating(true);
        const randomCode = `vlsi-${Math.random().toString(36).substring(2, 7)}-${Math.random().toString(36).substring(2, 6)}`;
        router.push(`/meet/${randomCode}`);
    };

    return (
        <section className="relative overflow-hidden tech-grid bg-[var(--background)] text-[var(--text)] px-3 sm:px-6 pb-14 pt-20 sm:pb-20 sm:pt-28 lg:px-8 lg:pb-28 lg:pt-36 transition-colors duration-200">
            {/* Ambient background glows — Dark Mode Only (Clean in light mode per user requirement) */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[40rem] hidden dark:block dark:bg-[radial-gradient(circle_at_70%_20%,rgba(59,130,246,0.22),transparent_45%),radial-gradient(circle_at_25%_15%,rgba(129,140,248,0.16),transparent_40%)]" />

            {/* Luminous Motion Background — Light Mode Only */}
            <LightModeMotionBackground />

            <div className="relative mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
                {/* Left Column: Google Meet Style Action Console with opening animations */}
                <div className="max-w-2xl">
                    <div className="animate-entrance-1 inline-flex items-center gap-2 rounded-full border border-blue-200 dark:border-blue-900/60 bg-blue-50/80 dark:bg-blue-950/60 px-3 py-1 sm:px-3.5 sm:py-1.5 text-[11px] sm:text-xs font-semibold text-blue-700 dark:text-blue-300 shadow-sm backdrop-blur-sm">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        Enterprise Silicon Collaboration
                    </div>

                    <h1 className="animate-entrance-2 mt-4 sm:mt-5 text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15] break-words">
                        Video meetings built for{" "}
                        <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 dark:from-blue-400 dark:via-indigo-400 dark:to-cyan-300 bg-clip-text text-transparent">
                            VLSI & hardware engineers.
                        </span>
                    </h1>

                    <p className="animate-entrance-2 mt-4 sm:mt-5 text-sm sm:text-lg leading-relaxed text-slate-600 dark:text-slate-300">
                        Crystal-clear WebRTC audio, low-latency CAD/EDA screen sharing, and peer-to-peer security. No accounts or software downloads needed for participants — simply start or join.
                    </p>

                    {/* Google Meet Dual Action Hub (New Meeting + Enter Code) */}
                    <div id="join-section" className="animate-entrance-3 mt-6 sm:mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                        {/* New Meeting Button with light shimmer sweep */}
                        <button
                            type="button"
                            onClick={handleCreateInstantMeeting}
                            disabled={isCreating}
                            className="btn-interactive shimmer-sweep inline-flex h-11 sm:h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 sm:px-6 font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700 active:scale-[0.96] disabled:opacity-50 shrink-0 text-xs sm:text-sm cursor-pointer"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <span>{isCreating ? "Creating Room..." : "New Meeting"}</span>
                        </button>

                        {/* Enter Code or Link Input */}
                        <form
                            onSubmit={handleJoinSubmit}
                            className="flex flex-1 items-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-1 shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition"
                        >
                            <div className="pl-2.5 sm:pl-3 text-slate-400">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                value={joinInput}
                                onChange={(e) => setJoinInput(e.target.value)}
                                placeholder="Enter a code or link"
                                className="w-full bg-transparent px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none min-w-0"
                            />
                            <button
                                type="submit"
                                disabled={!joinInput.trim()}
                                className="btn-interactive rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 disabled:opacity-40 transition cursor-pointer shrink-0"
                            >
                                Join
                            </button>
                        </form>
                    </div>

                    {joinError && (
                        <p className="mt-2 text-xs font-medium text-red-500">
                            {joinError}
                        </p>
                    )}

                    {/* Admin Access Notice & Quick Credentials Link */}
                    <div className="animate-entrance-3 mt-6 sm:mt-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 p-3.5 sm:p-4 backdrop-blur-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 shrink-0">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                                        Admin Control Center
                                    </p>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 break-all sm:break-normal">
                                        Authorized access: <span className="font-mono text-blue-600 dark:text-blue-400">Verified administrator credentials required</span>
                                    </p>
                                </div>
                            </div>
                            <Link
                                href="/login?admin=true"
                                className="btn-interactive inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 dark:bg-white px-3.5 py-1.5 text-xs font-semibold text-white dark:text-slate-900 shadow-sm transition hover:bg-slate-800 dark:hover:bg-slate-100 shrink-0 w-full sm:w-auto"
                            >
                                <span>Sign In as Admin</span>
                                <span>→</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Right Column: Floating Company Logo with Animated HUD Telemetry Badges */}
                <div id="telemetry" className="animate-entrance-4 relative mx-auto flex w-full max-w-xl lg:max-w-2xl items-center justify-center py-2 sm:py-6 lg:py-8 scroll-mt-24">
                    {/* Multi-layered ambient radiant backlights — Dark Mode Only */}
                    <div className="pointer-events-none absolute -inset-8 -z-10 rounded-[3rem] hidden dark:block bg-gradient-to-tr from-cyan-400/30 via-blue-500/30 to-indigo-600/30 blur-3xl opacity-90 animate-pulse-halo" />
                    <div className="pointer-events-none absolute -inset-2 -z-10 rounded-full hidden dark:block bg-blue-500/20 blur-2xl" />

                    {/* Floating Telemetry HUD Badge 1: Top-Right CAD WebRTC Stream */}
                    <div className="animate-hud-1 absolute top-0 right-0 sm:-top-2 sm:right-6 z-20 flex items-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl border border-slate-200/90 dark:border-cyan-500/30 bg-white/95 dark:bg-slate-900/95 px-2.5 sm:px-3.5 py-1.5 sm:py-2 shadow-lg sm:shadow-xl backdrop-blur-md">
                        <div className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                            <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-cyan-400 leading-none">CAD Stream</p>
                            <p className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-white mt-0.5 leading-none">HD WebRTC CAD Stream</p>
                        </div>
                    </div>

                    {/* Floating Telemetry HUD Badge 2: Bottom-Left P2P Encrypted */}
                    <div className="animate-hud-2 absolute bottom-0 left-0 sm:-bottom-2 sm:left-4 z-20 flex items-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl border border-slate-200/90 dark:border-indigo-500/30 bg-white/95 dark:bg-slate-900/95 px-2.5 sm:px-3.5 py-1.5 sm:py-2 shadow-lg sm:shadow-xl backdrop-blur-md">
                        <div className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                            <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-indigo-400 leading-none">Security</p>
                            <p className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-white mt-0.5 leading-none">P2P Encrypted</p>
                        </div>
                    </div>

                    {/* Floating Telemetry HUD Badge 3: Bottom-Right Optimized Latency */}
                    <div className="animate-hud-3 absolute bottom-6 right-0 sm:bottom-8 sm:right-4 z-20 hidden xs:flex items-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl border border-slate-200/90 dark:border-cyan-500/30 bg-white/95 dark:bg-slate-900/95 px-2.5 sm:px-3 py-1 sm:py-1.5 shadow-lg sm:shadow-xl backdrop-blur-md">
                        <span className="flex h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-cyan-500 animate-pulse" />
                        <p className="text-[10px] sm:text-[11px] font-semibold text-slate-700 dark:text-cyan-200">Optimized WebRTC Latency</p>
                    </div>

                    <div className="animate-float relative flex flex-col items-center justify-center p-2 sm:p-6 lg:p-8 text-center transition-all duration-300">
                        <img
                            src="/logo.png"
                            alt="VLSI Labs Logo"
                            className="h-auto max-h-[220px] xs:max-h-[280px] sm:max-h-[380px] lg:max-h-[480px] w-auto max-w-full drop-shadow-none dark:drop-shadow-[0_25px_60px_rgba(56,189,248,0.4)] transition-transform duration-500 hover:scale-[1.02]"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
