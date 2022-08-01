function reset() {
	var auth = firebase.auth();
	var email = $("#email").val();

	if (email != "") {
		auth
			.sendPasswordResetEmail(email)
			.then(function () {
				window.alert("Email has been sent to you, Please check and verify");
			})
			.catch(function (error) {
				alert(error);
			});
	} else {
		window.alert("Please input your email first");
	}
}
