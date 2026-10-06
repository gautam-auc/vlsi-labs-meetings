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
        <div className="flex flex-wrap items-center justify-center gap-3">
            {/* Microphone */}
            <button
                type="button"
                onClick={onToggleMic}
                className={`flex h-12 w-12 items-center justify-center rounded-full transition ${micEnabled
                        ? "bg-slate-800 text-white hover:bg-slate-700"
                        : "bg-red-500 text-white hover:bg-red-600"
                    }`}
                title={micEnabled ? "Mute microphone" : "Unmute microphone"}
            >
                {micEnabled ? "🎙️" : "🔇"}
            </button>

            {/* Camera */}
            <button
                type="button"
                onClick={onToggleCamera}
                className={`flex h-12 w-12 items-center justify-center rounded-full transition ${cameraEnabled
                        ? "bg-slate-800 text-white hover:bg-slate-700"
                        : "bg-red-500 text-white hover:bg-red-600"
                    }`}
                title={cameraEnabled ? "Turn camera off" : "Turn camera on"}
            >
                {cameraEnabled ? "📹" : "🚫"}
            </button>

            {/* Screen share */}
            <button
                type="button"
                onClick={onToggleScreen}
                className={`flex h-12 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition ${isScreenSharing
                        ? "bg-indigo-600 text-white hover:bg-indigo-700"
                        : "bg-slate-800 text-white hover:bg-slate-700"
                    }`}
                title="Share your screen"
            >
                🖥️
                <span className="hidden sm:inline">
                    {isScreenSharing ? "Stop sharing" : "Share screen"}
                </span>
            </button>

            {/* Leave */}
            <button
                type="button"
                onClick={onLeave}
                className="flex h-12 items-center justify-center rounded-full bg-red-600 px-5 text-sm font-semibold text-white transition hover:bg-red-700"
            >
                🚪 Leave
            </button>
        </div>
    );
}