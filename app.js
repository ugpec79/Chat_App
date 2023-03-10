
require('dotenv').config()
const express = require('express');
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const MongoStore = require("connect-mongo");


const mongoose=require('mongoose');
const Agora = require("agora-access-token");
mongoose.set('strictQuery', false);
const bcrypt = require('bcrypt');
const saltRounds = 10;
mongoose.connect("mongodb://0.0.0.0:27017/userDB",{useNewUrlParser:true});
const app = express();
const oneDay = 1000 * 60 * 60 * 24;
app.use(
  sessions({
    secret: 'SECRET KEY',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: 'mongodb://0.0.0.0:27017/userDB',
        ttl:oneDay ,
        autoRemove:'native'
    })
  })
)
app.use(cookieParser());
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid');
const uuid = uuidV4();
const bodyParser=require("body-parser");
app.use(bodyParser.urlencoded({extended:true}));
var admin = require("firebase-admin");

var serviceAccount = require("./firebaseKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.BUCKET_URL
});

app.set('view engine', 'ejs')

const path=require('path');
const multer=require('multer');
const e = require('express');
const upload=multer({storage: multer.memoryStorage()})
app.use(express.static('public'));
const userScheme=mongoose.Schema({
  username:String,
  actualname:String,
  emailId:String,
  profilePic:String,
  password:String
}, {timestamps: true});
const fileScheme=mongoose.Schema({
  fileName:String,
  fileUrl:String,
  from:String,
  to:String
}, {timestamps: true});
const messageSchema=mongoose.Schema({
  username:String,
  message:String,
  room:String,

}, {timestamps: true});
const roomSchema=mongoose.Schema({
  roomName:String,
  userJoined:String,
  roomType:String
}, {timestamps: true});
const User=mongoose.model("User",userScheme);
const File=mongoose.model("File",fileScheme);
const Message=mongoose.model("Message",messageSchema);
const Room=mongoose.model("Room",roomSchema);

const bucket=admin.storage().bucket();

app.get('/', (req, res) => {
  let session=req.session;
  if(session.userId){
    console.log(session);
   User.find({username:session.userId},function(err,user){
      if(err){
        console.log(err);
        res.redirect("/");
      }
      else{
        if(user.length===0){
          res.redirect("/");
        }
        console.log(user);
        File.find({from:user[0].username},function(err,filesSent){
          if(err){
            console.log(err);
            res.redirect('/');
          }
          else{
            File.find({to:user[0].username},function(err, fileRecieved){
              if(err){
                console.log(err);
                res.redirect("/");
              }
              else{
                Room.find({userJoined:user[0].username},function(err,rooms){
                  if(err){
                    console.log(err);
                    res.redirect("/");
                  }
                  else{
                    console.log(user);
                    res.render("dash_prof",{userImage:user[0].profilePic,userName:session.userId, actualName:user[0].actualname,roomArray:rooms,fileArray:fileRecieved,fileArray2:filesSent});
                  }
                })
              }
            })
          }
        })
      }
    })
   
  }
  else{
    res.render("login");
  }
});
app.post("/sendFile",upload.single('imp'),function(req,res){
  let session=req.session;
  if(session){
  const recUsername=req.body.recUser;  
  User.find({username:recUsername},function(err,user){
    if(err){
      console.log(err);
      res.send("Error");
    }
    else{
      if(user.length===0){
        res.redirect("/");
      }
      else{
        console.log(req.file);
 
  const blob = bucket.file(req.file.originalname)
        
  const blobWriter = blob.createWriteStream({
      metadata: {
          contentType: req.file.mimetype,
          firebaseStorageDownloadTokens: uuid
      }
  })
  
  blobWriter.on('error', (err) => {
      console.log(err)
  })
  
  blobWriter.on('finish', () => {
    const newFile=new File({
      fileName:req.file.originalname,
      fileUrl:`https://firebasestorage.googleapis.com/v0/b/${process.env.URL_FILE}/o/${req.file.originalname}?alt=media&token=${uuid}`,
      from:req.session.userId,
      to:recUsername
    });
    newFile.save();
    res.redirect("/");
    console.log(`https://firebasestorage.googleapis.com/v0/b/chat-app-8976d.appspot.com/o/${req.file.originalname}?alt=media&token=${uuid}`);
  })
  
  blobWriter.end(req.file.buffer)


      }
    }
  })
}
else{
  res.redirect("/");
}
  
});

