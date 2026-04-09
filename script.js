// 🔥 FIREBASE IMPORTS
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
    getFirestore,
    setDoc,
    doc,
    collection,
    deleteDoc,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔥 FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyDOThmK9YT2LJHGbzkE_BWcW33znEsWe58",
  authDomain: "seating-layout.firebaseapp.com",
  projectId: "seating-layout",
  storageBucket: "seating-layout.firebasestorage.app",
  messagingSenderId: "413852662122",
  appId: "1:413852662122:web:e7d382f8a36d06d10a4d13"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 📦 GLOBAL
const layout = document.getElementById("layout");
let selectedSeat = null;
let assignments = {};

// 🪑 ROW CONFIG
const rows = [
    12,12,12,12,12,12,12,12,12,12,
    12,12,12,12,12,
    11,10,9,8
];

window.addEventListener("DOMContentLoaded", () => {
    init();
});
function init() {

    onSnapshot(collection(db, "seats"), (snapshot) => {

        assignments = {};

        snapshot.forEach((docSnap) => {
            assignments[docSnap.id] = docSnap.data();
        });

        renderSeats();
        updateTable();
    });
}

// 🎨 RENDER
function renderSeats() {

    layout.innerHTML = "";

    rows.forEach((seats, rowIndex) => {

        const row = document.createElement("div");
        row.className = "row";

        const left = document.createElement("div");
        left.className = "block";

        const aisle = document.createElement("div");
        aisle.className = "aisle";

        const right = document.createElement("div");
        right.className = "block";

        for (let i = 1; i <= seats; i++) {

            left.appendChild(createSeat(`L-${rowIndex+1}-${i}`, rowIndex, i));
            right.appendChild(createSeat(`R-${rowIndex+1}-${i}`, rowIndex, i));
        }

        row.appendChild(left);
        row.appendChild(aisle);
        row.appendChild(right);

        layout.appendChild(row);
    });
}

// 🎯 CREATE SEAT
function createSeat(code, row, col) {

    const seat = document.createElement("div");
    seat.className = "seat";
    seat.innerText = code;

    // First row empty
    if (row === rows.length - 1) {
        seat.style.background = "#ddd";
        return seat;
    }

    // Alternate seating (gap rule)
    if (col % 2 === 0) {
        seat.style.visibility = "hidden";
    }

    // 🎯 DEFAULT COLORING (VERY IMPORTANT FIX)
    if (row < 10) {
        if (code.startsWith("L")) {
            seat.classList.add("opposition");
        } else {
            seat.classList.add("ruling");
        }
    } else {
        seat.classList.add("individual");
    }

    // 🔥 Override if assigned
    if (assignments[code]) {
        seat.className = "seat " + assignments[code].category.toLowerCase();
        seat.title = assignments[code].name;
    }

    seat.onclick = () => selectSeat(seat, code);

    return seat;
}

// 🟡 SELECT
function selectSeat(seat, code) {

    if (seat.style.visibility === "hidden") return;

    document.querySelectorAll(".seat").forEach(s => s.classList.remove("selected"));

    seat.classList.add("selected");
    selectedSeat = code;

    document.getElementById("seatCode").value = code;

    // Autofill if already assigned
    if (assignments[code]) {
        document.getElementById("name").value = assignments[code].name;
        document.getElementById("category").value = assignments[code].category;
    }
}

// ✅ ASSIGN
export async function assignSeat() {

    const name = document.getElementById("name").value.trim();
    const category = document.getElementById("category").value;

    if (!selectedSeat || !name) {
        alert("Select seat and enter name");
        return;
    }

    if (assignments[selectedSeat]) {
        alert("Seat already assigned!");
        return;
    }

    await setDoc(doc(db, "seats", selectedSeat), {
        name,
        category
    });

    // Clear input
    document.getElementById("name").value = "";
}

// ❌ REMOVE
export async function removeSeat() {

    if (!selectedSeat) {
        alert("Select seat");
        return;
    }

    if (!assignments[selectedSeat]) {
        alert("Seat is already empty");
        return;
    }

    await deleteDoc(doc(db, "seats", selectedSeat));
}

// 📊 TABLE
function updateTable() {

    const tbody = document.querySelector("#table tbody");
    tbody.innerHTML = "";

    Object.keys(assignments).forEach(seat => {

        const data = assignments[seat];

        const row = `<tr>
            <td>${data.name}</td>
            <td>${data.category}</td>
            <td>${seat}</td>
        </tr>`;

        tbody.innerHTML += row;
    });
}

// 🔴 REAL-TIME SYNC
onSnapshot(collection(db, "seats"), (snapshot) => {

    assignments = {};

    snapshot.forEach((docSnap) => {
        assignments[docSnap.id] = docSnap.data();
    });

    renderSeats();
    updateTable();
});
