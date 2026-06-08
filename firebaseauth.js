
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import { getFirestore, setDoc, doc } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
	apiKey: "AIzaSyBrRGZOjI8VFKxtc9lWBmXwIg8mTmMuC3s",
	authDomain: "miscellanea-8efa2.firebaseapp.com",
	projectId: "miscellanea-8efa2",
	storageBucket: "miscellanea-8efa2.firebasestorage.app",
	messagingSenderId: "822720442429",
	appId: "1:822720442429:web:744113f0275f4954f0ba54"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

function showMessage(message, divId) {
	var messageDiv = document.getElementById(divId);
	messageDiv.style.display = "block";
	messageDiv.innerHTML = message;
	messageDiv.style.opacity = 1;
	setTimeout(function () {
		messageDiv.style.opacity = 0;
	}, 5000);
}
const signUp = document.getElementById('submitSignUp');
signUp.addEventListener('click', (event) => {
	event.preventDefault();
	const email = document.getElementById('rEmail').value;
	const password = document.getElementById('rPassword').value;
	const Username = document.getElementById('fName').value;


	const auth = getAuth();
	const db = getFirestore();

	createUserWithEmailAndPassword(auth, email, password)
		.then((userCredential) => {
			const user = userCredential.user;
			const userData = {
				email: email,
				username: Username
			};
			showMessage('Account Created Successfully', 'signUpMessage');
			const docRef = doc(db, "users", user.uid);
			setDoc(docRef, userData)
				.then(() => {
					window.location.href = 'index.html';
				})
				.catch((error) => {
					console.error("error writing document", error);

				});
		})
		.catch((error) => {
			const errorCode = error.code;
			if (errorCode == 'auth/email-already-in-use') {
				showMessage('Email Address Already Exists !!!', 'signUpMessage');
			}
			else {
				showMessage('unable to create User', 'signUpMessage');
			}
		})
});

const signIn = document.getElementById('submitSignIn');
signIn.addEventListener('click', (event) => {
	//alert("button was clicked");
	event.preventDefault();
	const email = document.getElementById('email').value;
	const password = document.getElementById('password').value;
	const auth = getAuth();

	signInWithEmailAndPassword(auth, email, password)
		.then((userCredential) => {
			showMessage('login is successful', 'signInMessage');
			const user = userCredential.user;
			localStorage.setItem('loggedInUserId', user.uid);
			window.location.href = 'homepage.html';
		})
		.catch((error) => {
			const errorCode = error.code;
			if (errorCode === 'auth/invalid-credential') {
				showMessage('Incorrect Email or Password', 'signInMessage');
			}
			else {
				showMessage('Account does not Exist', 'signInMessage');
			}
		})
})

const recovery = document.getElementById('submitReset');
recovery.addEventListener('click', (event) => {
	//alert("button was clicked");
	event.preventDefault();
	const email = document.getElementById('emailRecovery').value;
	const auth = getAuth();

	sendPasswordResetEmail(auth, email)
		.then(() => {
			// Password reset email sent!
			alert("Recovery mail has been sent to '" + email + "' Recovery mail might takes some times to arrived. Please check spam mail too!")
			window.location.href = 'index.html';
		})
		.catch((error) => {
			// Handle errors (e.g., user not found)
			const errorInfo = error.message;
			alert(errorInfo)
		});
})

