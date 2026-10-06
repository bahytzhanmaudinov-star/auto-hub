from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import psycopg2, os, time

app = Flask(__name__)
CORS(app)
def init_db():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        CREATE TABLE IF NOT EXISTS cars (
            id SERIAL PRIMARY KEY,
            brand VARCHAR(50) NOT NULL,
            model VARCHAR(80) NOT NULL,
            year INTEGER NOT NULL,
            engine VARCHAR(30),
            transmission VARCHAR(30),
            mileage INTEGER DEFAULT 0,
            price BIGINT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        INSERT INTO cars (id, brand, model, year, engine, transmission, mileage, price) VALUES
        (1,'Toyota','Yaris',2010,'1.5 л','Автомат',150000,3500000),
        (2,'Hyundai','Accent',2021,'1.6 л','Автомат',62000,7800000),
        (3,'Hyundai','Sonata N Line',2024,'2.5 л','Робот',8000,18900000),
        (4,'Subaru','Forester',2022,'2.5 л','Вариатор',41000,15400000),
        (5,'Kia','Sorento',2023,'2.5 л','Автомат',26000,20900000),
        (6,'Volkswagen','Golf',2020,'1.4 л','Автомат',57000,11200000),
        (7,'Toyota','RAV4',2018,'2.0 л','Вариатор',98000,13900000),
        (8,'Kia','Rio',2020,'1.6 л','Автомат',72000,7200000),
        (9,'Hyundai','Elantra',2022,'1.6 л','Автомат',38000,10300000),
        (10,'Chevrolet','Tracker',2023,'1.2 л Turbo','Автомат',22000,10800000),
        (11,'Kia','Seltos',2022,'2.0 л','Вариатор',45000,12800000),
        (12,'Toyota','Camry',2021,'2.5 л','Автомат',64000,16800000)
        ON CONFLICT (id) DO NOTHING;
    """)

    conn.commit()
    cur.close()
    conn.close()

def get_connection():
    database_url = os.getenv("DATABASE_URL")
    return psycopg2.connect(database_url)
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
if __name__ == "__main__":
    init_db()
    app.run(host="0.0.0.0", port=5000)