app.post("/updateProfile",upload.single("image"),function(req,res){
  let session=req.session;
  if(session){
  if(req.session.userId){
    // console.log(req);

  User.find({username:session.userId},function(err,useri){
    if(err){
      res.send("Error");
    }
    else{
      if(useri.length===0){
        res.redirect("/signup");
      }
      else{
         console.log(req.body);
        const newUserName=req.body.uName;
        const oldPwd=req.body.oldPassword;
        const newPwd=req.body.newPassword;
        if(oldPwd!="" && newPwd!=""){
          bcrypt.compare(oldPwd, useri[0].password, function(err, result) {
            if(result===true){
              bcrypt.hash(newPwd, saltRounds, function(err, hash) {
                // Store hash in your password DB.
                User.updateOne({username:useri[0].username},{password:hash},function(err,out){
                  if(err){
                    console.log(err);
                    ne();
                  }
                })
            });
            }
            else{
              res.send("Error in Changing Password : Incorrect Password")
            }
        });
        }
        else{
          ne();
        }
        function ne(){
       
   
        var imageUrl="";
        if(req.file){
          const blob = bucket.file(req.file.originalname);
          
  const blobWriter = blob.createWriteStream({
      metadata: {
          contentType: req.file.mimetype,
          firebaseStorageDownloadTokens: uuid
      }
  })
  
  blobWriter.on('error', (err) => {
      console.log(err)
  })
  
  blobWriter.on('finish', () => {
    imageUrl=`https://firebasestorage.googleapis.com/v0/b/${process.env.URL_FILE}/o/${req.file.originalname}?alt=media&token=${uuid}`;
    User.find({username:newUserName},function(err,user){
      if(err){
        throw err;
      }
          if(user.length===0 ){
           
              User.updateOne({username:req.session.userId},
                {
                  username:newUserName,
                  profilePic:imageUrl,
                },function(err,out){
                  if(err){
                    throw err;
                  }
                  else{
                    File.updateMany({from:req.session.userId},{from:newUserName},function(Err,out){
                      if(Err){
                        throw Err;
                      }
                      File.updateMany({to:req.session.userId},{to:newUserName},function(Err,out){
                        if(Err){
                          throw Err;
                        }
                        Room.updateMany({userJoined:req.session.userId},{userJoined:newUserName},function(ERr,out){
                          if(ERr){
                            throw ERr;
                          }
                          Message.updateMany({username:req.session.userId},{username:newUserName},function(ERR,out){
                            if(ERR){
                              throw ERR;
                            }
                            req.session.userId=newUserName;
                            res.redirect("/");
                            
                          })
                          
                        })
                        
                      })
                    })
                  
                  }
                }
              )
              
          }
          else{
            console.log(user,useri);
            var idx=-1;
            for(var i=0;i<user.length;i++){
              if(user[i].emailId===useri[0].emailId){
                idx=i;
               
              }
            }
            if(idx===-1){
              res.send("User Exist");
            }
            else{
            User.updateOne({_id:user[idx]._id},
               {
                username:newUserName,
                profilePic:imageUrl,
              },function(err,out){
                if(err){
                  throw err;
                }
                else{
                  File.updateMany({from:req.session.userId},{from:newUserName},function(Err,out){
                    if(Err){
                      throw Err;
                    }
                    File.updateMany({to:req.session.userId},{to:newUserName},function(Err,out){
                      if(Err){
                        throw Err;
                      }
                      Room.updateMany({userJoined:req.session.userId},{userJoined:newUserName},function(ERr,out){
                        if(ERr){
                          throw ERr;
                        }
                        Message.updateMany({username:req.session.userId},{username:newUserName},function(ERR,out){
                          if(ERR){
                            throw ERR;
                          }
                          req.session.userId=newUserName;
                          res.redirect("/");
                          
                        })
                        
                      })
                      
                    })
                  })
                
                }
              }
            )
            }
          }
          
        })
    
    console.log("Success");
  })
  
  blobWriter.end(req.file.buffer)
        }
        else{
          User.find({username:newUserName},function(err,user){
            if(err){
              throw err;
            }
                if(user.length===0){
                  console.log("Username Change")
                 
                  User.updateOne({username:req.session.userId},
                   {
                      username:newUserName,
                   
                   },function(err,out){
                      if(err){
                        throw err;
                      }
                      else{
                        File.updateMany({from:req.session.userId},{from:newUserName},function(Err,out){
                          if(Err){
                            throw Err;
                          }
                          File.updateMany({to:req.session.userId},{to:newUserName},function(Err,out){
                            if(Err){
                              throw Err;
                            }
                            Room.updateMany({userJoined:req.session.userId},{userJoined:newUserName},function(ERr,out){
                              if(ERr){
                                throw ERr;
                              }
                              Message.updateMany({username:req.session.userId},{username:newUserName},function(ERR,out){
                                if(ERR){
                                  throw ERR;
                                }
                                req.session.userId=newUserName;
                                res.redirect("/");
                                
                              })
                              
                            })
                            
                          })
                        })
                      
                      }
                    }
                  )
                }
                else{
                  console.log(user,useri);
            var idx=-1;
            for(var i=0;i<user.length;i++){
              if(user[i].emailId===useri[0].emailId){
                idx=i;
               
              }
            }
            if(idx===-1){
              res.send("User Exist");
            }
            else{
            User.updateOne({_id:user[idx]._id},
               {
                username:newUserName,
             
              },function(err,out){
                if(err){
                  throw err;
                }
                else{
                  File.updateMany({from:req.session.userId},{from:newUserName},function(Err,out){
                    if(Err){
                      throw Err;
                    }
                    File.updateMany({to:req.session.userId},{to:newUserName},function(Err,out){
                      if(Err){
                        throw Err;
                      }
                      Room.updateMany({userJoined:req.session.userId},{userJoined:newUserName},function(ERr,out){
                        if(ERr){
                          throw ERr;
                        }
                        Message.updateMany({username:req.session.userId},{username:newUserName},function(ERR,out){
                          if(ERR){
                            throw ERR;
                          }
                          req.session.userId=newUserName;
                          res.redirect("/");
                          
                        })
                        
                      })
                      
                    })
                  })
                
                }
              }
            )
            }
                }
                
              })
        }
      }
      
      }
    }
  })

}
else{
  res.redirect("/");
}
  }
  else{
    res.redirect("/");
  }
})
app.post("/createRoom",function(req,res){
  let session=req.session;
  if(session){
  console.log(req.body);
  const roomName=req.body.roomN;
  const roomType=req.body.roomType;
  if(req.body.btn==="Create Room"){
  Room.find({roomName:roomName},function(err,room){
    if(err){
      res.send("Error2");
      console.log(err);
    }
    else{
      if(room.length===0){
        const newRoom=new Room({
          roomName:roomName,
          roomType:roomType,
          userJoined:req.session.userId
        });
        newRoom.save();
        res.redirect("/");
      }
      else{
        res.send("Error");
        
      }
    }
  })
}

else{
  Room.find({roomName:roomName},function(err,room){
    if(err){
      res.send("Error2");
      console.log(err);
    }
    else{
      if(room.length===0){
        res.send("No Room Exist")
      }
      else{
      if(room[0].roomType==="Chat"){
        res.redirect("/chat/"+roomName);
      }
      if(room[0].roomType==="Video"){
        res.redirect("/video/"+roomName);
      }
        
      }
    }
  })
}
  }
  else{
    res,redirect("/");
  }
});

