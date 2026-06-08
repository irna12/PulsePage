import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import { getFirestore, setDoc, doc, getDocs, collection, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

const firebaseConfig = {
	apiKey: "AIzaSyBrRGZOjI8VFKxtc9lWBmXwIg8mTmMuC3s",
	authDomain: "miscellanea-8efa2.firebaseapp.com",
	projectId: "miscellanea-8efa2",
	storageBucket: "miscellanea-8efa2.firebasestorage.app",
	messagingSenderId: "822720442429",
	appId: "1:822720442429:web:744113f0275f4954f0ba54"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth();
const db = getFirestore();



let userid, docRef, bookId, title, author, bookCount, progress, finishCount, planCount, readCount, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday, streakCount;


onAuthStateChanged(auth, (user) => {

	if (user) {

		userid = user.uid;
		//used for hiding button at page start up and enable once data is display to avoid unintended issue.
		//document.getElementById("menu").style.visibility = "hidden"; 
		//document.getElementById("overview").style.visibility = "hidden";
		dashboardSetup(userid);

	} else {

		window.location.href = "/index.html";

	}
});

const logoutButton = document.getElementById('logout');
logoutButton.addEventListener('click', () => {
	localStorage.removeItem('loggedInUserId');
	signOut(auth)
		.then(() => {
			window.location.href = 'mainpage.html';
		})
		.catch((error) => {
			console.error('Error Signing out:', error);
		})
})

const signIn = document.getElementById('submitSignIn');
if (signIn != null) {
	signIn.addEventListener('click', (event) => {
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
}

async function dashboardSetup(userid) {
	//2. Build the exact payload resetting all days, setting today to 1

	const updatedWeek = {
		streakCount: 0,
		Monday: 0,
		Tuesday: 0,
		Wednesday: 0,
		Thursday: 0,
		Friday: 0,
		Saturday: 0,
		Sunday: 0,
	};

	const userRef = doc(db, "users", userid);
	const userDoc = await getDoc(userRef);

	try {
		//setting up database for streak system
		if (!userDoc.exists() || !userDoc.data().streakCount) {
			await setDoc(userRef, updatedWeek, { merge: true });
		}

		let querySnapshot = await getDocs(collection(db, "users"));
		querySnapshot.forEach((doc) => {

			const accId = doc.get("accId");
			if (doc.id == userid) {
				bookId = doc.get("lastBookId");
				streakCount = doc.get("streakCount");
				Monday = doc.get("Monday");
				Tuesday = doc.get("Tuesday");
				Wednesday = doc.get("Wednesday");
				Thursday = doc.get("Thursday");
				Friday = doc.get("Friday");
				Saturday = doc.get("Saturday");
				Sunday = doc.get("Sunday");
				return true
			}
		});

		
		//streak checking
		const today = new Date();
		const todayStr = today.toISOString().split('T')[0]; // "2026-06-01"
		const { streakCount: currentStreak, lastRead: lastReadTime } = userDoc.data();

		// Get the English weekday name (e.g., "Monday")
		const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(today);

		// Calculate date difference
		const lastDate = new Date(lastReadTime);
		const todayDate = new Date(todayStr);
		const diffTime = Math.abs(todayDate - lastDate);
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

		if (diffDays >= 1) {
			// Streak broken
			await updateDoc(userRef, {
				dailyPage: 0
			});
			console.log(`Reseting daily page count.`);
		}

		if (diffDays >= 2) {
			// Streak broken
			await updateDoc(userRef, {
				streakCount: 0,
				lastRead: todayStr,
				lastBookId: bookId,
				Monday: 0,
				Tuesday: 0,
				Wednesday: 0,
				Thursday: 0,
				Friday: 0,
				Saturday: 0,
				Sunday: 0,
				dailyPage: 0
			});
			console.log(`Streak broken. Reset to 0 on ${dayName}.`);
			alert("Your reading streak has been reset. Please read at least 5 page of one book daily to keep the streak!");
		}

		//getting last read books detail
		querySnapshot = await getDocs(collection(db, "book"));
		querySnapshot.forEach((doc) => {

			const accId = doc.get("accId");

			if (doc.get("accId") == userid) {

				if (bookId == doc.id) {
					title = doc.get("title");
					author = doc.get("author");
					progress = doc.get("progress");
					return true;
				}

			}
		});

		//counting registered books
		bookCount = 0;
		querySnapshot = await getDocs(collection(db, "book"));
		querySnapshot.forEach((doc) => {

			const accId = doc.get("accId");

			if (doc.get("accId") == userid) {

				bookCount++;

			}
		});

		//counting currently read books
		readCount = 0;
		querySnapshot = await getDocs(collection(db, "book"));
		querySnapshot.forEach((doc) => {

			const accId = doc.get("accId");

			if (doc.get("accId") == userid) {

				if (doc.get("status") === 'Currently Reading') {
					readCount++;
				}
			}
		});

		//counting finished books
		finishCount = 0;
		querySnapshot = await getDocs(collection(db, "book"));
		querySnapshot.forEach((doc) => {

			const accId = doc.get("accId");

			if (doc.get("accId") == userid) {

				if (doc.get("status") === 'Finished') {
					finishCount++;
				}
			}
		});

		//counting want to read books
		planCount = 0;
		querySnapshot = await getDocs(collection(db, "book"));
		querySnapshot.forEach((doc) => {

			const accId = doc.get("accId");

			if (doc.get("accId") == userid) {

				if (doc.get("status") === 'Want to Read') {
					planCount++;
				}
			}
		});
		addbookDetail(bookId, title, author, progress, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday, streakCount);
		console.log(`Successfully updated Firebase!`);
	} catch (error) {
		console.error("Error updating Firebase document: ", error);
	}
}

function addbookDetail(bookId, title, author, progress) {
		document.getElementById("bookTitle").textContent = title;
	document.getElementById("bookAuthor").value = author;
	document.getElementById("progressBar").style = "width: " + progress + "%";
	document.getElementById("progressText").textContent = progress + "%";
	
	document.getElementById("streakCount").textContent = streakCount;
	document.getElementById("Mon").className = (Monday === 0) ? 'day' : 'day completed';
	document.getElementById("Tue").className = (Tuesday === 0) ? "day" : "day completed";
	document.getElementById("Wed").className = (Wednesday === 0) ? "day" : "day completed";
	document.getElementById("Thu").className = (Thursday === 0) ? "day" : "day completed";
	document.getElementById("Fri").className = (Friday === 0) ? "day" : "day completed";
	document.getElementById("Sat").className = (Saturday === 0) ? "day" : "day completed";
	document.getElementById("Sun").className = (Sunday === 0) ? "day" : "day completed";
	
	document.getElementById("totalBooks").textContent = bookCount;
	document.getElementById("currentRead").textContent = readCount;
	document.getElementById("currentFinish").textContent = finishCount;
	document.getElementById("currentPlan").textContent = planCount;
	
	//re-enable all button
	document.getElementById("menu").style.visibility = "visible";
	document.getElementById("overview").style.visibility = "visible";
}

