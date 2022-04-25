const http = require("http");
const SocketIO = require("socket.io");
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();
const port = 3000;

const requestMiddleware = (req, res, next) => {
  console.log(
    "[Ip address]:",
    req.ip,
    "[method]:",
    req.method,
    "Request URL:",
    req.originalUrl,
    " - ",
    new Date()
  );
  next();
};

// 각종 미들웨어
app.use(cors());
app.use(express.json());
app.use(express.urlencoded());
app.use(cookieParser());
app.use(requestMiddleware);
app.use(express.urlencoded({ extended: false }));

const httpServer = http.createServer(app);
const io = SocketIO(httpServer, { cors: { origin: "*" } });

let rooms = [];

io.on("connection", (socket) => {
  console.log("connection: ", socket.id);

  io.emit("roomList", rooms);

  socket.on("msg", (msg) => {
    console.log(msg);
    socket.broadcast.emit("msg", msg);
  });

  socket.on("msg", (msg, roomNum) => {
    console.log(msg);
    io.to(roomNum).broadcast.emit("msg", msg);
  });

  socket.on("joinRoom", (roomNum) => {
    socket.join(rooms.indexOf(roomNum));
  });

  socket.on("createRoom", (roomNum) => {
    rooms.push(roomNum);
  });

  socket.on("");

  socket.on("disconnect", function () {
    console.log("disconnect: ", socket.id);
  });
});

// 서버 열기
httpServer.listen(port, () => {
  console.log(port, "포트로 서버가 켜졌어요!");
});
