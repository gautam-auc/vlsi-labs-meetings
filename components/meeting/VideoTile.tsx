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
    const [speakerMuted, setSpeakerMuted] = useState(false);

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
            // If isScreen is true, or videoTracks exist, treat as active video
            setHasVideoTrack(isScreen || hasLiveVideo || videoTracks.length > 0);

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
                video.onloadedmetadata = () => {
                    video.play().catch(() => {});
                };
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
            if (video && video.paused && video.srcObject) {
                video.play().catch(() => {});
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
    }, [stream, muted, isScreen]);

    // Reliable video rendering condition
    const isVideoVisible = isScreen || hasVideoTrack || (stream && stream.getVideoTracks().length > 0);

    return (
        <div
            className={`relative flex h-full min-h-0 w-full items-center justify-center overflow-hidden rounded-[20px] sm:rounded-[24px] border transition-all duration-200 bg-[#16171d] shadow-lg ${
                isScreen
                    ? "border-blue-500/50 bg-black"
                    : "border-[#252732] hover:border-[#383a48]"
            }`}
        >
            {/* Dedicated Audio Player (Always mounted for remote streams) */}
            {!muted && (
                <audio
                    ref={audioRef}
                    autoPlay
                    playsInline
                    muted={speakerMuted}
                />
            )}

            {/* Video Element */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted // Video element is muted so audio is cleanly handled by dedicated <audio> player
                className={`h-full w-full object-cover sm:object-contain ${
                    isVideoVisible ? "block" : "hidden"
                }`}
            />

            {/* Camera Off / Fallback Avatar */}
            {!isVideoVisible && (
                <div className="flex h-full min-h-[140px] w-full flex-col items-center justify-center p-4">
                    <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 text-2xl font-bold text-white shadow-2xl ring-4 ring-blue-500/20">
                        {name ? name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <p className="mt-3 text-xs font-semibold text-slate-400">
                        {isScreen ? "Screen Presentation" : "Camera Off"}
                    </p>
                </div>
            )}

            {/* Status Overlays (Matching Image 2 Style) */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                {/* Participant Name Badge */}
                <div className="pointer-events-auto flex items-center gap-1.5 truncate rounded-xl border border-white/10 bg-[#14151b]/85 px-3 py-1.5 text-xs font-semibold text-white shadow-lg backdrop-blur-md">
                    <span className="truncate">{name}</span>
                    {isScreen && (
                        <span className="rounded bg-blue-500/30 px-1.5 py-0.5 text-[10px] font-bold text-blue-300">
                            SCREEN
                        </span>
                    )}
                </div>

                {/* Right Badges: In-Tile Speaker Mute (Solves Room Echo) + Mic Status */}
                <div className="pointer-events-auto flex items-center gap-1.5">
                    {/* Toggle Speaker to kill feedback echo when testing two devices in same room */}
                    {!muted && (
                        <button
                            type="button"
                            onClick={() => setSpeakerMuted(!speakerMuted)}
                            className={`flex h-7 w-7 items-center justify-center rounded-lg border shadow-lg backdrop-blur-md transition ${
                                speakerMuted
                                    ? "border-amber-500/50 bg-amber-950/80 text-amber-400"
                                    : "border-white/10 bg-[#14151b]/85 text-slate-300 hover:text-white"
                            }`}
                            title={speakerMuted ? "Unmute incoming audio (Echo protection active)" : "Mute incoming audio on this tile (Prevents room echo)"}
                        >
                            {speakerMuted ? (
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                                </svg>
                            ) : (
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                </svg>
                            )}
                        </button>
                    )}

                    {/* Mic Indicator */}
                    <div
                        className={`flex h-7 w-7 items-center justify-center rounded-lg border shadow-lg backdrop-blur-md ${
                            micEnabled
                                ? "border-emerald-500/30 bg-[#14151b]/85 text-emerald-400"
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
        </div>
    );
}