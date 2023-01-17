const express = require('express');

const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')
const bodyParser=require("body-parser");
app.use(bodyParser.urlencoded({extended:true}));

app.set('view engine', 'ejs')
app.use(express.static('public'))



app.get('/', (req, res) => {
  //res.redirect(`/${uuidV4()}`)
  res.render("login");
})
app.post("/",function(req,res){
  console.log(req.body);
 const userId=req.body.username;
 const roomId=req.body.room;
 const roomType=req.body.roomType;
 if(roomType==="Chat"){
  res.render("chat",{roomId:roomId, userId:userId});
 }
 else{
  res.render("video",{
    roomId:roomId, userId:userId
  })
 }
})

// app.get('/:room', (req, res) => {
//   res.render('video', { roomId: req.params.room })
// })


io.on('connection', socket => {
  socket.on("new-user",(user,room)=>{
    socket.join(room);
    socket.username=user;
   
    var OnlineUsers=[];
    io.in(room).fetchSockets().then((users)=>{
      users.forEach(element => {
        OnlineUsers.push(element.username);
      });
      io.in(room).emit("room-joined",OnlineUsers);
    });

    socket.on("message-send",(message)=>{
      socket.in(room).emit("rec-msg",message,user);

    });
    socket.on("disconnect",()=>{
      var NewOnline=[]
      io.in(room).fetchSockets().then((users)=>{
        users.forEach(element => {
          NewOnline.push(element.username);
        });
        socket.in(room).emit("user-rem",NewOnline);
      });

    })
  });

  

  socket.on('join-room', (roomId, userId,username) => {
    socket.join(roomId)
    console.log(roomId,userId);
    socket.to(roomId).emit('user-connected', userId,username)

    socket.on('disconnect', () => {
      socket.to(roomId).emit('user-disconnected', userId,username)
    })
  })
})


  
 


server.listen(3000)