import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import { getFirestore, setDoc, doc, getDocs, collection, updateDoc, deleteDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

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

let userid = null;
let bookId = null;
let docRef;
let title;
let author;
let genre;
let status;
let rProgress = 0;
let bookNotes;
let star;
let sDate;
let eDate;
let rPage;
let tPage;
let streak;
let newProgress;

//used for hiding button at page start up and enable once data is display to avoid unintended issue.
document.getElementById("updatebook").style.visibility = "hidden";
document.getElementById("editbook").style.visibility = "hidden";
document.getElementById("delbook").style.visibility = "hidden";

// getting book details and display the result
function addbookDetail(id, title, author, genre, status, progress, bookNotes, star, sDate, eDate, rPage, tPage) {



	if (star != 0) {
		document.getElementById("star").innerHTML = "<strong>" + star + "</strong>";
	}

	document.getElementById("title").innerHTML = title;
	document.getElementById("author").innerHTML = author;
	document.getElementById("title2").innerHTML = title;
	document.getElementById("author2").innerHTML = author;
	document.getElementById("genre").innerHTML = genre;
	document.getElementById("author").innerHTML = author;
	document.getElementById('progressBar').style.width = progress + '%';
	document.getElementById("progressT").innerHTML = progress + '%';
	document.getElementById("status").innerHTML = status;


	for (let i = 1; i <= parseInt(star); i++) {
		document.getElementById("star" + i.toString()).className = 'fa-solid fa-star';
	}

	if (progress != 100) {
		document.getElementById("startEnd").innerHTML = 'Started On';
		document.getElementById("date").innerHTML = sDate;
		document.getElementById("updatebook").style.visibility = "visible";
	} else {
		document.getElementById("startEnd").innerHTML = 'Finished On';
		document.getElementById("date").innerHTML = eDate;
	}

	document.getElementById("progress2").innerHTML = progress + '%';
	document.getElementById("note").textContent = bookNotes;
	document.getElementById("pCount").textContent = '(' + rPage + ' / ' + tPage + ' page/s)';

	document.getElementById("editbook").style.visibility = "visible";
	document.getElementById("delbook").style.visibility = "visible";
}
// getting book by current user ID
async function getbook(userId) {
	const params = new URLSearchParams(window.location.search);

	const paramType = params.get('id');

	if (paramType !== null) {
		bookId = paramType;
	}

	let querySnapshot = await getDocs(collection(db, "users"));
	querySnapshot.forEach((doc) => {
		//console.log(doc.id, " => ", doc.data());
		const accId = doc.get("accId");
		if (doc.id == userId) {
			newProgress = doc.get("dailyPage");
		}
	});

	querySnapshot = await getDocs(collection(db, "book"));
	querySnapshot.forEach((doc) => {
		//console.log(doc.id, " => ", doc.data());
		const accId = doc.get("accId");
		if (doc.get("accId") == userId) {


			if (bookId == doc.id) {
				title = doc.get("title");
				author = doc.get("author");
				genre = doc.get("genre");
				status = doc.get("status");
				rProgress = doc.get("progress");
				bookNotes = doc.get("bookNotes");
				star = doc.get("star");
				sDate = doc.get("startDate");
				eDate = doc.get("endDate");
				rPage = doc.get("readPage");
				tPage = doc.get("totalpages");

				addbookDetail(bookId, title, author, genre, status, rProgress, bookNotes, star, sDate, eDate, rPage, tPage);

				return true;
			}

		}
	});

}

/**
	 * Updates the user's daily streak and saves the weekday name in Firestore
	 * param {string} userId - The unique ID of the logged-in user
	 */
async function getLastRead(userId) {
	const userRef = doc(db, "users", userId);
	// Get date strings
	const today = new Date();
	const todayStr = today.toISOString().split('T')[0]; // "2026-06-01"

	let newpageCount;

	// Get the English weekday name (e.g., "Monday")
	const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(today);

	try {
		const userDoc = await getDoc(userRef);

		//save page read count
		if (!userDoc.exists() || !userDoc.data().dailyPage) {
			newpageCount = newProgress;
			await setDoc(userRef, {
				dailyPage: newProgress
			}, { merge: true });
		} else {
			newpageCount = newProgress++;
			await setDoc(userRef, {
				dailyPage: newpageCount
			}, { merge: true });
		}

		// Case 1: New user or no streak data exists
		if (!userDoc.exists() || !userDoc.data().streakCount) {

			await setDoc(userRef, {
				streakCount: 1,
				lastRead: todayStr,
				lastBookId: bookId,
				[dayName]: 1
			}, { merge: true });

			console.log(`Streak started on ${dayName}!`);
			window.location.href = "/details.html?id=" + bookId;
			return;
			//window.location.href = "/details.html?id=" + bookId;
		} else {
			console.log(`Streak exists. Continue...`);
		}

		const { streakCount, lastRead } = userDoc.data();

		// Calculate date difference
		const lastDate = new Date(lastRead);
		const todayDate = new Date(todayStr);
		const diffTime = Math.abs(todayDate - lastDate);
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		if (newpageCount >= 5) {
			if (todayStr === lastRead) {
				// Case 2: Already logged in today
				console.log(`Streak maintained on ${dayName}. Current streak: ${streakCount}`);
			} else if (diffDays === 1) {
				// Case 3: Logged in exactly one day later
				const newCount = streakCount + 1;
				await updateDoc(userRef, {
					streakCount: newCount,
					lastRead: todayStr,
					[dayName]: 1
				});
				console.log(`Streak extended on ${dayName}! New streak: ${newCount}`);
			} else {
				// Case 4: Streak broken
				await updateDoc(userRef, {
					streakCount: 0,
					Monday: 0,
					Tuesday: 0,
					Wednesday: 0,
					Thursday: 0,
					Friday: 0,
					Saturday: 0,
					Sunday: 0,
				});
				console.log(`Streak broken. Reset to 0 on ${dayName}.`);
			}
		}
		await setDoc(userRef, {
			lastBookId: bookId
		}, { merge: true });

		// return back to book page
		window.location.href = "/details.html?id=" + bookId;
	} catch (error) {
		console.error("Error updating streak: ", error);
	}
}

//for checking if user is already logged in or not & getting current user id.
onAuthStateChanged(auth, (user) => {

	if (user) {

		userid = user.uid;

		getbook(userid);

	} else {

		window.location.href = "/index.html";

	}
});
// listener for click button event
const updatebook = document.getElementById('updatebook');
updatebook.addEventListener('click', (event) => {
	updateRead();
})
// function to update read
async function updateRead() {
	document.getElementById("updatebook").style.visibility = "hidden";
	document.getElementById("editbook").style.visibility = "hidden";
	document.getElementById("delbook").style.visibility = "hidden";


	docRef = doc(db, 'book', bookId);
	const date = new Date();
	const currentYear = date.getFullYear(); // e.g. 2026
	const currentMonthText = date.toLocaleString('default', { month: 'long' }); // e.g. May
	const currentDay = date.getDate(); // e.g. 28
	const dateOnlyString = new Date().toISOString().split('T')[0];
	if (rProgress != 100) {

		newProgress = prompt("insert the number of page that you have read");
		const newProgressAdd = parseInt(newProgress) + parseInt(rPage);

		if (newProgressAdd !== null && !isNaN(newProgressAdd) && newProgressAdd >= parseInt(rPage) && newProgressAdd <= parseInt(tPage)) {
			// Ubah lebar progress bar
			const newPercent = parseInt((parseInt(newProgressAdd) / parseInt(tPage)) * 100);
			document.getElementById('progressBar').style.width = newPercent + '%';
			// Ubah teks persentase
			document.getElementById('progressT').innerText = newPercent + '%';

			const db = getFirestore();
			// get database reference
			docRef = doc(db, 'book', bookId);
			if (sDate == '') {
				sDate = currentDay + ' ' + currentMonthText + ' ' + currentYear;
			}

			if (newPercent == 100) {

				eDate = currentDay + ' ' + currentMonthText + ' ' + currentYear;
				// get database reference
				docRef = doc(db, 'book', bookId);
				await updateDoc(docRef, {
					progress: newPercent,
					endDate: eDate,
					status: 'Finished',
					readPage: newProgressAdd
				});

				const stars = prompt("Great!! Looks like you just finish this book! How would you rate this book (1-5 stars) ?");
				if (stars !== null && !isNaN(stars) && stars >= 0 && stars <= 5) {
					// get database reference
					docRef = doc(db, 'book', bookId);
					await updateDoc(docRef, {
						star: stars
					});

					alert('Congrats again!! See you in your next book!!1');

					//check and update streak
					getLastRead(userid);
				} else {
					alert('invalid star ratings');
				}
			} else {
				docRef = doc(db, 'book', bookId);
				await updateDoc(docRef, {
					progress: newPercent,
					startDate: sDate,
					readPage: newProgressAdd
				});

				alert('Congrats!! Keep reading!!');

				//check and update streak
				getLastRead(userid);
			}
		} else if (newProgress == null) {
			document.getElementById("updatebook").style.visibility = "visible";
			document.getElementById("editbook").style.visibility = "visible";
			document.getElementById("delbook").style.visibility = "visible";
		} else {
			alert('read page value is lower than already read page or higher than max book page');
		}

	} else if (star == 0) {
		const stars = prompt("Great!! Looks like you just finish this book! How would you rate this book (1-5 stars) ?");
		if (stars !== null && !isNaN(stars) && stars >= 0 && stars <= 5) {
			// get database reference
			docRef = doc(db, 'book', bookId);

			// get current date
			const date = new Date();

			const currentYear = date.getFullYear(); // e.g. 2026
			const currentMonthText = date.toLocaleString('default', { month: 'long' }); // e.g. May
			const currentDay = date.getDate(); // e.g. 28
			eDate = currentDay + ' ' + currentMonthText + ' ' + currentYear;

			// get database reference
			docRef = doc(db, 'book', bookId);
			// update data to existing database
			await updateDoc(docRef, {
				endDate: eDate,
				star: stars
			});
			alert('Congratz again!! See you in your next book!!');
			// return back to book page
			window.location.href = "/details.html?id=" + bookId;
		} else {
			alert('invalid star ratings');
		}
	}

}

const delbook = document.getElementById('delbook');
delbook.addEventListener('click', (event) => {
	deleteBook();
})

async function deleteBook() {
	let confirmation = confirm("Are you sure you want to delete this book?");
	document.getElementById("updatebook").style.visibility = "hidden";
	document.getElementById("editbook").style.visibility = "hidden";
	document.getElementById("delbook").style.visibility = "hidden";
	if (confirmation) {
		await deleteDoc(doc(db, "book", bookId));
		alert("Book remove successfully");
		window.location.href = "library.html";
	} else {
		document.getElementById("updatebook").style.visibility = "visible";
		document.getElementById("editbook").style.visibility = "visible";
		document.getElementById("delbook").style.visibility = "visible";
	}

}

//test by nadiah

const editbook = document.getElementById('editbook');
editbook.addEventListener('click', (event) => {

	window.location.href = "/editbook.html?id=" + bookId;

})

/* function editbook(id, title, author, genre, status, progress, bookNotes, star, sDate, eDate, rPage, tPage){
 

 document.getElementById("star").innerHTML = "<strong>"+star+"</strong>";
 document.getElementById("title").innerHTML = title;
 document.getElementById("author").innerHTML = author;
 document.getElementById("title2").innerHTML = title;
 document.getElementById("author2").innerHTML = author;
 document.getElementById("genre").innerHTML = genre;
 document.getElementById("author").innerHTML = author;
 document.getElementById('progressBar').style.width = progress + '%';
 document.getElementById("progressT").innerHTML = progress+ '%';
 document.getElementById("status").innerHTML = status;

}*/