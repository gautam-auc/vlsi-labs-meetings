"use client";

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";

export type VideoTileRef = {
    getVideoElement: () => HTMLVideoElement | null;
    requestPiP: () => Promise<void>;
};

type VideoTileProps = {
    stream: MediaStream | null;
    name: string;
    muted?: boolean;
    isScreen?: boolean;
    micEnabled?: boolean;
    isSpeaking?: boolean;
    isPinned?: boolean;
    onPin?: () => void;
    isMainSpeaker?: boolean;
};

const VideoTile = forwardRef<VideoTileRef, VideoTileProps>(function VideoTile(
    {
        stream,
        name,
        muted = false,
        isScreen = false,
        micEnabled = true,
        isSpeaking = false,
        isPinned = false,
        onPin,
        isMainSpeaker = false,
    },
    ref
) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [hasLiveVideo, setHasLiveVideo] = useState(false);

    useImperativeHandle(ref, () => ({
        getVideoElement: () => videoRef.current,
        requestPiP: async () => {
            if (videoRef.current && document.pictureInPictureEnabled) {
                try {
                    if (document.pictureInPictureElement) {
                        await document.exitPictureInPicture();
                    } else {
                        await videoRef.current.requestPictureInPicture();
                    }
                } catch (e) {
                    console.warn("PiP not supported or user cancelled:", e);
                }
            }
        },
    }));

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
            className={`group relative flex h-full min-h-0 w-full items-center justify-center overflow-hidden rounded-2xl border transition-all duration-300 bg-[#14151b] shadow-xl ${
                isSpeaking
                    ? "border-purple-500 shadow-purple-500/25 ring-2 ring-purple-500/50"
                    : isPinned
                    ? "border-purple-500 shadow-purple-500/25 ring-2 ring-purple-500/40"
                    : isScreen
                    ? "border-indigo-500/80 bg-black"
                    : "border-white/10 hover:border-white/20"
            }`}
        >
            {/* Native Video Feed */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted // Video element is always muted locally to avoid echo feedback; audio is handled by RemoteAudioSink
                className={`h-full w-full ${
                    isScreen
                        ? "object-contain bg-black"
                        : "object-cover"
                } ${isVideoVisible ? "block" : "hidden"} ${muted && !isScreen ? "scale-x-[-1]" : ""}`}
            />

            {/* Fallback Camera Off Avatar */}
            {!isVideoVisible && (
                <div className="flex h-full w-full flex-col items-center justify-center p-6 select-none bg-gradient-to-b from-[#1b1d28] to-[#12131a]">
                    <div className="relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-600 text-xl sm:text-2xl font-bold text-white shadow-2xl ring-4 ring-white/10">
                        {name ? name.charAt(0).toUpperCase() : "U"}
                    </div>
                    <p className="mt-3 text-xs font-semibold text-slate-300">
                        {isScreen ? "Screen Presentation" : name}
                    </p>
                    <span className="text-[10px] text-slate-500 mt-0.5">Camera off</span>
                </div>
            )}

            {/* TOP-LEFT: Speaker Name Frosted Badge (Matching Dribbble Meetyu) */}
            <div className="absolute top-3 left-3 z-20 pointer-events-none">
                <div className="pointer-events-auto flex items-center gap-1.5 rounded-xl bg-black/45 backdrop-blur-md px-3 py-1.5 text-xs font-medium text-white shadow-lg border border-white/10">
                    <span className="truncate max-w-[120px] sm:max-w-[200px]">{name}</span>
                    {isScreen && (
                        <span className="rounded bg-purple-500/40 border border-purple-400/40 px-1.5 py-0.2 text-[9px] font-bold text-purple-200">
                            SCREEN
                        </span>
                    )}
                </div>
            </div>

            {/* TOP-RIGHT: Pin Button & Mic Badge (Matching Dribbble Meetyu) */}
            <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
                {/* Pin Button */}
                {onPin && (
                    <button
                        type="button"
                        onClick={onPin}
                        className={`flex h-7 w-7 items-center justify-center rounded-xl backdrop-blur-md transition shadow-md ${
                            isPinned
                                ? "bg-purple-600 text-white"
                                : "bg-black/45 text-slate-300 hover:text-white hover:bg-black/70 border border-white/10"
                        }`}
                        title={isPinned ? "Unpin focus" : "Pin focus"}
                    >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                    </button>
                )}

                {/* Purple Mic Badge */}
                <div
                    className={`flex h-7 w-7 items-center justify-center rounded-xl shadow-md transition ${
                        micEnabled
                            ? "bg-[#7c3aed] text-white"
                            : "bg-red-600 text-white"
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
});

export default VideoTile;