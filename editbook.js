import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import { getFirestore, addDoc, doc, getDocs, collection, updateDoc } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";
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

const auth = getAuth();
const db = getFirestore();

let userid;
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
let querySnapshot;

//used for hiding button at page start up and enable once data is display to avoid unintended issue.
document.getElementById("editBook").style.visibility = "hidden";
document.getElementById("cancel1").style.visibility = "hidden";
document.getElementById("cancel2").style.visibility = "hidden"; 
document.getElementById("status").style.visibility = "hidden";


onAuthStateChanged(auth, (user) => {

	if (user) {
		getbook(user.uid)
	} else {
		alert("account not found");
		//window.location.href = "/index.html";
	}
});

const addbooks = document.getElementById('addBook');
if (addbooks != null) {
	addbooks.addEventListener('click', (event) => {
		//alert("button was clicked");
		event.preventDefault();
		const id = document.getElementById('bookId').value;
		const title = document.getElementById('bookTitle').value;
		const author = document.getElementById('bookAuthor').value;
		const genre = document.getElementById('bookGenre').value;
		const status = document.getElementById('bookStatus').value;
		const pages = document.getElementById('bookPages').value;
		const bookNotes = document.getElementById('bookNotes').value;
		const booksIds = document.getElementById('bookId').value;


		const auth = getAuth();
		const db = getFirestore();

		let accIds;

		onAuthStateChanged(auth, (user) => {

			if (user) {
				const uid = user.uid;

				const bookData = {
					booksId: booksIds,
					id: id,
					accId: uid,
					title: title,
					author: author,
					genre: genre,
					status: status,
					totalpages: pages,
					bookNotes: bookNotes,
					startDate: '',
					endDate: '',
					readPage: '0',
					star: '0',
					progress: '0'
				};

				const docRef2 = addDoc(collection(db, "book"), bookData)
					.then(() => {
						alert("Book Added Successfully");
						window.close();
					})


			} else {
				alert("account not found");
			}
		});
	})
}

const editbooks = document.getElementById('editBook');
if (editbooks != null) {
	editbooks.addEventListener('click', (event) => {
		
		//used for hiding button at page start up and enable once data is display to avoid unintended issue.
		document.getElementById("editBook").style.visibility = "hidden";
		document.getElementById("cancel1").style.visibility = "hidden";
		document.getElementById("cancel2").style.visibility = "hidden";

		updateBook();
	})
}

async function getbook(userId) {
	querySnapshot = await getDocs(collection(db, "book"));

	const params = new URLSearchParams(window.location.search);

	const paramType = params.get('id');

	if (paramType !== null) {
		bookId = paramType;
	}

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
				bookNotes = doc.get("bookNotes");
				tPage = doc.get("totalpages");

				addbookDetail(doc.get("id"), title, author, genre, status, bookNotes, tPage);
				return true;
			}

		}
	});
}

function addbookDetail(bookId, title, author, genre, status, bookNotes, tPage) {
	document.getElementById("bookId").value = bookId;
	document.getElementById("bookTitle").value = title;
	document.getElementById("bookAuthor").value = author;
	document.getElementById("bookGenre").value = genre;
	document.getElementById("bookStatus").value = status;
	document.getElementById("bookNotes").value = bookNotes;
	document.getElementById("bookPages").value = tPage;

	//used for hiding button at page start up and enable once data is display to avoid unintended issue.
	document.getElementById("editBook").style.visibility = "visible";
	document.getElementById("cancel1").style.visibility = "visible";
	document.getElementById("cancel2").style.visibility = "visible";
	document.getElementById("status").style.visibility = "visible";
	
}

async function updateBook() {
	const params = new URLSearchParams(window.location.search);

	const paramType = params.get('id');

	if (paramType !== null) {
		bookId = paramType;
	}
	try {

		let ids = document.getElementById('bookId').value;
		let titles = document.getElementById('bookTitle').value;
		let authors = document.getElementById('bookAuthor').value;
		let genres = document.getElementById('bookGenre').value;
		let statuss = document.getElementById('bookStatus').value;
		let bookNotess = document.getElementById('bookNotes').value;
		let tpages = document.getElementById('bookPages').value;

		const db = getFirestore();

		docRef = doc(db, 'book', bookId);
		
		await updateDoc(docRef, {
			id: ids,
			title: titles,
			author: authors,
			genre: genres,
			status: statuss,
			bookNotes: bookNotess,
			totalpages: tpages
		});

		console.log('##### Update complete');
	} catch (error) {
		console.log(error);
	}

	alert('Book successful updated!');
	window.location.href = "/library.html";

}
