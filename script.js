// ================= LOGIN + SIGNUP =================

// 👉 Make functions GLOBAL (VERY IMPORTANT)
function login(){

    let name = document.getElementById("user").value;
    let pass = document.getElementById("pass").value;

    if(!name || !pass){
        document.getElementById("msg").innerHTML = "Enter all fields ❌";
        return;
    }

    fetch("http://127.0.0.1:5000/add_user", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ name: name })
    })
    .then(res => res.json())
    .then(data => {
        window.location = "dashboard.html?name=" + name;
    })
    .catch(err => {
        window.location = "dashboard.html?name=" + name;
    });
}


// 👉 SHOW SIGNUP
function showSignup(){
    document.getElementById("signupBox").style.display = "block";
}


// 👉 SIGNUP FUNCTION (GLOBAL)
function signup(){

    console.log("Signup clicked"); // debug

    let name = document.getElementById("newUser").value;
    let pass = document.getElementById("newPass").value;

    if(!name || !pass){
        document.getElementById("signupMsg").innerHTML = "Fill all fields ❌";
        return;
    }

    fetch("http://127.0.0.1:5000/add_user", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ name: name })
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById("signupMsg").innerHTML = "Account Created......";
    })
    .catch(err => {
        console.log("Error:", err);
        document.getElementById("signupMsg").innerHTML = "Error ❌";
    });
}



// ================= DASHBOARD =================
if(document.getElementById("att")){

const params = new URLSearchParams(window.location.search);
let user = params.get("name");

document.getElementById("name").innerHTML = user;

fetch("http://127.0.0.1:5000/users")
.then(res => res.json())
.then(data => {

    let foundUser = data.find(u => u[1].toLowerCase() === user.toLowerCase());

    if(foundUser){

        let attendance = foundUser[2] || 50;
        let skill = foundUser[3] || "Beginner";
        let ready = foundUser[4] || "30%";

        document.getElementById("att").innerHTML =
            "Attendance: " + attendance + "%";

        document.getElementById("status").innerHTML =
            attendance >= 75 ? "Status: Safe" : "Status: Low";

        document.getElementById("skill").innerHTML =
            "Skills: " + skill;

        document.getElementById("ready").innerHTML =
            "Readiness: " + ready;

    }

});

// Feedback
function submit(){

let msg = document.querySelector("textarea").value;

fetch("http://127.0.0.1:5000/feedback", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    name: user,
    msg: msg
  })
})
.then(res => res.json())
.then(data => {
    document.getElementById("fb").innerHTML = "Feedback Submitted ✅";
});

}

// Logout
function logout(){
    window.location="index.html";
}

// Toggle
function toggleCampus(){
    let g = document.getElementById("campusGallery");
    g.style.display = g.style.display === "none" ? "block" : "none";
}

}

