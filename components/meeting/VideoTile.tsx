"use client";

import { useEffect, useRef } from "react";

type VideoTileProps = {
    stream: MediaStream | null;
    name: string;
    muted?: boolean;
    isScreen?: boolean;
};

export default function VideoTile({
    stream,
    name,
    muted = false,
    isScreen = false,
}: VideoTileProps) {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const video = videoRef.current;

        if (!video) {
            return;
        }

        video.srcObject = stream;

        if (stream) {
            video.play().catch(() => { });
        }

        return () => {
            if (video.srcObject === stream) {
                video.srcObject = null;
            }
        };
    }, [stream]);

    const hasLiveVideo =
        stream?.getVideoTracks().some(
            (track) => track.readyState === "live"
        ) ?? false;

    return (
        <div
            className={`relative h-full min-h-0 w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-900 sm:rounded-2xl ${isScreen ? "bg-black" : ""
                }`}
        >
            {hasLiveVideo ? (
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted={muted}
                    className="h-full w-full bg-black object-contain"
                />
            ) : (
                <div className="flex h-full min-h-[160px] w-full items-center justify-center bg-slate-900">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600 text-xl font-bold text-white shadow-lg">
                        {name.charAt(0).toUpperCase()}
                    </div>
                </div>
            )}

            <div className="absolute bottom-3 left-3 max-w-[80%] truncate rounded-lg bg-slate-950/75 px-3 py-1.5 text-xs font-medium text-white shadow backdrop-blur">
                {name}
            </div>
        </div>
    );
}