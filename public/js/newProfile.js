const profilePic = document.getElementById("profilePicProfile");
const slug = window.location.href.split("?")[1].split("=")[1];
db = firebase.firestore();
usersRef = db
	.collection("userInfo")
	.where("userId", "==", slug)
	.get()
	.then(function (querySnapshot) {
		querySnapshot.forEach(function (doc) {
            bgPic = doc.data().backgroundPic;
			var downloadURL = doc.data().downloadURL;
			profilePic.src = downloadURL;
			var bio = doc.data().bio;
			var fln = doc.data().fln;
			var hobbies = doc.data().hobbies;
			var interestOne = doc.data().interestOne;
			var interestTwo = doc.data().interestTwo;
			var projOne = doc.data().projOne;
			var projTwo = doc.data().projTwo;
			var role = doc.data().role;
			var skillOne = doc.data().skillOne;
			var skillTwo = doc.data().skillTwo;
            var state = doc.data().state;
            document.getElementById("profileBanner").src = bgPic
			document.getElementById("bio").value = bio;
			document.getElementById("fln").value = fln;
			document.getElementById("hobbies").value = hobbies;
			document.getElementById("interestOne").value = interestOne;
			document.getElementById("interestTwo").value = interestTwo;
			document.getElementById("projOne").value = projOne;
			document.getElementById("projTwo").value = projTwo;
			document.getElementById("role").value = role;
			document.getElementById("skillOne").value = skillOne;
			document.getElementById("skillTwo").value = skillTwo;
			document.getElementById("state").value = state;
		});
	});

const request = document.getElementById("request");
var user = firebase.auth().currentUser;
const checkNotif = firebase.database().ref("notifications");
const checkFriendList = firebase.database().ref("friend_list");
const about = document.getElementById('about')
const posts = document.getElementById('posts')
firebase.auth().onAuthStateChanged(function (user) {
	if (user) {
        const about = document.getElementById('about')
        const posts = document.getElementById('posts')
        
        window.addEventListener("load",function(){
            alert("cock")
            about.style.color = "#1E90FF";
              posts.style.color = "black";
              for(var i = 0; i < document.getElementsByClassName("eachPostBox").length; i++){
            document.getElementsByClassName("eachPostBox")[i].style.display = "none"; 
            }
        })
        
        about.onclick = function(){
          about.style.color = "#1E90FF";
          posts.style.color = "black";
          for(var i = 0; i < document.getElementsByClassName("eachPostBox").length; i++){
            document.getElementsByClassName("eachPostBox")[i].style.display = "none"; // depending on what you're doing
            }
        }
        
        posts.onclick = function(){
          posts.style.color = "#1E90FF";
          about.style.color = "black";
          document.getElementById("profileInfo").style.display = 'none';
        }
		uid = user.uid;
		db = firebase.firestore();
		db.collection("userInfo")
			.doc(user.uid)
			.get()
			.then(function (doc) {
				if (doc.exists) {
					var downloadURL = doc.data().downloadURL;
					var fln = doc.data().fln;
					var email = doc.data().email;
					checkFriendList.on("child_added", function (snapshot) {
						var key = snapshot.val();
						if (key.friendId == slug || key.friendId == uid) {
							if (key.userId == uid || key.userId == slug) {
								request.remove();
								document.getElementById("wait").innerHTML =
									'<a href="chat.html"><button class="btn btn-primary" id="cantsend" type="button" style="width:300px;">Chat</button></a>';
							}
						}
					});
					const cantsend = document.getElementById("cantsend");
					checkNotif.on("child_added", function (snapshot) {
						var key = snapshot.val();
						if (key.status == "Pending") {
							if (key.sendFrom == slug || key.sendFrom == uid) {
								if (key.sendTo == uid || key.sendTo == slug) {
									request.remove();
									document.getElementById("wait").innerHTML =
										'<button class="btn btn-primary" id="cantsend" type="button" style="width:300px;">Pending</button></a>';
								}
							}
						}
						cantsend.addEventListener("click", (e) => {
							if (key.status == "Pending") {
								alert("Your friend request is pending");
							}
						});
					});
					request.addEventListener("click", (e) => {
						if (
							request.innerHTML != "Accept" ||
							request.innerHTML != "Pending"
						) {
							var notification = {
								sendTo: slug,
								sendFrom: user.uid,
								name: fln,
								photo: downloadURL,
								email: email,
								dateTime: new Date().toLocaleString(),
								status: "Pending",
								notifType: "request",
							};
							firebase.database().ref("notifications").push(notification);
						}
					});
				}
			});
	}
});
