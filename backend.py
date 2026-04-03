import sqlite3
from flask import Flask, jsonify, request, send_from_directory
import os
import random
from datetime import datetime

# Initialize Flask App
app = Flask(__name__, static_folder='.')

DATABASE = 'data.db'

def get_db_connection():
    con = sqlite3.connect(DATABASE)
    con.row_factory = sqlite3.Row
    return con

def init_db():
    con = sqlite3.connect(DATABASE)
    cur = con.cursor()
    
    # --- 1. USERS & PROFILES ---
    # Keeping 'profile' for the main logged-in user simulation
    cur.execute("""
    CREATE TABLE IF NOT EXISTS profile(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT,
        student_id TEXT,
        email TEXT,
        phone TEXT,
        address TEXT,
        dob TEXT,
        blood_group TEXT,
        avatar_url TEXT
    )
    """)

    # --- 2. STUDENTS (Feature 1, 2) ---
    cur.execute("""
    CREATE TABLE IF NOT EXISTS students(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        roll_no TEXT UNIQUE NOT NULL,
        email TEXT,
        phone TEXT,
        stream TEXT, -- CSE, ME, etc.
        current_class TEXT, -- e.g. "2nd Year"
        section TEXT, -- A, B, C
        dob TEXT,
        blood_group TEXT,
        address TEXT,
        guardian_name TEXT,
        guardian_phone TEXT,
        admission_date TEXT,
        gender TEXT
    )
    """)

    # --- 3. FACULTY (Feature 6) ---
    cur.execute("""
    CREATE TABLE IF NOT EXISTS faculty(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        employee_id TEXT UNIQUE NOT NULL,
        subject_expertise TEXT,
        email TEXT,
        phone TEXT,
        designation TEXT
    )
    """)

    # --- 4. ACADEMICS: COURSES & SUBJECTS (Feature 5) ---
    cur.execute("""
    CREATE TABLE IF NOT EXISTS courses(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        code TEXT UNIQUE NOT NULL,
        stream TEXT,
        semester INTEGER,
        credits INTEGER
    )
    """)

    # --- 5. FEES & FINANCE (Feature 3) ---
    cur.execute("""
    CREATE TABLE IF NOT EXISTS fees(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER,
        type TEXT, -- Tuitions, Hotsel, Transport
        amount REAL,
        status TEXT, -- Paid, Pending, Overdue
        due_date TEXT,
        paid_date TEXT,
        FOREIGN KEY(student_id) REFERENCES students(id)
    )
    """)

    # --- 6. ATTENDANCE (Feature 4) ---
    cur.execute("""
    CREATE TABLE IF NOT EXISTS attendance(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER,
        date TEXT,
        status TEXT, -- Present, Absent, Late
        subject_id INTEGER,
        FOREIGN KEY(student_id) REFERENCES students(id)
    )
    """)

    # --- 7. EXAMS & RESULTS (Feature 7, 8) ---
    cur.execute("""
    CREATE TABLE IF NOT EXISTS exams(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        start_date TEXT,
        end_date TEXT,
        type TEXT -- Midterm, Final
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS results(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER,
        exam_id INTEGER,
        subject_id INTEGER,
        marks_obtained REAL,
        max_marks REAL,
        grade TEXT,
        FOREIGN KEY(student_id) REFERENCES students(id)
    )
    """)

    # --- 8. LIBRARY (Feature 9) ---
    cur.execute("""
    CREATE TABLE IF NOT EXISTS library_books(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        author TEXT,
        isbn TEXT,
        status TEXT -- Available, Issued
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS library_transactions(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER,
        book_id INTEGER,
        issue_date TEXT,
        return_date TEXT,
        status TEXT, -- Issued, Returned
        FOREIGN KEY(student_id) REFERENCES students(id)
    )
    """)

    # --- 9. TRANSPORT (Feature 10) ---
    cur.execute("""
    CREATE TABLE IF NOT EXISTS transport(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        route_name TEXT,
        vehicle_no TEXT,
        driver_name TEXT,
        driver_contact TEXT
    )
    """)
    
    cur.execute("""
    CREATE TABLE IF NOT EXISTS student_transport(
        student_id INTEGER UNIQUE,
        transport_id INTEGER,
        pickup_point TEXT,
        FOREIGN KEY(student_id) REFERENCES students(id)
    )
    """)

    # --- 10. HOSTEL (Feature 11) ---
    cur.execute("""
    CREATE TABLE IF NOT EXISTS hostels(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        block_name TEXT,
        room_no TEXT,
        capacity INTEGER,
        occupied INTEGER
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS student_hostel(
        student_id INTEGER UNIQUE,
        hostel_id INTEGER,
        bed_no TEXT,
        FOREIGN KEY(student_id) REFERENCES students(id)
    )
    """)

    # --- 11. COMMUNICATION (Feature 13, 14, 12) ---
    cur.execute("""
    CREATE TABLE IF NOT EXISTS circulars(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        content TEXT,
        date_posted TEXT,
        audience TEXT -- All, Students, Faculty
    )
    """)
    
    cur.execute("""
    CREATE TABLE IF NOT EXISTS grievances(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER,
        category TEXT,
        description TEXT,
        status TEXT, -- Open, Resolved
        date_filed TEXT
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS disciplinary_records(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER,
        incident_date TEXT,
        description TEXT,
        action_taken TEXT,
        severity TEXT
    )
    """)

    # --- SEED INITIAL DATA IF EMPTY ---
    cur.execute("SELECT count(*) FROM students")
    if cur.fetchone()[0] == 0:
        # Seed Profile
        cur.execute("DELETE FROM profile")
        cur.execute("""
            INSERT INTO profile(full_name, student_id, email, phone, address, dob, blood_group, avatar_url) 
            VALUES ('Demo Student', 'CS2024001', 'subh@university.edu', '+91 98765 43210', '123 Campus Rd', '2004-01-01', 'O+', '')
        """)

        # Seed Students
        users = [
            ('Aarav Sharma', 'CS2024001', 'aarav@uni.edu', 'CSE', '1st Year', 'A', 'Male'),
            ('Vivaan Gupta', 'CS2024002', 'vivaan@uni.edu', 'CSE', '1st Year', 'A', 'Male'),
            ('Diya Patel', 'CS2024003', 'diya@uni.edu', 'CSE', '1st Year', 'B', 'Female'),
            ('Ishaan Kumar', 'ME2024001', 'ishaan@uni.edu', 'ME', '1st Year', 'A', 'Male')
        ]
        for u in users:
            cur.execute("""
                INSERT INTO students(full_name, roll_no, email, stream, current_class, section, gender, admission_date)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (u + (datetime.now().strftime("%Y-%m-%d"),)))

        # Seed Circulars
        cur.execute("INSERT INTO circulars(title, content, date_posted, audience) VALUES (?, ?, ?, ?)", 
                   ("Holiday Announcement", "University will remain closed tomorrow.", datetime.now().strftime("%Y-%m-%d"), "All"))
        
        # Seed Fees
        cur.execute("INSERT INTO fees(student_id, type, amount, status, due_date) VALUES (1, 'Tuition', 50000, 'Pending', '2025-04-01')")
        cur.execute("INSERT INTO fees(student_id, type, amount, status, due_date) VALUES (2, 'Tuition', 50000, 'Paid', '2025-01-01')")

    con.commit()
    con.close()

# Routes to serve HTML pages
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    if os.path.exists(filename):
        return send_from_directory('.', filename)
    return "File not found", 404

# --- API ENDPOINTS ---

# 1. PROFILE API
@app.route('/api/profile', methods=['GET', 'POST'])
def handle_profile():
    con = get_db_connection()
    cur = con.cursor()
    if request.method == 'GET':
        cur.execute("SELECT * FROM profile WHERE id=1")
        row = cur.fetchone()
        con.close()
        return jsonify(dict(row)) if row else (jsonify({}), 404)
    else: # POST
        data = request.json
        fields = []
        values = []
        for k, v in data.items():
            if k in ['full_name', 'email', 'phone', 'address', 'dob', 'blood_group', 'avatar_url']:
                fields.append(f"{k}=?")
                values.append(v)
        if fields:
            query = f"UPDATE profile SET {', '.join(fields)} WHERE id=1"
            cur.execute(query, tuple(values))
            con.commit()
        con.close()
        return jsonify({"message": "Profile updated"})

# 2. STUDENTS API (CRUD)
@app.route('/api/students', methods=['GET', 'POST'])
def manage_students():
    con = get_db_connection()
    if request.method == 'GET':
        query = "SELECT * FROM students"
        students = con.execute(query).fetchall()
        con.close()
        return jsonify([dict(row) for row in students])
    
    elif request.method == 'POST':
        data = request.json
        try:
            con.execute("""
                INSERT INTO students(full_name, roll_no, email, phone, stream, current_class, section, dob, blood_group, gender, admission_date)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (data.get('full_name'), data.get('roll_no'), data.get('email'), data.get('phone'), 
                  data.get('stream'), data.get('current_class'), data.get('section'), data.get('dob'), 
                  data.get('blood_group'), data.get('gender'), datetime.now().strftime("%Y-%m-%d")))
            con.commit()
            con.close()
            return jsonify({"message": "Student created successfully"}), 201
        except Exception as e:
            con.close()
            return jsonify({"error": str(e)}), 400

