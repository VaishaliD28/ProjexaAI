import sqlite3

con = sqlite3.connect("data.db")
cur = con.cursor()

# 👉 Jinke fields empty hain unhe update karo
cur.execute("UPDATE users SET attendance = 50 WHERE attendance IS NULL")
cur.execute("UPDATE users SET skill = 'Beginner' WHERE skill IS NULL")
cur.execute("UPDATE users SET ready = '30%' WHERE ready IS NULL")

con.commit()
con.close()

print("Old users fixed ✅")