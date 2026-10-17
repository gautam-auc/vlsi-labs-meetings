"use client";

import { useState } from "react";

type MeetingControlsProps = {
    micEnabled: boolean;
    cameraEnabled: boolean;
    isScreenSharing: boolean;
    onToggleMic: () => void;
    onToggleCamera: () => void;
    onToggleScreen: () => void;
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
    onToggleMic,
    onToggleCamera,
    onToggleScreen,
    onLeave,
    onToggleChat,
    isChatOpen = false,
    unreadChatCount = 0,
    onToggleParticipants,
    isParticipantsOpen = false,
    participantCount = 1,
    onSendReaction,
}: MeetingControlsProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [isHandRaised, setIsHandRaised] = useState(false);
    const [isCaptionOn, setIsCaptionOn] = useState(false);
    const [showReactions, setShowReactions] = useState(false);
    const [showMore, setShowMore] = useState(false);

    const emojis = ["👏", "👍", "❤️", "🎉", "😂", "✋"];

    const handleEmojiClick = (emoji: string) => {
        if (onSendReaction) onSendReaction(emoji);
        setShowReactions(false);
    };

    return (
        <div className="relative flex w-full max-w-7xl items-center justify-between px-2 sm:px-6">
            {/* LEFT: Recording status button */}
            <div className="hidden lg:flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => setIsRecording(!isRecording)}
                    className="flex items-center gap-2 rounded-xl bg-slate-900/80 px-3 py-2 text-xs font-semibold text-slate-300 border border-slate-800 hover:border-slate-700 hover:text-white transition shadow-sm"
                >
                    <span
                        className={`h-2.5 w-2.5 rounded-full ${
                            isRecording ? "bg-red-500 animate-pulse" : "bg-slate-500"
                        }`}
                    />
                    <span>{isRecording ? "Stop Recording" : "Record"}</span>
                </button>
            </div>

            {/* CENTER: Main action buttons (Matching Image 2) */}
            <div className="flex flex-1 items-center justify-center gap-2 sm:gap-4">
                {/* Video Toggle */}
                <button
                    type="button"
                    onClick={onToggleCamera}
                    className="group flex flex-col items-center gap-1.5 text-slate-400 hover:text-white transition"
                    title={cameraEnabled ? "Stop Video" : "Start Video"}
                >
                    <div
                        className={`flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full transition shadow-sm ${
                            cameraEnabled
                                ? "bg-[#20222a] text-slate-200 border border-slate-700/60 group-hover:bg-[#282b36] group-hover:border-slate-600"
                                : "bg-red-600 text-white shadow-red-900/30"
                        }`}
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
                    </div>
                    <span className="text-[10px] font-medium text-slate-400 group-hover:text-slate-300 hidden sm:block">
                        {cameraEnabled ? "Stop Video" : "Start Video"}
                    </span>
                </button>

                {/* Mic Toggle */}
                <button
                    type="button"
                    onClick={onToggleMic}
                    className="group flex flex-col items-center gap-1.5 text-slate-400 hover:text-white transition"
                    title={micEnabled ? "Mute" : "Unmute"}
                >
                    <div
                        className={`flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full transition shadow-sm ${
                            micEnabled
                                ? "bg-[#20222a] text-slate-200 border border-slate-700/60 group-hover:bg-[#282b36] group-hover:border-slate-600"
                                : "bg-red-600 text-white shadow-red-900/30"
                        }`}
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
                    </div>
                    <span className="text-[10px] font-medium text-slate-400 group-hover:text-slate-300 hidden sm:block">
                        {micEnabled ? "Mute" : "Unmute"}
                    </span>
                </button>

                {/* Chat Toggle */}
                {onToggleChat && (
                    <button
                        type="button"
                        onClick={onToggleChat}
                        className="group relative flex flex-col items-center gap-1.5 text-slate-400 hover:text-white transition"
                        title="Chat"
                    >
                        <div
                            className={`flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full transition shadow-sm ${
                                isChatOpen
                                    ? "bg-blue-600 text-white shadow-blue-900/30"
                                    : "bg-[#20222a] text-slate-200 border border-slate-700/60 group-hover:bg-[#282b36] group-hover:border-slate-600"
                            }`}
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            {unreadChatCount > 0 && !isChatOpen && (
                                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-blue-500 px-1 text-[9px] font-bold text-white shadow">
                                    {unreadChatCount}
                                </span>
                            )}
                        </div>
                        <span className="text-[10px] font-medium text-slate-400 group-hover:text-slate-300 hidden sm:block">Chat</span>
                    </button>
                )}

                {/* Big Red Leave Button (Centerpiece as in Image 2) */}
                <button
                    type="button"
                    onClick={onLeave}
                    className="flex h-11 w-14 sm:h-12 sm:w-16 items-center justify-center rounded-full bg-red-600 text-white shadow-lg shadow-red-900/40 transition hover:bg-red-700 active:scale-95"
                    title="Leave meeting"
                >
                    <svg className="h-6 w-6 transform rotate-[135deg]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1.02l-2.2 2.2z" />
                    </svg>
                </button>

                {/* Share Screen */}
                <button
                    type="button"
                    onClick={onToggleScreen}
                    className="group flex flex-col items-center gap-1.5 text-slate-400 hover:text-white transition"
                    title={isScreenSharing ? "Stop Sharing" : "Share Screen"}
                >
                    <div
                        className={`flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full transition shadow-sm ${
                            isScreenSharing
                                ? "bg-blue-600 text-white shadow-blue-900/30"
                                : "bg-[#20222a] text-slate-200 border border-slate-700/60 group-hover:bg-[#282b36] group-hover:border-slate-600"
                        }`}
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <span className="text-[10px] font-medium text-slate-400 group-hover:text-slate-300 hidden sm:block">Share Screen</span>
                </button>

                {/* Reaction Popup */}
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setShowReactions(!showReactions)}
                        className="group flex flex-col items-center gap-1.5 text-slate-400 hover:text-white transition"
                        title="Reactions"
                    >
                        <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-[#20222a] text-slate-200 border border-slate-700/60 group-hover:bg-[#282b36] group-hover:border-slate-600 transition shadow-sm">
                            <span className="text-lg">😊</span>
                        </div>
                        <span className="text-[10px] font-medium text-slate-400 group-hover:text-slate-300 hidden sm:block">Reaction</span>
                    </button>

                    {showReactions && (
                        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-2xl border border-slate-700 bg-[#1a1c23]/95 p-2 shadow-2xl backdrop-blur-xl z-50">
                            {emojis.map((emoji) => (
                                <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => handleEmojiClick(emoji)}
                                    className="flex h-9 w-9 items-center justify-center rounded-xl text-xl hover:bg-slate-800 hover:scale-125 transition"
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* More Menu */}
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setShowMore(!showMore)}
                        className="group flex flex-col items-center gap-1.5 text-slate-400 hover:text-white transition"
                        title="More options"
                    >
                        <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-[#20222a] text-slate-200 border border-slate-700/60 group-hover:bg-[#282b36] group-hover:border-slate-600 transition shadow-sm">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                            </svg>
                        </div>
                        <span className="text-[10px] font-medium text-slate-400 group-hover:text-slate-300 hidden sm:block">More</span>
                    </button>

                    {showMore && (
                        <div className="absolute bottom-14 left-1/2 -translate-x-1/2 w-48 rounded-2xl border border-slate-800 bg-slate-900/95 p-2 shadow-2xl backdrop-blur-xl z-50 space-y-1">
                            {onToggleParticipants && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        onToggleParticipants();
                                        setShowMore(false);
                                    }}
                                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition"
                                >
                                    <span>👥</span>
                                    <span>Participants ({participantCount})</span>
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => {
                                    setIsHandRaised(!isHandRaised);
                                    setShowMore(false);
                                }}
                                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition"
                            >
                                <span>✋</span>
                                <span>{isHandRaised ? "Lower Hand" : "Raise Hand"}</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsCaptionOn(!isCaptionOn);
                                    setShowMore(false);
                                }}
                                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition"
                            >
                                <span>💬</span>
                                <span>{isCaptionOn ? "Turn Off Captions" : "Turn On Captions"}</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT: Secondary controls (Matching Image 2) */}
            <div className="hidden lg:flex items-center gap-3">
                {/* Raise Hand */}
                <button
                    type="button"
                    onClick={() => setIsHandRaised(!isHandRaised)}
                    className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-white transition"
                    title={isHandRaised ? "Lower Hand" : "Raise Hand"}
                >
                    <div
                        className={`flex h-11 w-11 items-center justify-center rounded-full transition shadow-sm ${
                            isHandRaised ? "bg-amber-500/20 text-amber-400 border border-amber-500/40" : "bg-[#20222a] text-slate-200 border border-slate-700/60 hover:bg-[#282b36]"
                        }`}
                    >
                        <span className="text-base">✋</span>
                    </div>
                    <span className="text-[10px] font-medium text-slate-400">Raise Hand</span>
                </button>

                {/* Caption */}
                <button
                    type="button"
                    onClick={() => setIsCaptionOn(!isCaptionOn)}
                    className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-white transition"
                    title="Live Captions"
                >
                    <div
                        className={`flex h-11 w-11 items-center justify-center rounded-full transition shadow-sm ${
                            isCaptionOn ? "bg-blue-600 text-white shadow-blue-900/30" : "bg-[#20222a] text-slate-200 border border-slate-700/60 hover:bg-[#282b36]"
                        }`}
                    >
                        <span className="text-[11px] font-bold border border-current px-1 py-0.2 rounded">CC</span>
                    </div>
                    <span className="text-[10px] font-medium text-slate-400">Caption</span>
                </button>

                {/* Detail */}
                {onToggleParticipants && (
                    <button
                        type="button"
                        onClick={onToggleParticipants}
                        className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-white transition"
                        title="Meeting Details"
                    >
                        <div
                            className={`flex h-11 w-11 items-center justify-center rounded-full transition shadow-sm ${
                                isParticipantsOpen ? "bg-blue-600 text-white shadow-blue-900/30" : "bg-[#20222a] text-slate-200 border border-slate-700/60 hover:bg-[#282b36]"
                            }`}
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <span className="text-[10px] font-medium text-slate-400">Detail</span>
                    </button>
                )}
            </div>
        </div>
    );
}