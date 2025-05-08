# GradeGraph

A smart academic analytics platform that transforms student performance data into clear, interactive visual insights.

[SoW](https://drive.google.com/file/d/1ZOIM5cEYixQsvBEghp3y_9otDu8nla4E/view?usp=drive_link)
[SDD](https://drive.google.com/file/d/1olRytiBq8m3KkpcxNizXvdREFw9lBxvV/view?usp=sharing)
[SRS](https://drive.google.com/file/d/1xs0WO8Q1LiJ7LOSNAkYCxrK5x4G8A0KE/view?usp=drive_link)
[Test Plan](https://docs.google.com/spreadsheets/d/1ET3cEZaan31l9-zvAexy2OWZuRt-5wwq/edit?usp=drive_link&ouid=115756027884021264193&rtpof=true&sd=true)

---

## Key Features

### Students

* View course-wise and semester-wise scores
* Compare individual performance with batch averages
* Clean, responsive dashboard

### Educators

* Visualize class performance trends
* Analyze grade distributions
* Identify at-risk students

### Administrators

* Manage users and roles
* Monitor system usage and health
* Audit logs and system configuration

See the project in action: **[View Demo](https://drive.google.com/file/d/15EUPNXXzswFAHE00wobrWdmdHbXDv8Im/view?usp=drive_link)**

---

## Getting Started

### Prerequisites

* Node.js (v14+), MongoDB (v4.4+), Git

### Setup Instructions

```bash
# Clone the repository
git clone https://github.com/yourusername/gradegraph.git
cd gradegraph

# Install backend
dcd backend
npm install

# Install frontend
cd ../frontend
npm install

# Start MongoDB service, then run:
cd ../backend
npm run dev

# In a new terminal:
cd frontend
npm start
```

### Environment Variables

Create `.env` files:

**Frontend (.env)**

```
REACT_APP_API_URL=http://localhost:5000
```

**Backend (.env)**

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/gradegraph
JWT_SECRET=your_secret_key
```

### Running the Application

1. Ensure MongoDB is installed and running locally.
2. Clone the repository and install dependencies for both frontend and backend.
3. Configure environment variables in `.env` files as shown above.
4. Start the backend server using `npm run dev` inside the `backend` directory.
5. Start the frontend using `npm start` inside the `frontend` directory.
6. Open your browser and navigate to `http://localhost:3000` to use the application.

---

## Project Structure and Code Configuration

The GradeGraph project follows a modular, fullstack architecture with clear separation of concerns:

```
gradegraph/
├── frontend/                # React application (View layer)
│   ├── src/
│   │   ├── components/      # UI components grouped by role (student, educator, admin)
│   │   ├── contexts/        # React Context API for global state (e.g., AuthContext)
│   │   ├── utils/           # Helper functions and API utilities
│   │   └── App.js           # Application entry point with routing
│   └── package.json         # Frontend dependencies and scripts
│
├── backend/                 # Node.js + Express backend (Controller + Service layer)
│   ├── src/
│   │   ├── controllers/     # Route handlers (Controllers in MVC)
│   │   ├── models/          # Mongoose schemas (Data layer)
│   │   ├── routes/          # API route definitions
│   │   └── utils/           # Middleware and shared logic
│   └── package.json         # Backend dependencies and scripts
```

This structure promotes scalability and maintainability by keeping logic separated and organized.

---

## Security Highlights

* JWT-based authentication
* Role-based access control

---

## Tech Stack

* Frontend: React, Material-UI, Recharts
* Backend: Node.js, Express.js, MongoDB

---

## Demo

Check out a working demo of GradeGraph:

**View Demo Video**: [Website Features](https://drive.google.com/file/d/15EUPNXXzswFAHE00wobrWdmdHbXDv8Im/view?usp=drive_link)

---

## Team

* Penumetsa Abhiram Varma – Fullstack Developer
* Yeruva Suprith Reddy – Frontend Developer
* Arnav Reddy Padamati – Backend Developer
* Jaya Siddu Karthikeya – UI/UX Designer
* Amarnath Reddy N – Tester and Documentation

---

## Future Enhancements

* Export reports to PDF
