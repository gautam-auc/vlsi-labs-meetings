"use client";

type MeetingControlsProps = {
    micEnabled: boolean;
    cameraEnabled: boolean;
    isScreenSharing: boolean;
    onToggleMic: () => void;
    onToggleCamera: () => void;
    onToggleScreen: () => void;
    onLeave: () => void;
};

export default function MeetingControls({
    micEnabled,
    cameraEnabled,
    isScreenSharing,
    onToggleMic,
    onToggleCamera,
    onToggleScreen,
    onLeave,
}: MeetingControlsProps) {
    return (
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 px-2">
            {/* Microphone */}
            <button
                type="button"
                onClick={onToggleMic}
                className={`flex h-11 sm:h-12 items-center justify-center gap-1.5 rounded-full px-3 sm:px-4 text-xs sm:text-sm font-semibold transition touch-manipulation active:scale-95 ${
                    micEnabled
                        ? "bg-slate-800 text-white hover:bg-slate-700"
                        : "bg-red-500 text-white hover:bg-red-600"
                }`}
                title={micEnabled ? "Mute microphone" : "Unmute microphone"}
            >
                <span>{micEnabled ? "🎙️" : "🔇"}</span>
                <span className="hidden xs:inline sm:inline">
                    {micEnabled ? "Mute" : "Unmute"}
                </span>
            </button>

            {/* Camera */}
            <button
                type="button"
                onClick={onToggleCamera}
                className={`flex h-11 sm:h-12 items-center justify-center gap-1.5 rounded-full px-3 sm:px-4 text-xs sm:text-sm font-semibold transition touch-manipulation active:scale-95 ${
                    cameraEnabled
                        ? "bg-slate-800 text-white hover:bg-slate-700"
                        : "bg-red-500 text-white hover:bg-red-600"
                }`}
                title={cameraEnabled ? "Turn camera off" : "Turn camera on"}
            >
                <span>{cameraEnabled ? "📹" : "🚫"}</span>
                <span className="hidden xs:inline sm:inline">
                    {cameraEnabled ? "Stop video" : "Start video"}
                </span>
            </button>

            {/* Screen share */}
            <button
                type="button"
                onClick={onToggleScreen}
                className={`flex h-11 sm:h-12 items-center justify-center gap-1.5 rounded-full px-4 sm:px-5 text-xs sm:text-sm font-semibold transition touch-manipulation active:scale-95 ${
                    isScreenSharing
                        ? "bg-indigo-600 text-white ring-2 ring-indigo-400 hover:bg-indigo-700"
                        : "bg-slate-800 text-white hover:bg-slate-700"
                }`}
                title="Share your screen"
            >
                <span>🖥️</span>
                <span className="inline font-medium">
                    {isScreenSharing ? "Stop sharing" : "Share screen"}
                </span>
            </button>

            {/* Leave */}
            <button
                type="button"
                onClick={onLeave}
                className="flex h-11 sm:h-12 items-center justify-center gap-1 rounded-full bg-red-600 px-4 sm:px-5 text-xs sm:text-sm font-semibold text-white transition hover:bg-red-700 touch-manipulation active:scale-95"
            >
                <span>🚪</span>
                <span>Leave</span>
            </button>
        </div>
    );
}