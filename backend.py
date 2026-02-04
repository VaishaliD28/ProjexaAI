import sqlite3

con = sqlite3.connect("data.db")
cur = con.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS users(
id INTEGER PRIMARY KEY AUTOINCREMENT,
name TEXT
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS feedback(
id INTEGER PRIMARY KEY AUTOINCREMENT,
name TEXT,
msg TEXT
)
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS attendance(
id INTEGER PRIMARY KEY AUTOINCREMENT,
name TEXT,
percent TEXT
)
""")

while True:
    print("\n1. Add User")
    print("2. Add Feedback")
    print("3. Add Attendance")
    print("4. Exit")

    choice=input("Choose: ")

    if choice=="1":
        n=input("Enter student name: ")
        cur.execute("INSERT INTO users(name) VALUES(?)",(n,))
        con.commit()
        print("User saved")

    elif choice=="2":
        n=input("Student name: ")
        m=input("Feedback: ")
        cur.execute("INSERT INTO feedback(name,msg) VALUES(?,?)",(n,m))
        con.commit()
        print("Feedback saved")

    elif choice=="3":
        n=input("Student name: ")
        p=input("Attendance %: ")
        cur.execute("INSERT INTO attendance(name,percent) VALUES(?,?)",(n,p))
        con.commit()
        print("Attendance saved")

    elif choice=="4":
        break

con.close()
