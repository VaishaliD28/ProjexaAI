function login(){

var u = document.getElementById("user").value;
var p = document.getElementById("pass").value;

if(u != "" && p != ""){
window.location.href = "dashboard.html?name=" + u;
}
else{
document.getElementById("msg").innerHTML = "Please enter Name and Password";
}

}


