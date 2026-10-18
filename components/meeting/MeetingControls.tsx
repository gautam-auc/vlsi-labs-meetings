"use client";

import { useState } from "react";

type MeetingControlsProps = {
    micEnabled: boolean;
    cameraEnabled: boolean;
    isScreenSharing: boolean;
    isCaptionsEnabled?: boolean;
    isSpeakerMuted?: boolean;
    onToggleMic: () => void;
    onToggleCamera: () => void;
    onToggleScreen: () => void;
    onToggleCaptions?: () => void;
    onTogglePiP?: () => void;
    onToggleSpeaker?: () => void;
    onLeave: () => void;
    onSendReaction?: (emoji: string) => void;
    onToggleNotes?: () => void;
    onToggleCalendar?: () => void;
};

export default function MeetingControls({
    micEnabled,
    cameraEnabled,
    isScreenSharing,
    isCaptionsEnabled = false,
    isSpeakerMuted = false,
    onToggleMic,
    onToggleCamera,
    onToggleScreen,
    onToggleCaptions,
    onTogglePiP,
    onToggleSpeaker,
    onLeave,
    onSendReaction,
    onToggleNotes,
    onToggleCalendar,
}: MeetingControlsProps) {
    const [showReactions, setShowReactions] = useState(false);
    const [showMoreMenu, setShowMoreMenu] = useState(false);

    const emojis = ["❤️", "👏", "👍", "🎉", "😂", "🚀", "💡", "✋"];

    const handleEmojiClick = (emoji: string) => {
        if (onSendReaction) onSendReaction(emoji);
        setShowReactions(false);
    };

    const toggleFullscreen = () => {
        if (typeof document === "undefined") return;
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
        } else {
            document.exitFullscreen().catch(() => {});
        }
    };

    return (
        <div className="relative">
            {/* Floating Emoji Picker Popover */}
            {showReactions && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50 flex items-center gap-1.5 rounded-full border border-white/10 bg-[#1e2029]/95 px-3 py-2 shadow-2xl backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-2">
                    {emojis.map((emoji) => (
                        <button
                            key={emoji}
                            type="button"
                            onClick={() => handleEmojiClick(emoji)}
                            className="flex h-9 w-9 items-center justify-center rounded-full text-lg hover:scale-125 hover:bg-white/10 transition active:scale-95"
                            title={`Send ${emoji}`}
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            )}

            {/* More Options Popover Menu */}
            {showMoreMenu && (
                <div className="absolute bottom-full right-0 mb-3 z-50 w-56 rounded-2xl border border-white/10 bg-[#1c1e27]/98 p-2 shadow-2xl backdrop-blur-2xl space-y-1 animate-in fade-in slide-in-from-bottom-2">
                    {/* Screen Share (Mobile & Quick Access) */}
                    <button
                        type="button"
                        onClick={() => {
                            onToggleScreen();
                            setShowMoreMenu(false);
                        }}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10 transition text-left"
                    >
                        <span>💻</span>
                        <span>{isScreenSharing ? "Stop Sharing Screen" : "Share Screen"}</span>
                    </button>

                    {/* Live Captions (Mobile & Quick Access) */}
                    {onToggleCaptions && (
                        <button
                            type="button"
                            onClick={() => {
                                onToggleCaptions();
                                setShowMoreMenu(false);
                            }}
                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10 transition text-left"
                        >
                            <span>💬</span>
                            <span>{isCaptionsEnabled ? "Turn off Live Captions" : "Turn on Live Captions"}</span>
                        </button>
                    )}

                    {onToggleNotes && (
                        <button
                            type="button"
                            onClick={() => {
                                onToggleNotes();
                                setShowMoreMenu(false);
                            }}
                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10 transition text-left"
                        >
                            <span>📝</span>
                            <span>In-Meeting Notepad</span>
                        </button>
                    )}

                    {onToggleCalendar && (
                        <button
                            type="button"
                            onClick={() => {
                                onToggleCalendar();
                                setShowMoreMenu(false);
                            }}
                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10 transition text-left"
                        >
                            <span>📅</span>
                            <span>Running Calendar</span>
                        </button>
                    )}

                    {/* PiP Floating Window */}
                    {onTogglePiP && (
                        <button
                            type="button"
                            onClick={() => {
                                onTogglePiP();
                                setShowMoreMenu(false);
                            }}
                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10 transition text-left"
                        >
                            <span>🗗</span>
                            <span>Minimize to PiP</span>
                        </button>
                    )}

                    {/* Fullscreen */}
                    <button
                        type="button"
                        onClick={() => {
                            toggleFullscreen();
                            setShowMoreMenu(false);
                        }}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10 transition text-left"
                    >
                        <span>⛶</span>
                        <span>Toggle Fullscreen</span>
                    </button>

                    {onToggleSpeaker && (
                        <button
                            type="button"
                            onClick={() => {
                                onToggleSpeaker();
                                setShowMoreMenu(false);
                            }}
                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10 transition text-left"
                        >
                            <span>{isSpeakerMuted ? "🔇" : "🔊"}</span>
                            <span>{isSpeakerMuted ? "Unmute Speaker" : "Mute Speaker"}</span>
                        </button>
                    )}
                </div>
            )}

            {/* Dribbble Meetyu Floating Pill Dock (Responsive for Mobile & Desktop) */}
            <div className="flex items-center gap-1.5 sm:gap-3 rounded-full border border-white/10 bg-[#20222a]/95 px-2.5 sm:px-5 py-2 sm:py-3 shadow-2xl backdrop-blur-2xl">
                {/* 1. Fullscreen Button (Desktop Only) */}
                <button
                    type="button"
                    onClick={toggleFullscreen}
                    className="hidden sm:flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white/10 hover:bg-white/15 text-slate-200 transition hover:scale-105 active:scale-95"
                    title="Toggle Fullscreen"
                >
                    <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                </button>

                {/* 2. Emoji Reactions Button */}
                <button
                    type="button"
                    onClick={() => setShowReactions((prev) => !prev)}
                    className={`flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full transition hover:scale-105 active:scale-95 ${
                        showReactions
                            ? "bg-purple-600 text-white"
                            : "bg-white/10 hover:bg-white/15 text-slate-200"
                    }`}
                    title="Send Live Emoji Reaction"
                >
                    <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </button>

                {/* 3. Microphone Button (White Circle with Purple Mic in Meetyu) */}
                <button
                    type="button"
                    onClick={onToggleMic}
                    className={`flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full transition hover:scale-105 active:scale-95 shadow-md ${
                        micEnabled
                            ? "bg-white text-[#7c3aed]"
                            : "bg-red-600 text-white"
                    }`}
                    title={micEnabled ? "Mute Microphone" : "Unmute Microphone"}
                >
                    {micEnabled ? (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                    ) : (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                        </svg>
                    )}
                </button>

                {/* 4. Bold Red "End Meeting" Pill Button (Centerpiece of Meetyu) */}
                <button
                    type="button"
                    onClick={onLeave}
                    className="flex h-10 sm:h-11 items-center gap-1.5 sm:gap-2 rounded-full bg-[#ef4444] hover:bg-red-600 px-3.5 sm:px-6 font-bold text-xs sm:text-sm text-white shadow-lg shadow-red-500/30 transition hover:scale-105 active:scale-95 shrink-0"
                    title="Leave Meeting"
                >
                    <span>End Meeting</span>
                </button>

                {/* 5. Video Camera Toggle */}
                <button
                    type="button"
                    onClick={onToggleCamera}
                    className={`flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full transition hover:scale-105 active:scale-95 ${
                        cameraEnabled
                            ? "bg-white/10 hover:bg-white/15 text-slate-200"
                            : "bg-red-600 text-white"
                    }`}
                    title={cameraEnabled ? "Turn off camera" : "Turn on camera"}
                >
                    {cameraEnabled ? (
                        <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    ) : (
                        <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                    )}
                </button>

                {/* 6. Screen Sharing Toggle (Desktop Visible, Mobile in More Menu) */}
                <button
                    type="button"
                    onClick={onToggleScreen}
                    className={`hidden sm:flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full transition hover:scale-105 active:scale-95 ${
                        isScreenSharing
                            ? "bg-[#7c3aed] text-white shadow-purple-500/30"
                            : "bg-white/10 hover:bg-white/15 text-slate-200"
                    }`}
                    title={isScreenSharing ? "Stop sharing screen" : "Share screen"}
                >
                    <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </button>

                {/* 7. Live Captions / Speech-to-Text Toggle (Desktop Visible, Mobile in More Menu) */}
                {onToggleCaptions && (
                    <button
                        type="button"
                        onClick={onToggleCaptions}
                        className={`hidden sm:flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full transition hover:scale-105 active:scale-95 ${
                            isCaptionsEnabled
                                ? "bg-purple-600 text-white"
                                : "bg-white/10 hover:bg-white/15 text-slate-200"
                        }`}
                        title={isCaptionsEnabled ? "Turn off live captions" : "Turn on live captions (Speech to text)"}
                    >
                        <span className="font-extrabold text-[11px] tracking-wider">CC</span>
                    </button>
                )}

                {/* 8. Picture-in-Picture / Minimize Floating Screen (Desktop Visible, Mobile in More Menu) */}
                {onTogglePiP && (
                    <button
                        type="button"
                        onClick={onTogglePiP}
                        className="hidden sm:flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white/10 hover:bg-white/15 text-slate-200 transition hover:scale-105 active:scale-95"
                        title="Minimize Screen / Picture-in-Picture (Float over other tabs)"
                    >
                        <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </button>
                )}

                {/* 9. More Options (...) Menu */}
                <button
                    type="button"
                    onClick={() => setShowMoreMenu((prev) => !prev)}
                    className={`flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full transition hover:scale-105 active:scale-95 ${
                        showMoreMenu
                            ? "bg-purple-600 text-white"
                            : "bg-white/10 hover:bg-white/15 text-slate-200"
                    }`}
                    title="More Meeting Tools"
                >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h.01M12 12h.01M19 12h.01" />
                    </svg>
                </button>
            </div>
        </div>
    );
}