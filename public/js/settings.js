const buttonOne = document.getElementById("buttonOne");
const profilePic = document.getElementById("yourPic");
const updatePfp = document.querySelector("#profilePicUpdate");
const updateBgPic = document.querySelector("#bgPicUpdate")
let file = {};
var imgUrl;
firebase.auth().onAuthStateChanged(function (user) {
	if (user) {
		db = firebase.firestore();
		db.collection("userInfo")
			.doc(user.uid)
			.get()
			.then(function (doc) {
				if (doc.exists) {
					var downloadURL = doc.data().downloadURL;
					var fln = doc.data().fln;
					var email = doc.data().email;
					var role = doc.data().role;
					var interestOne = doc.data().interestOne;
					var interestTwo = doc.data().interestTwo;
					var skillOne = doc.data().skillOne;
					var skillTwo = doc.data().skillTwo;
					var hobbies = doc.data().hobbies;
					var bio = doc.data().bio;
					var projOne = doc.data().projOne;
					var projTwo = doc.data().projTwo;
					var link = doc.data().link;
					var location = doc.data().location;
					var org = doc.data().org;
					var username = doc.data().username;
					var backgroundPic = doc.data().backgroundPic;
					var org = doc.data().organization;
					profilePic.src = downloadURL;
					document.getElementById("bgPic").src = backgroundPic;
					document.getElementById("pfName").innerHTML = fln;
					document.getElementById("pfUsername").innerHTML = "@"+username;
					document.getElementById("pfBio").innerHTML = bio;
					document.getElementById("pfLink").innerHTML = link;
					document.getElementById("pfLocation").innerHTML = location;
					document.getElementById("pfRole").innerHTML = role;
					document.getElementById("pfOrg").innerHTML = org;
					document.getElementById("email").value = email;
					document.getElementById("fln").value = fln;
					document.getElementById("interestOne").placeholder = interestOne;
					document.getElementById("interestTwo").value = interestTwo;
					document.getElementById("skillOne").value = skillOne;
					document.getElementById("skillTwo").value = skillTwo;
					document.getElementById("hobbies").value = hobbies;
					document.getElementById("projOne").value = projOne;
					document.getElementById("projTwo").value = projTwo;

					updatePfp.addEventListener("change", (e) => {
						file = e.target.files[0];
						var storageRef = firebase.storage().ref("profilePhotos").child(user.uid);
						storageRef.put(file)
						.then(()=>{
							storageRef.getDownloadURL().then((imgURL)=>{
								db.collection("userInfo")
								.doc(user.uid)
								.update({
									downloadURL: imgURL,
								})
								.then(function () {
									console.log("Profile picture updated");
								})
								.catch(function (error) {
									alert(error);
								});
								firebase.database().ref("users/" + user.uid).update({
									photoURL:imgURL
								}).then(function (){
									alert("Header image updated")
								}).catch(function (error) {
									alert(error);
								});
							})
						})
					});
					updateBgPic.addEventListener("change", (e) => {
						file = e.target.files[0];
						var storageRef = firebase.storage().ref("backgroundPhotos").child(user.uid);
						storageRef.put(file).then(()=>{
							storageRef.getDownloadURL().then((imgURL)=>{
								db.collection("userInfo")
								.doc(user.uid)
								.update({
									backgroundPic: imgURL,
								})
								.then(function () {
									alert("saved");
								})
								.catch(function (error) {
									alert(error);
								});
								firebase.database().ref("users/" + user.uid).update({
									photoURL:imgURL
								})
							})
						})
					});
				}
				
				buttonOne.addEventListener("click", (e) => {
					interestOne = document.getElementById("interestOne").value;
					interestTwo = document.getElementById("interestTwo").value;
					skillOne = document.getElementById("skillOne").value;
					skillTwo = document.getElementById("skillTwo").value;
					hobbies = document.getElementById("hobbies").value;
					projOne = document.getElementById("projOne").value;
					projTwo = document.getElementById("projTwo").value;
					settings = firebase.firestore();
					settings.collection("userInfo").doc(user.uid).update({
						interestOne: interestOne,
						interestTwo: interestTwo,
						skillOne: skillOne,
						skillTwo: skillTwo,
						hobbies: hobbies,
						projOne: projOne,
						projTwo: projTwo,
					}).then(function () {
						alert("saved");
					})
					.catch(function (error) {
						alert(error);
					});
				});
				document.getElementById("usernameButton").addEventListener("click", (e) => {
					username = document.getElementById("newUsername").value;
					settings = firebase.firestore();
					settings.collection("userInfo").doc(user.uid).update({
						username:username,
					}).then(function () {
						alert("Username successfully updated");
					})
					.catch(function (error) {
						alert(error);
					});
				});
				document.getElementById("bioButton").addEventListener("click", (e) => {
					bio = document.getElementById("newBio").value;
					settings = firebase.firestore();
					settings.collection("userInfo").doc(user.uid).update({
						bio:bio,
					}).then(function () {
						alert("Bio successfully updated");
					})
					.catch(function (error) {
						alert(error);
					});
				});
				document.getElementById("linkButton").addEventListener("click", (e) => {
					link = document.getElementById("newLink").value;
					settings = firebase.firestore();
					settings.collection("userInfo").doc(user.uid).update({
						link:link,
					}).then(function () {
						alert("Link successfully updated");
					})
					.catch(function (error) {
						alert(error);
					});
				});
				document.getElementById("locationButton").addEventListener("click", (e) => {
					location = document.getElementById("newLocation").value;
					settings = firebase.firestore();
					settings.collection("userInfo").doc(user.uid).update({
						location:location,
					}).then(function () {
						alert("Location successfully updated");
					})
					.catch(function (error) {
						alert(error);
					});
				});
				document.getElementById("roleButton").addEventListener("click", (e) => {
					role = document.getElementById("newRole").value;
					settings = firebase.firestore();
					settings.collection("userInfo").doc(user.uid).update({
						role:role,
					}).then(function () {
						alert("Role successfully updated");
					})
					.catch(function (error) {
						alert(error);
					});
				});
			});
			time = new Date()
			firebase.firestore().collection("Posts/allPosts/posts")
			.where("uid", "==", user.uid)
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
			});
	}
});