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
   PERSISTENT REMOTE AUDIO SINK (Never unmounted or glitchy)
========================================================= */
function RemoteAudioSink({ stream }: { stream: MediaStream }) {
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !stream) return;

        audio.srcObject = stream;
        const playAudio = () => {
            audio.play().catch((err) => {
                console.warn("Audio autoplay blocked by browser, awaiting interaction:", err);
            });
        };

        playAudio();

        stream.onaddtrack = () => playAudio();

        // Unlock audio on any global interaction
        const unlock = () => playAudio();
        window.addEventListener("click", unlock);
        window.addEventListener("touchstart", unlock);
        window.addEventListener("keydown", unlock);

        return () => {
            window.removeEventListener("click", unlock);
            window.removeEventListener("touchstart", unlock);
            window.removeEventListener("keydown", unlock);
        };
    }, [stream]);

    return <audio ref={audioRef} autoPlay playsInline className="hidden" />;
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
    const [error, setError] = useState("");

    const [localPreviewStream, setLocalPreviewStream] = useState<MediaStream | null>(null);
    const [remoteParticipants, setRemoteParticipants] = useState<RemoteParticipant[]>([]);
    const [sidePanel, setSidePanel] = useState<"none" | "participants" | "chat">("none");
    const [pinnedSocketId, setPinnedSocketId] = useState<string | null>(null);

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

    const sidePanelRef = useRef<"none" | "participants" | "chat">("none");
    sidePanelRef.current = sidePanel;

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

            const remoteStream =
                stream || remoteStreamsRef.current[socketId] || new MediaStream();
            remoteStreamsRef.current[socketId] = remoteStream;
            remoteNamesRef.current[socketId] = name || "Participant";

            setRemoteParticipants((current) => {
                const existing = current.find((p) => p.socketId === socketId);
                const cachedMediaState = remoteMediaStatesRef.current[socketId];

                if (existing) {
                    return current.map((p) =>
                        p.socketId === socketId
                            ? {
                                  ...p,
                                  name: name || p.name,
                                  stream: remoteStream,
                                  cameraEnabled: cachedMediaState?.cameraEnabled ?? p.cameraEnabled,
                                  screenSharing: cachedMediaState?.screenSharing ?? p.screenSharing,
                              }
                            : p
                    );
                }

                return [
                    ...current,
                    {
                        socketId,
                        name: name || "Participant",
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
                          stream: new MediaStream(p.stream.getTracks()),
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
        if (sidePanelRef.current !== "chat") {
            setUnreadChatCount((c) => c + 1);
        }
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
       CREATE PEER CONNECTION WITH DIRECT TRACK BINDING
    ========================================================= */
    const createPeerConnection = (
        remoteSocketId: string,
        remoteName: string,
        createDataChannel = false
    ) => {
        const existing = peerConnectionsRef.current[remoteSocketId];
        if (existing) return existing;

        remoteNamesRef.current[remoteSocketId] = remoteName;

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

        // Guarantee bidirectional transceivers if tracks were not attached yet
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

            // Fresh clone so React re-renders video and audio elements immediately
            const freshStream = new MediaStream(remoteStream.getTracks());
            remoteStreamsRef.current[remoteSocketId] = freshStream;

            const remoteName = remoteNamesRef.current[remoteSocketId] || "Participant";
            addRemoteParticipant(remoteSocketId, remoteName, freshStream);
        };

        peerConnection.onconnectionstatechange = () => {
            if (
                peerConnection.connectionState === "closed" ||
                peerConnection.connectionState === "disconnected"
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
       JOIN MEETING (Combines Media & Socket)
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
            // First attempt: Combined audio & video request
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

            // Try microphone independently
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

            // Try camera independently
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

        // Explicitly enable all live audio tracks
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
                setError("Could not connect to the signaling server. Please check internet connection.");
                setJoining(false);
                stream.getTracks().forEach((track) => track.stop());
            });

            socket.on("connect", () => {
                console.log("Connected to signaling server with socket:", socket.id);
                socket.emit("join-room", { meetingId, participantName: name });
                sendMediaState();

                // Record attendance in MongoDB
                fetch(`/api/meetings/${meetingId}/join`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ participantName: name }),
                }).catch(() => {});

                // Fetch persisted chat history from MongoDB
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
       MICROPHONE TOGGLE (With on-demand mic capture)
    ========================================================= */
    const toggleMic = async () => {
        let stream = localStreamRef.current;

        // If mic was not acquired initially, request mic on demand now
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
                            console.error("Could not add dynamically acquired audio track:", err);
                        }
                    });
                    setMicEnabled(true);
                    return;
                }
            } catch (err) {
                console.error("Could not dynamically acquire microphone:", err);
                setError("Microphone permission denied. Please allow microphone in browser settings.");
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
            // Camera OFF
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

        // Camera ON
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
       SCREEN SHARING
    ========================================================= */
    const startScreenSharing = async () => {
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: false,
            });
            const screenTrack = screenStream.getVideoTracks()[0];
            if (!screenTrack) return;

            screenStreamRef.current = screenStream;
            await Promise.all(
                Object.values(videoSendersRef.current).map(async (sender) => {
                    try {
                        await sender.replaceTrack(screenTrack);
                    } catch {}
                })
            );

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

        await Promise.all(
            Object.values(videoSendersRef.current).map(async (sender) => {
                try {
                    await sender.replaceTrack(cameraEnabledRef.current ? cameraTrack : null);
                } catch {}
            })
        );

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
       CHAT & PANEL CONTROLS
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

        // P2P DataChannel broadcast
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

        // Socket.IO fallback
        if (socketRef.current) {
            socketRef.current.emit("chat-message", {
                meetingId,
                senderName: participantName || "You",
                text,
                time,
            });
        }

        // Persistent MongoDB storage
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

    // Auto-fill participant name from local storage if available
    useEffect(() => {
        const savedName = localStorage.getItem("vlsilabs_user_name");
        if (savedName) setParticipantName(savedName);
    }, []);

    // Cleanup on unmount
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
       PRE-JOIN LOBBY (Google Meet / MS Teams style)
    ========================================================= */
    if (!joined) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#0a0d14] p-4 text-white">
                <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-[#121622] p-8 shadow-2xl">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 font-bold text-white shadow-lg shadow-blue-500/30">
                            V
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white">VLSI Labs Meetings</h1>
                            <p className="text-xs text-slate-400">Ready to join session</p>
                        </div>
                    </div>

                    <div className="mt-6 rounded-2xl border border-slate-800/80 bg-slate-950/60 p-4">
                        <span className="text-[11px] font-bold tracking-wider uppercase text-blue-400">
                            Meeting ID
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
                            placeholder="e.g. Gautam (Verification Engineer)"
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
                        <a
                            href="/"
                            className="text-xs text-slate-400 hover:text-white transition"
                        >
                            ← Back to Home
                        </a>
                        <a
                            href="/dashboard"
                            className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition"
                        >
                            Open Dashboard
                        </a>
                    </div>
                </div>
            </main>
        );
    }

    /* =========================================================
       CALCULATE ADAPTIVE GRID (Google Meet & MS Teams layout)
    ========================================================= */
    const isSpotlight = isScreenSharing || pinnedSocketId !== null;
    const pinnedParticipant = remoteParticipants.find((p) => p.socketId === pinnedSocketId);

    return (
        <main className="relative flex h-[100dvh] min-h-0 flex-col overflow-hidden bg-[#090b10] text-white select-none">
            {/* PERSISTENT AUDIO PLAYERS (One per remote participant at root, completely bulletproof) */}
            {remoteParticipants.map((p) => (
                <RemoteAudioSink key={`audio-${p.socketId}`} stream={p.stream} />
            ))}

            {/* TOP HEADER */}
            <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800/80 bg-[#0d1017] px-4 sm:px-6 z-20">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 text-white font-bold shadow-md shadow-blue-500/20">
                        V
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-sm font-bold text-white tracking-wide">
                                VLSI Room
                            </h1>
                            <span className="font-mono text-xs font-semibold text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/60">
                                {meetingId}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right Top Header Actions */}
                <div className="flex items-center gap-2 sm:gap-3">
                    {/* Participant Counter */}
                    <button
                        type="button"
                        onClick={() => setSidePanel((c) => (c === "participants" ? "none" : "participants"))}
                        className="flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-slate-700 transition"
                    >
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span>{1 + remoteParticipants.length} in call</span>
                    </button>

                    {/* Copy Link */}
                    <button
                        type="button"
                        onClick={copyMeetingUrl}
                        className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-slate-700 hover:text-white"
                        title="Copy meeting link"
                    >
                        <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        <span className="hidden sm:inline">{copiedUrl ? "Copied!" : "Share Link"}</span>
                    </button>

                    {/* Leave Room Pill */}
                    <button
                        type="button"
                        onClick={leaveMeeting}
                        className="flex items-center gap-1.5 rounded-xl bg-red-600/90 hover:bg-red-600 border border-red-500/40 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition"
                    >
                        Leave
                    </button>
                </div>
            </header>

            {/* MAIN VIDEO STAGE AREA */}
            <div className="relative flex min-h-0 flex-1 overflow-hidden">
                <section className="relative min-h-0 flex-1 overflow-hidden p-3 sm:p-5 pb-24 sm:pb-24 flex flex-col justify-center">
                    {error && (
                        <div className="absolute left-4 right-4 top-4 z-50 rounded-xl border border-red-500/40 bg-red-950/90 px-4 py-3 text-xs text-red-300 shadow-xl backdrop-blur">
                            {error}
                        </div>
                    )}

                    {/* Floating Reaction Animation */}
                    <div className="pointer-events-none absolute bottom-28 left-6 z-40 flex flex-col gap-2">
                        {reactions.map((r) => (
                            <div key={r.id} className="animate-bounce text-4xl">
                                {r.emoji}
                            </div>
                        ))}
                    </div>

                    {/* CASE 1: ONLY 1 PARTICIPANT (YOU ARE ALONE) */}
                    {remoteParticipants.length === 0 && (
                        <div className="flex h-full min-h-0 w-full items-center justify-center">
                            <div className="flex h-full max-h-[75vh] w-full max-w-4xl flex-col justify-center gap-4">
                                <div className="relative min-h-0 flex-1 rounded-2xl overflow-hidden shadow-2xl border border-slate-800/80 bg-slate-950">
                                    <VideoTile
                                        stream={localPreviewStream}
                                        name={`${participantName} (You)`}
                                        muted
                                        micEnabled={micEnabled}
                                        isScreen={isScreenSharing}
                                    />
                                </div>

                                <div className="shrink-0 rounded-2xl border border-slate-800/80 bg-slate-900/90 p-4 text-center shadow-lg backdrop-blur">
                                    <p className="text-sm font-semibold text-slate-200">
                                        You are the only person in this room
                                    </p>
                                    <p className="mt-1 text-xs text-slate-400">
                                        Share meeting code <span className="font-mono text-blue-400 font-bold">{meetingId}</span> or send the invite link.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={copyMeetingUrl}
                                        className="mt-3 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md transition hover:bg-blue-700"
                                    >
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                        <span>{copiedUrl ? "Link Copied!" : "Copy Invite Link"}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* CASE 2: 2 PARTICIPANTS (YOU + 1 REMOTE) - Google Meet 50/50 Split Grid */}
                    {remoteParticipants.length === 1 && !isSpotlight && (
                        <div className="grid h-full min-h-0 w-full grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 items-center">
                            {/* Remote Participant Tile */}
                            <div className="h-full min-h-0 w-full">
                                <VideoTile
                                    stream={remoteParticipants[0].stream}
                                    name={remoteParticipants[0].name}
                                    micEnabled={remoteParticipants[0].cameraEnabled !== false}
                                    isScreen={remoteParticipants[0].screenSharing}
                                    onPin={() => setPinnedSocketId(remoteParticipants[0].socketId)}
                                />
                            </div>

                            {/* Local User Tile */}
                            <div className="h-full min-h-0 w-full">
                                <VideoTile
                                    stream={localPreviewStream}
                                    name={`${participantName} (You)`}
                                    muted
                                    micEnabled={micEnabled}
                                    isScreen={isScreenSharing}
                                    onPin={() => setPinnedSocketId("local")}
                                />
                            </div>
                        </div>
                    )}

                    {/* CASE 3: 3+ PARTICIPANTS - Auto-Fit Multi-User Grid (No Duplicates) */}
                    {remoteParticipants.length >= 2 && !isSpotlight && (
                        <div
                            className={`grid h-full min-h-0 w-full gap-3 sm:gap-4 items-center ${
                                remoteParticipants.length <= 3
                                    ? "grid-cols-1 sm:grid-cols-2"
                                    : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                            }`}
                        >
                            {/* Local User */}
                            <div className="h-full min-h-0 w-full">
                                <VideoTile
                                    stream={localPreviewStream}
                                    name={`${participantName} (You)`}
                                    muted
                                    micEnabled={micEnabled}
                                    isScreen={isScreenSharing}
                                    onPin={() => setPinnedSocketId("local")}
                                />
                            </div>

                            {/* Each Remote User Appears Exactly Once */}
                            {remoteParticipants.map((p) => (
                                <div key={p.socketId} className="h-full min-h-0 w-full">
                                    <VideoTile
                                        stream={p.stream}
                                        name={p.name}
                                        micEnabled={p.cameraEnabled !== false}
                                        isScreen={p.screenSharing}
                                        onPin={() => setPinnedSocketId(p.socketId)}
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* CASE 4: SPOTLIGHT / SCREEN SHARING MODE (Large Presentation + Strip) */}
                    {isSpotlight && (
                        <div className="flex h-full min-h-0 w-full flex-col lg:flex-row gap-3">
                            {/* Large Spotlight Presentation Stage */}
                            <div className="relative min-h-0 flex-1 overflow-hidden rounded-2xl border border-blue-500/50 bg-black shadow-2xl">
                                {pinnedSocketId === "local" || isScreenSharing ? (
                                    <VideoTile
                                        stream={localPreviewStream}
                                        name={`${participantName} (You · Presenting)`}
                                        muted
                                        micEnabled={micEnabled}
                                        isScreen={isScreenSharing}
                                        isPinned
                                        onPin={() => setPinnedSocketId(null)}
                                    />
                                ) : (
                                    pinnedParticipant && (
                                        <VideoTile
                                            stream={pinnedParticipant.stream}
                                            name={pinnedParticipant.screenSharing ? `${pinnedParticipant.name} · Screen` : pinnedParticipant.name}
                                            micEnabled={pinnedParticipant.cameraEnabled !== false}
                                            isScreen={pinnedParticipant.screenSharing}
                                            isPinned
                                            onPin={() => setPinnedSocketId(null)}
                                        />
                                    )
                                )}
                            </div>

                            {/* Side Strip: Remaining participants without duplication */}
                            <div className="flex lg:flex-col h-32 lg:h-full lg:w-64 shrink-0 gap-3 overflow-x-auto lg:overflow-y-auto scrollbar-thin">
                                {/* Local tile if not pinned on stage */}
                                {pinnedSocketId !== "local" && !isScreenSharing && (
                                    <div className="h-full lg:h-44 w-48 lg:w-full shrink-0">
                                        <VideoTile
                                            stream={localPreviewStream}
                                            name="You"
                                            muted
                                            micEnabled={micEnabled}
                                            onPin={() => setPinnedSocketId("local")}
                                        />
                                    </div>
                                )}

                                {/* Remote participants not on stage */}
                                {remoteParticipants
                                    .filter((p) => p.socketId !== pinnedSocketId)
                                    .map((p) => (
                                        <div key={p.socketId} className="h-full lg:h-44 w-48 lg:w-full shrink-0">
                                            <VideoTile
                                                stream={p.stream}
                                                name={p.name}
                                                micEnabled={p.cameraEnabled !== false}
                                                isScreen={p.screenSharing}
                                                onPin={() => setPinnedSocketId(p.socketId)}
                                            />
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}
                </section>

                {/* SLIDE-OUT SIDE PANEL: CHAT & PARTICIPANTS */}
                {sidePanel !== "none" && (
                    <aside className="absolute inset-y-0 right-0 z-30 flex w-full flex-col border-l border-slate-800 bg-[#0d1017]/98 shadow-2xl backdrop-blur-xl sm:static sm:w-80 md:w-96 pb-[84px]">
                        <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-800 px-4">
                            <h2 className="text-sm font-bold text-white">
                                {sidePanel === "chat" ? "In-Call Messages" : `People (${1 + remoteParticipants.length})`}
                            </h2>
                            <button
                                type="button"
                                onClick={() => setSidePanel("none")}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-white transition hover:bg-slate-800"
                            >
                                ✕
                            </button>
                        </div>

                        {sidePanel === "chat" ? (
                            <div className="flex flex-1 flex-col overflow-hidden">
                                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                    {chatMessages.length === 0 ? (
                                        <div className="flex h-full flex-col items-center justify-center text-center p-6 text-slate-500">
                                            <p className="text-xs">No messages yet.</p>
                                            <p className="mt-1 text-[11px] text-slate-600">
                                                Messages sent here are delivered instantly and saved for this meeting.
                                            </p>
                                        </div>
                                    ) : (
                                        chatMessages.map((msg) => (
                                            <div
                                                key={msg.id}
                                                className={`flex flex-col ${
                                                    msg.isSelf ? "items-end" : "items-start"
                                                }`}
                                            >
                                                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1">
                                                    <span className="font-semibold">{msg.senderName}</span>
                                                    <span>· {msg.time}</span>
                                                </div>
                                                <div
                                                    className={`rounded-2xl px-3.5 py-2 text-xs leading-relaxed max-w-[85%] break-words ${
                                                        msg.isSelf
                                                            ? "bg-blue-600 text-white rounded-tr-sm"
                                                            : "bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700/60"
                                                    }`}
                                                >
                                                    {msg.text}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <form onSubmit={sendChatMessage} className="border-t border-slate-800 p-3 flex gap-2">
                                    <input
                                        type="text"
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        placeholder="Send a message to everyone..."
                                        className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!chatInput.trim()}
                                        className="rounded-xl bg-blue-600 px-3.5 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:opacity-40"
                                    >
                                        Send
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                                {/* Local User */}
                                <div className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-900/60 p-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 font-bold text-xs text-white">
                                            {participantName ? participantName.charAt(0).toUpperCase() : "Y"}
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-white">
                                                {participantName || "You"} <span className="text-blue-400 font-normal">(Host)</span>
                                            </p>
                                            <p className="text-[10px] text-slate-400">Meeting Organizer</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-semibold text-emerald-400">
                                        {micEnabled ? "🎤" : "🔇"}
                                    </span>
                                </div>

                                {/* Remote Users */}
                                {remoteParticipants.map((p) => (
                                    <div
                                        key={p.socketId}
                                        className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-900/40 p-3"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 font-bold text-xs text-slate-200">
                                                {p.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-white">{p.name}</p>
                                                <p className="text-[10px] text-slate-400">Participant</p>
                                            </div>
                                        </div>
                                        <span className="text-[10px]">
                                            {p.cameraEnabled ? "📷" : "🚫"}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </aside>
                )}
            </div>

            {/* BOTTOM FLOATING CONTROLS BAR (Google Meet / MS Teams style) */}
            <footer className="absolute bottom-4 inset-x-0 z-30 flex justify-center px-4 pointer-events-none">
                <div className="pointer-events-auto rounded-3xl border border-slate-800/90 bg-[#121622]/95 px-3 sm:px-6 py-2.5 shadow-2xl backdrop-blur-xl">
                    <MeetingControls
                        micEnabled={micEnabled}
                        cameraEnabled={cameraEnabled}
                        isScreenSharing={isScreenSharing}
                        onToggleMic={toggleMic}
                        onToggleCamera={toggleCamera}
                        onToggleScreen={toggleScreenSharing}
                        onLeave={leaveMeeting}
                        onToggleChat={() => {
                            setSidePanel((c) => (c === "chat" ? "none" : "chat"));
                            setUnreadChatCount(0);
                        }}
                        isChatOpen={sidePanel === "chat"}
                        unreadChatCount={unreadChatCount}
                        onToggleParticipants={() =>
                            setSidePanel((c) => (c === "participants" ? "none" : "participants"))
                        }
                        isParticipantsOpen={sidePanel === "participants"}
                        participantCount={1 + remoteParticipants.length}
                        onSendReaction={sendReaction}
                    />
                </div>
            </footer>
        </main>
    );
}
