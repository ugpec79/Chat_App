const pwShowhide = document.querySelectorAll('#show');
const pwPass = document.querySelectorAll('.password');

pwShowhide.forEach((eye) =>{
  eye.addEventListener('click',()=>{
    pwPass.forEach(pw =>{
      if(pw.type === "password"){
        pw.type = "text";
        eye.classList.replace("uil-eye-slash","uil-eye");
      }
      else{
        pw.type = "password";
        eye.classList.replace("uil-eye","uil-eye-slash");
      }
    })
  })
})