app.get("/updateProf",function(req,res){

  let session=req.session;
  if(session){

  
  if(req.session.userId){
    User.find({username:req.session.userId},function(err,user){
      if(err){
        console.log(err);
        res.send("Error");
      }
      else{
        if(user.length===0){
          res.render("signup");
        }
        else{
          res.render("update",{userId:session.userId,actualName:user[0].actualname,emailId:user[0].emailId,userImg:user[0].profilePic})
        }
      }
    })
  }
  }
  else{
    res.redirect("/");
  }
});
app.get("/signout",function(req,res){
  if(req.session){
    req.session.destroy();
    res.redirect("/");
  }
  else{
    res.redirect("/");
  }
})
app.get("/chat/:roomName",function(req,res){
  let session=req.session;
  if(session){
  const roomName=req.params.roomName;
  res.render("chat",{userId:session.userId,roomId:roomName});
  }
  else{
    res.redirect("/");
  }
})
app.get("/video/:roomName",function(req,res){
  let session=req.session;
  if(session){
  if(session.userId){
    console.log(session.userId);
    const roomName=req.params.roomName;

      const appID = process.env.APP_ID;
      const appCertificate = process.env.APP_CERT;
      const expirationTimeInSeconds = 3600;
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
      const channel = roomName;
      const token = Agora.RtcTokenBuilder.buildTokenWithAccount(appID, appCertificate, channel, session.userId, Agora.RtcRole.PUBLISHER, privilegeExpiredTs);
      session.token=token;
      res.render("video",{userId:session.userId,roomId:roomName,tOken:token});


  }
  else{
    res.redirect("/");
  }
}
else{
  res.redirect("/");
}
})

