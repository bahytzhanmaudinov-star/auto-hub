from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import psycopg2, os, time

app = Flask(__name__)
CORS(app)

def get_connection():
    last = None
    for _ in range(15):
        try:
            return psycopg2.connect(host=os.getenv("DB_HOST","localhost"), database=os.getenv("DB_NAME","carsdb"), user=os.getenv("DB_USER","postgres"), password=os.getenv("DB_PASSWORD","postgres"))
        except psycopg2.OperationalError as e:
            last=e; time.sleep(1)
    raise last

@app.get("/api/cars")
def get_cars():
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT id,brand,model,year,engine,transmission,mileage,price FROM cars ORDER BY id")
            return jsonify([dict(zip(["id","brand","model","year","engine","transmission","mileage","price"], row)) for row in cur.fetchall()])

@app.post("/api/register")
def register():
    data=request.get_json(silent=True) or {}; username=(data.get("username") or "").strip(); password=data.get("password") or ""
    if not username or not password: return jsonify(error="Введите логин и пароль"),400
    try:
        with get_connection() as conn:
            with conn.cursor() as cur: cur.execute("INSERT INTO users(username,password) VALUES(%s,%s)",(username,generate_password_hash(password)))
        return jsonify(message="Регистрация успешна!"),201
    except psycopg2.IntegrityError:
        return jsonify(error="Такой пользователь уже существует"),409

@app.post("/api/login")
def login():
    data=request.get_json(silent=True) or {}; username=(data.get("username") or "").strip(); password=data.get("password") or ""
    if not username or not password: return jsonify(error="Введите логин и пароль"),400
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT username,password FROM users WHERE username=%s",(username,)); user=cur.fetchone()
    if not user or not check_password_hash(user[1],password): return jsonify(error="Неверный логин или пароль"),401
    return jsonify(message="Вход выполнен успешно",username=user[0])

@app.get("/")
def home(): return jsonify(message="Car Catalog API работает")
if __name__ == "__main__": app.run(host="0.0.0.0",port=5000)
