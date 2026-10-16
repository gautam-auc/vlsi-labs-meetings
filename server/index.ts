import { createServer } from "http";
import { Server } from "socket.io";

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
        origin: "*",
        methods: ["GET", "POST"],
    },
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
                                  userSocket?.data
                                      ?.participantName ||
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

    socket.on(
        "chat-message",
        (data: {
            meetingId: string;
            senderName: string;
            text: string;
            time?: string;
        }) => {
            if (data?.meetingId && data?.text) {
                socket.to(data.meetingId).emit("chat-message", {
                    id: `${Date.now()}-${socket.id}`,
                    senderName:
                        data.senderName ||
                        socket.data?.participantName ||
                        "Participant",
                    text: data.text,
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