"use client";

import { useEffect, useRef, useState } from "react";
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

export default function MeetingRoom({
    meetingId,
}: MeetingRoomProps) {
    const router = useRouter();
    /* =========================================================
       BASIC STATE
    ========================================================= */

    const [participantName, setParticipantName] =
        useState("");

    const [joined, setJoined] = useState(false);
    const [joining, setJoining] = useState(false);

    const [micEnabled, setMicEnabled] =
        useState(true);

    const [cameraEnabled, setCameraEnabled] =
        useState(true);

    const [isScreenSharing, setIsScreenSharing] =
        useState(false);

    const [error, setError] = useState("");

    const [localPreviewStream, setLocalPreviewStream] =
        useState<MediaStream | null>(null);

    const [remoteParticipants, setRemoteParticipants] =
        useState<RemoteParticipant[]>([]);

    const [sidePanel, setSidePanel] =
        useState<"none" | "participants" | "chat">("none");

    const [chatMessages, setChatMessages] =
        useState<
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
    const [pinnedSocketId, setPinnedSocketId] = useState<string | null>(null);
    const [reactions, setReactions] = useState<Array<{ id: string; emoji: string }>>([]);
    const sidePanelRef = useRef<"none" | "participants" | "chat">("none");
    sidePanelRef.current = sidePanel;

    const sendReaction = (emoji: string) => {
        const id = `${Date.now()}-${Math.random()}`;
        setReactions((prev) => [...prev, { id, emoji }]);
        setTimeout(() => {
            setReactions((prev) => prev.filter((r) => r.id !== id));
        }, 3000);

        const payload = JSON.stringify({
            type: "reaction",
            emoji,
        });

        Object.values(dataChannelsRef.current).forEach((channel) => {
            if (channel.readyState === "open") {
                try {
                    channel.send(payload);
                } catch {}
            }
        });
    };

    /* =========================================================
       STREAM REFS
    ========================================================= */

    // Real camera + microphone stream.
    const localStreamRef =
        useRef<MediaStream | null>(null);

    // Screen-share stream.
    const screenStreamRef =
        useRef<MediaStream | null>(null);

    /* =========================================================
       SOCKET
    ========================================================= */

    const socketRef =
        useRef<Socket | null>(null);

    /* =========================================================
       WEBRTC
    ========================================================= */

    const peerConnectionsRef = useRef<
        Record<string, RTCPeerConnection>
    >({});

    // One stable video sender per participant.
    const videoSendersRef = useRef<
        Record<string, RTCRtpSender>
    >({});

    // One stable audio sender per participant.
    const audioSendersRef = useRef<
        Record<string, RTCRtpSender>
    >({});

    // Data channel used for camera/screen state and peer-to-peer chat.
    const dataChannelsRef = useRef<
        Record<string, RTCDataChannel>
    >({});

    /* =========================================================
       REMOTE STREAMS / NAMES
    ========================================================= */

    const remoteStreamsRef = useRef<
        Record<string, MediaStream>
    >({});

    const remoteNamesRef = useRef<
        Record<string, string>
    >({});

    /* =========================================================
       ICE QUEUE
    ========================================================= */

    const pendingIceCandidatesRef = useRef<
        Record<string, RTCIceCandidateInit[]>
    >({});

    /* =========================================================
       CURRENT MEDIA STATE REFS
    ========================================================= */

    const participantNameRef =
        useRef("");

    const cameraEnabledRef =
        useRef(true);

    const screenSharingRef =
        useRef(false);

    // Cache remote media states so state changes are never lost before participant mounts
    const remoteMediaStatesRef = useRef<
        Record<string, { cameraEnabled: boolean; screenSharing: boolean }>
    >({});

    useEffect(() => {
        participantNameRef.current =
            participantName;
    }, [participantName]);

    useEffect(() => {
        cameraEnabledRef.current =
            cameraEnabled;
    }, [cameraEnabled]);

    useEffect(() => {
        screenSharingRef.current =
            isScreenSharing;
    }, [isScreenSharing]);

    /* =========================================================
       ADD / UPDATE REMOTE PARTICIPANT
    ========================================================= */

    const addRemoteParticipant = (
        socketId: string,
        name: string,
        stream?: MediaStream
    ) => {
        const remoteStream =
            stream ||
            remoteStreamsRef.current[socketId] ||
            new MediaStream();

        remoteStreamsRef.current[socketId] =
            remoteStream;

        remoteNamesRef.current[socketId] =
            name;

        setRemoteParticipants((current) => {
            const existing = current.find(
                (participant) =>
                    participant.socketId === socketId
            );

            if (existing) {
                return current.map(
                    (participant) =>
                        participant.socketId === socketId
                            ? {
                                ...participant,
                                name,
                                stream: remoteStream,
                            }
                            : participant
                );
            }

            const cachedMediaState = remoteMediaStatesRef.current[socketId];

            return [
                ...current,
                {
                    socketId,
                    name,
                    stream: remoteStream,
                    cameraEnabled: cachedMediaState?.cameraEnabled ?? true,
                    screenSharing: cachedMediaState?.screenSharing ?? false,
                },
            ];
        });
    };

    /* =========================================================
       REMOVE REMOTE PARTICIPANT
    ========================================================= */

    const removeParticipant = (
        socketId: string
    ) => {
        const connection =
            peerConnectionsRef.current[
            socketId
            ];

        if (connection) {
            connection.close();

            delete peerConnectionsRef.current[
                socketId
            ];
        }

        delete videoSendersRef.current[
            socketId
        ];

        delete audioSendersRef.current[
            socketId
        ];

        delete dataChannelsRef.current[
            socketId
        ];

        delete remoteStreamsRef.current[
            socketId
        ];

        delete remoteNamesRef.current[
            socketId
        ];

        delete pendingIceCandidatesRef.current[
            socketId
        ];

        delete remoteMediaStatesRef.current[
            socketId
        ];

        setRemoteParticipants((current) =>
            current.filter(
                (participant) =>
                    participant.socketId !== socketId
            )
        );
    };

    /* =========================================================
       REMOTE MEDIA STATE SYNC
    ========================================================= */

    const applyRemoteMediaState = (
        socketId: string,
        mediaState: {
            cameraEnabled?: boolean;
            screenSharing?: boolean;
        }
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
            current.map((participant) =>
                participant.socketId === socketId
                    ? {
                          ...participant,
                          cameraEnabled: updated.cameraEnabled,
                          screenSharing: updated.screenSharing,
                          // Refresh stream reference so React re-evaluates video/screen track
                          stream: new MediaStream(participant.stream.getTracks()),
                      }
                    : participant
            )
        );
    };

    /* =========================================================
       SEND MEDIA STATE
    ========================================================= */

    const sendMediaState = (
        overrides?: Partial<{
            cameraEnabled: boolean;
            screenSharing: boolean;
        }>
    ) => {
        const state = {
            type: "media-state" as const,
            cameraEnabled:
                overrides?.cameraEnabled ??
                cameraEnabledRef.current,
            screenSharing:
                overrides?.screenSharing ??
                screenSharingRef.current,
        };

        // 1. Direct WebRTC DataChannels (ultra low-latency P2P)
        Object.values(
            dataChannelsRef.current
        ).forEach((channel) => {
            if (channel.readyState === "open") {
                try {
                    channel.send(
                        JSON.stringify(state)
                    );
                } catch (err) {
                    console.error("Failed to send media-state via DataChannel:", err);
                }
            }
        });

        // 2. WebSocket signaling fallback (reliable delivery across network firewalls & new joiners)
        if (socketRef.current?.connected) {
            socketRef.current.emit("media-state", {
                meetingId,
                cameraEnabled: state.cameraEnabled,
                screenSharing: state.screenSharing,
            });
        }
    };

    /* =========================================================
       HANDLE DATA CHANNEL MESSAGE
    ========================================================= */

    const handleDataChannelMessage = (
        socketId: string,
        event: MessageEvent
    ) => {
        try {
            const message =
                JSON.parse(event.data) as MediaStateMessage;

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
        } catch (error) {
            console.error(
                "Invalid data channel message:",
                error
            );
        }
    };

    /* =========================================================
       CHAT & PANEL HANDLERS
    ========================================================= */

    const handleChatMessage = (data: {
        id?: string;
        senderName: string;
        text: string;
        time?: string;
    }) => {
        const msgId = data.id || `${data.senderName}-${data.text}-${data.time || Date.now()}`;
        setChatMessages((prev) => {
            if (prev.some((m) => m.id === msgId)) {
                return prev;
            }
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
            setUnreadChatCount((count) => count + 1);
        }
    };

    const sendChatMessage = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const text = chatInput.trim();
        if (!text) return;

        const time = new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });

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

        // 1. Direct WebRTC Peer-to-Peer DataChannel Broadcast (instant & zero server latency)
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
                } catch (err) {
                    console.error("Data channel chat send failed:", err);
                }
            }
        });

        // 2. Central Socket.IO Relay
        if (socketRef.current) {
            socketRef.current.emit("chat-message", {
                meetingId,
                senderName: participantName || "You",
                text,
                time,
            });
        }
    };

    const copyMeetingUrl = () => {
        const url =
            typeof window !== "undefined"
                ? `${window.location.origin}/meet/${meetingId}`
                : "";
        if (url) {
            navigator.clipboard
                .writeText(url)
                .then(() => {
                    setCopiedUrl(true);
                    setTimeout(() => setCopiedUrl(false), 2500);
                })
                .catch(() => {});
        }
    };

    const toggleChat = () => {
        setSidePanel((curr) => {
            const next = curr === "chat" ? "none" : "chat";
            if (next === "chat") {
                setUnreadChatCount(0);
            }
            return next;
        });
    };

    const toggleParticipants = () => {
        setSidePanel((curr) =>
            curr === "participants" ? "none" : "participants"
        );
    };

    /* =========================================================
       SETUP DATA CHANNEL
    ========================================================= */

    const setupDataChannel = (
        socketId: string,
        channel: RTCDataChannel
    ) => {
        dataChannelsRef.current[
            socketId
        ] = channel;

        channel.onopen = () => {
            console.log(
                "Data channel connected:",
                socketId
            );

            const state: MediaStateMessage = {
                type: "media-state",
                cameraEnabled:
                    cameraEnabledRef.current,
                screenSharing:
                    screenSharingRef.current,
            };

            channel.send(
                JSON.stringify(state)
            );
        };

        channel.onmessage = (event) => {
            handleDataChannelMessage(
                socketId,
                event
            );
        };

        channel.onclose = () => {
            delete dataChannelsRef.current[
                socketId
            ];
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
        const existing =
            peerConnectionsRef.current[
            remoteSocketId
            ];

        if (existing) {
            return existing;
        }

        remoteNamesRef.current[
            remoteSocketId
        ] = remoteName;

        const peerConnection =
            new RTCPeerConnection({
                iceServers: [
                    { urls: "stun:stun.l.google.com:19302" },
                    { urls: "stun:stun1.l.google.com:19302" },
                    { urls: "stun:stun2.l.google.com:19302" },
                    { urls: "stun:stun3.l.google.com:19302" },
                    { urls: "stun:stun4.l.google.com:19302" },
                    { urls: "stun:stun.cloudflare.com:3478" },
                    { urls: "stun:global.stun.twilio.com:3478" },
                ],
                iceCandidatePoolSize: 10,
            });

        peerConnectionsRef.current[
            remoteSocketId
        ] = peerConnection;

        /*
         * Create ONE permanent video transceiver.
         *
         * This is important.
         *
         * We can later:
         *
         * camera -> screen
         * screen -> camera
         * camera -> null
         * null -> camera
         *
         * without creating new tracks that
         * require renegotiation.
         */
        const videoTransceiver =
            peerConnection.addTransceiver(
                "video",
                {
                    direction: "sendrecv",
                }
            );

        videoSendersRef.current[
            remoteSocketId
        ] = videoTransceiver.sender;

        /*
         * Create permanent audio transceiver for symmetrical 2-way audio
         */
        const audioTransceiver =
            peerConnection.addTransceiver(
                "audio",
                {
                    direction: "sendrecv",
                }
            );

        audioSendersRef.current[
            remoteSocketId
        ] = audioTransceiver.sender;

        /*
         * Attach local microphone and camera tracks
         */
        const localStream =
            localStreamRef.current;

        if (localStream) {
            const audioTrack =
                localStream
                    .getAudioTracks()
                    .find(
                        (track) =>
                            track.readyState === "live"
                    );

            if (audioTrack) {
                audioTransceiver.sender.replaceTrack(
                    audioTrack
                ).catch(() => {});
            }

            /*
             * Put current camera track
             * into the permanent sender.
             */
            const cameraTrack =
                localStream
                    .getVideoTracks()
                    .find(
                        (track) =>
                            track.readyState === "live"
                    );

            if (
                cameraTrack &&
                cameraEnabledRef.current
            ) {
                videoTransceiver.sender.replaceTrack(
                    cameraTrack
                ).catch(() => {});
            }
        }

        /*
         * Create data channel only for
         * the user creating the offer.
         */
        if (createDataChannel) {
            const dataChannel =
                peerConnection.createDataChannel(
                    "meeting-state"
                );

            setupDataChannel(
                remoteSocketId,
                dataChannel
            );
        }

        /*
         * Incoming data channel.
         */
        peerConnection.ondatachannel = (
            event
        ) => {
            setupDataChannel(
                remoteSocketId,
                event.channel
            );
        };

        /*
         * ICE candidate.
         */
        peerConnection.onicecandidate = (
            event
        ) => {
            if (
                event.candidate &&
                socketRef.current
            ) {
                socketRef.current.emit(
                    "ice-candidate",
                    {
                        target: remoteSocketId,
                        candidate: event.candidate,
                    }
                );
            }
        };

        /*
         * Remote media.
         */
        peerConnection.ontrack = (
            event
        ) => {
            let remoteStream =
                remoteStreamsRef.current[
                remoteSocketId
                ];

            if (!remoteStream) {
                remoteStream =
                    event.streams[0] || new MediaStream();
            }

            if (
                !remoteStream
                    .getTracks()
                    .some(
                        (track) =>
                            track.id === event.track.id
                    )
            ) {
                remoteStream.addTrack(
                    event.track
                );
            }

            // Always create a fresh MediaStream clone so React components immediately re-run hooks and play audio/video
            const updatedStream = new MediaStream(
                remoteStream.getTracks()
            );

            remoteStreamsRef.current[
                remoteSocketId
            ] = updatedStream;

            const remoteName =
                remoteNamesRef.current[
                remoteSocketId
                ] || "Participant";

            addRemoteParticipant(
                remoteSocketId,
                remoteName,
                updatedStream
            );
        };

        /*
         * Connection state logging.
         */
        peerConnection.onconnectionstatechange =
            () => {
                console.log(
                    "WebRTC connection:",
                    remoteSocketId,
                    peerConnection.connectionState
                );

                if (
                    peerConnection.connectionState ===
                    "failed"
                ) {
                    console.error(
                        "WebRTC connection failed:",
                        remoteSocketId
                    );
                }

                if (
                    peerConnection.connectionState ===
                    "closed" ||
                    peerConnection.connectionState ===
                    "disconnected"
                ) {
                    removeParticipant(
                        remoteSocketId
                    );
                }
            };

        peerConnection.oniceconnectionstatechange =
            () => {
                console.log(
                    "ICE connection:",
                    remoteSocketId,
                    peerConnection.iceConnectionState
                );
            };

        return peerConnection;
    };

    /* =========================================================
       FLUSH QUEUED ICE CANDIDATES
    ========================================================= */

    const flushPendingIceCandidates =
        async (
            socketId: string,
            peerConnection: RTCPeerConnection
        ) => {
            const candidates =
                pendingIceCandidatesRef.current[
                socketId
                ];

            if (!candidates?.length) {
                return;
            }

            for (const candidate of candidates) {
                try {
                    await peerConnection.addIceCandidate(
                        new RTCIceCandidate(
                            candidate
                        )
                    );
                } catch (error) {
                    console.error(
                        "Failed to add queued ICE candidate:",
                        error
                    );
                }
            }

            delete pendingIceCandidatesRef.current[
                socketId
            ];
        };

    /* =========================================================
       EXISTING USERS
    ========================================================= */

    const handleExistingUsers =
        async (
            users: ExistingUser[]
        ) => {
            for (const user of users) {
                addRemoteParticipant(
                    user.socketId,
                    user.participantName
                );

                const peerConnection =
                    createPeerConnection(
                        user.socketId,
                        user.participantName,
                        true
                    );

                try {
                    const offer =
                        await peerConnection.createOffer();

                    await peerConnection.setLocalDescription(
                        offer
                    );

                    socketRef.current?.emit(
                        "offer",
                        {
                            target: user.socketId,
                            offer,
                            participantName:
                                participantNameRef.current,
                        }
                    );
                } catch (error) {
                    console.error(
                        "Failed to create offer:",
                        error
                    );
                }
            }
        };

    /* =========================================================
       NEW USER JOINED
    ========================================================= */

    const handleUserJoined = (
        data: {
            socketId: string;
            participantName: string;
        }
    ) => {
        console.log(
            "User joined:",
            data
        );

        addRemoteParticipant(
            data.socketId,
            data.participantName
        );

        createPeerConnection(
            data.socketId,
            data.participantName,
            false
        );

        // Immediately notify newly joined peer of our current camera & screen status
        sendMediaState();
    };

    /* =========================================================
       INCOMING OFFER
    ========================================================= */

    const handleOffer = async (
        data: {
            sender: string;
            offer: RTCSessionDescriptionInit;
            participantName?: string;
        }
    ) => {
        const remoteName =
            data.participantName ||
            "Participant";

        remoteNamesRef.current[
            data.sender
        ] = remoteName;

        addRemoteParticipant(
            data.sender,
            remoteName
        );

        const peerConnection =
            createPeerConnection(
                data.sender,
                remoteName,
                false
            );

        try {
            await peerConnection.setRemoteDescription(
                new RTCSessionDescription(
                    data.offer
                )
            );

            await flushPendingIceCandidates(
                data.sender,
                peerConnection
            );

            const answer =
                await peerConnection.createAnswer();

            await peerConnection.setLocalDescription(
                answer
            );

            socketRef.current?.emit(
                "answer",
                {
                    target: data.sender,
                    answer,
                }
            );
        } catch (error) {
            console.error(
                "Error handling offer:",
                error
            );
        }
    };

    /* =========================================================
       INCOMING ANSWER
    ========================================================= */

    const handleAnswer = async (
        data: {
            sender: string;
            answer: RTCSessionDescriptionInit;
        }
    ) => {
        const peerConnection =
            peerConnectionsRef.current[
            data.sender
            ];

        if (!peerConnection) {
            console.error(
                "Peer connection not found for answer:",
                data.sender
            );

            return;
        }

        try {
            await peerConnection.setRemoteDescription(
                new RTCSessionDescription(
                    data.answer
                )
            );

            await flushPendingIceCandidates(
                data.sender,
                peerConnection
            );
        } catch (error) {
            console.error(
                "Error handling answer:",
                error
            );
        }
    };

    /* =========================================================
       INCOMING ICE
    ========================================================= */

    const handleIceCandidate = async (
        data: {
            sender: string;
            candidate: RTCIceCandidateInit;
        }
    ) => {
        const peerConnection =
            peerConnectionsRef.current[
            data.sender
            ];

        /*
         * Peer doesn't exist yet.
         */
        if (!peerConnection) {
            if (
                !pendingIceCandidatesRef.current[
                data.sender
                ]
            ) {
                pendingIceCandidatesRef.current[
                    data.sender
                ] = [];
            }

            pendingIceCandidatesRef.current[
                data.sender
            ].push(data.candidate);

            return;
        }

        /*
         * Remote SDP isn't ready yet.
         */
        if (
            !peerConnection.remoteDescription
        ) {
            if (
                !pendingIceCandidatesRef.current[
                data.sender
                ]
            ) {
                pendingIceCandidatesRef.current[
                    data.sender
                ] = [];
            }

            pendingIceCandidatesRef.current[
                data.sender
            ].push(data.candidate);

            return;
        }

        try {
            await peerConnection.addIceCandidate(
                new RTCIceCandidate(
                    data.candidate
                )
            );
        } catch (error) {
            console.error(
                "Failed to add ICE candidate:",
                error
            );
        }
    };

    /* =========================================================
       JOIN MEETING
    ========================================================= */

    const joinMeeting = async () => {
        const name =
            participantName.trim();

        if (!name) {
            setError(
                "Please enter your name."
            );
            return;
        }

        setJoining(true);
        setError("");

        // Initialize empty media stream and independently acquire audio & video
        const stream = new MediaStream();

        // 1. Acquire microphone with echo cancellation and noise suppression
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
        } catch (mediaError) {
            console.warn(
                "Microphone could not be acquired or permission denied:",
                mediaError
            );
            setMicEnabled(false);
        }

        // 2. Acquire camera independently so camera failure NEVER blocks microphone
        try {
            const videoStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                },
            });
            videoStream.getVideoTracks().forEach((track) => stream.addTrack(track));
            setCameraEnabled(true);
        } catch (mediaError) {
            console.warn(
                "Camera could not be acquired (busy or permission denied):",
                mediaError
            );
            setCameraEnabled(false);
        }

        localStreamRef.current = stream;

        setLocalPreviewStream(
            stream
        );

        try {
            /*
             * Connect Socket.IO.
             */
            const socket = io(
                SOCKET_URL,
                {
                    transports: ["polling", "websocket"],
                    reconnection: true,
                    reconnectionAttempts: 10,
                    reconnectionDelay: 1000,
                }
            );

            socketRef.current =
                socket;

            /*
             * Register listeners BEFORE
             * connecting/joining.
             */
            socket.on(
                "existing-users",
                handleExistingUsers
            );

            socket.on(
                "user-joined",
                handleUserJoined
            );

            socket.on(
                "offer",
                handleOffer
            );

            socket.on(
                "answer",
                handleAnswer
            );

            socket.on(
                "ice-candidate",
                handleIceCandidate
            );

            socket.on(
                "user-left",
                (data: {
                    socketId: string;
                }) => {
                    removeParticipant(
                        data.socketId
                    );
                }
            );

            socket.on(
                "chat-message",
                handleChatMessage
            );

            socket.on(
                "media-state",
                (data: {
                    socketId: string;
                    cameraEnabled?: boolean;
                    screenSharing?: boolean;
                }) => {
                    if (data?.socketId) {
                        applyRemoteMediaState(data.socketId, {
                            cameraEnabled: data.cameraEnabled,
                            screenSharing: data.screenSharing,
                        });
                    }
                }
            );

            socket.on(
                "connect_error",
                (connectionError) => {
                    console.error(
                        "Socket connection error:",
                        connectionError
                    );

                    setError(
                        "Could not connect to the meeting server."
                    );

                    setJoining(false);

                    stream
                        .getTracks()
                        .forEach((track) =>
                            track.stop()
                        );
                }
            );

            socket.on(
                "connect",
                () => {
                    console.log(
                        "Socket connected:",
                        socket.id
                    );

                    socket.emit(
                        "join-room",
                        {
                            meetingId,
                            participantName:
                                name,
                        }
                    );

                    sendMediaState();

                    setJoined(true);
                    setJoining(false);
                }
            );
        } catch (joinError) {
            console.error(
                "Error joining meeting:",
                joinError
            );

            setError(
                "Could not connect to the meeting room server."
            );

            setJoining(false);
        }
    };

    /* =========================================================
       MICROPHONE
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
                    if (!stream) {
                        stream = new MediaStream();
                        localStreamRef.current = stream;
                    }
                    stream.addTrack(newAudioTrack);
                    Object.values(audioSendersRef.current).forEach((sender) => {
                        sender.replaceTrack(newAudioTrack).catch(() => {});
                    });
                    setMicEnabled(true);
                    return;
                }
            } catch (err) {
                console.error("Could not dynamically acquire microphone:", err);
                return;
            }
        }

        if (!stream) return;
        const audioTracks = stream.getAudioTracks();
        const nextState = !micEnabled;

        audioTracks.forEach((track) => {
            track.enabled = nextState;
        });

        setMicEnabled(nextState);
    };

    /* =========================================================
       CAMERA
    ========================================================= */

    const toggleCamera =
        async () => {
            const stream =
                localStreamRef.current;

            if (!stream) {
                return;
            }

            /*
             * CAMERA OFF
             */
            if (cameraEnabled) {
                const cameraTrack =
                    stream
                        .getVideoTracks()
                        .find(
                            (track) =>
                                track.readyState ===
                                "live"
                        );

                /*
                 * Stop sending camera to
                 * every participant.
                 */
                await Promise.all(
                    Object.values(
                        videoSendersRef.current
                    ).map(
                        async (sender) => {
                            try {
                                await sender.replaceTrack(
                                    null
                                );
                            } catch (error) {
                                console.error(
                                    "Could not disable camera sender:",
                                    error
                                );
                            }
                        }
                    )
                );

                /*
                 * Release the physical camera.
                 */
                if (cameraTrack) {
                    cameraTrack.stop();

                    stream.removeTrack(
                        cameraTrack
                    );
                }

                cameraEnabledRef.current =
                    false;

                setCameraEnabled(false);

                /*
                 * Remove own camera preview.
                 */
                setLocalPreviewStream(
                    null
                );

                /*
                 * Tell remote participants.
                 */
                sendMediaState({
                    cameraEnabled: false,
                    screenSharing:
                        screenSharingRef.current,
                });

                return;
            }

            /*
             * CAMERA ON
             */
            try {
                const newCameraStream =
                    await navigator.mediaDevices.getUserMedia(
                        {
                            video: true,
                        }
                    );

                const newCameraTrack =
                    newCameraStream.getVideoTracks()[0];

                if (!newCameraTrack) {
                    return;
                }

                /*
                 * Add the new camera track
                 * to our real local stream.
                 */
                stream.addTrack(
                    newCameraTrack
                );

                /*
                 * Put the camera into the
                 * existing WebRTC senders.
                 */
                await Promise.all(
                    Object.values(
                        videoSendersRef.current
                    ).map(
                        async (sender) => {
                            try {
                                await sender.replaceTrack(
                                    newCameraTrack
                                );
                            } catch (error) {
                                console.error(
                                    "Could not restore camera sender:",
                                    error
                                );
                            }
                        }
                    )
                );

                cameraEnabledRef.current =
                    true;

                setCameraEnabled(true);

                /*
                 * Restore local preview.
                 */
                setLocalPreviewStream(
                    stream
                );

                /*
                 * Tell remote participants.
                 */
                sendMediaState({
                    cameraEnabled: true,
                    screenSharing:
                        screenSharingRef.current,
                });
            } catch (error) {
                console.error(
                    "Camera restart error:",
                    error
                );

                setError(
                    "Could not turn the camera back on."
                );
            }
        };

    /* =========================================================
       START SCREEN SHARING
    ========================================================= */

    const startScreenSharing = async () => {
        try {
            const screenStream =
                await navigator.mediaDevices.getDisplayMedia({
                    video: true,
                    audio: false,
                });

            const screenTrack =
                screenStream.getVideoTracks()[0];

            if (!screenTrack) {
                screenStream.getTracks().forEach((track) => {
                    track.stop();
                });

                return;
            }

            screenStreamRef.current = screenStream;

            /*
             * Replace the current camera video
             * with the screen for every participant.
             */
            const senders = Object.values(
                videoSendersRef.current
            );

            await Promise.all(
                senders.map(async (sender) => {
                    try {
                        await sender.replaceTrack(screenTrack);
                    } catch (error) {
                        console.error(
                            "Could not replace camera with screen:",
                            error
                        );
                    }
                })
            );

            /*
             * Show the screen on our own side.
             */
            setLocalPreviewStream(screenStream);

            screenSharingRef.current = true;
            setIsScreenSharing(true);

            /*
             * Tell other participants that
             * we are sharing our screen.
             */
            sendMediaState({
                cameraEnabled: cameraEnabledRef.current,
                screenSharing: true,
            });

            /*
             * Browser's native "Stop sharing"
             * button triggers this automatically.
             */
            screenTrack.onended = () => {
                void stopScreenSharing();
            };
        } catch (error) {
            console.error(
                "Screen sharing was cancelled or failed:",
                error
            );
        }
    };

    /* =========================================================
       STOP SCREEN SHARING
    ========================================================= */

    const stopScreenSharing = async () => {
        const screenStream =
            screenStreamRef.current;

        if (screenStream) {
            screenStream.getTracks().forEach((track) => {
                track.stop();
            });

            screenStreamRef.current = null;
        }

        /*
         * Find the current camera track.
         */
        const cameraStream =
            localStreamRef.current;

        const cameraTrack =
            cameraStream
                ?.getVideoTracks()
                .find(
                    (track) =>
                        track.readyState === "live"
                );

        /*
         * Restore camera OR remove video.
         */
        const senders = Object.values(
            videoSendersRef.current
        );

        await Promise.all(
            senders.map(async (sender) => {
                try {
                    if (
                        cameraEnabledRef.current &&
                        cameraTrack
                    ) {
                        await sender.replaceTrack(
                            cameraTrack
                        );
                    } else {
                        await sender.replaceTrack(null);
                    }
                } catch (error) {
                    console.error(
                        "Could not restore video after screen sharing:",
                        error
                    );
                }
            })
        );

        screenSharingRef.current = false;
        setIsScreenSharing(false);

        /*
         * Restore our own preview.
         */
        if (
            cameraEnabledRef.current &&
            cameraStream &&
            cameraTrack
        ) {
            setLocalPreviewStream(
                cameraStream
            );
        } else {
            setLocalPreviewStream(null);
        }

        /*
         * Tell other participants.
         */
        sendMediaState({
            cameraEnabled:
                cameraEnabledRef.current,
            screenSharing: false,
        });
    };

    /* =========================================================
       SCREEN BUTTON
    ========================================================= */

    const toggleScreenShare =
        async () => {
            if (isScreenSharing) {
                await stopScreenSharing();
            } else {
                await startScreenSharing();
            }
        };

    /* =========================================================
       LEAVE MEETING
    ========================================================= */

    const leaveMeeting =
        () => {
            /*
             * Close WebRTC.
             */
            Object.values(
                peerConnectionsRef.current
            ).forEach(
                (connection) => {
                    connection.close();
                }
            );

            /*
             * Stop camera/mic.
             */
            localStreamRef.current
                ?.getTracks()
                .forEach(
                    (track) =>
                        track.stop()
                );

            /*
             * Stop screen.
             */
            screenStreamRef.current
                ?.getTracks()
                .forEach(
                    (track) =>
                        track.stop()
                );

            /*
             * Close data channels.
             */
            Object.values(
                dataChannelsRef.current
            ).forEach(
                (channel) => {
                    channel.close();
                }
            );

            socketRef.current?.disconnect();

            peerConnectionsRef.current =
                {};

            videoSendersRef.current =
                {};

            dataChannelsRef.current =
                {};

            remoteStreamsRef.current =
                {};

            pendingIceCandidatesRef.current =
                {};

            router.push("/dashboard");
        };

    /* =========================================================
       CLEANUP
    ========================================================= */

    useEffect(() => {
        return () => {
            Object.values(
                peerConnectionsRef.current
            ).forEach(
                (connection) => {
                    connection.close();
                }
            );

            localStreamRef.current
                ?.getTracks()
                .forEach(
                    (track) =>
                        track.stop()
                );

            screenStreamRef.current
                ?.getTracks()
                .forEach(
                    (track) =>
                        track.stop()
                );

            Object.values(
                dataChannelsRef.current
            ).forEach(
                (channel) => {
                    channel.close();
                }
            );

            socketRef.current?.disconnect();
        };
    }, []);

    /* =========================================================
       JOIN SCREEN
    ========================================================= */

    if (!joined) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-8">
                <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl sm:p-8">
                    <div className="mb-7 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-xl font-bold text-white">
                            V
                        </div>

                        <h1 className="mt-5 text-2xl font-bold text-white">
                            Join Meeting
                        </h1>

                        <p className="mt-2 text-sm text-slate-400">
                            Enter your name to join
                            this meeting.
                        </p>
                    </div>

                    <div className="rounded-2xl bg-slate-800/70 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Meeting ID
                        </p>

                        <p className="mt-2 break-all font-mono text-sm text-indigo-300">
                            {meetingId}
                        </p>
                    </div>

                    <div className="mt-5">
                        <label
                            htmlFor="participantName"
                            className="text-sm font-medium text-slate-300"
                        >
                            Your name
                        </label>

                        <input
                            id="participantName"
                            type="text"
                            value={participantName}
                            onChange={(event) =>
                                setParticipantName(
                                    event.target.value
                                )
                            }
                            onKeyDown={(event) => {
                                if (
                                    event.key ===
                                    "Enter"
                                ) {
                                    joinMeeting();
                                }
                            }}
                            placeholder="Enter your name"
                            autoComplete="name"
                            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                        />
                    </div>

                    {error && (
                        <div className="mt-4 rounded-xl border border-red-900/50 bg-red-950/40 px-4 py-3 text-sm text-red-300">
                            {error}
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={joinMeeting}
                        disabled={joining}
                        className="mt-6 w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {joining
                            ? "Joining..."
                            : "Join Meeting"}
                    </button>

                    <a
                        href="/dashboard"
                        className="mt-4 block text-center text-sm text-slate-500 transition hover:text-slate-300"
                    >
                        Back to dashboard
                    </a>
                </div>
            </main>
        );
    }

    /* =========================================================
       ACTIVE / PINNED PARTICIPANT CALCULATION (Image 2 Stage)
    ========================================================= */

    // Determine who is shown on the large main stage
    const activeRemote = remoteParticipants.find(
        (p) => p.socketId === pinnedSocketId
    ) || remoteParticipants[0];

    const isLocalPinned = pinnedSocketId === "local" || (!activeRemote && remoteParticipants.length === 0);

    return (
        <main className="relative flex h-[100dvh] min-h-0 flex-col overflow-hidden bg-[#0a0d14] text-white">
            {/* TOP HEADER (Exact Image 2 Style) */}
            <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800/80 bg-[#0d111a] px-3 sm:px-6 z-20">
                {/* Brand / Meeting Title */}
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-sm sm:text-base font-bold text-white tracking-wide flex items-center gap-2">
                            Meeting
                            <span className="hidden sm:inline-block text-xs font-semibold text-slate-400 bg-slate-800/70 px-2 py-0.5 rounded-md border border-slate-700/60">
                                {meetingId}
                            </span>
                        </h1>
                    </div>
                </div>

                {/* Right Actions: Participant Pill + Share Link + Dashboard + Log Out + Avatar */}
                <div className="flex items-center gap-2 sm:gap-3">
                    {/* Participant Avatar Stack Button (Image 2) */}
                    <button
                        type="button"
                        onClick={toggleParticipants}
                        className="flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:border-slate-700 hover:bg-slate-850 transition"
                    >
                        <div className="flex -space-x-2 overflow-hidden">
                            <span className="inline-block h-6 w-6 rounded-full ring-2 ring-slate-900 bg-blue-600 text-white text-[10px] font-bold text-center leading-6">
                                {(participantName || "Y").charAt(0).toUpperCase()}
                            </span>
                            {remoteParticipants.slice(0, 3).map((p, i) => (
                                <span
                                    key={p.socketId}
                                    className={`inline-block h-6 w-6 rounded-full ring-2 ring-slate-900 text-white text-[10px] font-bold text-center leading-6 ${
                                        i % 2 === 0 ? "bg-emerald-600" : "bg-purple-600"
                                    }`}
                                >
                                    {p.name.charAt(0).toUpperCase()}
                                </span>
                            ))}
                        </div>
                        <span className="hidden sm:inline text-xs font-semibold">
                            {1 + remoteParticipants.length} participants
                        </span>
                        <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {/* Share Link Pill (Image 2) */}
                    <button
                        type="button"
                        onClick={copyMeetingUrl}
                        className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-slate-700 hover:text-white"
                        title="Copy meeting link"
                    >
                        <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        <span className="hidden md:inline">{copiedUrl ? "Copied!" : "Share Link"}</span>
                    </button>

                    {/* Dashboard Pill (Image 2) */}
                    <a
                        href="/dashboard"
                        className="hidden sm:flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-slate-700 hover:text-white"
                    >
                        <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                        <span>Dashboard</span>
                    </a>

                    {/* Log Out Pill (Image 2) */}
                    <button
                        type="button"
                        onClick={leaveMeeting}
                        className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-slate-700 hover:text-white"
                    >
                        <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="hidden sm:inline">Log Out</span>
                    </button>

                    {/* User Profile Avatar */}
                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-xs text-white ring-2 ring-slate-800 shadow">
                        {(participantName || "U").charAt(0).toUpperCase()}
                    </div>
                </div>
            </header>

            {/* WORKSPACE BODY (STAGE & THUMBNAILS + SIDE PANEL) */}
            <div className="relative flex min-h-0 flex-1 overflow-hidden">
                {/* VIDEO GALLERY (Matching Image 2: Large Stage on Top + Horizontal Row on Bottom) */}
                <section className="relative min-h-0 flex-1 overflow-hidden p-2 sm:p-4 pb-28 sm:pb-28 flex flex-col gap-3">
                    {error && (
                        <div className="absolute left-3 right-3 top-3 z-50 rounded-xl border border-red-900/60 bg-red-950/95 px-4 py-3 text-sm text-red-300 shadow-xl backdrop-blur md:left-4 md:right-4">
                            {error}
                        </div>
                    )}

                    {remoteParticipants.length === 0 ? (
                        /* ONE USER WAITING STATE */
                        <div className="flex h-full min-h-0 w-full items-center justify-center">
                            <div className="flex h-full min-h-0 w-full max-w-4xl flex-col justify-center gap-3">
                                <div className="relative min-h-0 flex-1 rounded-2xl overflow-hidden border border-slate-800/80 shadow-2xl">
                                    <VideoTile
                                        stream={localPreviewStream}
                                        name={`${participantName} (You)`}
                                        muted
                                    />
                                </div>

                                <div className="shrink-0 rounded-2xl border border-slate-800/80 bg-slate-900/80 p-4 text-center backdrop-blur shadow-lg">
                                    <p className="text-sm font-semibold text-slate-200">
                                        Waiting for participants to join
                                    </p>
                                    <p className="mt-1 text-xs text-slate-400">
                                        Share meeting code <span className="font-mono text-blue-400 font-bold">{meetingId}</span> or link with your team.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={copyMeetingUrl}
                                        className="mt-3 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md transition hover:bg-blue-700"
                                    >
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                        <span>{copiedUrl ? "Link Copied!" : "Copy Meeting Link"}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* MULTI-USER STAGE + THUMBNAILS (Image 2) */
                        <div className="flex h-full min-h-0 w-full flex-col gap-3">
                            {/* LARGE STAGE VIDEO (Image 2 Top Stage) */}
                            <div className="relative min-h-0 flex-1 overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950 shadow-2xl">
                                {/* Pinned Badge */}
                                <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-xl border border-slate-700/60 bg-slate-950/70 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
                                    <span>📌</span>
                                    <span>Pinned</span>
                                </div>

                                {isLocalPinned ? (
                                    <VideoTile
                                        stream={localPreviewStream}
                                        name={`${participantName} (You)`}
                                        muted
                                        isScreen={isScreenSharing}
                                    />
                                ) : (
                                    activeRemote && (
                                        <VideoTile
                                            stream={activeRemote.stream}
                                            name={
                                                activeRemote.screenSharing
                                                    ? `${activeRemote.name} · Screen`
                                                    : activeRemote.name
                                            }
                                            isScreen={activeRemote.screenSharing}
                                            micEnabled={activeRemote.cameraEnabled !== false}
                                        />
                                    )
                                )}
                            </div>

                            {/* BOTTOM HORIZONTAL THUMBNAIL ROW (Image 2 Bottom Row) */}
                            <div className="flex h-32 sm:h-40 shrink-0 gap-3 overflow-x-auto pb-1 scrollbar-thin">
                                {/* You / Host Thumbnail */}
                                <div
                                    onClick={() => setPinnedSocketId("local")}
                                    className={`relative h-full w-48 sm:w-60 shrink-0 cursor-pointer overflow-hidden rounded-2xl border transition-all hover:border-blue-500/80 ${
                                        isLocalPinned
                                            ? "border-blue-500 ring-2 ring-blue-500/30"
                                            : "border-slate-800/80 bg-slate-900/60"
                                    }`}
                                >
                                    <div className="absolute top-2 left-2 z-10 rounded-md bg-blue-600/90 px-1.5 py-0.5 text-[10px] font-bold text-white shadow">
                                        Host
                                    </div>
                                    <VideoTile
                                        stream={localPreviewStream}
                                        name="You"
                                        muted
                                    />
                                </div>

                                {/* Remote Participant Thumbnails */}
                                {remoteParticipants.map((p) => {
                                    const isCurrentPinned = !isLocalPinned && activeRemote?.socketId === p.socketId;
                                    return (
                                        <div
                                            key={p.socketId}
                                            onClick={() => setPinnedSocketId(p.socketId)}
                                            className={`relative h-full w-48 sm:w-60 shrink-0 cursor-pointer overflow-hidden rounded-2xl border transition-all hover:border-blue-500/80 ${
                                                isCurrentPinned
                                                    ? "border-blue-500 ring-2 ring-blue-500/30"
                                                    : "border-slate-800/80 bg-slate-900/60"
                                            }`}
                                        >
                                            <VideoTile
                                                stream={p.stream}
                                                name={p.screenSharing ? `${p.name} · Screen` : p.name}
                                                isScreen={p.screenSharing}
                                                micEnabled={p.cameraEnabled !== false}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </section>

                {/* RIGHT PANEL (Chat & People - Exact Image 2 Style) */}
                {sidePanel !== "none" && (
                    <aside className="absolute inset-y-0 right-0 z-30 flex w-full flex-col border-l border-slate-800 bg-[#0d111a]/98 shadow-2xl backdrop-blur-xl sm:static sm:w-80 md:w-96 pb-[84px]">
                        {/* Header: Chat / People title + ✕ button */}
                        <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-800/80 px-4">
                            <h2 className="text-sm font-bold text-white">
                                {sidePanel === "chat" ? "Chat" : `Participants (${1 + remoteParticipants.length})`}
                            </h2>
                            <button
                                type="button"
                                onClick={() => setSidePanel("none")}
                                aria-label="Close panel"
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Panel Content */}
                        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                            {sidePanel === "participants" && (
                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                                        <p className="text-xs font-semibold text-slate-300">Invite Participants</p>
                                        <p className="mt-1 text-[11px] text-slate-400">Share this meeting link to allow colleagues to join.</p>
                                        <button
                                            type="button"
                                            onClick={copyMeetingUrl}
                                            className="mt-2 w-full rounded-lg bg-slate-800 hover:bg-slate-700 py-1.5 text-xs font-semibold text-slate-200 transition"
                                        >
                                            {copiedUrl ? "✓ Link Copied" : "Copy Link"}
                                        </button>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                            In Room ({1 + remoteParticipants.length})
                                        </p>

                                        {/* You */}
                                        <div className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-950/40 p-2.5">
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                                                    {(participantName || "Y").charAt(0).toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="truncate text-xs font-semibold text-white">
                                                        {participantName || "You"} (You)
                                                    </p>
                                                    <p className="text-[10px] text-blue-400 font-medium">Host</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 text-xs">
                                                <span title={micEnabled ? "Mic on" : "Muted"}>
                                                    {micEnabled ? "🎙️" : "🔇"}
                                                </span>
                                                <span title={cameraEnabled ? "Camera on" : "Camera off"}>
                                                    {cameraEnabled ? "📹" : "🚫"}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Remote Participants */}
                                        {remoteParticipants.map((p) => (
                                            <div
                                                key={p.socketId}
                                                className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-950/40 p-2.5"
                                            >
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-700 text-xs font-bold text-white">
                                                        {p.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="truncate text-xs font-semibold text-white">
                                                            {p.name}
                                                        </p>
                                                        <p className="text-[10px] text-slate-400">
                                                            {p.screenSharing ? "Sharing screen" : "Participant"}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 text-xs">
                                                    <span title={p.cameraEnabled ? "Camera on" : "Camera off"}>
                                                        {p.cameraEnabled ? "📹" : "🚫"}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {sidePanel === "chat" && (
                                <div className="flex h-full flex-col">
                                    {/* Messages list (Matching Image 2 Chat Layout) */}
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                        {chatMessages.length === 0 ? (
                                            <div className="flex h-48 flex-col items-center justify-center text-center text-slate-500">
                                                <svg className="h-8 w-8 text-slate-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                </svg>
                                                <p className="text-xs font-medium">No messages yet</p>
                                                <p className="text-[10px] text-slate-500 mt-0.5">Send a message to start the conversation.</p>
                                            </div>
                                        ) : (
                                            chatMessages.map((msg) => (
                                                <div key={msg.id} className="flex gap-2.5 items-start">
                                                    {/* Avatar circle */}
                                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 text-[10px] font-bold text-white shadow">
                                                        {msg.senderName.charAt(0).toUpperCase()}
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        {/* Header: Name in cyan/blue + to Everyone + time */}
                                                        <div className="flex items-center justify-between gap-1 text-[11px] mb-1">
                                                            <div className="flex items-center gap-1 truncate">
                                                                <span className="font-semibold text-blue-400 truncate">
                                                                    {msg.senderName}
                                                                </span>
                                                                <span className="text-[10px] text-slate-400">
                                                                    to Everyone
                                                                </span>
                                                            </div>
                                                            <span className="text-[10px] text-slate-500 shrink-0">
                                                                {msg.time}
                                                            </span>
                                                        </div>

                                                        {/* Message Bubble Card */}
                                                        <div
                                                            className={`rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                                                                msg.isSelf
                                                                    ? "bg-slate-800 text-slate-100 border border-slate-700/80"
                                                                    : "bg-slate-850/90 text-slate-200 border border-slate-700/60"
                                                            }`}
                                                        >
                                                            {msg.text}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* Chat Input Bar (Matching Image 2 Bottom) */}
                                    <form
                                        onSubmit={sendChatMessage}
                                        className="shrink-0 border-t border-slate-800/80 p-3 bg-slate-950/90 space-y-2"
                                    >
                                        {/* To: Everyone pill selector */}
                                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                                            <span>To:</span>
                                            <span className="inline-flex items-center gap-1 rounded-md bg-blue-600/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 font-medium">
                                                Everyone
                                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </span>
                                        </div>

                                        {/* Input Box with Action Buttons */}
                                        <div className="relative flex items-center">
                                            <input
                                                type="text"
                                                value={chatInput}
                                                onChange={(e) => setChatInput(e.target.value)}
                                                placeholder="Type your message..."
                                                className="w-full rounded-xl border border-slate-700/80 bg-slate-900 pl-3 pr-20 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
                                            />
                                            <div className="absolute right-2 flex items-center gap-1 text-slate-400">
                                                <button
                                                    type="button"
                                                    onClick={() => setChatInput((prev) => prev + "📎 ")}
                                                    className="p-1 hover:text-white transition"
                                                    title="Attach file"
                                                >
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                    </svg>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setChatInput((prev) => prev + "😊")}
                                                    className="p-1 hover:text-white transition"
                                                    title="Emoji"
                                                >
                                                    <span className="text-xs">😊</span>
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={!chatInput.trim()}
                                                    aria-label="Send message"
                                                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white transition hover:bg-blue-700 disabled:opacity-30"
                                                >
                                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    </aside>
                )}
            </div>

            {/* FLOATING EMOJI REACTIONS (From Reaction bar) */}
            <div className="pointer-events-none absolute bottom-24 right-8 z-50 flex flex-col gap-2">
                {reactions.map((r) => (
                    <div
                        key={r.id}
                        className="animate-bounce text-4xl shadow-xl transition-all duration-700"
                    >
                        {r.emoji}
                    </div>
                ))}
            </div>

            {/* FLOATING BOTTOM CONTROLS (Exact Image 2 Style) */}
            <div className="absolute bottom-0 left-0 right-0 z-40 flex min-h-[72px] items-center justify-center border-t border-slate-800/80 bg-[#0d111a]/95 px-2 py-2.5 backdrop-blur-xl sm:min-h-[78px] sm:px-4">
                <MeetingControls
                    micEnabled={micEnabled}
                    cameraEnabled={cameraEnabled}
                    isScreenSharing={isScreenSharing}
                    onToggleMic={toggleMic}
                    onToggleCamera={toggleCamera}
                    onToggleScreen={toggleScreenShare}
                    onLeave={leaveMeeting}
                    onToggleChat={toggleChat}
                    isChatOpen={sidePanel === "chat"}
                    unreadChatCount={unreadChatCount}
                    onToggleParticipants={toggleParticipants}
                    isParticipantsOpen={sidePanel === "participants"}
                    participantCount={1 + remoteParticipants.length}
                    onSendReaction={sendReaction}
                />
            </div>
        </main>
    );
}
