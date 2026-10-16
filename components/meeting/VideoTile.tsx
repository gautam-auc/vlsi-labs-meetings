"use client";

import { useEffect, useRef, useState } from "react";

type VideoTileProps = {
    stream: MediaStream | null;
    name: string;
    muted?: boolean;
    isScreen?: boolean;
    micEnabled?: boolean;
};

export default function VideoTile({
    stream,
    name,
    muted = false,
    isScreen = false,
    micEnabled = true,
}: VideoTileProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const [hasVideoTrack, setHasVideoTrack] = useState(false);

    useEffect(() => {
        const video = videoRef.current;
        const audio = audioRef.current;

        const checkTracks = () => {
            if (!stream) {
                setHasVideoTrack(false);
                return;
            }
            const videoTracks = stream.getVideoTracks();
            const hasLiveVideo = videoTracks.some(
                (track) => track.readyState === "live" && track.enabled
            );
            setHasVideoTrack(hasLiveVideo);

            // Ensure remote audio tracks are unmuted and active
            if (!muted) {
                stream.getAudioTracks().forEach((track) => {
                    track.enabled = true;
                });
            }
        };

        checkTracks();

        if (stream) {
            stream.onaddtrack = checkTracks;
            stream.onremovetrack = checkTracks;

            if (video) {
                video.srcObject = stream;
                video.play().catch(() => {});
            }

            // Dedicated audio playback for remote stream
            if (audio && !muted) {
                audio.srcObject = stream;
                audio.volume = 1.0;
                audio.play().catch((err) => {
                    console.warn("Autoplay pending user interaction:", err);
                });
            }
        } else {
            if (video) video.srcObject = null;
            if (audio) audio.srcObject = null;
        }

        // Global user interaction listener to unlock audio if blocked by browser policy
        const unlockAudio = () => {
            if (audio && !muted && audio.paused && audio.srcObject) {
                audio.play().catch(() => {});
            }
        };

        window.addEventListener("click", unlockAudio);
        window.addEventListener("touchstart", unlockAudio);
        window.addEventListener("keydown", unlockAudio);

        return () => {
            window.removeEventListener("click", unlockAudio);
            window.removeEventListener("touchstart", unlockAudio);
            window.removeEventListener("keydown", unlockAudio);
            if (stream) {
                stream.onaddtrack = null;
                stream.onremovetrack = null;
            }
        };
    }, [stream, muted]);

    return (
        <div
            className={`relative flex h-full min-h-0 w-full items-center justify-center overflow-hidden rounded-2xl border transition-all duration-200 ${
                isScreen
                    ? "border-blue-500/40 bg-black"
                    : "border-slate-800/80 bg-slate-900/95"
            }`}
        >
            {/* Dedicated Audio Player (Always mounted for reliable remote audio playback) */}
            {!muted && (
                <audio
                    ref={audioRef}
                    autoPlay
                    playsInline
                />
            )}

            {/* Video Element */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted // Video element itself is muted because audio is handled by the dedicated <audio> tag
                className={`h-full w-full object-contain ${
                    hasVideoTrack ? "block" : "hidden"
                }`}
            />

            {/* Camera Off / Fallback Avatar */}
            {!hasVideoTrack && (
                <div className="flex h-full min-h-[160px] w-full flex-col items-center justify-center p-4">
                    <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-2xl font-bold text-white shadow-xl ring-4 ring-blue-500/20">
                        {name ? name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <p className="mt-3 text-xs font-medium text-slate-400">
                        {isScreen ? "Screen Presentation" : "Camera Off"}
                    </p>
                </div>
            )}

            {/* Status Overlays */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                {/* Participant Name Badge */}
                <div className="flex items-center gap-1.5 truncate rounded-xl border border-slate-700/60 bg-slate-950/80 px-3 py-1.5 text-xs font-semibold text-white shadow-lg backdrop-blur">
                    <span className="truncate">{name}</span>
                    {isScreen && (
                        <span className="rounded bg-blue-500/30 px-1.5 py-0.5 text-[10px] font-bold text-blue-300">
                            SCREEN
                        </span>
                    )}
                </div>

                {/* Mic Indicator */}
                <div
                    className={`flex h-7 w-7 items-center justify-center rounded-lg border shadow-lg backdrop-blur ${
                        micEnabled
                            ? "border-slate-700/60 bg-slate-950/80 text-emerald-400"
                            : "border-red-500/40 bg-red-950/80 text-red-400"
                    }`}
                    title={micEnabled ? "Microphone active" : "Microphone muted"}
                >
                    {micEnabled ? (
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                    ) : (
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                        </svg>
                    )}
                </div>
            </div>
        </div>
    );
}