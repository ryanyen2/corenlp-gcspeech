const { Server } = require("socket.io");
const {
  startRecognitionStream,
  stopRecognitionStream,
  writeData,
} = require("./speechRecognition");
const {
  startPipeline,
  stopPipeline,
  getNLPOutput,
} = require("./coreNLP");

const currentNamespaces = null;
const currentRoom = null;

exports.startSocketIO = (server, options) => {
  // setup socket.io
  const io = new Server(server, { cors: { origin: "*" } });
  currentNamespaces = io.of(/^\/[a-zA-Z0-9_\/-]+$/);

  currentNamespaces.on("connection", (socket) => {
    const namespace = socket.nsp;
    const namespaceDir = namespace.name;

    socket.on("joinRoom", async (room) => {
      currentRoom = room;
      console.log(`${namespaceDir} joined room ${currentRoom}`);
      const roomDir = `${namespaceDir}/${currentRoom}`;
      const roomUsers = io.of(roomDir).connected;
      const roomUsersCount = roomUsers.length;
      const roomUsersNames = roomUsers.map((user) => user.id);
      console.log(`${roomDir} has ${roomUsersCount} users: ${roomUsersNames}`);
      socket.join(roomDir);
      socket.emit("roomUsers", roomUsersCount);
      socket.emit("roomUsersNames", roomUsersNames);
    });

    socket.on("NLP_START", () => startPipeline());
    socket.on("NLP_STOP", () => stopPipeline());
    socket.on("NLP_TEXT", (text) => {
      console.log(`NLP_Text: ${text}`);
      getNLPOutput(text, (err, output) => {
        if (err) {
          console.log(err);
          return;
        }
        socket.emit("NLP_OUTPUT", output);
      });
    });
    socket.on("startGoogleCloudStream", () => startRecognitionStream());
    socket.on("endGoogleCloudStream", () => stopRecognitionStream());
    socket.on("BINARY_DATA", (data) => writeData(data));
  });

  currentNamespaces = null;
  currentRoom = null;
};

exports.emitInRoom = (event, data) => {
  currentNamespaces.in(currentRoom).emit(event, data);
};
