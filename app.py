from flask_cors import CORS
from flask import Flask, request, jsonify
import sqlite3

app = Flask(__name__)
CORS(app)

def connect_db():
    return sqlite3.connect("data.db")

@app.route("/")
def home():
    return "Server running 🚀"

@app.route("/add_user", methods=["POST"])
def add_user():
    data = request.json
    con = connect_db()
    cur = con.cursor()
    cur.execute("INSERT INTO users(name,attendance,skill,ready) VALUES(?,?,?,?)",
            (data["name"], 50, "Beginner", "30%"))
    con.commit()
    return jsonify({"msg": "User added"})

@app.route("/users", methods=["GET"])
def get_users():
    con = connect_db()
    cur = con.cursor()
    cur.execute("SELECT * FROM users")
    data = cur.fetchall()
    return jsonify(data)

@app.route("/feedback", methods=["POST"])
def add_feedback():
    data = request.json
    con = connect_db()
    cur = con.cursor()
    cur.execute("INSERT INTO feedback(name,msg) VALUES(?,?)",
                (data["name"], data["msg"]))
    con.commit()
    return jsonify({"msg": "saved"})


# 👇 ALWAYS LAST
app.run(debug=True)