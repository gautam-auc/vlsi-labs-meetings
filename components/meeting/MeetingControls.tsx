"use client";

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
}: MeetingControlsProps) {
    return (
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {/* Microphone */}
            <button
                type="button"
                onClick={onToggleMic}
                aria-label={micEnabled ? "Mute microphone" : "Unmute microphone"}
                className={`relative flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl shadow-sm transition-all duration-150 ${
                    micEnabled
                        ? "border border-slate-700/80 bg-slate-800/90 text-slate-200 hover:border-slate-600 hover:bg-slate-700 hover:text-white"
                        : "border border-red-500/50 bg-red-600 text-white hover:bg-red-700"
                }`}
                title={micEnabled ? "Mute microphone" : "Unmute microphone"}
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

            {/* Camera */}
            <button
                type="button"
                onClick={onToggleCamera}
                aria-label={cameraEnabled ? "Turn off camera" : "Turn on camera"}
                className={`relative flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl shadow-sm transition-all duration-150 ${
                    cameraEnabled
                        ? "border border-slate-700/80 bg-slate-800/90 text-slate-200 hover:border-slate-600 hover:bg-slate-700 hover:text-white"
                        : "border border-red-500/50 bg-red-600 text-white hover:bg-red-700"
                }`}
                title={cameraEnabled ? "Turn off camera" : "Turn on camera"}
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

            {/* Screen share */}
            <button
                type="button"
                onClick={onToggleScreen}
                aria-label={isScreenSharing ? "Stop sharing screen" : "Share screen"}
                className={`flex h-11 sm:h-12 items-center justify-center gap-2 rounded-2xl px-4 sm:px-5 text-xs sm:text-sm font-semibold transition-all duration-150 shadow-sm ${
                    isScreenSharing
                        ? "border border-blue-500/60 bg-blue-600 text-white hover:bg-blue-700"
                        : "border border-slate-700/80 bg-slate-800/90 text-slate-200 hover:border-slate-600 hover:bg-slate-700 hover:text-white"
                }`}
                title="Share your screen"
            >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="hidden md:inline">
                    {isScreenSharing ? "Stop sharing" : "Share screen"}
                </span>
            </button>

            {/* Divider */}
            <div className="h-6 w-px bg-slate-800 mx-1 hidden sm:block" />

            {/* Participants Toggle */}
            {onToggleParticipants && (
                <button
                    type="button"
                    onClick={onToggleParticipants}
                    aria-label="Toggle participants list"
                    className={`relative flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl shadow-sm transition-all duration-150 ${
                        isParticipantsOpen
                            ? "border border-blue-500/60 bg-blue-600/30 text-blue-400"
                            : "border border-slate-700/80 bg-slate-800/90 text-slate-200 hover:border-slate-600 hover:bg-slate-700 hover:text-white"
                    }`}
                    title="Participants"
                >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    {participantCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-slate-900 px-1 text-[10px] font-bold text-slate-300 border border-slate-700">
                            {participantCount}
                        </span>
                    )}
                </button>
            )}

            {/* Chat Toggle */}
            {onToggleChat && (
                <button
                    type="button"
                    onClick={onToggleChat}
                    aria-label="Toggle meeting chat"
                    className={`relative flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl shadow-sm transition-all duration-150 ${
                        isChatOpen
                            ? "border border-blue-500/60 bg-blue-600/30 text-blue-400"
                            : "border border-slate-700/80 bg-slate-800/90 text-slate-200 hover:border-slate-600 hover:bg-slate-700 hover:text-white"
                    }`}
                    title="In-meeting Chat"
                >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    {unreadChatCount > 0 && !isChatOpen && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white shadow">
                            {unreadChatCount > 9 ? "9+" : unreadChatCount}
                        </span>
                    )}
                </button>
            )}

            {/* Leave */}
            <button
                type="button"
                onClick={onLeave}
                aria-label="Leave meeting"
                className="flex h-11 sm:h-12 items-center justify-center gap-1.5 rounded-2xl border border-red-500/50 bg-red-600 px-4 sm:px-5 text-xs sm:text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-red-700"
                title="Leave meeting"
            >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Leave</span>
            </button>
        </div>
    );
}