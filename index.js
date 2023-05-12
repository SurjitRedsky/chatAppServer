const express = require("express");
const port = 2000;
const bodyParser = require("body-parser");
const { Server } = require("socket.io");
const http = require("http");
const cors = require("cors");
const { Socket } = require("socket.io");

const route = express();
route.use(bodyParser.json());

//create socket.io server
const server = http.createServer(route);
const io = new Server(server, {
	cors: {
		origin: "http://localhost:3000",
		methods: ["GET", "POST"],
	},
});

// const userNameToSocketMapping = new Map();
io.on("connection", (socket) => {
	socket.on("joinRoom", (data) => {
		const { room, userName } = data;
		console.log("user:--", userName, "room--", room);
		// userNameToSocketMapping.set(userName, socket.id);
		socket.join(room);
		socket.emit("joinedRoom", { room });
		socket.broadcast.emit("userJoined", { userName });
	});

	socket.on("newMassage", ({ newMassage, room }) => {
		io.in(room).emit("getlatestMsg", newMassage);
		console.log(newMassage, room);
	});

	socket.on("disconnect", () => {
		socket.broadcast.emit("userDisconnect");
	});

	//Call user
	socket.on("callUser", (data) => {
		io.to(data.userToCall).emit("callUser", {
			signal: data.signalData,
			from: data.from,
			name: data.name,
		});
	});

	//Answer Call
	socket.on("answerCall", () => {
		io.to(data.to).emit("callAccepeted", data.signal);
	});
});

route.get("/", (req, res) => res.send("socket chat is starting "));

server.listen(port, () =>
	console.log(`your server is running on ${port} port number`)
);
