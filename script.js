// Main JavaScript logic

// --- NAVIGATION & INIT ---
document.addEventListener('DOMContentLoaded', () => {

    // Login Handling
    const loginForm = document.querySelector('form[action="dashboard.html"]');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            console.log("Logging in...");
            // In real app, perform fetch here
        });
    }

    // Page Specific Loads
    const path = window.location.pathname;
    if (path.includes('mental-health.html')) fetchMentalHealthData();
    if (path.includes('predictive-learning.html')) fetchPredictions();

    // Admin Init
    if (path.includes('admin.html')) {
        loadStats();
        loadStudents();
    }
});

// --- ADMIN PANEL CONTROLLER ---

function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));

    // Show Target
    document.getElementById(`tab-${tabName}`).classList.add('active');

    // Highlight Button (simple loop find)
    const btns = document.querySelectorAll('.tab-btn');
    btns.forEach(btn => {
        if (btn.innerText.toLowerCase().includes(tabName) || btn.innerHTML.includes(tabName)) {
            btn.classList.add('active');
        }
    });

    // Load Data on Switch
    if (tabName === 'students') loadStudents();
    if (tabName === 'fees') loadFees();
}

function toggleForm(formId) {
    const form = document.getElementById(formId);
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

// 1. STATS
async function loadStats() {
    try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        document.getElementById('stat-students').innerText = data.total_students;
        document.getElementById('stat-faculty').innerText = data.total_faculty;
        document.getElementById('stat-fees').innerText = '₹' + data.pending_fees.toLocaleString();
        document.getElementById('stat-books').innerText = data.library_books;
    } catch (e) { console.error("Stats Error", e); }
}

// 2. STUDENT MANAGEMENT
async function loadStudents() {
    try {
        const res = await fetch('/api/students');
        const students = await res.json();
        const tbody = document.getElementById('student-list');
        tbody.innerHTML = '';

        students.forEach(s => {
            tbody.innerHTML += `
                <tr>
                    <td>${s.roll_no}</td>
                    <td>${s.full_name}</td>
                    <td>${s.stream}</td>
                    <td>${s.current_class} (${s.section})</td>
                    <td>
                        <button class="btn btn-sm btn-ghost" onclick="editStudent(${s.id})" style="padding:5px 10px; font-size:12px; margin-right: 5px;"><i class="fa-solid fa-pen-to-square"></i></button>
                        <button class="btn btn-sm btn-danger" onclick="deleteStudent(${s.id})" style="padding:5px 10px; font-size:12px;"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>
            `;
        });
    } catch (e) { console.error("Load Students Error", e); }
}

