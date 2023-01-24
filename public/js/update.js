const profile = document.querySelector('.profile');
const file = document.querySelector('#file');
const choose = document.querySelector('#choose_photo');

profile.addEventListener('mouseenter',()=>{
    choose.style.display = "block";
});
profile.addEventListener('mouseleave',()=>{
    choose.style.display = "none";
})
file.addEventListener('change',()=>{
    const choosedFile = file.files[0];
    if(choosedFile){
        const reader = new FileReader();
        reader.addEventListener('load',()=>{
            document.getElementById('profile_pic').setAttribute('src',reader.result);
        });
        reader.readAsDataURL(choosedFile);
    }
})
const eye1 = document.getElementById('old');
const old_pass = document.getElementById('old-pass');
const new_pass = document.getElementById('new-pass');
const eye2 = document.getElementById('new');

eye1.addEventListener('click',()=>{
    if(old_pass.type== "password"){
        old_pass.type = "text";
        eye1.classList.replace('uil-eye-slash','uil-eye');
    }
    else{
        old_pass.type = "password";
        eye1.classList.replace('uil-eye','uil-eye-slash');
    }
})
eye2.addEventListener('click',()=>{
    if(new_pass.type== "password"){
        new_pass.type = "text";
        eye2.classList.replace('uil-eye-slash','uil-eye');
    }
    else{
        new_pass.type = "password";
        eye2.classList.replace('uil-eye','uil-eye-slash');
    }
})
