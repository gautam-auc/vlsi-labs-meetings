import { createServer } from "http";
import { Server } from "socket.io";

const ROOM_ID_PATTERN = /^VLSI-[A-Z0-9]{8}$/;
const allowedOrigins = (process.env.SOCKET_CORS_ORIGINS || "http://localhost:3000,https://vlsi-labs-meetings.vercel.app")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

function socketsShareRoom(sourceId: string, targetId: string): boolean {
    const source = io.sockets.sockets.get(sourceId);
    const target = io.sockets.sockets.get(targetId);
    const roomId = source?.data?.meetingId;
    return Boolean(roomId && target?.data?.meetingId === roomId);
}

const httpServer = createServer((req, res) => {
    if (req.url === "/" || req.url === "/health") {
        res.writeHead(200, {
            "Content-Type": "text/plain",
        });

        res.end("VLSI Labs Meetings Socket Server is running.");
        return;
    }

    res.writeHead(404, {
        "Content-Type": "text/plain",
    });

    res.end("Not Found");
});

const io = new Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
    },
    pingInterval: 8000,
    pingTimeout: 10000,
});

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on(
        "join-room",
        ({
            meetingId,
            participantName,
        }: {
            meetingId: string;
            participantName: string;
        }) => {
            const cleanMeetingId = (meetingId || "").trim().toUpperCase();
            const cleanName = (participantName || "Participant").trim().slice(0, 80) || "Participant";
            if (!ROOM_ID_PATTERN.test(cleanMeetingId)) {
                socket.emit("room-error", { message: "Invalid meeting link." });
                return;
            }
            console.log(
                `${cleanName} (${socket.id}) joining meeting ${cleanMeetingId}`
            );

            socket.join(cleanMeetingId);

            const room = io.sockets.adapter.rooms.get(cleanMeetingId);

            const existingUsers = room
                ? Array.from(room)
                      .filter((id) => id !== socket.id)
                      .map((id) => {
                          const userSocket = io.sockets.sockets.get(id);

                          return {
                              socketId: id,
                              participantName:
                                  userSocket?.data?.participantName ||
                                  "Participant",
                          };
                      })
                      .filter((u) => {
                          const s = io.sockets.sockets.get(u.socketId);
                          return s && s.connected;
                      })
                : [];

            socket.emit("existing-users", existingUsers);

            socket.to(cleanMeetingId).emit("user-joined", {
                socketId: socket.id,
                participantName: cleanName,
            });

            socket.data.meetingId = cleanMeetingId;
            socket.data.participantName = cleanName;
        }
    );

    socket.on(
        "offer",
        ({
            target,
            offer,
            participantName,
        }: {
            target: string;
            offer: unknown;
            participantName?: string;
        }) => {
            if (!target || !socketsShareRoom(socket.id, target)) return;
            io.to(target).emit("offer", {
                sender: socket.id,
                offer,
                participantName:
                    participantName ||
                    socket.data?.participantName ||
                    "Participant",
            });
        }
    );

    socket.on(
        "answer",
        ({
            target,
            answer,
        }: {
            target: string;
            answer: unknown;
        }) => {
            if (!target || !socketsShareRoom(socket.id, target)) return;
            io.to(target).emit("answer", {
                sender: socket.id,
                answer,
            });
        }
    );

    socket.on(
        "ice-candidate",
        ({
            target,
            candidate,
        }: {
            target: string;
            candidate: unknown;
        }) => {
            if (!target || !socketsShareRoom(socket.id, target)) return;
            io.to(target).emit(
                "ice-candidate",
                {
                    sender: socket.id,
                    candidate,
                }
            );
        }
    );

    socket.on(
        "chat-message",
        (data: {
            meetingId: string;
            senderName: string;
            text: string;
            time?: string;
        }) => {
            const roomId = socket.data?.meetingId;
            const message = typeof data?.text === "string" ? data.text.trim().slice(0, 2000) : "";
            if (roomId && message) {
                socket.to(roomId).emit("chat-message", {
                    id: `${Date.now()}-${socket.id}`,
                    senderName:
                        data.senderName ||
                        socket.data?.participantName ||
                        "Participant",
                    text: message,
                    time:
                        data.time ||
                        new Date().toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                        }),
                });
            }
        }
    );

    socket.on(
        "media-state",
        (data: {
            meetingId?: string;
            cameraEnabled?: boolean;
            screenSharing?: boolean;
        }) => {
            const meetingId = socket.data?.meetingId;
            if (meetingId) {
                socket.to(meetingId).emit("media-state", {
                    socketId: socket.id,
                    cameraEnabled: data.cameraEnabled,
                    screenSharing: data.screenSharing,
                });
            }
        }
    );

    socket.on("leave-room", () => {
        const meetingId = socket.data?.meetingId;
        if (meetingId) {
            console.log(`User ${socket.id} explicitly left room ${meetingId}`);
            socket.leave(meetingId);
            socket.to(meetingId).emit("user-left", {
                socketId: socket.id,
            });
            delete socket.data.meetingId;
        }
    });

    socket.on("disconnect", () => {
        console.log(
            "User disconnected:",
            socket.id
        );

        const meetingId =
            socket.data?.meetingId;

        if (meetingId) {
            socket.to(meetingId).emit(
                "user-left",
                {
                    socketId: socket.id,
                }
            );
        }
    });
});

const PORT =
    Number(process.env.PORT) || 4000;

httpServer.listen(
    PORT,
    "0.0.0.0",
    () => {
        console.log(
            `Socket.IO server running on port ${PORT}`
        );
    }
);