async function handleStudentSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    // Check if we are updating (hidden ID field exists in a real scenario, but we can check if dataset has an id)
    const editingId = e.target.dataset.editingId;

    try {
        let res;
        if (editingId) {
            // Update existing
            res = await fetch(`/api/students/${editingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            delete e.target.dataset.editingId; // clear editing state
            e.target.querySelector('button[type="submit"]').innerText = 'Save Student';
        } else {
            // Create New
            res = await fetch('/api/students', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        }

        if (res.ok) {
            alert(editingId ? 'Student Updated Successfully' : 'Student Added Successfully');
            e.target.reset();
            e.target.style.display = 'none'; // hide form after success
            loadStudents();
            loadStats();
        } else {
            const err = await res.json();
            alert('Error Saving Student: ' + (err.error || "Unknown Error"));
        }
    } catch (err) {
        alert("Failed to connect to server: " + err.message);
    }
}

async function editStudent(id) {
    try {
        const res = await fetch('/api/students');
        const students = await res.json();
        const student = students.find(s => s.id === id);

        if (student) {
            // Open form
            const form = document.getElementById('student-form');
            form.style.display = 'block';

            // Populate data
            for (const key in student) {
                if (form.elements[key]) {
                    form.elements[key].value = student[key];
                }
            }

            // Set editing state
            form.dataset.editingId = id;
            form.querySelector('button[type="submit"]').innerText = 'Update Student';

            // Scroll to form
            form.scrollIntoView({ behavior: 'smooth' });
        }
    } catch (e) {
        console.error("Error fetching student for edit", e);
    }
}

async function deleteStudent(id) {
    if (!confirm("Are you sure you want to delete this student?")) return;
    await fetch(`/api/students/${id}`, { method: 'DELETE' });
    loadStudents();
    loadStats();
}

// 3. FEES MANAGEMENT
async function loadFees() {
    try {
        const res = await fetch('/api/fees');
        const fees = await res.json();
        const tbody = document.getElementById('fee-list');
        tbody.innerHTML = '';

        fees.forEach(f => {
            const statusClass = f.status === 'Paid' ? 'status-paid' : (f.status === 'Overdue' ? 'status-overdue' : 'status-pending');
            tbody.innerHTML += `
                <tr>
                    <td>${f.full_name}<br><small>${f.roll_no}</small></td>
                    <td>${f.type}</td>
                    <td>₹${f.amount.toLocaleString()}</td>
                    <td>${f.due_date}</td>
                    <td><span class="status-badge ${statusClass}">${f.status}</span></td>
                    <td>
                        ${f.status !== 'Paid' ? `<button onclick="sendReminder(${f.student_id})" class="btn btn-sm btn-ghost" style="font-size:11px;">Remind</button>` : ''}
                    </td>
                </tr>
            `;
        });
    } catch (e) { console.error(e); }
}

async function sendReminder(studentId) {
    await fetch('/api/fees/remind', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: studentId })
    });
    alert(`Reminder sent to Student ID ${studentId}`);
}

// 4. CIRCULARS
async function handleCircularSubmit(e) {
    e.preventDefault();
    const title = document.getElementById('circ-title').value;
    const content = document.getElementById('circ-content').value;
    const audience = document.getElementById('circ-audience').value;

    await fetch('/api/circulars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, audience })
    });
    alert('Circular Posted Successfully');
    e.target.reset();
}


// --- EXISTING FEATURES (Mental Health / Prediction) ---

async function fetchMentalHealthData() {
    try {
        const response = await fetch('/api/mental-health');
        if (!response.ok) return;
        const data = await response.json();

        // Populate if elements exist
        const scoreEl = document.querySelector('.score-display'); // Example class
        if (scoreEl) scoreEl.innerText = data.score;

        console.log("Mental Health Data:", data);
    } catch (e) {
        console.log("Backend offline/error");
    }
}

async function fetchPredictions() {
    try {
        const response = await fetch('/api/predictive-learning');
        if (!response.ok) return;
        const data = await response.json();
        console.log("Prediction Data:", data);
    } catch (e) {
        console.log("Backend offline/error");
    }
}

// --- ADVANCED SEARCH ENGINE ---

const searchIndex = [
    // Main Pages
    { title: "Dashboard", url: "dashboard.html", keywords: "home, main, overview, stats, welcome", category: "Main", description: "Overview of your academic performance and alerts." },
    { title: "Smart Campus", url: "smart-campus.html", keywords: "campus, kr mangalam, buildings, library, sports, photo, gallery", category: "Main", description: "Explore the KR Mangalam campus infrastructure." },
    { title: "Academics", url: "academics.html", keywords: "courses, subjects, syllabus, curriculum, classes, timetable", category: "Main", description: "View your courses, subjects, and academic schedule." },
    { title: "People", url: "people.html", keywords: "faculty, teachers, students, classmates, directory", category: "Main", description: "Find and connect with faculty and students." },
    { title: "Learning (LMS)", url: "learning-lms.html", keywords: "assignments, homework, quiz, notes, study material", category: "Main", description: "Access course materials and submit assignments." },

    // Administration
    { title: "Attendance", url: "attendance.html", keywords: "present, absent, leave, history, record", category: "Admin", description: "Check your attendance records and percentage." },
    { title: "Exams & Results", url: "exams-results.html", keywords: "grades, marks, cgpa, sgpa, report card, schedule, datesheet", category: "Admin", description: "View exam schedules and result transcripts." },
    { title: "Fees & Finance", url: "fees-finance.html", keywords: "payment, dues, receipt, invoice, bank, transaction", category: "Admin", description: "Manage fee payments and view financial history." },
    { title: "Communication", url: "communication.html", keywords: "notice, circular, message, email, inbox, chat", category: "Admin", description: "University announcements and messages." },
    { title: "Requests", url: "requests.html", keywords: "leave application, bonafide, grievance, complaint, help", category: "Admin", description: "Submit applications and track requests." },
    { title: "Reports", url: "reports.html", keywords: "analytics, progress, performance, graph, chart", category: "Admin", description: "Detailed academic and behavioral reports." },

    // Core Differentiators
    { title: "Mental Health", url: "mental-health.html", keywords: "wellbeing, stress, counseling, therapy, help, psychology", category: "Core", description: "AI-powered mental health support and resources." },
    { title: "Predictive Learning", url: "predictive-learning.html", keywords: "forecast, future, ai, recommendation, study plan", category: "Core", description: "AI predictions for your academic performance." },

    // Settings & Others
    { title: "Settings", url: "settings.html", keywords: "profile, account, password, theme, dark mode, preferences", category: "System", description: "Manage your account settings and preferences." },
    { title: "Documents", url: "documents.html", keywords: "files, certificates, id card, download", category: "System", description: "Access your official university documents." },
    { title: "Profile", url: "profile.html", keywords: "myself, info, personal, bio", category: "System", description: "View and edit your personal profile." }
];

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('global-search');
    const searchResults = document.getElementById('search-results');

    if (searchInput && searchResults) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();

            if (query.length === 0) {
                searchResults.style.display = 'none';
                return;
            }

            // Search Algorithm (Weighted)
            const results = searchIndex.filter(item => {
                const titleMatch = item.title.toLowerCase().includes(query);
                const keywordMatch = item.keywords.includes(query);
                const descMatch = item.description.toLowerCase().includes(query);
                return titleMatch || keywordMatch || descMatch;
            }).sort((a, b) => {
                // Prioritize Title matches
                const aTitle = a.title.toLowerCase().includes(query);
                const bTitle = b.title.toLowerCase().includes(query);
                if (aTitle && !bTitle) return -1;
                if (!aTitle && bTitle) return 1;
                return 0;
            }).slice(0, 5); // Limit to 5 results

            renderSearchResults(results, searchResults);
        });

        // Hide on click outside
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
                searchResults.style.display = 'none';
            }
        });

        // Show on focus if has value
        searchInput.addEventListener('focus', () => {
            if (searchInput.value.trim().length > 0) {
                searchResults.style.display = 'block';
            }
        });
    }
});

function renderSearchResults(results, container) {
    container.innerHTML = '';

    if (results.length === 0) {
        container.innerHTML = `<div class="search-no-results">No results found</div>`;
        container.style.display = 'block';
        return;
    }

    results.forEach(item => {
        const div = document.createElement('a');
        div.href = item.url;
        div.className = 'search-result-item';
        div.innerHTML = `
            <div class="search-result-content">
                <span class="search-result-title">${item.title}</span>
                <p class="search-result-desc">${item.description}</p>
            </div>
            <span class="search-category-badge">${item.category}</span>
        `;
        container.appendChild(div);
    });

    container.style.display = 'block';
}

let roll = "S1001";

fetch(`http://127.0.0.1:5000/api/student/${roll}`)
  .then(res => res.json())
  .then(data => {
    document.getElementById("studentName").innerText = data.full_name;
  });

    container.style.display = 'block';
}
