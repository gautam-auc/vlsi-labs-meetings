"use client";

import { useEffect, useRef, useState } from "react";
import { getPublicMeetingUrl } from "@/lib/utils";

type LobbyScreenProps = {
    meetingId: string;
    onJoin: (name?: string, options?: { micEnabled: boolean; cameraEnabled: boolean }) => void;
    joining: boolean;
    error: string;
    participantName: string;
    setParticipantName: (v: string) => void;
};

export default function LobbyScreen({
    meetingId,
    onJoin,
    joining,
    error,
    participantName,
    setParticipantName,
}: LobbyScreenProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [camOn, setCamOn] = useState(true);
    const [micOn, setMicOn] = useState(true);
    const [camError, setCamError] = useState(false);
    const [micError, setMicError] = useState(false);
    const [mediaNotice, setMediaNotice] = useState("");
    const [roomStatus, setRoomStatus] = useState<"checking" | "valid" | "cancelled" | "not_found">("checking");
    const [roomNotice, setRoomNotice] = useState("");
    const [copied, setCopied] = useState(false);

    // Verify room existence and status before join
    useEffect(() => {
        if (!meetingId) return;
        fetch(`/api/meetings/${encodeURIComponent(meetingId)}`)
            .then(async (res) => ({ ok: res.ok, data: res.ok ? await res.json() : null }))
            .then(({ ok, data }) => {
                if (data?.meeting?.status === "cancelled") {
                    setRoomStatus("cancelled");
                    setRoomNotice("This meeting session has been cancelled by the host.");
                } else if (data?.meeting?.status === "completed") {
                    setRoomStatus("cancelled");
                    setRoomNotice("This meeting session has concluded.");
                } else if (!ok || !data?.meeting) {
                    setRoomStatus("not_found");
                    setRoomNotice("This meeting link is invalid or no longer available.");
                } else {
                    setRoomStatus("valid");
                }
            })
            .catch(() => {
                setRoomStatus("not_found");
                setRoomNotice("Unable to verify this meeting. Please try again.");
            });
    }, [meetingId]);

    const copyLobbyUrl = () => {
        const url = getPublicMeetingUrl(meetingId);
        if (url) {
            navigator.clipboard.writeText(url).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2500);
            });
        }
    };

    // Start camera & microphone preview with separate fallbacks and clear error reporting
    useEffect(() => {
        let stream: MediaStream | null = null;

        async function startPreview() {
            let hasVideo = false;
            let hasAudio = false;

            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
                    audio: true,
                });
                hasVideo = stream.getVideoTracks().length > 0;
                hasAudio = stream.getAudioTracks().length > 0;
            } catch (err: any) {
                // Combined request failed, probe video and audio independently
                stream = new MediaStream();

                try {
                    const videoOnly = await navigator.mediaDevices.getUserMedia({
                        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
                    });
                    videoOnly.getVideoTracks().forEach((t) => stream?.addTrack(t));
                    hasVideo = true;
                } catch {
                    hasVideo = false;
                }

                try {
                    const audioOnly = await navigator.mediaDevices.getUserMedia({ audio: true });
                    audioOnly.getAudioTracks().forEach((t) => stream?.addTrack(t));
                    hasAudio = true;
                } catch {
                    hasAudio = false;
                }
            }

            setLocalStream(stream);
            setCamError(!hasVideo);
            setCamOn(hasVideo);
            setMicError(!hasAudio);
            setMicOn(hasAudio);

            if (!hasVideo && !hasAudio) {
                setMediaNotice("Camera and microphone access was denied. Please allow device permissions in your browser.");
            } else if (!hasVideo) {
                setMediaNotice("Camera access was denied. You will join with audio only.");
            } else if (!hasAudio) {
                setMediaNotice("Microphone access was denied. You will join muted.");
            } else {
                setMediaNotice("");
            }

            if (videoRef.current && stream && hasVideo) {
                videoRef.current.srcObject = stream;
                videoRef.current.play().catch(() => {});
            }
        }

        startPreview();

        return () => {
            stream?.getTracks().forEach((t) => t.stop());
        };
    }, []);

    // Sync cam/mic toggles on stream
    useEffect(() => {
        if (!localStream) return;
        localStream.getVideoTracks().forEach((t) => { t.enabled = camOn; });
    }, [camOn, localStream]);

    useEffect(() => {
        if (!localStream) return;
        localStream.getAudioTracks().forEach((t) => { t.enabled = micOn; });
    }, [micOn, localStream]);

    const initials = participantName
        ? participantName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
        : "?";

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-[#0c0e16] p-4 text-white">
            {/* Header */}
            <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
                <img src="/logo-text-white.png" alt="VLSI Labs" className="h-7 w-auto object-contain" />
                <span className="h-4 w-px bg-white/20 hidden sm:block" />
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-400">
                        Meeting Room: <span className="font-mono text-purple-400 font-semibold">{meetingId}</span>
                    </span>
                    <button
                        type="button"
                        onClick={copyLobbyUrl}
                        className="inline-flex items-center gap-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 px-2.5 py-0.5 text-xs text-purple-300 transition active:scale-95 cursor-pointer"
                        title="Copy meeting invite URL"
                    >
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        <span>{copied ? "✓ Copied!" : "Copy Link"}</span>
                    </button>
                </div>
            </div>

            {/* Main lobby grid */}
            <div className="flex w-full max-w-4xl flex-col gap-6 lg:flex-row lg:items-start">

                {/* ─── LEFT: Camera Preview ─── */}
                <div className="flex flex-1 flex-col gap-3">
                    {/* 16:9 Camera Preview Box */}
                    <div className="relative w-full overflow-hidden rounded-2xl bg-[#1a1c27]" style={{ aspectRatio: "16/9" }}>
                        {/* Live video */}
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className={`absolute inset-0 h-full w-full object-cover scale-x-[-1] transition-opacity duration-300 ${camOn && !camError ? "opacity-100" : "opacity-0"}`}
                        />

                        {/* Camera off / error state */}
                        {(!camOn || camError) && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1a1c27]">
                                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-2xl font-bold text-white shadow-2xl">
                                    {initials}
                                </div>
                                <p className="mt-3 text-xs text-slate-400">
                                    {camError ? "Camera unavailable" : "Camera is off"}
                                </p>
                            </div>
                        )}

                        {/* Mic indicator */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 backdrop-blur-sm">
                            {micOn ? (
                                <>
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    <span className="text-[11px] text-white/80 font-medium">Mic on</span>
                                </>
                            ) : (
                                <>
                                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                    <span className="text-[11px] text-white/80 font-medium">Mic muted</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Camera & Mic Toggle Controls */}
                    <div className="flex items-center justify-center gap-3">
                        {/* Mic Toggle */}
                        <button
                            type="button"
                            onClick={() => setMicOn((v) => !v)}
                            title={micOn ? "Mute microphone" : "Unmute microphone"}
                            className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition active:scale-95 ${
                                micOn
                                    ? "border-white/15 bg-white/10 text-white hover:bg-white/20"
                                    : "border-red-500/40 bg-red-600/20 text-red-400 hover:bg-red-600/30"
                            }`}
                        >
                            {micOn ? (
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                </svg>
                            ) : (
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                                </svg>
                            )}
                        </button>

                        {/* Camera Toggle */}
                        <button
                            type="button"
                            onClick={() => setCamOn((v) => !v)}
                            title={camOn ? "Turn off camera" : "Turn on camera"}
                            className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition active:scale-95 ${
                                camOn && !camError
                                    ? "border-white/15 bg-white/10 text-white hover:bg-white/20"
                                    : "border-red-500/40 bg-red-600/20 text-red-400 hover:bg-red-600/30"
                            }`}
                        >
                            {camOn && !camError ? (
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            ) : (
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2zM3 3l18 18" />
                                </svg>
                            )}
                        </button>

                        {/* Mic & Cam status indicators */}
                        {mediaNotice && (
                            <div className="w-full text-center text-xs text-amber-400 bg-amber-950/40 border border-amber-500/30 rounded-xl py-2 px-3">
                                {mediaNotice}
                            </div>
                        )}
                    </div>
                </div>

                {/* ─── RIGHT: Name + Join ─── */}
                <div className="flex w-full flex-col justify-center gap-5 lg:max-w-xs lg:pt-2">
                    <div>
                        <h1 className="text-xl font-bold text-white">Ready to join?</h1>
                        <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                            Check your camera and microphone settings, then enter your name to join the session.
                        </p>
                    </div>

                    {/* Room notice if cancelled/concluded */}
                    {roomNotice && (
                        <div className="rounded-xl border border-rose-500/40 bg-rose-950/60 p-3 text-xs text-rose-300 font-medium">
                            ⚠️ {roomNotice}
                        </div>
                    )}

                    {/* Name input */}
                    <div>
                        <label htmlFor="lobby-name" className="mb-1.5 block text-xs font-semibold text-slate-300">
                            Your display name
                        </label>
                        <input
                            id="lobby-name"
                            type="text"
                            value={participantName}
                            onChange={(e) => setParticipantName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && participantName.trim() && roomStatus === "valid") {
                                    onJoin(participantName, { micEnabled: micOn, cameraEnabled: camOn && !camError });
                                }
                            }}
                            disabled={roomStatus !== "valid"}
                            placeholder="e.g. Gautam – Physical Design"
                            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition disabled:opacity-50"
                            autoFocus
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="rounded-xl border border-red-500/30 bg-red-950/50 p-3 text-xs text-red-400">
                            {error}
                        </div>
                    )}

                    {/* Join button */}
                    <button
                        type="button"
                        onClick={() => onJoin(participantName, { micEnabled: micOn, cameraEnabled: camOn && !camError })}
                        disabled={joining || !participantName.trim() || roomStatus !== "valid"}
                        className="w-full rounded-2xl bg-blue-600 py-4 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"
                    >
                        {roomStatus !== "valid" ? (
                            "Session Unavailable"
                        ) : joining ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                Connecting...
                            </span>
                        ) : (
                            "Join Now"
                        )}
                    </button>

                    {/* Back links */}
                    <div className="flex items-center justify-between border-t border-slate-800/60 pt-3">
                        <a href="/" className="text-xs text-slate-500 hover:text-white transition">
                            ← Home
                        </a>
                        <a href="/dashboard" className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition">
                            Dashboard →
                        </a>
                    </div>
                </div>
            </div>
        </main>
    );
}
