const express=require("express");
const bodyParser=require("body-parser");
const app=express();
const http = require('http');
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}));
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
app.get("/",function(req,res){
    res.render("login");
});
app.post("/",function(req,res){
  console.log(req.body);
  res.render("chat",{username:req.body.username});
})

io.on('connection', (socket) => {
  var c;
    console.log('a user connected');
    socket.on("username",(msg)=>{
      c=msg;
      io.emit("send message",msg+"connected");
    });
    socket.on("send message",(msg)=>{
      io.emit("send message",msg);
    })
    socket.on('disconnect', () => {
      io.emit("send message",c+"Disconnected");
    });
  });
server.listen(3000, () => {
    console.log('listening on *:3000');
  });
