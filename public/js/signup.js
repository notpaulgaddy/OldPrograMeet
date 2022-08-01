const submit = document.querySelector(".submit-btn");
var email = document.getElementById("email");
const pword = document.getElementById("pword");
var docRef = firebase.firestore();
var auth = firebase.auth();
document.getElementById("contactForm");

submit.addEventListener("click", (e) => {
		var username = getInputVal("username");
		function getInputVal(id) {
			return document.getElementById(id).value;
		}
		if(email.value.indexOf("@csedge.org") >= 0 || email.value.indexOf("@google.com") >= 0){
						firebase.auth().createUserWithEmailAndPassword(email.value, pword.value).then((auth) => {
								e.preventDefault();
								var email = getInputVal("email");
								var fln = getInputVal("fln");
								function getInputVal(id) {
									return document.getElementById(id).value;
								}
                function sendData(){
                  docRef
									.collection("userInfo")
									.doc(auth.user.uid)
									.set({
										email: email,
                    fln: fln,
                    username: username,
                    organization: "Code Next",
                    projOne: "",
                    projTwo: "",
                    backgroundPic: "https://wallpapercave.com/wp/wp2780420.jpg",
                    downloadURL:"https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse3.mm.bing.net%2Fth%3Fid%3DOIP.HLOr38Y1RZQoGz-y98QmEQHaHa%26pid%3DApi&f=1",
                    userId: auth.user.uid,
                    location: "",
                    role: "",
                    link:"",
                    interestOne: "",
                    interestTwo: "",
                    skillOne: "",
                    skillTwo: "",
                    hobbies: "",
                    bio: ""
                        })
                    firebase
                    .database()
                    .ref("users/" + auth.user.uid)
                    .set({
                      name: fln,
                      email: email,
                      photoURL:
                        "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse3.mm.bing.net%2Fth%3Fid%3DOIP.HLOr38Y1RZQoGz-y98QmEQHaHa%26pid%3DApi&f=1",
                      userId: auth.user.uid,
                      username: username,
                    })
                    docRef.collection("emailList").doc(auth.user.uid).set({email: email,fln: fln})
                    alert("Signed up congrats on joining the community!")
                }
                sendData()						
              });
              
	} else {
			alert("Please input your @google.com or @csedge.org email.");
		}
});

firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    user.sendEmailVerification().then(function() {
      alert("A verification email has been sent, please check your email");
      window.location.replace = "verify.html";
      firebase.auth().signOut();
  }).catch(function(error) {
    alert(error)
  });
  }
});