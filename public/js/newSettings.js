const buttonOne = document.getElementById("buttonOne");
const buttonTwo = document.getElementById("buttonTwo");
const profilePic = document.getElementById("profilePicProfile");
const updatePfp = document.getElementById("profilePicUpdate");
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
					var bgPic = doc.data().backgroundPic;
					var downloadURL = doc.data().downloadURL;
					var fln = doc.data().fln;
					var email = doc.data().email;
					var state = doc.data().state;
					var role = doc.data().role;
					var interestOne = doc.data().interestOne;
					var interestTwo = doc.data().interestTwo;
					var skillOne = doc.data().skillOne;
					var skillTwo = doc.data().skillTwo;
					var hobbies = doc.data().hobbies;
					var bio = doc.data().bio;
					var projOne = doc.data().projOne;
					var projTwo = doc.data().projTwo;
					document.getElementById("profileBanner").src = bgPic
					profilePic.src = downloadURL;
					document.getElementById("fln").value = fln;
					document.getElementById("email").value = email;
					document.getElementById("state").value = state;
					document.getElementById("role").value = role;
					document.getElementById("interestOne").value = interestOne;
					document.getElementById("interestTwo").value = interestTwo;
					document.getElementById("skillOne").value = skillOne;
					document.getElementById("skillTwo").value = skillTwo;
					document.getElementById("hobbies").value = hobbies;
					document.getElementById("bio").value = bio;
					document.getElementById("projOne").value = projOne;
					document.getElementById("projTwo").value = projTwo;
                }
                about = document.getElementById('about')
posts = document.getElementById('posts')

window.onload = function(){
	alert("cock")
	// about.style.color = "#1E90FF";
  	// posts.style.color = "black";
  	// for(var i = 0; i < document.getElementsByClassName("eachPostBox").length; i++){
    // document.getElementsByClassName("eachPostBox")[i].style.display = "none"; 
    // }
}

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
				// updatePfp.addEventListener("change", (e) => {
				// 	file = e.target.files[0];
				// 	var storageRef = firebase.storage().ref("users").child(user.uid);
				// 	storageRef.put(file);
				// 	console.log("File uploaded to firebase storage");
				// 	var downloadURL = doc.data().downloadURL;
				// 	db.collection("userInfo")
				// 		.doc(user.uid)
				// 		.update({
				// 			downloadURL: downloadURL,
				// 		})
				// 		.then(function () {
				// 			console.log("saved");
				// 		})
				// 		.catch(function (error) {
				// 			console.log("error");
				// 		});
				// });
				buttonTwo.addEventListener("click", (e) => {
					state = document.getElementById("state").value;
					role = document.getElementById("role").value;
					interestOne = document.getElementById("interestOne").value;
					interestTwo = document.getElementById("interestTwo").value;
					skillOne = document.getElementById("skillOne").value;
					skillTwo = document.getElementById("skillTwo").value;
					hobbies = document.getElementById("hobbies").value;
					bio = document.getElementById("bio").value;
					projOne = document.getElementById("projOne").value;
					projTwo = document.getElementById("projTwo").value;
					settings = firebase.firestore();
					settings.collection("userInfo").doc(user.uid).update({
						state: state,
						role: role,
						interestOne: interestOne,
						interestTwo: interestTwo,
						skillOne: skillOne,
						skillTwo: skillTwo,
						hobbies: hobbies,
						bio: bio,
						projOne: projOne,
						projTwo: projTwo,
					});
				});
			});
	}
});