@app.route('/api/students/<int:id>', methods=['DELETE', 'PUT'])
def student_operations(id):
    con = get_db_connection()
    if request.method == 'DELETE':
        con.execute("DELETE FROM students WHERE id=?", (id,))
        con.commit()
        con.close()
        return jsonify({"message": "Student deleted"})
    elif request.method == 'PUT': # Update/Promote
        data = request.json
        fields = []
        values = []
        for k, v in data.items():
            if k in ['full_name', 'current_class', 'section', 'stream', 'email', 'phone']:
                fields.append(f"{k}=?")
                values.append(v)
        if fields:
            query = f"UPDATE students SET {', '.join(fields)} WHERE id=?"
            values.append(id)
            con.execute(query, tuple(values))
            con.commit()
        con.close()
        return jsonify({"message": "Student updated"})

# 3. FEES API
@app.route('/api/fees', methods=['GET'])
def get_fees():
    con = get_db_connection()
    # Join with student table to get names
    fees = con.execute("""
        SELECT fees.*, students.full_name, students.roll_no 
        FROM fees 
        JOIN students ON fees.student_id = students.id
    """).fetchall()
    con.close()
    return jsonify([dict(row) for row in fees])

@app.route('/api/fees/remind', methods=['POST'])
def send_fee_reminder():
    data = request.json
    # In a real app, this would send an email/SMS
    return jsonify({"message": f"Reminder sent to Student ID {data['student_id']}"})

