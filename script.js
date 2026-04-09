import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, setDoc, doc, getDocs, collection, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_BUCKET",
  messagingSenderId: "YOUR_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const layout = document.getElementById("layout");
let selectedSeat = null;
let assignments = JSON.parse(localStorage.getItem("seats")) || {};

// Seat configuration (your layout)
const rows = [
    12,12,12,12,12,12,12,12,12,12,
    12,12,12,12,12,
    11,10,9,8
];

// CREATE LAYOUT
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

        // LEFT SIDE (Opposition)
        const seatL = createSeat(`L-${rowIndex+1}-${i}`, rowIndex, i, "left");
        left.appendChild(seatL);

        // RIGHT SIDE (Ruling)
        const seatR = createSeat(`R-${rowIndex+1}-${i}`, rowIndex, i, "right");
        right.appendChild(seatR);
    }

    row.appendChild(left);
    row.appendChild(aisle);
    row.appendChild(right);

    layout.appendChild(row);
});

function removeSeat() {
    if (!selectedSeat) {
        alert("Select a seat to remove");
        return;
    }

    delete assignments[selectedSeat];

    localStorage.setItem("seats", JSON.stringify(assignments));

    location.reload();
}
function createSeat(code, row, col, side) {
    const seat = document.createElement("div");
    seat.className = "seat";
    seat.innerText = code;

    // First row empty
    if (row === rows.length - 1) {
        seat.style.background = "#ddd";
        return seat;
    }

    // Alternate seating rule
    if (col % 2 === 0) {
        seat.style.visibility = "hidden";
    }

    // Restore saved data
    if (assignments[code]) {
        seat.classList.add(assignments[code].category.toLowerCase());
    }

    seat.onclick = () => selectSeat(seat, code);

    return seat;
}

function selectSeat(seat, code) {
    if (seat.style.visibility === "hidden") return;

    document.querySelectorAll(".seat").forEach(s => s.classList.remove("selected"));

    seat.classList.add("selected");
    selectedSeat = code;

    document.getElementById("seatCode").value = code;
}

function assignSeat() {
    const name = document.getElementById("name").value;
    const category = document.getElementById("category").value;

    if (!selectedSeat || !name) {
        alert("Select seat and enter name");
        return;
    }

    assignments[selectedSeat] = { name, category };

    localStorage.setItem("seats", JSON.stringify(assignments));

    location.reload();
}

function saveData() {
    alert("Data Saved!");
}

// TABLE UPDATE
function updateTable() {
    const tbody = document.querySelector("#table tbody");
    tbody.innerHTML = "";

    Object.keys(assignments).forEach(seat => {
        const row = `<tr>
            <td>${assignments[seat].name}</td>
            <td>${assignments[seat].category}</td>
            <td>${seat}</td>
        </tr>`;
        tbody.innerHTML += row;
    });
}

updateTable();
