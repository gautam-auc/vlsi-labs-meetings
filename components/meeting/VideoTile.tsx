"use client";

import { useEffect, useRef, useState } from "react";

type VideoTileProps = {
    stream: MediaStream | null;
    name: string;
    muted?: boolean;
    isScreen?: boolean;
    micEnabled?: boolean;
    isSpeaking?: boolean;
    isPinned?: boolean;
    onPin?: () => void;
};

export default function VideoTile({
    stream,
    name,
    muted = false,
    isScreen = false,
    micEnabled = true,
    isSpeaking = false,
    isPinned = false,
    onPin,
}: VideoTileProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [hasLiveVideo, setHasLiveVideo] = useState(false);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const checkTracks = () => {
            if (!stream) {
                setHasLiveVideo(false);
                return;
            }
            const videoTracks = stream.getVideoTracks();
            const live = videoTracks.some(
                (track) => track.readyState === "live" && track.enabled
            );
            setHasLiveVideo(isScreen || live || videoTracks.length > 0);
        };

        checkTracks();

        if (stream) {
            stream.onaddtrack = checkTracks;
            stream.onremovetrack = checkTracks;

            if (video.srcObject !== stream) {
                video.srcObject = stream;
            }
            video.play().catch(() => {});

            video.onloadedmetadata = () => {
                checkTracks();
                video.play().catch(() => {});
            };
        } else {
            video.srcObject = null;
        }

        const handleInteraction = () => {
            if (video && video.paused && video.srcObject) {
                video.play().catch(() => {});
            }
        };

        window.addEventListener("click", handleInteraction, { passive: true });
        window.addEventListener("touchstart", handleInteraction, { passive: true });

        return () => {
            window.removeEventListener("click", handleInteraction);
            window.removeEventListener("touchstart", handleInteraction);
            if (stream) {
                stream.onaddtrack = null;
                stream.onremovetrack = null;
            }
        };
    }, [stream, isScreen]);

    const isVideoVisible = isScreen || hasLiveVideo || (stream && stream.getVideoTracks().length > 0);

    return (
        <div
            className={`group relative flex h-full min-h-0 w-full items-center justify-center overflow-hidden rounded-2xl border transition-all duration-300 bg-[#141722] shadow-xl ${
                isSpeaking
                    ? "border-emerald-500 shadow-emerald-500/25 ring-2 ring-emerald-500/50"
                    : isPinned
                    ? "border-blue-500 shadow-blue-500/25 ring-2 ring-blue-500/40"
                    : isScreen
                    ? "border-indigo-500/70 bg-black"
                    : "border-slate-800/80 hover:border-slate-700"
            }`}
        >
            {/* Native Video Feed */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted // Video is always muted locally to prevent double audio & feedback
                className={`h-full w-full ${
                    isScreen
                        ? "object-contain bg-black"
                        : "object-cover"
                } ${isVideoVisible ? "block" : "hidden"} ${muted && !isScreen ? "scale-x-[-1]" : ""}`}
            />

            {/* Fallback Camera Off Avatar */}
            {!isVideoVisible && (
                <div className="flex h-full w-full flex-col items-center justify-center p-6 select-none">
                    <div className="relative flex h-18 w-18 sm:h-22 sm:w-22 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 text-xl sm:text-2xl font-bold text-white shadow-2xl ring-4 ring-white/10">
                        {name ? name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <p className="mt-3 text-xs font-medium text-slate-400">
                        {isScreen ? "Screen Presentation" : "Camera turned off"}
                    </p>
                </div>
            )}

            {/* Top-Right Pin / Unpin Button */}
            {onPin && (
                <div className="absolute top-2.5 right-2.5 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                        type="button"
                        onClick={onPin}
                        className={`flex h-7 w-7 items-center justify-center rounded-lg border backdrop-blur-md transition ${
                            isPinned
                                ? "border-blue-500 bg-blue-600 text-white shadow-md shadow-blue-600/30"
                                : "border-white/10 bg-black/60 text-slate-300 hover:text-white hover:bg-black/80"
                        }`}
                        title={isPinned ? "Unpin participant" : "Pin participant to focus"}
                    >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                    </button>
                </div>
            )}

            {/* Bottom Overlay Info (Name & Badges matching Image 2) */}
            <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 flex items-center justify-between gap-2 pointer-events-none">
                {/* Participant Name Badge */}
                <div className="pointer-events-auto flex items-center gap-1.5 truncate rounded-xl border border-white/10 bg-black/60 px-2.5 py-1 text-xs font-medium text-white shadow-md backdrop-blur-md">
                    <span className="truncate max-w-[130px] sm:max-w-[200px]">{name}</span>
                    {isScreen && (
                        <span className="rounded bg-indigo-500/40 border border-indigo-400/40 px-1 py-0.5 text-[9px] font-bold text-indigo-300">
                            SCREEN
                        </span>
                    )}
                    {muted && (
                        <span className="rounded bg-blue-500/20 px-1 py-0.5 text-[9px] font-medium text-blue-300">
                            You
                        </span>
                    )}
                </div>

                {/* Microphone Status Indicator */}
                <div className="pointer-events-auto flex items-center gap-1">
                    <div
                        className={`flex h-6 w-6 items-center justify-center rounded-lg border shadow-md backdrop-blur-md transition ${
                            micEnabled
                                ? "border-emerald-500/40 bg-black/60 text-emerald-400"
                                : "border-red-500/40 bg-red-950/80 text-red-400"
                        }`}
                        title={micEnabled ? "Microphone active" : "Microphone muted"}
                    >
                        {micEnabled ? (
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                        ) : (
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                            </svg>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}