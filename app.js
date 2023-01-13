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
  res.render("chat",{usern:req.body.username});
});
var onlineusr=[]
var onlinechat=[]
io.on("connection", (socket)=>{
  
  socket.on("new-user",(user)=>{
   onlineusr.push(user); 
  socket.username=user;
  //console.log(socket);
  io.emit("add-user",onlineusr);
 });
 socket.on("send-msg",(msgObj)=>{
  onlinechat.push(msgObj);
  //console.log(msgObj);
  io.emit("new-msg",onlinechat);
  
})
socket.on("disconnect",()=>{
  // console.log(socket);
  var index = onlineusr.indexOf(socket.username);
  if (index !== -1) {
    onlineusr.splice(index, 1);
  }
  console.log(onlineusr);
  io.emit("add-user",onlineusr);
})

})

server.listen(3000, () => {
    console.log('listening on *:3000');
  });
