document.querySelectorAll('.nav_button').forEach(element => {
    element.onclick= ()=>{
        element.classList.add(".nav_button_toggle");
        setTimeout(()=>{},2000);
        element.classList.remove(".nav_button_toggle");
    }
});

// const profile = document.querySelector('.profile');
// // const file = document.querySelector('#file');
// // const choose = document.querySelector('#choose_photo');

// profile.addEventListener('mouseenter',()=>{
//     choose.style.display = "block";
// });
// profile.addEventListener('mouseleave',()=>{
//     choose.style.display = "none";
// })
// file.addEventListener('change',()=>{
//     const choosedFile = file.files[0];
//     if(choosedFile){
//         const reader = new FileReader();
//         reader.addEventListener('load',()=>{
//             document.getElementById('profile_pic').setAttribute('src',reader.result);
//         });
//         reader.readAsDataURL(choosedFile);
//     }
// });
const create_room = document.getElementById('create_btn');
const join_room = document.getElementById('join_btn');
const room_popup = document.getElementById('room-popup');
const room_label = document.getElementById('room-label');
const room_select = document.getElementById('room-option-div');
create_room.addEventListener('click',()=>{
    console.log("create room ");
    if(room_popup.style.display == "none"){
        room_popup.style.display = "block";
        room_select.style.display="block";
        room_label.style.display="block";
        document.getElementById("join-room").style.display="none";
        document.getElementById("create-room").style.display="block";
    }
    else{
        room_popup.style.display = "none";
        room_select.style.display="none";
        room_label.style.display="none";
        document.getElementById("join-room").style.display="none";
        document.getElementById("create-room").style.display="none";
       
    }
});

join_room.addEventListener('click',()=>{
    if(room_popup.style.display == "none"){
        room_popup.style.display = "block";
        room_select.style.display="none";
        room_label.style.display="none";
        document.getElementById("join-room").style.display="block";
        document.getElementById("create-room").style.display="none";
      
    }
    else{
        room_popup.style.display = "none";
       
        room_select.style.display="none";
        room_label.style.display="none";
        document.getElementById("join-room").style.display="none";
        document.getElementById("create-room").style.display="none";
       
       
    }
})
const send_popup = document.getElementById('send-popup');
const send_file = document.getElementById('send_btn');
send_file.addEventListener('click',()=>{
    if(send_popup.style.display== "none"){
        send_popup.style.display="block";
    }
    else{
        send_popup.style.display="none";
    }
})