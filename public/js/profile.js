const profilePic = document.getElementById("yourPic");
const slug = window.location.href.split("?")[1].split("=")[1];
db = firebase.firestore();
const request = document.getElementById("request");
var user = firebase.auth().currentUser;
const checkNotif = firebase.database().ref("notifications");
const checkFriendList = firebase.database().ref("friend_list");
usersRef = db
	.collection("userInfo")
	.where("userId", "==", slug)
	.get()
	.then(function (querySnapshot) {
		querySnapshot.forEach(function (doc) {
			var downloadURL = doc.data().downloadURL;
			profilePic.src = downloadURL;
			var bio = doc.data().bio;
			var username = doc.data().username;
			var link = doc.data().link;
			var bgPic = doc.data().backgroundPic;
			var fln = doc.data().fln;
			var hobbies = doc.data().hobbies;
			var interestOne = doc.data().interestOne;
			var interestTwo = doc.data().interestTwo;
			var projOne = doc.data().projOne;
			var projTwo = doc.data().projTwo;
			var role = doc.data().role;
			var skillOne = doc.data().skillOne;
			var skillTwo = doc.data().skillTwo;
			var location = doc.data().location;
			var org = doc.data().organization;
			document.getElementById("bgPic").src= bgPic;
			document.getElementById("pfOrg").innerHTML = org;
			document.getElementById("pfLink").innerHTML = link;
			document.getElementById("pfUsername").innerHTML = "@"+username;
			document.getElementById("pfBio").innerHTML = bio;
			document.getElementById("pfName").innerHTML = fln;
			document.getElementById("hobbies").value = hobbies;
			document.getElementById("interestOne").value = interestOne;
			document.getElementById("interestTwo").value = interestTwo;
			document.getElementById("projOne").value = projOne;
			document.getElementById("projTwo").value = projTwo;
			document.getElementById("hobbies").value = hobbies;
			document.getElementById("pfRole").innerHTML = role;
			document.getElementById("skillOne").value = skillOne;
			document.getElementById("skillTwo").value = skillTwo;
			document.getElementById("pfLocation").innerHTML = location;
		});
	});

firebase.auth().onAuthStateChanged(function (user) {
	if (user) {
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
			time = new Date()
			firebase.firestore().collection("Posts/allPosts/posts")
			.where("uid", "==", slug)
			.get()
			.then(snap => {
    		snap.forEach(doc => {
				var tTime = new Date(doc.data().time)
				var sinceMin = Math.round((time - tTime) / 60000);
			if (sinceMin == 0) {
				var sinceSec = Math.round((time - tTime) / 1000);
				if (sinceSec < 10) var since = "less than 10 seconds ago";
				else if (sinceSec < 20) var since = "less than 20 seconds ago";
				else var since = "half a minute ago";
			} else if (sinceMin == 1) {
				var sinceSec = Math.round((time - tTime) / 1000);
				if (sinceSec == 30) var since = "half a minute ago";
				else if (sinceSec < 60) var since = "less than a minute ago";
				else var since = "1 minute ago";
			} else if (sinceMin < 45) var since = sinceMin + " minutes ago";
			else if (sinceMin > 44 && sinceMin < 60) var since = "about 1 hour ago";
			else if (sinceMin < 1440) {
				var sinceHr = Math.round(sinceMin / 60);
				if (sinceHr == 1) var since = "about 1 hour ago";
				else var since = "about " + sinceHr + " hours ago";
			} else if (sinceMin > 1439 && sinceMin < 2880) var since = "1 day ago";
			else {
				var sinceDay = Math.round(sinceMin / 1440);
				var since = sinceDay + " days ago";
			}
				document.getElementById("eachUserPost").innerHTML += `<div class="what-mind position-relative d-flex align-items-start">
				<a class="three-dot-double dropdown-toggle" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" href="#"><img src="public/img/three-dot-double.png" style="width:40px;height:40px" alt=""></a>
				<div class="dropdown-menu dropdown-menu-right" >
					<a style="color: #5B93FF;background: rgba(91, 147, 255, 0.19);" class="dropdown-item" href="#"> Edit</a>
					<a style="background: rgba(231, 29, 54, 0.15);color: #E71D36;" class="dropdown-item mt_5" href="#">Delete</a>
					<a style="background: rgba(91, 147, 255, 0.15);color: #5B93FF;" class="dropdown-item mt_5" href="#">Activate</a>
				</div>
				<img src="${doc.data().profilePic}" alt="">
				<div>
					<div class="d-flex align-items-center">
						<h3 class="profile-head mr_20">${doc.data().firstLast}</h3>
						<h3 class="profile-head">@${doc.data().username}</h3>
					</div>
					<h3 class="profile-head mt_20">12/17/21 <span>${since}</span></h3>
				</div>
			</div>
			<p class="profile-head lorem-head">${doc.data().Post}</p>
			<div class="comment-love-main d-flex align-items-center justify-content-between">
				<a class="comment-love"><img src="public/img/comment-black-icon.png" style="width:30px;height:30px" alt="">0</a>
				<a class="comment-love"><img src="public/img/love-black-icon.png" style="width:30px;height:30px" alt="">0</a>
			</div>
			<hr>
						`
			});
		})
	}
	document.getElementById("home-tab").onclick = function(){
		document.getElementById("eachUserPost").remove()
	}
	document.getElementById("profile-tab").onclick = function(){
		// document.getElementById("myTabContent").hide()
		document.getElementById("eachUserPost").show()
	}
});
