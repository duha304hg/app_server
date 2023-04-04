"use strict";

const http = require('http');
const socket = require('socket.io');
const mysql = require('mysql')
const server = http.createServer();
const port = 10000;

var pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'duhahg123',
    database: 'mydatabase'
});


var sql = 'SELECT * FROM userdata';
/*
pool.query(sql, function(error,result){
    if(error) console.log('Error: ', error);
    console.log('– USER TABLE — ' , result);
    //res.json(result); // Trả kết quả về cho client dưới dạng json
});
*/
const { addUser, removeUser, getUser } = require("./users");

var io = socket(server, {
});

const roomMessages = {};

io.on('connection', socket => {
    var currentRoom = '';

    socket.on('access', (msg, callback) => {
        var sql = "SELECT * FROM userdata WHERE Username = '" + msg['username'] + "' AND Password = '"+ msg['password'] +"';";
                
        pool.query(sql, function(error, result){
            if(result.length === 0 || error){
                console.log('Error\n', error);
                socket.emit('access', 'error');
            }else{
                console.log('Sucess\n', result);
                /*const { error, user } = addUser(
                    { id: socket.id, msg });
                if (error) return callback(error);*/
            }
        });  
    });

    console.log('a user connected');
    
    socket.on('join', function(newRoom) {
        if (currentRoom !== newRoom && currentRoom !== '') {
          socket.leave(currentRoom);
        }
        socket.join(newRoom); 
        currentRoom = newRoom;
        
        if (roomMessages[currentRoom]) {
            socket.emit('chatlog', roomMessages[currentRoom]);
          }
      });

    socket.on('chatmsg', (msg) => {
        const user = getUser(socket.id);

        if (!roomMessages[currentRoom]) {
            roomMessages[currentRoom] = [];
          }

          roomMessages[currentRoom].push(msg);

        io.to(currentRoom).emit('chatmsg', msg);
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        console.log('user disconnected');
    });
  });

/*
var io = socket(server, {
    transports: ["polling"]
});

io.on('connection', socket => {
    console.log("test");
    socket.emit("hi","hello");
});*/

//app.get("/*", (req, res) => res.send("You have reached a Socket.io server"));

server.listen(port, () => {
    console.log(`Port: ${port}`);
});

