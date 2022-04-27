const http = require("http");
const SocketIO = require("socket.io");
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { SocketAddress } = require("net");
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

  socket.on("main", (id) => {
    console.log(`아이디 받아오기: ${id}`);
    socket.userId = id;
  });

  socket.on("roomList", () => {
    console.log("roomList");
    io.emit("roomList", rooms);
  });

  socket.on("msg", (msg) => {
    console.log(`msg: ${msg}, id: ${socket.userId}`);
    io.to(socket.roomId).emit("msg", { msg, id: socket.userId });
  });

  socket.on("joinRoom", (roomSocketId, password) => {
    console.log(`${socket.userId}님이 ${roomSocketId}에 입장하셨습니다.`);
    for (let i = 0; i < rooms.length; i++) {
      if (rooms[i].socketId === roomSocketId) {
        if (password !== undefined && room[i].password !== password) {
          console.log(
            `방 비밀번호 ${rooms[i.password]}, 입력 비밀번호 ${password}`
          );
          break;
        }
        socket.join(rooms[i].socketId);
        socket.roomId = rooms[i].socketId;
        // 현재 인원 +1
        rooms[i].currentPeople += 1;
        console.log(`현재 인원 수 ${rooms[i].currentPeople}`);
        break;
      }
    }
  });

  socket.on("leaveRoom", () => {
    console.log(`${socket.userId}님이 ${socket.roomId}에서 퇴장하셨습니다.`);
    socket.leave(socket.roomId);

    for (let i = 0; i < rooms.length; i++) {
      if (rooms[i].socketId === socket.roomId) {
        // 현재 인원 -1
        rooms[i].currentPeople -= 1;
        console.log(`현재 인원 수 ${rooms[i].currentPeople}`);
        // 현재 인원이 0이라면 방 삭제
        if (rooms[i].currentPeople === 0) {
          rooms.splice(i, 1);
        }
        break;
      }
    }
    socket.roomId = "";
  });

  socket.on("createRoom", (roomTitle, roomPeople, password) => {
    const socketId = socket.id;
    const room = {
      socketId,
      userId: socket.userId,
      roomTitle,
      roomPeople,
      password,
      currentPeople: 0,
    };
    rooms.push(room);
    console.log(
      `방 만들기: ${room.socketId}, ${room.userId}, ${room.roomTitle}, ${room.roomPeople}, ${room.password}`
    );
    socket.emit("roomData", room);
  });

  socket.on("disconnect", () => {
    console.log("disconnect: ", socket.id);
  });
});

// 서버 열기
httpServer.listen(port, () => {
  console.log(port, "포트로 서버가 켜졌어요!");
});
