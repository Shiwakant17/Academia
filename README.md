# Academia 🎓

A distributed academic planning and course recommendation platform built using a multi-service backend architecture.

## 🚀 Features

- User Authentication
- Course Management
- Semester Planning
- Search Gateway
- Academic Recommendation Support
- REST APIs
- Cloud Deployment Ready

---

## 🏗️ Tech Stack

### Backend
- Java (Spring Boot)
- Node.js
- Python (FastAPI)

### Database
- PostgreSQL
- MongoDB Atlas

### Deployment
- Render

---

## 📁 Project Structure

```
Academia/
│
├── backend/
│   ├── java/
│   │   ├── controller/
│   │   ├── models/
│   │   ├── repository/
│   │   └── service/
│   │
│   ├── nodejs/
│   │   └── server.js
│   │
│   └── python/
│       ├── main.py
│       ├── requirements.txt
│       └── .env
│
├── pom.xml
└── README.md
```

---

## ⚙️ Installation

Clone repository:

```bash
git clone https://github.com/YOUR_USERNAME/Academia.git
cd Academia
```

### Java Service

```bash
mvn clean install
mvn spring-boot:run
```

### Node Gateway

```bash
cd backend/nodejs
npm install
npm start
```

### Python Service

```bash
cd backend/python
pip install -r requirements.txt
python main.py
```

---

## 🔐 Environment Variables

Create `.env`

Example:

```env
PORT=5000

MONGO_URI=your_mongodb_connection

DATABASE_NAME=academic_planning_db

PYTHON_API_URL=http://localhost:8000
```

---

## ☁️ Deployment

Deployed using Render platform.

---

## 👨‍💻 Author

Shiwakant Sundaram
Shiva Yadav
Shivam Agarwal
