const pass = document.getElementById('password');
const eye = document.getElementById('show');

eye.addEventListener("click",()=>{
    if(pass.type == "password"){
        pass.type = "text";
        eye.classList.replace("uil-eye-slash","uil-eye");
    }
    else{
        pass.type = "password";
        eye.classList.replace("uil-eye","uil-eye-slash");
    }
})