# 4. CIRCULARS API
@app.route('/api/circulars', methods=['GET', 'POST'])
def manage_circulars():
    con = get_db_connection()
    if request.method == 'GET':
        circulars = con.execute("SELECT * FROM circulars ORDER BY date_posted DESC").fetchall()
        con.close()
        return jsonify([dict(row) for row in circulars])
    elif request.method == 'POST':
        data = request.json
        con.execute("INSERT INTO circulars(title, content, audience, date_posted) VALUES (?, ?, ?, ?)",
                   (data['title'], data['content'], data['audience'], datetime.now().strftime("%Y-%m-%d")))
        con.commit()
        con.close()
        return jsonify({"message": "Circular posted"})

# 5. STATS API
@app.route('/api/stats')
def get_stats():
    con = get_db_connection()
    con.execute("CREATE TABLE IF NOT EXISTS students(id INTEGER PRIMARY KEY)") # Safety check if init skipped
    
    # We need to wrap these in try-except in case tables don't exist yet (though init_db should handle it)
    try:
        total_students = con.execute("SELECT count(*) FROM students").fetchone()[0]
        total_faculty = con.execute("SELECT count(*) FROM faculty").fetchone()[0]
        lib_books = con.execute("SELECT count(*) FROM library_books").fetchone()[0]
        pending_fees = con.execute("SELECT ifnull(sum(amount), 0) FROM fees WHERE status='Pending'").fetchone()[0]
    except:
        total_students = 0
        total_faculty = 0
        lib_books = 0
        pending_fees = 0
    
    con.close()
    return jsonify({
        "total_students": total_students,
        "total_faculty": total_faculty,
        "library_books": lib_books,
        "pending_fees": pending_fees
    })

# 6. MENTAL HEALTH & PREDICTION APIs (Updated to use DB potentially, or keep mock logic for now)
@app.route('/api/mental-health')
def get_mental_health():
    # In future, calculate from attendance/results tables
    
    # Adding slight randomization for a dynamic feel
    base_score = 75
    random_variation = random.randint(-5, 5)
    final_score = base_score + random_variation
    
    if final_score >= 80:
        status = "Excellent"
    elif final_score >= 70:
        status = "Stable"
    elif final_score >= 60:
        status = "Needs Attention"
    else:
        status = "Critical"
        
    return jsonify({
        "score": final_score,
        "status": status,
        "breakdown": {
            "attendance_impact": random.randint(15, 25), 
            "academic_pressure": random.randint(55, 75), 
            "performance_anxiety": random.randint(35, 55)
        },
        "recommendations": [
            {"title": "Reduce Workload", "type": "warning"}, 
            {"title": "Focus on Weak Subjects", "type": "primary"},
            {"title": "Take a Walk", "type": "success"}
        ]
    })
    
@app.route('/api/predictive-learning')
def get_predictions():
    # Logic: Predict future CGPA
    # Dynamic Mock Data
    current_cgpa = round(random.uniform(6.5, 8.5), 1)
    predicted_cgpa = min(10.0, round(current_cgpa + random.uniform(-0.2, 0.8), 1))
    
    subjects = ["Data Structures", "Operating Systems", "English", "Mathematics II", "Computer Networks"]
    selected_subjects = random.sample(subjects, 3)
    
    priorities = [
        {"subject": selected_subjects[0], "priority": "High", "reason": "Exam in 3 days"},
        {"subject": selected_subjects[1], "priority": "Medium", "reason": "Declining Trend"},
        {"subject": selected_subjects[2], "priority": "Low", "reason": "On Track"}
    ]
    
    return jsonify({
        "current_cgpa": current_cgpa,
        "predicted_cgpa": predicted_cgpa,
        "priorities": priorities
    })

if __name__ == '__main__':
    print("Initializing Enhanced Database...")
    init_db()
    print("Starting ProjexaAI Premium Backend on http://localhost:5000")
    app.run(debug=True, port=5000)
