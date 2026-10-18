"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import VideoTile from "./VideoTile";
import MeetingControls from "./MeetingControls";

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
      };

const SOCKET_URL =
    process.env.NEXT_PUBLIC_SOCKET_URL ||
    (process.env.NODE_ENV === "development"
        ? "http://localhost:4000"
        : "https://vlsi-labs-meetings.onrender.com");

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
    const [mobileTab, setMobileTab] = useState<"chat" | "participants">("chat");
    const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);
    const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

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
       REACTIONS
    ========================================================= */
    const sendReaction = (emoji: string) => {
        const id = `${Date.now()}-${Math.random()}`;
        setReactions((prev) => [...prev, { id, emoji }]);
        setTimeout(() => {
            setReactions((prev) => prev.filter((r) => r.id !== id));
        }, 3000);

        const payload = JSON.stringify({ type: "reaction", emoji });
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
                // Strict deduplication: remove any existing participant with the same socketId OR same cleanName
                const filtered = current.filter(
                    (p) =>
                        p.socketId !== socketId &&
                        (cleanName === "Participant" || p.name !== cleanName)
                );

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
    }) => {
        const msgId = data.id || `${data.senderName}-${data.text}-${Date.now()}`;
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
                    isSelf: false,
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
                });
                return;
            }
            if (message.type === "reaction") {
                const id = `${Date.now()}-${Math.random()}`;
                setReactions((prev) => [...prev, { id, emoji: message.emoji }]);
                setTimeout(() => {
                    setReactions((prev) => prev.filter((r) => r.id !== id));
                }, 3000);
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
                { urls: "stun:stun4.l.google.com:19302" },
                { urls: "stun:stun.cloudflare.com:3478" },
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

        peerConnection.onconnectionstatechange = () => {
            const state = peerConnection.connectionState;
            if (
                state === "closed" ||
                state === "disconnected" ||
                state === "failed"
            ) {
                removeParticipant(remoteSocketId);
            }
        };

        peerConnection.oniceconnectionstatechange = () => {
            const iceState = peerConnection.iceConnectionState;
            if (
                iceState === "failed" ||
                iceState === "disconnected" ||
                iceState === "closed"
            ) {
                removeParticipant(remoteSocketId);
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

        const peerConnection = createPeerConnection(data.sender, remoteName, false);
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
        if (!peerConnection) {
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
    const joinRoom = async (overrideName?: string) => {
        const name = (overrideName || participantName).trim();
        if (!name) {
            setError("Please enter your name to join");
            return;
        }

        setJoining(true);
        setError("");

        let stream: MediaStream;
        try {
            // Enhanced constraints for acoustic echo cancellation & noise suppression
            stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                },
                video: {
                    width: { ideal: 1280, max: 1920 },
                    height: { ideal: 720, max: 1080 },
                },
            });
            setMicEnabled(true);
            setCameraEnabled(true);
        } catch (combinedErr) {
            console.warn("Combined getUserMedia failed, attempting fallbacks:", combinedErr);
            stream = new MediaStream();

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
            } catch (audioErr) {
                console.warn("Microphone access failed:", audioErr);
                setMicEnabled(false);
            }

            try {
                const videoStream = await navigator.mediaDevices.getUserMedia({
                    video: { width: { ideal: 1280 }, height: { ideal: 720 } },
                });
                videoStream.getVideoTracks().forEach((track) => stream.addTrack(track));
                setCameraEnabled(true);
            } catch (videoErr) {
                console.warn("Camera access failed:", videoErr);
                setCameraEnabled(false);
            }
        }

        stream.getAudioTracks().forEach((t) => {
            t.enabled = true;
        });

        localStreamRef.current = stream;
        setLocalPreviewStream(stream);

        try {
            const socket = io(SOCKET_URL, {
                transports: ["polling", "websocket"],
                reconnection: true,
                reconnectionAttempts: 10,
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
                console.error("Socket connection error:", connectionError);
                setError("Could not connect to signaling server. Checking connection...");
                setJoining(false);
                stream.getTracks().forEach((track) => track.stop());
            });

            socket.on("connect", () => {
                console.log("Connected to signaling server:", socket.id);
                socket.emit("join-room", { meetingId, participantName: name });
                sendMediaState();

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
            setLocalPreviewStream(stream);
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
            setLocalPreviewStream(screenStream);
            sendMediaState({ screenSharing: true });
        } catch (err) {
            console.error("Screen share error:", err);
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
        const url = typeof window !== "undefined" ? `${window.location.origin}/meet/${meetingId}` : "";
        if (url) {
            navigator.clipboard.writeText(url).then(() => {
                setCopiedUrl(true);
                setTimeout(() => setCopiedUrl(false), 2500);
            });
        }
    };

    const leaveMeeting = () => {
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

    useEffect(() => {
        const savedName = localStorage.getItem("vlsilabs_user_name");
        if (savedName) setParticipantName(savedName);
    }, []);

    useEffect(() => {
        return () => {
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
       PRE-JOIN LOBBY
    ========================================================= */
    if (!joined) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#0a0d14] p-4 text-white">
                <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-[#121622] p-8 shadow-2xl">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="VLSI Labs" className="h-10 w-auto object-contain" />
                        <div>
                            <h1 className="text-lg font-bold text-white">VLSI Labs Meetings</h1>
                            <p className="text-xs text-slate-400">Ready to join session</p>
                        </div>
                    </div>

                    <div className="mt-6 rounded-2xl border border-slate-800/80 bg-slate-950/60 p-4">
                        <span className="text-[11px] font-bold tracking-wider uppercase text-blue-400">
                            Meeting Code
                        </span>
                        <p className="mt-1 font-mono text-sm font-semibold text-slate-200">
                            {meetingId}
                        </p>
                    </div>

                    <div className="mt-5">
                        <label className="block text-xs font-semibold text-slate-300">
                            Your Display Name
                        </label>
                        <input
                            type="text"
                            value={participantName}
                            onChange={(e) => setParticipantName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && participantName.trim()) {
                                    joinRoom();
                                }
                            }}
                            placeholder="e.g. Gautam (Physical Design)"
                            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            autoFocus
                        />
                    </div>

                    {error && (
                        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-950/50 p-3 text-xs text-red-400">
                            {error}
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={() => joinRoom()}
                        disabled={joining || !participantName.trim()}
                        className="mt-6 w-full rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {joining ? "Connecting to room..." : "Join Now"}
                    </button>

                    <div className="mt-6 flex items-center justify-between border-t border-slate-800/80 pt-4">
                        <a href="/" className="text-xs text-slate-400 hover:text-white transition">
                            ← Back to Home
                        </a>
                        <a href="/dashboard" className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition">
                            Open Dashboard
                        </a>
                    </div>
                </div>
            </main>
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

    // Remotes that are NOT currently featured on the main stage
    const otherRemotes = remoteParticipants.filter(
        (p) => pinnedSocketId === "local" || p.socketId !== activeRemote?.socketId
    );

    return (
        <main className="relative flex h-[100dvh] min-h-0 w-full overflow-hidden bg-[#181a20] text-white select-none">
            {/* Ambient Background Gradient matching Image 2 */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(60,40,30,0.35),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(20,30,45,0.45),transparent_60%)]" />

            {/* PERSISTENT AUDIO PLAYERS WITH ECHO GUARD */}
            {remoteParticipants.map((p) => (
                <RemoteAudioSink
                    key={`audio-${p.socketId}`}
                    stream={p.stream}
                    muted={isSpeakerMuted}
                />
            ))}

            {/* LEFT VERTICAL NAVIGATION DOCK (Hidden on mobile, matching Image 2) */}
            <aside className="relative z-20 hidden md:flex w-16 shrink-0 flex-col items-center justify-between border-r border-white/5 bg-[#1a1c24]/90 p-3 backdrop-blur-xl">
                <div className="flex flex-col items-center gap-6">
                    {/* Logo Icon */}
                    <a
                        href="/dashboard"
                        title="VLSI Labs Dashboard"
                        className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 hover:bg-white/15 transition p-1"
                    >
                        <img
                            src="/logo.png"
                            alt="Logo"
                            className="h-7 w-auto object-contain"
                        />
                    </a>

                    {/* Navigation Icons matching Image 2 */}
                    <div className="flex flex-col items-center gap-4">
                        <button
                            type="button"
                            onClick={() => router.push("/dashboard")}
                            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-white/10 hover:text-white transition"
                            title="Workspace Dashboard"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                        </button>

                        <button
                            type="button"
                            onClick={() => setIsRightPanelOpen((prev) => !prev)}
                            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-white/10 hover:text-white transition"
                            title="Toggle Messages & Participants"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </button>

                        <button
                            type="button"
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/25"
                            title="Active Meeting Call"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Exit / Leave Icon */}
                <button
                    type="button"
                    onClick={leaveMeeting}
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition"
                    title="Exit Call"
                >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                </button>
            </aside>

            {/* MAIN WORKSPACE BODY */}
            <div className="relative z-10 flex min-h-0 flex-1 overflow-hidden p-2 sm:p-4 gap-3 lg:gap-4">
                {/* CENTER STAGE CONTAINER */}
                <div className="flex min-h-0 flex-1 flex-col justify-between gap-2.5 sm:gap-3 overflow-hidden">
                    {/* TOP HEADER BAR (Responsive) */}
                    <div className="flex shrink-0 items-center justify-between rounded-2xl border border-white/10 bg-[#252834]/80 px-3 sm:px-4 py-2.5 sm:py-3 backdrop-blur-xl shadow-lg">
                        {/* Desktop Header Left */}
                        <div className="hidden sm:flex items-center gap-3">
                            <div className="flex flex-col items-center justify-center h-10 w-10 rounded-xl bg-white text-slate-900 font-bold leading-tight shadow-md">
                                <span className="text-[9px] font-semibold text-red-600 uppercase">Live</span>
                                <span className="text-sm">●</span>
                            </div>

                            <div>
                                <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                                    VLSI Review & Architecture
                                </h2>
                                <p className="text-[11px] text-slate-400">
                                    Room ID: <span className="font-mono text-blue-400 font-semibold">{meetingId}</span>
                                </p>
                            </div>
                        </div>

                        {/* Mobile Header Left */}
                        <div className="flex sm:hidden items-center gap-2">
                            <span className="flex h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
                            <span className="font-mono text-xs font-bold text-blue-400 truncate max-w-[140px]">
                                {meetingId}
                            </span>
                        </div>

                        {/* Header Right: Live Recording Timer + Flip Camera + Copy Link */}
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="flex items-center gap-1.5 sm:gap-2 rounded-xl bg-black/40 border border-white/5 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-slate-200">
                                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse hidden xs:inline-block" />
                                <span className="text-[11px] text-slate-400 hidden sm:inline">Recording Time</span>
                                <MeetingDurationTimer joined={joined} />
                            </div>

                            {/* Mobile Quick Camera Flip */}
                            <button
                                type="button"
                                onClick={flipCamera}
                                className="flex sm:hidden h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-cyan-300 transition active:scale-90"
                                title="Flip Camera"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>

                            <button
                                type="button"
                                onClick={copyMeetingUrl}
                                className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-white shadow-md transition"
                            >
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                                <span className="hidden xs:inline">{copiedUrl ? "Copied!" : "Invite"}</span>
                            </button>
                        </div>
                    </div>

                    {/* MAIN ACTIVE PRESENTER / SPEAKER STAGE */}
                    <div className="relative min-h-0 flex-1 overflow-hidden rounded-2xl border border-white/10 bg-[#161822] shadow-2xl">
                        {isSolo ? (
                            <VideoTile
                                stream={localPreviewStream}
                                name={`${participantName} (You · Host)`}
                                muted
                                micEnabled={micEnabled}
                                isScreen={isScreenSharing}
                            />
                        ) : activeRemote?.screenSharing ? (
                            <VideoTile
                                stream={activeRemote.stream}
                                name={`${activeRemote.name} · Screen`}
                                micEnabled={activeRemote.cameraEnabled !== false}
                                isScreen
                                isPinned
                                onPin={() => setPinnedSocketId(null)}
                            />
                        ) : pinnedSocketId === "local" ? (
                            <VideoTile
                                stream={localPreviewStream}
                                name={`${participantName} (You · Pinned)`}
                                muted
                                micEnabled={micEnabled}
                                isScreen={isScreenSharing}
                                isPinned
                                onPin={() => setPinnedSocketId(null)}
                            />
                        ) : (
                            <VideoTile
                                stream={activeRemote ? activeRemote.stream : localPreviewStream}
                                name={activeRemote ? activeRemote.name : `${participantName} (You)`}
                                muted={!activeRemote}
                                micEnabled={activeRemote ? activeRemote.cameraEnabled !== false : micEnabled}
                                isScreen={activeRemote ? activeRemote.screenSharing : isScreenSharing}
                                isPinned={Boolean(pinnedSocketId)}
                                onPin={() =>
                                    setPinnedSocketId(
                                        activeRemote?.socketId === pinnedSocketId
                                            ? null
                                            : activeRemote?.socketId || null
                                    )
                                }
                            />
                        )}

                        {/* Mobile Picture-in-Picture (PiP) Window for 1-on-1 calls */}
                        {isMobile && isOneOnOne && (
                            <div
                                onClick={() =>
                                    setPinnedSocketId(pinnedSocketId === "local" ? null : "local")
                                }
                                className="absolute bottom-4 right-3 z-30 h-36 w-24 sm:h-44 sm:w-32 cursor-pointer overflow-hidden rounded-2xl border-2 border-white/25 bg-black/70 shadow-2xl transition active:scale-95"
                                title="Tap to switch view"
                            >
                                <VideoTile
                                    stream={
                                        pinnedSocketId === "local"
                                            ? activeRemote?.stream || null
                                            : localPreviewStream
                                    }
                                    name={
                                        pinnedSocketId === "local"
                                            ? activeRemote?.name || "Participant"
                                            : "You"
                                    }
                                    muted={pinnedSocketId !== "local"}
                                    micEnabled={
                                        pinnedSocketId === "local"
                                            ? activeRemote?.cameraEnabled !== false
                                            : micEnabled
                                    }
                                    isScreen={
                                        pinnedSocketId === "local"
                                            ? activeRemote?.screenSharing
                                            : isScreenSharing
                                    }
                                />
                                <div className="absolute bottom-1 right-1 rounded-md bg-black/60 px-1 py-0.5 text-[8px] font-semibold text-white">
                                    Swap
                                </div>
                            </div>
                        )}
                    </div>

                    {/* PARTICIPANT THUMBNAIL ROW (No Duplication with Stage!) */}
                    {/* On mobile 1-on-1, PiP is used to leave 100% height for the video */}
                    {(!isMobile || remoteParticipants.length > 1) && !isSolo && (
                        <div className="flex h-24 sm:h-32 md:h-36 shrink-0 gap-2.5 sm:gap-3 overflow-x-auto pb-1 scrollbar-thin">
                            {/* Local User Tile (rendered in row only if NOT pinned on stage) */}
                            {pinnedSocketId !== "local" && (
                                <div
                                    onClick={() => setPinnedSocketId("local")}
                                    className="relative h-full w-36 sm:w-44 md:w-52 shrink-0 cursor-pointer overflow-hidden rounded-2xl border border-white/10 transition-all hover:border-blue-500/80"
                                >
                                    <VideoTile
                                        stream={localPreviewStream}
                                        name="You"
                                        muted
                                        micEnabled={micEnabled}
                                        isScreen={isScreenSharing}
                                    />
                                </div>
                            )}

                            {/* Remote Participants (Only those not featured on the main stage) */}
                            {otherRemotes.map((p) => (
                                <div
                                    key={p.socketId}
                                    onClick={() => setPinnedSocketId(p.socketId)}
                                    className="relative h-full w-36 sm:w-44 md:w-52 shrink-0 cursor-pointer overflow-hidden rounded-2xl border border-white/10 hover:border-blue-500/80 transition-all"
                                >
                                    <VideoTile
                                        stream={p.stream}
                                        name={p.screenSharing ? `${p.name} · Screen` : p.name}
                                        micEnabled={p.cameraEnabled !== false}
                                        isScreen={p.screenSharing}
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* FLOATING BOTTOM CONTROL BAR (Responsive) */}
                    <div className="flex shrink-0 items-center justify-center">
                        <div className="rounded-3xl border border-white/10 bg-[#252834]/90 px-2 sm:px-6 py-2 shadow-2xl backdrop-blur-2xl">
                            <MeetingControls
                                micEnabled={micEnabled}
                                cameraEnabled={cameraEnabled}
                                isScreenSharing={isScreenSharing}
                                isSpeakerMuted={isSpeakerMuted}
                                onToggleMic={toggleMic}
                                onToggleCamera={toggleCamera}
                                onToggleScreen={toggleScreenSharing}
                                onToggleSpeaker={() => setIsSpeakerMuted((prev) => !prev)}
                                onLeave={leaveMeeting}
                                onToggleChat={() => setIsRightPanelOpen((prev) => !prev)}
                                isChatOpen={isRightPanelOpen}
                                unreadChatCount={unreadChatCount}
                                onToggleParticipants={() => {
                                    setMobileTab("participants");
                                    setIsRightPanelOpen(true);
                                }}
                                participantCount={1 + remoteParticipants.length}
                                onSendReaction={sendReaction}
                                onFlipCamera={flipCamera}
                            />
                        </div>
                    </div>
                </div>

                {/* RIGHT PANEL FOR DESKTOP (Image 2 style dual cards) */}
                {isRightPanelOpen && (
                    <aside className="relative hidden md:flex w-80 lg:w-92 shrink-0 flex-col gap-3 overflow-hidden">
                        {/* CARD 1 (Top): PARTICIPANT ROSTER */}
                        <div className="flex max-h-56 shrink-0 flex-col rounded-2xl border border-white/10 bg-[#252834]/80 p-4 shadow-xl backdrop-blur-xl overflow-hidden">
                            <div className="flex items-center justify-between pb-3 border-b border-white/5">
                                <h3 className="text-xs font-bold text-white tracking-wide">
                                    Participant ({1 + remoteParticipants.length})
                                </h3>
                                <span className="rounded-full bg-blue-600 px-2.5 py-0.5 text-[10px] font-bold text-white shadow">
                                    Show All
                                </span>
                            </div>

                            <div className="flex-1 overflow-y-auto pt-3 space-y-2.5 scrollbar-thin">
                                {/* Local User */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 font-bold text-[10px] text-white">
                                            {participantName ? participantName.charAt(0).toUpperCase() : "Y"}
                                        </div>
                                        <span className="text-xs font-semibold text-slate-200 truncate max-w-[120px]">
                                            {participantName || "You"} (Host)
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                        <span>{cameraEnabled ? "📹" : "🚫"}</span>
                                        <span>{micEnabled ? "🎤" : "🔇"}</span>
                                    </div>
                                </div>

                                {/* Remote Participants */}
                                {remoteParticipants.map((p) => (
                                    <div key={p.socketId} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 font-bold text-[10px] text-white">
                                                {p.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-xs font-medium text-slate-200 truncate max-w-[120px]">
                                                {p.name}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                            <span>{p.cameraEnabled ? "📹" : "🚫"}</span>
                                            <span>🎤</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* CARD 2 (Bottom): MESSAGES LIVE CHAT */}
                        <div className="flex flex-1 min-h-0 flex-col rounded-2xl border border-white/10 bg-[#252834]/80 p-4 shadow-xl backdrop-blur-xl overflow-hidden">
                            <div className="flex items-center justify-between pb-3 border-b border-white/5">
                                <h3 className="text-xs font-bold text-white tracking-wide">
                                    Messages
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setIsRightPanelOpen(false)}
                                    className="text-xs text-slate-400 hover:text-white"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Chat Messages Feed */}
                            <div className="flex-1 overflow-y-auto py-3 space-y-3 scrollbar-thin">
                                {chatMessages.length === 0 ? (
                                    <div className="flex h-full flex-col items-center justify-center text-center p-4 text-slate-400">
                                        <p className="text-xs">No messages yet.</p>
                                        <p className="mt-1 text-[10px] text-slate-500">
                                            Type a message below to chat live.
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
                                                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-bold text-[10px] text-white ${
                                                    msg.isSelf ? "bg-blue-600" : "bg-purple-600"
                                                }`}
                                            >
                                                {msg.senderName.charAt(0).toUpperCase()}
                                            </div>
                                            <div className={`flex flex-col ${msg.isSelf ? "items-end" : "items-start"}`}>
                                                <div
                                                    className={`rounded-2xl px-3.5 py-2 text-xs leading-relaxed max-w-[210px] break-words ${
                                                        msg.isSelf
                                                            ? "bg-blue-600 text-white rounded-tr-sm"
                                                            : "bg-white/10 text-slate-100 rounded-tl-sm border border-white/5"
                                                    }`}
                                                >
                                                    {msg.text}
                                                </div>
                                                <span className="mt-1 text-[9px] text-slate-400">
                                                    {msg.time}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Bottom Message Input Bar */}
                            <form
                                onSubmit={sendChatMessage}
                                className="flex items-center gap-2 pt-2 border-t border-white/5"
                            >
                                <button
                                    type="button"
                                    className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
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
                                    placeholder="Message..."
                                    className="flex-1 rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />

                                <button
                                    type="submit"
                                    disabled={!chatInput.trim()}
                                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 transition"
                                    title="Send Message"
                                >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                </button>
                            </form>
                        </div>
                    </aside>
                )}

                {/* RIGHT PANEL FOR MOBILE (Overlay Bottom Sheet Drawer) */}
                {isRightPanelOpen && (
                    <div className="fixed inset-x-0 bottom-0 top-14 z-50 flex md:hidden flex-col rounded-t-3xl border-t border-white/15 bg-[#161822]/98 p-4 shadow-2xl backdrop-blur-2xl">
                        {/* Drawer Header with Tabs & Close */}
                        <div className="flex items-center justify-between pb-3 border-b border-white/10">
                            <div className="flex items-center gap-1.5 rounded-xl bg-white/5 p-1">
                                <button
                                    type="button"
                                    onClick={() => setMobileTab("chat")}
                                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                                        mobileTab === "chat"
                                            ? "bg-blue-600 text-white shadow"
                                            : "text-slate-400 hover:text-white"
                                    }`}
                                >
                                    Messages {unreadChatCount > 0 && `(${unreadChatCount})`}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setMobileTab("participants")}
                                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                                        mobileTab === "participants"
                                            ? "bg-blue-600 text-white shadow"
                                            : "text-slate-400 hover:text-white"
                                    }`}
                                >
                                    Participants ({1 + remoteParticipants.length})
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsRightPanelOpen(false)}
                                className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-slate-300 hover:text-white"
                                title="Close"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Mobile Drawer Content */}
                        {mobileTab === "chat" ? (
                            <div className="flex flex-1 min-h-0 flex-col pt-3">
                                <div className="flex-1 overflow-y-auto space-y-3 pb-2 scrollbar-thin">
                                    {chatMessages.length === 0 ? (
                                        <div className="flex h-full flex-col items-center justify-center text-center p-4 text-slate-400">
                                            <p className="text-xs">No messages yet.</p>
                                            <p className="mt-1 text-[10px] text-slate-500">Send a message below.</p>
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
                                                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-bold text-[10px] text-white ${
                                                        msg.isSelf ? "bg-blue-600" : "bg-purple-600"
                                                    }`}
                                                >
                                                    {msg.senderName.charAt(0).toUpperCase()}
                                                </div>
                                                <div className={`flex flex-col ${msg.isSelf ? "items-end" : "items-start"}`}>
                                                    <div
                                                        className={`rounded-2xl px-3.5 py-2 text-xs leading-relaxed max-w-[260px] break-words ${
                                                            msg.isSelf
                                                                ? "bg-blue-600 text-white rounded-tr-sm"
                                                                : "bg-white/10 text-slate-100 rounded-tl-sm border border-white/5"
                                                        }`}
                                                    >
                                                        {msg.text}
                                                    </div>
                                                    <span className="mt-1 text-[9px] text-slate-400">{msg.time}</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <form onSubmit={sendChatMessage} className="flex items-center gap-2 pt-2 border-t border-white/10">
                                    <input
                                        ref={mobileChatInputRef}
                                        type="text"
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        placeholder="Type a message..."
                                        autoComplete="off"
                                        autoCorrect="off"
                                        spellCheck="false"
                                        inputMode="text"
                                        className="flex-1 rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!chatInput.trim()}
                                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white disabled:opacity-40"
                                    >
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div className="flex-1 overflow-y-auto pt-3 space-y-2.5">
                                <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 font-bold text-xs text-white">
                                            {participantName ? participantName.charAt(0).toUpperCase() : "Y"}
                                        </div>
                                        <span className="text-xs font-semibold text-slate-200">
                                            {participantName || "You"} (Host)
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                        <span>{cameraEnabled ? "📹" : "🚫"}</span>
                                        <span>{micEnabled ? "🎤" : "🔇"}</span>
                                    </div>
                                </div>

                                {remoteParticipants.map((p) => (
                                    <div key={p.socketId} className="flex items-center justify-between p-2 rounded-xl bg-white/5">
                                        <div className="flex items-center gap-2.5">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 font-bold text-xs text-white">
                                                {p.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-xs font-medium text-slate-200">
                                                {p.name}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                            <span>{p.cameraEnabled ? "📹" : "🚫"}</span>
                                            <span>🎤</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}
