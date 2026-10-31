"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import VideoTile, { VideoTileRef } from "./VideoTile";
import MeetingControls from "./MeetingControls";
import LobbyScreen from "./LobbyScreen";
import { soundEngine } from "../../lib/sounds";
import { captionsEngine, CaptionEvent } from "../../lib/speechRecognition";
import { getPublicMeetingUrl } from "../../lib/utils";


type RemoteParticipant = {
    socketId: string;
    name: string;
    stream: MediaStream;
    cameraEnabled: boolean;
    screenSharing: boolean;
};

type MeetingRoomProps = {
    meetingId: string;
};

type ExistingUser = {
    socketId: string;
    participantName: string;
};

type MediaStateMessage =
    | {
          type: "media-state";
          cameraEnabled: boolean;
          screenSharing: boolean;
      }
    | {
          type: "chat-message";
          id: string;
          senderName: string;
          text: string;
          time: string;
      }
    | {
          type: "reaction";
          emoji: string;
          left?: number;
      }
    | {
          type: "caption";
          speakerName: string;
          text: string;
      };

const SOCKET_URL =
    process.env.NEXT_PUBLIC_SOCKET_URL ||
    "https://vlsi-labs-meetings.onrender.com";

/* =========================================================
   PERSISTENT REMOTE AUDIO SINK (Never unmounted, with Echo Guard)
========================================================= */
function RemoteAudioSink({
    stream,
    muted = false,
}: {
    stream: MediaStream;
    muted?: boolean;
}) {
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !stream) return;

        audio.srcObject = stream;
        audio.muted = muted;
        audio.volume = muted ? 0 : 0.85;

        const playAudio = () => {
            audio.play().catch(() => {});
        };

        playAudio();
        stream.onaddtrack = () => playAudio();

        const unlock = () => playAudio();
        window.addEventListener("click", unlock, { passive: true });
        window.addEventListener("touchstart", unlock, { passive: true });
        window.addEventListener("keydown", unlock, { passive: true });

        return () => {
            window.removeEventListener("click", unlock);
            window.removeEventListener("touchstart", unlock);
            window.removeEventListener("keydown", unlock);
        };
    }, [stream, muted]);

    return <audio ref={audioRef} autoPlay playsInline muted={muted} className="hidden" />;
}

