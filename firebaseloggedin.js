import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import { getFirestore, setDoc, doc, getDocs, collection } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

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
let userid;
let sortby;

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

//paparan pilihan susunan
function sortin(sortby) {
	const tabsButton = document.querySelector('.tabs');
	let all;
	let current;
	let want;
	let done;
	//new elements

	all = document.createElement('A');
	all.href = 'library.html';
	all.className = 'tab-btn active';
	all.textContent = 'All Books';

	current = document.createElement('A');
	current.href = 'library.html?category=current';
	current.className = 'tab-btn';
	current.textContent = 'Currently Reading';

	want = document.createElement('A');
	want.href = 'library.html?category=want';
	want.className = 'tab-btn';
	want.textContent = 'Want to Read';

	done = document.createElement('A');
	done.href = 'library.html?category=finished';
	done.className = 'tab-btn';
	done.textContent = 'Finished';

	if (sortby == 'current') {
		all = document.createElement('A');
		all.href = 'library.html';
		all.className = 'tab-btn';
		all.textContent = 'All Books';

		current = document.createElement('A');
		current.href = 'library.html?category=current';
		current.className = 'tab-btn active';
		current.textContent = 'Currently Reading';

		want = document.createElement('A');
		want.href = 'library.html?category=want';
		want.className = 'tab-btn';
		want.textContent = 'Want to Read';

		done = document.createElement('A');
		done.href = 'library.html?category=finished';
		done.className = 'tab-btn';
		done.textContent = 'Finished';

	} else if (sortby == 'want') {
		all = document.createElement('A');
		all.href = 'library.html';
		all.className = 'tab-btn';
		all.textContent = 'All Books';

		current = document.createElement('A');
		current.href = 'library.html?category=current';
		current.className = 'tab-btn';
		current.textContent = 'Currently Reading';

		want = document.createElement('A');
		want.href = 'library.html?category=want';
		want.className = 'tab-btn active';
		want.textContent = 'Want to Read';

		done = document.createElement('A');
		done.href = 'library.html?category=finished';
		done.className = 'tab-btn';
		done.textContent = 'Finished';

	} else if (sortby == 'finished') {
		all = document.createElement('A');
		all.href = 'library.html';
		all.className = 'tab-btn';
		all.textContent = 'All Books';

		current = document.createElement('A');
		current.href = 'library.html?category=current';
		current.className = 'tab-btn';
		current.textContent = 'Currently Reading';

		want = document.createElement('A');
		want.href = 'library.html?category=want';
		want.className = 'tab-btn';
		want.textContent = 'Want to Read';

		done = document.createElement('A');
		done.href = 'library.html?category=finished';
		done.className = 'tab-btn active';
		done.textContent = 'Finished';

	}


	tabsButton.appendChild(all);
	tabsButton.appendChild(current);
	tabsButton.appendChild(want);
	tabsButton.appendChild(done);
}

//Tambah buku pada grid buku
function addbookCard(id, title, author, genre, status, progress, bookNotes) {
	//alert(genre);
	const cardgrid = document.querySelector('.books-grid');
	//new elements
	const newcard = document.createElement('DIV');
	newcard.className = 'book-card';
	const newcardCover = document.createElement('DIV');
	newcardCover.className = 'book-cover';
	const newcardbody = document.createElement('IMG');
	newcardbody.src = 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=400';
	newcardbody.alt = 'Book Cover';
	const link = document.createElement('A');
	link.href = 'details.html?id=' + id;
	const newcardbody2 = document.createElement('SPAN');
	newcardbody2.className = 'badge badge-reading';
	newcardbody2.textContent = status;

	const book_info = document.createElement('DIV');
	book_info.className = 'book-info';
	const H3 = document.createElement('H3');
	H3.className = 'book-title';
	H3.textContent = title;
	const p = document.createElement('p');
	p.className = 'book-author';
	p.textContent = author;
	const q = document.createElement('q');
	q.className = 'book-genre';
	q.textContent = genre;
	const book_progress = document.createElement('DIV');
	book_progress.className = 'book-progress';
	const progress_bar = document.createElement('DIV');
	progress_bar.className = 'progress-bar';
	progress_bar.style = 'width: ' + progress + '%;';
	const progress_text = document.createElement('SPAN');
	progress_text.className = 'progress-text';
	progress_text.textContent = progress + '% Read';


	cardgrid.appendChild(newcard);
	newcard.appendChild(newcardCover);
	link.appendChild(newcardbody);
	newcardCover.appendChild(link);
	newcardCover.appendChild(newcardbody2);

	book_info.appendChild(H3);
	book_info.appendChild(p);
	book_info.appendChild(q);

	book_progress.appendChild(progress_bar);
	book_progress.appendChild(progress_text);

	book_info.appendChild(book_progress);
	newcard.appendChild(book_info);
}

//Kumpul semua data buku dan asingkan mengikut account id & pilihan sorting 
async function getAllDocuments(userId, sortby) {
	const querySnapshot = await getDocs(collection(db, "book"));
	let bookId;
	let title;
	let author;
	let genre;
	let status;
	let progress;
	let bookNotes;
	sortin(sortby);

	querySnapshot.forEach((doc) => {
		//console.log(doc.id, " => ", doc.data());
		const accId = doc.get("accId");
		if (doc.get("accId") == userId) {
			//alert(doc.id);
			bookId = doc.id;
			title = doc.get("title");
			author = doc.get("author");
			genre = doc.get("genre");
			status = doc.get("status");
			progress = doc.get("progress");
			bookNotes = doc.get("author");

			if (sortby == 'none') {
				addbookCard(bookId, title, author, genre, status, progress, bookNotes);
			} else if (sortby == 'want' && doc.get("status") == 'Want to Read') {
				addbookCard(bookId, title, author, genre, status, progress, bookNotes);
			} else if (sortby == 'current' && doc.get("status") == 'Currently Reading') {
				addbookCard(bookId, title, author, genre, status, progress, bookNotes);
			} else if (sortby == 'finished' && doc.get("status") == 'Finished') {
				addbookCard(bookId, title, author, genre, status, progress, bookNotes);
			}

		}
	});
}
//for checking if user is already logged in or not.
onAuthStateChanged(auth, (user) => {
	//alert(user.uid);
	if (user) {
		userid = user.uid;
		// Get the query string from the current URL
		const params = new URLSearchParams(window.location.search);

		// Retrieve a specific value by its key
		const productType = params.get('category');

		if (productType !== null) {
			getAllDocuments(userid, productType);
		} else {
			getAllDocuments(userid, 'none');
		}

	} else {
		window.location.href = "/index.html";
	}
});