app.get("/signup",function(req,res){
  res.render("signup");
});
app.post("/newUser",function(req,res){
  let session=req.session;
  console.log(req.body);
  const userName=req.body.uName;
  const actualName=req.body.aName;
  const Email=req.body.eMail;
  const Password=req.body.pwd;
  User.find({username:userName},function(err,user){
    if(err){
      console.log(err);
      res.send("<script>alert(`Error`);</script>");
    }
    else{
      if(user.length===0){
        bcrypt.hash(Password, saltRounds, function(err, hash) {
          // Store hash in your password DB.
        const newUser=new User({
          username:userName,
          actualname:actualName,
          emailId:Email,
          profilePic:`https://firebasestorage.googleapis.com/v0/b/${process.env.URL_FILE}/o/user.webp?alt=media&token=c01a6987-c876-4eea-94a4-aa922985a2d3`,
          password:hash
        });
        newUser.save();
        session=req.session;
        session.userId=userName;
        res.redirect("/");
  });

      }
      else{
        res.send("user already exist");
      }
    }
  })
  
})
app.post("/",function(req,res){
let session=req.session;

console.log(req.body);
 const userId=req.body.username;
 const passWd=req.body.password;
 User.find({username:userId},function(err,user){
  if(err){
    console.log(err);
    res.send("error");
  }
  else{
    if(user.length===0){
      res.redirect("/signup");
    }
    else{
      bcrypt.compare(passWd, user[0].password, function(err, result) {
        // result == true
        if(err){
          console.log(err);
          res.send("Error in Password")
        }
        else{
          if(result===true){
            session=req.session;
      session.userId=userId;
   
        
         File.find({from:user[0].username},function(err,filesSent){
           if(err){
             console.log(err);
             res.redirect('/');
           }
           else{
             File.find({to:user[0].username},function(err, fileRecieved){
               if(err){
                 console.log(err);
                 res.redirect("/");
               }
               else{
                 Room.find({userJoined:user[0].username},function(err,rooms){
                   if(err){
                     console.log(err);
                     res.redirect("/");
                   }
                   else{
                     res.render("dash_prof",{userImage:user[0].profilePic,userName:session.userId, actualName:user[0].actualname,roomArray:rooms,fileArray:fileRecieved,fileArray2:filesSent});
                   }
                 })
               }
             })
           }
         })
          }
          else{
            res.redirect("/");
          }
        }
    });
      
     
    }
  }
 })

})



io.on('connection', socket => {
  socket.on("new-user",(user,room)=>{
    var preMessage=[];
    
    socket.join(room);
    socket.username=user;

    Message.find({room:room},function(err, messages){
      if(err){
        console.log(err);
      }
      else{
      //console.log(messages);
      messages.forEach((msg)=>{
        preMessage.push(msg);
      })
        var OnlineUsers=[];
    io.in(room).fetchSockets().then((users)=>{
 
      users.forEach(element => {
        if(element.username){
        OnlineUsers.push(element.username);
        }
      });
     // console.log(OnlineUsers,preMessage);
      io.in(room).emit("room-joined",OnlineUsers,messages);
    });
      }
    });
   
   

    socket.on("message-send",(message)=>{
      const mesage=new Message({
        message:message,
        username:user,
        room:room
      });
      mesage.save();
      
      //console.log(preMessage);
     
        //console.log(messages);
      
          io.in(room).emit("rec-msg",mesage);

    
      
       // console.log(OnlineUsers,preMessage);
      
    
 
  

    });
    socket.on("disconnect",()=>{
      var NewOnline=[]
      io.in(room).fetchSockets().then((users)=>{
        users.forEach(element => {
          if(element.username){
          NewOnline.push(element.username);
          }
        });
        socket.in(room).emit("user-rem",NewOnline);
      });

    })
  });

  

  
})


  
 


server.listen(process.env.PORT||3000);