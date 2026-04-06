// admin.js
import { $, $$, showToast, formatDate } from './utils.js';
import { API } from './api.js';

// STATE
let studentsData = [];

// INIT
document.addEventListener('DOMContentLoaded', async () => {
    await initDashboard();
    setupEventListeners();
});

async function initDashboard() {
    await loadStats();
    await loadStudents();
}

// EVENT LISTENERS
function setupEventListeners() {
    // Refresh Button
    $('#refreshBtn').addEventListener('click', async () => {
        const btn = $('#refreshBtn i');
        btn.style.animation = 'spin 0.5s linear';
        await initDashboard();
        setTimeout(() => btn.style.animation = '', 500);
    });

    // Add Student Form Submit
    $('#studentForm').addEventListener('submit', handleAddStudent);
}

// LOADERS
async function loadStats() {
    try {
        const stats = await API.getStats();
        // Animate Numbers
        animateValue($('#stat-students'), 0, stats.total_students, 1000);
        animateValue($('#stat-faculty'), 0, stats.total_faculty, 1000);
        $('#stat-fees').innerText = '₹' + (stats.pending_fees || 0).toLocaleString();
        $('#stat-lib').innerText = stats.library_books || 0;
    } catch (e) { console.error(e); }
}

async function loadStudents() {
    const tbody = $('#studentTableBody');
    tbody.innerHTML = '<tr><td colspan="5" class="text-center"><div class="skeleton" style="height:40px"></div></td></tr>';

    try {
        studentsData = await API.getStudents();
        renderTable(studentsData);
    } catch (e) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px; color:var(--danger)">Failed to load data</td></tr>';
    }
}

// RENDERERS
function renderTable(data) {
    const tbody = $('#studentTableBody');
    tbody.innerHTML = '';

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px; color:var(--text-muted)">No students found. Add one above.</td></tr>';
        return;
    }

    data.forEach((s, index) => {
        const tr = document.createElement('tr');
        tr.className = 'animate-fadeIn';
        tr.style.animationDelay = `${index * 50}ms`;

        tr.innerHTML = `
            <td><span style="font-family:monospace; color:var(--primary)">${s.roll_no}</span></td>
            <td>
                <div style="font-weight:600">${s.full_name}</div>
                <div style="font-size:12px; color:var(--text-muted)">${s.email || '-'}</div>
            </td>
            <td>${s.stream}</td>
            <td><span class="badge">${s.current_class} - ${s.section}</span></td>
            <td>
                <button class="btn-icon delete-btn" data-id="${s.id}" style="background:rgba(239, 68, 68, 0.1); color:var(--danger); border:none; padding:8px; border-radius:6px; cursor:pointer;">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Attach Delete Listeners
    $$('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => handleDeleteStudent(btn.dataset.id));
    });
}

// HANDLERS
async function handleAddStudent(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;

    // Loading State
    btn.innerHTML = '<div class="spinner"></div> Saving...';
    btn.disabled = true;

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
        await API.addStudent(data);
        showToast('Student Added Successfully!', 'success');
        e.target.reset();
        await loadStudents(); // Reload list
        await loadStats();    // Reload stats
    } catch (err) {
        // Handled by API wrapper, but reset button
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

async function handleDeleteStudent(id) {
    if (!confirm('Are you sure you want to delete this student record?')) return;

    try {
        await API.deleteStudent(id);
        showToast('Student deleted', 'info');
        await loadStudents();
        await loadStats();
    } catch (e) { }
}

// HELPER
function animateValue(obj, start, end, duration) {
    if (!obj) return;
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}
