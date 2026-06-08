const signUpButton = document.getElementById('signUpButton');
const signInButton = document.getElementById('signInButton');
const signInForm = document.getElementById('signIn');
const signUpForm = document.getElementById('signup');
const accRecoveryButton = document.getElementById('recoveryButton');
const accRecoveryForm = document.getElementById('recovery');
const returnButton = document.getElementById('returnButton');


signUpButton.addEventListener('click', function () {
	signInForm.style.display = "none";
	signUpForm.style.display = "block";
	accRecoveryForm.style.display = "none";
})

signInButton.addEventListener('click', function () {
	signInForm.style.display = "block";
	signUpForm.style.display = "none";
	accRecoveryForm.style.display = "none";
})

accRecoveryButton.addEventListener('click', function () {
	signInForm.style.display = "none";
	signUpForm.style.display = "none";
	accRecoveryForm.style.display = "block";
})

returnButton.addEventListener('click', function () {
	signInForm.style.display = "block";
	signUpForm.style.display = "none";
	accRecoveryForm.style.display = "none";
})