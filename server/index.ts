import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();

const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // JOIN ROOM
    socket.on(
        "join-room",
        ({
            meetingId,
            participantName,
        }: {
            meetingId: string;
            participantName: string;
        }) => {
            console.log(
                `${participantName} joined meeting ${meetingId}`
            );

            socket.join(meetingId);

            const room =
                io.sockets.adapter.rooms.get(meetingId);

            const existingUsers = room
                ? Array.from(room)
                    .filter((id) => id !== socket.id)
                    .map((id) => {
                        const userSocket =
                            io.sockets.sockets.get(id);

                        return {
                            socketId: id,
                            participantName:
                                userSocket?.data?.participantName ||
                                "Participant",
                        };
                    })
                : [];

            socket.emit(
                "existing-users",
                existingUsers
            );

            socket.to(meetingId).emit(
                "user-joined",
                {
                    socketId: socket.id,
                    participantName,
                }
            );

            socket.data.meetingId = meetingId;
            socket.data.participantName =
                participantName;
        }
    );

    // WEBRTC OFFER
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

    // WEBRTC ANSWER
    socket.on(
        "answer",
        ({
            target,
            answer,
        }: {
            target: string;
            answer: unknown;
        }) => {
            io.to(target).emit("answer", {
                sender: socket.id,
                answer,
            });
        }
    );

    // ICE CANDIDATE
    socket.on(
        "ice-candidate",
        ({
            target,
            candidate,
        }: {
            target: string;
            candidate: unknown;
        }) => {
            io.to(target).emit(
                "ice-candidate",
                {
                    sender: socket.id,
                    candidate,
                }
            );
        }
    );

    // DISCONNECT
    socket.on("disconnect", () => {
        console.log(
            "User disconnected:",
            socket.id
        );

        const meetingId =
            socket.data?.meetingId;

        if (meetingId) {
            socket
                .to(meetingId)
                .emit("user-left", {
                    socketId: socket.id,
                });
        }
    });
});

const PORT = 4000;

httpServer.listen(PORT, () => {
    console.log(
        `Socket.IO server running on http://localhost:${PORT}`
    );
});