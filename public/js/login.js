const btnLogin = document.getElementById("login");
const Txtemail = document.getElementById("email");
const Txtpassword = document.getElementById("password");
btnLogin.addEventListener("click", (e) => {
	const email = Txtemail.value;
	const password = Txtpassword.value;
	const auth = firebase.auth();
	const promise = auth
		.signInWithEmailAndPassword(email, password)
		.catch(function (error) {
			alert("Error logging into your  account, please try again");
		});
});
document.addEventListener("keydown", function (key) {
	if (key.which === 13) {
		const email = Txtemail.value;
		const password = Txtpassword.value;
		const auth = firebase.auth();
		const promise = auth
			.signInWithEmailAndPassword(email, password)
			.catch(function (error) {
				alert("Error logging into your  account, please try again");
			});
	}
});
firebase.auth().onAuthStateChanged(function (user) {
	if (user) {
		var user = firebase.auth().currentUser;
		window.location = "home.html";
	}
});
