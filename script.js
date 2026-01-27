function login(){

let u = document.getElementById("user").value;
let p = document.getElementById("pass").value;

if(u !== "" && p !== ""){

localStorage.setItem("username", u);

window.location = "dashboard.html";
}
else{
document.getElementById("msg").innerHTML = "Please enter ID and Password";
}

}
