const subjectListEl = document.getElementById("subject-list");
const todoListEl = document.getElementById("list-container");
const currentSubjectTitle = document.getElementById("current-subject-title");
const inputBox = document.getElementById("input-box");
const addBtn = document.getElementById("add-btn");
const addSubjectBtn = document.getElementById("add-subject-btn");
const dateBox = document.getElementById("date-box");
const timeBox = document.getElementById("time-box");

let appData = JSON.parse(localStorage.getItem("todoAppData")) || {};
let activeSubject = null;

// Function to save data to localStorage and Firebase safely
function saveData() {
    localStorage.setItem("todoAppData", JSON.stringify(appData));
    if (typeof db !== "undefined" && db) {
        db.ref("appData").set(appData);
    }
}

// Function to render subjects
function renderSubjects() {
    if (!subjectListEl) return;
    subjectListEl.innerHTML = "";
    for (let subject in appData) {
        let li = document.createElement("li");

        let btn = document.createElement("button");
        btn.textContent = subject;
        if (subject === activeSubject) btn.classList.add("active");

        btn.onclick = () => {
            activeSubject = (activeSubject === subject) ? null : subject;
            updateUI();
        };
        
        let deleteBtn = document.createElement("span");
        deleteBtn.innerHTML = " &times;";
        deleteBtn.className = "delete-btn";
        deleteBtn.style.color = "red";
        deleteBtn.style.cursor = "pointer";
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            delete appData[subject];
            if (activeSubject === subject) activeSubject = null;
            updateUI();
        };

        btn.appendChild(deleteBtn);
        li.appendChild(btn);
        subjectListEl.appendChild(li);
    }
}

// Function to render to-dos
function renderTodos() {
    if (!todoListEl) return;
    const searchRow = document.getElementById("search-row");
    todoListEl.innerHTML = "";  
   
    if (!activeSubject) {
        if (currentSubjectTitle) currentSubjectTitle.textContent = "Hi Aeri, welcome back! 👋";
        if (searchRow) searchRow.style.display = "none"; 
        
        let totalSubjects = Object.keys(appData).length;
        let total = 0, completed = 0;
        for (let sub in appData) {
            if (Array.isArray(appData[sub])) {
                total += appData[sub].length;
                completed += appData[sub].filter(t => t.checked).length;
            }
        }
        let pending = total - completed;
        let progress = total === 0 ? 0 : Math.round((completed / total) * 100);
        
        // Render the analytics dashboard directly into the subject page list container
        todoListEl.innerHTML = `
            <div class="dashboard-grid">
                <div class="top-cards">
                    <div class="dash-card pastel-blue">
                        <p>Total Subjects</p>
                        <h2>${totalSubjects}</h2>
                    </div>
                    <div class="dash-card pastel-purple">
                        <p>Total Tasks</p>
                        <h2>${total}</h2>
                    </div>
                    <div class="dash-card pastel-pink">
                        <p>Completed</p>
                        <h2>${completed}</h2>
                    </div>
                    <div class="dash-card pastel-orange">
                        <p>Pending</p>
                        <h2>${pending}</h2>
                    </div>
                </div>
    
                <div class="bottom-charts">
                    <div class="chart-box">
                        <h3>Overall Progress</h3>
                        <div class="progress-track">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                        <p class="progress-text">${progress}% Finished ✨</p>
                    </div>
                </div>
            </div>
        `;
        return;
    }
    
    if (searchRow) searchRow.style.display = "flex"; 
    if (currentSubjectTitle) currentSubjectTitle.textContent = `${activeSubject} To-Dos`;
    
    let todos = appData[activeSubject] || [];
    todos.forEach((todo, index) => {
        let li = document.createElement("li");
        
        let dateTimeStr = "";
        if (todo.date) dateTimeStr += `📅 ${todo.date} `;
        if (todo.time) dateTimeStr += `🕒 ${todo.time}`;
        if (!dateTimeStr) dateTimeStr = "No deadline ✨";

        li.innerHTML = `
            <div class="task-info">
                <span class="task-text">${todo.text}</span>
                <span class="task-time">${dateTimeStr}</span>
            </div>
        `;
        
        if (todo.checked) li.classList.add("checked");

        li.onclick = () => {
            todo.checked = !todo.checked;
            updateUI();
        };

        let span = document.createElement("span");
        span.innerHTML = "&times;";
        span.onclick = (e) => {
            e.stopPropagation();
            appData[activeSubject].splice(index, 1);
            updateUI();
        };
        
        li.appendChild(span);
        todoListEl.appendChild(li);
    });
}

// Function to update the UI
function updateUI() {
    saveData();
    renderSubjects();
    renderTodos();
}

// Event Listeners for Adding Tasks
if (addBtn) {
    addBtn.addEventListener("click", () => {
        if (!inputBox || inputBox.value === "" || !activeSubject) return;
        if (!appData[activeSubject]) appData[activeSubject] = [];
        
        appData[activeSubject].push({
            text: inputBox.value,
            date: dateBox ? dateBox.value : "",
            time: timeBox ? timeBox.value : "",
            checked: false
        });
        
        inputBox.value = "";
        if (dateBox) dateBox.value = "";
        if (timeBox) timeBox.value = "";
        updateUI();
    });
}

const customModal = document.getElementById("custom-modal");
const modalInput = document.getElementById("modal-input");
const modalOk = document.getElementById("modal-ok");
const modalCancel = document.getElementById("modal-cancel");

if (addSubjectBtn && customModal && modalInput && modalCancel && modalOk) {
    addSubjectBtn.addEventListener("click", () => {
        customModal.style.display = "flex";
        modalInput.value = "";
        modalInput.focus();
    });

    modalCancel.addEventListener("click", () => {
        customModal.style.display = "none";
    });

    modalOk.addEventListener("click", () => {
        let newSubject = modalInput.value.trim();
        if (newSubject && !appData[newSubject]) {
            appData[newSubject] = [];
            activeSubject = newSubject;
            updateUI();
        }
        customModal.style.display = "none";
    });
}

const firebaseConfig = {
  apiKey: "AIzaSyCKIhcxa05fj96NbF_6s7K0qfe0dU5ecF4",
  authDomain: "aeri-5671f.firebaseapp.com",
  databaseURL: "https://aeri-5671f-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "aeri-5671f",
  storageBucket: "aeri-5671f.firebasestorage.app",
  messagingSenderId: "115686915735",
  appId: "1:115686915735:web:c16539630d2e40f2a073d2",
  measurementId: "G-2ED356FX56"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const CORRECT_PIN = "1125"; 

window.handlePinSubmit = function(event) {
    event.preventDefault();
    let pinInput = document.getElementById("pin-input");
    let pinOverlay = document.getElementById("pin-overlay");
    
    if (!pinInput || !pinOverlay) return;

    if (pinInput.value === CORRECT_PIN) {
        pinOverlay.style.display = "none";
        loadCloudData();
    } else {
        alert("Incorrect PIN! ✨");
        pinInput.value = "";
    }
};

// Load data from Firebase database safely once on login
appData = JSON.parse(localStorage.getItem("todoAppData")) || {};
updateUI();

// Then sync with Firebase cloud in the background
function loadCloudData() {
    db.ref("appData").once("value").then((snapshot) => {
        let cloudData = snapshot.val();
        if (cloudData && Object.keys(cloudData).length > 0) {
            appData = cloudData;
            updateUI();
        }
    }).catch((error) => {
        console.error("Error loading data: ", error);
    });
}

// Trigger cloud load
loadCloudData();