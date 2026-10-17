"use client";

import { useState } from "react";

type MeetingControlsProps = {
    micEnabled: boolean;
    cameraEnabled: boolean;
    isScreenSharing: boolean;
    isSpeakerMuted?: boolean;
    onToggleMic: () => void;
    onToggleCamera: () => void;
    onToggleScreen: () => void;
    onToggleSpeaker?: () => void;
    onLeave: () => void;
    onToggleChat?: () => void;
    isChatOpen?: boolean;
    unreadChatCount?: number;
    onToggleParticipants?: () => void;
    isParticipantsOpen?: boolean;
    participantCount?: number;
    onSendReaction?: (emoji: string) => void;
};

export default function MeetingControls({
    micEnabled,
    cameraEnabled,
    isScreenSharing,
    isSpeakerMuted = false,
    onToggleMic,
    onToggleCamera,
    onToggleScreen,
    onToggleSpeaker,
    onLeave,
    onToggleChat,
    isChatOpen = false,
    unreadChatCount = 0,
    onToggleParticipants,
    isParticipantsOpen = false,
    participantCount = 1,
    onSendReaction,
}: MeetingControlsProps) {
    const [showReactions, setShowReactions] = useState(false);
    const [showMore, setShowMore] = useState(false);

    const emojis = ["👏", "👍", "❤️", "🎉", "😂", "✋"];

    const handleEmojiClick = (emoji: string) => {
        if (onSendReaction) onSendReaction(emoji);
        setShowReactions(false);
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
        } else {
            document.exitFullscreen().catch(() => {});
        }
    };

    return (
        <div className="flex items-center justify-center gap-2 sm:gap-3">
            {/* Fullscreen Button */}
            <button
                type="button"
                onClick={toggleFullscreen}
                className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10 shadow-md backdrop-blur-md transition hover:scale-105"
                title="Toggle Fullscreen"
            >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
            </button>

            {/* Chat Toggle Button (Matching Image 2) */}
            {onToggleChat && (
                <button
                    type="button"
                    onClick={onToggleChat}
                    className={`relative flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl border shadow-md backdrop-blur-md transition hover:scale-105 ${
                        isChatOpen
                            ? "bg-blue-600 border-blue-500 text-white shadow-blue-500/30"
                            : "bg-white/10 hover:bg-white/15 border-white/10 text-slate-200"
                    }`}
                    title="Toggle Chat & Messages"
                >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    {unreadChatCount > 0 && !isChatOpen && (
                        <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-blue-500 px-1 text-[9px] font-bold text-white shadow">
                            {unreadChatCount}
                        </span>
                    )}
                </button>
            )}

            {/* Microphone Toggle (Red when muted) */}
            <button
                type="button"
                onClick={onToggleMic}
                className={`flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl border shadow-md backdrop-blur-md transition hover:scale-105 ${
                    micEnabled
                        ? "bg-white/10 hover:bg-white/15 border-white/10 text-white"
                        : "bg-red-600 border-red-500 text-white shadow-red-600/30"
                }`}
                title={micEnabled ? "Mute Microphone" : "Unmute Microphone"}
            >
                {micEnabled ? (
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

            {/* End Call Pill Button (Exact Image 2 Style) */}
            <button
                type="button"
                onClick={onLeave}
                className="flex h-11 sm:h-12 items-center gap-2 rounded-2xl bg-red-600 hover:bg-red-700 px-5 sm:px-6 font-bold text-xs sm:text-sm text-white shadow-xl shadow-red-600/35 transition hover:scale-105 active:scale-95"
                title="End Call"
            >
                <svg className="h-4 w-4 transform rotate-[135deg]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1.02l-2.2 2.2z" />
                </svg>
                <span>End Call</span>
            </button>

            {/* Video Camera Toggle */}
            <button
                type="button"
                onClick={onToggleCamera}
                className={`flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl border shadow-md backdrop-blur-md transition hover:scale-105 ${
                    cameraEnabled
                        ? "bg-white/10 hover:bg-white/15 border-white/10 text-white"
                        : "bg-red-600 border-red-500 text-white shadow-red-600/30"
                }`}
                title={cameraEnabled ? "Turn Off Camera" : "Turn On Camera"}
            >
                {cameraEnabled ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                )}
            </button>

            {/* Screen Sharing Toggle */}
            <button
                type="button"
                onClick={onToggleScreen}
                className={`flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl border shadow-md backdrop-blur-md transition hover:scale-105 ${
                    isScreenSharing
                        ? "bg-blue-600 border-blue-500 text-white shadow-blue-500/30"
                        : "bg-white/10 hover:bg-white/15 border-white/10 text-slate-200"
                }`}
                title={isScreenSharing ? "Stop Screen Sharing" : "Share Your Screen"}
            >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            </button>

            {/* Speaker / Room Echo Guard Mute (Kills acoustic feedback loop during testing) */}
            {onToggleSpeaker && (
                <button
                    type="button"
                    onClick={onToggleSpeaker}
                    className={`flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl border shadow-md backdrop-blur-md transition hover:scale-105 ${
                        isSpeakerMuted
                            ? "bg-amber-600/90 border-amber-500 text-white shadow-amber-600/30"
                            : "bg-white/10 hover:bg-white/15 border-white/10 text-slate-200"
                    }`}
                    title={isSpeakerMuted ? "Unmute Incoming Audio (Echo guard active)" : "Mute Incoming Audio (Stop room echo feedback)"}
                >
                    {isSpeakerMuted ? (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                        </svg>
                    ) : (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        </svg>
                    )}
                </button>
            )}

            {/* Reaction Pill & Flyout */}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setShowReactions(!showReactions)}
                    className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-slate-200 shadow-md backdrop-blur-md transition hover:scale-105"
                    title="Send Reaction"
                >
                    <span className="text-xl">😊</span>
                </button>

                {showReactions && (
                    <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-2xl border border-slate-700 bg-[#161922]/95 p-2 shadow-2xl backdrop-blur-xl z-50">
                        {emojis.map((emoji) => (
                            <button
                                key={emoji}
                                type="button"
                                onClick={() => handleEmojiClick(emoji)}
                                className="flex h-9 w-9 items-center justify-center rounded-xl text-xl hover:bg-white/10 hover:scale-125 transition"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* More Options (...) */}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setShowMore(!showMore)}
                    className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-slate-200 shadow-md backdrop-blur-md transition hover:scale-105"
                    title="More Options"
                >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                    </svg>
                </button>

                {showMore && (
                    <div className="absolute bottom-16 right-0 w-52 rounded-2xl border border-slate-700 bg-[#161922]/95 p-2 shadow-2xl backdrop-blur-xl z-50 space-y-1">
                        {onToggleParticipants && (
                            <button
                                type="button"
                                onClick={() => {
                                    onToggleParticipants();
                                    setShowMore(false);
                                }}
                                className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-slate-200 hover:bg-white/10 transition"
                            >
                                <span>Participants</span>
                                <span className="rounded-full bg-blue-600/30 px-2 py-0.5 text-[10px] text-blue-300">
                                    {participantCount}
                                </span>
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => {
                                toggleFullscreen();
                                setShowMore(false);
                            }}
                            className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 hover:bg-white/10 transition text-left"
                        >
                            Fullscreen
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}