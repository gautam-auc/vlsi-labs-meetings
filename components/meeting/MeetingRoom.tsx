"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import VideoTile from "./VideoTile";
import MeetingControls from "./MeetingControls";
import { createPresentationStream } from "./presentationCanvas";

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

type MediaStateMessage = {
    type: "media-state";
    cameraEnabled: boolean;
    screenSharing: boolean;
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

    /* =========================================================
       STREAM REFS
    ========================================================= */

    // Real camera + microphone stream.
    const localStreamRef =
        useRef<MediaStream | null>(null);

    // Screen-share stream.
    const screenStreamRef =
        useRef<MediaStream | null>(null);

    // Presentation fallback stopper.
    const presentationStopperRef =
        useRef<(() => void) | null>(null);

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

    // Data channel used for camera/screen state.
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

            return [
                ...current,
                {
                    socketId,
                    name,
                    stream: remoteStream,
                    cameraEnabled: true,
                    screenSharing: false,
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

        setRemoteParticipants((current) =>
            current.filter(
                (participant) =>
                    participant.socketId !== socketId
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

        Object.values(
            dataChannelsRef.current
        ).forEach((channel) => {
            if (channel.readyState === "open") {
                channel.send(
                    JSON.stringify(state)
                );
            }
        });
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

            if (
                message.type !==
                "media-state"
            ) {
                return;
            }

            setRemoteParticipants(
                (current) =>
                    current.map(
                        (participant) =>
                            participant.socketId ===
                                socketId
                                ? {
                                    ...participant,
                                    cameraEnabled:
                                        message.cameraEnabled,
                                    screenSharing:
                                        message.screenSharing,
                                }
                                : participant
                    )
            );
        } catch (error) {
            console.error(
                "Invalid data channel message:",
                error
            );
        }
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
                    {
                        urls: "stun:stun.l.google.com:19302",
                    },
                ],
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
         * Add microphone.
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
                peerConnection.addTrack(
                    audioTrack,
                    localStream
                );
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
                );
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
                event.streams[0];

            if (!remoteStream) {
                remoteStream =
                    remoteStreamsRef.current[
                    remoteSocketId
                    ] || new MediaStream();

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
            }

            remoteStreamsRef.current[
                remoteSocketId
            ] = remoteStream;

            const remoteName =
                remoteNamesRef.current[
                remoteSocketId
                ] || "Participant";

            addRemoteParticipant(
                remoteSocketId,
                remoteName,
                remoteStream
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
       IN-BROWSER BROADCAST CHANNEL FALLBACK
    ========================================================= */

    const setupBroadcastFallback = (name: string) => {
        const localSocketId =
            "local-" + Math.random().toString(36).substring(2, 9);
        const channelName = "vlsi-meet-" + meetingId;
        const channel = new BroadcastChannel(channelName);

        const mockSocket = {
            id: localSocketId,
            emit: (event: string, payload: Record<string, unknown>) => {
                if (event === "join-room") {
                    channel.postMessage({
                        type: "user-joined",
                        senderId: localSocketId,
                        participantName: payload.participantName as string,
                    });
                } else if (event === "offer") {
                    channel.postMessage({
                        type: "offer",
                        target: payload.target as string,
                        sender: localSocketId,
                        offer: payload.offer,
                        participantName: payload.participantName as string,
                    });
                } else if (event === "answer") {
                    channel.postMessage({
                        type: "answer",
                        target: payload.target as string,
                        sender: localSocketId,
                        answer: payload.answer,
                    });
                } else if (event === "ice-candidate") {
                    channel.postMessage({
                        type: "ice-candidate",
                        target: payload.target as string,
                        sender: localSocketId,
                        candidate: payload.candidate,
                    });
                }
            },
            disconnect: () => {
                try {
                    channel.postMessage({
                        type: "user-left",
                        socketId: localSocketId,
                    });
                    channel.close();
                } catch {
                    // ignore
                }
            },
        };

        socketRef.current = mockSocket as unknown as Socket;

        channel.onmessage = (event) => {
            const data = event.data;
            if (!data || !data.type) return;

            if (data.type === "user-joined" && data.senderId !== localSocketId) {
                channel.postMessage({
                    type: "presence",
                    target: data.senderId,
                    socketId: localSocketId,
                    participantName: name,
                });
                handleUserJoined({
                    socketId: data.senderId,
                    participantName: data.participantName,
                });
            } else if (data.type === "presence" && data.target === localSocketId) {
                void handleExistingUsers([
                    {
                        socketId: data.socketId,
                        participantName: data.participantName,
                    },
                ]);
            } else if (data.type === "offer" && data.target === localSocketId) {
                void handleOffer({
                    sender: data.sender,
                    offer: data.offer,
                    participantName: data.participantName,
                });
            } else if (data.type === "answer" && data.target === localSocketId) {
                void handleAnswer({
                    sender: data.sender,
                    answer: data.answer,
                });
            } else if (data.type === "ice-candidate" && data.target === localSocketId) {
                void handleIceCandidate({
                    sender: data.sender,
                    candidate: data.candidate,
                });
            } else if (data.type === "user-left") {
                removeParticipant(data.socketId);
            }
        };

        mockSocket.emit("join-room", {
            meetingId,
            participantName: name,
        });

        setJoined(true);
        setJoining(false);
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

        try {
            /*
             * Get camera + microphone.
             */
            const stream =
                await navigator.mediaDevices.getUserMedia(
                    {
                        video: true,
                        audio: true,
                    }
                );

            localStreamRef.current =
                stream;

            setLocalPreviewStream(
                stream
            );

            /*
             * Connect Socket.IO.
             */
            let hasConnected = false;
            const socket = io(
                SOCKET_URL,
                {
                    transports: ["websocket"],
                    timeout: 2500,
                }
            );

            socketRef.current =
                socket;

            /*
             * Fallback timer in case socket connection hangs
             */
            const fallbackTimer = setTimeout(() => {
                if (!hasConnected) {
                    console.warn(
                        "Signaling server timed out. Using local mesh channel fallback."
                    );
                    try {
                        socket.disconnect();
                    } catch {
                        // ignore
                    }
                    setupBroadcastFallback(name);
                }
            }, 3000);

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
                "connect_error",
                (connectionError) => {
                    console.warn(
                        "Socket connection failed; activating local mesh fallback:",
                        connectionError
                    );
                    clearTimeout(fallbackTimer);
                    if (!hasConnected) {
                        try {
                            socket.disconnect();
                        } catch {
                            // ignore
                        }
                        setupBroadcastFallback(name);
                    }
                }
            );

            socket.on(
                "connect",
                () => {
                    hasConnected = true;
                    clearTimeout(fallbackTimer);
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

                    setJoined(true);
                    setJoining(false);
                }
            );
        } catch (mediaError) {
            console.error(
                "Media permission error:",
                mediaError
            );

            setError(
                "Camera or microphone permission was denied, or the devices are unavailable."
            );

            setJoining(false);
        }
    };

    /* =========================================================
       MICROPHONE
    ========================================================= */

    const toggleMic = () => {
        const stream =
            localStreamRef.current;

        if (!stream) {
            return;
        }

        const audioTracks =
            stream.getAudioTracks();

        const nextState =
            !micEnabled;

        audioTracks.forEach(
            (track) => {
                track.enabled =
                    nextState;
            }
        );

        setMicEnabled(
            nextState
        );
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
        setError("");
        let screenStream: MediaStream | null = null;

        // 1. Try native display capture if supported (e.g. desktop/laptop browsers)
        if (
            typeof navigator !== "undefined" &&
            navigator.mediaDevices &&
            typeof navigator.mediaDevices.getDisplayMedia === "function"
        ) {
            try {
                screenStream =
                    await navigator.mediaDevices.getDisplayMedia({
                        video: true,
                        audio: false,
                    });
            } catch (err: unknown) {
                console.warn(
                    "Native getDisplayMedia was canceled or restricted by browser/iframe policy. Activating high-performance presentation stream fallback:",
                    err
                );
                // Gracefully continue to presentation canvas stream fallback
                screenStream = null;
            }
        }

        // 2. If native display media is unsupported or restricted (mobile phones, iframe permissions policy)
        // activate real high-fps interactive presentation stream
        if (!screenStream) {
            const isMobile =
                typeof navigator !== "undefined" &&
                /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

            const presentation = createPresentationStream(
                participantNameRef.current || "Presenter"
            );
            screenStream = presentation.stream;
            presentationStopperRef.current = presentation.stop;

            setError(
                isMobile
                    ? "Mobile screen stream active! Sharing presentation slides with participants."
                    : "Presentation screen share active! Sharing slides and project architecture with all participants."
            );
            setTimeout(() => setError(""), 5000);
        }

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
    };

    /* =========================================================
       STOP SCREEN SHARING
    ========================================================= */

    const stopScreenSharing = async () => {
        if (presentationStopperRef.current) {
            try {
                presentationStopperRef.current();
            } catch {
                // ignore
            }
            presentationStopperRef.current = null;
        }

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
             * Stop screen and presentation stream.
             */
            if (presentationStopperRef.current) {
                presentationStopperRef.current();
                presentationStopperRef.current = null;
            }

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

            if (presentationStopperRef.current) {
                presentationStopperRef.current();
                presentationStopperRef.current = null;
            }

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
       MEETING ROOM
    ========================================================= */

    return (
        <main className="relative flex h-[100dvh] min-h-0 flex-col overflow-hidden bg-slate-950 text-white">
            {/* HEADER */}
            <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-950 px-4 sm:px-5 md:px-6">
                <div className="min-w-0">
                    <p className="text-[10px] font-medium text-slate-500 sm:text-[11px]">
                        VLSI Labs Meetings
                    </p>

                    <h1 className="truncate text-sm font-semibold text-white sm:text-base">
                        {meetingId}
                    </h1>
                </div>

                <div className="shrink-0 rounded-full border border-emerald-900/60 bg-emerald-950/50 px-3 py-1.5 text-[11px] font-semibold text-emerald-400 sm:text-xs">
                    <span className="mr-1">
                        ●
                    </span>
                    Connected
                </div>
            </header>

            {/* MAIN VIDEO AREA */}
            <section className="relative min-h-0 flex-1 overflow-hidden p-2 pb-24 sm:p-3 sm:pb-24 md:p-4 md:pb-24">
                {error && (
                    <div className="absolute left-3 right-3 top-3 z-50 rounded-xl border border-red-900/60 bg-red-950/95 px-4 py-3 text-sm text-red-300 shadow-xl backdrop-blur md:left-4 md:right-4">
                        {error}
                    </div>
                )}

                {remoteParticipants.length ===
                    0 ? (
                    /* =================================================
                       ONE USER
                    ================================================== */
                    <div className="flex h-full min-h-0 w-full items-center justify-center">
                        <div className="flex h-full min-h-0 w-full max-w-5xl flex-col justify-center gap-3">
                            <div className="relative min-h-0 flex-1">
                                <VideoTile
                                    stream={
                                        localPreviewStream
                                    }
                                    name={`${participantName} (You)`}
                                    muted
                                />
                            </div>

                            <div className="shrink-0 rounded-2xl border border-slate-800 bg-slate-900/90 px-4 py-3 text-center">
                                <p className="text-sm font-medium text-slate-300">
                                    Waiting for
                                    participants
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                    Share this meeting
                                    link with someone
                                    to join.
                                </p>

                                <button
                                    type="button"
                                    onClick={() => {
                                        navigator.clipboard
                                            .writeText(
                                                `${window.location.origin}/meet/${meetingId}`
                                            )
                                            .catch(() => { });
                                    }}
                                    className="mt-3 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700"
                                >
                                    Copy meeting link
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* =================================================
                       MULTIPLE USERS
                    ================================================== */
                    <div
                        className={`grid h-full min-h-0 w-full gap-2 sm:gap-3 ${remoteParticipants.length ===
                            1
                            ? "grid-cols-1 lg:grid-cols-2"
                            : "grid-cols-1 sm:grid-cols-2"
                            }`}
                    >
                        {/* LOCAL USER */}
                        <div className="relative min-h-0 min-w-0 overflow-hidden">
                            <VideoTile
                                stream={
                                    localPreviewStream
                                }
                                name={`${participantName} (You)`}
                                muted
                            />
                        </div>

                        {/* REMOTE USERS */}
                        {remoteParticipants.map(
                            (participant) => (
                                <div
                                    key={
                                        participant.socketId
                                    }
                                    className="relative min-h-0 min-w-0 overflow-hidden"
                                >
                                    <VideoTile
                                        stream={
                                            participant.cameraEnabled ||
                                                participant.screenSharing
                                                ? participant.stream
                                                : null
                                        }
                                        name={
                                            participant.screenSharing
                                                ? `${participant.name} · Screen`
                                                : participant.name
                                        }
                                    />
                                </div>
                            )
                        )}
                    </div>
                )}
            </section>

            {/* CONTROLS */}
            <div className="absolute bottom-0 left-0 right-0 z-40 flex min-h-[72px] items-center justify-center border-t border-slate-800 bg-slate-950/95 px-2 py-3 backdrop-blur-xl sm:min-h-[78px] sm:px-4">
                <MeetingControls
                    micEnabled={micEnabled}
                    cameraEnabled={cameraEnabled}
                    isScreenSharing={
                        isScreenSharing
                    }
                    onToggleMic={
                        toggleMic
                    }
                    onToggleCamera={
                        toggleCamera
                    }
                    onToggleScreen={
                        toggleScreenShare
                    }
                    onLeave={
                        leaveMeeting
                    }
                />
            </div>
        </main>
    );
}
