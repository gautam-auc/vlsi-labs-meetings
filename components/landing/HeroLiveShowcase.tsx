"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Mic, MicOff, Video, VideoOff, MonitorUp, MessageSquare, ArrowRight } from "lucide-react";

export default function HeroLiveShowcase() {
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [waveHeights, setWaveHeights] = useState([35, 70, 50, 90, 60]);

    // Animate audio waveform bars subtly for active speaker
    useEffect(() => {
        const interval = setInterval(() => {
            setWaveHeights((prev) =>
                prev.map(() => Math.floor(25 + Math.random() * 65))
            );
        }, 350);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative mx-auto w-full max-w-xl">
            {/* Ambient soft glow */}
            <div className="absolute -inset-4 -z-10 rounded-[2.5rem] bg-indigo-500/15 blur-2xl" />

            <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-3 sm:p-4 shadow-2xl shadow-indigo-950/10">
                <div className="rounded-2xl bg-slate-950 p-4 sm:p-5 text-white">
                    {/* Meeting Card Header with Company Tree Logo */}
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
                        <div className="flex items-center gap-3">
                            <Image
                                src="/logo.png"
                                alt="VLSI Labs"
                                width={32}
                                height={40}
                                className="h-8 w-auto object-contain"
                                priority
                                referrerPolicy="no-referrer"
                            />
                            <div>
                                <p className="text-[11px] font-medium text-slate-400">
                                    Live meeting · VLSI Labs
                                </p>
                                <h3 className="mt-0.5 text-base font-bold text-white tracking-tight">
                                    Product Discussion
                                </h3>
                            </div>
                        </div>

                        <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                            Live
                        </span>
                    </div>

                    {/* 4 Video Tiles Grid */}
                    <div className="mt-4 grid grid-cols-2 gap-2.5 sm:gap-3">
                        {/* Tile 1: You */}
                        <div className="relative flex aspect-[1.3] flex-col items-center justify-center rounded-xl bg-slate-900 border border-slate-800 p-3 shadow-inner">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white shadow-md">
                                AG
                            </div>
                            <span className="mt-2 text-xs font-semibold text-slate-200">
                                A. Gautam
                            </span>
                            <span className="absolute bottom-2 left-2 rounded bg-slate-950/80 px-1.5 py-0.5 text-[10px] font-medium text-indigo-300 border border-indigo-900/40">
                                You
                            </span>
                        </div>

                        {/* Tile 2: Active Speaker */}
                        <div className="relative flex aspect-[1.3] flex-col items-center justify-center rounded-xl bg-slate-900 border-2 border-emerald-500/70 p-3 shadow-inner">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-600 text-sm font-bold text-white shadow-md">
                                RK
                            </div>
                            <span className="mt-2 text-xs font-semibold text-slate-200">
                                R. Kumar
                            </span>
                            <div className="absolute bottom-2 right-2 flex items-center gap-1.5 rounded bg-slate-950/80 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-900/40">
                                <span className="flex items-end gap-0.5 h-2.5">
                                    {waveHeights.map((h, i) => (
                                        <span
                                            key={i}
                                            style={{ height: `${h}%` }}
                                            className="w-0.5 rounded-full bg-emerald-400 transition-all duration-300"
                                        />
                                    ))}
                                </span>
                                <span>Active</span>
                            </div>
                        </div>

                        {/* Tile 3: Priya Shah */}
                        <div className="relative flex aspect-[1.3] flex-col items-center justify-center rounded-xl bg-slate-900 border border-slate-800 p-3 shadow-inner">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white shadow-md">
                                PS
                            </div>
                            <span className="mt-2 text-xs font-semibold text-slate-200">
                                Priya Shah
                            </span>
                            <span className="absolute bottom-2 left-2 rounded bg-slate-950/80 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 border border-slate-800">
                                Design
                            </span>
                        </div>

                        {/* Tile 4: J. Doe */}
                        <div className="relative flex aspect-[1.3] flex-col items-center justify-center rounded-xl bg-slate-900 border border-slate-800 p-3 shadow-inner">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-600 text-sm font-bold text-white shadow-md">
                                JD
                            </div>
                            <span className="mt-2 text-xs font-semibold text-slate-200">
                                J. Doe
                            </span>
                            <span className="absolute bottom-2 left-2 rounded bg-slate-950/80 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 border border-slate-800">
                                Engineering
                            </span>
                        </div>
                    </div>

                    {/* Meeting Controls Bar */}
                    <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-900/90 px-3 py-2.5 border border-slate-800">
                        {/* Interactive Buttons with Lucide Icons */}
                        <div className="flex items-center gap-1.5 sm:gap-2">
                            <button
                                type="button"
                                onClick={() => setIsMuted(!isMuted)}
                                aria-label={isMuted ? "Unmute" : "Mute"}
                                className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                                    isMuted
                                        ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                                }`}
                            >
                                {isMuted ? (
                                    <MicOff className="h-4 w-4" />
                                ) : (
                                    <Mic className="h-4 w-4 text-emerald-400" />
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => setIsVideoOff(!isVideoOff)}
                                aria-label={isVideoOff ? "Start video" : "Stop video"}
                                className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                                    isVideoOff
                                        ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                                }`}
                            >
                                {isVideoOff ? (
                                    <VideoOff className="h-4 w-4" />
                                ) : (
                                    <Video className="h-4 w-4" />
                                )}
                            </button>

                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
                                <MonitorUp className="h-4 w-4" />
                            </span>

                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300">
                                <MessageSquare className="h-4 w-4" />
                            </span>
                        </div>

                        <Link
                            href="/meet/VLSI-DEMO"
                            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-500 shadow-sm"
                        >
                            <span>Join Demo Room</span>
                            <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
