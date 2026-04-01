import sqlite3

con = sqlite3.connect("data.db")
cur = con.cursor()

# 👉 Add new columns (agar already hai to error ignore hoga)
try:
    cur.execute("ALTER TABLE users ADD COLUMN attendance INTEGER DEFAULT 50")
except:
    pass

try:
    cur.execute("ALTER TABLE users ADD COLUMN skill TEXT DEFAULT 'Beginner'")
except:
    pass

try:
    cur.execute("ALTER TABLE users ADD COLUMN ready TEXT DEFAULT '30%'")
except:
    pass

con.commit()
con.close()

print("Database updated permanently ✅")