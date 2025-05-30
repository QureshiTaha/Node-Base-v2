const { Server } = require("socket.io");
const chatUseCases = require("../controllers/chats/chatUseCase");
const moment = require("moment");
const notification = require("./notification");

let io;
const onlineUsers = {}; // key: userID, value: socket.id

const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "*", // Allow all or restrict based on your frontend origin
        },
    });
    // Loaded socket.io
    console.log("Socket.io loaded");


    io.on("connection", (socket) => {
        console.log("️‍🔥 Socket connected:", socket.id);

        // Join a chat room
        socket.on("joinRoom", ({ chatID }) => {
            socket.join(chatID);
            console.log(`🧲 Socket ${socket.id} joined room: ${chatID}`);
        });

        // Join a personal room [ChatList]
        socket.on("joinChatList", ({ userID }) => {
            if (userID) {
                socket.join(`user_${userID}`);
                onlineUsers[userID] = socket.id;
                console.log(`🧲 User ${userID} connected to ChatList: user_${userID}`);
            }
        });


        socket.on("seenThisMessage", async ({ messageID, chatID, userID }) => {
            console.log(`✌️ Msg ${messageID} seen by user ${userID} in chat ${chatID}`);
            socket.to(chatID).emit("messageSeen", { messageID, chatID, userID });
            // UpdateDatabase
            await chatUseCases.markMessageAsSeenByID({ messageID, chatID, userID });
        });
        socket.on("readMessage", async ({ messageID, chatID, userID }) => {
            console.log(`✌️ Msg ${messageID} read by user ${userID} in chat ${chatID}`);
            socket.to(chatID).emit("messageReadAll", { messageID, chatID, userID });
            // UpdateDatabase

            await chatUseCases.markAllPreviousReadByReceiverID({ chatID, receiverID: userID });

        });


        socket.on("sendMessage", async (data) => {
            try {
                var messageID = data.messageID || null;

                if (!data.messageID) {
                    const result = await chatUseCases.sendMessage(data);

                    if (result.success) {
                        messageID = result.data[0].messageID;
                    } else {
                        socket.emit("errorMessage", result.message);
                        return;
                    }
                }

                const message = {
                    messageID: messageID,
                    ...data,
                    timestamp: moment().format("YYYY-MM-DD HH:mm:ss"),
                };

                socket.to(data.chatID).emit("newMessage", message);
                socket.emit("messageSent", message);  // Confirm to the sender

                const chatMembers = await chatUseCases.getChatParticipants({ chatID: data.chatID });


                if (chatMembers.success) {
                    chatMembers.data.forEach((member) => {
                        if (member.userID !== data.senderID) {
                            const recipientSocketId = onlineUsers[member.userID];
                            console.log("recipientSocketId", recipientSocketId);
                            if (recipientSocketId) {
                                console.log("Sended via socket");

                                socket.to(`user_${member.userID}`).emit("chatListUpdate", message);
                            } else {
                                // ❗ User is offline — send push notification
                                console.log("sended via Notif");

                                notification.push({
                                    title: "New Message",
                                    body: `${message.message ? message.message : "You have a new message"}`,
                                    userID: member.userID,
                                    data: { chatID: data.chatID, messageID, senderID: data.senderID, receiverID: member.userID },
                                }
                                );
                            }
                        }
                    });

                }

            } catch (error) {
                console.error("Error sending message:", error);
                socket.emit("errorMessage", "An error occurred while sending the message.");
            }
        });


        // Optional: handle typing indicator
        socket.on("typing", ({ chatID, userID }) => {
            socket.to(chatID).emit("typing", { userID });
        });

        socket.on("stopTyping", ({ chatID, userID }) => {
            socket.to(chatID).emit("stopTyping", { userID });
        });

        // Handle msg seen
        socket.on("messageSeen", async (data) => {
            try {
                await chatUseCases.markMessageAsSeen(data);
                console.log("Message seen:", data.messageID);
            } catch (error) {
                console.error("Error marking message as seen:", error);
            }
        });



        socket.on("disconnect", () => {
            console.log("Socket disconnected:", socket.id);
            for (const userID in onlineUsers) {
                if (onlineUsers[userID] === socket.id) {
                    delete onlineUsers[userID];
                    break;
                }
            }
        });
    });
};

module.exports = { initializeSocket };