function MeetingDurationTimer({ joined }: { joined: boolean }) {
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        if (!joined) return;
        const interval = setInterval(() => {
            setSeconds((prev) => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [joined]);

    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    const pad = (n: number) => n.toString().padStart(2, "0");
    const formatted = hrs > 0 ? `${pad(hrs)}:${pad(mins)}:${pad(secs)}` : `${pad(mins)}:${pad(secs)}`;

    return <span className="font-mono font-bold text-white text-xs sm:text-sm">{formatted}</span>;
}

export default function MeetingRoom({ meetingId }: MeetingRoomProps) {
    const router = useRouter();

    /* =========================================================
       BASIC STATE
    ========================================================= */
    const [participantName, setParticipantName] = useState("");
    const [joined, setJoined] = useState(false);
    const [joining, setJoining] = useState(false);
    const [micEnabled, setMicEnabled] = useState(true);
    const [cameraEnabled, setCameraEnabled] = useState(true);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
    const [error, setError] = useState("");

    const [localPreviewStream, setLocalPreviewStream] = useState<MediaStream | null>(null);
    const [remoteParticipants, setRemoteParticipants] = useState<RemoteParticipant[]>([]);
    const [pinnedSocketId, setPinnedSocketId] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    const [mobileTab, setMobileTab] = useState<"chat" | "participants" | "notes">("chat");
    const [activeRightTab, setActiveRightTab] = useState<"chat" | "participants" | "notes">("chat");
    const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
    const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

    // Live Captions & Speech Recognition State
    const [isCaptionsEnabled, setIsCaptionsEnabled] = useState(false);
    const [activeCaption, setActiveCaption] = useState<{ speakerName: string; text: string } | null>(null);
    const captionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // In-Meeting Notepad & Running Calendar State
    const [notesText, setNotesText] = useState("");
    const [showCalendarModal, setShowCalendarModal] = useState(false);

    // Accidental Exit Guard & Mobile Screen Share Notice State
    const [showExitModal, setShowExitModal] = useState(false);
    const [pendingExitUrl, setPendingExitUrl] = useState("/dashboard");
    const [mobileScreenShareNotice, setMobileScreenShareNotice] = useState(false);

    const confirmNavTo = (url: string) => {
        setPendingExitUrl(url);
        setShowExitModal(true);
    };

    // Video Tile Ref for Native Picture-in-Picture (PiP)
    const mainVideoRef = useRef<VideoTileRef>(null);

    const [chatMessages, setChatMessages] = useState<
        Array<{
            id: string;
            senderName: string;
            text: string;
            time: string;
            isSelf: boolean;
        }>
    >([]);
    const [chatInput, setChatInput] = useState("");
    const [unreadChatCount, setUnreadChatCount] = useState(0);
    const [copiedUrl, setCopiedUrl] = useState(false);
    const [reactions, setReactions] = useState<Array<{ id: string; emoji: string }>>([]);
    const [flyingReactions, setFlyingReactions] = useState<Array<{ id: string; emoji: string; left: number }>>([]);

    // Mobile chat input ref for stable focus preservation
    const mobileChatInputRef = useRef<HTMLInputElement | null>(null);

    // Responsive screen width detection (strictly ignores mobile height shrinking from virtual keyboard)
    useEffect(() => {
        const isMobileInitial = window.innerWidth < 768;
        setIsMobile(isMobileInitial);
        if (!isMobileInitial) {
            setIsRightPanelOpen(true);
        }

        const handleResize = () => {
            const width = window.innerWidth;
            const mobile = width < 768;
            setIsMobile((prev) => {
                if (prev !== mobile) {
                    setIsRightPanelOpen(!mobile);
                    return mobile;
                }
                return prev;
            });
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    /* =========================================================
       STREAM & SOCKET REFS
    ========================================================= */
    const localStreamRef = useRef<MediaStream | null>(null);
    const screenStreamRef = useRef<MediaStream | null>(null);
    const socketRef = useRef<Socket | null>(null);

    const peerConnectionsRef = useRef<Record<string, RTCPeerConnection>>({});
    const videoSendersRef = useRef<Record<string, RTCRtpSender>>({});
    const audioSendersRef = useRef<Record<string, RTCRtpSender>>({});
    const dataChannelsRef = useRef<Record<string, RTCDataChannel>>({});

    const remoteStreamsRef = useRef<Record<string, MediaStream>>({});
    const remoteNamesRef = useRef<Record<string, string>>({});
    const pendingIceCandidatesRef = useRef<Record<string, RTCIceCandidateInit[]>>({});
    const remoteMediaStatesRef = useRef<Record<string, { cameraEnabled: boolean; screenSharing: boolean }>>({});

    const participantNameRef = useRef("");
    const cameraEnabledRef = useRef(true);
    const micEnabledRef = useRef(true);
    const screenSharingRef = useRef(false);

    useEffect(() => {
        participantNameRef.current = participantName;
    }, [participantName]);

    useEffect(() => {
        cameraEnabledRef.current = cameraEnabled;
    }, [cameraEnabled]);

    useEffect(() => {
        micEnabledRef.current = micEnabled;
    }, [micEnabled]);

    useEffect(() => {
        screenSharingRef.current = isScreenSharing;
    }, [isScreenSharing]);

    /* =========================================================
       REACTIONS WITH FLYING ANIMATION
    ========================================================= */
    const sendReaction = (emoji: string) => {
        const id = `${Date.now()}-${Math.random()}`;
        const left = Math.floor(Math.random() * 60) + 20;
        setFlyingReactions((prev) => [...prev, { id, emoji, left }]);
        setTimeout(() => {
            setFlyingReactions((prev) => prev.filter((r) => r.id !== id));
        }, 3000);

        const payload = JSON.stringify({ type: "reaction", emoji, left });
        Object.values(dataChannelsRef.current).forEach((channel) => {
            if (channel.readyState === "open") {
                try {
                    channel.send(payload);
                } catch {}
            }
        });
    };

    /* =========================================================
       ADD / UPDATE REMOTE PARTICIPANT (Strict Deduplication)
    ========================================================= */
    const addRemoteParticipant = useCallback(
        (socketId: string, name: string, stream?: MediaStream) => {
            if (!socketId || socketId === socketRef.current?.id) return;

            const cleanName = (name || "Participant").trim();
            const remoteStream =
                stream || remoteStreamsRef.current[socketId] || new MediaStream();
            remoteStreamsRef.current[socketId] = remoteStream;
            remoteNamesRef.current[socketId] = cleanName;

            setRemoteParticipants((current) => {
                // Strict deduplication by socketId only (supports same-name attendees and multi-device self testing)
                const filtered = current.filter((p) => p.socketId !== socketId);

                const cachedMediaState = remoteMediaStatesRef.current[socketId];
                return [
                    ...filtered,
                    {
                        socketId,
                        name: cleanName,
                        stream: remoteStream,
                        cameraEnabled: cachedMediaState?.cameraEnabled ?? true,
                        screenSharing: cachedMediaState?.screenSharing ?? false,
                    },
                ];
            });
        },
        []
    );

    /* =========================================================
       REMOVE REMOTE PARTICIPANT
    ========================================================= */
    const removeParticipant = useCallback((socketId: string) => {
        soundEngine.playLeaveSound();
        const connection = peerConnectionsRef.current[socketId];
        if (connection) {
            connection.close();
            delete peerConnectionsRef.current[socketId];
        }

        delete videoSendersRef.current[socketId];
        delete audioSendersRef.current[socketId];
        delete dataChannelsRef.current[socketId];
        delete remoteStreamsRef.current[socketId];
        delete remoteNamesRef.current[socketId];
        delete pendingIceCandidatesRef.current[socketId];
        delete remoteMediaStatesRef.current[socketId];

        setRemoteParticipants((current) =>
            current.filter((p) => p.socketId !== socketId)
        );

        setPinnedSocketId((curr) => (curr === socketId ? null : curr));
    }, []);

    /* =========================================================
       MEDIA STATE SYNC
    ========================================================= */
    const applyRemoteMediaState = (
        socketId: string,
        mediaState: { cameraEnabled?: boolean; screenSharing?: boolean }
    ) => {
        const prev = remoteMediaStatesRef.current[socketId] || {
            cameraEnabled: true,
            screenSharing: false,
        };

        const updated = {
            cameraEnabled:
                mediaState.cameraEnabled !== undefined
                    ? mediaState.cameraEnabled
                    : prev.cameraEnabled,
            screenSharing:
                mediaState.screenSharing !== undefined
                    ? mediaState.screenSharing
                    : prev.screenSharing,
        };

        remoteMediaStatesRef.current[socketId] = updated;

        setRemoteParticipants((current) =>
            current.map((p) =>
                p.socketId === socketId
                    ? {
                          ...p,
                          cameraEnabled: updated.cameraEnabled,
                          screenSharing: updated.screenSharing,
                          stream: remoteStreamsRef.current[socketId] || p.stream,
                      }
                    : p
            )
        );
    };

    const sendMediaState = (
        overrides?: Partial<{ cameraEnabled: boolean; screenSharing: boolean }>
    ) => {
        const state = {
            type: "media-state" as const,
            cameraEnabled: overrides?.cameraEnabled ?? cameraEnabledRef.current,
            screenSharing: overrides?.screenSharing ?? screenSharingRef.current,
        };

        Object.values(dataChannelsRef.current).forEach((channel) => {
            if (channel.readyState === "open") {
                try {
                    channel.send(JSON.stringify(state));
                } catch {}
            }
        });

        if (socketRef.current?.connected) {
            socketRef.current.emit("media-state", {
                meetingId,
                cameraEnabled: state.cameraEnabled,
                screenSharing: state.screenSharing,
            });
        }
    };

    /* =========================================================
       CHAT & DATA CHANNEL
    ========================================================= */
    const handleChatMessage = (data: {
        id?: string;
        senderName: string;
        text: string;
        time?: string;
        isSelf?: boolean;
    }) => {
        const msgId = data.id || `${data.senderName}-${data.text}-${Date.now()}`;
        if (!data.isSelf) {
            soundEngine.playMessageSound();
        }
        setChatMessages((prev) => {
            if (prev.some((m) => m.id === msgId)) return prev;
            return [
                ...prev,
                {
                    id: msgId,
                    senderName: data.senderName,
                    text: data.text,
                    time:
                        data.time ||
                        new Date().toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                        }),
                    isSelf: Boolean(data.isSelf),
                },
            ];
        });
        setUnreadChatCount((c) => c + 1);
    };

    const handleDataChannelMessage = (socketId: string, event: MessageEvent) => {
        try {
            const message = JSON.parse(event.data) as MediaStateMessage;
            if (message.type === "chat-message") {
                handleChatMessage({
                    id: message.id,
                    senderName: message.senderName,
                    text: message.text,
                    time: message.time,
                    isSelf: false,
                });
                return;
            }
            if (message.type === "reaction") {
                const id = `${Date.now()}-${Math.random()}`;
                const left = message.left ?? (Math.floor(Math.random() * 60) + 20);
                setFlyingReactions((prev) => [...prev, { id, emoji: message.emoji, left }]);
                setTimeout(() => {
                    setFlyingReactions((prev) => prev.filter((r) => r.id !== id));
                }, 3000);
                return;
            }
            if (message.type === "caption") {
                setActiveCaption({ speakerName: message.speakerName, text: message.text });
                if (captionTimeoutRef.current) clearTimeout(captionTimeoutRef.current);
                captionTimeoutRef.current = setTimeout(() => {
                    setActiveCaption(null);
                }, 4000);
                return;
            }
            if (message.type === "media-state") {
                applyRemoteMediaState(socketId, {
                    cameraEnabled: message.cameraEnabled,
                    screenSharing: message.screenSharing,
                });
            }
        } catch (err) {
            console.error("Invalid data channel message:", err);
        }
    };

    const setupDataChannel = (socketId: string, channel: RTCDataChannel) => {
        dataChannelsRef.current[socketId] = channel;
        channel.onopen = () => {
            channel.send(
                JSON.stringify({
                    type: "media-state",
                    cameraEnabled: cameraEnabledRef.current,
                    screenSharing: screenSharingRef.current,
                })
            );
        };
        channel.onmessage = (event) => handleDataChannelMessage(socketId, event);
        channel.onclose = () => {
            delete dataChannelsRef.current[socketId];
        };
    };

    /* =========================================================
       CREATE PEER CONNECTION
    ========================================================= */
    const createPeerConnection = (
        remoteSocketId: string,
        remoteName: string,
        createDataChannel = false
    ) => {
        const existing = peerConnectionsRef.current[remoteSocketId];
        if (existing) return existing;

        remoteNamesRef.current[remoteSocketId] = remoteName;

        if (peerConnectionsRef.current[remoteSocketId]) {
            try {
                peerConnectionsRef.current[remoteSocketId].close();
            } catch {}
        }

        const peerConnection = new RTCPeerConnection({
            iceServers: [
                { urls: "stun:stun.l.google.com:19302" },
                { urls: "stun:stun1.l.google.com:19302" },
                { urls: "stun:stun2.l.google.com:19302" },
                { urls: "stun:stun3.l.google.com:19302" },
                { urls: "stun:stun.cloudflare.com:3478" },
                {
                    urls: [
                        "turn:openrelay.metered.ca:80",
                        "turn:openrelay.metered.ca:443",
                        "turn:openrelay.metered.ca:443?transport=tcp",
                        "turns:openrelay.metered.ca:443?transport=tcp",
                    ],
                    username: "openrelayproject",
                    credential: "openrelayproject",
                },
            ],
            iceCandidatePoolSize: 10,
        });

        peerConnectionsRef.current[remoteSocketId] = peerConnection;

        // Synchronously attach all local audio & video tracks
        const localStream = localStreamRef.current;
        if (localStream) {
            localStream.getTracks().forEach((track) => {
                try {
                    track.enabled = track.kind === "audio" ? micEnabledRef.current : cameraEnabledRef.current;
                    const sender = peerConnection.addTrack(track, localStream);
                    if (track.kind === "audio") audioSendersRef.current[remoteSocketId] = sender;
                    if (track.kind === "video") videoSendersRef.current[remoteSocketId] = sender;
                } catch (err) {
                    console.error("Failed to add track to peer connection:", err);
                }
            });
        }

        // Guarantee bidirectional transceivers
        if (!peerConnection.getTransceivers().some((t) => t.receiver.track.kind === "audio")) {
            const audioTransceiver = peerConnection.addTransceiver("audio", { direction: "sendrecv" });
            audioSendersRef.current[remoteSocketId] = audioTransceiver.sender;
        }
        if (!peerConnection.getTransceivers().some((t) => t.receiver.track.kind === "video")) {
            const videoTransceiver = peerConnection.addTransceiver("video", { direction: "sendrecv" });
            videoSendersRef.current[remoteSocketId] = videoTransceiver.sender;
        }

        if (createDataChannel) {
            const dataChannel = peerConnection.createDataChannel("meeting-state");
            setupDataChannel(remoteSocketId, dataChannel);
        }

        peerConnection.ondatachannel = (event) => {
            setupDataChannel(remoteSocketId, event.channel);
        };

        peerConnection.onicecandidate = (event) => {
            if (event.candidate && socketRef.current) {
                socketRef.current.emit("ice-candidate", {
                    target: remoteSocketId,
                    candidate: event.candidate,
                });
            }
        };

        peerConnection.ontrack = (event) => {
            console.log("Remote track received:", event.track.kind, "from", remoteSocketId);
            let remoteStream = remoteStreamsRef.current[remoteSocketId];
            if (!remoteStream) {
                remoteStream = event.streams[0] || new MediaStream();
            }
            if (!remoteStream.getTracks().some((track) => track.id === event.track.id)) {
                remoteStream.addTrack(event.track);
            }

            remoteStreamsRef.current[remoteSocketId] = remoteStream;
            const remoteName = remoteNamesRef.current[remoteSocketId] || "Participant";
            addRemoteParticipant(remoteSocketId, remoteName, remoteStream);
        };

        const triggerIceRestart = async () => {
            try {
                console.log(`[WebRTC] Triggering ICE restart offer for ${remoteSocketId}`);
                peerConnection.restartIce();
                const offer = await peerConnection.createOffer({ iceRestart: true });
                await peerConnection.setLocalDescription(offer);
                socketRef.current?.emit("offer", {
                    target: remoteSocketId,
                    offer,
                    participantName: participantNameRef.current,
                });
            } catch (err) {
                console.warn(`[WebRTC] ICE restart failed for ${remoteSocketId}:`, err);
            }
        };

        peerConnection.onconnectionstatechange = () => {
            const state = peerConnection.connectionState;
            console.log(`[WebRTC] connectionState (${remoteSocketId}):`, state);
            if (state === "failed") {
                console.warn(`[WebRTC] Peer connection failed for ${remoteSocketId}, attempting ICE restart...`);
                triggerIceRestart();
            }
            // CRITICAL: NEVER evict participants from the meeting room on WebRTC network state.
            // Socket.IO "user-left" is the only authority for removing a participant when they actually leave.
        };

        peerConnection.oniceconnectionstatechange = () => {
            const iceState = peerConnection.iceConnectionState;
            console.log(`[WebRTC] iceConnectionState (${remoteSocketId}):`, iceState);
            if (iceState === "failed") {
                console.warn(`[WebRTC] ICE failed for ${remoteSocketId}, attempting ICE restart...`);
                triggerIceRestart();
            }
        };

        return peerConnection;
    };

    /* =========================================================
       FLUSH ICE CANDIDATES
    ========================================================= */
    const flushPendingIceCandidates = async (
        socketId: string,
        peerConnection: RTCPeerConnection
    ) => {
        const candidates = pendingIceCandidatesRef.current[socketId];
        if (!candidates?.length) return;

        for (const candidate of candidates) {
            try {
                await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (err) {
                console.error("Failed to add queued ICE candidate:", err);
            }
        }
        delete pendingIceCandidatesRef.current[socketId];
    };

    /* =========================================================
       SOCKET HANDLERS
    ========================================================= */
    const handleExistingUsers = async (users: ExistingUser[]) => {
        for (const user of users) {
            if (!user.socketId || user.socketId === socketRef.current?.id) continue;
            addRemoteParticipant(user.socketId, user.participantName);

            const peerConnection = createPeerConnection(user.socketId, user.participantName, true);
            try {
                const offer = await peerConnection.createOffer();
                await peerConnection.setLocalDescription(offer);
                socketRef.current?.emit("offer", {
                    target: user.socketId,
                    offer,
                    participantName: participantNameRef.current,
                });
            } catch (err) {
                console.error("Failed to create offer:", err);
            }
        }
    };

    const handleUserJoined = (data: { socketId: string; participantName: string }) => {
        if (!data.socketId || data.socketId === socketRef.current?.id) return;
        soundEngine.playJoinSound();
        addRemoteParticipant(data.socketId, data.participantName);
        createPeerConnection(data.socketId, data.participantName, false);
        sendMediaState();
    };

    const handleOffer = async (data: {
        sender: string;
        offer: RTCSessionDescriptionInit;
        participantName?: string;
    }) => {
        const remoteName = data.participantName || "Participant";
        remoteNamesRef.current[data.sender] = remoteName;
        addRemoteParticipant(data.sender, remoteName);

        const peerConnection =
            peerConnectionsRef.current[data.sender] ||
            createPeerConnection(data.sender, remoteName, false);
        try {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
            await flushPendingIceCandidates(data.sender, peerConnection);

            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);

            socketRef.current?.emit("answer", {
                target: data.sender,
                answer,
            });
        } catch (err) {
            console.error("Error handling offer:", err);
        }
    };

    const handleAnswer = async (data: { sender: string; answer: RTCSessionDescriptionInit }) => {
        const peerConnection = peerConnectionsRef.current[data.sender];
        if (!peerConnection) return;
        try {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
            await flushPendingIceCandidates(data.sender, peerConnection);
        } catch (err) {
            console.error("Error handling answer:", err);
        }
    };

    const handleIceCandidate = async (data: { sender: string; candidate: RTCIceCandidateInit }) => {
        const peerConnection = peerConnectionsRef.current[data.sender];
        if (!peerConnection || !peerConnection.remoteDescription) {
            if (!pendingIceCandidatesRef.current[data.sender]) {
                pendingIceCandidatesRef.current[data.sender] = [];
            }
            pendingIceCandidatesRef.current[data.sender].push(data.candidate);
            return;
        }

        try {
            await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (err) {
            console.error("Error adding ICE candidate:", err);
        }
    };

    /* =========================================================
       JOIN MEETING (Combines Media with Maximum Echo Cancellation)
    ========================================================= */
    const joinRoom = async (
        overrideName?: string,
        initialOptions?: { micEnabled: boolean; cameraEnabled: boolean }
    ) => {
        const name = (overrideName || participantName).trim();
        if (!name) {
            setError("Please enter your name to join");
            return;
        }

        setJoining(true);
        setError("");

        // Allow mobile camera hardware HAL to release after LobbyScreen unmounts
        await new Promise((r) => setTimeout(r, 150));

        let stream: MediaStream;
        const wantMic = initialOptions?.micEnabled ?? true;
        const wantCamera = initialOptions?.cameraEnabled ?? true;

        if (!wantCamera) {
            // User requested camera OFF from lobby: avoid acquiring camera hardware
            stream = new MediaStream();
            if (wantMic) {
                try {
                    const audioStream = await navigator.mediaDevices.getUserMedia({
                        audio: {
                            echoCancellation: true,
                            noiseSuppression: true,
                            autoGainControl: true,
                        },
                    });
                    audioStream.getAudioTracks().forEach((track) => stream.addTrack(track));
                    setMicEnabled(true);
                    micEnabledRef.current = true;
                } catch (audioErr) {
                    console.warn("Microphone access failed:", audioErr);
                    setMicEnabled(false);
                    micEnabledRef.current = false;
                }
            } else {
                setMicEnabled(false);
                micEnabledRef.current = false;
            }
            setCameraEnabled(false);
            cameraEnabledRef.current = false;
        } else {
            // User requested camera ON: acquire combined with mobile-friendly constraints
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    audio: wantMic
                        ? {
                              echoCancellation: true,
                              noiseSuppression: true,
                              autoGainControl: true,
                          }
                        : false,
                    video: {
                        width: { ideal: 1280 },
                        height: { ideal: 720 },
                        facingMode: facingMode || "user",
                    },
                });
                const hasLiveCam = stream.getVideoTracks().length > 0;
                const hasLiveMic = stream.getAudioTracks().length > 0;
                setMicEnabled(wantMic && hasLiveMic);
                micEnabledRef.current = wantMic && hasLiveMic;
                setCameraEnabled(hasLiveCam);
                cameraEnabledRef.current = hasLiveCam;
            } catch (combinedErr) {
                console.warn("Combined getUserMedia failed, attempting fallbacks:", combinedErr);
                stream = new MediaStream();

                if (wantMic) {
                    try {
                        const audioStream = await navigator.mediaDevices.getUserMedia({
                            audio: {
                                echoCancellation: true,
                                noiseSuppression: true,
                                autoGainControl: true,
                            },
                        });
                        audioStream.getAudioTracks().forEach((track) => stream.addTrack(track));
                        setMicEnabled(true);
                        micEnabledRef.current = true;
                    } catch (audioErr) {
                        console.warn("Microphone access failed:", audioErr);
                        setMicEnabled(false);
                        micEnabledRef.current = false;
                    }
                } else {
                    setMicEnabled(false);
                    micEnabledRef.current = false;
                }

                try {
                    const videoStream = await navigator.mediaDevices.getUserMedia({
                        video: {
                            width: { ideal: 1280 },
                            height: { ideal: 720 },
                            facingMode: facingMode || "user",
                        },
                    });
                    videoStream.getVideoTracks().forEach((track) => stream.addTrack(track));
                    setCameraEnabled(true);
                    cameraEnabledRef.current = true;
                } catch (videoErr) {
                    console.warn("Camera access failed:", videoErr);
                    setCameraEnabled(false);
                    cameraEnabledRef.current = false;
                }
            }
        }

        stream.getAudioTracks().forEach((t) => {
            t.enabled = wantMic;
        });

        localStreamRef.current = stream;
        const liveVideoTracks = stream.getVideoTracks().filter((t) => t.readyState === "live");
        setLocalPreviewStream(liveVideoTracks.length > 0 ? stream : null);

        try {
            const socket = io(SOCKET_URL, {
                transports: ["websocket", "polling"],
                reconnection: true,
                reconnectionAttempts: 15,
                reconnectionDelay: 1000,
            });

            socketRef.current = socket;

            socket.on("existing-users", handleExistingUsers);
            socket.on("user-joined", handleUserJoined);
            socket.on("offer", handleOffer);
            socket.on("answer", handleAnswer);
            socket.on("ice-candidate", handleIceCandidate);
            socket.on("user-left", (data: { socketId: string }) => removeParticipant(data.socketId));
            socket.on("chat-message", handleChatMessage);
            socket.on(
                "media-state",
                (data: { socketId: string; cameraEnabled?: boolean; screenSharing?: boolean }) => {
                    if (data?.socketId) {
                        applyRemoteMediaState(data.socketId, {
                            cameraEnabled: data.cameraEnabled,
                            screenSharing: data.screenSharing,
                        });
                    }
                }
            );

            socket.on("connect_error", (connectionError) => {
                console.warn("Signaling socket connection note:", connectionError?.message || connectionError);
            });

            socket.on("connect", () => {
                console.log("Connected to signaling server:", socket.id);
                const normMeetingId = (meetingId || "").trim().toUpperCase();
                socket.emit("join-room", { meetingId: normMeetingId, participantName: name });
                sendMediaState({
                    cameraEnabled: cameraEnabledRef.current,
                    screenSharing: false,
                });

                // Attendance recording
                fetch(`/api/meetings/${meetingId}/join`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ participantName: name }),
                }).catch(() => {});

                // Persisted chat history
                fetch(`/api/meetings/${meetingId}/messages`)
                    .then((res) => (res.ok ? res.json() : null))
                    .then((data) => {
                        if (data?.messages && Array.isArray(data.messages)) {
                            setChatMessages(
                                data.messages.map((m: any) => ({
                                    id: m.id,
                                    senderName: m.senderName,
                                    text: m.text,
                                    time: m.time,
                                    isSelf: m.senderName === name,
                                }))
                            );
                        }
                    })
                    .catch(() => {});

                soundEngine.playJoinSound();
                setJoined(true);
                setJoining(false);
            });
        } catch (joinError) {
            console.error("Error joining meeting:", joinError);
            setError("Could not initialize meeting. Please try again.");
            setJoining(false);
        }
    };

    /* =========================================================
       MICROPHONE TOGGLE (On-demand microphone acquisition)
    ========================================================= */
    const toggleMic = async () => {
        let stream = localStreamRef.current;

        if (!stream || stream.getAudioTracks().length === 0) {
            try {
                const micStream = await navigator.mediaDevices.getUserMedia({
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true,
                    },
                });
                const newAudioTrack = micStream.getAudioTracks()[0];
                if (newAudioTrack) {
                    if (!localStreamRef.current) {
                        localStreamRef.current = new MediaStream();
                    }
                    localStreamRef.current.addTrack(newAudioTrack);
                    Object.entries(peerConnectionsRef.current).forEach(([socketId, pc]) => {
                        try {
                            const sender = pc.addTrack(newAudioTrack, localStreamRef.current!);
                            audioSendersRef.current[socketId] = sender;
                        } catch (err) {
                            console.error("Could not add audio track:", err);
                        }
                    });
                    setMicEnabled(true);
                    return;
                }
            } catch (err) {
                console.error("Could not acquire microphone:", err);
                setError("Microphone permission denied.");
                return;
            }
        }

        if (!stream) return;
        const nextState = !micEnabled;
        stream.getAudioTracks().forEach((track) => {
            track.enabled = nextState;
        });
        setMicEnabled(nextState);
    };

    /* =========================================================
       CAMERA TOGGLE
    ========================================================= */
    const toggleCamera = async () => {
        const stream = localStreamRef.current;
        if (!stream) return;

        if (cameraEnabled) {
            const cameraTrack = stream.getVideoTracks().find((t) => t.readyState === "live");
            await Promise.all(
                Object.values(videoSendersRef.current).map(async (sender) => {
                    try {
                        await sender.replaceTrack(null);
                    } catch {}
                })
            );
            if (cameraTrack) {
                cameraTrack.stop();
                stream.removeTrack(cameraTrack);
            }
            cameraEnabledRef.current = false;
            setCameraEnabled(false);
            setLocalPreviewStream(null);
            sendMediaState({ cameraEnabled: false });
            return;
        }

        try {
            const newCameraStream = await navigator.mediaDevices.getUserMedia({
                video: { width: { ideal: 1280 }, height: { ideal: 720 } },
            });
            const newTrack = newCameraStream.getVideoTracks()[0];
            if (!newTrack) return;

            stream.addTrack(newTrack);
            await Promise.all(
                Object.values(videoSendersRef.current).map(async (sender) => {
                    try {
                        await sender.replaceTrack(newTrack);
                    } catch {}
                })
            );
            cameraEnabledRef.current = true;
            setCameraEnabled(true);
            setLocalPreviewStream(new MediaStream(stream.getTracks()));
            sendMediaState({ cameraEnabled: true });
        } catch (err) {
            console.error("Camera restart error:", err);
            setError("Could not turn the camera back on.");
        }
    };

    /* =========================================================
       FLIP CAMERA (Mobile front/rear camera toggle)
    ========================================================= */
    const flipCamera = async () => {
        const nextMode = facingMode === "user" ? "environment" : "user";
        try {
            const newCameraStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: { exact: nextMode },
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                },
            });
            const newTrack = newCameraStream.getVideoTracks()[0];
            if (!newTrack) return;

            const stream = localStreamRef.current;
            if (stream) {
                const oldTrack = stream.getVideoTracks()[0];
                if (oldTrack) {
                    oldTrack.stop();
                    stream.removeTrack(oldTrack);
                }
                stream.addTrack(newTrack);

                await Promise.all(
                    Object.values(videoSendersRef.current).map(async (sender) => {
                        try {
                            await sender.replaceTrack(newTrack);
                        } catch {}
                    })
                );

                setFacingMode(nextMode);
                setLocalPreviewStream(new MediaStream(stream.getTracks()));
            }
        } catch {
            try {
                const fallbackStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: nextMode },
                });
                const newTrack = fallbackStream.getVideoTracks()[0];
                if (!newTrack) return;

                const stream = localStreamRef.current;
                if (stream) {
                    const oldTrack = stream.getVideoTracks()[0];
                    if (oldTrack) {
                        oldTrack.stop();
                        stream.removeTrack(oldTrack);
                    }
                    stream.addTrack(newTrack);

                    await Promise.all(
                        Object.values(videoSendersRef.current).map(async (sender) => {
                            try {
                                await sender.replaceTrack(newTrack);
                            } catch {}
                        })
                    );

                    setFacingMode(nextMode);
                    setLocalPreviewStream(new MediaStream(stream.getTracks()));
                }
            } catch (fallbackErr) {
                console.warn("Camera flip fallback note:", fallbackErr);
            }
        }
    };

    /* =========================================================
       SCREEN SHARING (Fixed with renegotiation & keyframes)
    ========================================================= */
    const startScreenSharing = async () => {
        if (!navigator.mediaDevices?.getDisplayMedia) {
            setMobileScreenShareNotice(true);
            return;
        }

        const isMobileUA = typeof window !== "undefined" && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        if (isMobileUA) {
            setMobileScreenShareNotice(true);
            return;
        }

        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: false,
            });
            const screenTrack = screenStream.getVideoTracks()[0];
            if (!screenTrack) return;
            screenTrack.contentHint = "motion";

            screenStreamRef.current = screenStream;

            // Replace track across all peer connections and force renegotiation
            for (const [socketId, pc] of Object.entries(peerConnectionsRef.current)) {
                const sender = videoSendersRef.current[socketId];
                if (sender) {
                    await sender.replaceTrack(screenTrack);
                } else {
                    const newSender = pc.addTrack(screenTrack, screenStream);
                    videoSendersRef.current[socketId] = newSender;
                }

                // Renegotiation ensures receiver's WebRTC decoder resets dimensions immediately
                try {
                    if (pc.signalingState === "stable") {
                        const offer = await pc.createOffer();
                        await pc.setLocalDescription(offer);
                        socketRef.current?.emit("offer", {
                            target: socketId,
                            offer,
                            participantName: participantNameRef.current,
                        });
                    }
                } catch (renegErr) {
                    console.warn("Screen share renegotiation notice:", renegErr);
                }
            }

            screenTrack.onended = () => stopScreenSharing();

            screenSharingRef.current = true;
            setIsScreenSharing(true);
            // DO NOT setLocalPreviewStream(screenStream) here: local preview stays camera so presenter sees their face in Tile 1, preventing the infinite mirror tunnel!
            sendMediaState({ screenSharing: true });
        } catch (err: any) {
            if (err?.name === "NotAllowedError" || err?.name === "AbortError") {
                return;
            }
            console.error("Screen share error:", err);
            if (typeof window !== "undefined" && /Android|iPhone|iPad/i.test(navigator.userAgent)) {
                setMobileScreenShareNotice(true);
            }
        }
    };

    const stopScreenSharing = async () => {
        const screenStream = screenStreamRef.current;
        if (screenStream) {
            screenStream.getTracks().forEach((track) => track.stop());
            screenStreamRef.current = null;
        }

        const localStream = localStreamRef.current;
        const cameraTrack = localStream?.getVideoTracks().find((t) => t.readyState === "live") || null;

        for (const [socketId, pc] of Object.entries(peerConnectionsRef.current)) {
            const sender = videoSendersRef.current[socketId];
            if (sender) {
                await sender.replaceTrack(cameraEnabledRef.current ? cameraTrack : null);
            }
            try {
                if (pc.signalingState === "stable") {
                    const offer = await pc.createOffer();
                    await pc.setLocalDescription(offer);
                    socketRef.current?.emit("offer", {
                        target: socketId,
                        offer,
                        participantName: participantNameRef.current,
                    });
                }
            } catch (err) {}
        }

        screenSharingRef.current = false;
        setIsScreenSharing(false);
        setLocalPreviewStream(cameraEnabledRef.current ? localStream : null);
        sendMediaState({ screenSharing: false });
    };

    const toggleScreenSharing = () => {
        if (isScreenSharing) stopScreenSharing();
        else startScreenSharing();
    };

    /* =========================================================
       CHAT & MESSAGING (Instant P2P + MongoDB)
    ========================================================= */
    const sendChatMessage = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const text = chatInput.trim();
        if (!text) return;

        const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

        const selfMsg = {
            id: `${id}-self`,
            senderName: participantName || "You",
            text,
            time,
            isSelf: true,
        };

        setChatMessages((prev) => [...prev, selfMsg]);
        setChatInput("");
        setTimeout(() => {
            mobileChatInputRef.current?.focus();
        }, 50);

        const peerPayload = JSON.stringify({
            type: "chat-message",
            id,
            senderName: participantName || "Participant",
            text,
            time,
        });

        Object.values(dataChannelsRef.current).forEach((channel) => {
            if (channel.readyState === "open") {
                try {
                    channel.send(peerPayload);
                } catch {}
            }
        });

        if (socketRef.current) {
            socketRef.current.emit("chat-message", {
                meetingId,
                senderName: participantName || "You",
                text,
                time,
            });
        }

        fetch(`/api/meetings/${meetingId}/messages`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                senderName: participantName || "You",
                text,
                time,
            }),
        }).catch(() => {});
    };

    const copyMeetingUrl = () => {
        const url = getPublicMeetingUrl(meetingId);
        if (url) {
            navigator.clipboard.writeText(url).then(() => {
                setCopiedUrl(true);
                setTimeout(() => setCopiedUrl(false), 2500);
            });
        }
    };

    const leaveMeeting = () => {
        soundEngine.playLeaveSound();
        captionsEngine.stop();
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track) => track.stop());
        }
        if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach((track) => track.stop());
        }
        Object.values(peerConnectionsRef.current).forEach((pc) => pc.close());
        if (socketRef.current) {
            socketRef.current.disconnect();
        }
        router.push("/dashboard");
    };

    const toggleCaptions = () => {
        if (isCaptionsEnabled) {
            captionsEngine.stop();
            setIsCaptionsEnabled(false);
            setActiveCaption(null);
        } else {
            const started = captionsEngine.start(participantName || "You", (caption: CaptionEvent) => {
                setActiveCaption({ speakerName: caption.speakerName, text: caption.text });
                const payload = JSON.stringify({
                    type: "caption",
                    speakerName: caption.speakerName,
                    text: caption.text,
                });
                Object.values(dataChannelsRef.current).forEach((dc) => {
                    if (dc.readyState === "open") {
                        try { dc.send(payload); } catch {}
                    }
                });
                if (captionTimeoutRef.current) clearTimeout(captionTimeoutRef.current);
                captionTimeoutRef.current = setTimeout(() => {
                    setActiveCaption(null);
                }, 4000);
            });
            setIsCaptionsEnabled(started);
        }
    };

    const togglePiP = async () => {
        try {
            if (document.pictureInPictureElement) {
                await document.exitPictureInPicture();
            } else {
                await mainVideoRef.current?.requestPiP();
            }
        } catch (err) {
            console.warn("PiP error:", err);
        }
    };

    const handleNotesChange = (text: string) => {
        setNotesText(text);
        if (typeof window !== "undefined") {
            localStorage.setItem(`meeting_notes_${meetingId}`, text);
        }
    };

    const downloadNotes = () => {
        const content = `VLSI Labs Meeting Notes\nMeeting ID: ${meetingId}\nDate: ${new Date().toLocaleDateString()}\nParticipant: ${participantName || "Host"}\n\n========================================\n\n${notesText || "No notes taken during this session."}`;
        const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `VLSI-Labs-Meeting-${meetingId}-Notes.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    useEffect(() => {
        const savedName = localStorage.getItem("vlsilabs_user_name");
        if (savedName) setParticipantName(savedName);
        const savedNotes = localStorage.getItem(`meeting_notes_${meetingId}`);
        if (savedNotes) setNotesText(savedNotes);
    }, [meetingId]);

    useEffect(() => {
        return () => {
            captionsEngine.stop();
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach((track) => track.stop());
            }
            if (screenStreamRef.current) {
                screenStreamRef.current.getTracks().forEach((track) => track.stop());
            }
            Object.values(peerConnectionsRef.current).forEach((pc) => pc.close());
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, []);

    /* =========================================================
       PRE-JOIN LOBBY — Google Meet Style with Live Camera Preview
    ========================================================= */
    if (!joined) {
        return (
            <LobbyScreen
                meetingId={meetingId}
                onJoin={(name, opts) => joinRoom(name, opts)}
                joining={joining}
                error={error}
                participantName={participantName}
                setParticipantName={setParticipantName}
            />
        );
    }

    /* =========================================================
       CALCULATE PARTICIPANTS FOR EXACT IMAGE 2 REFERENCE & MOBILE
    ========================================================= */
    const activeRemote =
        remoteParticipants.find((p) => p.socketId === pinnedSocketId) ||
        remoteParticipants.find((p) => p.screenSharing) ||
        remoteParticipants[0];
    const isSolo = remoteParticipants.length === 0;
    const isOneOnOne = remoteParticipants.length === 1;

    // Remotes that are NOT currently featured on the main stage and NOT the local user
    const otherRemotes = remoteParticipants.filter(
        (p) =>
            p.socketId !== socketRef.current?.id &&
            (pinnedSocketId === "local" || p.socketId !== activeRemote?.socketId)
    );

    return (
        <main className="relative flex h-[100dvh] min-h-0 w-full items-center justify-center overflow-hidden bg-[#0a0c12] p-0 md:p-4 lg:p-6 text-white select-none">
            {/* Ambient Room / Office Backdrop Gradient matching Dribbble Reference */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(90,45,140,0.3),transparent_45%),radial-gradient(circle_at_85%_75%,rgba(35,50,90,0.35),transparent_55%),linear-gradient(to_bottom,rgba(10,12,18,0.92),rgba(14,16,24,0.97))]" />
            <div className="pointer-events-none absolute -left-20 top-20 h-80 w-80 rounded-full bg-purple-600/10 blur-[100px]" />
            <div className="pointer-events-none absolute -right-20 bottom-20 h-80 w-80 rounded-full bg-blue-600/10 blur-[100px]" />
            {/* Flying Animated Reactions Overlay */}
            {flyingReactions.map((r) => (
                <div
                    key={r.id}
                    style={{ left: `${r.left}%` }}
                    className="pointer-events-none fixed bottom-24 z-50 text-4xl sm:text-5xl animate-float-up"
                >
                    {r.emoji}
                </div>
            ))}

            {/* PERSISTENT AUDIO PLAYERS WITH ECHO GUARD */}
            {remoteParticipants.map((p) => (
                <RemoteAudioSink
                    key={`audio-${p.socketId}`}
                    stream={p.stream}
                    muted={isSpeakerMuted}
                />
            ))}

            {/* FLOATING MEETYU DASHBOARD CONSOLE (Exact Dribbble Reference) */}
            <div className="relative z-10 flex h-full max-h-[960px] w-full max-w-[1580px] overflow-hidden rounded-none md:rounded-[36px] lg:rounded-[44px] border-0 md:border border-white/10 bg-[#14151e]/95 shadow-[0_35px_100px_rgba(0,0,0,0.85)] backdrop-blur-2xl">
                
                {/* LEFT SLIM VERTICAL NAVIGATION DOCK */}
                <aside className="relative z-20 hidden md:flex w-16 lg:w-20 shrink-0 flex-col items-center justify-between border-r border-white/5 bg-[#101118]/90 py-6 px-2 backdrop-blur-xl">
                    <div className="flex flex-col items-center gap-7">
                        {/* Purple Atom / Sparkle Logo Icon */}
                        <div
                            onClick={() => confirmNavTo("/dashboard")}
                            title="VLSI Labs Dashboard (Exit confirmation)"
                            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-2xl bg-gradient-to-tr from-[#7c3aed] to-[#9333ea] shadow-lg shadow-purple-600/35 transition hover:scale-105 active:scale-95"
                        >
                            <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <circle cx="12" cy="12" r="3" strokeWidth="2.2" />
                                <path strokeWidth="1.8" strokeLinecap="round" d="M12 3a9 9 0 0 0 9 9M3 12a9 9 0 0 0 9 9M12 21a9 9 0 0 0-9-9M21 12a9 9 0 0 0-9-9" />
                            </svg>
                        </div>

                        {/* Navigation Dock Icons matching Dribbble Reference */}
                        <div className="flex flex-col items-center gap-5">
                            {/* Dashboard Grid */}
                            <button
                                type="button"
                                onClick={() => confirmNavTo("/dashboard")}
                                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-white/10 hover:text-white transition"
                                title="Workspace Dashboard"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                            </button>

                            {/* Chat Messages */}
                            <button
                                type="button"
                                onClick={() => {
                                    setActiveRightTab("chat");
                                    setIsRightPanelOpen(true);
                                }}
                                className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
                                    isRightPanelOpen && activeRightTab === "chat"
                                        ? "bg-purple-600/30 text-purple-300"
                                        : "text-slate-400 hover:bg-white/10 hover:text-white"
                                }`}
                                title="Chat Messages"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </button>

                            {/* Active Video Camera Icon in Pill */}
                            <div
                                className="flex h-11 w-6 items-center justify-center rounded-full bg-white text-slate-900 shadow-md shadow-white/20"
                                title="Meeting Active"
                            >
                                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                                    <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </div>

                            {/* Clock / History */}
                            <button
                                type="button"
                                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-white/10 hover:text-white transition"
                                title="Session Clock"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </button>

                            {/* Running Calendar Icon */}
                            <button
                                type="button"
                                onClick={() => setShowCalendarModal(true)}
                                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-white/10 hover:text-white transition"
                                title="Running Calendar Schedule"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </button>

                            {/* Settings */}
                            <button
                                type="button"
                                onClick={() => confirmNavTo("/dashboard/settings")}
                                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-white/10 hover:text-white transition"
                                title="Settings"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* User Profile Avatar at Bottom */}
                    <div
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-purple-500/40 bg-gradient-to-tr from-[#6366f1] to-[#8b5cf6] font-bold text-xs text-white shadow-md shadow-purple-900/30"
                        title={participantName || "User"}
                    >
                        {participantName ? participantName.charAt(0).toUpperCase() : "U"}
                    </div>
                </aside>

                {/* MAIN STAGE + RIGHT SIDEBAR BODY */}
                <div className="flex min-h-0 flex-1 overflow-hidden">
                    
                    {/* CENTER STAGE CONTAINER */}
                    <div className="flex min-h-0 flex-1 flex-col justify-between p-3 sm:p-5 md:p-6 overflow-hidden">
                        
                        {/* TOP HEADER BAR (Exact Dribbble Reference) */}
                        <div className="flex shrink-0 items-center justify-between pb-3">
                            {/* Header Left: Calendar Icon + Title + Date */}
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-2xl bg-white/10 border border-white/10 text-white shadow-md backdrop-blur-md">
                                    <span className="text-[9px] font-bold uppercase tracking-wider text-red-400">
                                        📅
                                    </span>
                                    <span className="text-xs font-bold leading-none">
                                        {new Date().getDate()}
                                    </span>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2">
                                        <h1 className="text-sm sm:text-base font-bold text-white tracking-wide">
                                            VLSI Live Session
                                        </h1>
                                        <button
                                            type="button"
                                            onClick={copyMeetingUrl}
                                            className="inline-flex items-center gap-1 rounded-full bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/40 px-2.5 py-0.5 text-[10px] font-bold text-purple-200 transition active:scale-95 cursor-pointer"
                                            title="Click to copy full meeting invite link"
                                        >
                                            <svg className="h-3 w-3 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                            </svg>
                                            <span>{copiedUrl ? "✓ Link Copied!" : "Copy Invite Link"}</span>
                                        </button>
                                    </div>
                                    <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                                        <span>
                                            {new Date().toLocaleDateString("en-GB", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </span>
                                        <span>·</span>
                                        <span className="font-mono text-purple-300 font-semibold">{meetingId}</span>
                                    </p>
                                </div>
                            </div>

                            {/* Header Right: Time Remaining + Tab Pills */}
                            <div className="flex items-center gap-2 sm:gap-3">
                                {/* Time Remaining Badge with live countdown */}
                                <div className="hidden xs:flex flex-col items-end rounded-2xl bg-white/5 border border-white/10 px-3.5 py-1.5 backdrop-blur-md">
                                    <span className="text-[10px] text-slate-400 font-medium">Time Remaining</span>
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-white font-mono">
                                        <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                                        <MeetingDurationTimer joined={joined} />
                                    </div>
                                </div>

                                {/* Right Side Tab Pills matching Dribbble Reference */}
                                <div className="flex items-center gap-1.5 rounded-2xl bg-white/5 p-1 border border-white/10">
                                    {/* Chat Tab Pill */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setActiveRightTab("chat");
                                            setIsRightPanelOpen((prev) => (activeRightTab === "chat" ? !prev : true));
                                        }}
                                        className={`flex h-9 w-9 sm:h-9 sm:w-10 items-center justify-center rounded-xl transition ${
                                            isRightPanelOpen && activeRightTab === "chat"
                                                ? "bg-[#7c3aed] text-white shadow-md shadow-purple-600/30"
                                                : "text-slate-300 hover:bg-white/10 hover:text-white"
                                        }`}
                                        title="Chat"
                                    >
                                        <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                    </button>

                                    {/* Participants Tab Pill */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setActiveRightTab("participants");
                                            setIsRightPanelOpen((prev) => (activeRightTab === "participants" ? !prev : true));
                                        }}
                                        className={`flex h-9 w-9 sm:h-9 sm:w-10 items-center justify-center rounded-xl transition ${
                                            isRightPanelOpen && activeRightTab === "participants"
                                                ? "bg-[#7c3aed] text-white shadow-md shadow-purple-600/30"
                                                : "text-slate-300 hover:bg-white/10 hover:text-white"
                                        }`}
                                        title="Participants"
                                    >
                                        <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                    </button>

                                    {/* Meeting Notes Tab Pill */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setActiveRightTab("notes");
                                            setIsRightPanelOpen((prev) => (activeRightTab === "notes" ? !prev : true));
                                        }}
                                        className={`flex h-9 w-9 sm:h-9 sm:w-10 items-center justify-center rounded-xl transition ${
                                            isRightPanelOpen && activeRightTab === "notes"
                                                ? "bg-[#7c3aed] text-white shadow-md shadow-purple-600/30"
                                                : "text-slate-300 hover:bg-white/10 hover:text-white"
                                        }`}
                                        title="Meeting Notes"
                                    >
                                        <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>

                                    {/* Link / Invite Pill */}
                                    <button
                                        type="button"
                                        onClick={copyMeetingUrl}
                                        className="flex h-9 w-9 sm:h-9 sm:w-10 items-center justify-center rounded-xl text-slate-300 hover:bg-white/10 hover:text-white transition"
                                        title={copiedUrl ? "Link Copied!" : "Copy Meeting Link"}
                                    >
                                        {copiedUrl ? (
                                            <span className="text-emerald-400 font-bold text-xs">✓</span>
                                        ) : (
                                            <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* CENTER VIDEO STAGE (Main Spotlight + Bottom 3 Attendees Row) */}
                        <div className="flex min-h-0 flex-1 flex-col justify-between gap-3 overflow-hidden">
                            
                            {/* MAIN SPOTLIGHT VIDEO STAGE (Takes ~65% height, 16:9 ratio) */}
                            <div className="relative min-h-0 flex-1 overflow-hidden rounded-[20px] sm:rounded-[26px] md:rounded-[30px] border border-white/10 bg-[#161822] shadow-2xl">
                                {isScreenSharing && !pinnedSocketId ? (
                                    /* Google Meet Presenter Card (Eliminates Recursive Screen Tunnel) */
                                    <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#181a28] via-[#13141f] to-[#0f1017]">
                                        <div className="relative mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-purple-600/20 border border-purple-500/40 text-purple-400 shadow-2xl shadow-purple-900/40 animate-pulse">
                                            <svg className="h-10 w-10 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                                            You're presenting to everyone
                                        </h3>
                                        <p className="mt-2 max-w-md text-xs sm:text-sm text-slate-400 leading-relaxed">
                                            Your screen is broadcasting live with all attendees. Switch to your CAD software, EDA diagrams, or slides to present.
                                        </p>

                                        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                                            <button
                                                type="button"
                                                onClick={stopScreenSharing}
                                                className="flex items-center gap-2 rounded-2xl bg-red-600 hover:bg-red-700 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-red-600/30 transition hover:scale-105 active:scale-95"
                                            >
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                                <span>Stop presenting</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={togglePiP}
                                                className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-200 shadow-md transition hover:scale-105 active:scale-95"
                                            >
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                                <span>Minimize to PiP</span>
                                            </button>
                                        </div>
                                    </div>
                                ) : isSolo ? (
                                    <VideoTile
                                        ref={mainVideoRef}
                                        stream={localPreviewStream}
                                        name={`${participantName || "You"} (Host)`}
                                        muted
                                        micEnabled={micEnabled}
                                        cameraEnabled={cameraEnabled}
                                        isScreen={false}
                                        isMainSpeaker
                                    />
                                ) : activeRemote?.screenSharing ? (
                                    <VideoTile
                                        ref={mainVideoRef}
                                        stream={activeRemote.stream}
                                        name={`${activeRemote.name} · Screen`}
                                        micEnabled={true}
                                        cameraEnabled={true}
                                        isScreen
                                        isPinned
                                        onPin={() => setPinnedSocketId(null)}
                                        isMainSpeaker
                                    />
                                ) : pinnedSocketId === "local" ? (
                                    <VideoTile
                                        ref={mainVideoRef}
                                        stream={localPreviewStream}
                                        name={`${participantName || "You"} (Pinned)`}
                                        muted
                                        micEnabled={micEnabled}
                                        cameraEnabled={cameraEnabled}
                                        isScreen={false}
                                        isPinned
                                        onPin={() => setPinnedSocketId(null)}
                                        isMainSpeaker
                                    />
                                ) : (
                                    <VideoTile
                                        ref={mainVideoRef}
                                        stream={activeRemote ? activeRemote.stream : localPreviewStream}
                                        name={activeRemote ? activeRemote.name : `${participantName || "You"}`}
                                        muted={!activeRemote}
                                        micEnabled={activeRemote ? true : micEnabled}
                                        cameraEnabled={activeRemote ? activeRemote.cameraEnabled : cameraEnabled}
                                        isScreen={activeRemote ? activeRemote.screenSharing : false}
                                        isPinned={Boolean(pinnedSocketId)}
                                        onPin={() =>
                                            setPinnedSocketId(
                                                activeRemote?.socketId === pinnedSocketId
                                                    ? null
                                                    : activeRemote?.socketId || null
                                            )
                                        }
                                        isMainSpeaker
                                    />
                                )}

                                {/* Floating Mobile Self-View PiP Thumbnail (Google Meet mobile style) */}
                                {!isSolo && (
                                    <div
                                        onClick={() => setPinnedSocketId((prev) => (prev === "local" ? null : "local"))}
                                        className="md:hidden absolute bottom-4 right-4 z-30 h-28 w-20 sm:h-36 sm:w-24 overflow-hidden rounded-2xl border-2 border-purple-500/60 bg-[#151724] shadow-2xl cursor-pointer"
                                        title="Your camera view"
                                    >
                                        <VideoTile
                                            stream={localPreviewStream}
                                            name="You"
                                            muted
                                            micEnabled={micEnabled}
                                            cameraEnabled={cameraEnabled}
                                            isScreen={false}
                                        />
                                    </div>
                                )}

                                {/* Real-Time Live Speech Recognition (Captions) Subtitle Banner */}
                                {isCaptionsEnabled && activeCaption && (
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 max-w-[85%] rounded-2xl bg-black/80 px-5 py-2.5 backdrop-blur-md border border-white/10 shadow-2xl animate-in fade-in slide-in-from-bottom-2">
                                        <div className="flex items-center gap-2">
                                            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                                            <span className="text-xs font-bold text-purple-300">
                                                {activeCaption.speakerName}:
                                            </span>
                                            <span className="text-xs font-medium text-slate-100">
                                                {activeCaption.text}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* BOTTOM ROW OF ATTENDEE VIDEO TILES (Desktop or Multi-participant) */}
                            <div className={`${isSolo || isOneOnOne ? "hidden md:grid" : "grid"} grid-cols-3 gap-2.5 sm:gap-3.5 h-24 sm:h-32 md:h-36 shrink-0`}>
                                {/* Tile 1: "You" (always camera feed, never screen share mirror) */}
                                <div
                                    onClick={() => setPinnedSocketId("local")}
                                    className={`relative h-full w-full cursor-pointer overflow-hidden rounded-[18px] sm:rounded-[22px] border transition-all ${
                                        pinnedSocketId === "local"
                                            ? "border-purple-500 shadow-lg shadow-purple-600/30"
                                            : "border-white/10 hover:border-purple-400/60"
                                    }`}
                                >
                                    <VideoTile
                                        stream={localPreviewStream}
                                        name="You"
                                        muted
                                        micEnabled={micEnabled}
                                        cameraEnabled={cameraEnabled}
                                        isScreen={false}
                                    />
                                </div>

                                {/* Tile 2: Participant 2 (or Second remote attendee) */}
                                <div
                                    onClick={() => {
                                        if (otherRemotes[0]) setPinnedSocketId(otherRemotes[0].socketId);
                                    }}
                                    className="relative h-full w-full cursor-pointer overflow-hidden rounded-[18px] sm:rounded-[22px] border border-white/10 hover:border-purple-400/60 transition-all bg-[#1b1c26]"
                                >
                                    {otherRemotes[0] ? (
                                        <VideoTile
                                            stream={otherRemotes[0].stream}
                                            name={otherRemotes[0].name}
                                            micEnabled={true}
                                            cameraEnabled={otherRemotes[0].cameraEnabled}
                                            isScreen={otherRemotes[0].screenSharing}
                                        />
                                    ) : (
                                        <div className="flex h-full w-full flex-col items-center justify-center p-2 text-center bg-gradient-to-br from-[#1e202c] to-[#151722]">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-600/30 border border-purple-500/30 text-purple-300 text-xs font-bold">
                                                P2
                                            </div>
                                            <span className="mt-1 text-[11px] font-medium text-slate-400">
                                                Waiting for attendee
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Tile 3: Participant 3 or "+ 12 other participants" matching Dribbble */}
                                <div
                                    onClick={() => {
                                        setActiveRightTab("participants");
                                        setIsRightPanelOpen(true);
                                    }}
                                    className="relative h-full w-full cursor-pointer overflow-hidden rounded-[18px] sm:rounded-[22px] border border-white/10 hover:border-purple-400/60 transition-all bg-[#1b1c26]"
                                >
                                    {otherRemotes[1] ? (
                                        <VideoTile
                                            stream={otherRemotes[1].stream}
                                            name={otherRemotes[1].name}
                                            micEnabled={true}
                                            cameraEnabled={otherRemotes[1].cameraEnabled}
                                            isScreen={otherRemotes[1].screenSharing}
                                        />
                                    ) : (
                                        <div className="flex h-full w-full flex-col items-center justify-center p-2 text-center bg-gradient-to-br from-[#1a1c26] to-[#141520] backdrop-blur-md">
                                            <div className="flex items-center gap-1.5 rounded-full bg-black/45 border border-white/10 px-3 py-1.5 shadow-md">
                                                <span className="text-xs">👥</span>
                                                <span className="text-[11px] font-semibold text-slate-200">
                                                    {remoteParticipants.length > 2
                                                        ? `${remoteParticipants.length - 2} other participants`
                                                        : "Invite participants"}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* FLOATING BOTTOM CONTROL DOCK (Exact Meetyu Dribbble Reference) */}
                        <div className="flex shrink-0 items-center justify-center pt-3 sm:pt-4">
                            <MeetingControls
                                micEnabled={micEnabled}
                                cameraEnabled={cameraEnabled}
                                isScreenSharing={isScreenSharing}
                                isCaptionsEnabled={isCaptionsEnabled}
                                isSpeakerMuted={isSpeakerMuted}
                                onToggleMic={toggleMic}
                                onToggleCamera={toggleCamera}
                                onToggleScreen={toggleScreenSharing}
                                onToggleCaptions={toggleCaptions}
                                onTogglePiP={togglePiP}
                                onToggleSpeaker={() => setIsSpeakerMuted((prev) => !prev)}
                                onLeave={leaveMeeting}
                                onSendReaction={sendReaction}
                                onToggleNotes={() => {
                                    setActiveRightTab("notes");
                                    setIsRightPanelOpen(true);
                                }}
                                onToggleCalendar={() => setShowCalendarModal(true)}
                            />
                        </div>
                    </div>

                    {/* RIGHT SLIDING PANEL (Chat / Participants / Meeting Notes) */}
                    {isRightPanelOpen && (
                        <aside className="relative hidden md:flex w-80 lg:w-92 shrink-0 flex-col border-l border-white/5 bg-[#12131b]/95 p-4 shadow-2xl backdrop-blur-2xl overflow-hidden justify-between">
                            
                            {/* Panel Header */}
                            <div className="flex items-center justify-between pb-3 border-b border-white/10">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                                        {activeRightTab === "chat" && "Meeting Chat"}
                                        {activeRightTab === "participants" && `Participants (${1 + remoteParticipants.length})`}
                                        {activeRightTab === "notes" && "In-Meeting Notepad"}
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setIsRightPanelOpen(false)}
                                    className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white transition"
                                    title="Close panel"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* TAB CONTENT 1: CHAT */}
                            {activeRightTab === "chat" && (
                                <div className="flex flex-1 min-h-0 flex-col justify-between pt-3">
                                    {/* Messages Feed */}
                                    <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 scrollbar-thin">
                                        {chatMessages.length === 0 ? (
                                            <div className="flex h-full flex-col items-center justify-center p-4 text-center text-slate-400">
                                                <span className="text-3xl mb-2">💬</span>
                                                <p className="text-xs font-medium">No messages yet.</p>
                                                <p className="mt-1 text-[11px] text-slate-500">
                                                    Chat with attendees in real-time.
                                                </p>
                                            </div>
                                        ) : (
                                            chatMessages.map((msg) => (
                                                <div
                                                    key={msg.id}
                                                    className={`flex items-start gap-2.5 ${
                                                        msg.isSelf ? "flex-row-reverse" : "flex-row"
                                                    }`}
                                                >
                                                    <div
                                                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-bold text-[10px] text-white shadow ${
                                                            msg.isSelf ? "bg-[#7c3aed]" : "bg-slate-700"
                                                        }`}
                                                    >
                                                        {msg.senderName.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className={`flex flex-col ${msg.isSelf ? "items-end" : "items-start"}`}>
                                                        <span className="text-[10px] font-medium text-slate-400 mb-0.5">
                                                            {msg.senderName}
                                                        </span>
                                                        <div
                                                            className={`rounded-2xl px-3.5 py-2 text-xs leading-relaxed max-w-[210px] break-words shadow-md ${
                                                                msg.isSelf
                                                                    ? "bg-[#583bbd] text-white rounded-tr-sm"
                                                                    : "bg-[#252834] text-slate-100 rounded-tl-sm border border-white/5"
                                                            }`}
                                                        >
                                                            {msg.text}
                                                        </div>
                                                        <span className="mt-0.5 text-[9px] text-slate-500">
                                                            {msg.time}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* Chat Input Bar matching Dribbble Reference */}
                                    <form
                                        onSubmit={sendChatMessage}
                                        className="mt-3 flex items-center gap-2 rounded-2xl border border-white/10 bg-[#1b1d28] p-1.5 shadow-lg"
                                    >
                                        <button
                                            type="button"
                                            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:text-white transition"
                                            title="Attach File"
                                        >
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                            </svg>
                                        </button>

                                        <input
                                            type="text"
                                            value={chatInput}
                                            onChange={(e) => setChatInput(e.target.value)}
                                            placeholder="Type message...."
                                            className="flex-1 bg-transparent px-2 text-xs text-white placeholder-slate-400 focus:outline-none"
                                        />

                                        <button
                                            type="submit"
                                            disabled={!chatInput.trim()}
                                            className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#7c3aed] text-white shadow-md shadow-purple-600/30 hover:bg-[#6d28d9] disabled:opacity-40 transition"
                                            title="Send message"
                                        >
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                            </svg>
                                        </button>
                                    </form>
                                </div>
                            )}

                            {/* TAB CONTENT 2: PARTICIPANTS */}
                            {activeRightTab === "participants" && (
                                <div className="flex-1 overflow-y-auto pt-3 space-y-2.5 scrollbar-thin">
                                    {/* Invite Participants Link Card */}
                                    <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-950/60 to-indigo-950/40 border border-purple-500/30 mb-3 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-bold text-purple-200">
                                                Meeting Invite Link
                                            </span>
                                            <span className="font-mono text-[10px] text-purple-300 font-semibold">
                                                {meetingId}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-slate-300 truncate font-mono opacity-80">
                                            {getPublicMeetingUrl(meetingId)}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={copyMeetingUrl}
                                            className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] py-2 text-xs font-bold text-white shadow-md shadow-purple-900/30 transition active:scale-95 cursor-pointer"
                                        >
                                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                            </svg>
                                            <span>{copiedUrl ? "✓ Invite Link Copied!" : "Copy Shareable Link"}</span>
                                        </button>
                                    </div>

                                    {/* Local User */}
                                    <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white/5 border border-white/5">
                                        <div className="flex items-center gap-2.5">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#7c3aed] font-bold text-xs text-white">
                                                {participantName ? participantName.charAt(0).toUpperCase() : "Y"}
                                            </div>
                                            <div>
                                                <span className="text-xs font-semibold text-white block">
                                                    {participantName || "You"} (Host)
                                                </span>
                                                <span className="text-[10px] text-purple-400">Active Presenter</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs">
                                            <span>{cameraEnabled ? "📹" : "🚫"}</span>
                                            <span>{micEnabled ? "🎤" : "🔇"}</span>
                                        </div>
                                    </div>

                                    {/* Remote Participants */}
                                    {remoteParticipants.map((p) => (
                                        <div
                                            key={p.socketId}
                                            className="flex items-center justify-between p-2.5 rounded-2xl bg-white/5 border border-white/5 hover:border-purple-500/40 transition"
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 font-bold text-xs text-white">
                                                    {p.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <span className="text-xs font-semibold text-slate-200 block truncate max-w-[120px]">
                                                        {p.name}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400">Attendee</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                                <span>{p.cameraEnabled ? "📹" : "🚫"}</span>
                                                <span>🎤</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* TAB CONTENT 3: IN-MEETING NOTEPAD */}
                            {activeRightTab === "notes" && (
                                <div className="flex flex-1 min-h-0 flex-col justify-between pt-3">
                                    <div className="flex-1 flex flex-col">
                                        <div className="flex items-center justify-between pb-2">
                                            <span className="text-[11px] font-semibold text-slate-400">
                                                Notes auto-save locally
                                            </span>
                                            <span className="text-[10px] text-emerald-400 font-medium">● Saved</span>
                                        </div>
                                        <textarea
                                            value={notesText}
                                            onChange={(e) => handleNotesChange(e.target.value)}
                                            placeholder="Write key meeting takeaways, action items, design notes..."
                                            className="flex-1 w-full rounded-2xl border border-white/10 bg-[#161822] p-3 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none leading-relaxed"
                                        />
                                    </div>

                                    <div className="pt-3">
                                        <button
                                            type="button"
                                            onClick={downloadNotes}
                                            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#7c3aed] px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-purple-600/30 hover:bg-[#6d28d9] transition"
                                        >
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                            </svg>
                                            <span>Export Notes (.txt)</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </aside>
                    )}
                </div>
            </div>

            {/* RUNNING CALENDAR SCHEDULE MODAL */}
            {showCalendarModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md animate-in fade-in">
                    <div className="w-full max-w-md rounded-[28px] border border-white/15 bg-[#161824]/98 p-6 shadow-2xl backdrop-blur-2xl">
                        <div className="flex items-center justify-between pb-4 border-b border-white/10">
                            <div className="flex items-center gap-2.5">
                                <span className="text-xl">📅</span>
                                <div>
                                    <h3 className="text-sm font-bold text-white">Running Meeting Calendar</h3>
                                    <p className="text-[11px] text-slate-400">Watch schedules & live sessions</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowCalendarModal(false)}
                                className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-slate-300 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Calendar Mini-Schedule View */}
                        <div className="py-4 space-y-3">
                            <div className="rounded-2xl border border-purple-500/40 bg-purple-950/30 p-3.5">
                                <div className="flex items-center justify-between">
                                    <span className="rounded-full bg-purple-600 px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                                        Happening Now
                                    </span>
                                    <span className="text-xs font-mono font-bold text-purple-300">Live</span>
                                </div>
                                <h4 className="mt-2 text-xs font-bold text-white">Daily Standup & VLSI Review</h4>
                                <p className="mt-0.5 text-[11px] text-slate-300">Room: {meetingId}</p>
                            </div>

                            <div className="rounded-2xl border border-white/5 bg-white/5 p-3.5 space-y-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    Today · 11:30 AM
                                </span>
                                <h4 className="text-xs font-bold text-white">Physical Design & Timing Closure</h4>
                                <p className="text-[11px] text-slate-400">Floorplanning, Clock Tree Synthesis, DRC/LVS check</p>
                            </div>

                            <div className="rounded-2xl border border-white/5 bg-white/5 p-3.5 space-y-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    Today · 03:00 PM
                                </span>
                                <h4 className="text-xs font-bold text-white">Architecture & Signoff Sync</h4>
                                <p className="text-[11px] text-slate-400">Multi-corner timing signoff and power analysis</p>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="button"
                                onClick={() => setShowCalendarModal(false)}
                                className="w-full rounded-2xl bg-white/10 hover:bg-white/15 py-2.5 text-xs font-semibold text-white transition"
                            >
                                Close Calendar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MOBILE SLIDING BOTTOM DRAWER (Chat / Participants / Meeting Notes) */}
            {isRightPanelOpen && (
                <div className="fixed inset-0 z-50 flex md:hidden flex-col justify-end bg-black/60 backdrop-blur-sm animate-in fade-in">
                    <div className="relative flex max-h-[85vh] h-[85vh] w-full flex-col rounded-t-[32px] border-t border-white/15 bg-[#141622] p-4 shadow-2xl overflow-hidden">
                        {/* Drawer Handle */}
                        <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-white/20" />

                        {/* Mobile Drawer Header with Tab Buttons */}
                        <div className="flex items-center justify-between pb-3 border-b border-white/10">
                            <div className="flex items-center gap-1.5 overflow-x-auto">
                                <button
                                    type="button"
                                    onClick={() => setActiveRightTab("chat")}
                                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                                        activeRightTab === "chat"
                                            ? "bg-[#7c3aed] text-white shadow-md shadow-purple-600/30"
                                            : "text-slate-400 bg-white/5 hover:text-white"
                                    }`}
                                >
                                    Chat {chatMessages.length > 0 && `(${chatMessages.length})`}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveRightTab("participants")}
                                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                                        activeRightTab === "participants"
                                            ? "bg-[#7c3aed] text-white shadow-md shadow-purple-600/30"
                                            : "text-slate-400 bg-white/5 hover:text-white"
                                    }`}
                                >
                                    People ({1 + remoteParticipants.length})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveRightTab("notes")}
                                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                                        activeRightTab === "notes"
                                            ? "bg-[#7c3aed] text-white shadow-md shadow-purple-600/30"
                                            : "text-slate-400 bg-white/5 hover:text-white"
                                    }`}
                                >
                                    Notes
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsRightPanelOpen(false)}
                                className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-slate-300 hover:text-white"
                                title="Close drawer"
                            >
                                ✕
                            </button>
                        </div>

                        {/* MOBILE TAB 1: CHAT */}
                        {activeRightTab === "chat" && (
                            <div className="flex flex-1 min-h-0 flex-col justify-between pt-3">
                                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                                    {chatMessages.length === 0 ? (
                                        <div className="flex h-full flex-col items-center justify-center p-4 text-center text-slate-400">
                                            <span className="text-3xl mb-2">💬</span>
                                            <p className="text-xs font-medium">No messages yet.</p>
                                            <p className="mt-1 text-[11px] text-slate-500">
                                                Send a message to everyone in the room.
                                            </p>
                                        </div>
                                    ) : (
                                        chatMessages.map((msg) => (
                                            <div
                                                key={msg.id}
                                                className={`flex items-start gap-2 ${
                                                    msg.isSelf ? "flex-row-reverse" : "flex-row"
                                                }`}
                                            >
                                                <div
                                                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-bold text-[10px] text-white ${
                                                        msg.isSelf ? "bg-[#7c3aed]" : "bg-slate-700"
                                                    }`}
                                                >
                                                    {msg.senderName.charAt(0).toUpperCase()}
                                                </div>
                                                <div className={`flex flex-col ${msg.isSelf ? "items-end" : "items-start"}`}>
                                                    <span className="text-[10px] font-medium text-slate-400 mb-0.5">
                                                        {msg.senderName}
                                                    </span>
                                                    <div
                                                        className={`rounded-2xl px-3 py-2 text-xs leading-relaxed max-w-[240px] break-words shadow-md ${
                                                            msg.isSelf
                                                                ? "bg-[#583bbd] text-white rounded-tr-sm"
                                                                : "bg-[#252834] text-slate-100 rounded-tl-sm border border-white/5"
                                                        }`}
                                                    >
                                                        {msg.text}
                                                    </div>
                                                    <span className="mt-0.5 text-[9px] text-slate-500">
                                                        {msg.time}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <form
                                    onSubmit={sendChatMessage}
                                    className="mt-3 flex items-center gap-2 rounded-2xl border border-white/10 bg-[#1b1d28] p-1.5 shadow-lg"
                                >
                                    <input
                                        type="text"
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        placeholder="Type message..."
                                        className="flex-1 bg-transparent px-3 text-xs text-white placeholder-slate-400 focus:outline-none"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!chatInput.trim()}
                                        className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#7c3aed] text-white shadow-md shadow-purple-600/30 disabled:opacity-40 transition"
                                    >
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* MOBILE TAB 2: PARTICIPANTS */}
                        {activeRightTab === "participants" && (
                            <div className="flex-1 overflow-y-auto pt-3 space-y-2.5">
                                {/* Mobile Invite Participants Link Card */}
                                <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-950/60 to-indigo-950/40 border border-purple-500/30 mb-2 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-purple-200">
                                            Meeting Invite Link
                                        </span>
                                        <span className="font-mono text-[10px] text-purple-300 font-semibold">
                                            {meetingId}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={copyMeetingUrl}
                                        className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] py-2 text-xs font-bold text-white shadow-md shadow-purple-900/30 transition active:scale-95"
                                    >
                                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                        </svg>
                                        <span>{copiedUrl ? "✓ Invite Link Copied!" : "Copy Meeting Link"}</span>
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white/5 border border-white/5">
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#7c3aed] font-bold text-xs text-white">
                                            {participantName ? participantName.charAt(0).toUpperCase() : "Y"}
                                        </div>
                                        <div>
                                            <span className="text-xs font-semibold text-white block">
                                                {participantName || "You"} (Host)
                                            </span>
                                            <span className="text-[10px] text-purple-400">Active</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs">
                                        <span>{cameraEnabled ? "📹" : "🚫"}</span>
                                        <span>{micEnabled ? "🎤" : "🔇"}</span>
                                    </div>
                                </div>

                                {remoteParticipants.map((p) => (
                                    <div
                                        key={p.socketId}
                                        className="flex items-center justify-between p-2.5 rounded-2xl bg-white/5 border border-white/5"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 font-bold text-xs text-white">
                                                {p.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <span className="text-xs font-semibold text-slate-200 block truncate max-w-[140px]">
                                                    {p.name}
                                                </span>
                                                <span className="text-[10px] text-slate-400">Attendee</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-400">
                                            <span>{p.cameraEnabled ? "📹" : "🚫"}</span>
                                            <span>🎤</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* MOBILE TAB 3: NOTES */}
                        {activeRightTab === "notes" && (
                            <div className="flex flex-1 min-h-0 flex-col justify-between pt-3">
                                <div className="flex-1 flex flex-col">
                                    <div className="flex items-center justify-between pb-2">
                                        <span className="text-[11px] font-semibold text-slate-400">
                                            Notes auto-save locally
                                        </span>
                                        <span className="text-[10px] text-emerald-400 font-medium">● Saved</span>
                                    </div>
                                    <textarea
                                        value={notesText}
                                        onChange={(e) => handleNotesChange(e.target.value)}
                                        placeholder="Write key meeting takeaways, action items, design notes..."
                                        className="flex-1 w-full rounded-2xl border border-white/10 bg-[#161822] p-3 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none resize-none leading-relaxed"
                                    />
                                </div>
                                <div className="pt-3">
                                    <button
                                        type="button"
                                        onClick={downloadNotes}
                                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#7c3aed] px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-purple-600/30"
                                    >
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                        <span>Export Notes (.txt)</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* EXIT CONFIRMATION MODAL */}
            {showExitModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-in fade-in">
                    <div className="w-full max-w-md rounded-[28px] border border-white/15 bg-[#161824]/98 p-6 shadow-2xl backdrop-blur-2xl">
                        <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white">Leave Active Meeting?</h3>
                                <p className="text-[11px] text-slate-400">You are currently connected to room {meetingId}</p>
                            </div>
                        </div>

                        <p className="py-4 text-xs text-slate-300 leading-relaxed">
                            Leaving will disconnect your video and audio stream. If you need to check panels or the dashboard, you can open it in a new tab to keep your call active!
                        </p>

                        <div className="space-y-2.5">
                            <button
                                type="button"
                                onClick={() => {
                                    window.open(pendingExitUrl, "_blank");
                                    setShowExitModal(false);
                                }}
                                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-purple-600 hover:bg-purple-700 py-3 text-xs font-bold text-white shadow-lg shadow-purple-600/30 transition hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                <span>Open Dashboard in New Tab (Keeps Call Active)</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setShowExitModal(false)}
                                className="flex w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 py-2.5 text-xs font-semibold text-slate-200 transition"
                            >
                                Stay in Meeting
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setShowExitModal(false);
                                    leaveMeeting();
                                }}
                                className="flex w-full items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 py-2.5 text-xs font-semibold text-red-400 transition"
                            >
                                Leave Meeting & Go to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MOBILE SCREEN SHARING NOTICE MODAL */}
            {mobileScreenShareNotice && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-in fade-in">
                    <div className="w-full max-w-md rounded-[28px] border border-white/15 bg-[#161824]/98 p-6 shadow-2xl backdrop-blur-2xl">
                        <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white">Screen Sharing Notice</h3>
                                <p className="text-[11px] text-slate-400">Mobile browser capability limitation</p>
                            </div>
                        </div>

                        <div className="py-4 space-y-3 text-xs text-slate-300 leading-relaxed">
                            <p>
                                Mobile operating systems (Android & iOS) do not allow browser apps to capture and broadcast the mobile screen directly for security reasons.
                            </p>
                            <div className="rounded-2xl border border-purple-500/30 bg-purple-950/30 p-3.5 text-purple-200">
                                <p className="font-semibold mb-1 text-xs">💡 To present your screen:</p>
                                <p className="text-[11px] text-purple-300 leading-relaxed">
                                    Join this meeting from a Laptop or Desktop browser to present VLSI EDA schematics, CAD layouts, waveforms, or slides in full HD.
                                </p>
                            </div>
                            <p className="text-slate-400 text-[11px]">
                                ✨ You can still view any screen shares from other attendees in full HD on this mobile phone!
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setMobileScreenShareNotice(false)}
                            className="w-full rounded-2xl bg-[#7c3aed] hover:bg-[#6d28d9] py-3 text-xs font-bold text-white shadow-lg shadow-purple-600/30 transition"
                        >
                            Understood
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
}
