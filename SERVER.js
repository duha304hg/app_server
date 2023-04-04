"use strict";

const http = require('http');
const socket = require('socket.io');
const mysql = require('mysql')
const server = http.createServer();
const express = require('express');
const app = express();
const port = process.env.PORT || 10000;

var pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'duhahg123',
    database: 'mydatabase'
});

app.get('/', (req, res) => {
    res.send('<h1>Hello world</h1>');
  });

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

server.listen(port, () => {
    console.log(`Port: ${port}`);
});

